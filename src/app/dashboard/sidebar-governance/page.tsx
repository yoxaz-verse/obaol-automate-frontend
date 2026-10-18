"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiArrowDown, FiArrowUp, FiEye, FiMenu, FiRefreshCw, FiSave, FiSearch, FiUploadCloud } from "react-icons/fi";
import { getData, postData, putData } from "@/core/api/apiHandler";
import { sidebarGovernanceRoutes } from "@/core/api/apiRoutes";
import type { SidebarGovernanceMapping, SidebarPageStatus, SidebarPlacement } from "@/types/sidebarGovernance";
import { showToastMessage } from "@/utils/utils";
import { resolveSidebarGovernance } from "@/utils/sidebarGovernance";

type FunctionRow = { _id: string; name: string; slug: string };
type RouteRow = { id: string; path: string; label: string; position?: "TOP" | "BOTTOM" };
type AdminPayload = {
  config: { draft: { revision: number; updatedAt?: string; mappings: SidebarGovernanceMapping[] }; published: { revision: number; updatedAt?: string } };
  functions: FunctionRow[];
  routes: RouteRow[];
  commonRoutes: RouteRow[];
};

const placementOptions: SidebarPlacement[] = ["SEEKING", "PROVIDING", "BOTH", "OTHER_SERVICES"];
const statusOptions: SidebarPageStatus[] = ["LIVE", "COMING_SOON", "HIDDEN"];

function SortableRow({ mapping, route, onChange, onMove, dragDisabled, first, last }: { mapping: SidebarGovernanceMapping; route: RouteRow; onChange: (patch: Partial<SidebarGovernanceMapping>) => void; onMove: (direction: -1 | 1) => void; dragDisabled: boolean; first: boolean; last: boolean }) {
  const sortable = useSortable({ id: mapping.routePath, disabled: dragDisabled });
  return (
    <div ref={sortable.setNodeRef} style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition }} className="grid gap-3 rounded-xl border border-default-200 bg-content1 p-3 md:grid-cols-[32px_minmax(190px,1fr)_170px_170px] md:items-center">
      <div className="flex items-center gap-1"><button type="button" {...sortable.attributes} {...sortable.listeners} disabled={dragDisabled} aria-label={`Drag to reorder ${route.label}`} className="hidden h-9 w-8 cursor-grab items-center justify-center rounded-lg text-default-400 hover:bg-default-100 disabled:cursor-not-allowed disabled:opacity-30 md:flex"><FiMenu /></button><button type="button" onClick={() => onMove(-1)} disabled={dragDisabled || first} aria-label={`Move ${route.label} up`} className="flex h-8 w-8 items-center justify-center rounded-lg text-default-500 hover:bg-default-100 disabled:opacity-30 md:hidden"><FiArrowUp /></button><button type="button" onClick={() => onMove(1)} disabled={dragDisabled || last} aria-label={`Move ${route.label} down`} className="flex h-8 w-8 items-center justify-center rounded-lg text-default-500 hover:bg-default-100 disabled:opacity-30 md:hidden"><FiArrowDown /></button></div>
      <div className="min-w-0"><p className="truncate text-sm font-semibold">{route.label}</p><p className="truncate text-xs text-default-400">{route.path}</p></div>
      <label className="text-xs font-semibold text-default-500">Placement
        <select value={mapping.placement} onChange={(event) => onChange({ placement: event.target.value as SidebarPlacement })} className="mt-1 h-10 w-full rounded-lg border border-default-200 bg-content1 px-2 text-sm text-foreground">
          {placementOptions.map((value) => <option key={value} value={value}>{value === "BOTH" ? "Seeking & Providing" : value === "SEEKING" ? "Seeking" : value === "PROVIDING" ? "Providing" : "Other Services"}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold text-default-500">Status
        <select value={mapping.status} onChange={(event) => onChange({ status: event.target.value as SidebarPageStatus })} className="mt-1 h-10 w-full rounded-lg border border-default-200 bg-content1 px-2 text-sm text-foreground">
          {statusOptions.map((value) => <option key={value} value={value}>{value === "COMING_SOON" ? "Coming soon" : value[0] + value.slice(1).toLowerCase()}</option>)}
        </select>
      </label>
    </div>
  );
}

