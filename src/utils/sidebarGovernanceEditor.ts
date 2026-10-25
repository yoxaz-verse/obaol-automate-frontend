import type { SidebarGovernanceMapping, SidebarPageStatus, SidebarPlacement } from "@/types/sidebarGovernance";

export type FunctionPlacement = SidebarPlacement;
export type FunctionAssignment = {
  functionSlug: string;
  placement: FunctionPlacement;
  status: SidebarPageStatus;
};
export type AssignmentPanelPlacement = Exclude<SidebarPlacement, "BOTH">;
export type AssignmentPanelStatus = SidebarPageStatus | "MIXED";
export type GovernanceSection = "IMPORTANT" | "SEEKING" | "PROVIDING" | "OTHER_SERVICES";
export type GovernanceFunctionRow = { _id: string; name: string; slug: string };
export type GovernanceRouteRow = { id: string; path: string; label: string; position?: "TOP" | "BOTTOM" };
export type AssignmentMatrix = Record<string, Record<string, FunctionAssignment>>;
export type SectionOrder = Record<GovernanceSection, string[]>;
export type SidebarGovernanceEditorState = {
  matrix: AssignmentMatrix;
  baselineMatrix: AssignmentMatrix;
  sectionOrder: SectionOrder;
  baselineSectionOrder: SectionOrder;
  draftRevision: number;
  dirtyPages: string[];
  dirtySections: GovernanceSection[];
};
export type SidebarGovernanceEditorAction =
  | { type: "HYDRATE"; matrix: AssignmentMatrix; sectionOrder: SectionOrder; draftRevision: number }
  | { type: "TOGGLE_FUNCTION"; routePath: string; functionSlug: string; placement: AssignmentPanelPlacement }
  | { type: "SET_PANEL_STATUS"; routePath: string; placement: AssignmentPanelPlacement; status: SidebarPageStatus }
  | { type: "SET_SECTION_ORDER"; section: GovernanceSection; order: string[] }
  | { type: "COMMIT"; draftRevision: number };

export const assignmentPanelPlacements: AssignmentPanelPlacement[] = [
  "SEEKING",
  "PROVIDING",
  "OTHER_SERVICES",
  "UNASSIGNED",
];

export const assignmentAppearsInPanel = (
  assignment: FunctionAssignment,
  placement: AssignmentPanelPlacement | GovernanceSection,
): boolean => assignment.placement === placement
  || (placement === "IMPORTANT" && assignment.placement === "BOTH")
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

const assignmentsToRecord = (assignments: FunctionAssignment[]) => Object.fromEntries(assignments.map((assignment) => [assignment.functionSlug, assignment]));
const addUnique = <T extends string>(items: T[], item: T) => items.includes(item) ? items : [...items, item];
const without = <T extends string>(items: T[], item: T) => items.filter((value) => value !== item);
const pageMatches = (left: Record<string, FunctionAssignment>, right: Record<string, FunctionAssignment>) => {
  const slugs = Object.keys(left);
  return slugs.length === Object.keys(right).length && slugs.every((slug) => (
    left[slug]?.placement === right[slug]?.placement && left[slug]?.status === right[slug]?.status
  ));
};
const orderMatches = (left: string[], right: string[]) => left.length === right.length && left.every((path, index) => path === right[index]);

export const createAssignmentMatrix = (
  routes: GovernanceRouteRow[],
  functions: GovernanceFunctionRow[],
  mappings: SidebarGovernanceMapping[],
): AssignmentMatrix => {
  const indexed = new Map(mappings.map((row) => [`${row.routePath}:${row.functionSlug}`, row]));
  return Object.fromEntries(routes.map((route) => [route.path, Object.fromEntries(functions.map((fn) => {
    const row = indexed.get(`${route.path}:${fn.slug}`);
    return [fn.slug, row
      ? { functionSlug: fn.slug, placement: row.placement, status: row.status }
      : { functionSlug: fn.slug, placement: "UNASSIGNED", status: "HIDDEN" }];
  }))]));
};

export const compileGovernanceMappings = (matrix: AssignmentMatrix, sectionOrder: SectionOrder): SidebarGovernanceMapping[] => Object.entries(matrix).flatMap(([routePath, assignments]) => (
  Object.values(assignments).map((assignment) => {
    const status = assignment.placement === "UNASSIGNED" ? "HIDDEN" : assignment.status;
    const orderSection = assignment.placement === "BOTH" ? "IMPORTANT" : assignment.placement;
    const order = orderSection === "UNASSIGNED" ? 0 : Math.max(0, sectionOrder[orderSection].indexOf(routePath));
    return { functionSlug: assignment.functionSlug, routePath, placement: assignment.placement, status, order };
  })
));

export const createSidebarGovernanceEditorState = (
  matrix: AssignmentMatrix,
  sectionOrder: SectionOrder,
  draftRevision: number,
): SidebarGovernanceEditorState => ({
  matrix,
  baselineMatrix: matrix,
  sectionOrder,
  baselineSectionOrder: sectionOrder,
  draftRevision,
  dirtyPages: [],
  dirtySections: [],
});

export const sidebarGovernanceEditorReducer = (
  state: SidebarGovernanceEditorState,
  action: SidebarGovernanceEditorAction,
): SidebarGovernanceEditorState => {
  if (action.type === "HYDRATE") return createSidebarGovernanceEditorState(action.matrix, action.sectionOrder, action.draftRevision);
  if (action.type === "COMMIT") return { ...state, baselineMatrix: state.matrix, baselineSectionOrder: state.sectionOrder, draftRevision: action.draftRevision, dirtyPages: [], dirtySections: [] };
  if (action.type === "SET_SECTION_ORDER") {
    const dirty = !orderMatches(action.order, state.baselineSectionOrder[action.section]);
    return {
      ...state,
      sectionOrder: { ...state.sectionOrder, [action.section]: action.order },
      dirtySections: dirty ? addUnique(state.dirtySections, action.section) : without(state.dirtySections, action.section),
    };
  }
  const page = state.matrix[action.routePath];
  if (!page) return state;
  const assignments = Object.values(page);
  const nextAssignments = action.type === "TOGGLE_FUNCTION"
    ? toggleFunctionPanel(assignments, action.functionSlug, action.placement)
    : applyAssignmentPanelStatus(assignments, action.placement, action.status);
  if (nextAssignments === assignments) return state;
  const nextPage = assignmentsToRecord(nextAssignments);
  const dirty = !pageMatches(nextPage, state.baselineMatrix[action.routePath] || {});
  return {
    ...state,
    matrix: { ...state.matrix, [action.routePath]: nextPage },
    dirtyPages: dirty ? addUnique(state.dirtyPages, action.routePath) : without(state.dirtyPages, action.routePath),
  };
};

export const summarizeGovernanceChanges = (state: SidebarGovernanceEditorState) => {
  let assignmentChanges = 0;
  state.dirtyPages.forEach((routePath) => {
    const current = state.matrix[routePath] || {};
    const baseline = state.baselineMatrix[routePath] || {};
    Object.keys(current).forEach((slug) => {
      if (current[slug]?.placement !== baseline[slug]?.placement || current[slug]?.status !== baseline[slug]?.status) assignmentChanges += 1;
    });
  });
  return { changedPages: state.dirtyPages.length, assignmentChanges, changedSections: state.dirtySections.length };
};
