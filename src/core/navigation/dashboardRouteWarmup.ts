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
