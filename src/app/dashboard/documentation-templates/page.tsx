"use client";

import React, { useMemo, useState } from "react";
import { Button, Card, CardBody, Input, Select, SelectItem, Switch } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Title from "@/components/titles";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import TemplateCanvasRenderer from "@/components/dashboard/Documents/TemplateCanvasRenderer";

const DEFAULT_DOC_TYPES = [
  "LOI", "QUOTATION", "PROFORMA_INVOICE", "INVOICE", "PURCHASE_ORDER", "SALES_CONTRACT", "PACKING_LIST", "QUALITY_CERTIFICATE", "INSPECTION_CERTIFICATE", "PHYTOSANITARY_CERTIFICATE", "FUMIGATION_CERTIFICATE", "BILL_OF_LADING", "AIR_WAYBILL", "LORRY_RECEIPT", "LCL_DRAFT", "INSURANCE_CERTIFICATE", "PAYMENT_ADVICE", "SHIPPING_BILL", "CERTIFICATE_OF_ORIGIN", "DISPATCH_CHALLAN", "BILL_OF_ENTRY", "CUSTOMS_CLEARANCE", "GOODS_RECEIPT",
];

const STAGE_OPTIONS = ["PREVIEW", "LIVE"];

const makeElement = (type: string) => ({
  id: `${String(type).toLowerCase()}-${Date.now()}`,
  type,
  label: type.replaceAll("_", " "),
  x: 40,
  y: 40,
  width: type === "LINE" ? 250 : 180,
  height: type === "LINE" ? 2 : 60,
  visible: true,
  zIndex: 50,
  locked: false,
  content: type === "TEXT" ? "Sample text" : "",
  style: {},
  typography: { fontSize: 12, fontWeight: 500, color: "#111827", textAlign: "left" },
  binding: { bindingType: "SYSTEM_TOKEN", token: "", fieldKey: "", required: false, defaultValue: "" },
});

