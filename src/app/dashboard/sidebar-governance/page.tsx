"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiArrowDown, FiArrowUp, FiEye, FiPlus, FiRefreshCw, FiSave, FiSearch, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { getData, postData, putData } from "@/core/api/apiHandler";
import { sidebarGovernanceRoutes } from "@/core/api/apiRoutes";
import type { SidebarGovernanceMapping, SidebarPageStatus, SidebarPlacement } from "@/types/sidebarGovernance";
import { showToastMessage } from "@/utils/utils";
import { resolveSidebarGovernance } from "@/utils/sidebarGovernance";

type FunctionRow = { _id: string; name: string; slug: string };
type RouteRow = { id: string; path: string; label: string; position?: "TOP" | "BOTTOM" };
type WorkRule = { placement: Exclude<SidebarPlacement, "OTHER_SERVICES">; status: SidebarPageStatus; functionSlugs: string[] };
type PageRule = { id: string; routePath: string; label: string; rules: WorkRule[]; fallbackStatus: SidebarPageStatus };
type Section = "SEEKING" | "PROVIDING" | "OTHER_SERVICES";
type AdminPayload = { config: { draft: { revision: number; resolutionVersion: number; sectionOrder: Record<Section, string[]>; mappings: SidebarGovernanceMapping[] }; published: { revision: number; resolutionVersion: number; updatedAt?: string } }; pageRules?: PageRule[]; functions: FunctionRow[]; routes: RouteRow[]; commonRoutes: RouteRow[] };

const workPlacements: WorkRule["placement"][] = ["SEEKING", "PROVIDING", "BOTH"];
const statuses: SidebarPageStatus[] = ["LIVE", "COMING_SOON", "HIDDEN"];
const sectionLabels: Record<Section, string> = { SEEKING: "Seeking", PROVIDING: "Providing", OTHER_SERVICES: "Other Services" };
const statusLabel = (value: SidebarPageStatus) => value === "COMING_SOON" ? "Coming soon" : value[0] + value.slice(1).toLowerCase();
const placementLabel = (value: WorkRule["placement"]) => value === "BOTH" ? "Seeking & Providing" : value === "SEEKING" ? "Seeking" : "Providing";

