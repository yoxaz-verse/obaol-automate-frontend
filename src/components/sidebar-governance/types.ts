import type { SidebarGovernanceMapping } from "@/types/sidebarGovernance";
import type { GovernanceFunctionRow, GovernanceRouteRow, GovernanceSection, SectionOrder } from "@/utils/sidebarGovernanceEditor";

export type SidebarGovernanceAdminPayload = {
  config: {
    draft: { revision: number; resolutionVersion: number; sectionOrder: SectionOrder; mappings: SidebarGovernanceMapping[] };
    published: { revision: number; resolutionVersion: number; updatedAt?: string };
  };
  functions: GovernanceFunctionRow[];
  routes: GovernanceRouteRow[];
  commonRoutes: GovernanceRouteRow[];
};

export const governanceSectionLabels: Record<GovernanceSection, string> = {
  IMPORTANT: "Important",
  SEEKING: "Seeking",
  PROVIDING: "Providing",
  OTHER_SERVICES: "Other Services",
};
