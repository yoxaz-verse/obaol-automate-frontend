"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { DEFAULT_STALE_TIME, extractCount, extractList, normalizeQueryKey } from "./queryUtils";

const selectPagedResponse = (response: any) => {
  const list = extractList(response);
  return { raw: response, list, total: extractCount(response, list) };
};

export const importsQueryOptions = (
  params: Record<string, any>,
  options: { staleTime?: number } = {},
) => ({
  queryKey: normalizeQueryKey("imports", params),
  queryFn: () => getData(apiRoutes.imports.list, params),
  staleTime: options.staleTime ?? DEFAULT_STALE_TIME,
  refetchOnWindowFocus: false,
  select: selectPagedResponse,
});

export const importReservationsQueryOptions = (
  params: Record<string, any>,
  options: { staleTime?: number } = {},
) => ({
  queryKey: normalizeQueryKey("import-reservations", params),
  queryFn: () => getData(apiRoutes.importReservations.list, params),
  staleTime: options.staleTime ?? DEFAULT_STALE_TIME,
  refetchOnWindowFocus: false,
  select: selectPagedResponse,
});

export const useImportsList = (
  params: Record<string, any>,
  options: { enabled?: boolean; staleTime?: number } = {}
) => {
  return useQuery({
    ...importsQueryOptions(params, options),
    enabled: options.enabled ?? true,
  });
};

export const useImportReservations = (
  params: Record<string, any>,
  options: { enabled?: boolean; staleTime?: number } = {}
) => {
  return useQuery({
    ...importReservationsQueryOptions(params, options),
    enabled: options.enabled ?? true,
  });
};
