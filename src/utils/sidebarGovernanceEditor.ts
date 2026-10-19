import type { SidebarPageStatus, SidebarPlacement } from "@/types/sidebarGovernance";

export type FunctionPlacement = SidebarPlacement;
export type FunctionAssignment = {
  functionSlug: string;
  placement: FunctionPlacement;
  status: SidebarPageStatus;
};
export type AssignmentPanelPlacement = Exclude<SidebarPlacement, "BOTH">;
export type AssignmentPanelStatus = SidebarPageStatus | "MIXED";

export const assignmentPanelPlacements: AssignmentPanelPlacement[] = [
  "SEEKING",
  "PROVIDING",
  "OTHER_SERVICES",
  "UNASSIGNED",
];

export const assignmentAppearsInPanel = (
  assignment: FunctionAssignment,
  placement: AssignmentPanelPlacement,
): boolean => assignment.placement === placement
  || (assignment.placement === "BOTH" && (placement === "SEEKING" || placement === "PROVIDING"));

export const getAssignmentPanelState = (
  assignments: FunctionAssignment[],
  placement: AssignmentPanelPlacement,
): { count: number; status: AssignmentPanelStatus } => {
  const selected = assignments.filter((assignment) => assignmentAppearsInPanel(assignment, placement));
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

  if (targetPlacement === "UNASSIGNED") {
    if (current.placement === "UNASSIGNED") return assignments;
    return assignments.map((assignment) => assignment.functionSlug === functionSlug
      ? { ...assignment, placement: "UNASSIGNED", status: "HIDDEN" }
      : assignment);
  }
  if (current.placement === "BOTH" && (targetPlacement === "SEEKING" || targetPlacement === "PROVIDING")) {
    const remainingPlacement = targetPlacement === "SEEKING" ? "PROVIDING" : "SEEKING";
    return assignments.map((assignment) => assignment.functionSlug === functionSlug
      ? { ...assignment, placement: remainingPlacement }
      : assignment);
  }
  if (current.placement === targetPlacement) {
    return assignments.map((assignment) => assignment.functionSlug === functionSlug
      ? { ...assignment, placement: "UNASSIGNED", status: "HIDDEN" }
      : assignment);
  }

  const oppositeWorkPlacement = targetPlacement === "SEEKING" ? "PROVIDING" : targetPlacement === "PROVIDING" ? "SEEKING" : null;
  if (oppositeWorkPlacement && current.placement === oppositeWorkPlacement) {
    return assignments.map((assignment) => assignment.functionSlug === functionSlug
      ? { ...assignment, placement: "BOTH" }
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
  if (!assignmentAppearsInPanel(assignment, placement)) return assignment;
  return { ...assignment, status };
});
