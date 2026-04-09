"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { DEFAULT_STALE_TIME, extractList, normalizeQueryKey } from "@/core/data/queryUtils";

type FunctionMetrics = {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
};

type FunctionRow = {
  _id: string;
  name: string;
  slug: string;
  orderIndex?: number;
};

type FunctionMetricsRow = {
  functionId: string;
  name: string;
  slug: string;
  orderIndex?: number;
  metrics: FunctionMetrics;
  recentExecutionInquiries?: any[];
  recentOrders?: any[];
};

const emptyMetrics: FunctionMetrics = {
  total: 0,
  open: 0,
  inProgress: 0,
  completed: 0,
};

export const useCompanyFunctionDashboard = ({
  companyId,
  isAdmin,
}: {
  companyId?: string;
  isAdmin: boolean;
}) => {
  const canLoad = Boolean(companyId);

  const companyQuery = useQuery({
    queryKey: normalizeQueryKey("company-function-dashboard-company", { companyId }),
    queryFn: () => getData(`${apiRoutes.associateCompany.getAll}/${companyId}`),
    enabled: canLoad,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const functionsQuery = useQuery({
    queryKey: normalizeQueryKey("company-function-dashboard-functions"),
    queryFn: () => getData(apiRoutes.companyFunction.getAll, { page: 1, limit: 200, sort: "orderIndex:asc" }),
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const componentsQuery = useQuery({
    queryKey: normalizeQueryKey("company-function-dashboard-components", { companyId, scope: isAdmin ? "admin" : "associate" }),
    queryFn: () =>
      getData(
        apiRoutes.analytics.companyFunctionComponents,
        isAdmin ? { companyId } : {}
      ),
    enabled: canLoad,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const company = companyQuery.data?.data?.data || companyQuery.data?.data || null;
  const functions = extractList(functionsQuery.data) as FunctionRow[];
  const metrics = extractList(componentsQuery.data) as FunctionMetricsRow[];

  const orderedFunctions = useMemo(() => {
    if (!company) return [];

    const priorityIds = Array.isArray(company?.companyFunctionPriorities)
      ? company.companyFunctionPriorities.map((id: any) => String(id))
      : [];
    const capabilitySlugs = Array.isArray(company?.serviceCapabilities)
      ? company.serviceCapabilities.map((slug: any) => String(slug || "").toLowerCase())
      : [];

    const byId = new Map(functions.map((fn) => [String(fn._id), fn]));
    const bySlug = new Map(functions.map((fn) => [String(fn.slug || "").toLowerCase(), fn]));

    const prioritized = priorityIds
      .map((id) => byId.get(id))
      .filter(Boolean) as FunctionRow[];

    const remaining = capabilitySlugs
      .map((slug) => bySlug.get(slug))
      .filter((fn): fn is FunctionRow => Boolean(fn))
      .filter((fn) => !prioritized.find((p) => String(p._id) === String(fn._id)))
      .sort((a, b) => Number(a.orderIndex || 0) - Number(b.orderIndex || 0));

    return [...prioritized, ...remaining];
  }, [company, functions]);

  const metricsById = useMemo(() => {
    const map = new Map<string, FunctionMetricsRow>();
    metrics.forEach((row) => {
      map.set(String(row.functionId), row);
      if (row.slug) map.set(String(row.slug).toLowerCase(), row as any);
    });
    return map;
  }, [metrics]);

  const enrichedFunctions = useMemo(() => {
    return orderedFunctions.map((fn) => {
      const priorityIds = Array.isArray(company?.companyFunctionPriorities)
        ? company.companyFunctionPriorities.map((id: any) => String(id))
        : [];
      const priorityIndex = priorityIds.indexOf(String(fn._id));
      const metricsRow =
        metricsById.get(String(fn._id)) || metricsById.get(String(fn.slug || "").toLowerCase());

      return {
        ...fn,
        priorityRank: priorityIndex >= 0 ? priorityIndex + 1 : null,
        metrics: metricsRow?.metrics || { ...emptyMetrics },
        recentExecutionInquiries: metricsRow?.recentExecutionInquiries || [],
        recentOrders: metricsRow?.recentOrders || [],
      };
    });
  }, [company, orderedFunctions, metricsById]);

  return {
    company,
    orderedFunctions: enrichedFunctions,
    isLoading: companyQuery.isLoading || functionsQuery.isLoading || componentsQuery.isLoading,
    isError: companyQuery.isError || functionsQuery.isError || componentsQuery.isError,
  };
};
