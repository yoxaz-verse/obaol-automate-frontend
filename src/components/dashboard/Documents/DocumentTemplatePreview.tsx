"use client";

import React, { useMemo } from "react";
import { Card, CardBody, CardHeader, Chip, Divider } from "@nextui-org/react";

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

const FIELD_MAPS: Record<string, { section: string; fields: string[] }[]> = {
  LOI: [
    { section: "Header", fields: ["Company Logo", "Document Number", "Date", "Status"] },
    { section: "Parties", fields: ["Buyer", "Seller", "Consignee"] },
    { section: "Line Items", fields: ["Product", "Variant", "Qty", "Rate/KG", "Amount"] },
    { section: "Totals", fields: ["Subtotal", "Commission", "Tax", "Grand Total"] },
    { section: "Terms", fields: ["Payment Terms", "Delivery Terms", "Notes"] },
  ],
  QUOTATION: [
    { section: "Header", fields: ["Company Logo", "Document Number", "Date", "Status"] },
    { section: "Parties", fields: ["Buyer", "Seller", "Consignee"] },
    { section: "Line Items", fields: ["Product", "Variant", "Qty", "Rate/KG", "Amount"] },
    { section: "Totals", fields: ["Subtotal", "Commission", "Tax", "Grand Total"] },
    { section: "Terms", fields: ["Payment Terms", "Delivery Terms", "Notes"] },
  ],
  PROFORMA_INVOICE: [
    { section: "Header", fields: ["Company Logo", "Document Number", "Date", "Status"] },
    { section: "Parties", fields: ["Buyer", "Seller", "Consignee"] },
    { section: "Line Items", fields: ["Product", "Variant", "Qty", "Rate/KG", "Amount"] },
    { section: "Totals", fields: ["Subtotal", "Commission", "Tax", "Grand Total"] },
    { section: "Terms", fields: ["Payment Terms", "Delivery Terms", "Notes"] },
  ],
  INVOICE: [
    { section: "Header", fields: ["Company Logo", "Document Number", "Date", "Status"] },
    { section: "Parties", fields: ["Buyer", "Seller", "Consignee"] },
    { section: "Line Items", fields: ["Product", "Variant", "Qty", "Rate/KG", "Amount"] },
    { section: "Totals", fields: ["Subtotal", "Commission", "Tax", "Grand Total"] },
    { section: "Terms", fields: ["Payment Terms", "Delivery Terms", "Notes"] },
  ],
  PURCHASE_ORDER: [
    { section: "Header", fields: ["Company Logo", "PO Number", "Date", "Status"] },
    { section: "Parties", fields: ["Buyer", "Seller", "Delivery Address"] },
    { section: "Line Items", fields: ["Product", "Variant", "Qty", "Rate/KG", "Amount"] },
    { section: "Totals", fields: ["Subtotal", "Tax", "Grand Total"] },
    { section: "Terms", fields: ["Payment Terms", "Delivery Terms", "Notes"] },
  ],
  SALES_CONTRACT: [
    { section: "Header", fields: ["Company Logo", "Contract No.", "Date", "Status"] },
    { section: "Parties", fields: ["Buyer", "Seller", "Consignee"] },
    { section: "Line Items", fields: ["Product", "Variant", "Qty", "Rate/KG", "Amount"] },
    { section: "Terms", fields: ["Payment Terms", "Delivery Terms", "Notes"] },
  ],
  PACKING_LIST: [
    { section: "Header", fields: ["Company Logo", "Packing List No.", "Date"] },
    { section: "Shipment", fields: ["Shipment Ref", "Port/Terminal", "ETA/ETD"] },
    { section: "Packaging", fields: ["Package Count", "Gross Weight", "Net Weight", "Packaging Type"] },
    { section: "Items", fields: ["Product", "Variant", "Lot/Batch", "Qty"] },
  ],
  QUALITY_CERTIFICATE: [
    { section: "Header", fields: ["Certificate No.", "Issuer", "Date"] },
    { section: "Inspection", fields: ["Product", "Lot/Batch", "Inspection Result"] },
  ],
  INSPECTION_CERTIFICATE: [
    { section: "Header", fields: ["Certificate No.", "Issuer", "Date"] },
    { section: "Inspection", fields: ["Product", "Lot/Batch", "Inspection Result"] },
  ],
  PHYTOSANITARY_CERTIFICATE: [
    { section: "Header", fields: ["Certificate No.", "Issuer", "Date"] },
    { section: "Compliance", fields: ["Origin", "Product", "Treatment/Remarks"] },
  ],
  FUMIGATION_CERTIFICATE: [
    { section: "Header", fields: ["Certificate No.", "Issuer", "Date"] },
    { section: "Treatment", fields: ["Fumigant", "Dosage", "Duration"] },
  ],
  BILL_OF_LADING: [
    { section: "Header", fields: ["BL Number", "Date", "Carrier"] },
    { section: "Shipment", fields: ["Consignee", "Port of Loading", "Port of Discharge", "Vessel"] },
    { section: "Cargo", fields: ["Packages", "Gross Weight", "Net Weight"] },
  ],
  LORRY_RECEIPT: [
    { section: "Header", fields: ["LR Number", "Date", "Carrier"] },
    { section: "Shipment", fields: ["Consignee", "Origin", "Destination", "Vehicle"] },
    { section: "Cargo", fields: ["Packages", "Gross Weight", "Net Weight"] },
  ],
  LCL_DRAFT: [
    { section: "Header", fields: ["Draft No.", "Date", "Carrier"] },
    { section: "Shipment", fields: ["Consignee", "Port of Loading", "Port of Discharge", "Vessel"] },
    { section: "Cargo", fields: ["Packages", "Gross Weight", "Net Weight"] },
  ],
  AIR_WAYBILL: [
    { section: "Header", fields: ["AWB Number", "Date", "Carrier"] },
    { section: "Shipment", fields: ["Consignee", "Origin", "Destination", "Flight"] },
    { section: "Cargo", fields: ["Packages", "Gross Weight", "Chargeable Weight"] },
  ],
  INSURANCE_CERTIFICATE: [
    { section: "Header", fields: ["Policy No.", "Insurer", "Date"] },
    { section: "Coverage", fields: ["Insured Party", "Coverage Amount", "Commodity"] },
  ],
  PAYMENT_ADVICE: [
    { section: "Header", fields: ["Reference No.", "Date", "Status"] },
    { section: "Payment", fields: ["Amount Paid", "Mode", "Transaction Ref"] },
    { section: "Parties", fields: ["Payer", "Payee"] },
  ],
};

