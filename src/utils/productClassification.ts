export type ProductionMethod = "conventional" | "natural" | "organic" | "ipm";

export type ProductClassificationFlags = {
  isConventional?: boolean;
  isNatural?: boolean;
  isOrganic?: boolean;
  isIpmQuality?: boolean;
};

const METHOD_FLAGS: Record<ProductionMethod, keyof ProductClassificationFlags> = {
  conventional: "isConventional",
  natural: "isNatural",
  organic: "isOrganic",
  ipm: "isIpmQuality",
};

export const productionMethodFlags = (method: ProductionMethod): Required<ProductClassificationFlags> => ({
  isConventional: method === "conventional",
  isNatural: method === "natural",
  isOrganic: method === "organic",
  isIpmQuality: method === "ipm",
});

export const applyProductionMethod = <T extends Record<string, unknown>>(
  current: T,
  method: ProductionMethod,
): T & Required<ProductClassificationFlags> & { productionMethod: ProductionMethod } => ({
  ...current,
  productionMethod: method,
  ...productionMethodFlags(method),
});

export const resolveProductionMethod = (
  flags: ProductClassificationFlags,
): { method: ProductionMethod | null; hasConflict: boolean } => {
  const selected = (Object.entries(METHOD_FLAGS) as Array<[ProductionMethod, keyof ProductClassificationFlags]>)
    .filter(([, flag]) => Boolean(flags[flag]))
    .map(([method]) => method);

  if (selected.length > 1) return { method: null, hasConflict: true };
  if (selected.length === 1) return { method: selected[0], hasConflict: false };
  return { method: "conventional", hasConflict: false };
};
