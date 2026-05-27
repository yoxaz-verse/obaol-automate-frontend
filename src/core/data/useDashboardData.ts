"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { DASHBOARD_STALE_TIME, extractCount, extractList, normalizeQueryKey } from "./queryUtils";

export const useDashboardData = ({
  userId,
  roleLower,
  isAdmin,
  isAssociate,
  isOperatorUser,
}: {
  userId: string;
  roleLower: string;
  isAdmin: boolean;
  isAssociate: boolean;
  isOperatorUser: boolean;
}) => {
  const dashboardSummaryQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-summary", { roleLower, userId }),
    queryFn: () => getData(apiRoutes.analytics.dashboardSummary, {}),
    enabled: !!userId,
    staleTime: DASHBOARD_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const hasPrimarySummary = Boolean(dashboardSummaryQuery.data);

  const enquiriesQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-enquiries-lite", { roleLower, userId }),
    queryFn: () => getData(apiRoutes.enquiry.getAll, { page: 1, limit: 10, sortBy: "updatedAt", sortOrder: "desc" }),
    enabled: !!userId && hasPrimarySummary,
    staleTime: DASHBOARD_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const ordersQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-orders-lite", { roleLower, userId }),
    queryFn: () => getData(apiRoutes.orders.getAll, { page: 1, limit: 10, sortBy: "updatedAt", sortOrder: "desc" }),
    enabled: !!userId && hasPrimarySummary,
    staleTime: DASHBOARD_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const trendQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-enquiry-trends", { roleLower }),
    queryFn: () => getData(apiRoutes.analytics.enquiryTrends, {}),
    enabled: !!userId && isAdmin && hasPrimarySummary,
    staleTime: DASHBOARD_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const topProductsQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-product-performance"),
    queryFn: () => getData(apiRoutes.analytics.productPerformance, { limit: 5 }),
    enabled: !!userId && isAdmin && hasPrimarySummary,
    staleTime: DASHBOARD_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const systemMetricsQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-system-metrics"),
    queryFn: () => getData(apiRoutes.analytics.systemMetrics, {}),
    enabled: !!userId && isAdmin && hasPrimarySummary,
    staleTime: DASHBOARD_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const associateMetricsQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-associate-metrics", { userId }),
    queryFn: () => getData(apiRoutes.analytics.associateMetrics, {}),
    enabled: !!userId && isAssociate && hasPrimarySummary,
    staleTime: DASHBOARD_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const operatorMetricsQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-operator-metrics", { userId, roleLower }),
    queryFn: () => getData(apiRoutes.analytics.operatorMetrics, {}),
    enabled: !!userId && isOperatorUser && hasPrimarySummary,
    staleTime: DASHBOARD_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const approvalsAssociatesQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-approvals-associates"),
    queryFn: () =>
      getData(apiRoutes.approvals.associatesList, {
        status: "PENDING_REVIEW",
        page: 1,
        limit: 1,
      }),
    enabled: !!userId && isAdmin && hasPrimarySummary,
    staleTime: DASHBOARD_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const approvalsCompaniesQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-approvals-companies"),
    queryFn: () =>
      getData(apiRoutes.approvals.companiesList, {
        status: "PENDING_REVIEW",
        page: 1,
        limit: 1,
      }),
    enabled: !!userId && isAdmin && hasPrimarySummary,
    staleTime: DASHBOARD_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const summary = dashboardSummaryQuery.data?.data?.data || {};
  const enquiries = extractList(enquiriesQuery.data);
  const orders = extractList(ordersQuery.data);
  const trendList = extractList(trendQuery.data);
  const topProducts = extractList(topProductsQuery.data);

  return {
    hasPrimarySummary,
    dashboardSummaryQuery,
    enquiriesQuery,
    ordersQuery,
    trendQuery,
    topProductsQuery,
    systemMetricsQuery,
    associateMetricsQuery,
    operatorMetricsQuery,
    approvalsAssociatesQuery,
    approvalsCompaniesQuery,
    summary,
    enquiries,
    orders,
    trendList,
    topProducts,
    totalEnquiries: Number(summary?.totalEnquiries || extractCount(enquiriesQuery.data, enquiries)),
    totalOrders: Number(summary?.totalOrders || extractCount(ordersQuery.data, orders)),
  };
};