const FALLBACK_FIELDS = [
  { section: "Header", fields: ["Company Logo", "Document Number", "Date", "Status"] },
  { section: "Parties", fields: ["Buyer", "Seller", "Consignee"] },
  { section: "Line Items", fields: ["Product", "Variant", "Qty", "Rate/KG", "Amount"] },
  { section: "Totals", fields: ["Subtotal", "Tax", "Grand Total"] },
  { section: "Terms", fields: ["Payment Terms", "Delivery Terms", "Notes"] },
];

const sampleLineItems = [
  { product: "Turmeric", variant: "A‑Grade", qty: "18.00 MT", rate: "₹ 112.50 X mil", amount: "₹ 2,025,000" },
  { product: "Black Pepper", variant: "Premium", qty: "8.00 MT", rate: "₹ 420.00 X mil", amount: "₹ 3,360,000" },
];

const templateByType = (docType: string) => {
  const type = String(docType || "").toUpperCase();
  if (["PACKING_LIST"].includes(type)) return "packing";
  if (["QUALITY_CERTIFICATE", "INSPECTION_CERTIFICATE", "PHYTOSANITARY_CERTIFICATE", "FUMIGATION_CERTIFICATE"].includes(type)) return "certificate";
  if (["BILL_OF_LADING", "AIR_WAYBILL", "LORRY_RECEIPT", "LCL_DRAFT"].includes(type)) return "shipping";
  if (["INSURANCE_CERTIFICATE"].includes(type)) return "insurance";
  if (["PAYMENT_ADVICE"].includes(type)) return "payment";
  return "commercial";
};

