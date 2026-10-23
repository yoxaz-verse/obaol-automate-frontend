export type UnknownRecord = Record<string, unknown>;
export type RateRow = UnknownRecord & {
  _id?: unknown;
  createdAt?: unknown;
  companyId?: unknown;
  isMarketplaceView?: unknown;
  isCatalogView?: unknown;
  isOwnerView?: unknown;
  isNatural?: unknown;
  isOrganic?: unknown;
  isIpmQuality?: unknown;
  isGiTagged?: unknown;
};

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};

export const asList = (value: unknown): RateRow[] => {
  if (Array.isArray(value)) return value as RateRow[];
  const data = asRecord(value).data;
  return Array.isArray(data) ? data as RateRow[] : [];
};

export const roundRate = (value: number) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

export const isValidObjectId = (value: unknown) =>
  /^[a-f0-9]{24}$/i.test(String(value || "").trim());

export const resolveAdminCommission = (rateValue: unknown, commissionValue: unknown, commissionPercent: number) => {
  const commission = Number(commissionValue);
  if (Number.isFinite(commission) && commission > 0) return commission;
  const rate = Number(rateValue || 0);
  const percent = Number.isFinite(commissionPercent)
    ? commissionPercent
    : 2.5;
  return roundRate(rate * (percent / 100));
};

export const truncateWithDots = (value: unknown, limit = 12) => {
  const text = String(value ?? "");
  return text.length <= limit ? text : `${text.slice(0, limit)}..`;
};

export const toDisplayText = (value: unknown, fallback = "N/A"): string => {
  if (value === null || value === undefined) return fallback;
  if (["string", "number", "boolean"].includes(typeof value)) return String(value).trim() || fallback;
  if (Array.isArray(value)) return value.map((entry) => toDisplayText(entry, "")).filter(Boolean).join(", ") || fallback;
  const record = asRecord(value);
  return toDisplayText(record.name, "") || toDisplayText(record.label, "")
    || toDisplayText(record.title, "") || toDisplayText(record.slug, "") || fallback;
};

export const extractClassifications = (value: unknown): string[] => {
  const row = asRecord(value);
  const labels: string[] = [];
  if (!(row.isNatural || row.isOrganic || row.isIpmQuality)) labels.push("Conventional");
  if (row.isNatural) labels.push("Natural");
  if (row.isOrganic) labels.push("Organic");
  if (row.isIpmQuality) labels.push("IPM");
  if (row.isGiTagged) labels.push("GI Tag");
  return labels;
};

export const classificationTone = (label: string): string => {
  const key = String(label || "").toLowerCase();
  if (key === "organic") return "bg-success-500/15 text-success-400 border-success-500/30";
  if (key === "natural") return "bg-secondary-500/15 text-secondary-400 border-secondary-500/30";
  if (key.includes("gi")) return "bg-obaol-500/15 text-obaol-400 border-obaol-500/30";
  return "bg-default-500/15 text-default-300 border-default-400/20";
};

export const canManageRate = (row: RateRow | null, context: {
  role: string; isOperator: boolean; isSellingMode: boolean;
}) => Boolean(row && (
  context.role === "admin"
  || (context.isOperator && !row.isMarketplaceView && !row.isCatalogView && row.companyId)
  || (context.isSellingMode && (row.isOwnerView || row.isCatalogView))
));

export const canDeleteRate = (row: RateRow, role: string, now: number, windowMs: number) => {
  if (role === "admin") return true;
  const createdAt = new Date(String(row.createdAt || "")).getTime();
  return Number.isFinite(createdAt) && now < createdAt + windowMs;
};

export const mergeVariantAndDisplayedOnce = (variantRates: unknown, displayedRates: unknown): RateRow[] => {
  const variants = asList(variantRates);
  const displayed = asList(displayedRates);
  const displayedIds = new Set(displayed.map((row) => {
    const variant = asRecord(row.variantRate);
    return String(variant._id || row.variantRate || "");
  }));
  return [...displayed, ...variants.filter((row) => !displayedIds.has(String(row._id || "")))];
};

export type SampleRequestDraft = {
  variantRateId: string; state: string; district: string; division: string;
  address: string; pincode: string; quantityKg: string | number;
  buyerAssociateId?: string; includeBuyer?: boolean;
};

export const validateSampleRequest = (draft: SampleRequestDraft): string | null => {
  if (draft.includeBuyer && !draft.buyerAssociateId) return "Select a buyer associate.";
  if (!draft.state || !draft.district || !draft.division) return "Select state, district, and division.";
  const quantity = Number(draft.quantityKg);
  if (!Number.isFinite(quantity) || quantity <= 0) return "Enter sample quantity in kg.";
  if (!draft.address.trim()) return "Enter the full address.";
  if (!draft.pincode.trim()) return "Select or enter the pincode.";
  return null;
};

export const buildSampleRequestPayload = (draft: SampleRequestDraft) => ({
  variantRateId: draft.variantRateId, requestState: draft.state, requestDistrict: draft.district,
  requestDivision: draft.division, requestAddress: draft.address.trim(), requestPincode: draft.pincode.trim(),
  requestedSampleQtyKg: Number(draft.quantityKg),
  ...(draft.includeBuyer ? { buyerAssociateId: draft.buyerAssociateId } : {}),
});
