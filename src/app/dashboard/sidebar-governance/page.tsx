"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { Button, Card, CardBody, Spinner } from "@nextui-org/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiRefreshCw, FiSave, FiUploadCloud } from "react-icons/fi";
import { getData, postData, putData } from "@/core/api/apiHandler";
import { sidebarGovernanceRoutes } from "@/core/api/apiRoutes";
import type { SidebarPageStatus } from "@/types/sidebarGovernance";
import { showToastMessage } from "@/utils/utils";
import {
  compileGovernanceMappings,
  createAssignmentMatrix,
  createSidebarGovernanceEditorState,
  sidebarGovernanceEditorReducer,
  summarizeGovernanceChanges,
  type AssignmentPanelPlacement,
  type GovernanceSection,
} from "@/utils/sidebarGovernanceEditor";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { PageAssignments, PageSelector } from "@/components/sidebar-governance/PageAssignments";
import { SectionOrderEditor, SidebarGovernancePreview } from "@/components/sidebar-governance/OrderAndPreview";
import { ConflictBanner, PublishDialog, RevisionStatus } from "@/components/sidebar-governance/RevisionAndPublish";
import type { SidebarGovernanceAdminPayload } from "@/components/sidebar-governance/types";

const emptyOrder = { SEEKING: [], PROVIDING: [], OTHER_SERVICES: [] };
const emptyState = createSidebarGovernanceEditorState({}, emptyOrder, -1);