export default function DocumentTemplatePreview({
  docType,
  actionType,
}: {
  docType: string;
  actionType?: string;
}) {
  const docLabel = DOC_LABELS[String(docType || "").toUpperCase()] || "Trade Document";
  const templateType = templateByType(docType);
  const fieldMap = useMemo(() => FIELD_MAPS[String(docType || "").toUpperCase()] || FALLBACK_FIELDS, [docType]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-default-400 font-black">Preview</div>
          <div className="text-lg font-semibold text-foreground">{docLabel}</div>
        </div>
        {String(actionType || "").toUpperCase() === "UPLOAD" && (
          <Chip size="sm" variant="flat" color="warning">
            Upload‑only doc
          </Chip>
        )}
      </div>

      <div className="w-full flex justify-center">
        <Card className="invoice-card border border-default-200/70 bg-content1/95 shadow-xl w-full max-w-4xl">
          <CardBody className="space-y-7 px-8 py-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning-500/10 flex items-center justify-center font-black text-warning-600">
                  O
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-default-400">OBAOL Supreme</div>
                  <div className="text-base font-semibold tracking-tight text-foreground">{docLabel}</div>
                </div>
              </div>
              <div className="text-right text-xs text-default-500">
                <div className="font-semibold text-default-700 tracking-tight">DOC‑2026‑001</div>
                <div>15 Mar 2026</div>
                <div>Status: Draft</div>
              </div>
            </div>

          <Divider />

          {templateType === "commercial" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Buyer</div>
                  <div className="font-semibold text-foreground">Evergreen Imports LLC</div>
                  <div>buyer@evergreen.com</div>
                  <div>+1 415 555 0199</div>
                  <div>San Francisco, CA, USA</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Seller</div>
                  <div className="font-semibold text-foreground">OBAOL Producer Co.</div>
                  <div>seller@obaol.com</div>
                  <div>+91 98765 43210</div>
                  <div>Kochi, India</div>
                </div>
              </div>

              <Divider />

              <div className="text-xs">
                <div className="text-[10px] uppercase tracking-widest text-default-400 mb-2">Line Items</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead className="text-default-400 border-b border-default-200/80">
                      <tr>
                        <th className="text-left py-2">Product</th>
                        <th className="text-left py-2">Variant</th>
                        <th className="text-right py-2">Qty</th>
                        <th className="text-right py-2">Rate/KG</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleLineItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-default-200/60">
                          <td className="py-2">{item.product}</td>
                          <td className="py-2">{item.variant}</td>
                          <td className="py-2 text-right">{item.qty}</td>
                          <td className="py-2 text-right">{item.rate}</td>
                          <td className="py-2 text-right">{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Terms</div>
                  <div>Payment: 30% advance, 70% before shipment</div>
                  <div>Delivery: FOB Cochin Port</div>
                  <div>Notes: Quality inspection before dispatch</div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="flex justify-between gap-6"><span>Subtotal</span><span>₹ 5,385,000</span></div>
                  <div className="flex justify-between gap-6"><span>Commission</span><span>₹ 120,000</span></div>
                  <div className="flex justify-between gap-6"><span>Tax</span><span>₹ 0</span></div>
                  <div className="flex justify-between gap-6 font-semibold"><span>Total</span><span>₹ 5,505,000</span></div>
                </div>
              </div>
            </>
          )}

          {templateType === "packing" && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Shipment Ref</div>
                  <div className="font-semibold">SHP‑2026‑109</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Port</div>
                  <div className="font-semibold">Cochin → Dubai</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 bg-default-100/60 rounded-lg p-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Packages</div>
                  <div className="font-semibold">120 Bags</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Gross Weight</div>
                  <div className="font-semibold">30,240 KG</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Net Weight</div>
                  <div className="font-semibold">30,000 KG</div>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-default-400">Packaging Type</div>
              <div>Woven PP Bags with moisture barrier</div>
            </div>
          )}

          {templateType === "certificate" && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Certificate No.</div>
                  <div className="font-semibold">CERT‑2026‑778</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Issuer</div>
                  <div className="font-semibold">Global Quality Labs</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Product</div>
                  <div className="font-semibold">Turmeric</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Lot/Batch</div>
                  <div className="font-semibold">BATCH‑TG‑09</div>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-default-400">Result</div>
              <div>Compliant with international export standards.</div>
            </div>
          )}

          {templateType === "shipping" && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Consignee</div>
                  <div className="font-semibold">Evergreen Imports LLC</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Carrier</div>
                  <div className="font-semibold">Oceanic Lines</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Origin</div>
                  <div className="font-semibold">Cochin Port</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Destination</div>
                  <div className="font-semibold">Jebel Ali Port</div>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-default-400">Cargo</div>
              <div>120 Bags • 30,240 KG gross</div>
            </div>
          )}

          {templateType === "insurance" && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Policy No.</div>
                  <div className="font-semibold">INS‑2026‑451</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Insurer</div>
                  <div className="font-semibold">Maritime Shield</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Insured Party</div>
                  <div className="font-semibold">OBAOL Producer Co.</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Coverage</div>
                  <div className="font-semibold">₹ 6,000,000</div>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-default-400">Commodity</div>
              <div>Turmeric • Black Pepper</div>
            </div>
          )}

          {templateType === "payment" && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Amount Paid</div>
                  <div className="font-semibold">₹ 5,505,000</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Mode</div>
                  <div className="font-semibold">Bank Transfer</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Reference</div>
                  <div className="font-semibold">TXN‑882901</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-default-400">Paid On</div>
                  <div className="font-semibold">15 Mar 2026</div>
                </div>
              </div>
            </div>
          )}
          </CardBody>
        </Card>
      </div>

      <div className="rounded-xl border border-default-200/60 bg-content1/95 p-3">
        <div className="text-[10px] uppercase tracking-widest text-default-400 font-bold mb-2">Field Map</div>
        <div className="space-y-2">
          {fieldMap.map((section) => (
            <div key={section.section} className="text-xs">
              <div className="font-semibold text-default-700">{section.section}</div>
              <div className="text-[11px] text-default-500">
                {section.fields.join(" • ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