export default function SidebarGovernancePage() {
  const client = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const query = useQuery({ queryKey: ["sidebar-governance", "admin"], queryFn: async () => (await getData(sidebarGovernanceRoutes.admin, {}, { cacheMode: "bypass" })).data.data as AdminPayload });
  const [mappings, setMappings] = useState<SidebarGovernanceMapping[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [previewSlugs, setPreviewSlugs] = useState<string[]>([]);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [publishOpen, setPublishOpen] = useState(false);
  const [conflict, setConflict] = useState("");

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!query.data) return;
    const complete = query.data.functions.flatMap((fn) => query.data.routes.map((route, order) => (
      query.data.config.draft.mappings.find((row) => row.functionSlug === fn.slug && row.routePath === route.path) ||
      { functionSlug: fn.slug, routePath: route.path, placement: "BOTH" as const, status: "HIDDEN" as const, order }
    )));
    setMappings(complete);
    setSelectedSlug((current) => current || query.data.functions[0]?.slug || "");
    setPreviewSlugs((current) => current.length ? current : [query.data.functions[0]?.slug].filter(Boolean));
    setDirty(false);
  }, [query.data]);

  const routeMap = useMemo(() => new Map((query.data?.routes || []).map((route) => [route.path, route])), [query.data?.routes]);
  const selectedRows = useMemo(() => mappings.filter((row) => row.functionSlug === selectedSlug).sort((a, b) => a.order - b.order), [mappings, selectedSlug]);
  const visibleRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return needle ? selectedRows.filter((row) => `${routeMap.get(row.routePath)?.label} ${row.routePath}`.toLowerCase().includes(needle)) : selectedRows;
  }, [selectedRows, search, routeMap]);

  const updateRow = (routePath: string, patch: Partial<SidebarGovernanceMapping>) => {
    setMappings((current) => current.map((row) => row.functionSlug === selectedSlug && row.routePath === routePath ? { ...row, ...patch } : row));
    setDirty(true);
  };
  const moveRow = (routePath: string, direction: -1 | 1) => {
    if (search) return;
    const from = selectedRows.findIndex((row) => row.routePath === routePath);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= selectedRows.length) return;
    const ordered = arrayMove(selectedRows, from, to).map((row, order) => ({ ...row, order }));
    setMappings((current) => [...current.filter((row) => row.functionSlug !== selectedSlug), ...ordered]);
    setDirty(true);
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || search) return;
    const from = selectedRows.findIndex((row) => row.routePath === active.id);
    const to = selectedRows.findIndex((row) => row.routePath === over.id);
    const ordered = arrayMove(selectedRows, from, to).map((row, order) => ({ ...row, order }));
    setMappings((current) => [...current.filter((row) => row.functionSlug !== selectedSlug), ...ordered]);
    setDirty(true);
  };
  const refresh = async () => { await client.invalidateQueries({ queryKey: ["sidebar-governance"] }); };
  const handleMutationError = (error: any, fallback: string) => {
    const payload = error?.response?.data;
    if (error?.response?.status === 409) setConflict(payload?.message || "Another administrator changed this configuration. Reload the latest revision before continuing.");
    showToastMessage({ message: payload?.message || fallback, type: "error" });
  };
  const saveDraft = async () => {
    setSaving(true);
    try { await putData(sidebarGovernanceRoutes.draft, { mappings, expectedDraftRevision: query.data.config.draft.revision }); showToastMessage({ message: "Sidebar draft saved.", type: "success" }); setDirty(false); setConflict(""); await refresh(); }
    catch (error: any) { handleMutationError(error, "Could not save the sidebar draft."); }
    finally { setSaving(false); }
  };
  const publish = async () => {
    setSaving(true);
    try {
      let draftRevision = query.data.config.draft.revision;
      if (dirty) { const saved = await putData(sidebarGovernanceRoutes.draft, { mappings, expectedDraftRevision: draftRevision }); draftRevision = saved.data.data.draft.revision; }
      await postData(sidebarGovernanceRoutes.publish, { expectedDraftRevision: draftRevision, expectedPublishedRevision: query.data.config.published.revision });
      showToastMessage({ message: "Sidebar governance published.", type: "success" }); setDirty(false); setConflict(""); setPublishOpen(false); await refresh();
    } catch (error: any) { handleMutationError(error, "Could not publish sidebar governance."); }
    finally { setSaving(false); }
  };
  const resetDraft = async () => {
    setSaving(true);
    if (dirty && !window.confirm("Discard your unsaved changes and restore the published configuration?")) return;
    try { await postData(sidebarGovernanceRoutes.resetDraft, { expectedDraftRevision: query.data.config.draft.revision }); showToastMessage({ message: "Draft restored from the published revision.", type: "success" }); setDirty(false); setConflict(""); await refresh(); }
    catch (error: any) { handleMutationError(error, "Could not restore the draft."); }
    finally { setSaving(false); }
  };

  if (query.isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner label="Loading sidebar governance" /></div>;
  if (query.isError || !query.data) return <Card><CardBody className="text-danger">Sidebar governance could not be loaded.</CardBody></Card>;
  const previewRows = resolveSidebarGovernance(mappings, previewSlugs, previewSlugs).filter((row) => row.status !== "HIDDEN");
  const homeRoutes = query.data.commonRoutes.filter((route) => route.position === "TOP" || route.path === "/dashboard");
  const utilityRoutes = query.data.commonRoutes.filter((route) => route.position === "BOTTOM" || route.path !== "/dashboard");

  return <div className="space-y-6 pb-16">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><div className="flex items-center gap-2"><h1 className="text-2xl font-black">Sidebar Governance</h1>{dirty ? <Chip color="warning" variant="flat">Unsaved changes</Chip> : null}</div><p className="mt-1 text-sm text-default-500">Control associate navigation by company function, then publish the complete revision.</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="flat" startContent={<FiRefreshCw />} onPress={resetDraft} isDisabled={saving}>Restore published</Button><Button variant="flat" startContent={<FiSave />} onPress={saveDraft} isDisabled={!dirty || saving}>Save draft</Button><Button color="primary" startContent={<FiUploadCloud />} onPress={() => setPublishOpen(true)} isLoading={saving}>Publish</Button></div>
    </div>
    {conflict ? <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning-300 bg-warning-50 p-3 text-sm text-warning-800"><span>{conflict} Your local edits have not been discarded.</span><Button size="sm" color="warning" onPress={() => { setConflict(""); refresh(); }}>Reload latest revision</Button></div> : null}
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-default-200 bg-content1 p-3 text-xs text-default-500"><span>Draft revision <b className="text-foreground">{query.data.config.draft.revision}</b></span><span>Published revision <b className="text-foreground">{query.data.config.published.revision}</b></span>{query.data.config.published.updatedAt ? <span>Published {new Date(query.data.config.published.updatedAt).toLocaleString()}</span> : null}</div>
    <div className="grid gap-6 xl:grid-cols-[230px_minmax(0,1fr)_300px]">
      <Card className="h-fit"><CardBody className="gap-2 p-3"><p className="px-2 pb-2 text-xs font-black uppercase tracking-wider text-default-400">Company functions</p>{query.data.functions.map((fn) => <button key={fn.slug} onClick={() => { if (!dirty || window.confirm("Switch functions while keeping your unsaved changes?")) setSelectedSlug(fn.slug); }} className={`rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${selectedSlug === fn.slug ? "bg-primary/10 text-primary" : "hover:bg-default-100"}`}>{fn.name}</button>)}</CardBody></Card>
      <div className="space-y-3"><Input value={search} onValueChange={setSearch} aria-label="Search sidebar pages" placeholder="Search sidebar pages" startContent={<FiSearch />} /><p className="text-xs text-default-400">Drag or use the keyboard to reorder. Mobile users can use the arrow controls. Reordering is disabled while searching.</p><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}><SortableContext items={visibleRows.map((row) => row.routePath)} strategy={verticalListSortingStrategy}><div className="space-y-2">{visibleRows.map((row, index) => <SortableRow key={row.routePath} mapping={row} route={routeMap.get(row.routePath)!} dragDisabled={Boolean(search)} first={index === 0} last={index === visibleRows.length - 1} onMove={(direction) => moveRow(row.routePath, direction)} onChange={(patch) => updateRow(row.routePath, patch)} />)}</div></SortableContext></DndContext></div>
      <Card className="h-fit xl:sticky xl:top-6"><CardBody className="gap-4"><div className="flex items-center gap-2"><FiEye /><h2 className="font-bold">Preview</h2></div><div className="flex gap-2"><Button size="sm" variant={previewDevice === "desktop" ? "solid" : "flat"} onPress={() => setPreviewDevice("desktop")}>Desktop</Button><Button size="sm" variant={previewDevice === "mobile" ? "solid" : "flat"} onPress={() => setPreviewDevice("mobile")}>Mobile</Button></div><div><p className="mb-2 text-[10px] font-black uppercase tracking-wider text-default-400">Combine functions</p><div className="flex flex-wrap gap-1">{query.data.functions.map((fn) => <button key={fn.slug} onClick={() => setPreviewSlugs((current) => current.includes(fn.slug) ? current.filter((slug) => slug !== fn.slug) : [...current, fn.slug])} className={`rounded-full border px-2 py-1 text-[10px] ${previewSlugs.includes(fn.slug) ? "border-primary bg-primary/10 text-primary" : "border-default-200 text-default-500"}`}>{fn.name}</button>)}</div></div><div className={`rounded-xl border border-default-200 bg-background p-3 ${previewDevice === "mobile" ? "mx-auto max-w-[230px]" : "w-full"}`}><div className="mb-4"><p className="mb-2 text-[10px] font-black uppercase tracking-wider text-default-400">Home · always available</p><div className="space-y-1">{homeRoutes.map((route) => <div key={route.path} className="rounded-lg bg-default-100 px-3 py-2 text-xs">{route.label}</div>)}</div></div>{(["SEEKING", "PROVIDING", "OTHER_SERVICES"] as const).map((placement) => { const rows = previewRows.filter((row) => row.placement === placement); return rows.length ? <div key={placement} className="mb-4"><p className="mb-2 text-[10px] font-black uppercase tracking-wider text-default-400">{placement === "SEEKING" ? "Seeking" : placement === "PROVIDING" ? "Providing" : "Other Services"}</p><div className="space-y-1">{rows.map((row) => <div key={`${placement}-${row.routePath}`} className="flex items-center justify-between rounded-lg bg-default-100 px-3 py-2 text-xs"><span>{routeMap.get(row.routePath)?.label}</span>{row.status === "COMING_SOON" ? <Chip size="sm" variant="flat">Soon</Chip> : null}</div>)}</div></div> : null; })}<div><p className="mb-2 text-[10px] font-black uppercase tracking-wider text-default-400">Common · always available</p><div className="space-y-1">{utilityRoutes.map((route) => <div key={route.path} className="rounded-lg bg-default-100 px-3 py-2 text-xs">{route.label}</div>)}</div></div></div></CardBody></Card>
    </div>
    <Modal isOpen={publishOpen} onOpenChange={setPublishOpen}><ModalContent><ModalHeader>Publish sidebar revision?</ModalHeader><ModalBody><p className="text-sm text-default-600">This publishes the complete configuration for {query.data.functions.length} company functions. {dirty ? "Your unsaved edits will be saved first. " : ""}Published revision {query.data.config.published.revision} will be replaced.</p></ModalBody><ModalFooter><Button variant="flat" onPress={() => setPublishOpen(false)}>Cancel</Button><Button color="primary" startContent={<FiUploadCloud />} onPress={publish} isLoading={saving}>Publish complete draft</Button></ModalFooter></ModalContent></Modal>
  </div>;
}
