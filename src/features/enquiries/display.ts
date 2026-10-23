type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

const nested = (value: unknown, ...keys: string[]): unknown =>
  keys.reduce<unknown>((current, key) => asRecord(current)[key], value);

export const sanitizeDisplayText = (value: unknown): string => String(value ?? "").trim();

export const tradeInputLabel = (entry: unknown): string => {
  const contributor = sanitizeDisplayText(asRecord(entry).contributor).toUpperCase();
  if (contributor === "BUYER") return "Buyer’s opinion";
  if (contributor === "SELLER") return "Seller’s opinion";
  if (contributor === "OBAOL") return "OBAOL input";
  return "Party input";
};

export const getProductDisplayName = (enquiry: unknown): string => {
  const candidates = [
    nested(enquiry, "productId", "name"),
    nested(enquiry, "productVariant", "product", "name"),
    nested(enquiry, "variantRateId", "product", "name"),
  ];
  return candidates.map(sanitizeDisplayText).find(Boolean) ?? "Unknown Product";
};

export const getVariantDisplayName = (enquiry: unknown, liveRate: unknown): string => {
  const record = asRecord(enquiry);
  const specificationFallback = sanitizeDisplayText(record.specifications ?? record.specification)
    .replace(/\s+/g, " ")
    .split(/\s+Notes:/i)[0]
    .trim();
  const candidates = [
    nested(enquiry, "productVariant", "name"),
    nested(enquiry, "variantId", "name"),
    nested(enquiry, "variantRateId", "productVariant", "name"),
    nested(enquiry, "variantRateId", "variant", "name"),
    nested(enquiry, "variantRateId", "name"),
    nested(liveRate, "productVariant", "name"),
    nested(liveRate, "variant", "name"),
    record.productVariantName,
    record.variantName,
    specificationFallback,
  ];
  return candidates.map(sanitizeDisplayText).find(Boolean) ?? "Unknown Variant";
};
