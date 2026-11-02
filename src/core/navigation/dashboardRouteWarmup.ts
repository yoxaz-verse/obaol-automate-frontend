import type { QueryClient } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";

type WarmupContext = { queryClient: QueryClient; role?: string };
type RouteWarmup = (context: WarmupContext) => Promise<unknown> | void;

const queryComponentKey = (name: string, page = 1, limit = 20) => [name, page, limit, "", {}] as const;

const warmMarketplace: RouteWarmup = async ({ queryClient, role }) => {
  const marketplace = await import("@/core/data/useMarketplace");
  await Promise.all([
    queryClient.prefetchQuery(marketplace.marketplaceFirstPageQueryOptions()),
    queryClient.prefetchQuery(marketplace.marketplaceVisibilityQueryOptions()),
    ...(String(role || "").toLowerCase() === "admin"
      ? [queryClient.prefetchQuery(marketplace.marketplaceStatsQueryOptions())]
      : []),
  ]);
};

const firstPage = (url: string, queryKey: readonly unknown[], params: Record<string, unknown> = {}) =>
  ({
    queryKey,
    queryFn: () => getData(url, { page: 1, limit: 25, ...params }),
    staleTime: 30_000,
  });

export const DASHBOARD_ROUTE_WARMUPS: Readonly<Record<string, RouteWarmup | undefined>> = {
  "/dashboard": undefined,
  "/dashboard/marketplace": warmMarketplace,
  "/dashboard/inventory": undefined,
  "/dashboard/enquiries": ({ queryClient }) => queryClient.prefetchQuery({
    queryKey: queryComponentKey("enquiry"),
    queryFn: () => getData(apiRoutes.enquiry.getAll, { page: 1, limit: 20 }),
    staleTime: 30_000,
  }),
  "/dashboard/orders": ({ queryClient }) => queryClient.prefetchQuery({
    queryKey: queryComponentKey("orders"),
    queryFn: () => getData(apiRoutes.orders.getAll, { page: 1, limit: 20 }),
    staleTime: 30_000,
  }),
  "/dashboard/profile": undefined,
  "/dashboard/users": ({ queryClient }) => queryClient.prefetchQuery({
    queryKey: ["customer-support-agents"],
    queryFn: async () => (await getData(apiRoutes.customerSupportAgents.list, {}, { cacheMode: "bypass" })).data?.data || [],
    staleTime: 30_000,
  }),
  // Company-directory cache keys include the authenticated user id. Code is
  // still prefetched by the router; data is left to the page to avoid a
  // duplicate request under a non-matching cache key.
  "/dashboard/companies": undefined,
  "/dashboard/operators/overview": ({ queryClient }) => queryClient.prefetchQuery(firstPage(
    apiRoutes.operator.getAll,
    ["operator-overview", "operators"],
    { limit: 200, sort: "name:asc" },
  )),
  "/dashboard/approvals": ({ queryClient }) => {
    const count = (route: string) => async () => {
      const response = await getData(route, { status: "PENDING_REVIEW", limit: 1 });
      return Number(response?.data?.meta?.total ?? response?.data?.data?.length ?? 0);
    };
    return Promise.all([
      queryClient.prefetchQuery({ queryKey: ["approval-summary", "associates"], queryFn: count(apiRoutes.approvals.associatesList), staleTime: 30_000 }),
      queryClient.prefetchQuery({ queryKey: ["approval-summary", "companies"], queryFn: count(apiRoutes.approvals.companiesList), staleTime: 30_000 }),
      queryClient.prefetchQuery({ queryKey: ["approval-summary", "operators"], queryFn: count(apiRoutes.approvals.operatorsList), staleTime: 30_000 }),
    ]);
  },
};

const warmedDataRoutes = new Set<string>();

export function canWarmDashboardRoute() {
  if (typeof document === "undefined" || document.visibilityState !== "visible") return false;
  if (window.matchMedia?.("(prefers-reduced-data: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !connection?.saveData && !["slow-2g", "2g"].includes(String(connection?.effectiveType || ""));
}

export function warmDashboardRoute(path: string, context: WarmupContext) {
  const normalizedPath = path.split("?")[0];
  if (!canWarmDashboardRoute() || warmedDataRoutes.has(normalizedPath)) return;
  const warm = DASHBOARD_ROUTE_WARMUPS[normalizedPath];
  if (!warm) return;
  warmedDataRoutes.add(normalizedPath);
  Promise.resolve(warm(context)).catch(() => warmedDataRoutes.delete(normalizedPath));
}
