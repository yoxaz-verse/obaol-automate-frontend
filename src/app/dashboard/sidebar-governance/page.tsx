"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiArrowDown, FiArrowUp, FiEye, FiRefreshCw, FiSave, FiSearch, FiUploadCloud } from "react-icons/fi";
import { getData, postData, putData } from "@/core/api/apiHandler";
import { sidebarGovernanceRoutes } from "@/core/api/apiRoutes";
import type { SidebarGovernanceMapping, SidebarPageStatus } from "@/types/sidebarGovernance";
import { showToastMessage } from "@/utils/utils";
import { resolveSidebarGovernance } from "@/utils/sidebarGovernance";
import {
  applyAssignmentPanelStatus,
  assignmentPanelPlacements,
  getAssignmentPanelState,
  toggleFunctionPanel,
  type AssignmentPanelPlacement,
  type FunctionAssignment,
} from "@/utils/sidebarGovernanceEditor";

type FunctionRow = { _id: string; name: string; slug: string };
type RouteRow = { id: string; path: string; label: string; position?: "TOP" | "BOTTOM" };
type PageRule = { id: string; routePath: string; label: string; assignments: FunctionAssignment[] };
type Section = "SEEKING" | "PROVIDING" | "OTHER_SERVICES";
type AdminPayload = { config: { draft: { revision: number; resolutionVersion: number; sectionOrder: Record<Section, string[]>; mappings: SidebarGovernanceMapping[] }; published: { revision: number; resolutionVersion: number; updatedAt?: string } }; pageRules?: PageRule[]; functions: FunctionRow[]; routes: RouteRow[]; commonRoutes: RouteRow[] };

const statuses: SidebarPageStatus[] = ["LIVE", "COMING_SOON", "HIDDEN"];
const sectionLabels: Record<Section, string> = { SEEKING: "Seeking", PROVIDING: "Providing", OTHER_SERVICES: "Other Services" };
const statusLabel = (value: SidebarPageStatus) => value === "COMING_SOON" ? "Coming soon" : value[0] + value.slice(1).toLowerCase();
const panelDetails: Record<AssignmentPanelPlacement, { label: string; description: string }> = {
  SEEKING: { label: "Seeking For", description: "Shown when the company seeks this function." },
  PROVIDING: { label: "Providing", description: "Shown when the company provides this function." },
  BOTH: { label: "Seeking & Providing", description: "Shown independently on both company perspectives." },
  OTHER_SERVICES: { label: "Other Services", description: "Shown outside work sections. Hidden returns selected functions to Not shown." },
};

const groupMappings = (routes: RouteRow[], functions: FunctionRow[], mappings: SidebarGovernanceMapping[]): PageRule[] => routes.map((route) => {
  const rows = new Map(mappings.filter((row) => row.routePath === route.path).map((row) => [row.functionSlug, row]));
  return { id: route.id, routePath: route.path, label: route.label, assignments: functions.map((fn) => {
    const row = rows.get(fn.slug);
    return row ? { functionSlug: fn.slug, placement: row.placement === "OTHER_SERVICES" && row.status === "HIDDEN" ? "UNASSIGNED" : row.placement, status: row.status } : { functionSlug: fn.slug, placement: "UNASSIGNED", status: "HIDDEN" };
  }) };
});

