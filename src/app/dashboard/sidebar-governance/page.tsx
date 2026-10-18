"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiArrowDown, FiArrowUp, FiEye, FiRefreshCw, FiSave, FiSearch, FiUploadCloud } from "react-icons/fi";
import { getData, postData, putData } from "@/core/api/apiHandler";
import { sidebarGovernanceRoutes } from "@/core/api/apiRoutes";
import type { SidebarGovernanceMapping, SidebarPageStatus, SidebarPlacement } from "@/types/sidebarGovernance";
import { showToastMessage } from "@/utils/utils";
import { resolveSidebarGovernance } from "@/utils/sidebarGovernance";

type FunctionRow = { _id: string; name: string; slug: string };
type RouteRow = { id: string; path: string; label: string; position?: "TOP" | "BOTTOM" };
type FunctionPlacement = SidebarPlacement | "UNASSIGNED";
type FunctionAssignment = { functionSlug: string; placement: FunctionPlacement; status: SidebarPageStatus };
type PageRule = { id: string; routePath: string; label: string; assignments: FunctionAssignment[] };
type Section = "SEEKING" | "PROVIDING" | "OTHER_SERVICES";
type AdminPayload = { config: { draft: { revision: number; resolutionVersion: number; sectionOrder: Record<Section, string[]>; mappings: SidebarGovernanceMapping[] }; published: { revision: number; resolutionVersion: number; updatedAt?: string } }; pageRules?: PageRule[]; functions: FunctionRow[]; routes: RouteRow[]; commonRoutes: RouteRow[] };

const workPlacements: FunctionPlacement[] = ["SEEKING", "PROVIDING", "BOTH", "UNASSIGNED"];
const statuses: SidebarPageStatus[] = ["LIVE", "COMING_SOON", "HIDDEN"];
const sectionLabels: Record<Section, string> = { SEEKING: "Seeking", PROVIDING: "Providing", OTHER_SERVICES: "Other Services" };
const statusLabel = (value: SidebarPageStatus) => value === "COMING_SOON" ? "Coming soon" : value[0] + value.slice(1).toLowerCase();
const placementLabel = (value: FunctionPlacement) => value === "BOTH" ? "Seeking & Providing" : value === "SEEKING" ? "Seeking" : value === "PROVIDING" ? "Providing" : value === "OTHER_SERVICES" ? "Other Services (legacy)" : "Unassigned";

