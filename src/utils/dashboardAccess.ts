export type DashboardRole = "admin" | "associate" | "operator" | "team";
export type TradeMode = "BUY" | "SELL" | "BOTH" | "SERVICE";
export type DashboardSection =
  | "Overview"
  | "Trade"
  | "Products"
  | "Services"
  | "Organization"
  | "Operations/Admin";

export type DashboardNavGroup =
  | "Team & Users"
  | "Governance"
  | "Documentation & Templates"
  | "Rules & Automation"
  | "Platform Setup";

export const DASHBOARD_ADMIN_GROUP_ORDER: DashboardNavGroup[] = [
  "Team & Users",
  "Governance",
  "Documentation & Templates",
  "Rules & Automation",
  "Platform Setup",
];

export type DashboardJourneyStage = "overview" | "discover" | "negotiate" | "sample" | "execute" | "service" | "organize" | "administer";
export type DashboardTaskGroup = "Home" | "Discover" | "Buy" | "Sell" | "Execute" | "Services" | "Company & Account" | "Support" | "Operations/Admin";

export type DashboardRouteDefinition = {
  path: string;
  label: string;
  section: DashboardSection;
  navGroup?: DashboardNavGroup;
  roles: DashboardRole[];
  tradeModes?: TradeMode[];
  nav?: boolean;
  searchable?: boolean;
  mobilePriority?: number;
  navIcon: string;
  taskGroup: DashboardTaskGroup;
  activeParent?: string;
  requiredInterests?: string[];
  hiddenFromAssociateNav?: boolean;
  description: string;
  breadcrumbParent?: string;
  primaryAction?: { label: string; href: string };
  journeyStage: DashboardJourneyStage;
  requiredApprovalStates: Array<"ONBOARDING" | "PENDING" | "APPROVED" | "REJECTED">;
  helpId: string;
};

type DashboardRouteInput = Omit<DashboardRouteDefinition, "description" | "journeyStage" | "requiredApprovalStates" | "helpId" | "navIcon" | "taskGroup"> & Partial<Pick<DashboardRouteDefinition, "description" | "journeyStage" | "requiredApprovalStates" | "helpId" | "navIcon" | "taskGroup">>;

const ALL_ASSOCIATE_MODES: TradeMode[] = ["BUY", "SELL", "BOTH", "SERVICE"];
const SELLING_MODES: TradeMode[] = ["SELL", "BOTH"];

