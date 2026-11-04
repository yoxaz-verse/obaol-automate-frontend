"use client";

import React, { useMemo } from "react";
import { Chip } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";
import TemplateCanvasRenderer from "./TemplateCanvasRenderer";

const DOC_LABELS: Record<string, string> = {
  LOI: "Letter of Intent",
  QUOTATION: "Quotation",
  PROFORMA_INVOICE: "Proforma Invoice",
  INVOICE: "Invoice",
  PURCHASE_ORDER: "Purchase Order",
  SALES_CONTRACT: "Sales Contract",
  PACKING_LIST: "Packing List",
  QUALITY_CERTIFICATE: "Quality Certificate",
  INSPECTION_CERTIFICATE: "Inspection Certificate",
  PHYTOSANITARY_CERTIFICATE: "Phytosanitary Certificate",
  FUMIGATION_CERTIFICATE: "Fumigation Certificate",
  BILL_OF_LADING: "Bill of Lading",
  AIR_WAYBILL: "Air Waybill",
  LORRY_RECEIPT: "Lorry Receipt",
  LCL_DRAFT: "LCL Draft",
  INSURANCE_CERTIFICATE: "Insurance Certificate",
  PAYMENT_ADVICE: "Payment Advice",
};

const fallbackSchema = {
  version: 2,
  page: { width: 794, height: 1123 },
  blocks: [
    { id: "header", type: "HEADER", label: "Header", x: 24, y: 24, width: 746, height: 110, visible: true },
    { id: "parties", type: "PARTIES", label: "Parties", x: 24, y: 150, width: 746, height: 150, visible: true },
    { id: "line_items", type: "LINE_ITEMS", label: "Line Items", x: 24, y: 316, width: 746, height: 300, visible: true },
    { id: "totals", type: "TOTALS", label: "Totals", x: 430, y: 632, width: 340, height: 130, visible: true },
    { id: "terms", type: "TERMS", label: "Terms", x: 24, y: 632, width: 390, height: 190, visible: true },
  ],
  elements: [],
};