const groupMappings = (routes: RouteRow[], functions: FunctionRow[], mappings: SidebarGovernanceMapping[]): PageRule[] => routes.map((route) => {
  const rows = new Map(mappings.filter((row) => row.routePath === route.path).map((row) => [row.functionSlug, row]));
  return { id: route.id, routePath: route.path, label: route.label, assignments: functions.map((fn) => {
    const row = rows.get(fn.slug);
    return row ? { functionSlug: fn.slug, placement: row.placement === "OTHER_SERVICES" && row.status === "HIDDEN" ? "UNASSIGNED" : row.placement, status: row.status } : { functionSlug: fn.slug, placement: "UNASSIGNED", status: "HIDDEN" };
  }) };
});

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

  const setAssignment = (functionSlug: string, patch: Partial<FunctionAssignment>) => updatePage((page) => ({ ...page, assignments: page.assignments.map((assignment) => assignment.functionSlug === functionSlug ? { ...assignment, ...patch, ...(patch.placement === "UNASSIGNED" ? { status: "HIDDEN" as const } : ["UNASSIGNED", "OTHER_SERVICES"].includes(assignment.placement) && patch.placement ? { status: "LIVE" as const } : {}) } : assignment) }));
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
      <div className="space-y-4">{selected && <><Card><CardBody className="gap-4"><div><h2 className="text-xl font-bold">{selected.label}</h2><p className="text-xs text-default-400">{selected.routePath}</p><p className="mt-3 rounded-lg bg-default-100 p-3 text-xs text-default-500">Seeking matches only a company’s sought functions. Providing matches only its provided functions. Choose Both only when the same page genuinely serves both perspectives.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead><tr className="border-b border-default-200 text-xs uppercase tracking-wider text-default-400"><th className="px-3 py-2">Company function</th><th className="px-3 py-2">Perspective</th><th className="px-3 py-2">Status</th></tr></thead><tbody>{selected.assignments.map((assignment) => { const fn = query.data.functions.find((item) => item.slug === assignment.functionSlug); const unassigned = assignment.placement === "UNASSIGNED"; return <tr key={assignment.functionSlug} className="border-b border-default-100 last:border-0"><td className="px-3 py-3"><b className="text-sm">{fn?.name || assignment.functionSlug}</b><span className="block text-[10px] text-default-400">{assignment.functionSlug}</span></td><td className="px-3 py-3"><select aria-label={`${fn?.name || assignment.functionSlug} perspective`} value={assignment.placement} onChange={(event) => setAssignment(assignment.functionSlug, { placement: event.target.value as FunctionPlacement })} className="h-10 w-full rounded-lg border border-default-200 bg-content1 px-2 text-sm text-foreground">{assignment.placement === "OTHER_SERVICES" ? <option value="OTHER_SERVICES">Other Services (legacy)</option> : null}{workPlacements.map((value) => <option key={value} value={value}>{placementLabel(value)}</option>)}</select></td><td className="px-3 py-3"><select aria-label={`${fn?.name || assignment.functionSlug} status`} value={unassigned ? "HIDDEN" : assignment.status} disabled={unassigned} onChange={(event) => setAssignment(assignment.functionSlug, { status: event.target.value as SidebarPageStatus })} className="h-10 w-full rounded-lg border border-default-200 bg-content1 px-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50">{statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></td></tr>; })}</tbody></table></div></CardBody></Card><div className="grid gap-3 md:grid-cols-2">{(["SEEKING", "PROVIDING"] as Section[]).map((section) => <OrderList key={section} section={section} routes={query.data.routes} order={sectionOrder[section]} onChange={(next) => { setSectionOrder((current) => ({ ...current, [section]: next })); setDirty(true); }} />)}</div></>}</div>
      <Card className="h-fit xl:sticky xl:top-6"><CardBody className="gap-4"><div className="flex items-center gap-2"><FiEye /><h2 className="font-bold">Preview</h2></div><div className="flex gap-2"><Button size="sm" variant={previewDevice === "desktop" ? "solid" : "flat"} onPress={() => setPreviewDevice("desktop")}>Desktop</Button><Button size="sm" variant={previewDevice === "mobile" ? "solid" : "flat"} onPress={() => setPreviewDevice("mobile")}>Mobile</Button></div>{(["sought", "provided"] as const).map((side) => <fieldset key={side}><legend className="mb-2 text-[10px] font-black uppercase tracking-wider text-default-400">{side === "sought" ? "Seeking functions" : "Providing functions"}</legend><div className="flex flex-wrap gap-1">{query.data.functions.map((fn) => { const active = (side === "sought" ? previewSought : previewProvided).includes(fn.slug); return <button key={fn.slug} aria-pressed={active} onClick={() => togglePreview(side, fn.slug)} className={`rounded-full border px-2 py-1 text-[10px] ${active ? "border-primary bg-primary/10 text-primary" : "border-default-200 text-default-500"}`}>{fn.name}</button>; })}</div></fieldset>)}<div className={`rounded-xl border border-default-200 bg-background p-3 ${previewDevice === "mobile" ? "mx-auto max-w-[230px]" : "w-full"}`}><PreviewSection title="Home · always available" routes={homeRoutes} />{(["SEEKING", "PROVIDING", "OTHER_SERVICES"] as Section[]).map((section) => { const rows = previewRows.filter((row) => row.placement === section); return rows.length ? <PreviewSection key={section} title={sectionLabels[section]} routes={rows.map((row) => ({ path: row.routePath, label: query.data.routes.find((route) => route.path === row.routePath)?.label || row.routePath, status: row.status }))} /> : null; })}<PreviewSection title="Common · always available" routes={utilityRoutes} /></div></CardBody></Card>
    </div>
    <Modal isOpen={publishOpen} onOpenChange={setPublishOpen}><ModalContent><ModalHeader>Publish page-first governance?</ModalHeader><ModalBody><p className="text-sm text-default-600">Publish draft revision {query.data.config.draft.revision} as resolution v2 for {pages.length} pages and {query.data.functions.length} functions. This activates separate Seeking and Providing matching, page fallbacks, and all three section orders.</p>{dirty && <p className="text-sm text-warning">Unsaved edits will be saved first.</p>}</ModalBody><ModalFooter><Button variant="flat" onPress={() => setPublishOpen(false)}>Cancel</Button><Button color="primary" onPress={publish} isLoading={saving}>Publish complete draft</Button></ModalFooter></ModalContent></Modal>
  </div>;
}
