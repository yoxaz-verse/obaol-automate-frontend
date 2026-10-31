export type CatalogHierarchyLevel = "category" | "subCategory" | "product" | "productVariant";

export type CatalogHierarchyOption = {
  id: string;
  name: string;
  level: CatalogHierarchyLevel;
  parentId: string | null;
  parentName: string | null;
  approvalStatus: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  reviewNotes: string;
};

export const normalizeCatalogSearch = (value: unknown) =>
  String(value || "").normalize("NFKC").trim().toLocaleLowerCase("en");

export const filterCatalogHierarchyOptions = <T extends { name: string }>(options: readonly T[], query: unknown): T[] => {
  const normalizedQuery = normalizeCatalogSearch(query);
  if (!normalizedQuery) return [...options];
  return options.filter((option) => normalizeCatalogSearch(option.name).includes(normalizedQuery));
};
