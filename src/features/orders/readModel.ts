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

export type DocumentReadiness = "MISSING" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";

export const documentReadiness = (document: unknown): DocumentReadiness => {
  if (!document) return "MISSING";
  const status = String(asRecord(document).verifiedStatus ?? "PENDING").toUpperCase();
  if (status === "VERIFIED") return "VERIFIED";
  if (status === "REJECTED") return "REJECTED";
  return "PENDING_VERIFICATION";
};

export const paymentProgress = (milestones: unknown): { paidPercent: number; duePercent: number; totalPercent: number } => {
  const rows = Array.isArray(milestones) ? milestones : [];
  return rows.reduce((result, raw) => {
    const row = asRecord(raw);
    const percent = Number(row.percent ?? 0) || 0;
    result.totalPercent += percent;
    if (row.status === "PAID") result.paidPercent += percent;
    if (row.status === "DUE") result.duePercent += percent;
    return result;
  }, { paidPercent: 0, duePercent: 0, totalPercent: 0 });
};

export const isValidHandlerRating = (value: unknown): boolean =>
  value === null || value === "" || (Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 5);
