export type DashboardRole = "admin" | "associate" | "operator" | "team";
export type TradeMode = "BUY" | "SELL" | "BOTH" | "SERVICE";
export type DashboardSection =
  | "Overview"
  | "Trade"
  | "Products"
  | "Services"
  | "Organization"
  | "Operations/Admin";

export type DashboardJourneyStage = "overview" | "discover" | "negotiate" | "sample" | "execute" | "service" | "organize" | "administer";

export type DashboardRouteDefinition = {
  path: string;
  label: string;
  section: DashboardSection;
  roles: DashboardRole[];
  tradeModes?: TradeMode[];
  nav?: boolean;
  searchable?: boolean;
  mobilePriority?: number;
  requiredInterests?: string[];
  description: string;
  breadcrumbParent?: string;
  primaryAction?: { label: string; href: string };
  journeyStage: DashboardJourneyStage;
  requiredApprovalStates: Array<"ONBOARDING" | "PENDING" | "APPROVED" | "REJECTED">;
  helpId: string;
};

type DashboardRouteInput = Omit<DashboardRouteDefinition, "description" | "journeyStage" | "requiredApprovalStates" | "helpId"> & Partial<Pick<DashboardRouteDefinition, "description" | "journeyStage" | "requiredApprovalStates" | "helpId">>;

const ALL_ASSOCIATE_MODES: TradeMode[] = ["BUY", "SELL", "BOTH", "SERVICE"];
const SELLING_MODES: TradeMode[] = ["SELL", "BOTH"];

