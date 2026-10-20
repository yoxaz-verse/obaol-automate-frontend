"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { sidebarGovernanceRoutes } from "@/core/api/apiRoutes";
import { indexResolvedSidebarGovernance, resolveSidebarGovernance } from "@/utils/sidebarGovernance";
import type { ResolvedSidebarPage, SidebarGovernanceSnapshot, SidebarPageStatus } from "@/types/sidebarGovernance";

type SidebarGovernanceContextValue = {
  isAssociate: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  revision?: number;
  resolved: ResolvedSidebarPage[];
  sections: Record<ResolvedSidebarPage["placement"], ResolvedSidebarPage[]>;
  getRouteStatus: (path: string) => SidebarPageStatus;
  refresh: () => Promise<unknown>;
};

const SidebarGovernanceContext = createContext<SidebarGovernanceContextValue | null>(null);

export const SidebarGovernanceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const isAssociate = String(user?.role || "").toLowerCase() === "associate";
  const query = useQuery({
    queryKey: ["sidebar-governance", "published", user?.id],
    queryFn: async () => (await getData(sidebarGovernanceRoutes.published, {}, { cacheMode: "bypass" })).data.data as SidebarGovernanceSnapshot,
    enabled: Boolean(user?.id) && isAssociate,
    staleTime: 60_000,
    retry: 1,
  });
  const providedKey = (user?.providedCapabilities || []).join("|");
  const soughtKey = (user?.soughtCapabilities || []).join("|");
  const resolved = useMemo(() => isAssociate && query.isSuccess
    ? resolveSidebarGovernance(query.data?.mappings, providedKey ? providedKey.split("|") : [], soughtKey ? soughtKey.split("|") : [], { resolutionVersion: query.data?.resolutionVersion, sectionOrder: query.data?.sectionOrder })
    : [], [isAssociate, providedKey, query.data, query.isSuccess, soughtKey]);
  const index = useMemo(() => indexResolvedSidebarGovernance(resolved), [resolved]);
  const value = useMemo<SidebarGovernanceContextValue>(() => ({
    isAssociate,
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    isError: query.isError,
    revision: query.data?.revision,
    resolved,
    sections: index.sections,
    getRouteStatus: index.getRouteStatus,
    refresh: query.refetch,
  }), [index, isAssociate, query.data?.revision, query.isError, query.isLoading, query.isSuccess, query.refetch, resolved]);
  return <SidebarGovernanceContext.Provider value={value}>{children}</SidebarGovernanceContext.Provider>;
};

export const useSidebarGovernance = () => {
  const value = useContext(SidebarGovernanceContext);
  if (!value) throw new Error("useSidebarGovernance must be used inside SidebarGovernanceProvider.");
  return value;
};
