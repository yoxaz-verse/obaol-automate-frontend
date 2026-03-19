"use client";

export const DEFAULT_STALE_TIME = 45 * 1000;

export const extractList = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  if (Array.isArray(raw?.data?.data?.data)) return raw.data.data.data;
  return [];
};

export const extractCount = (raw: any, list: any[]) => {
  return (
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
  return [prefix, JSON.stringify(params)];
};
