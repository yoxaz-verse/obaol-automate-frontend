"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { QUERY_KEYS, SESSION_STALE_TIME } from "./queryUtils";

export const useSessionQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.session,
    queryFn: () => getData("/verify-token"),
    staleTime: SESSION_STALE_TIME,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 0,
  });

