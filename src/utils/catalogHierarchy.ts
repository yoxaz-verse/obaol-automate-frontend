import { getData } from "@/core/api/apiHandler";
import type { CatalogHierarchyOption } from "./catalogHierarchyContract";

export type { CatalogHierarchyOption } from "./catalogHierarchyContract";
export { filterCatalogHierarchyOptions, normalizeCatalogSearch } from "./catalogHierarchyContract";

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
    timeoutMs: 15000,
  });
  const rows = response?.data?.data;
  if (!Array.isArray(rows)) throw new Error("Catalog hierarchy returned an invalid response.");
  return rows
    .map((row: any) => ({
      id: String(row?.id || "").trim(),
      name: String(row?.name || "").normalize("NFKC").trim(),
      level: row?.level,
      parentId: row?.parentId == null ? null : String(row.parentId),
      parentName: row?.parentName == null ? null : String(row.parentName).normalize("NFKC").trim(),
      approvalStatus: row?.approvalStatus || "APPROVED",
      reviewNotes: String(row?.reviewNotes || ""),
    }))
    .filter((row): row is CatalogHierarchyOption => Boolean(
      row.id
      && row.name
      && ["category", "subCategory", "product", "productVariant"].includes(row.level),
    ));
};