function AssignmentPanel({
  placement,
  functions,
  assignments,
  onToggle,
  onStatusChange,
}: {
  placement: AssignmentPanelPlacement;
  functions: FunctionRow[];
  assignments: FunctionAssignment[];
  onToggle: (functionSlug: string, placement: AssignmentPanelPlacement) => void;
  onStatusChange: (placement: AssignmentPanelPlacement, status: SidebarPageStatus) => void;
}) {
  const details = panelDetails[placement];
  const state = getAssignmentPanelState(assignments, placement);
  const panelId = `assignment-panel-${placement.toLowerCase()}`;

  return <section aria-labelledby={panelId} className="rounded-2xl border border-default-200 bg-content1 p-4 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h3 id={panelId} className="font-bold">{details.label}</h3>
          <Chip size="sm" variant="flat">{state.count}</Chip>
        </div>
        <p className="mt-1 text-xs text-default-500">{details.description}</p>
      </div>
      {state.status === "MIXED" && <Chip size="sm" color="warning" variant="flat">Mixed statuses</Chip>}
    </div>
    <div role="group" aria-label={`${details.label} status`} className="mt-4 grid grid-cols-3 rounded-xl bg-default-100 p-1">
      {statuses.map((status) => {
        const active = state.status === status;
        return <button
          key={status}
          type="button"
          aria-pressed={active}
          disabled={state.count === 0}
          onClick={() => onStatusChange(placement, status)}
          className={`min-h-10 rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "bg-content1 text-foreground shadow-sm" : "text-default-500 hover:text-foreground"} disabled:cursor-not-allowed disabled:opacity-40`}
        >{statusLabel(status)}</button>;
      })}
    </div>
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={`${details.label} company functions`}>
      {functions.map((fn) => {
        const active = assignments.some((assignment) => assignment.functionSlug === fn.slug && assignment.placement === placement);
        return <button
          key={fn.slug}
          type="button"
          aria-pressed={active}
          onClick={() => onToggle(fn.slug, placement)}
          className={`min-h-11 rounded-full border px-3 py-2 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "border-primary bg-primary text-white shadow-sm" : "border-default-200 bg-background text-default-600 hover:border-primary/50 hover:text-foreground"}`}
        >{fn.name}</button>;
      })}
    </div>
  </section>;
}

function OrderList({ section, routes, order, onChange }: { section: Section; routes: RouteRow[]; order: string[]; onChange: (next: string[]) => void }) {
  const routeMap = new Map(routes.map((route) => [route.path, route]));
  const move = (index: number, offset: number) => { const target = index + offset; if (target < 0 || target >= order.length) return; const next = [...order]; [next[index], next[target]] = [next[target], next[index]]; onChange(next); };
  return <Card><CardBody className="gap-2 p-3"><p className="text-xs font-black uppercase tracking-wider text-default-500">{sectionLabels[section]} order</p><div className="max-h-72 space-y-1 overflow-auto">{order.map((path, index) => <div key={path} className="flex items-center gap-1 rounded-lg bg-default-100 px-2 py-1.5 text-xs"><span className="min-w-0 flex-1 truncate">{routeMap.get(path)?.label || path}</span><button aria-label={`Move ${routeMap.get(path)?.label} up in ${sectionLabels[section]}`} disabled={index === 0} onClick={() => move(index, -1)} className="rounded p-1 hover:bg-default-200 disabled:opacity-25"><FiArrowUp /></button><button aria-label={`Move ${routeMap.get(path)?.label} down in ${sectionLabels[section]}`} disabled={index === order.length - 1} onClick={() => move(index, 1)} className="rounded p-1 hover:bg-default-200 disabled:opacity-25"><FiArrowDown /></button></div>)}</div></CardBody></Card>;
}

function PreviewSection({ title, routes }: { title: string; routes: Array<{ path: string; label: string; status?: SidebarPageStatus }> }) {
  return <div className="mb-4"><p className="mb-2 text-[10px] font-black uppercase tracking-wider text-default-400">{title}</p><div className="space-y-1">{routes.map((route) => <div key={route.path} className="flex items-center justify-between rounded-lg bg-default-100 px-3 py-2 text-xs"><span>{route.label}</span>{route.status === "COMING_SOON" && <Chip size="sm" variant="flat">Soon</Chip>}</div>)}</div></div>;
}

