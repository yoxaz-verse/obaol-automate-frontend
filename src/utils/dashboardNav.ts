import {
  getDashboardAdminGroups,
  getAccessibleDashboardRoutes,
  type DashboardSection,
  type DashboardNavGroup,
  type DashboardTaskGroup,
  normalizeDashboardRole,
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
  capabilities: string[] = []
): SidebarOption[] => {
  const allowedLinks = new Set(
    getAccessibleDashboardRoutes({ role, capabilities }).map((route) => route.path)
  );
  return sidebarOptions.filter((option) => allowedLinks.has(option.link));
};

export const getDashboardSidebarSections = (
  filteredOptions: SidebarOption[],
  role: string = "admin",
  capabilities: string[] = []
): DashboardNavSection[] => {
  const optionMap = new Map(filteredOptions.map((option) => [option.link, option]));
  const accessibleRoutes = getAccessibleDashboardRoutes({
    role,
    capabilities,
  });
  const normalizedRole = normalizeDashboardRole(role);

  if (normalizedRole === "associate") {
    const groupForRoute = (route: (typeof accessibleRoutes)[number]): DashboardTaskGroup => {
      return route.taskGroup;
    };
    const groupOrder: DashboardTaskGroup[] = [
      "Home",
      "Discover",
      "Buy",
      "Sell",
      "Execute",
      "Services",
      "Company & Account",
      "Support",
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

export const getDashboardBottomNavigation = ({
  role,
  capabilities = [],
}: {
  role: unknown;
  capabilities?: string[];
}) => {
  const routes = getAccessibleDashboardRoutes({ role, capabilities });
  const routeMap = new Map(routes.map((route) => [route.path, route]));
  if (normalizeDashboardRole(role) === "associate") {
    const normalized = new Set(capabilities.map((item) => String(item).toLowerCase()));
    const priorityPath = normalized.has("selling")
      ? "/dashboard/product"
      : normalized.has("buying") || normalized.has("sourcing")
        ? "/dashboard/marketplace"
        : "/dashboard/execution-enquiries";
    return ["/dashboard", priorityPath, "/dashboard/enquiries", "/dashboard/orders"]
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