export default function DocumentTemplatePreview({
  docType,
  actionType,
  enquiry,
  order,
  doc,
  templateId,
  canonical = false,
}: {
  docType: string;
  actionType?: string;
  enquiry?: any;
  order?: any;
  doc?: any;
  templateId?: string;
  canonical?: boolean;
}) {
  const typeKey = String(docType || "").toUpperCase();
  const docLabel = DOC_LABELS[typeKey] || "Trade Document";

  const templateQuery = useQuery({
    queryKey: ["document-template", typeKey],
    queryFn: () => getData(apiRoutes.documentTemplates.list, { documentType: typeKey }),
    enabled: Boolean(typeKey),
  });

  const selectedTemplate = useMemo(() => {
    const groups = Array.isArray(templateQuery.data?.data?.data) ? templateQuery.data.data.data : [];
    const group = groups.find((g: any) => String(g?.documentType || g?.docType || "") === typeKey);
    const rows = (group?.all || []).filter((row: any) => row.stage === "LIVE" && row.isActive !== false);
    return rows.find((row: any) => String(row._id) === String(templateId || "")) || rows.find((row: any) => row.isDefault) || group?.live || group?.preview || group?.draft || null;
  }, [templateQuery.data, typeKey, templateId]);
  const layoutSchema = selectedTemplate?.layoutSchema || fallbackSchema;

  const sourceEnquiry = enquiry || order?.enquiry || null;
  const productVariant =
    sourceEnquiry?.variantRateId?.productVariant ||
    sourceEnquiry?.productVariant ||
    null;
  const buyerAssociate = sourceEnquiry?.buyerAssociateId || null;
  const sellerAssociate = sourceEnquiry?.sellerAssociateId || null;
  const buyerCompany =
    buyerAssociate?.associateCompany ||
    buyerAssociate?.associateCompanyId ||
    buyerAssociate?.company ||
    null;
  const sellerCompany =
    sellerAssociate?.associateCompany ||
    sellerAssociate?.associateCompanyId ||
    sellerAssociate?.company ||
    null;
  const getAddress = (party: any) =>
    party?.address ||
    party?.billingAddress ||
    party?.registeredAddress ||
    party?.officeAddress ||
    "—";
  const getGstin = (party: any) => party?.gstin || party?.gstNumber || party?.taxId || "—";
  const buyerParty = {
    name: doc?.buyer?.name || buyerCompany?.name || sourceEnquiry?.buyerAssociateCompanyName || sourceEnquiry?.buyerName || buyerAssociate?.name || "—",
    contactName: doc?.buyer?.contactName || buyerAssociate?.name || "",
    email: doc?.buyer?.email || buyerCompany?.email || buyerAssociate?.email || sourceEnquiry?.buyerEmail || "—",
    phone: doc?.buyer?.phone || buyerCompany?.phone || buyerAssociate?.phone || sourceEnquiry?.buyerPhone || "—",
    address: doc?.buyer?.address || getAddress(buyerCompany),
    gstin: doc?.buyer?.gstin || getGstin(buyerCompany),
    logo: doc?.buyer?.logo || buyerCompany?.logo || "",
  };
  const sellerParty = {
    name: doc?.seller?.name || sellerCompany?.name || sourceEnquiry?.sellerAssociateCompanyName || sourceEnquiry?.sellerName || sellerAssociate?.name || "—",
    contactName: doc?.seller?.contactName || sellerAssociate?.name || "",
    email: doc?.seller?.email || sellerCompany?.email || sellerAssociate?.email || sourceEnquiry?.sellerEmail || "—",
    phone: doc?.seller?.phone || sellerCompany?.phone || sellerAssociate?.phone || sourceEnquiry?.sellerPhone || "—",
    address: doc?.seller?.address || getAddress(sellerCompany),
    gstin: doc?.seller?.gstin || getGstin(sellerCompany),
    logo: doc?.seller?.logo || sellerCompany?.logo || "",
  };
  const obaolParty = {
    name: "OBAOL",
    contactName: "OBAOL Desk",
    email: "info@support.obaol.com",
    phone: "",
    address: "",
    gstin: "",
    logo: "",
  };
  const lineItems = Array.isArray(doc?.lineItems)
    ? doc.lineItems
    : [
        {
          productName: productVariant?.product?.name || sourceEnquiry?.productName || "—",
          productVariantName: productVariant?.name || sourceEnquiry?.variantName || "—",
          quantityMT: Number(sourceEnquiry?.quantity || 0),
          ratePerKg: Number(sourceEnquiry?.rate || 0),
          amount: Number(sourceEnquiry?.rate || 0) * Number(sourceEnquiry?.quantity || 0) * 1000,
        },
      ];

  const computedTotals = doc?.totals || {
    subtotal: Number(lineItems?.[0]?.amount || 0),
    commissionTotal: 0,
    taxAmount: 0,
    grandTotal: Number(lineItems?.[0]?.amount || 0),
  };
  const directionLabels: Record<string, string> = {
    BUYER_TO_OBAOL: "Buyer → OBAOL",
    OBAOL_TO_SELLER: "OBAOL → Seller",
    SELLER_TO_OBAOL: "Seller → OBAOL",
    OBAOL_TO_BUYER: "OBAOL → Buyer",
  };
  const direction = String(doc?.direction || "").toUpperCase();
  const directionParties: Record<string, { issuer: any; recipient: any }> = {
    BUYER_TO_OBAOL: { issuer: buyerParty, recipient: obaolParty },
    OBAOL_TO_SELLER: { issuer: obaolParty, recipient: sellerParty },
    SELLER_TO_OBAOL: { issuer: sellerParty, recipient: obaolParty },
    OBAOL_TO_BUYER: { issuer: obaolParty, recipient: buyerParty },
  };
  const issuer = doc?.issuer || directionParties[direction]?.issuer || sellerParty;
  const recipient = doc?.recipient || directionParties[direction]?.recipient || buyerParty;

  const normalizedData = {
    documentNumber: doc?.documentNumber || "DRAFT",
    directionLabel: directionLabels[direction] || "",
    issuer,
    recipient,
    docDate: doc?.createdAt ? new Date(doc.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
    buyer: buyerParty,
    seller: sellerParty,
    lineItems,
    totals: {
      ...computedTotals,
      subtotal: Number(computedTotals?.subtotal || 0),
      commissionTotal: Number(computedTotals?.commissionTotal || 0),
      taxAmount: Number(computedTotals?.taxAmount || 0),
      grandTotal: Number(computedTotals?.grandTotal || 0),
    },
    terms: {
      paymentTerms: doc?.terms?.paymentTerms || "-",
      deliveryTerms: doc?.terms?.deliveryTerms || "-",
      notes: doc?.terms?.notes || sourceEnquiry?.specifications || "-",
    },
    letterheadConfig: selectedTemplate?.letterheadConfig || {},
    manualInput: {},
  };

  const canonicalQuery = useQuery({
    queryKey: ["canonical-document-template-preview", typeKey, templateId, sourceEnquiry?._id, doc?._id],
    queryFn: async () => (await postData(apiRoutes.documentTemplates.preview, {
      documentType: typeKey,
      templateId,
      document: {
        type: typeKey,
        documentNumber: normalizedData.documentNumber,
        status: doc?.status || "DRAFT",
        issueDate: doc?.issueDate || new Date().toISOString(),
        buyer: normalizedData.buyer,
        seller: normalizedData.seller,
        lineItems: normalizedData.lineItems.map((item: any) => ({ ...item, description: item.description || item.productName, quantity: item.quantity || item.quantityMT, unit: item.unit || "MT", unitPrice: item.unitPrice || item.ratePerKg, taxRate: item.taxRate || 0, total: item.total || item.amount })),
        totals: { currency: doc?.totals?.currency || "INR", ...normalizedData.totals },
        terms: normalizedData.terms,
        documentData: doc?.documentData || {},
      },
    })).data.data.html,
    enabled: Boolean(canonical && typeKey && templateId),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs  tracking-[0.3em] text-default-400 font-black">Template Preview</div>
          <div className="text-lg font-semibold text-foreground">{docLabel}</div>
        </div>
        {String(actionType || "").toUpperCase() === "UPLOAD" && (
          <Chip size="sm" variant="flat" color="warning">
            Upload-only doc
          </Chip>
        )}
      </div>

      {canonical ? (canonicalQuery.isLoading ? <div className="grid min-h-[700px] place-items-center text-sm text-default-500">Rendering canonical preview…</div> : canonicalQuery.isError ? <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">The canonical preview could not be rendered.</div> : <iframe title={`${docLabel} canonical preview`} srcDoc={String(canonicalQuery.data || "")} className="h-[1040px] w-full rounded-lg border bg-white" sandbox="allow-same-origin" />) : <TemplateCanvasRenderer layoutSchema={layoutSchema} docLabel={docLabel} data={normalizedData} />}
    </div>
  );
}
