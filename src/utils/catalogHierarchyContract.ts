export type CatalogHierarchyLevel = "category" | "subCategory" | "product" | "productVariant";

export type CatalogHierarchyOption = {
  id: string;
  name: string;
  level: CatalogHierarchyLevel;
  parentId: string | null;
  parentName: string | null;
};

export const normalizeCatalogSearch = (value: unknown) =>
  String(value || "").normalize("NFKC").trim().toLocaleLowerCase("en");
