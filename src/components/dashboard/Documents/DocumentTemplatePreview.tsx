"use client";

import React, { useMemo } from "react";
import { Chip } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
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
}: {
  docType: string;
  actionType?: string;
  enquiry?: any;
  order?: any;
  doc?: any;
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
    return group?.live || group?.preview || group?.published || group?.draft || null;
  }, [templateQuery.data, typeKey]);
  const layoutSchema = selectedTemplate?.layoutSchema || fallbackSchema;

  const sourceEnquiry = enquiry || order?.enquiry || null;
  const lineItems = Array.isArray(doc?.lineItems)
    ? doc.lineItems
    : [
        {
          productName: sourceEnquiry?.productVariant?.product?.name || sourceEnquiry?.productName || "—",
          productVariantName: sourceEnquiry?.productVariant?.name || sourceEnquiry?.variantName || "—",
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

  const normalizedData = {
    documentNumber: doc?.documentNumber || "DRAFT",
    docDate: doc?.createdAt ? new Date(doc.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
    buyer: {
      name: doc?.buyer?.name || sourceEnquiry?.buyerAssociateCompanyName || sourceEnquiry?.buyerName || "—",
      email: doc?.buyer?.email || sourceEnquiry?.buyerAssociateId?.email || "—",
      phone: doc?.buyer?.phone || sourceEnquiry?.buyerAssociateId?.phone || "—",
    },
    seller: {
      name: doc?.seller?.name || sourceEnquiry?.sellerAssociateCompanyName || sourceEnquiry?.sellerName || "—",
      email: doc?.seller?.email || sourceEnquiry?.sellerAssociateId?.email || "—",
      phone: doc?.seller?.phone || sourceEnquiry?.sellerAssociateId?.phone || "—",
    },
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

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-default-400 font-black">Template Preview</div>
          <div className="text-lg font-semibold text-foreground">{docLabel}</div>
        </div>
        {String(actionType || "").toUpperCase() === "UPLOAD" && (
          <Chip size="sm" variant="flat" color="warning">
            Upload-only doc
          </Chip>
        )}
      </div>

      <TemplateCanvasRenderer layoutSchema={layoutSchema} docLabel={docLabel} data={normalizedData} />
    </div>
  );
}
