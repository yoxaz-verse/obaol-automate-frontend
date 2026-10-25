"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardBody, Chip, Switch, Tab, Tabs } from "@nextui-org/react";
import { FiArrowDown, FiArrowUp, FiEye } from "react-icons/fi";
import type { SidebarGovernanceMapping, SidebarPageStatus } from "@/types/sidebarGovernance";
import { resolveSidebarGovernance } from "@/utils/sidebarGovernance";
import { assignmentAppearsInPanel, type AssignmentMatrix, type GovernanceFunctionRow, type GovernanceRouteRow, type GovernanceSection, type SectionOrder } from "@/utils/sidebarGovernanceEditor";
import { governanceSectionLabels } from "./types";

const sections: GovernanceSection[] = ["IMPORTANT", "SEEKING", "PROVIDING", "OTHER_SERVICES"];

export function SectionOrderEditor({ routes, matrix, sectionOrder, onChange }: {
  routes: GovernanceRouteRow[];
  matrix: AssignmentMatrix;
  sectionOrder: SectionOrder;
  onChange: (section: GovernanceSection, order: string[]) => void;
}) {
  const [activeSection, setActiveSection] = useState<GovernanceSection>("IMPORTANT");
  const [showInactive, setShowInactive] = useState(false);
  const routeMap = useMemo(() => new Map(routes.map((route) => [route.path, route])), [routes]);
  const activePaths = useMemo(() => new Set(routes.filter((route) => {
    const visible = Object.values(matrix[route.path] || {}).filter((assignment) => assignment.status !== "HIDDEN");
    if (activeSection === "IMPORTANT") {
      const seeking = visible.some((assignment) => assignment.placement === "SEEKING" || assignment.placement === "BOTH");
      const providing = visible.some((assignment) => assignment.placement === "PROVIDING" || assignment.placement === "BOTH");
      return seeking && providing;
    }
    return visible.some((assignment) => assignmentAppearsInPanel(assignment, activeSection));
  }).map((route) => route.path)), [activeSection, matrix, routes]);
  const fullOrder = sectionOrder[activeSection];
  const visibleOrder = showInactive ? fullOrder : fullOrder.filter((path) => activePaths.has(path));
  const move = (visibleIndex: number, offset: number) => {
    const target = visibleIndex + offset;
    if (target < 0 || target >= visibleOrder.length) return;
    const next = [...fullOrder];
    const currentFullIndex = next.indexOf(visibleOrder[visibleIndex]);
    const targetFullIndex = next.indexOf(visibleOrder[target]);
    [next[currentFullIndex], next[targetFullIndex]] = [next[targetFullIndex], next[currentFullIndex]];
    onChange(activeSection, next);
  };
  return <Card><CardBody className="gap-3 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Section order</h3><p className="text-xs text-default-500">Reorder active pages; inactive routes retain their saved positions.</p></div><Switch size="sm" isSelected={showInactive} onValueChange={setShowInactive}>Show inactive</Switch></div><Tabs aria-label="Sidebar section order" selectedKey={activeSection} onSelectionChange={(key) => setActiveSection(String(key) as GovernanceSection)}>{sections.map((section) => <Tab key={section} title={`${governanceSectionLabels[section]} (${sectionOrder[section].filter((path) => routes.some((route) => route.path === path && Object.values(matrix[path] || {}).some((assignment) => assignment.status !== "HIDDEN" && assignmentAppearsInPanel(assignment, section)))).length})`} />)}</Tabs><div className="max-h-80 space-y-1 overflow-auto">{visibleOrder.map((path, index) => <div key={path} className="flex items-center gap-1 rounded-lg bg-default-100 px-3 py-2 text-xs"><span className="min-w-0 flex-1 truncate">{routeMap.get(path)?.label || path}</span>{!activePaths.has(path) && <Chip size="sm" variant="flat">Inactive</Chip>}<button aria-label={`Move ${routeMap.get(path)?.label} up in ${governanceSectionLabels[activeSection]}`} disabled={index === 0} onClick={() => move(index, -1)} className="rounded p-1 hover:bg-default-200 disabled:opacity-25"><FiArrowUp /></button><button aria-label={`Move ${routeMap.get(path)?.label} down in ${governanceSectionLabels[activeSection]}`} disabled={index === visibleOrder.length - 1} onClick={() => move(index, 1)} className="rounded p-1 hover:bg-default-200 disabled:opacity-25"><FiArrowDown /></button></div>)}{!visibleOrder.length && <p className="py-8 text-center text-xs text-default-400">No active pages in this section.</p>}</div></CardBody></Card>;
}

