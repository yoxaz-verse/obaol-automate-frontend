"use client";

import { memo, useMemo } from "react";
import { Card, CardBody, Chip, Input } from "@nextui-org/react";
import { FiSearch } from "react-icons/fi";
import type { SidebarPageStatus } from "@/types/sidebarGovernance";
import {
  assignmentAppearsInPanel,
  assignmentPanelPlacements,
  getAssignmentPanelState,
  type AssignmentMatrix,
  type AssignmentPanelPlacement,
  type FunctionAssignment,
  type GovernanceFunctionRow,
  type GovernanceRouteRow,
} from "@/utils/sidebarGovernanceEditor";

const statuses: SidebarPageStatus[] = ["LIVE", "COMING_SOON", "HIDDEN"];
const statusLabel = (value: SidebarPageStatus) => value === "COMING_SOON" ? "Coming soon" : value[0] + value.slice(1).toLowerCase();
const panelDetails: Record<AssignmentPanelPlacement, { label: string; description: string }> = {
  SEEKING: { label: "Seeking For", description: "Shown when the company seeks this function." },
  PROVIDING: { label: "Providing", description: "Shown when the company provides this function." },
  OTHER_SERVICES: { label: "Other Services", description: "Shown outside the work sections." },
  UNASSIGNED: { label: "Unassigned", description: "Intentionally omitted from associate navigation." },
};

const AssignmentPanel = memo(function AssignmentPanel({ placement, functions, assignments, onToggle, onStatusChange }: {
  placement: AssignmentPanelPlacement;
  functions: GovernanceFunctionRow[];
  assignments: FunctionAssignment[];
  onToggle: (functionSlug: string, placement: AssignmentPanelPlacement) => void;
  onStatusChange: (placement: AssignmentPanelPlacement, status: SidebarPageStatus) => void;
}) {
  const details = panelDetails[placement];
  const state = useMemo(() => getAssignmentPanelState(assignments, placement), [assignments, placement]);
  const panelId = `assignment-panel-${placement.toLowerCase()}`;
  return <section aria-labelledby={panelId} className="rounded-2xl border border-default-200 bg-content1 p-4 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 id={panelId} className="font-bold">{details.label}</h3><Chip size="sm" variant="flat">{state.count}</Chip></div><p className="mt-1 text-xs text-default-500">{details.description}</p></div>{placement !== "UNASSIGNED" && state.status === "MIXED" && <Chip size="sm" color="warning" variant="flat">Mixed statuses</Chip>}</div>
    {placement !== "UNASSIGNED" && <div role="group" aria-label={`${details.label} status`} className="mt-4 grid grid-cols-3 rounded-xl bg-default-100 p-1">{statuses.map((status) => <button key={status} type="button" aria-pressed={state.status === status} disabled={state.count === 0} onClick={() => onStatusChange(placement, status)} className={`min-h-10 rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 ${state.status === status ? "bg-content1 text-foreground shadow-sm" : "text-default-500 hover:text-foreground"} disabled:cursor-not-allowed disabled:opacity-40`}>{statusLabel(status)}</button>)}</div>}
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={`${details.label} company functions`}>{functions.map((fn) => { const active = assignments.some((assignment) => assignment.functionSlug === fn.slug && assignmentAppearsInPanel(assignment, placement)); return <button key={fn.slug} type="button" aria-pressed={active} onClick={() => onToggle(fn.slug, placement)} className={`min-h-11 rounded-full border px-3 py-2 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 ${active ? "border-obaol-500 bg-obaol-500/15 font-bold text-obaol-700 shadow-sm dark:text-obaol-300" : "border-default-200 bg-background text-default-600 hover:border-obaol-500/50 hover:text-foreground"}`}>{fn.name}</button>; })}</div>
  </section>;
});

export function PageSelector({ routes, matrix, dirtyPages, selectedPath, search, onSearch, onSelect }: {
  routes: GovernanceRouteRow[];
  matrix: AssignmentMatrix;
  dirtyPages: string[];
  selectedPath: string;
  search: string;
  onSearch: (value: string) => void;
  onSelect: (path: string) => void;
}) {
  const filtered = useMemo(() => routes.filter((route) => `${route.label} ${route.path}`.toLowerCase().includes(search.trim().toLowerCase())), [routes, search]);
  return <Card className="h-fit xl:sticky xl:top-24"><CardBody className="gap-2 p-3"><p className="px-1 text-xs font-black uppercase tracking-wider text-default-400">Sidebar pages</p><Input size="sm" value={search} onValueChange={onSearch} aria-label="Search sidebar pages" placeholder="Search pages" startContent={<FiSearch />} /><div className="max-h-[65vh] space-y-1 overflow-y-auto">{filtered.map((route) => { const assignments = Object.values(matrix[route.path] || {}); const assigned = assignments.filter((item) => item.placement !== "UNASSIGNED").length; const active = selectedPath === route.path; const dirty = dirtyPages.includes(route.path); return <button key={route.path} data-governance-route={route.path} onClick={() => onSelect(route.path)} className={`relative w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all ${active ? "border border-obaol-500/30 bg-obaol-500/10 font-bold text-obaol-700 shadow-sm dark:text-obaol-200" : "text-default-600 hover:bg-default-100"}`}><span className="flex items-center justify-between gap-2"><span className="truncate">{route.label}</span>{dirty && <span aria-label="Unsaved changes" className="h-2 w-2 shrink-0 rounded-full bg-warning" />}</span><span className="mt-0.5 flex justify-between gap-2 text-[10px] font-normal text-default-400"><span className="truncate">{route.path}</span><span>{assigned}/{assignments.length}</span></span></button>; })}{!filtered.length && <p className="px-3 py-6 text-center text-xs text-default-400">No pages match your search.</p>}</div></CardBody></Card>;
}

export function PageAssignments({ route, functions, assignments, onToggle, onStatusChange }: {
  route: GovernanceRouteRow;
  functions: GovernanceFunctionRow[];
  assignments: FunctionAssignment[];
  onToggle: (functionSlug: string, placement: AssignmentPanelPlacement) => void;
  onStatusChange: (placement: AssignmentPanelPlacement, status: SidebarPageStatus) => void;
}) {
  return <Card><CardBody className="gap-5"><div><h2 className="text-xl font-bold">{route.label}</h2><p className="text-xs text-default-400">{route.path}</p><p className="mt-3 rounded-lg bg-default-100 p-3 text-xs text-default-500">Assign functions independently. Selecting both work perspectives stores Both internally; Unassigned functions remain publishable and hidden.</p></div><div className="grid gap-3 md:grid-cols-2">{assignmentPanelPlacements.map((placement) => <AssignmentPanel key={placement} placement={placement} functions={functions} assignments={assignments} onToggle={onToggle} onStatusChange={onStatusChange} />)}</div></CardBody></Card>;
}
