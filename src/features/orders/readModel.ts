type UnknownRecord = Record<string, unknown>;

export type OrderRule = {
  isDeleted?: boolean;
  isActive?: boolean;
  tradeType?: string;
  sortOrder?: number;
  stageKey?: string;
  label?: string;
};

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

export const unwrapList = <T = UnknownRecord>(response: unknown): T[] => {
  const root = asRecord(response);
  const data = root.data;
  const first = asRecord(data).data;
  const second = asRecord(first).data;
  const candidates = [second, asRecord(first).docs, asRecord(data).docs, first, data, response];
  return (candidates.find(Array.isArray) as T[] | undefined) ?? [];
};

export const executionTaskLabel = (type: string): string => {
  const labels: Record<string, string> = {
    PROCUREMENT: "Procurement",
    PACKAGING: "Packaging",
    QUALITY_TESTING: "Quality Testing",
    QUALITY_QA: "Quality Testing",
    CERTIFICATION: "Certification",
    WAREHOUSE: "Warehouse",
    TRANSPORTATION: "Inland Transportation",
    SHIPPING: "Freight Forwarding",
  };
  const key = String(type || "").toUpperCase();
  return labels[key] ?? key.replaceAll("_", " ");
};

export const companyName = (company: unknown): string => {
  if (!company) return "Unknown";
  if (typeof company === "string") return company;
  const record = asRecord(company);
  return String(record.name ?? record.companyName ?? record._id ?? "Unknown");
};

export const executionBidLabel = (task: unknown): string => {
  const record = asRecord(task);
  if (!task) return "Awaiting bids";
  if (record.committedProvider || record.committedCompany || record.committedVendor) return "Provider committed";
  if (Array.isArray(record.bids) && record.bids.length > 0) return "Under bidding";
  const status = String(record.status ?? "").toUpperCase();
  if (status === "IN_PROGRESS") return "In progress";
  if (status === "COMPLETED") return "Completed";
  return "Awaiting bids";
};

export const actionByLabel = (value: string): string => {
  const normalized = String(value || "").toUpperCase();
  if (normalized === "BUYER") return "Buyer";
  if (normalized === "SELLER" || normalized === "SUPPLIER") return "Supplier";
  if (normalized === "BOTH") return "Buyer & Supplier";
  if (normalized === "EITHER") return "Buyer or Supplier";
  if (normalized === "OBAOL" || normalized === "INTERNAL") return "OBAOL";
  return "";
};