export default function DocumentationTemplatesPage() {
  const queryClient = useQueryClient();
  const [documentType, setDocumentType] = useState("LOI");
  const [scope, setScope] = useState<"GLOBAL" | "COMPANY_OVERRIDE">("GLOBAL");
  const [companyId, setCompanyId] = useState<string>("");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [localLayout, setLocalLayout] = useState<any>(null);
  const [publishStage, setPublishStage] = useState<string>("LIVE");
  const [activationMode, setActivationMode] = useState<"IMMEDIATE" | "SCHEDULED">("IMMEDIATE");
  const [activationAt, setActivationAt] = useState<string>("");
  const [letterheadEnabled, setLetterheadEnabled] = useState<boolean>(false);
  const [selectedLetterheadId, setSelectedLetterheadId] = useState<string>("");
  const [letterheadFirstPageOnly, setLetterheadFirstPageOnly] = useState<boolean>(true);
  const [letterheadWatermark, setLetterheadWatermark] = useState<string>("");
  const [templateName, setTemplateName] = useState("Custom Template");
  const [templateDescription, setTemplateDescription] = useState("");
  const [visualStyle, setVisualStyle] = useState("CUSTOM");
  const [makeDefault, setMakeDefault] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<"EDIT" | "PREVIEW" | "SPLIT">("EDIT");
  const [leftOpen, setLeftOpen] = useState(true), [rightOpen, setRightOpen] = useState(true);
  const [zoom, setZoom] = useState(0.78);

  const documentTypesQuery = useQuery({
    queryKey: ["document-types"],
    queryFn: () => getData(apiRoutes.documentTypes.list),
  });

  const letterheadQuery = useQuery({
    queryKey: ["letterhead-presets", companyId],
    queryFn: () => getData(apiRoutes.letterheadPresets.list, companyId ? { companyId } : undefined),
  });

  const templatesQuery = useQuery({
    queryKey: ["document-templates", documentType, scope, companyId],
    queryFn: () => getData(apiRoutes.documentTemplates.list, {
      documentType,
      scope,
      ...(scope === "COMPANY_OVERRIDE" && companyId ? { companyId } : {}),
    }),
  });
  const variablesQuery = useQuery({ queryKey: ["document-template-variables", documentType], queryFn: () => getData(apiRoutes.documentTemplates.variables, { documentType }) });

  const docTypeRows = Array.isArray(documentTypesQuery.data?.data?.data) ? documentTypesQuery.data.data.data : [];
  const docTypeOptions = docTypeRows.length > 0 ? docTypeRows.map((r: any) => String(r?.slug || "")) : DEFAULT_DOC_TYPES;
  const letterheadRows = Array.isArray(letterheadQuery.data?.data?.data) ? letterheadQuery.data.data.data : [];

  const templates = useMemo(() => (Array.isArray(templatesQuery.data?.data?.data) ? templatesQuery.data.data.data : []), [templatesQuery.data]);
  const current = templates.find((t: any) =>
    String(t?.documentType || t?.docType || "") === documentType &&
    String(t?.scope || "GLOBAL") === scope &&
    String(t?.companyId || "") === String(scope === "COMPANY_OVERRIDE" ? companyId : "")
  ) || null;
  const draft = current?.draft || null;
  const preview = current?.preview || null;
  const live = current?.live || null;
  const baseTemplate = useMemo(() => draft || preview || live || null, [draft, preview, live]);
  const publishedTemplates = (current?.all || []).filter((row: any) => row.stage === "LIVE" && row.status === "PUBLISHED" && row.isActive !== false).sort((a: any, b: any) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
  const variableGroups = Array.isArray(variablesQuery.data?.data?.data) ? variablesQuery.data.data.data : [];
  const variableOptions = variableGroups.flatMap((group: any) => (group.variables || []).map((token: string) => ({ token, group: group.group })));

  React.useEffect(() => {
    const base = baseTemplate;
    setLocalLayout(base?.layoutSchema || null);
    setSelectedBlockId(null);
    setSelectedElementId(null);
    setLetterheadEnabled(Boolean(base?.letterheadConfig?.enabled));
    setSelectedLetterheadId(String(base?.letterheadConfig?.presetId || ""));
    setLetterheadFirstPageOnly(base?.letterheadConfig?.firstPageOnly !== false);
    setLetterheadWatermark(String(base?.letterheadConfig?.watermark || ""));
    setTemplateName(String(base?.name || "Custom Template"));
    setTemplateDescription(String(base?.description || ""));
    setVisualStyle(String(base?.visualStyle || "CUSTOM"));
  }, [baseTemplate, documentType, scope, companyId]);

  const createDraftMutation = useMutation({
    mutationFn: () => postData(apiRoutes.documentTemplates.create, {
      documentType,
      scope,
      name: templateName,
      description: templateDescription,
      visualStyle,
      ...(scope === "COMPANY_OVERRIDE" && companyId ? { companyId } : {}),
    }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Draft created.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["document-templates", documentType, scope, companyId] });
      queryClient.invalidateQueries({ queryKey: ["document-templates-available"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to create draft.", position: "top-right" });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: () => patchData(apiRoutes.documentTemplates.update(draft?._id), {
      layoutSchema: localLayout,
      name: templateName,
      description: templateDescription,
      visualStyle,
      letterheadConfig: {
        enabled: letterheadEnabled,
        presetId: selectedLetterheadId || null,
        firstPageOnly: letterheadFirstPageOnly,
        watermark: letterheadWatermark,
      },
    }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Draft saved.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["document-templates", documentType, scope, companyId] });
      queryClient.invalidateQueries({ queryKey: ["document-templates-available"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to save draft.", position: "top-right" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => postData(apiRoutes.documentTemplates.publish(draft?._id), {
      stage: publishStage,
      activationMode,
      isDefault: makeDefault,
      ...(activationMode === "SCHEDULED" && activationAt ? { activationAt } : {}),
    }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: `Template published to ${publishStage}.`, position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["document-templates", documentType, scope, companyId] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to publish template.", position: "top-right" });
    },
  });

  const refreshTemplateQueries = () => { queryClient.invalidateQueries({ queryKey: ["document-templates", documentType, scope, companyId] }); queryClient.invalidateQueries({ queryKey: ["document-templates-available"] }); };
  const duplicateMutation = useMutation({ mutationFn: (id: string) => postData(apiRoutes.documentTemplates.duplicate(id), {}), onSuccess: () => { showToastMessage({ type: "success", message: "Published template copied into a new draft.", position: "top-right" }); refreshTemplateQueries(); }, onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Could not duplicate template.", position: "top-right" }) });
  const defaultMutation = useMutation({ mutationFn: (id: string) => postData(apiRoutes.documentTemplates.setDefault(id), {}), onSuccess: refreshTemplateQueries });
  const deactivateMutation = useMutation({ mutationFn: (id: string) => postData(apiRoutes.documentTemplates.deactivate(id), {}), onSuccess: refreshTemplateQueries, onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Could not deactivate template.", position: "top-right" }) });

  const seedMutation = useMutation({
    mutationFn: () => postData(`${apiRoutes.documentTemplates.seed}?force=true`, {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Templates restored.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["document-templates", documentType, scope, companyId] });
      queryClient.invalidateQueries({ queryKey: ["document-types"] });
    },
  });

  const selectedBlock = useMemo(() => {
    const blocks = Array.isArray(localLayout?.blocks) ? localLayout.blocks : [];
    return blocks.find((b: any) => String(b?.id) === String(selectedBlockId || "")) || null;
  }, [localLayout, selectedBlockId]);

  const selectedElement = useMemo(() => {
    const elements = Array.isArray(localLayout?.elements) ? localLayout.elements : [];
    return elements.find((e: any) => String(e?.id) === String(selectedElementId || "")) || null;
  }, [localLayout, selectedElementId]);

  const selectedAny = selectedElement || selectedBlock;

  const updateCollectionItem = (collection: "blocks" | "elements", id: string, patch: any) => {
    setLocalLayout((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        [collection]: (prev?.[collection] || []).map((row: any) => (String(row.id) === String(id) ? { ...row, ...patch } : row)),
      };
    });
  };

  const updateSelected = (patch: any) => {
    if (selectedElement) return updateCollectionItem("elements", selectedElement.id, patch);
    if (selectedBlock) return updateCollectionItem("blocks", selectedBlock.id, patch);
  };

  const updateSelectedTypography = (patch: Record<string, any>) => {
    if (!selectedAny) return;
    updateSelected({
      typography: {
        ...(selectedAny?.typography || {}),
        ...patch,
      },
    });
  };

  const addElement = (type: string) => {
    setLocalLayout((prev: any) => {
      const next = {
        ...(prev || {}),
        elements: [...(prev?.elements || []), makeElement(type)],
      };
      return next;
    });
  };

  const removeSelectedElement = () => {
    if (!selectedElement) return;
    setLocalLayout((prev: any) => ({
      ...(prev || {}),
      elements: (prev?.elements || []).filter((e: any) => String(e.id) !== String(selectedElement.id)),
    }));
    setSelectedElementId(null);
  };

  const moveBlock = (id: string, x: number, y: number) => {
    updateCollectionItem("blocks", id, { x: Math.round(x), y: Math.round(y) });
  };

  const layerItems = useMemo(() => {
    const blocks = (localLayout?.blocks || []).map((b: any) => ({ kind: "BLOCK", id: b.id, label: b.label || b.id, zIndex: Number(b?.zIndex || 1) }));
    const elements = (localLayout?.elements || []).map((e: any) => ({ kind: "ELEMENT", id: e.id, label: e.label || e.type || e.id, zIndex: Number(e?.zIndex || 1) }));
    return [...blocks, ...elements].sort((a: any, b: any) => b.zIndex - a.zIndex);
  }, [localLayout]);

  return (
    <section className="min-h-[calc(100vh-7rem)]">
      <Title title="Template Studio" visuallyHidden />
      <div className="mx-2 mb-6 flex flex-col gap-4 md:mx-4">
        {(documentTypesQuery.isLoading || templatesQuery.isLoading) && <div role="status" className="rounded-xl border border-default-200 p-4 text-sm text-default-500">Loading document configuration…</div>}
        {(documentTypesQuery.isError || templatesQuery.isError || letterheadQuery.isError) && <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">Documentation configuration could not be loaded. Retry before editing or publishing.</div>}
        <div className="sticky top-0 z-40 grid grid-cols-1 gap-3 rounded-2xl border border-default-200 bg-background/95 p-3 shadow-sm backdrop-blur-xl xl:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex flex-wrap items-center gap-3">
            <Select size="sm" selectedKeys={[documentType]} onSelectionChange={(keys) => setDocumentType(String(Array.from(keys)[0] || "LOI"))} className="w-[260px]" label="Document Type">
              {docTypeOptions.map((type: string) => (<SelectItem key={type}>{type}</SelectItem>))}
            </Select>
            <Select size="sm" selectedKeys={[scope]} onSelectionChange={(keys) => setScope(String(Array.from(keys)[0] || "GLOBAL") as any)} className="w-[220px]" label="Scope">
              <SelectItem key="GLOBAL">GLOBAL</SelectItem>
              <SelectItem key="COMPANY_OVERRIDE">COMPANY_OVERRIDE</SelectItem>
            </Select>
            {scope === "COMPANY_OVERRIDE" && (
              <Input size="sm" label="Company ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-[260px]" />
            )}

            {!draft ? (
              <Button color="primary" onPress={() => createDraftMutation.mutate()} isLoading={createDraftMutation.isPending}>Create Draft</Button>
            ) : (
              <>
                <Button color="primary" onPress={() => saveDraftMutation.mutate()} isLoading={saveDraftMutation.isPending} isDisabled={!localLayout}>Save Draft</Button>
                <Button color="secondary" onPress={() => publishMutation.mutate()} isLoading={publishMutation.isPending} isDisabled={!localLayout || (activationMode === "SCHEDULED" && !activationAt)}>Publish</Button>
              </>
            )}
            <Button variant="flat" onPress={() => seedMutation.mutate()} isLoading={seedMutation.isPending}>Restore Presets</Button>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex rounded-xl bg-default-100 p-1">{(["EDIT", "PREVIEW", "SPLIT"] as const).map(mode => <Button key={mode} size="sm" variant={workspaceMode === mode ? "solid" : "light"} color={workspaceMode === mode ? "primary" : "default"} onPress={() => setWorkspaceMode(mode)}>{mode[0] + mode.slice(1).toLowerCase()}</Button>)}</div>
            <Button size="sm" variant="flat" onPress={() => setLeftOpen(value => !value)}>{leftOpen ? "Hide" : "Show"} components</Button>
            <Button size="sm" variant="flat" onPress={() => setRightOpen(value => !value)}>{rightOpen ? "Hide" : "Show"} properties</Button>
            <Select size="sm" selectedKeys={[publishStage]} onSelectionChange={(keys) => setPublishStage(String(Array.from(keys)[0] || "LIVE"))} className="w-[120px]" label="Stage">
              {STAGE_OPTIONS.map((s) => (<SelectItem key={s}>{s}</SelectItem>))}
            </Select>
            <Select size="sm" selectedKeys={[activationMode]} onSelectionChange={(keys) => setActivationMode(String(Array.from(keys)[0] || "IMMEDIATE") as any)} className="w-[140px]" label="Activation">
              <SelectItem key="IMMEDIATE">IMMEDIATE</SelectItem>
              <SelectItem key="SCHEDULED">SCHEDULED</SelectItem>
            </Select>
            {activationMode === "SCHEDULED" && (
              <Input size="sm" type="datetime-local" label="Activation At" value={activationAt} onChange={(e) => setActivationAt(e.target.value)} className="w-[220px]" />
            )}
          </div>
        </div>

        <div className="text-xs text-default-500">Draft: {draft?._id ? "Yes" : "No"} • Preview: {preview?._id ? `v${preview.version}` : "None"} • Live: {live?._id ? `v${live.version}` : "None"}</div>

        <details className="rounded-2xl border border-default-200 bg-content1">
          <summary className="cursor-pointer list-none px-5 py-4 font-bold">Template & version drawer <span className="ml-2 text-xs font-normal text-default-500">{publishedTemplates.length} published</span></summary>
          <div className="space-y-4 border-t border-default-200 p-4">
            <div><h2 className="text-lg font-bold">Published template catalog</h2><p className="text-sm text-default-500">Users see these templates on the document Preview tab. A published version remains immutable.</p></div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{publishedTemplates.map((row: any) => <div key={row._id} className="rounded-xl border border-default-200 p-4"><div className="flex justify-between gap-3"><div><strong>{row.name || row.visualStyle}</strong><p className="text-xs text-default-500">{String(row.visualStyle || "CUSTOM").replaceAll("_", " ")} · v{row.version}</p></div>{row.isDefault && <span className="h-fit rounded-full bg-primary/15 px-2 py-1 text-[10px] font-bold text-primary">DEFAULT</span>}</div><p className="mt-2 line-clamp-2 text-xs text-default-500">{row.description || "No description"}</p><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="flat" onPress={() => duplicateMutation.mutate(String(row._id))}>Duplicate</Button>{!row.isDefault && <Button size="sm" variant="flat" color="primary" onPress={() => defaultMutation.mutate(String(row._id))}>Make default</Button>}{!row.isDefault && <Button size="sm" variant="light" color="danger" onPress={() => deactivateMutation.mutate(String(row._id))}>Deactivate</Button>}</div></div>)}</div>
          </div>
        </details>

        {draft && <Card><CardBody className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Input label="Template name" value={templateName} onChange={(event) => setTemplateName(event.target.value)} /><Input label="Description" value={templateDescription} onChange={(event) => setTemplateDescription(event.target.value)} /><Select label="Visual style" selectedKeys={[visualStyle]} onSelectionChange={(keys) => setVisualStyle(String(Array.from(keys)[0] || "CUSTOM"))}>{["CLASSIC", "MODERN", "COMPACT", "CUSTOM"].map(value => <SelectItem key={value}>{value}</SelectItem>)}</Select><Switch isSelected={makeDefault} onValueChange={setMakeDefault}>Make default when published</Switch></CardBody></Card>}

        <div className={`grid grid-cols-1 gap-4 ${leftOpen && rightOpen ? "xl:grid-cols-[240px_minmax(0,1fr)_300px]" : leftOpen ? "xl:grid-cols-[240px_minmax(0,1fr)]" : rightOpen ? "xl:grid-cols-[minmax(0,1fr)_300px]" : "xl:grid-cols-1"}`}>
          {leftOpen && <div className="space-y-4 xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto">
            <Card>
              <CardBody className="space-y-2">
                <div className="text-xs font-black  tracking-wider text-default-500">Block Library</div>
                {(localLayout?.blocks || []).map((block: any) => (
                  <button
                    key={block.id}
                    className={`text-left px-3 py-2 rounded-lg border text-xs ${selectedBlockId === block.id ? "border-primary bg-primary/10" : "border-default-200"}`}
                    onClick={() => {
                      setSelectedBlockId(block.id);
                      setSelectedElementId(null);
                    }}
                  >
                    <div className="font-semibold">{block.label}</div>
                    <div className="text-[10px] text-default-500">{block.type}</div>
                  </button>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-2">
                <div className="text-xs font-black  tracking-wider text-default-500">Element Toolbox</div>
                <div className="grid grid-cols-2 gap-2">
                  {["TEXT", "IMAGE", "SHAPE", "LINE", "TABLE", "SIGNATURE", "MANUAL_INPUT"].map((type) => (
                    <Button key={type} size="sm" variant="flat" onPress={() => addElement(type)} isDisabled={!draft}>{type}</Button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-2">
                <div className="text-xs font-black  tracking-wider text-default-500">Layers</div>
                {(layerItems || []).map((layer: any) => (
                  <button
                    key={`${layer.kind}-${layer.id}`}
                    className={`text-left px-3 py-2 rounded-lg border text-xs w-full ${selectedElementId === layer.id || selectedBlockId === layer.id ? "border-primary bg-primary/10" : "border-default-200"}`}
                    onClick={() => {
                      if (layer.kind === "ELEMENT") {
                        setSelectedElementId(layer.id);
                        setSelectedBlockId(null);
                      } else {
                        setSelectedBlockId(layer.id);
                        setSelectedElementId(null);
                      }
                    }}
                  >
                    <div className="font-semibold">{layer.label}</div>
                    <div className="text-[10px] text-default-500">{layer.kind} • z:{layer.zIndex}</div>
                  </button>
                ))}
              </CardBody>
            </Card>
          </div>}

          <div className="min-w-0 overflow-hidden rounded-2xl border border-default-200 bg-default-100/50">
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-default-200 bg-background/90 p-2 backdrop-blur"><span className="px-2 text-xs font-bold text-default-500">{workspaceMode === "EDIT" ? "Editable canvas" : workspaceMode === "PREVIEW" ? "Published output preview" : "Draft and output"}</span><div className="flex items-center gap-1"><Button size="sm" variant="light" onPress={() => setZoom(value => Math.max(.4, value - .1))}>−</Button><Button size="sm" variant="flat" onPress={() => setZoom(.78)}>{Math.round(zoom * 100)}%</Button><Button size="sm" variant="light" onPress={() => setZoom(value => Math.min(1.4, value + .1))}>+</Button><Button size="sm" variant="light" onPress={() => setZoom(.6)}>Fit</Button></div></div>
            <div className={`overflow-auto p-4 ${workspaceMode === "SPLIT" ? "grid gap-4 2xl:grid-cols-2" : ""}`}>
            {localLayout ? (
              <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", marginBottom: `${Math.max(0, (zoom - 1) * 1123)}px` }}><TemplateCanvasRenderer
                layoutSchema={localLayout}
                docLabel={documentType.replaceAll("_", " ")}
                data={{
                  documentNumber: "PREVIEW-0001",
                  docDate: new Date().toLocaleDateString(),
                  buyer: { name: "Buyer Co", email: "buyer@example.com", phone: "+91-00000-00000" },
                  seller: { name: "Seller Co", email: "seller@example.com", phone: "+91-00000-00000" },
                  lineItems: [{ productName: "Sample Product", productVariantName: "Grade A", quantityMT: 50, ratePerKg: 120, amount: 6000000 }],
                  totals: { subtotal: 6000000, commissionTotal: 120000, taxAmount: 0, grandTotal: 6120000 },
                  terms: { paymentTerms: "LC at sight", deliveryTerms: "FOB", notes: "Template preview" },
                  letterheadConfig: {
                    enabled: letterheadEnabled,
                    name: letterheadRows.find((r: any) => String(r?._id || "") === selectedLetterheadId)?.name || "",
                    watermark: letterheadWatermark,
                  },
                  manualInput: {},
                }}
                editable={Boolean(draft) && workspaceMode !== "PREVIEW"}
                selectedBlockId={selectedBlockId}
                onSelectBlock={(id) => {
                  setSelectedBlockId(id);
                  setSelectedElementId(null);
                }}
                onBlockMove={moveBlock}
              /></div>
            ) : (
              <Card><CardBody className="text-sm text-default-500">No template found yet.</CardBody></Card>
            )}
            {workspaceMode === "SPLIT" && localLayout && <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}><TemplateCanvasRenderer layoutSchema={localLayout} docLabel={`${documentType.replaceAll("_", " ")} Preview`} data={{ documentNumber: "PREVIEW-0001", docDate: new Date().toLocaleDateString(), buyer: { name: "Buyer Co" }, seller: { name: "Seller Co" }, lineItems: [], totals: {}, terms: {} }} editable={false} /></div>}
            </div>
          </div>

          {rightOpen && <Card className="xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto">
            <CardBody className="space-y-3">
              <div className="text-xs font-black  tracking-wider text-default-500">Properties</div>
              {!selectedAny ? (
                <div className="text-xs text-default-500">Select a block or element to edit its properties.</div>
              ) : (
                <>
                  <Input size="sm" label="Label" value={String(selectedAny.label || "")} onChange={(e) => updateSelected({ label: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input size="sm" type="number" label="X" value={String(selectedAny.x || 0)} onChange={(e) => updateSelected({ x: Number(e.target.value || 0) })} />
                    <Input size="sm" type="number" label="Y" value={String(selectedAny.y || 0)} onChange={(e) => updateSelected({ y: Number(e.target.value || 0) })} />
                    <Input size="sm" type="number" label="Width" value={String(selectedAny.width || 0)} onChange={(e) => updateSelected({ width: Number(e.target.value || 0) })} />
                    <Input size="sm" type="number" label="Height" value={String(selectedAny.height || 0)} onChange={(e) => updateSelected({ height: Number(e.target.value || 0) })} />
                    <Input size="sm" type="number" label="Z Index" value={String(selectedAny.zIndex || 1)} onChange={(e) => updateSelected({ zIndex: Number(e.target.value || 1) })} />
                  </div>
                  <Switch isSelected={selectedAny.visible !== false} onValueChange={(checked) => updateSelected({ visible: checked })}>Visible</Switch>
                  <Input size="sm" label="Text Color (Hex)" value={String(selectedAny?.typography?.color || "#111827")} onChange={(e) => updateSelectedTypography({ color: e.target.value })} placeholder="#111827" />
                  <Input size="sm" type="number" label="Font Size" value={String(selectedAny?.typography?.fontSize || 12)} onChange={(e) => updateSelectedTypography({ fontSize: Number(e.target.value || 12) })} />

                  {selectedElement ? (
                    <>
                      <Input size="sm" label="Content" value={String(selectedElement?.content || "")} onChange={(e) => updateSelected({ content: e.target.value })} />
                      <Select
                        size="sm"
                        label="Binding Type"
                        selectedKeys={[String(selectedElement?.binding?.bindingType || "SYSTEM_TOKEN")]}
                        onSelectionChange={(keys) => updateSelected({ binding: { ...(selectedElement?.binding || {}), bindingType: String(Array.from(keys)[0] || "SYSTEM_TOKEN") } })}
                      >
                        <SelectItem key="SYSTEM_TOKEN">SYSTEM_TOKEN</SelectItem>
                        <SelectItem key="MANUAL_FIELD">MANUAL_FIELD</SelectItem>
                      </Select>
                      {String(selectedElement?.binding?.bindingType || "SYSTEM_TOKEN") === "SYSTEM_TOKEN" ? (
                        <Select size="sm" label="Document variable" placeholder="Choose a supported variable" selectedKeys={selectedElement?.binding?.token ? [String(selectedElement.binding.token)] : []} onSelectionChange={(keys) => updateSelected({ binding: { ...(selectedElement?.binding || {}), token: String(Array.from(keys)[0] || "") } })}>{variableOptions.map((option: any) => <SelectItem key={option.token} textValue={`${option.group}: ${option.token}`}>{option.group} · {option.token}</SelectItem>)}</Select>
                      ) : (
                        <>
                          <Input size="sm" label="Manual Field Key" placeholder="legalNoticeTitle" value={String(selectedElement?.binding?.fieldKey || "")} onChange={(e) => updateSelected({ binding: { ...(selectedElement?.binding || {}), fieldKey: e.target.value } })} />
                          <Switch isSelected={Boolean(selectedElement?.binding?.required)} onValueChange={(checked) => updateSelected({ binding: { ...(selectedElement?.binding || {}), required: checked } })}>Required</Switch>
                        </>
                      )}
                      <div className="flex justify-end">
                        <Button size="sm" color="danger" variant="flat" onPress={removeSelectedElement} isDisabled={!draft}>Delete Element</Button>
                      </div>
                    </>
                  ) : null}
                </>
              )}

              <div className="pt-3 mt-2 border-t border-default-200/50 space-y-2">
                <div className="text-xs font-black  tracking-wider text-default-500">Letterhead</div>
                <Switch isSelected={letterheadEnabled} onValueChange={setLetterheadEnabled}>Enable Letterhead</Switch>
                <Select size="sm" label="Preset" selectedKeys={selectedLetterheadId ? [selectedLetterheadId] : []} onSelectionChange={(keys) => setSelectedLetterheadId(String(Array.from(keys)[0] || ""))}>
                  {letterheadRows.map((row: any) => (
                    <SelectItem key={String(row?._id || "")}>{String(row?.name || "Preset")}</SelectItem>
                  ))}
                </Select>
                <Switch isSelected={letterheadFirstPageOnly} onValueChange={setLetterheadFirstPageOnly}>First Page Only</Switch>
                <Input size="sm" label="Watermark" value={letterheadWatermark} onChange={(e) => setLetterheadWatermark(e.target.value)} />
              </div>
            </CardBody>
          </Card>}
        </div>
      </div>
    </section>
  );
}
