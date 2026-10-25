export const DOCUMENT_CATEGORIES: Array<{ key: string; label: string; types: string[] }> = [
  { key: "COMMERCIAL", label: "Commercial", types: ["LOI", "QUOTATION", "PROFORMA_INVOICE", "INVOICE", "PURCHASE_ORDER", "SALES_CONTRACT"] },
  { key: "PACKING_DISPATCH", label: "Packing & dispatch", types: ["PACKING_LIST", "DISPATCH_CHALLAN", "LORRY_RECEIPT"] },
  { key: "LOGISTICS", label: "Logistics", types: ["BILL_OF_LADING", "AIR_WAYBILL", "LCL_DRAFT"] },
  { key: "EXPORT_CUSTOMS", label: "Export & customs", types: ["SHIPPING_BILL", "CERTIFICATE_OF_ORIGIN", "CUSTOMS_CLEARANCE"] },
  { key: "IMPORT_CUSTOMS", label: "Import & customs", types: ["BILL_OF_ENTRY", "CUSTOMS_CLEARANCE", "GOODS_RECEIPT"] },
  { key: "QUALITY", label: "Quality & compliance", types: ["QUALITY_CERTIFICATE", "INSPECTION_CERTIFICATE", "PHYTOSANITARY_CERTIFICATE", "FUMIGATION_CERTIFICATE", "INSURANCE_CERTIFICATE"] },
  { key: "PAYMENT_SUPPORT", label: "Payment support", types: ["PAYMENT_ADVICE"] },
];

export const DOCUMENT_LABELS: Record<string, string> = {
  LOI: "Letter of Intent", QUOTATION: "Quotation", PROFORMA_INVOICE: "Proforma Invoice", INVOICE: "Invoice",
  PURCHASE_ORDER: "Purchase Order", SALES_CONTRACT: "Sales Contract", PACKING_LIST: "Packing List",
  DISPATCH_CHALLAN: "Dispatch Challan", LORRY_RECEIPT: "Lorry Receipt", BILL_OF_LADING: "Bill of Lading",
  AIR_WAYBILL: "Air Waybill", LCL_DRAFT: "LCL Draft", SHIPPING_BILL: "Shipping Bill",
  CERTIFICATE_OF_ORIGIN: "Certificate of Origin", BILL_OF_ENTRY: "Bill of Entry", CUSTOMS_CLEARANCE: "Customs Clearance",
  GOODS_RECEIPT: "Goods Receipt", QUALITY_CERTIFICATE: "Quality Certificate", INSPECTION_CERTIFICATE: "Inspection Certificate",
  PHYTOSANITARY_CERTIFICATE: "Phytosanitary Certificate", FUMIGATION_CERTIFICATE: "Fumigation Certificate",
  INSURANCE_CERTIFICATE: "Insurance Certificate", PAYMENT_ADVICE: "Payment Advice",
};

export const ALL_DOCUMENT_TYPES = Array.from(new Set(DOCUMENT_CATEGORIES.flatMap(category => [...category.types])));