const groupMappings = (routes: RouteRow[], mappings: SidebarGovernanceMapping[]): PageRule[] => routes.map((route) => {
  const rows = mappings.filter((row) => row.routePath === route.path);
  const grouped = new Map<string, WorkRule>();
  rows.filter((row) => row.placement !== "OTHER_SERVICES").forEach((row) => {
    const key = `${row.placement}:${row.status}`;
    const rule = grouped.get(key) || { placement: row.placement as WorkRule["placement"], status: row.status, functionSlugs: [] };
    rule.functionSlugs.push(row.functionSlug);
    grouped.set(key, rule);
  });
  const fallback = (["LIVE", "COMING_SOON", "HIDDEN"] as SidebarPageStatus[]).find((status) => rows.some((row) => row.placement === "OTHER_SERVICES" && row.status === status)) || "HIDDEN";
  return { id: route.id, routePath: route.path, label: route.label, rules: [...grouped.values()], fallbackStatus: fallback };
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

  useEffect(() => { if (!query.data) return; setPages(query.data.pageRules?.length ? query.data.pageRules : groupMappings(query.data.routes, query.data.config.draft.mappings)); setSectionOrder(query.data.config.draft.sectionOrder); setSelectedPath((value) => value || query.data.routes[0]?.path || ""); setDirty(false); }, [query.data]);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);

  const selected = pages.find((page) => page.routePath === selectedPath);
  const filteredPages = pages.filter((page) => `${page.label} ${page.routePath}`.toLowerCase().includes(search.trim().toLowerCase()));
  const updatePage = (updater: (page: PageRule) => PageRule) => { setPages((current) => current.map((page) => page.routePath === selectedPath ? updater(page) : page)); setDirty(true); };
  const mappings = useMemo(() => pages.flatMap((page) => {
    const assigned = new Set(page.rules.flatMap((rule) => rule.functionSlugs));
    const rows = page.rules.flatMap((rule) => rule.functionSlugs.map((functionSlug) => ({ functionSlug, routePath: page.routePath, placement: rule.placement, status: rule.status, order: Math.max(0, sectionOrder[rule.placement === "BOTH" ? "SEEKING" : rule.placement].indexOf(page.routePath)) })));
    return [...rows, ...(query.data?.functions || []).filter((fn) => !assigned.has(fn.slug)).map((fn) => ({ functionSlug: fn.slug, routePath: page.routePath, placement: "OTHER_SERVICES" as const, status: page.fallbackStatus, order: Math.max(0, sectionOrder.OTHER_SERVICES.indexOf(page.routePath)) }))];
  }), [pages, query.data?.functions, sectionOrder]);
  const duplicates = selected ? selected.rules.flatMap((rule) => rule.functionSlugs).filter((slug, index, all) => all.indexOf(slug) !== index) : [];

  const setRule = (index: number, patch: Partial<WorkRule>) => updatePage((page) => ({ ...page, rules: page.rules.map((rule, ruleIndex) => ruleIndex === index ? { ...rule, ...patch } : rule) }));
  const toggleFunction = (ruleIndex: number, slug: string) => {
    if (!selected) return;
    const owner = selected.rules.findIndex((rule, index) => index !== ruleIndex && rule.functionSlugs.includes(slug));
    if (owner >= 0) { showToastMessage({ message: `${query.data?.functions.find((fn) => fn.slug === slug)?.name || slug} is already in another rule. Remove it there, or use one Both rule.`, type: "error" }); return; }
    const rule = selected.rules[ruleIndex];
    setRule(ruleIndex, { functionSlugs: rule.functionSlugs.includes(slug) ? rule.functionSlugs.filter((value) => value !== slug) : [...rule.functionSlugs, slug] });
  };
  const togglePreview = (side: "sought" | "provided", slug: string) => { const setter = side === "sought" ? setPreviewSought : setPreviewProvided; setter((current) => current.includes(slug) ? current.filter((value) => value !== slug) : [...current, slug]); };
  const refresh = async () => client.invalidateQueries({ queryKey: ["sidebar-governance"] });
  const handleError = (error: any, fallback: string) => { const payload = error?.response?.data; if (error?.response?.status === 409) setConflict(payload?.message || "Another administrator changed this revision."); showToastMessage({ message: payload?.message || fallback, type: "error" }); };
  const draftPayload = () => ({ mappings, sectionOrder, fallbackStatusByRoute: Object.fromEntries(pages.map((page) => [page.routePath, page.fallbackStatus])), resolutionVersion: 2, expectedDraftRevision: query.data!.config.draft.revision });
  const saveDraft = async () => { setSaving(true); try { await putData(sidebarGovernanceRoutes.draft, draftPayload()); setDirty(false); setConflict(""); showToastMessage({ message: "Page-first sidebar draft saved.", type: "success" }); await refresh(); } catch (error) { handleError(error, "Could not save the sidebar draft."); } finally { setSaving(false); } };
  const publish = async () => { setSaving(true); try { let revision = query.data!.config.draft.revision; if (dirty) { const saved = await putData(sidebarGovernanceRoutes.draft, draftPayload()); revision = saved.data.data.draft.revision; } await postData(sidebarGovernanceRoutes.publish, { expectedDraftRevision: revision, expectedPublishedRevision: query.data!.config.published.revision }); setDirty(false); setConflict(""); setPublishOpen(false); showToastMessage({ message: "Perspective-aware sidebar governance published.", type: "success" }); await refresh(); } catch (error) { handleError(error, "Could not publish sidebar governance."); } finally { setSaving(false); } };
  const restore = async () => { if (dirty && !window.confirm("Discard unsaved changes and restore the published revision?")) return; setSaving(true); try { await postData(sidebarGovernanceRoutes.resetDraft, { expectedDraftRevision: query.data!.config.draft.revision }); setDirty(false); setConflict(""); await refresh(); } catch (error) { handleError(error, "Could not restore the draft."); } finally { setSaving(false); } };

  if (query.isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner label="Loading sidebar governance" /></div>;
  if (query.isError || !query.data) return <Card><CardBody className="text-danger">Sidebar governance could not be loaded.</CardBody></Card>;
  const previewRows = resolveSidebarGovernance(mappings, previewProvided, previewSought, { resolutionVersion: 2, sectionOrder }).filter((row) => row.status !== "HIDDEN");
  const homeRoutes = query.data.commonRoutes.filter((route) => route.position === "TOP");
  const utilityRoutes = query.data.commonRoutes.filter((route) => route.position === "BOTTOM");

  return <div className="space-y-6 pb-16">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-black">Sidebar Governance</h1>{dirty && <Chip color="warning" variant="flat">Unsaved changes</Chip>}</div><p className="mt-1 text-sm text-default-500">Configure each page once, assign multi-function audiences, then preview sought and provided perspectives.</p></div><div className="flex flex-wrap gap-2"><Button variant="flat" startContent={<FiRefreshCw />} onPress={restore} isDisabled={saving}>Restore published</Button><Button variant="flat" startContent={<FiSave />} onPress={saveDraft} isDisabled={!dirty || saving || duplicates.length > 0}>Save draft</Button><Button color="primary" startContent={<FiUploadCloud />} onPress={() => setPublishOpen(true)} isDisabled={duplicates.length > 0}>Publish</Button></div></div>
    {conflict && <div role="alert" className="rounded-xl border border-warning-300 bg-warning-50 p-3 text-sm text-warning-800">{conflict} Reload to reconcile with the current revision.</div>}
    <div className="flex flex-wrap gap-3 rounded-xl border border-default-200 bg-content1 p-3 text-xs text-default-500"><span>Draft <b className="text-foreground">v{query.data.config.draft.resolutionVersion} · revision {query.data.config.draft.revision}</b></span><span>Published <b className="text-foreground">v{query.data.config.published.resolutionVersion} · revision {query.data.config.published.revision}</b></span>{query.data.config.published.resolutionVersion === 1 && <Chip size="sm" color="warning" variant="flat">Legacy behavior remains live until publish</Chip>}</div>
    <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
      <Card className="h-fit"><CardBody className="gap-2 p-3"><p className="px-1 text-xs font-black uppercase tracking-wider text-default-400">Sidebar pages</p><Input size="sm" value={search} onValueChange={setSearch} aria-label="Search sidebar pages" placeholder="Search pages" startContent={<FiSearch />} />{filteredPages.map((page) => <button key={page.routePath} onClick={() => setSelectedPath(page.routePath)} className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${selectedPath === page.routePath ? "bg-primary/10 text-primary" : "hover:bg-default-100"}`}>{page.label}<span className="block truncate text-[10px] font-normal text-default-400">{page.routePath}</span></button>)}</CardBody></Card>
      <div className="space-y-4">{selected && <><Card><CardBody className="gap-4"><div><h2 className="text-xl font-bold">{selected.label}</h2><p className="text-xs text-default-400">{selected.routePath}</p></div>{selected.rules.map((rule, index) => <div key={index} className="space-y-3 rounded-xl border border-default-200 p-3"><div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><label className="text-xs font-semibold text-default-500">Placement<select value={rule.placement} onChange={(event) => setRule(index, { placement: event.target.value as WorkRule["placement"] })} className="mt-1 h-10 w-full rounded-lg border border-default-200 bg-content1 px-2 text-sm text-foreground">{workPlacements.map((value) => <option key={value} value={value}>{placementLabel(value)}</option>)}</select></label><label className="text-xs font-semibold text-default-500">Status<select value={rule.status} onChange={(event) => setRule(index, { status: event.target.value as SidebarPageStatus })} className="mt-1 h-10 w-full rounded-lg border border-default-200 bg-content1 px-2 text-sm text-foreground">{statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></label><Button isIconOnly variant="light" color="danger" aria-label={`Remove rule ${index + 1}`} onPress={() => updatePage((page) => ({ ...page, rules: page.rules.filter((_, ruleIndex) => ruleIndex !== index) }))}><FiTrash2 /></Button></div><fieldset><legend className="mb-2 text-xs font-semibold text-default-500">Company functions</legend><div className="flex flex-wrap gap-2">{query.data.functions.map((fn) => { const active = rule.functionSlugs.includes(fn.slug); const occupied = !active && selected.rules.some((other, otherIndex) => otherIndex !== index && other.functionSlugs.includes(fn.slug)); return <button type="button" key={fn.slug} aria-pressed={active} onClick={() => toggleFunction(index, fn.slug)} className={`rounded-full border px-3 py-1.5 text-xs ${active ? "border-primary bg-primary/10 text-primary" : occupied ? "border-default-100 text-default-300" : "border-default-200 text-default-600 hover:border-primary"}`}>{fn.name}</button>; })}</div></fieldset></div>)}<Button variant="flat" startContent={<FiPlus />} onPress={() => updatePage((page) => ({ ...page, rules: [...page.rules, { placement: "SEEKING", status: "LIVE", functionSlugs: [] }] }))}>Add audience rule</Button><label className="text-sm font-semibold">Unselected functions in Other Services<select value={selected.fallbackStatus} onChange={(event) => updatePage((page) => ({ ...page, fallbackStatus: event.target.value as SidebarPageStatus }))} className="mt-2 h-11 w-full rounded-lg border border-default-200 bg-content1 px-3 font-normal text-foreground">{statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></label><p className="text-xs text-default-400">Every function not selected above receives this page in Other Services with the chosen status.</p></CardBody></Card><div className="grid gap-3 md:grid-cols-3">{(["SEEKING", "PROVIDING", "OTHER_SERVICES"] as Section[]).map((section) => <OrderList key={section} section={section} routes={query.data.routes} order={sectionOrder[section]} onChange={(next) => { setSectionOrder((current) => ({ ...current, [section]: next })); setDirty(true); }} />)}</div></>}</div>
      <Card className="h-fit xl:sticky xl:top-6"><CardBody className="gap-4"><div className="flex items-center gap-2"><FiEye /><h2 className="font-bold">Preview</h2></div><div className="flex gap-2"><Button size="sm" variant={previewDevice === "desktop" ? "solid" : "flat"} onPress={() => setPreviewDevice("desktop")}>Desktop</Button><Button size="sm" variant={previewDevice === "mobile" ? "solid" : "flat"} onPress={() => setPreviewDevice("mobile")}>Mobile</Button></div>{(["sought", "provided"] as const).map((side) => <fieldset key={side}><legend className="mb-2 text-[10px] font-black uppercase tracking-wider text-default-400">{side === "sought" ? "Seeking functions" : "Providing functions"}</legend><div className="flex flex-wrap gap-1">{query.data.functions.map((fn) => { const active = (side === "sought" ? previewSought : previewProvided).includes(fn.slug); return <button key={fn.slug} aria-pressed={active} onClick={() => togglePreview(side, fn.slug)} className={`rounded-full border px-2 py-1 text-[10px] ${active ? "border-primary bg-primary/10 text-primary" : "border-default-200 text-default-500"}`}>{fn.name}</button>; })}</div></fieldset>)}<div className={`rounded-xl border border-default-200 bg-background p-3 ${previewDevice === "mobile" ? "mx-auto max-w-[230px]" : "w-full"}`}><PreviewSection title="Home · always available" routes={homeRoutes} />{(["SEEKING", "PROVIDING", "OTHER_SERVICES"] as Section[]).map((section) => { const rows = previewRows.filter((row) => row.placement === section); return rows.length ? <PreviewSection key={section} title={sectionLabels[section]} routes={rows.map((row) => ({ path: row.routePath, label: query.data.routes.find((route) => route.path === row.routePath)?.label || row.routePath, status: row.status }))} /> : null; })}<PreviewSection title="Common · always available" routes={utilityRoutes} /></div></CardBody></Card>
    </div>
    <Modal isOpen={publishOpen} onOpenChange={setPublishOpen}><ModalContent><ModalHeader>Publish page-first governance?</ModalHeader><ModalBody><p className="text-sm text-default-600">Publish draft revision {query.data.config.draft.revision} as resolution v2 for {pages.length} pages and {query.data.functions.length} functions. This activates separate Seeking and Providing matching, page fallbacks, and all three section orders.</p>{dirty && <p className="text-sm text-warning">Unsaved edits will be saved first.</p>}</ModalBody><ModalFooter><Button variant="flat" onPress={() => setPublishOpen(false)}>Cancel</Button><Button color="primary" onPress={publish} isLoading={saving}>Publish complete draft</Button></ModalFooter></ModalContent></Modal>
  </div>;
}