const DASHBOARD_ROUTE_INPUTS: DashboardRouteInput[] = [
  { path: "/dashboard", label: "Dashboard", section: "Overview", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, mobilePriority: 1 },
  { path: "/dashboard/onboarding", label: "Onboarding", section: "Overview", roles: ["associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES },
  { path: "/dashboard/pending-approval", label: "Pending approval", section: "Overview", roles: ["associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES },
  { path: "/dashboard/rejected", label: "Access status", section: "Overview", roles: ["associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES },

  { path: "/dashboard/product", label: "My Trade Listings", section: "Products", roles: ["admin", "associate", "operator", "team"], tradeModes: SELLING_MODES, nav: true, searchable: true, mobilePriority: 4, primaryAction: { label: "Create trade listing", href: "/dashboard/product" } },
  { path: "/dashboard/catalog", label: "Commodity Directory", section: "Products", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, taskGroup: "Company & Account" },
  { path: "/dashboard/marketplace", label: "Trade Listings", section: "Products", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, mobilePriority: 2, journeyStage: "discover" },

  { path: "/dashboard/enquiries", label: "Enquiries", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, mobilePriority: 3, journeyStage: "negotiate" },
  { path: "/dashboard/enquiries/:id", label: "Enquiry details", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, breadcrumbParent: "/dashboard/enquiries", journeyStage: "negotiate" },
  { path: "/dashboard/sample-requests", label: "Sample Requests", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, journeyStage: "sample" },
  { path: "/dashboard/sample-requests/:id", label: "Sample request details", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, breadcrumbParent: "/dashboard/sample-requests", journeyStage: "sample" },
  { path: "/dashboard/orders", label: "Orders", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, mobilePriority: 5, journeyStage: "execute" },
  { path: "/dashboard/orders/:id", label: "Order details", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, breadcrumbParent: "/dashboard/orders", journeyStage: "execute" },
  { path: "/dashboard/documents", label: "Documents", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, journeyStage: "execute" },
  { path: "/dashboard/documents/:id", label: "Document details", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, breadcrumbParent: "/dashboard/documents", journeyStage: "execute" },
  { path: "/dashboard/commercial-documents", label: "Pure Documents", section: "Trade", roles: ["associate"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, journeyStage: "execute", requiredApprovalStates: ["APPROVED"] },
  { path: "/dashboard/commercial-documents/new", label: "New quotation or invoice", section: "Trade", roles: ["associate"], tradeModes: ALL_ASSOCIATE_MODES, breadcrumbParent: "/dashboard/commercial-documents", journeyStage: "execute", requiredApprovalStates: ["APPROVED"] },
  { path: "/dashboard/commercial-documents/:id", label: "Quotation or invoice", section: "Trade", roles: ["associate"], tradeModes: ALL_ASSOCIATE_MODES, breadcrumbParent: "/dashboard/commercial-documents", journeyStage: "execute", requiredApprovalStates: ["APPROVED"] },

  { path: "/dashboard/imports", label: "Imports", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, requiredInterests: ["SOURCING", "IMPORTING_DISTRIBUTION"] },
  { path: "/dashboard/external-orders", label: "External Orders", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },
  { path: "/dashboard/external-orders/new", label: "New external order", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES },
  { path: "/dashboard/execution-enquiries", label: "Execution Panel", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },
  { path: "/dashboard/warehouse-rent", label: "Warehouse Booking", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },
  { path: "/dashboard/quality-labs", label: "Quality Labs", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },
  { path: "/dashboard/quality-labs/location", label: "Quality lab location", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES },

  { path: "/dashboard/inventory", label: "Inventory", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: SELLING_MODES, nav: true, searchable: true },
  { path: "/dashboard/warehouses", label: "Warehouses", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: SELLING_MODES, nav: true, searchable: true },
  { path: "/dashboard/warehouses/location", label: "Warehouse location", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: SELLING_MODES },
  { path: "/dashboard/company", label: "My Company", section: "Organization", roles: ["associate"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, activeParent: "/dashboard/settings", hiddenFromAssociateNav: true },
  { path: "/dashboard/companies", label: "Companies", section: "Organization", roles: ["admin", "operator", "team"], nav: true, searchable: true },
  { path: "/dashboard/notifications", label: "Notifications", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, activeParent: "/dashboard/settings", hiddenFromAssociateNav: true },
  { path: "/dashboard/guidance", label: "Guidance", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, taskGroup: "Support" },
  { path: "/dashboard/settings", label: "Settings", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },
  { path: "/dashboard/profile", label: "Profile", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, searchable: true, activeParent: "/dashboard/settings" },

  { path: "/dashboard/operator/hierarchy", label: "Hierarchy", section: "Operations/Admin", navGroup: "Team & Users", roles: ["admin", "operator", "team"], nav: true, searchable: true },
  { path: "/dashboard/operator/team", label: "Team", section: "Operations/Admin", navGroup: "Team & Users", roles: ["admin", "operator", "team"], nav: true, searchable: true },
  { path: "/dashboard/operator/earnings", label: "Earnings", section: "Operations/Admin", navGroup: "Team & Users", roles: ["admin", "operator", "team"], nav: true, searchable: true },

  { path: "/dashboard/approvals", label: "Approvals", section: "Operations/Admin", navGroup: "Governance", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/reports", label: "Reports", section: "Operations/Admin", navGroup: "Governance", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/rate-interest", label: "Rate Interest", section: "Operations/Admin", navGroup: "Governance", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/payments", label: "Payment Rules", section: "Operations/Admin", navGroup: "Rules & Automation", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/documentation-rules", label: "Documentation Rules", section: "Operations/Admin", navGroup: "Documentation & Templates", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/documentation-preview", label: "Documentation Preview", section: "Operations/Admin", navGroup: "Documentation & Templates", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/documentation-templates", label: "Documentation Templates", section: "Operations/Admin", navGroup: "Documentation & Templates", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/email-templates", label: "Email Templates", section: "Operations/Admin", navGroup: "Documentation & Templates", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/flow-rules", label: "Flow Rules", section: "Operations/Admin", navGroup: "Rules & Automation", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/order-rules", label: "Order Rules", section: "Operations/Admin", navGroup: "Rules & Automation", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/enquiry-rules", label: "Enquiry Rules", section: "Operations/Admin", navGroup: "Rules & Automation", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/operators/overview", label: "Operator Overview", section: "Operations/Admin", navGroup: "Team & Users", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/users", label: "Users", section: "Operations/Admin", navGroup: "Team & Users", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/calculations", label: "Calculations", section: "Operations/Admin", navGroup: "Rules & Automation", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/function-preview", label: "Function Preview", section: "Operations/Admin", navGroup: "Platform Setup", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/essentials", label: "Essentials", section: "Operations/Admin", navGroup: "Platform Setup", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/geosphere", label: "Geo Sphere", section: "Operations/Admin", navGroup: "Platform Setup", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/customer-support", label: "Customer Support", section: "Operations/Admin", navGroup: "Platform Setup", roles: ["admin", "associate"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, taskGroup: "Support", description: "Contact OBAOL support or manage the support contacts available to associates.", navIcon: "support" },
  { path: "/dashboard/rates", label: "Rates", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/bulk", label: "Bulk Operations", section: "Operations/Admin", roles: ["admin"] },
  { path: "/dashboard/news", label: "News", section: "Operations/Admin", roles: ["admin"] },
  { path: "/dashboard/rsForm", label: "RS Form", section: "Operations/Admin", roles: ["admin"] },
  { path: "/dashboard/map", label: "Map", section: "Operations/Admin", roles: ["admin"] },

  { path: "/dashboard/shortcuts", label: "Keyboard Shortcuts", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, searchable: true, activeParent: "/dashboard/settings" },
];

const journeyStageBySection: Record<DashboardSection, DashboardJourneyStage> = {
  Overview: "overview",
  Trade: "execute",
  Products: "discover",
  Services: "service",
  Organization: "organize",
  "Operations/Admin": "administer",
};

const navIconByPath: Record<string, string> = {
  "/dashboard": "home",
  "/dashboard/marketplace": "marketplace",
  "/dashboard/catalog": "catalog",
  "/dashboard/product": "listings",
  "/dashboard/enquiries": "enquiries",
  "/dashboard/sample-requests": "samples",
  "/dashboard/orders": "orders",
  "/dashboard/documents": "documents",
  "/dashboard/commercial-documents": "documents",
  "/dashboard/inventory": "inventory",
  "/dashboard/warehouses": "warehouse",
  "/dashboard/execution-enquiries": "execution",
  "/dashboard/imports": "imports",
  "/dashboard/external-orders": "external-orders",
  "/dashboard/warehouse-rent": "warehouse",
  "/dashboard/quality-labs": "quality",
  "/dashboard/company": "company",
  "/dashboard/companies": "company",
  "/dashboard/notifications": "notifications",
  "/dashboard/guidance": "guidance",
  "/dashboard/settings": "settings",
  "/dashboard/profile": "profile",
  "/dashboard/shortcuts": "shortcuts",
  "/dashboard/customer-support": "support",
};

const defaultTaskGroup = (route: DashboardRouteInput): DashboardTaskGroup => {
  if (route.path === "/dashboard") return "Home";
  if (route.path === "/dashboard/marketplace") return "Discover";
  if (["/dashboard/product", "/dashboard/inventory", "/dashboard/warehouses"].includes(route.path)) return "Sell";
  if (["/dashboard/enquiries", "/dashboard/sample-requests", "/dashboard/orders", "/dashboard/documents", "/dashboard/commercial-documents"].includes(route.path)) return "Execute";
  if (route.section === "Services") return "Services";
  if (route.section === "Operations/Admin") return "Operations/Admin";
  return "Company & Account";
};

export const DASHBOARD_ROUTE_MANIFEST: DashboardRouteDefinition[] = DASHBOARD_ROUTE_INPUTS.map((route) => ({
  ...route,
  navIcon: route.navIcon || navIconByPath[route.path] || "default",
  taskGroup: route.taskGroup || defaultTaskGroup(route),
  activeParent: route.activeParent || route.breadcrumbParent,
  description: route.description || `Open ${route.label.toLowerCase()} and continue the work relevant to your role.`,
  journeyStage: route.journeyStage || journeyStageBySection[route.section],
  requiredApprovalStates: route.requiredApprovalStates || (
    route.path === "/dashboard/onboarding" ? ["ONBOARDING"]
      : route.path === "/dashboard/pending-approval" ? ["PENDING"]
        : route.path === "/dashboard/rejected" ? ["REJECTED"]
          : ["APPROVED"]
  ),
  helpId: route.helpId || route.path.replace(/^\/dashboard\/?/, "").replace(/[:/]/g, "-") || "overview",
}));

export const normalizeDashboardRole = (role: unknown): DashboardRole | null => {
  const normalized = String(role || "").trim().toLowerCase();
  if (normalized === "customer") return "associate";
  if (["admin", "associate", "operator", "team"].includes(normalized)) {
    return normalized as DashboardRole;
  }
  return null;
};

export const normalizeTradeMode = (mode: unknown, role?: unknown): TradeMode => {
  if (String(role || "").trim().toLowerCase() === "customer") return "BUY";
  const normalized = String(mode || "").trim().toUpperCase();
  return normalized === "BUY" || normalized === "SELL" || normalized === "BOTH" || normalized === "SERVICE"
    ? normalized
    : "BOTH";
};

const normalizePath = (path: string) => {
  const withoutQuery = String(path || "").split(/[?#]/)[0] || "/";
  return withoutQuery.length > 1 && withoutQuery.endsWith("/")
    ? withoutQuery.slice(0, -1)
    : withoutQuery;
};

const routeMatches = (pattern: string, path: string) => {
  const escaped = pattern
    .split("/")
    .map((segment) => (segment.startsWith(":") ? "[^/]+" : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    .join("/");
  return new RegExp(`^${escaped}$`).test(path);
};

export const getDashboardRoute = (path: string) => {
  const normalized = normalizePath(path);
  return DASHBOARD_ROUTE_MANIFEST.find((route) => routeMatches(route.path, normalized)) || null;
};

export const isDashboardRouteActive = (pathname: string, routePath: string) => {
  const current = getDashboardRoute(pathname);
  if (!current) return false;
  if (routePath === "/dashboard") return current.path === "/dashboard";
  return current.path === routePath || current.activeParent === routePath || current.breadcrumbParent === routePath;
};

export const canAccessDashboardRoute = ({
  path,
  role,
  tradeMode,
}: {
  path: string;
  role: unknown;
  tradeMode?: unknown;
}) => {
  const route = getDashboardRoute(path);
  const normalizedRole = normalizeDashboardRole(role);
  if (!route || !normalizedRole || !route.roles.includes(normalizedRole)) return false;
  if (normalizedRole !== "associate" || !route.tradeModes?.length) return true;
  return route.tradeModes.includes(normalizeTradeMode(tradeMode, role));
};

export const getAccessibleDashboardRoutes = ({
  role,
  tradeMode,
  companyInterests = [],
}: {
  role: unknown;
  tradeMode?: unknown;
  companyInterests?: string[];
}) => {
  const normalizeInterest = (item: unknown) => {
    const token = String(item || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
    if (["WAREHOUSING", "WAREHOUSE"].includes(token)) return "WAREHOUSE_STORAGE";
    if (["PROCUREMENT", "PROCUREMENT_PARTNER"].includes(token)) return "SOURCING";
    return token;
  };
  const normalizedInterests = new Set(companyInterests.map(normalizeInterest));
  return DASHBOARD_ROUTE_MANIFEST.filter((route) => {
    if (!route.nav || !canAccessDashboardRoute({ path: route.path, role, tradeMode })) return false;
    if (route.hiddenFromAssociateNav && normalizeDashboardRole(role) === "associate") return false;
    if (!route.requiredInterests?.length || normalizeDashboardRole(role) !== "associate") return true;
    return route.requiredInterests.some((interest) => normalizedInterests.has(interest));
  });
};

export const getDashboardAdminGroups = (routes: DashboardRouteDefinition[]) =>
  DASHBOARD_ADMIN_GROUP_ORDER
    .map((label) => ({
      label,
      links: routes
        .filter((route) => route.section === "Operations/Admin" && route.navGroup === label)
        .map((route) => route.path),
    }))
    .filter((group) => group.links.length > 0);
