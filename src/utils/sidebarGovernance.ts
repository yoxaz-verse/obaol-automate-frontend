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
const STATUS_WEIGHT: Record<SidebarPageStatus, number> = { HIDDEN: 0, COMING_SOON: 1, LIVE: 2 };

const normalizeSlug = (value: unknown) => String(value || "").trim().toLowerCase().replace(/_/g, "-");

export const resolveSidebarGovernance = (
  mappings: SidebarGovernanceMapping[] | undefined,
  providedCapabilities: string[] = [],
  soughtCapabilities: string[] = [],
) => {
  const functions = new Set([...providedCapabilities, ...soughtCapabilities].map(normalizeSlug));
  const resolved = new Map<string, ResolvedSidebarPage>();

  (mappings || []).filter((row) => functions.has(normalizeSlug(row.functionSlug))).forEach((row) => {
    if ((SIDEBAR_COMMON_ROUTES as readonly string[]).includes(row.routePath)) return;
    const placements: Array<"SEEKING" | "PROVIDING" | "OTHER_SERVICES"> = row.placement === "BOTH" ? ["SEEKING", "PROVIDING"] : [row.placement];
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
    .sort((a, b) => a.order - b.order || a.routePath.localeCompare(b.routePath));
};

export const getGovernedRouteStatus = (resolved: ResolvedSidebarPage[], path: string): SidebarPageStatus => {
  if (SIDEBAR_RECOVERY_ROUTES.has(path)) return "LIVE";
  const rows = resolved.filter((row) => row.routePath === path);
  if (!rows.length) return "HIDDEN";
  return rows.reduce<SidebarPageStatus>((best, row) => STATUS_WEIGHT[row.status] > STATUS_WEIGHT[best] ? row.status : best, "HIDDEN");
};
