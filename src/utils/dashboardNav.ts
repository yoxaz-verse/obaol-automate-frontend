import {
  getDashboardAdminGroups,
  getAccessibleDashboardRoutes,
  type DashboardSection,
  type DashboardNavGroup,
  type DashboardTaskGroup,
  normalizeDashboardRole,
  isDashboardRouteActive,
  hasWarehouseWorkspaceAccess,
  isWarehouseDashboardPath,
} from "@/utils/dashboardAccess";
import { getCapabilityActionLinks } from "@/utils/companyFunctionPreview";

export { hasWarehouseWorkspaceAccess, isWarehouseDashboardPath } from "@/utils/dashboardAccess";

type SidebarOption = {
  name: string;
  icon: any;
  link: string;
};

const COMING_SOON_NAV_PATH_ORDER = [
  "/dashboard/documents",
  "/dashboard/commercial-documents",
  "/dashboard/external-orders",
] as const;

const COMING_SOON_NAV_PATHS = new Set<string>(COMING_SOON_NAV_PATH_ORDER);

export const isComingSoonDashboardNavigation = (
  path: string,
  role: unknown,
  capabilities: string[] = []
) => {
  if (isWarehouseDashboardPath(path)) return !hasWarehouseWorkspaceAccess(role, capabilities);
  return normalizeDashboardRole(role) !== "admin" && COMING_SOON_NAV_PATHS.has(path);
};

export type DashboardNavSection = {
  label: DashboardSection | DashboardTaskGroup | "Seeking" | "Providing" | "Other Services" | "Coming Soon";
  links: string[];
  groups?: Array<{ label: DashboardNavGroup; links: string[] }>;
};

const ASSOCIATE_EXECUTE_PATHS = [
  "/dashboard/enquiries",
  "/dashboard/sample-requests",
  "/dashboard/orders",
  "/dashboard/documents",
  "/dashboard/commercial-documents",
  "/dashboard/execution-enquiries",
];

const ASSOCIATE_OTHER_SERVICE_PATHS = new Set([
  "/dashboard/imports",
  "/dashboard/external-orders",
  "/dashboard/inventory",
  "/dashboard/warehouses",
  "/dashboard/warehouse-rent",
  "/dashboard/quality-labs",
]);

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
  capabilities: string[] = [],
  providedCapabilities: string[] = [],
  soughtCapabilities: string[] = [],
): DashboardNavSection[] => {
  const optionMap = new Map(filteredOptions.map((option) => [option.link, option]));
  const accessibleRoutes = getAccessibleDashboardRoutes({
    role,
    capabilities,
  });
  const normalizedRole = normalizeDashboardRole(role);

  if (normalizedRole === "associate") {
    const accessiblePathSet = new Set(
      accessibleRoutes.filter((route) => optionMap.has(route.path)).map((route) => route.path)
    );
    const executePathSet = new Set(ASSOCIATE_EXECUTE_PATHS);
    const reservedPathSet = new Set(
      accessibleRoutes
        .filter((route) => ["Home", "Support"].includes(route.taskGroup))
        .map((route) => route.path)
    );

    const capabilityLinks = (
      selectedCapabilities: string[],
      perspective: "provided" | "sought",
    ) => {
      return getCapabilityActionLinks(selectedCapabilities, perspective).filter((path) => (
        accessiblePathSet.has(path) &&
        !executePathSet.has(path) &&
        !reservedPathSet.has(path)
      ));
    };

    const seekingLinks = capabilityLinks(soughtCapabilities, "sought");
    const providingLinks = capabilityLinks(providedCapabilities, "provided");
    const selectedCapabilityLinks = new Set([...seekingLinks, ...providingLinks]);
    const linksForTaskGroup = (taskGroup: DashboardTaskGroup) => accessibleRoutes
      .filter((route) => optionMap.has(route.path) && route.taskGroup === taskGroup)
      .map((route) => route.path);

    const associateSections: DashboardNavSection[] = [
      { label: "Home", links: linksForTaskGroup("Home") },
      { label: "Seeking", links: seekingLinks },
      { label: "Providing", links: providingLinks },
      { label: "Execute", links: ASSOCIATE_EXECUTE_PATHS.filter((path) => accessiblePathSet.has(path) && !COMING_SOON_NAV_PATHS.has(path)) },
      {
        label: "Other Services",
        links: accessibleRoutes
          .filter((route) => optionMap.has(route.path))
          .map((route) => route.path)
          .filter((path) => ASSOCIATE_OTHER_SERVICE_PATHS.has(path) && !selectedCapabilityLinks.has(path) && !COMING_SOON_NAV_PATHS.has(path)),
      },
      {
        label: "Company & Account",
        links: linksForTaskGroup("Company & Account").filter((path) => !selectedCapabilityLinks.has(path)),
      },
      { label: "Support", links: linksForTaskGroup("Support") },
      { label: "Coming Soon", links: COMING_SOON_NAV_PATH_ORDER.filter((path) => accessiblePathSet.has(path)) },
    ];
    return associateSections.filter((section) => section.links.length > 0);
  }
  const sectionOrder: DashboardSection[] = [
    "Overview",
    "Trade",
    "Products",
    "Services",
    "Warehouse",
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
  providedCapabilities = [],
  soughtCapabilities = [],
}: {
  role: unknown;
  capabilities?: string[];
  providedCapabilities?: string[];
  soughtCapabilities?: string[];
}) => {
  const combinedCapabilities = Array.from(new Set([...capabilities, ...providedCapabilities, ...soughtCapabilities]));
  const routes = getAccessibleDashboardRoutes({ role, capabilities: combinedCapabilities });
  const routeMap = new Map(routes.map((route) => [route.path, route]));
  if (normalizeDashboardRole(role) === "associate") {
    const provided = new Set(providedCapabilities.map((item) => String(item).toLowerCase()));
    const sought = new Set(soughtCapabilities.map((item) => String(item).toLowerCase()));
    const normalized = new Set(combinedCapabilities.map((item) => String(item).toLowerCase()));
    const priorityPath = provided.has("seller") || sought.has("buyer")
      ? "/dashboard/product"
      : provided.has("buyer") || sought.has("seller") || normalized.has("sourcing")
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
