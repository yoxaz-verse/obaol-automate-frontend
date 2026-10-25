export const DOCUMENT_STUDIO_TYPES = [
  "LOI", "QUOTATION", "PROFORMA_INVOICE", "INVOICE", "PURCHASE_ORDER",
  "SALES_CONTRACT", "PACKING_LIST", "QUALITY_CERTIFICATE",
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
};

export const isCommercialStudioType = (type: string) => !["PACKING_LIST", "QUALITY_CERTIFICATE"].includes(type);

export const formatActivity = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/^./, c => c.toUpperCase());
