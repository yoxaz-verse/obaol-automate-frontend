import { routeRoles } from "@/utils/roleHelpers";

type SidebarOption = {
  name: string;
  icon: any;
  link: string;
};

export type DashboardNavSection = {
  label: string;
  links: string[];
};

export const DASHBOARD_NAV_SECTIONS: DashboardNavSection[] = [
  { label: "", links: ["/dashboard"] },
  {
    label: "Product",
    links: ["/dashboard/product", "/dashboard/catalog", "/dashboard/marketplace"],
  },
  {
    label: "Execution",
    links: ["/dashboard/enquiries", "/dashboard/sample-requests", "/dashboard/orders", "/dashboard/documents"],
  },
  {
    label: "Services",
    links: ["/dashboard/imports", "/dashboard/external-orders", "/dashboard/execution-enquiries", "/dashboard/warehouse-rent", "/dashboard/quality-labs"],
  },
  { label: "News", links: ["/dashboard/news"] },
  {
    label: "Manage",
    links: [
      "/dashboard/inventory",
      "/dashboard/warehouses",
      "/dashboard/company",
      "/dashboard/companies",
      "/dashboard/notifications",
      "/dashboard/guidance",
      "/dashboard/approvals",
      "/dashboard/reports",
      "/dashboard/profile",
    ],
  },
  { label: "Payments", links: ["/dashboard/payments"] },
  {
    label: "Operator",
    links: ["/dashboard/operator/hierarchy", "/dashboard/operator/team", "/dashboard/operator/earnings"],
  },
  {
    label: "Admin Tools",
    links: [
      "/dashboard/documentation-rules",
      "/dashboard/documentation-preview",
      "/dashboard/documentation-templates",
      "/dashboard/flow-rules",
      "/dashboard/operators/overview",
      "/dashboard/users",
      "/dashboard/calculations",
      "/dashboard/function-preview",
      "/dashboard/shortcuts",
      "/dashboard/essentials",
      "/dashboard/geosphere",
    ],
  },
];

const normalizeRole = (role: string) => String(role || "").toLowerCase();

const resolveRoleForRouteRules = (role: string) => {
  const normalized = normalizeRole(role);
  if (normalized === "team") return "Operator";
  if (normalized === "admin") return "Admin";
  if (normalized === "associate") return "Associate";
  if (normalized === "operator") return "Operator";
  if (normalized === "customer") return "Customer";
  if (normalized === "projectmanager") return "ProjectManager";
  if (normalized === "worker") return "Worker";
  return role;
};

export const getRoleFilteredSidebarOptions = (
  sidebarOptions: SidebarOption[],
  role: string
): SidebarOption[] => {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) return [];

  return sidebarOptions.filter((option) => {
    const allowedRoles = (routeRoles[option.link] || []).map((r) => String(r).toLowerCase());
    const roleForRules = String(resolveRoleForRouteRules(role) || "").toLowerCase();
    if (!allowedRoles.includes(roleForRules)) return false;
    if ((normalizedRole === "admin" || normalizedRole === "operator" || normalizedRole === "team") && option.link === "/dashboard/company") {
      return false;
    }
    return true;
  });
};

export const getDashboardSidebarSections = (
  filteredOptions: SidebarOption[]
): DashboardNavSection[] => {
  const optionMap = new Map(filteredOptions.map((option) => [option.link, option]));
  const seenLinks = new Set<string>();

  return DASHBOARD_NAV_SECTIONS.map((section) => {
    const links = section.links.filter((link) => {
      if (!optionMap.has(link)) return false;
      if (seenLinks.has(link)) return false;
      seenLinks.add(link);
      return true;
    });
    return { ...section, links };
  }).filter((section) => section.links.length > 0);
};