export default function SidebarGovernancePage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["sidebar-governance", "admin"], queryFn: async () => (await getData(sidebarGovernanceRoutes.admin, {}, { cacheMode: "bypass" })).data.data as AdminPayload });
  const [pages, setPages] = useState<PageRule[]>([]);
  const [sectionOrder, setSectionOrder] = useState<Record<Section, string[]>>({ SEEKING: [], PROVIDING: [], OTHER_SERVICES: [] });
  const [selectedPath, setSelectedPath] = useState("");
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState("");
  const [publishOpen, setPublishOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewSought, setPreviewSought] = useState<string[]>([]);
  const [previewProvided, setPreviewProvided] = useState<string[]>([]);

  useEffect(() => { if (!query.data) return; setPages(groupMappings(query.data.routes, query.data.functions, query.data.config.draft.mappings)); setSectionOrder(query.data.config.draft.sectionOrder); setSelectedPath((value) => value || query.data.routes[0]?.path || ""); setDirty(false); }, [query.data]);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);

  const selected = pages.find((page) => page.routePath === selectedPath);
  const filteredPages = pages.filter((page) => `${page.label} ${page.routePath}`.toLowerCase().includes(search.trim().toLowerCase()));
  const updatePage = (updater: (page: PageRule) => PageRule) => { setPages((current) => current.map((page) => page.routePath === selectedPath ? updater(page) : page)); setDirty(true); };
  const mappings = useMemo(() => pages.flatMap((page) => page.assignments.map((assignment) => {
    const placement = assignment.placement === "UNASSIGNED" ? "OTHER_SERVICES" as const : assignment.placement;
    const status = assignment.placement === "UNASSIGNED" ? "HIDDEN" as const : assignment.status;
    const orderSection = placement === "BOTH" ? "SEEKING" : placement;
    return { functionSlug: assignment.functionSlug, routePath: page.routePath, placement, status, order: Math.max(0, sectionOrder[orderSection].indexOf(page.routePath)) };
  })), [pages, sectionOrder]);

  const toggleAssignmentPanel = (functionSlug: string, placement: AssignmentPanelPlacement) => updatePage((page) => ({
    ...page,
    assignments: toggleFunctionPanel(page.assignments, functionSlug, placement),
  }));
  const setAssignmentPanelStatus = (placement: AssignmentPanelPlacement, status: SidebarPageStatus) => updatePage((page) => ({
    ...page,
    assignments: applyAssignmentPanelStatus(page.assignments, placement, status),
  }));
  const togglePreview = (side: "sought" | "provided", slug: string) => { const setter = side === "sought" ? setPreviewSought : setPreviewProvided; setter((current) => current.includes(slug) ? current.filter((value) => value !== slug) : [...current, slug]); };
  const refresh = async () => client.invalidateQueries({ queryKey: ["sidebar-governance"] });
  const handleError = (error: any, fallback: string) => { const payload = error?.response?.data; if (error?.response?.status === 409) setConflict(payload?.message || "Another administrator changed this revision."); showToastMessage({ message: payload?.message || fallback, type: "error" }); };
  const draftPayload = () => ({ mappings, sectionOrder, fallbackStatusByRoute: Object.fromEntries(pages.map((page) => [page.routePath, "HIDDEN"])), resolutionVersion: 2, expectedDraftRevision: query.data!.config.draft.revision });
  const saveDraft = async () => { setSaving(true); try { await putData(sidebarGovernanceRoutes.draft, draftPayload()); setDirty(false); setConflict(""); showToastMessage({ message: "Page-first sidebar draft saved.", type: "success" }); await refresh(); } catch (error) { handleError(error, "Could not save the sidebar draft."); } finally { setSaving(false); } };
  const publish = async () => { setSaving(true); try { let revision = query.data!.config.draft.revision; if (dirty) { const saved = await putData(sidebarGovernanceRoutes.draft, draftPayload()); revision = saved.data.data.draft.revision; } await postData(sidebarGovernanceRoutes.publish, { expectedDraftRevision: revision, expectedPublishedRevision: query.data!.config.published.revision }); setDirty(false); setConflict(""); setPublishOpen(false); showToastMessage({ message: "Perspective-aware sidebar governance published.", type: "success" }); await refresh(); } catch (error) { handleError(error, "Could not publish sidebar governance."); } finally { setSaving(false); } };
  const restore = async () => { if (dirty && !window.confirm("Discard unsaved changes and restore the published revision?")) return; setSaving(true); try { await postData(sidebarGovernanceRoutes.resetDraft, { expectedDraftRevision: query.data!.config.draft.revision }); setDirty(false); setConflict(""); await refresh(); } catch (error) { handleError(error, "Could not restore the draft."); } finally { setSaving(false); } };

  if (query.isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner label="Loading sidebar governance" /></div>;
  if (query.isError || !query.data) return <Card><CardBody className="text-danger">Sidebar governance could not be loaded.</CardBody></Card>;
  const previewRows = resolveSidebarGovernance(mappings, previewProvided, previewSought, { resolutionVersion: 2, sectionOrder }).filter((row) => row.status !== "HIDDEN");
  const homeRoutes = query.data.commonRoutes.filter((route) => route.position === "TOP");
  const utilityRoutes = query.data.commonRoutes.filter((route) => route.position === "BOTTOM");

  return <div className="space-y-6 pb-16">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-black">Sidebar Governance</h1>{dirty && <Chip color="warning" variant="flat">Unsaved changes</Chip>}</div><p className="mt-1 text-sm text-default-500">Configure each page independently for every company function, then preview sought and provided perspectives.</p></div><div className="flex flex-wrap gap-2"><Button variant="flat" startContent={<FiRefreshCw />} onPress={restore} isDisabled={saving}>Restore published</Button><Button variant="flat" startContent={<FiSave />} onPress={saveDraft} isDisabled={!dirty || saving}>Save draft</Button><Button color="primary" startContent={<FiUploadCloud />} onPress={() => setPublishOpen(true)}>Publish</Button></div></div>
    {conflict && <div role="alert" className="rounded-xl border border-warning-300 bg-warning-50 p-3 text-sm text-warning-800">{conflict} Reload to reconcile with the current revision.</div>}
    <div className="flex flex-wrap gap-3 rounded-xl border border-default-200 bg-content1 p-3 text-xs text-default-500"><span>Draft <b className="text-foreground">v{query.data.config.draft.resolutionVersion} · revision {query.data.config.draft.revision}</b></span><span>Published <b className="text-foreground">v{query.data.config.published.resolutionVersion} · revision {query.data.config.published.revision}</b></span>{query.data.config.published.resolutionVersion === 1 && <Chip size="sm" color="warning" variant="flat">Legacy behavior remains live until publish</Chip>}</div>
    <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
      <Card className="h-fit"><CardBody className="gap-2 p-3"><p className="px-1 text-xs font-black uppercase tracking-wider text-default-400">Sidebar pages</p><Input size="sm" value={search} onValueChange={setSearch} aria-label="Search sidebar pages" placeholder="Search pages" startContent={<FiSearch />} />{filteredPages.map((page) => <button key={page.routePath} onClick={() => setSelectedPath(page.routePath)} className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${selectedPath === page.routePath ? "bg-primary/10 text-primary" : "hover:bg-default-100"}`}>{page.label}<span className="block truncate text-[10px] font-normal text-default-400">{page.routePath}</span></button>)}</CardBody></Card>
      <div className="space-y-4">{selected && <>
        <Card><CardBody className="gap-5">
          <div>
            <h2 className="text-xl font-bold">{selected.label}</h2>
            <p className="text-xs text-default-400">{selected.routePath}</p>
            <p className="mt-3 rounded-lg bg-default-100 p-3 text-xs text-default-500">Select a function chip to assign it to that panel. Selecting its active chip again removes it from this page. Each function can belong to only one panel.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {assignmentPanelPlacements.map((placement) => <AssignmentPanel
              key={placement}
              placement={placement}
              functions={query.data.functions}
              assignments={selected.assignments}
              onToggle={toggleAssignmentPanel}
              onStatusChange={setAssignmentPanelStatus}
            />)}
          </div>
          <div className="rounded-xl border border-dashed border-default-300 p-3">
            <p className="text-xs font-black uppercase tracking-wider text-default-400">Not shown</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selected.assignments.filter((assignment) => assignment.placement === "UNASSIGNED").map((assignment) => {
                const fn = query.data.functions.find((item) => item.slug === assignment.functionSlug);
                return <Chip key={assignment.functionSlug} size="sm" variant="flat">{fn?.name || assignment.functionSlug}</Chip>;
              })}
              {!selected.assignments.some((assignment) => assignment.placement === "UNASSIGNED") && <span className="text-xs text-default-400">All functions are assigned.</span>}
            </div>
          </div>
        </CardBody></Card>
        <div className="grid gap-3 md:grid-cols-3">{(["SEEKING", "PROVIDING", "OTHER_SERVICES"] as Section[]).map((section) => <OrderList key={section} section={section} routes={query.data.routes} order={sectionOrder[section]} onChange={(next) => { setSectionOrder((current) => ({ ...current, [section]: next })); setDirty(true); }} />)}</div>
      </>}</div>
      <Card className="h-fit xl:sticky xl:top-6"><CardBody className="gap-4"><div className="flex items-center gap-2"><FiEye /><h2 className="font-bold">Preview</h2></div><div className="flex gap-2"><Button size="sm" variant={previewDevice === "desktop" ? "solid" : "flat"} onPress={() => setPreviewDevice("desktop")}>Desktop</Button><Button size="sm" variant={previewDevice === "mobile" ? "solid" : "flat"} onPress={() => setPreviewDevice("mobile")}>Mobile</Button></div>{(["sought", "provided"] as const).map((side) => <fieldset key={side}><legend className="mb-2 text-[10px] font-black uppercase tracking-wider text-default-400">{side === "sought" ? "Seeking functions" : "Providing functions"}</legend><div className="flex flex-wrap gap-1">{query.data.functions.map((fn) => { const active = (side === "sought" ? previewSought : previewProvided).includes(fn.slug); return <button key={fn.slug} aria-pressed={active} onClick={() => togglePreview(side, fn.slug)} className={`rounded-full border px-2 py-1 text-[10px] ${active ? "border-primary bg-primary/10 text-primary" : "border-default-200 text-default-500"}`}>{fn.name}</button>; })}</div></fieldset>)}<div className={`rounded-xl border border-default-200 bg-background p-3 ${previewDevice === "mobile" ? "mx-auto max-w-[230px]" : "w-full"}`}><PreviewSection title="Home · always available" routes={homeRoutes} />{(["SEEKING", "PROVIDING", "OTHER_SERVICES"] as Section[]).map((section) => { const rows = previewRows.filter((row) => row.placement === section); return rows.length ? <PreviewSection key={section} title={sectionLabels[section]} routes={rows.map((row) => ({ path: row.routePath, label: query.data.routes.find((route) => route.path === row.routePath)?.label || row.routePath, status: row.status }))} /> : null; })}<PreviewSection title="Common · always available" routes={utilityRoutes} /></div></CardBody></Card>
    </div>
    <Modal isOpen={publishOpen} onOpenChange={setPublishOpen}><ModalContent><ModalHeader>Publish page-first governance?</ModalHeader><ModalBody><p className="text-sm text-default-600">Publish draft revision {query.data.config.draft.revision} as resolution v2 for {pages.length} pages and {query.data.functions.length} functions. This activates separate Seeking and Providing matching, page fallbacks, and all three section orders.</p>{dirty && <p className="text-sm text-warning">Unsaved edits will be saved first.</p>}</ModalBody><ModalFooter><Button variant="flat" onPress={() => setPublishOpen(false)}>Cancel</Button><Button color="primary" onPress={publish} isLoading={saving}>Publish complete draft</Button></ModalFooter></ModalContent></Modal>
  </div>;
}