const DASHBOARD_ROUTE_INPUTS: DashboardRouteInput[] = [
  { path: "/dashboard", label: "Dashboard", section: "Overview", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, mobilePriority: 1 },
  { path: "/dashboard/onboarding", label: "Onboarding", section: "Overview", roles: ["associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES },
  { path: "/dashboard/pending-approval", label: "Pending approval", section: "Overview", roles: ["associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES },
  { path: "/dashboard/rejected", label: "Access status", section: "Overview", roles: ["associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES },

  { path: "/dashboard/product", label: "My Products", section: "Products", roles: ["admin", "associate", "operator", "team"], tradeModes: SELLING_MODES, nav: true, searchable: true, mobilePriority: 4, primaryAction: { label: "Add product", href: "/dashboard/product" } },
  { path: "/dashboard/catalog", label: "Global Catalog", section: "Products", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },
  { path: "/dashboard/marketplace", label: "Marketplace", section: "Products", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, mobilePriority: 2, journeyStage: "discover" },

  { path: "/dashboard/enquiries", label: "Enquiries", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, mobilePriority: 3, journeyStage: "negotiate" },
  { path: "/dashboard/enquiries/:id", label: "Enquiry details", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, breadcrumbParent: "/dashboard/enquiries", journeyStage: "negotiate" },
  { path: "/dashboard/sample-requests", label: "Sample Requests", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, journeyStage: "sample" },
  { path: "/dashboard/sample-requests/:id", label: "Sample request details", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, breadcrumbParent: "/dashboard/sample-requests", journeyStage: "sample" },
  { path: "/dashboard/orders", label: "Orders", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, mobilePriority: 5, journeyStage: "execute" },
  { path: "/dashboard/orders/:id", label: "Order details", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, breadcrumbParent: "/dashboard/orders", journeyStage: "execute" },
  { path: "/dashboard/documents", label: "Documents", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, journeyStage: "execute" },
  { path: "/dashboard/documents/:id", label: "Document details", section: "Trade", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, breadcrumbParent: "/dashboard/documents", journeyStage: "execute" },

  { path: "/dashboard/imports", label: "Imports", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, requiredInterests: ["PROCUREMENT", "IMPORTING_DISTRIBUTION"] },
  { path: "/dashboard/external-orders", label: "External Orders", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },
  { path: "/dashboard/external-orders/new", label: "New external order", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES },
  { path: "/dashboard/execution-enquiries", label: "Execution Panel", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },
  { path: "/dashboard/warehouse-rent", label: "Warehouse Booking", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, requiredInterests: ["WAREHOUSING"] },
  { path: "/dashboard/quality-labs", label: "Quality Labs", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true, requiredInterests: ["QUALITY_TESTING", "CERTIFICATION"] },
  { path: "/dashboard/quality-labs/location", label: "Quality lab location", section: "Services", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES },

  { path: "/dashboard/inventory", label: "Inventory", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: SELLING_MODES, nav: true, searchable: true },
  { path: "/dashboard/warehouses", label: "Warehouses", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: SELLING_MODES, nav: true, searchable: true },
  { path: "/dashboard/warehouses/location", label: "Warehouse location", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: SELLING_MODES },
  { path: "/dashboard/company", label: "My Company", section: "Organization", roles: ["associate"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },
  { path: "/dashboard/companies", label: "Companies", section: "Organization", roles: ["admin", "operator", "team"], nav: true, searchable: true },
  { path: "/dashboard/notifications", label: "Notifications", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },
  { path: "/dashboard/guidance", label: "Guidance", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },
  { path: "/dashboard/profile", label: "Profile", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },

  { path: "/dashboard/operator/hierarchy", label: "Hierarchy", section: "Operations/Admin", roles: ["admin", "operator", "team"], nav: true, searchable: true },
  { path: "/dashboard/operator/team", label: "Team", section: "Operations/Admin", roles: ["admin", "operator", "team"], nav: true, searchable: true },
  { path: "/dashboard/operator/earnings", label: "Earnings", section: "Operations/Admin", roles: ["admin", "operator", "team"], nav: true, searchable: true },

  { path: "/dashboard/approvals", label: "Approvals", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/reports", label: "Reports", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/payments", label: "Payment Rules", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/documentation-rules", label: "Documentation Rules", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/documentation-preview", label: "Documentation Preview", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/documentation-templates", label: "Documentation Templates", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/email-templates", label: "Email Templates", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/flow-rules", label: "Flow Rules", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/order-rules", label: "Order Rules", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/enquiry-rules", label: "Enquiry Rules", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/operators/overview", label: "Operator Overview", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/users", label: "Users", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/calculations", label: "Calculations", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/function-preview", label: "Function Preview", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/essentials", label: "Essentials", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/geosphere", label: "Geo Sphere", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/rates", label: "Rates", section: "Operations/Admin", roles: ["admin"], nav: true, searchable: true },
  { path: "/dashboard/bulk", label: "Bulk Operations", section: "Operations/Admin", roles: ["admin"] },
  { path: "/dashboard/news", label: "News", section: "Operations/Admin", roles: ["admin"] },
  { path: "/dashboard/rsForm", label: "RS Form", section: "Operations/Admin", roles: ["admin"] },
  { path: "/dashboard/map", label: "Map", section: "Operations/Admin", roles: ["admin"] },

  { path: "/dashboard/shortcuts", label: "Keyboard Shortcuts", section: "Organization", roles: ["admin", "associate", "operator", "team"], tradeModes: ALL_ASSOCIATE_MODES, nav: true, searchable: true },
];

const journeyStageBySection: Record<DashboardSection, DashboardJourneyStage> = {
  Overview: "overview",
  Trade: "execute",
  Products: "discover",
  Services: "service",
  Organization: "organize",
  "Operations/Admin": "administer",
};

export const DASHBOARD_ROUTE_MANIFEST: DashboardRouteDefinition[] = DASHBOARD_ROUTE_INPUTS.map((route) => ({
  ...route,
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
  const normalizedInterests = new Set(companyInterests.map((item) => String(item || "").toUpperCase()));
  return DASHBOARD_ROUTE_MANIFEST.filter((route) => {
    if (!route.nav || !canAccessDashboardRoute({ path: route.path, role, tradeMode })) return false;
    if (!route.requiredInterests?.length || normalizeDashboardRole(role) !== "associate") return true;
    return route.requiredInterests.some((interest) => normalizedInterests.has(interest));
  });
};
