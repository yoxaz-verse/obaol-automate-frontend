import type { RateRow, UnknownRecord } from "../domain";

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;
export const normalizeObjectId = (value: unknown): string => {
  const raw = typeof value === "string" ? value : value && typeof value === "object"
    ? (value as { _id?: unknown; id?: unknown })._id ?? (value as { id?: unknown }).id : "";
  const normalized = String(raw || "").trim();
  return OBJECT_ID.test(normalized) ? normalized : "";
};

export interface CompanyRef extends UnknownRecord {
  name?: string;
  registeredTradeName?: string;
  gstVerification?: { legalName?: string; tradeName?: string };
}
export interface BuyerOption extends UnknownRecord {
  _id: string;
  name?: string; fullName?: string; email?: string; phone?: string; phoneNumber?: string;
  user?: { name?: string; phone?: string; email?: string };
  associateCompany?: CompanyRef | string;
  isDeleted?: boolean;
}
export interface IncotermOption extends UnknownRecord { _id: string; code?: string; name?: string }
export interface EnquiryRate extends RateRow {
  _id?: string; product?: unknown; productId?: unknown; productVariant?: unknown; productVariantId?: unknown;
  associateId?: unknown; associate?: unknown; originalOwnerId?: unknown; mediatorAssociateId?: unknown;
  variantRate?: UnknownRecord; baseRateId?: UnknownRecord; isCatalogView?: boolean; isLive?: boolean;
}
export interface EnquiryFormState {
  name: string; phoneNumber: string; quantity: string; preferredIncotermId: string;
  specification: string; buyerAssociateId: string;
}
export const EMPTY_ENQUIRY_FORM: EnquiryFormState = { name: "", phoneNumber: "", quantity: "", preferredIncotermId: "", specification: "", buyerAssociateId: "" };

const nestedId = (value: unknown, path: string[]) => path.reduce<unknown>((current, key) =>
  current && typeof current === "object" ? (current as UnknownRecord)[key] : undefined, value);

export const resolveSellerId = (rate: EnquiryRate) => normalizeObjectId(
  rate.associateId || nestedId(rate.associate, ["_id"]) || rate.originalOwnerId ||
  nestedId(rate.variantRate, ["associate", "_id"]) || nestedId(rate.baseRateId, ["associate", "_id"]),
);
export const resolveProductId = (rate: EnquiryRate) => normalizeObjectId(
  rate.productId || nestedId(rate.product, ["_id"]) || nestedId(rate.productVariant, ["product", "_id"]) ||
  nestedId(rate.productVariant, ["product"]) || nestedId(rate.variantRate, ["productVariant", "product", "_id"]) ||
  nestedId(rate.baseRateId, ["productVariant", "product", "_id"]),
);
export const resolveProductVariantId = (rate: EnquiryRate, explicit: string) => normalizeObjectId(
  explicit || rate.productVariantId || nestedId(rate.productVariant, ["_id"]) ||
  nestedId(rate.variantRate, ["productVariant", "_id"]) || nestedId(rate.baseRateId, ["productVariant", "_id"]),
);
export const buyerLabel = (buyer: BuyerOption) => buyer.name || buyer.user?.name ||
  (typeof buyer.associateCompany === "object" ? buyer.associateCompany.name : "") || buyer.fullName || buyer.email || buyer.user?.email || "Associate";
export const buyerContacts = (buyer?: BuyerOption | null) => ({
  name: buyer?.name || buyer?.fullName || buyer?.user?.name || "",
  phoneNumber: buyer?.phone || buyer?.phoneNumber || buyer?.user?.phone || "",
});
export const companyNames = (buyer: BuyerOption | null, fallback?: string) => {
  const company = typeof buyer?.associateCompany === "object" ? buyer.associateCompany : undefined;
  return [company?.name, company?.registeredTradeName, company?.gstVerification?.legalName, company?.gstVerification?.tradeName, fallback].filter((value): value is string => Boolean(value));
};

export interface EnquiryPayloadInput {
  rate: EnquiryRate; form: EnquiryFormState; productId: string; buyerId: string; sellerId: string;
  userId?: string; role: string; profileName?: string; profilePhone?: string;
}
export const buildEnquiryPayload = ({ rate, form, productId, buyerId, sellerId, userId, role, profileName, profilePhone }: EnquiryPayloadInput) => {
  const preferredIncoterm = form.preferredIncotermId ? normalizeObjectId(form.preferredIncotermId) : "";
  const rateId = rate.isCatalogView ? "" : normalizeObjectId(rate._id);
  const catalogItemId = rate.isCatalogView ? normalizeObjectId(rate._id) : "";
  if (!productId) throw new Error("Product is missing for this rate. Please refresh and try again.");
  if (!buyerId) throw new Error("Buyer associate is required.");
  if (!sellerId) throw new Error("Invalid seller mapping for this listing. Please refresh trade listing data or contact admin.");
  if (form.preferredIncotermId && !preferredIncoterm) throw new Error("Preferred incoterm is invalid. Please reselect and try again.");
  if (!rate.isCatalogView && !rateId) throw new Error("Variant rate is invalid. Please refresh and try again.");
  if (rate.isCatalogView && !catalogItemId) throw new Error("Catalog item is invalid. Please refresh and try again.");
  const productName = typeof rate.product === "string" ? rate.product : "";
  const variantName = typeof rate.productVariant === "string" ? rate.productVariant : "Standard";
  const base = `Variant: ${variantName || "Standard"}`;
  return {
    productId, quantity: Number(form.quantity) || 1,
    specifications: form.specification.trim() ? `${base}\n\nNotes: ${form.specification.trim()}` : base,
    buyerAssociateId: buyerId, sellerAssociateId: sellerId,
    mediatorAssociateId: normalizeObjectId(rate.mediatorAssociateId) || null,
    variantRateId: rate.isCatalogView ? null : rateId,
    catalogItemId: rate.isCatalogView ? catalogItemId : null,
    preferredIncoterm: preferredIncoterm || null,
    ...(["operator", "team"].includes(role) && userId ? { assignedOperatorId: userId } : {}),
    ...(form.name && form.name !== profileName ? { name: form.name } : {}),
    ...(form.phoneNumber && form.phoneNumber !== profilePhone ? { phoneNumber: form.phoneNumber } : {}),
    notes: `Enquiry for ${productName} - ${variantName}`,
  };
};
