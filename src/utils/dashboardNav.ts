import {
  getDashboardAdminGroups,
  getAccessibleDashboardRoutes,
  type DashboardSection,
  type DashboardNavGroup,
  type TradeMode,
} from "@/utils/dashboardAccess";

type SidebarOption = {
  name: string;
  icon: any;
  link: string;
};

export type DashboardNavSection = {
  label: DashboardSection;
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
  filteredOptions: SidebarOption[]
): DashboardNavSection[] => {
  const optionMap = new Map(filteredOptions.map((option) => [option.link, option]));
  const accessibleRoutes = getAccessibleDashboardRoutes({
    role: "admin",
    tradeMode: "BOTH",
  });
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
