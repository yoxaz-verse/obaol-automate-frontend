export type SidebarPlacement = "SEEKING" | "PROVIDING" | "BOTH" | "OTHER_SERVICES";
export type SidebarPageStatus = "LIVE" | "COMING_SOON" | "HIDDEN";

export type SidebarGovernanceMapping = {
  functionSlug: string;
  routePath: string;
  placement: SidebarPlacement;
  status: SidebarPageStatus;
  order: number;
};

export type SidebarGovernanceSnapshot = {
  revision: number;
  resolutionVersion: 1 | 2;
  updatedAt?: string;
  sectionOrder: Record<"SEEKING" | "PROVIDING" | "OTHER_SERVICES", string[]>;
  mappings: SidebarGovernanceMapping[];
};

export type ResolvedSidebarPage = {
  routePath: string;
  placement: Exclude<SidebarPlacement, "BOTH">;
  status: SidebarPageStatus;
  order: number;
};
