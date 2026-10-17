export type SidebarPlacement = "SEEKING" | "PROVIDING" | "BOTH";
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
  updatedAt?: string;
  mappings: SidebarGovernanceMapping[];
};

export type ResolvedSidebarPage = {
  routePath: string;
  placement: Exclude<SidebarPlacement, "BOTH">;
  status: SidebarPageStatus;
  order: number;
};
