import type { ResolvedSidebarPage, SidebarGovernanceMapping, SidebarPageStatus } from "@/types/sidebarGovernance";

export const SIDEBAR_RECOVERY_ROUTES = new Set([
  "/dashboard",
  "/dashboard/onboarding",
  "/dashboard/pending-approval",
  "/dashboard/rejected",
  "/dashboard/guidance",
  "/dashboard/settings",
  "/dashboard/customer-support",
]);
export const SIDEBAR_COMMON_ROUTES = [
  "/dashboard",
  "/dashboard/guidance",
  "/dashboard/settings",
  "/dashboard/customer-support",
] as const;
export const SIDEBAR_HOME_ROUTES = ["/dashboard"] as const;
export const SIDEBAR_UTILITY_ROUTES = [
  "/dashboard/guidance",
  "/dashboard/settings",
  "/dashboard/customer-support",
] as const;
const STATUS_WEIGHT: Record<SidebarPageStatus, number> = { HIDDEN: 0, COMING_SOON: 1, LIVE: 2 };

const normalizeSlug = (value: unknown) => String(value || "").trim().toLowerCase().replace(/_/g, "-");

export const resolveSidebarGovernance = (
  mappings: SidebarGovernanceMapping[] | undefined,
  providedCapabilities: string[] = [],
  soughtCapabilities: string[] = [],
  options?: { resolutionVersion?: number; sectionOrder?: Partial<Record<"IMPORTANT" | "SEEKING" | "PROVIDING" | "OTHER_SERVICES", string[]>> },
) => {
  const provided = new Set(providedCapabilities.map(normalizeSlug));
  const sought = new Set(soughtCapabilities.map(normalizeSlug));
  const functions = new Set([...provided, ...sought]);
  const resolved = new Map<string, ResolvedSidebarPage>();

  (mappings || []).filter((row) => functions.has(normalizeSlug(row.functionSlug))).forEach((row) => {
    if ((SIDEBAR_COMMON_ROUTES as readonly string[]).includes(row.routePath) || row.placement === "UNASSIGNED") return;
    const slug = normalizeSlug(row.functionSlug);
    const placements: Array<"SEEKING" | "PROVIDING" | "OTHER_SERVICES"> = Number(options?.resolutionVersion || 1) >= 2
      ? row.placement === "BOTH"
        ? [...(sought.has(slug) ? ["SEEKING" as const] : []), ...(provided.has(slug) ? ["PROVIDING" as const] : [])]
        : row.placement === "SEEKING"
          ? (sought.has(slug) ? ["SEEKING"] : [])
          : row.placement === "PROVIDING"
            ? (provided.has(slug) ? ["PROVIDING"] : [])
            : ["OTHER_SERVICES"]
      : row.placement === "BOTH" ? ["SEEKING", "PROVIDING"] : [row.placement];
    placements.forEach((placement) => {
      const key = `${placement}:${row.routePath}`;
      const current = resolved.get(key);
      if (!current || STATUS_WEIGHT[row.status] > STATUS_WEIGHT[current.status]) {
        resolved.set(key, { routePath: row.routePath, placement, status: row.status, order: row.order });
      } else if (STATUS_WEIGHT[row.status] === STATUS_WEIGHT[current.status] && row.order < current.order) {
        resolved.set(key, { ...current, order: row.order });
      }
    });
  });

  const rows = Array.from(resolved.values());
  const workSpecific = new Set(rows.filter((row) => row.placement !== "OTHER_SERVICES" && row.status !== "HIDDEN").map((row) => row.routePath));
  const withoutRedundantOther = rows.filter((row) => row.placement !== "OTHER_SERVICES" || !workSpecific.has(row.routePath));
  const visibleWorkSides = withoutRedundantOther
    .filter((row) => row.status !== "HIDDEN" && (row.placement === "SEEKING" || row.placement === "PROVIDING"))
    .reduce((sides, row) => {
      const placements = sides.get(row.routePath) || new Set<string>();
      placements.add(row.placement);
      sides.set(row.routePath, placements);
      return sides;
    }, new Map<string, Set<string>>());
  const promotedPaths = options?.resolutionVersion === 3
    ? new Set(Array.from(visibleWorkSides.entries())
      .filter(([, placements]) => placements.has("SEEKING") && placements.has("PROVIDING"))
      .map(([path]) => path))
    : new Set<string>();
  const promoted = Array.from(promotedPaths).map((routePath): ResolvedSidebarPage => {
    const matches = withoutRedundantOther.filter((row) => row.routePath === routePath && row.status !== "HIDDEN" && row.placement !== "OTHER_SERVICES");
    const status = matches.reduce<SidebarPageStatus>((best, row) => STATUS_WEIGHT[row.status] > STATUS_WEIGHT[best] ? row.status : best, "HIDDEN");
    return { routePath, placement: "IMPORTANT", status, order: Math.min(...matches.map((row) => row.order)) };
  });
  return [...withoutRedundantOther.filter((row) => !promotedPaths.has(row.routePath)), ...promoted]
    .sort((a, b) => {
      if (options?.resolutionVersion === 2) {
        const sectionRank = { SEEKING: 0, PROVIDING: 1, OTHER_SERVICES: 2 } as const;
        if (a.placement !== b.placement) return sectionRank[a.placement] - sectionRank[b.placement];
        const order = options.sectionOrder?.[a.placement] || [];
        const aIndex = order.indexOf(a.routePath);
        const bIndex = order.indexOf(b.routePath);
        if (aIndex !== bIndex) return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
      } else if (options?.resolutionVersion === 3) {
        const sectionRank = { IMPORTANT: 0, SEEKING: 1, PROVIDING: 2, OTHER_SERVICES: 3 } as const;
        if (a.placement !== b.placement) return sectionRank[a.placement] - sectionRank[b.placement];
        const order = options.sectionOrder?.[a.placement] || [];
        const aIndex = order.indexOf(a.routePath);
        const bIndex = order.indexOf(b.routePath);
        if (aIndex !== bIndex) return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
      }
      return a.order - b.order || a.routePath.localeCompare(b.routePath);
    });
};

export const getGovernedRouteStatus = (resolved: ResolvedSidebarPage[], path: string): SidebarPageStatus => {
  if (SIDEBAR_RECOVERY_ROUTES.has(path)) return "LIVE";
  const rows = resolved.filter((row) => row.routePath === path);
  if (!rows.length) return "HIDDEN";
  return rows.reduce<SidebarPageStatus>((best, row) => STATUS_WEIGHT[row.status] > STATUS_WEIGHT[best] ? row.status : best, "HIDDEN");
};

export const indexResolvedSidebarGovernance = (resolved: ResolvedSidebarPage[]) => {
  const sections: Record<ResolvedSidebarPage["placement"], ResolvedSidebarPage[]> = {
    IMPORTANT: [],
    SEEKING: [],
    PROVIDING: [],
    OTHER_SERVICES: [],
  };
  const statusByRoute = new Map<string, SidebarPageStatus>();

  resolved.forEach((row) => {
    sections[row.placement].push(row);
    const current = statusByRoute.get(row.routePath) || "HIDDEN";
    if (STATUS_WEIGHT[row.status] > STATUS_WEIGHT[current]) statusByRoute.set(row.routePath, row.status);
  });

  return {
    sections,
    statusByRoute,
    getRouteStatus: (path: string): SidebarPageStatus => SIDEBAR_RECOVERY_ROUTES.has(path)
      ? "LIVE"
      : statusByRoute.get(path) || "HIDDEN",
  };
};
