"use client";

import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { sidebarGovernanceRoutes } from "@/core/api/apiRoutes";
import { resolveSidebarGovernance } from "@/utils/sidebarGovernance";
import type { SidebarGovernanceSnapshot } from "@/types/sidebarGovernance";

export const useSidebarGovernance = () => {
  const { user } = useContext(AuthContext);
  const isAssociate = String(user?.role || "").toLowerCase() === "associate";
  const query = useQuery({
    queryKey: ["sidebar-governance", "published", user?.id],
    queryFn: async () => (await getData(sidebarGovernanceRoutes.published, {}, { cacheMode: "bypass" })).data.data as SidebarGovernanceSnapshot,
    enabled: Boolean(user?.id) && isAssociate,
    staleTime: 60_000,
    retry: 1,
  });
  const resolved = isAssociate && query.isSuccess
    ? resolveSidebarGovernance(query.data?.mappings, user?.providedCapabilities || [], user?.soughtCapabilities || [])
    : [];
  return { ...query, isAssociate, resolved };
};
