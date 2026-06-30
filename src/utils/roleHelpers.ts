import {
  DASHBOARD_ROUTE_MANIFEST,
  canAccessDashboardRoute,
  getDashboardRoute,
  normalizeDashboardRole,
  type TradeMode,
} from "@/utils/dashboardAccess";

const displayRole = (role: string) => {
  if (role === "admin") return "Admin";
  if (role === "associate") return "Associate";
  if (role === "operator") return "Operator";
  return "team";
};

// Compatibility export for older table/form components. New dashboard access
// decisions must use canAccessDashboardRoute so unknown routes remain denied.
export const routeRoles: Record<string, string[]> = Object.fromEntries(
  DASHBOARD_ROUTE_MANIFEST.map((route) => [
    route.path,
    route.roles.map(displayRole),
  ])
);

export const getAllowedRoles = (pathname: string): string[] =>
  (getDashboardRoute(pathname)?.roles || []).map(displayRole);

export const isDashboardRouteAllowed = (
  pathname: string,
  role: unknown,
  tradeMode?: TradeMode | string | null
) => canAccessDashboardRoute({ path: pathname, role, tradeMode });

export { getDashboardRoute, normalizeDashboardRole };
