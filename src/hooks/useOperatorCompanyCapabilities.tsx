"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { operatorHierarchyRoutes } from "@/core/api/apiRoutes";
import { EMPTY_OPERATOR_CAPABILITY_SUMMARY, type OperatorCapabilitySummary } from "@/utils/operatorNavigationCapabilities";

type Value = {
  isOperatorFamily: boolean;
  isLoading: boolean;
  isError: boolean;
  summary: OperatorCapabilitySummary;
  refresh: () => Promise<unknown>;
};

const Context = createContext<Value | null>(null);

export const OperatorCompanyCapabilitiesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const role = String(user?.role || "").toLowerCase();
  const isOperatorFamily = role === "operator" || role === "team";
  const query = useQuery({
    queryKey: ["operator-company-capabilities", user?.id],
    queryFn: async () => (await getData(operatorHierarchyRoutes.capabilities(String(user?.id)))).data.data as OperatorCapabilitySummary,
    enabled: isOperatorFamily && Boolean(user?.id),
    staleTime: 60_000,
    retry: 1,
  });
  const value = useMemo<Value>(() => ({
    isOperatorFamily,
    isLoading: query.isLoading,
    isError: query.isError,
    summary: query.data || EMPTY_OPERATOR_CAPABILITY_SUMMARY,
    refresh: query.refetch,
  }), [isOperatorFamily, query.data, query.isError, query.isLoading, query.refetch]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useOperatorCompanyCapabilities = () => {
  const value = useContext(Context);
  if (!value) throw new Error("useOperatorCompanyCapabilities must be used inside OperatorCompanyCapabilitiesProvider.");
  return value;
};
