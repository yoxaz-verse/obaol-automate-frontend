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
  options?: { resolutionVersion?: number; sectionOrder?: Partial<Record<"SEEKING" | "PROVIDING" | "OTHER_SERVICES", string[]>> },
) => {
  const provided = new Set(providedCapabilities.map(normalizeSlug));
  const sought = new Set(soughtCapabilities.map(normalizeSlug));
  const functions = new Set([...provided, ...sought]);
  const resolved = new Map<string, ResolvedSidebarPage>();

  (mappings || []).filter((row) => functions.has(normalizeSlug(row.functionSlug))).forEach((row) => {
    if ((SIDEBAR_COMMON_ROUTES as readonly string[]).includes(row.routePath) || row.placement === "UNASSIGNED") return;
    const slug = normalizeSlug(row.functionSlug);
    const placements: Array<"SEEKING" | "PROVIDING" | "OTHER_SERVICES"> = options?.resolutionVersion === 2
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
  return rows
    .filter((row) => row.placement !== "OTHER_SERVICES" || !workSpecific.has(row.routePath))
    .sort((a, b) => {
      if (options?.resolutionVersion === 2) {
        const sectionRank = { SEEKING: 0, PROVIDING: 1, OTHER_SERVICES: 2 } as const;
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