export default function SidebarGovernancePage() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["sidebar-governance", "admin"],
    queryFn: async () => (await getData(sidebarGovernanceRoutes.admin, {}, { cacheMode: "bypass" })).data.data as SidebarGovernanceAdminPayload,
  });
  const [editor, dispatch] = useReducer(sidebarGovernanceEditorReducer, emptyState);
  const [selectedPath, setSelectedPath] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState("");
  const [publishOpen, setPublishOpen] = useState(false);
  const dirty = editor.dirtyPages.length > 0 || editor.dirtySections.length > 0;
  useUnsavedChangesGuard(dirty);

  useEffect(() => {
    if (!query.data || dirty || editor.draftRevision === query.data.config.draft.revision) return;
    dispatch({ type: "HYDRATE", matrix: createAssignmentMatrix(query.data.routes, query.data.functions, query.data.config.draft.mappings), sectionOrder: query.data.config.draft.sectionOrder, draftRevision: query.data.config.draft.revision });
    setSelectedPath((value) => value || query.data.routes[0]?.path || "");
  }, [dirty, editor.draftRevision, query.data]);

  const routeMap = useMemo(() => new Map((query.data?.routes || []).map((route) => [route.path, route])), [query.data?.routes]);
  const selectedRoute = routeMap.get(selectedPath);
  const selectedAssignments = useMemo(() => Object.values(editor.matrix[selectedPath] || {}), [editor.matrix, selectedPath]);
  const mappings = useMemo(() => compileGovernanceMappings(editor.matrix, editor.sectionOrder), [editor.matrix, editor.sectionOrder]);
  const summary = useMemo(() => summarizeGovernanceChanges(editor), [editor]);

  const updateCachedConfig = (config: any) => client.setQueryData<SidebarGovernanceAdminPayload>(["sidebar-governance", "admin"], (current) => current ? {
    ...current,
    config: {
      draft: { ...current.config.draft, ...config.draft },
      published: config.published ? { revision: config.published.revision, resolutionVersion: config.published.resolutionVersion, updatedAt: config.published.updatedAt } : current.config.published,
    },
  } : current);
  const draftPayload = () => ({ mappings, sectionOrder: editor.sectionOrder, fallbackStatusByRoute: Object.fromEntries((query.data?.routes || []).map((route) => [route.path, "HIDDEN"])), resolutionVersion: 2, expectedDraftRevision: editor.draftRevision });
  const handleError = (error: any, fallback: string) => {
    const payload = error?.response?.data;
    if (error?.response?.status === 409) setConflict(payload?.message || "Another administrator changed this revision.");
    showToastMessage({ message: payload?.message || fallback, type: "error" });
  };
  const saveCurrentDraft = async () => {
    const response = await putData(sidebarGovernanceRoutes.draft, draftPayload());
    const config = response.data.data;
    dispatch({ type: "COMMIT", draftRevision: config.draft.revision });
    updateCachedConfig(config);
    setConflict("");
    return Number(config.draft.revision);
  };
  const saveDraft = async () => {
    setSaving(true);
    try {
      await saveCurrentDraft();
      showToastMessage({ message: "Sidebar governance draft saved.", type: "success" });
    } catch (error) {
      handleError(error, "Could not save the sidebar draft.");
    } finally {
      setSaving(false);
    }
  };
  const publish = async () => {
    if (!query.data) return;
    setSaving(true);
    try {
      const revision = dirty ? await saveCurrentDraft() : editor.draftRevision;
      const response = await postData(sidebarGovernanceRoutes.publish, { expectedDraftRevision: revision, expectedPublishedRevision: query.data.config.published.revision });
      updateCachedConfig(response.data.data);
      dispatch({ type: "COMMIT", draftRevision: revision });
      setConflict("");
      setPublishOpen(false);
      await client.invalidateQueries({ queryKey: ["sidebar-governance", "published"] });
      showToastMessage({ message: "Sidebar governance published.", type: "success" });
    } catch (error) {
      handleError(error, "Could not publish sidebar governance.");
    } finally {
      setSaving(false);
    }
  };
  const restore = async () => {
    if (!query.data || (dirty && !window.confirm("Discard unsaved changes and restore the published revision?"))) return;
    setSaving(true);
    try {
      const response = await postData(sidebarGovernanceRoutes.resetDraft, { expectedDraftRevision: editor.draftRevision });
      const config = response.data.data;
      updateCachedConfig(config);
      dispatch({ type: "HYDRATE", matrix: createAssignmentMatrix(query.data.routes, query.data.functions, config.draft.mappings), sectionOrder: config.draft.sectionOrder, draftRevision: config.draft.revision });
      setConflict("");
      showToastMessage({ message: "Draft restored from the published revision.", type: "success" });
    } catch (error) {
      handleError(error, "Could not restore the draft.");
    } finally {
      setSaving(false);
    }
  };
  const reloadCurrent = async () => {
    if (!query.data || !window.confirm("Replace local edits with the current server draft?")) return;
    const result = await query.refetch();
    if (!result.data) return;
    dispatch({ type: "HYDRATE", matrix: createAssignmentMatrix(result.data.routes, result.data.functions, result.data.config.draft.mappings), sectionOrder: result.data.config.draft.sectionOrder, draftRevision: result.data.config.draft.revision });
    setConflict("");
  };
  const copyLocalChanges = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify({ mappings, sectionOrder: editor.sectionOrder, summary }, null, 2));
      showToastMessage({ message: "Local governance changes copied.", type: "success" });
    } catch {
      showToastMessage({ message: "Could not copy local changes.", type: "error" });
    }
  };

  if (query.isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner label="Loading sidebar governance" /></div>;
  if (query.isError || !query.data) return <Card><CardBody className="text-danger">Sidebar governance could not be loaded.</CardBody></Card>;

  return <div className="space-y-5 pb-16">
    <div className="sticky top-0 z-30 -mx-3 flex flex-wrap items-start justify-between gap-4 border-b border-default-200 bg-background/95 px-3 py-3 backdrop-blur-xl md:-mx-6 md:px-6"><div><h1 className="text-2xl font-black">Sidebar Governance</h1><p className="mt-1 text-sm text-default-500">Configure pages once, preview both company perspectives, then publish atomically.</p></div><div className="flex flex-wrap gap-2"><Button variant="flat" startContent={<FiRefreshCw />} onPress={restore} isDisabled={saving}>Restore published</Button><Button variant="flat" startContent={<FiSave />} onPress={saveDraft} isDisabled={!dirty || saving}>Save draft</Button><Button color="warning" className="font-bold" startContent={<FiUploadCloud />} onPress={() => setPublishOpen(true)} isDisabled={saving}>Publish</Button></div></div>
    <ConflictBanner message={conflict} onReload={reloadCurrent} onCopy={copyLocalChanges} />
    <RevisionStatus draftRevision={editor.draftRevision} publishedRevision={query.data.config.published.revision} publishedVersion={query.data.config.published.resolutionVersion} publishedAt={query.data.config.published.updatedAt} dirty={dirty} />
    <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)_320px]">
      <PageSelector routes={query.data.routes} matrix={editor.matrix} dirtyPages={editor.dirtyPages} selectedPath={selectedPath} search={search} onSearch={setSearch} onSelect={setSelectedPath} />
      <div className="space-y-4">{selectedRoute && <PageAssignments route={selectedRoute} functions={query.data.functions} assignments={selectedAssignments} onToggle={(functionSlug, placement) => dispatch({ type: "TOGGLE_FUNCTION", routePath: selectedPath, functionSlug, placement })} onStatusChange={(placement: AssignmentPanelPlacement, status: SidebarPageStatus) => dispatch({ type: "SET_PANEL_STATUS", routePath: selectedPath, placement, status })} />}<SectionOrderEditor routes={query.data.routes} matrix={editor.matrix} sectionOrder={editor.sectionOrder} onChange={(section: GovernanceSection, order) => dispatch({ type: "SET_SECTION_ORDER", section, order })} /></div>
      <SidebarGovernancePreview mappings={mappings} sectionOrder={editor.sectionOrder} functions={query.data.functions} routes={query.data.routes} commonRoutes={query.data.commonRoutes} />
    </div>
    <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} saving={saving} dirty={dirty} draftRevision={editor.draftRevision} pageCount={query.data.routes.length} functionCount={query.data.functions.length} summary={summary} onPublish={publish} />
  </div>;
}
