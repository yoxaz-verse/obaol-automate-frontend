import { getData } from "@/core/api/apiHandler";

export type CatalogHierarchyOption = {
  id: string;
  name: string;
  parentId: string | null;
};

export type CatalogHierarchyParent =
  | { key: "category"; id: string }
  | { key: "subCategory"; id: string }
  | { key: "product"; id: string };

export const fetchCatalogHierarchyOptions = async (
  parent?: CatalogHierarchyParent,
  signal?: AbortSignal,
): Promise<CatalogHierarchyOption[]> => {
  const params: Record<string, string | number> = { _ts: Date.now() };
  if (parent) params[parent.key] = parent.id;
  const response = await getData("/catalog/hierarchy-options", params, {
    cacheMode: "bypass",
    signal,
  });
  const rows = response?.data?.data;
  if (!Array.isArray(rows)) throw new Error("Catalog hierarchy returned an invalid response.");
  return rows
    .map((row: any) => ({
      id: String(row?.id || "").trim(),
      name: String(row?.name || "").trim(),
      parentId: row?.parentId == null ? null : String(row.parentId),
    }))
    .filter((row) => row.id && row.name);
};
