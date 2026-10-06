import {
  getDashboardAdminGroups,
  getAccessibleDashboardRoutes,
  type DashboardSection,
  type DashboardNavGroup,
  type TradeMode,
  type DashboardTaskGroup,
  normalizeDashboardRole,
  normalizeTradeMode,
  isDashboardRouteActive,
} from "@/utils/dashboardAccess";

type SidebarOption = {
  name: string;
  icon: any;
  link: string;
};

const COMING_SOON_NAV_PATHS = new Set([
  "/dashboard/documents",
  "/dashboard/external-orders",
  "/dashboard/warehouse-rent",
]);

export const isComingSoonDashboardNavigation = (path: string, role: unknown) =>
  normalizeDashboardRole(role) !== "admin" && COMING_SOON_NAV_PATHS.has(path);

export type DashboardNavSection = {
  label: DashboardSection | DashboardTaskGroup;
  links: string[];
  groups?: Array<{ label: DashboardNavGroup; links: string[] }>;
};

export const getRoleFilteredSidebarOptions = (
  sidebarOptions: SidebarOption[],
  role: string,
  tradeMode?: TradeMode | string | null,
  companyInterests: string[] = []
): SidebarOption[] => {
  const allowedLinks = new Set(
    getAccessibleDashboardRoutes({ role, tradeMode, companyInterests }).map((route) => route.path)
  );
  return sidebarOptions.filter((option) => allowedLinks.has(option.link));
};

export const getDashboardSidebarSections = (
  filteredOptions: SidebarOption[],
  role: string = "admin",
  tradeMode?: TradeMode | string | null,
  companyInterests: string[] = []
): DashboardNavSection[] => {
  const optionMap = new Map(filteredOptions.map((option) => [option.link, option]));
  const accessibleRoutes = getAccessibleDashboardRoutes({
    role,
    tradeMode,
    companyInterests,
  });
  const normalizedRole = normalizeDashboardRole(role);
  const normalizedMode = normalizeTradeMode(tradeMode, role);

  if (normalizedRole === "associate") {
    const groupForRoute = (route: (typeof accessibleRoutes)[number]): DashboardTaskGroup => {
      if (route.taskGroup === "Execute" && normalizedMode === "BUY") return "Buy";
      return route.taskGroup;
    };
    const groupOrder: DashboardTaskGroup[] = [
      "Home",
      "Discover",
      ...(normalizedMode === "BUY" ? ["Buy" as const] : []),
      ...(normalizedMode === "SELL" || normalizedMode === "BOTH" ? ["Sell" as const] : []),
      "Execute",
      "Services",
      "Company & Account",
    ];

    return groupOrder
      .map((label) => ({
        label,
        links: accessibleRoutes
          .filter((route) => optionMap.has(route.path) && groupForRoute(route) === label)
          .map((route) => route.path),
      }))
      .filter((section) => section.links.length > 0);
  }
  const sectionOrder: DashboardSection[] = [
    "Overview",
    "Trade",
    "Products",
    "Services",
    "Organization",
    "Operations/Admin",
  ];

  return sectionOrder
    .map((section) => {
      const sectionRoutes = accessibleRoutes
        .filter((route) => route.section === section && optionMap.has(route.path))
      const links = sectionRoutes.map((route) => route.path);
      const groups = section === "Operations/Admin"
        ? getDashboardAdminGroups(sectionRoutes)
        : undefined;

      return { label: section, links, groups };
    })
    .filter((section) => section.links.length > 0);
};

const associateMobilePaths: Record<TradeMode, string[]> = {
  BUY: ["/dashboard", "/dashboard/marketplace", "/dashboard/enquiries", "/dashboard/orders"],
  SELL: ["/dashboard", "/dashboard/product", "/dashboard/enquiries", "/dashboard/orders"],
  BOTH: ["/dashboard", "/dashboard/marketplace", "/dashboard/product", "/dashboard/enquiries"],
  SERVICE: ["/dashboard", "/dashboard/execution-enquiries", "/dashboard/enquiries", "/dashboard/orders"],
};

export const getDashboardBottomNavigation = ({
  role,
  tradeMode,
  companyInterests = [],
}: {
  role: unknown;
  tradeMode?: unknown;
  companyInterests?: string[];
}) => {
  const routes = getAccessibleDashboardRoutes({ role, tradeMode, companyInterests });
  const routeMap = new Map(routes.map((route) => [route.path, route]));
  if (normalizeDashboardRole(role) === "associate") {
    return associateMobilePaths[normalizeTradeMode(tradeMode, role)]
      .map((path) => routeMap.get(path))
      .filter(Boolean);
  }
  return routes
    .filter((route) => route.mobilePriority)
    .sort((a, b) => Number(a.mobilePriority) - Number(b.mobilePriority))
    .slice(0, 4);
};

export const getActiveDashboardNavigationPath = (pathname: string, paths: string[]) =>
  paths.find((path) => isDashboardRouteActive(pathname, path)) || null;
