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
import type { ResolvedSidebarPage } from "@/types/sidebarGovernance";
import { getGovernedRouteStatus, SIDEBAR_COMMON_ROUTES } from "@/utils/sidebarGovernance";

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
  capabilities: string[] = [],
  governedPages?: ResolvedSidebarPage[],
) => {
  if (normalizeDashboardRole(role) === "associate" && governedPages) return getGovernedRouteStatus(governedPages, path) === "COMING_SOON";
  if (isWarehouseDashboardPath(path)) return !hasWarehouseWorkspaceAccess(role, capabilities);
  return normalizeDashboardRole(role) !== "admin" && COMING_SOON_NAV_PATHS.has(path);
};

export type DashboardNavSection = {
  label: DashboardSection | DashboardTaskGroup | "Common" | "Seeking" | "Providing" | "Other Services" | "Coming Soon";
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
  "/dashboard/imports/my-listings",
  "/dashboard/imports/reservations",
  "/dashboard/external-orders",
  "/dashboard/inventory",
  "/dashboard/warehouses",
  "/dashboard/warehouses/operations",
  "/dashboard/warehouse-rent",
  "/dashboard/quality-labs",
  "/dashboard/quality-labs/my",
  "/dashboard/quality-labs/execution",
]);

export const getRoleFilteredSidebarOptions = (
  sidebarOptions: SidebarOption[],
  role: string,
  capabilities: string[] = [],
  governedPages?: ResolvedSidebarPage[],
): SidebarOption[] => {
  const allowedLinks = new Set(
    getAccessibleDashboardRoutes({ role, capabilities }).map((route) => route.path)
  );
  return sidebarOptions.filter((option) => allowedLinks.has(option.link) && (
    normalizeDashboardRole(role) !== "associate" || !governedPages || getGovernedRouteStatus(governedPages, option.link) !== "HIDDEN"
  ));
};

export const getDashboardSidebarSections = (
  filteredOptions: SidebarOption[],
  role: string = "admin",
  capabilities: string[] = [],
  providedCapabilities: string[] = [],
  soughtCapabilities: string[] = [],
  governedPages?: ResolvedSidebarPage[],
): DashboardNavSection[] => {
  const optionMap = new Map(filteredOptions.map((option) => [option.link, option]));
  const accessibleRoutes = getAccessibleDashboardRoutes({
    role,
    capabilities,
  });
  const normalizedRole = normalizeDashboardRole(role);

  if (normalizedRole === "associate") {
    if (governedPages) {
      const visible = governedPages.filter((row) => row.status !== "HIDDEN" && optionMap.has(row.routePath));
      const links = (placement: "SEEKING" | "PROVIDING" | "OTHER_SERVICES") => visible
        .filter((row) => row.placement === placement)
        .sort((a, b) => a.order - b.order)
        .map((row) => row.routePath);
      return [
        { label: "Common", links: SIDEBAR_COMMON_ROUTES.filter((path) => optionMap.has(path)) },
        { label: "Seeking", links: links("SEEKING") },
        { label: "Providing", links: links("PROVIDING") },
        { label: "Other Services", links: links("OTHER_SERVICES") },
      ].filter((section) => section.links.length > 0) as DashboardNavSection[];
    }
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
      { label: "Common", links: SIDEBAR_COMMON_ROUTES.filter((path) => accessiblePathSet.has(path)) },
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
        links: linksForTaskGroup("Company & Account").filter((path) => !selectedCapabilityLinks.has(path) && !(SIDEBAR_COMMON_ROUTES as readonly string[]).includes(path)),
      },
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
