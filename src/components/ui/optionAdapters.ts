import type { SearchableOption } from "./SearchableSelect";

export const adaptKeyValueOptions = (rows: Array<{ key: unknown; value: unknown }>): SearchableOption[] => rows.map(row => ({ key: String(row.key), label: String(row.value) }));

export const adaptIdNameOptions = (rows: Array<{ _id?: unknown; id?: unknown; name?: unknown; label?: unknown; description?: unknown }>): SearchableOption[] => rows.map(row => ({
  key: String(row._id ?? row.id ?? ""),
  label: String(row.name ?? row.label ?? row._id ?? row.id ?? ""),
  description: row.description == null ? undefined : String(row.description),
})).filter(option => option.key);

export const adaptOptions = <T,>(rows: T[], getKey: (row: T) => unknown, getLabel: (row: T) => unknown, getMeta?: (row: T) => Partial<Pick<SearchableOption, "description" | "group">>): SearchableOption[] => rows.map(row => ({
  key: String(getKey(row)),
  label: String(getLabel(row)),
  ...getMeta?.(row),
})).filter(option => option.key);
