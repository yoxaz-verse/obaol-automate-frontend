export type SubflowDateField = { key: string; label: string; type: "date" | "text" };

export const OWNER_LAYERS = [
  { key: "buyer", title: "Buyer Layer" },
  { key: "seller", title: "Supplier Layer" },
  { key: "obaol", title: "Authority Layer (OBAOL)" },
] as const;

export const SUBFLOW_DATE_MAP: Record<string, SubflowDateField[]> = {
  PROCUREMENT: [
    { key: "procurementDate", label: "START DATE", type: "date" },
    { key: "procurementInspectionDate", label: "INSPECTION DATE", type: "date" },
    { key: "procurementCompletedDate", label: "COMPLETION DATE", type: "date" },
  ],
  PACKAGING: [
    { key: "packagingStartDate", label: "PACKING START", type: "date" },
    { key: "packagingCompletedDate", label: "PACKING DONE", type: "date" },
  ],
  INLAND_TRANSPORTATION: [{ key: "transportDispatchDate", label: "DISPATCH DATE", type: "date" }],
  CERTIFICATION: [
    { key: "certificateRequestedDate", label: "REQUESTED DATE", type: "date" },
    { key: "certificateIssuedDate", label: "ISSUED DATE", type: "date" },
  ],
  FREIGHT_FORWARDING: [
    { key: "shippingBookedDate", label: "BOOKING DATE", type: "date" },
    { key: "customsClearanceDate", label: "CUSTOMS DATE", type: "date" },
  ],
  QUALITY_QA: [
    { key: "qualitySampleSentDate", label: "SAMPLE SENT", type: "date" },
    { key: "labExpectedReportDate", label: "LAB ETA", type: "date" },
    { key: "qualityApprovedDate", label: "APPROVAL DATE", type: "date" },
  ],
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  PROFORMA_INVOICE: "Proforma Invoice",
  BILL_OF_LADING: "Bill of Lading",
  AIR_WAYBILL: "Air Waybill",
  LORRY_RECEIPT: "Lorry Receipt",
  LCL_DRAFT: "LCL Draft",
  PACKING_LIST: "Packing List",
  INSPECTION_CERTIFICATE: "Inspection Certificate",
  QUALITY_CERTIFICATE: "Quality Certificate",
  PHYTOSANITARY_CERTIFICATE: "Phytosanitary Certificate",
  FUMIGATION_CERTIFICATE: "Fumigation Certificate",
  INSURANCE_CERTIFICATE: "Insurance Certificate",
  SALES_CONTRACT: "Sales Contract",
  PAYMENT_ADVICE: "Payment Advice",
  INVOICE: "Invoice",
};

export const SUBFLOW_DOCUMENT_TYPES: Record<string, string[]> = {
  PROCUREMENT: [],
  PACKAGING: ["PACKING_LIST"],
  QUALITY_QA: ["INSPECTION_CERTIFICATE", "QUALITY_CERTIFICATE"],
  CERTIFICATION: ["PHYTOSANITARY_CERTIFICATE", "FUMIGATION_CERTIFICATE"],
  INLAND_TRANSPORTATION: ["LORRY_RECEIPT", "LCL_DRAFT"],
  FREIGHT_FORWARDING: ["BILL_OF_LADING", "AIR_WAYBILL", "INSURANCE_CERTIFICATE"],
};

export const ORDER_CORE_DOCUMENT_TYPES = ["SALES_CONTRACT", "PURCHASE_ORDER", "INVOICE", "PAYMENT_ADVICE"];
