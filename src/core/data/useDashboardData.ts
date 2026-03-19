"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { DEFAULT_STALE_TIME, extractCount, extractList, normalizeQueryKey } from "./queryUtils";

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
  const enquiriesQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-enquiries", { roleLower, userId }),
    queryFn: () => getData(apiRoutes.enquiry.getAll, { page: 1, limit: 50 }),
    enabled: !!userId,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const ordersQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-orders", { roleLower, userId }),
    queryFn: () => getData(apiRoutes.orders.getAll, { page: 1, limit: 50 }),
    enabled: !!userId,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const trendQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-enquiry-trends"),
    queryFn: () => getData(apiRoutes.analytics.enquiryTrends, {}),
    enabled: !!userId && isAdmin,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const topProductsQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-product-performance"),
    queryFn: () => getData(apiRoutes.analytics.productPerformance, { limit: 5 }),
    enabled: !!userId && isAdmin,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const systemMetricsQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-system-metrics"),
    queryFn: () => getData(apiRoutes.analytics.systemMetrics, {}),
    enabled: !!userId && isAdmin,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const associateMetricsQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-associate-metrics", { userId }),
    queryFn: () => getData(apiRoutes.analytics.associateMetrics, {}),
    enabled: !!userId && isAssociate,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const operatorMetricsQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-operator-metrics", { userId, roleLower }),
    queryFn: () => getData(apiRoutes.analytics.operatorMetrics, {}),
    enabled: !!userId && isOperatorUser,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const approvalsAssociatesQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-approvals-associates"),
    queryFn: () =>
      getData(apiRoutes.approvals.associatesList, {
        status: "PENDING_REVIEW",
        page: 1,
        limit: 1,
      }),
    enabled: !!userId && isAdmin,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const approvalsCompaniesQuery = useQuery({
    queryKey: normalizeQueryKey("dashboard-approvals-companies"),
    queryFn: () =>
      getData(apiRoutes.approvals.companiesList, {
        status: "PENDING_REVIEW",
        page: 1,
        limit: 1,
      }),
    enabled: !!userId && isAdmin,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const enquiries = extractList(enquiriesQuery.data);
  const orders = extractList(ordersQuery.data);
  const trendList = extractList(trendQuery.data);
  const topProducts = extractList(topProductsQuery.data);

  return {
    enquiriesQuery,
    ordersQuery,
    trendQuery,
    topProductsQuery,
    systemMetricsQuery,
    associateMetricsQuery,
    operatorMetricsQuery,
    approvalsAssociatesQuery,
    approvalsCompaniesQuery,
    enquiries,
    orders,
    trendList,
    topProducts,
    totalEnquiries: extractCount(enquiriesQuery.data, enquiries),
    totalOrders: extractCount(ordersQuery.data, orders),
  };
};
