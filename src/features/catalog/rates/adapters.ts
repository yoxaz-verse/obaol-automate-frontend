import type { RateRow, UnknownRecord } from "./domain";

export interface PageMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface RatePage {
  rows: RateRow[];
  meta: PageMeta;
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const asRecord = (value: unknown): UnknownRecord =>
  isRecord(value) ? value : {};

export const asIdentifier = (value: unknown): string => {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  const identifier = record._id ?? record.id;
  return typeof identifier === "string" ? identifier : "";
};

const nestedValue = (value: unknown, path: string[]): unknown =>
  path.reduce<unknown>((current, key) => asRecord(current)[key], value);

const ROW_PATHS = [
  ["data", "data", "data"],
  ["data", "data", "docs"],
  ["data", "docs"],
  ["data", "data"],
  ["data"],
] as const;

export const adaptRows = <T extends UnknownRecord = RateRow>(value: unknown): T[] => {
  if (Array.isArray(value)) return value.filter(isRecord) as T[];
  for (const path of ROW_PATHS) {
    const candidate = nestedValue(value, [...path]);
    if (Array.isArray(candidate)) return candidate.filter(isRecord) as T[];
  }
  return [];
};

export const adaptRatePage = (value: unknown): RatePage => {
  const rows = adaptRows<RateRow>(value);
  const candidates = [
    nestedValue(value, ["data", "data", "meta"]),
    nestedValue(value, ["data", "meta"]),
    nestedValue(value, ["meta"]),
  ];
  const rawMeta = candidates.find(isRecord) ?? {};
  const numeric = (key: string): number | undefined => {
    const candidate = rawMeta[key];
    return typeof candidate === "number" && Number.isFinite(candidate)
      ? candidate
      : undefined;
  };
  return {
    rows,
    meta: {
      page: numeric("page"),
      limit: numeric("limit"),
      total: numeric("total"),
      totalPages: numeric("totalPages"),
    },
  };
};

export const adaptMutationRecord = (value: unknown): UnknownRecord => {
  const candidates = [
    nestedValue(value, ["data", "data"]),
    nestedValue(value, ["data"]),
    value,
  ];
  return candidates.find(isRecord) ?? {};
};