const PreviewSection = ({ title, routes }: { title: string; routes: Array<{ path: string; label: string; status?: SidebarPageStatus }> }) => <div className="mb-4"><p className="mb-2 text-[10px] font-black uppercase tracking-wider text-default-400">{title}</p><div className="space-y-1">{routes.map((route) => <div key={route.path} className="flex items-center justify-between rounded-lg bg-default-100 px-3 py-2 text-xs"><span>{route.label}</span>{route.status === "COMING_SOON" && <Chip size="sm" variant="flat">Soon</Chip>}</div>)}</div></div>;

export function SidebarGovernancePreview({ mappings, sectionOrder, functions, routes, commonRoutes }: {
  mappings: SidebarGovernanceMapping[];
  sectionOrder: SectionOrder;
  functions: GovernanceFunctionRow[];
  routes: GovernanceRouteRow[];
  commonRoutes: GovernanceRouteRow[];
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [sought, setSought] = useState<string[]>([]);
  const [provided, setProvided] = useState<string[]>([]);
  const routeMap = useMemo(() => new Map(routes.map((route) => [route.path, route])), [routes]);
  const rows = useMemo(() => resolveSidebarGovernance(mappings, provided, sought, { resolutionVersion: 3, sectionOrder }).filter((row) => row.status !== "HIDDEN"), [mappings, provided, sectionOrder, sought]);
  const toggle = (side: "sought" | "provided", slug: string) => { const setter = side === "sought" ? setSought : setProvided; setter((current) => current.includes(slug) ? current.filter((value) => value !== slug) : [...current, slug]); };
  return <Card className="h-fit xl:sticky xl:top-24"><CardBody className="gap-4"><div className="flex items-center gap-2"><FiEye /><h2 className="font-bold">Preview</h2></div><div className="flex gap-2"><Button size="sm" variant={device === "desktop" ? "solid" : "flat"} onPress={() => setDevice("desktop")}>Desktop</Button><Button size="sm" variant={device === "mobile" ? "solid" : "flat"} onPress={() => setDevice("mobile")}>Mobile</Button></div>{(["sought", "provided"] as const).map((side) => <fieldset key={side}><legend className="mb-2 text-[10px] font-black uppercase tracking-wider text-default-400">{side === "sought" ? "Seeking functions" : "Providing functions"}</legend><div className="flex flex-wrap gap-1">{functions.map((fn) => { const active = (side === "sought" ? sought : provided).includes(fn.slug); return <button key={fn.slug} type="button" aria-pressed={active} onClick={() => toggle(side, fn.slug)} className={`rounded-full border px-2 py-1 text-[10px] transition-colors ${active ? "border-obaol-500 bg-obaol-500/15 font-bold text-obaol-700 dark:text-obaol-300" : "border-default-200 text-default-500 hover:border-obaol-500/40"}`}>{fn.name}</button>; })}</div></fieldset>)}<div className={`rounded-xl border border-default-200 bg-background p-3 ${device === "mobile" ? "mx-auto max-w-[230px]" : "w-full"}`}><PreviewSection title="Home · always available" routes={commonRoutes.filter((route) => route.position === "TOP")} />{sections.map((section) => { const sectionRows = rows.filter((row) => row.placement === section); return sectionRows.length ? <PreviewSection key={section} title={governanceSectionLabels[section]} routes={sectionRows.map((row) => ({ path: row.routePath, label: routeMap.get(row.routePath)?.label || row.routePath, status: row.status }))} /> : null; })}<PreviewSection title="Common · always available" routes={commonRoutes.filter((route) => route.position === "BOTTOM")} /></div></CardBody></Card>;
}
