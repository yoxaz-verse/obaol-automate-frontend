"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { DASHBOARD_STALE_TIME, normalizeQueryKey } from "./queryUtils";

const emptyCompletedQuery = {
  isLoading: false,
  isError: false,
  isFetching: false,
  data: undefined,
};

export const useDashboardData = ({
  userId,
  roleLower,
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

  const summary = dashboardSummaryQuery.data?.data?.data || {};
  const metrics = summary?.metrics || {};
  const adminWidgets = summary?.adminWidgets || {};
  const approvals = summary?.approvals || {};
  const enquiries = Array.isArray(summary?.pendingActions) ? summary.pendingActions : [];
  const orders: any[] = [];
  const trendList = Array.isArray(adminWidgets?.enquiryTrends) ? adminWidgets.enquiryTrends : [];
  const topProducts = Array.isArray(adminWidgets?.topProducts) ? adminWidgets.topProducts : [];
  const summaryBackedQuery = {
    ...emptyCompletedQuery,
    isLoading: dashboardSummaryQuery.isLoading,
    isError: dashboardSummaryQuery.isError,
    isFetching: dashboardSummaryQuery.isFetching,
    data: dashboardSummaryQuery.data,
  };

  return {
    hasPrimarySummary,
    dashboardSummaryQuery,
    enquiriesQuery: summaryBackedQuery,
    ordersQuery: summaryBackedQuery,
    trendQuery: summaryBackedQuery,
    topProductsQuery: summaryBackedQuery,
    systemMetricsQuery: summaryBackedQuery,
    associateMetricsQuery: summaryBackedQuery,
    operatorMetricsQuery: summaryBackedQuery,
    approvalsAssociatesQuery: {
      ...emptyCompletedQuery,
      data: { data: { meta: { total: Number(approvals?.associates || 0) } } },
    },
    approvalsCompaniesQuery: {
      ...emptyCompletedQuery,
      data: { data: { meta: { total: Number(approvals?.companies || 0) } } },
    },
    summary,
    metrics,
    approvals,
    adminWidgets,
    enquiries,
    orders,
    trendList,
    topProducts,
    totalEnquiries: Number(summary?.totalEnquiries || metrics?.totalEnquiries || 0),
    totalOrders: Number(summary?.totalOrders || 0),
  };
};
