"use client";

export const DEFAULT_STALE_TIME = 45 * 1000;
export const DASHBOARD_STALE_TIME = 5 * 60 * 1000;
export const SESSION_STALE_TIME = 30 * 1000;
export const STATIC_OPTIONS_STALE_TIME = 10 * 60 * 1000;

export const QUERY_KEYS = {
  session: ["session"] as const,
};

export const extractPagedPayload = (raw: any) => {
  if (!raw) return {};
  if (raw?.data?.data && typeof raw.data.data === "object") return raw.data.data;
  if (raw?.data && typeof raw.data === "object") return raw.data;
  if (typeof raw === "object") return raw;
  return {};
};

export const extractList = (raw: any): any[] => {
  const normalized = extractPagedPayload(raw);
  if (Array.isArray(normalized)) return normalized;
  if (Array.isArray(normalized?.data)) return normalized.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  if (Array.isArray(raw?.data?.data?.data)) return raw.data.data.data;
  return [];
};

export const extractCount = (raw: any, list: any[]) => {
  const normalized = extractPagedPayload(raw);
  return (
    normalized?.totalCount ||
    normalized?.data?.totalCount ||
    raw?.totalCount ||
    raw?.data?.totalCount ||
    raw?.data?.data?.totalCount ||
    raw?.data?.data?.data?.totalCount ||
    list.length ||
    0
  );
};

export const normalizeQueryKey = (prefix: string, params?: Record<string, any>) => {
  if (!params) return [prefix];
  const sortObject = (value: any): any => {
    if (Array.isArray(value)) return value.map(sortObject);
    if (value && typeof value === "object") {
      return Object.keys(value)
        .sort()
        .reduce((acc: Record<string, any>, key) => {
          acc[key] = sortObject(value[key]);
          return acc;
        }, {});
    }
    return value;
  };
  return [prefix, sortObject(params)];
};
