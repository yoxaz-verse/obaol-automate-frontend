"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { DEFAULT_STALE_TIME, extractCount, extractList, normalizeQueryKey } from "./queryUtils";

export const useEnquiries = (
  params: Record<string, any>,
  options: { enabled?: boolean; staleTime?: number } = {}
) => {
  return useQuery({
    queryKey: normalizeQueryKey("enquiries", params),
    queryFn: () => getData(apiRoutes.enquiry.getAll, params),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
    select: (response: any) => {
      const list = extractList(response);
      return {
        raw: response,
        list,
        total: extractCount(response, list),
      };
    },
  });
};
