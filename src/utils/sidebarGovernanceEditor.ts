import type { SidebarPageStatus, SidebarPlacement } from "@/types/sidebarGovernance";

export type FunctionPlacement = SidebarPlacement | "UNASSIGNED";
export type FunctionAssignment = {
  functionSlug: string;
  placement: FunctionPlacement;
  status: SidebarPageStatus;
};
export type AssignmentPanelPlacement = SidebarPlacement;
export type AssignmentPanelStatus = SidebarPageStatus | "MIXED";

export const assignmentPanelPlacements: AssignmentPanelPlacement[] = [
  "SEEKING",
  "PROVIDING",
  "BOTH",
  "OTHER_SERVICES",
];

export const getAssignmentPanelState = (
  assignments: FunctionAssignment[],
  placement: AssignmentPanelPlacement,
): { count: number; status: AssignmentPanelStatus } => {
  const selected = assignments.filter((assignment) => assignment.placement === placement);
  const uniqueStatuses = new Set(selected.map((assignment) => assignment.status));
  return {
    count: selected.length,
    status: uniqueStatuses.size > 1 ? "MIXED" : selected[0]?.status || "LIVE",
  };
};

export const toggleFunctionPanel = (
  assignments: FunctionAssignment[],
  functionSlug: string,
  targetPlacement: AssignmentPanelPlacement,
): FunctionAssignment[] => {
  const current = assignments.find((assignment) => assignment.functionSlug === functionSlug);
  if (!current) return assignments;
  if (current.placement === targetPlacement) {
    return assignments.map((assignment) => assignment.functionSlug === functionSlug
      ? { ...assignment, placement: "UNASSIGNED", status: "HIDDEN" }
      : assignment);
  }

  const target = getAssignmentPanelState(assignments, targetPlacement);
  const targetStatus = target.count > 0 && target.status !== "MIXED"
    ? target.status
    : current.placement === "UNASSIGNED"
      ? "LIVE"
      : current.status;
  return assignments.map((assignment) => assignment.functionSlug === functionSlug
    ? { ...assignment, placement: targetPlacement, status: targetStatus }
    : assignment);
};

export const applyAssignmentPanelStatus = (
  assignments: FunctionAssignment[],
  placement: AssignmentPanelPlacement,
  status: SidebarPageStatus,
): FunctionAssignment[] => assignments.map((assignment) => {
  if (assignment.placement !== placement) return assignment;
  // A hidden Other Services mapping is the existing wire representation for
  // an unassigned function, so keep the editor and a subsequent reload aligned.
  if (placement === "OTHER_SERVICES" && status === "HIDDEN") {
    return { ...assignment, placement: "UNASSIGNED", status: "HIDDEN" };
  }
  return { ...assignment, status };
});
