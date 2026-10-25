export const DOCUMENT_STUDIO_TYPES = [
  "LOI", "QUOTATION", "PROFORMA_INVOICE", "INVOICE", "PURCHASE_ORDER",
  "SALES_CONTRACT", "PACKING_LIST", "QUALITY_CERTIFICATE",
  "INSPECTION_CERTIFICATE", "PHYTOSANITARY_CERTIFICATE", "FUMIGATION_CERTIFICATE",
  "BILL_OF_LADING", "AIR_WAYBILL", "INSURANCE_CERTIFICATE", "PAYMENT_ADVICE",
  "LORRY_RECEIPT", "LCL_DRAFT", "SHIPPING_BILL", "CERTIFICATE_OF_ORIGIN",
  "DISPATCH_CHALLAN", "BILL_OF_ENTRY", "CUSTOMS_CLEARANCE", "GOODS_RECEIPT",
] as const;

export type DocumentStudioType = typeof DOCUMENT_STUDIO_TYPES[number];

export const DOCUMENT_STUDIO_LABELS: Record<DocumentStudioType, string> = {
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
  INSURANCE_CERTIFICATE: "Insurance Certificate",
  PAYMENT_ADVICE: "Payment Advice",
  LORRY_RECEIPT: "Lorry Receipt",
  LCL_DRAFT: "LCL Draft",
  SHIPPING_BILL: "Shipping Bill",
  CERTIFICATE_OF_ORIGIN: "Certificate of Origin",
  DISPATCH_CHALLAN: "Dispatch Challan",
  BILL_OF_ENTRY: "Bill of Entry",
  CUSTOMS_CLEARANCE: "Customs Clearance",
  GOODS_RECEIPT: "Goods Receipt",
};

export const isCommercialStudioType = (type: string) => !["PACKING_LIST", "QUALITY_CERTIFICATE"].includes(type);

export const formatActivity = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/^./, c => c.toUpperCase());
