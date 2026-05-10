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
  "LOI", "QUOTATION", "PROFORMA_INVOICE", "INVOICE", "PURCHASE_ORDER", "SALES_CONTRACT", "PACKING_LIST", "QUALITY_CERTIFICATE", "INSPECTION_CERTIFICATE", "PHYTOSANITARY_CERTIFICATE", "FUMIGATION_CERTIFICATE", "BILL_OF_LADING", "AIR_WAYBILL", "LORRY_RECEIPT", "LCL_DRAFT", "INSURANCE_CERTIFICATE", "PAYMENT_ADVICE",
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

  React.useEffect(() => {
    const base = draft || preview || live || null;
    setLocalLayout(base?.layoutSchema || null);
    setSelectedBlockId(null);
    setSelectedElementId(null);
    setLetterheadEnabled(Boolean(base?.letterheadConfig?.enabled));
    setSelectedLetterheadId(String(base?.letterheadConfig?.presetId || ""));
    setLetterheadFirstPageOnly(base?.letterheadConfig?.firstPageOnly !== false);
    setLetterheadWatermark(String(base?.letterheadConfig?.watermark || ""));
  }, [draft?._id, preview?._id, live?._id, documentType, scope, companyId]);

  const createDraftMutation = useMutation({
    mutationFn: () => postData(apiRoutes.documentTemplates.create, {
      documentType,
      scope,
      ...(scope === "COMPANY_OVERRIDE" && companyId ? { companyId } : {}),
    }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Draft created.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["document-templates", documentType, scope, companyId] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to create draft.", position: "top-right" });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: () => patchData(apiRoutes.documentTemplates.update(draft?._id), {
      layoutSchema: localLayout,
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
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to save draft.", position: "top-right" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => postData(apiRoutes.documentTemplates.publish(draft?._id), {
      stage: publishStage,
      activationMode,
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
    <section>
      <Title title="Documentation Templates" />
      <div className="mx-2 md:mx-6 mb-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] gap-3">
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
                <Button color="primary" onPress={() => saveDraftMutation.mutate()} isLoading={saveDraftMutation.isPending}>Save Draft</Button>
                <Button color="secondary" onPress={() => publishMutation.mutate()} isLoading={publishMutation.isPending}>Publish</Button>
              </>
            )}
            <Button variant="flat" onPress={() => seedMutation.mutate()} isLoading={seedMutation.isPending}>Restore Presets</Button>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
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

        <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_320px] gap-4">
          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-default-500">Block Library</div>
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
                <div className="text-xs font-black uppercase tracking-wider text-default-500">Element Toolbox</div>
                <div className="grid grid-cols-2 gap-2">
                  {["TEXT", "IMAGE", "SHAPE", "LINE", "TABLE", "SIGNATURE", "MANUAL_INPUT"].map((type) => (
                    <Button key={type} size="sm" variant="flat" onPress={() => addElement(type)} isDisabled={!draft}>{type}</Button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-default-500">Layers</div>
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
          </div>

          <div>
            {localLayout ? (
              <TemplateCanvasRenderer
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
                editable={Boolean(draft)}
                selectedBlockId={selectedBlockId}
                onSelectBlock={(id) => {
                  setSelectedBlockId(id);
                  setSelectedElementId(null);
                }}
                onBlockMove={moveBlock}
              />
            ) : (
              <Card><CardBody className="text-sm text-default-500">No template found yet.</CardBody></Card>
            )}
          </div>

          <Card>
            <CardBody className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-default-500">Properties</div>
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
                        <Input size="sm" label="Token" placeholder="enquiry.productName" value={String(selectedElement?.binding?.token || "")} onChange={(e) => updateSelected({ binding: { ...(selectedElement?.binding || {}), token: e.target.value } })} />
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
                <div className="text-xs font-black uppercase tracking-wider text-default-500">Letterhead</div>
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
          </Card>
        </div>
      </div>
    </section>
  );
}
