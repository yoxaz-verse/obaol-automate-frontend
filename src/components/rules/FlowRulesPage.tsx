 "use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Title from "@/components/titles";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData, patchData, deleteData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import RulesActionStrip from "@/components/rules/RulesActionStrip";
import RulesSearchBar from "@/components/rules/RulesSearchBar";
import RulesSortableList from "@/components/rules/RulesSortableList";
import RulesPreviewPanel from "@/components/rules/RulesPreviewPanel";
import DocRulesEditor from "@/components/rules/DocRulesEditor";

const ACTIONS = ["SUPPLIER_ACCEPTED", "BUYER_CONFIRMED", "RESPONSIBILITIES_FINALIZED"] as const;
const DOC_TYPES = [
  "QUOTATION",
  "PROFORMA_INVOICE",
  "INVOICE",
  "PURCHASE_ORDER",
  "SALES_CONTRACT",
  "PACKING_LIST",
  "QUALITY_CERTIFICATE",
  "INSPECTION_CERTIFICATE",
  "PHYTOSANITARY_CERTIFICATE",
  "FUMIGATION_CERTIFICATE",
  "BILL_OF_LADING",
  "AIR_WAYBILL",
  "INSURANCE_CERTIFICATE",
  "PAYMENT_ADVICE",
];
const RESPONSIBLE_ROLES = ["BUYER", "SELLER", "OBAOL", "PACKAGING", "QUALITY", "TRANSPORT", "SHIPPING"];
const ACTION_TYPES = ["CREATE", "UPLOAD"];
const VISIBILITY = ["BUYER", "SELLER", "BOTH", "INTERNAL"];
const TRADE_TYPES = ["DOMESTIC", "INTERNATIONAL", "BOTH"];

const FLOW_TYPES = [
  { key: "TRADE_ENQUIRY", label: "Enquiry Flow" },
  { key: "TRADE_ORDER", label: "Order Flow" },
  { key: "SAMPLING", label: "Sampling Flow" },
  { key: "WAREHOUSE", label: "Warehouse Flow" },
];

const STAGE_DEFAULTS: Record<string, { stageKey: string; label: string }> = {
  TRADE_ENQUIRY: { stageKey: "INQUIRY_CREATED", label: "Inquiry Created" },
  TRADE_ORDER: { stageKey: "ORDER_CREATED", label: "Order Created" },
  SAMPLING: { stageKey: "REQUESTED", label: "Requested" },
  WAREHOUSE: { stageKey: "INBOUND_REQUESTED", label: "Inbound Requested" },
};

type RuleForm = {
  flowType: string;
  stageKey: string;
  label: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  requiredActions: string[];
  triggersOrderCreation: boolean;
  triggersClose: boolean;
  tradeType: string;
};

type DocRuleDraft = import("@/components/rules/DocRulesEditor").DocRuleDraft;

const flowStageType = (flowType: string) =>
  flowType === "TRADE_ENQUIRY" ? "INQUIRY" : flowType === "TRADE_ORDER" ? "ORDER" : null;

export default function FlowRulesPage({ defaultFlowType = "TRADE_ENQUIRY" }: { defaultFlowType?: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [flowType, setFlowType] = useState(defaultFlowType);
  const [previewStageKey, setPreviewStageKey] = useState<string>("");
  const [previewActionState, setPreviewActionState] = useState<Record<string, boolean>>({});
  const [previewDocState, setPreviewDocState] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState<RuleForm>({
    flowType: defaultFlowType,
    stageKey: STAGE_DEFAULTS[defaultFlowType]?.stageKey || "INQUIRY_CREATED",
    label: STAGE_DEFAULTS[defaultFlowType]?.label || "Inquiry Created",
    description: "",
    sortOrder: 0,
    isActive: true,
    requiredActions: [],
    triggersOrderCreation: false,
    triggersClose: false,
    tradeType: "BOTH",
  });
  const [selectedDocs, setSelectedDocs] = useState<DocRuleDraft[]>([]);

  const stageType = flowStageType(flowType);
  const showDocRules = Boolean(stageType);

  const { data: rulesResponse } = useQuery({
    queryKey: ["flow-rules", flowType],
    queryFn: () => getData(apiRoutes.flowRules.list, { flowType }),
  });
  const rules = Array.isArray(rulesResponse?.data?.data) ? rulesResponse.data.data : [];

  const { data: docRulesResponse } = useQuery({
    queryKey: ["document-rules"],
    queryFn: () => getData(apiRoutes.documentRules.list),
  });
  const docRules = Array.isArray(docRulesResponse?.data?.data) ? docRulesResponse.data.data : [];

  const actionUsage = useMemo(() => {
    if (flowType !== "TRADE_ENQUIRY") return [];
    const used = new Set<string>();
    rules.forEach((rule: any) => {
      (rule.requiredActions || []).forEach((action: string) => {
        used.add(String(action));
      });
    });
    return ACTIONS.map((action) => ({
      action,
      used: used.has(action),
    }));
  }, [rules, flowType]);

  const seedMutation = useMutation({
    mutationFn: () => postData(`${apiRoutes.flowRules.seed}?force=true&flowType=${flowType}`, {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Default flow rules restored.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["flow-rules", flowType] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to restore defaults.", position: "top-right" });
    },
  });

  const filteredRules = useMemo(() => {
    if (!search.trim()) return rules;
    const needle = search.toLowerCase();
    return rules.filter((r: any) =>
      [r.stageKey, r.label].some((v: any) => String(v || "").toLowerCase().includes(needle))
    );
  }, [rules, search]);

  const sortedRules = useMemo(() => {
    return [...rules].sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  }, [rules]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const dragDisabled = Boolean(search.trim());

  const previewStage = useMemo(() => {
    if (!sortedRules.length) return null;
    const matched = sortedRules.find((r: any) => String(r.stageKey) === String(previewStageKey));
    return matched || sortedRules[0];
  }, [sortedRules, previewStageKey]);

  const stageDocRules = useMemo(() => {
    if (!previewStage?.stageKey || !stageType) return [];
    return docRules
      .filter((r: any) => String(r.stageType) === stageType && String(r.stageKey) === String(previewStage.stageKey))
      .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  }, [docRules, previewStage?.stageKey, stageType]);

  useEffect(() => {
    if (!previewStage?.stageKey) return;
    setPreviewActionState((prev) => {
      const next: Record<string, boolean> = {};
      (previewStage.requiredActions || []).forEach((action: string) => {
        next[action] = prev[action] ?? false;
      });
      return next;
    });
    setPreviewDocState((prev) => {
      const next: Record<string, boolean> = {};
      stageDocRules.forEach((doc: any) => {
        const key = String(doc.docType);
        next[key] = prev[key] ?? false;
      });
      return next;
    });
  }, [previewStage?.stageKey, stageDocRules]);

  useEffect(() => {
    setPreviewStageKey("");
  }, [flowType]);

  const previewMissing = useMemo(() => {
    if (!previewStage) return [];
    const missing: string[] = [];
    (previewStage.requiredActions || []).forEach((action: string) => {
      if (!previewActionState[action]) missing.push(action.replaceAll("_", " "));
    });
    stageDocRules.forEach((doc: any) => {
      if (doc.isRequired && !previewDocState[String(doc.docType)]) {
        missing.push(String(doc.docType).replaceAll("_", " "));
      }
    });
    return missing;
  }, [previewStage, previewActionState, previewDocState, stageDocRules]);

  const syncDocumentRules = async (stageKey: string, drafts: DocRuleDraft[]) => {
    if (!stageType) return;
    const stageDocs = docRules.filter((r: any) => String(r.stageType) === stageType && String(r.stageKey) === stageKey);
    const docMap = new Map(stageDocs.map((r: any) => [String(r.docType), r]));
    const keep = new Set(drafts.map((d) => d.docType));

    for (const [index, draft] of drafts.entries()) {
      const payload = {
        docType: draft.docType,
        stageType,
        stageKey,
        responsibleRole: draft.responsibleRole,
        actionType: draft.actionType,
        visibility: draft.visibility,
        tradeType: draft.tradeType,
        isRequired: draft.isRequired,
        sortOrder: (index + 1) * 10,
        isActive: true,
      };
      const existing = docMap.get(draft.docType);
      if (existing) {
        await patchData(apiRoutes.documentRules.update(existing._id), payload);
      } else {
        await postData(apiRoutes.documentRules.create, payload);
      }
    }

    for (const existing of stageDocs) {
      if (!keep.has(String(existing.docType))) {
        await patchData(apiRoutes.documentRules.update(existing._id), { isDeleted: true });
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await postData(apiRoutes.flowRules.create, form);
      if (showDocRules) await syncDocumentRules(form.stageKey, selectedDocs);
      return res;
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Rule created.", position: "top-right" });
      setOpen(false);
      setSelectedDocs([]);
      queryClient.invalidateQueries({ queryKey: ["flow-rules", flowType] });
      queryClient.invalidateQueries({ queryKey: ["document-rules"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to create rule.", position: "top-right" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await patchData(apiRoutes.flowRules.update(editing?._id), form);
      if (showDocRules) await syncDocumentRules(form.stageKey, selectedDocs);
      return res;
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Rule updated.", position: "top-right" });
      setOpen(false);
      setEditing(null);
      setSelectedDocs([]);
      queryClient.invalidateQueries({ queryKey: ["flow-rules", flowType] });
      queryClient.invalidateQueries({ queryKey: ["document-rules"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to update rule.", position: "top-right" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteData(apiRoutes.flowRules.delete(id)),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Rule deleted.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["flow-rules", flowType] });
    },
  });

  const openCreate = () => {
    const defaults = STAGE_DEFAULTS[flowType] || { stageKey: "STAGE_1", label: "New Stage" };
    setEditing(null);
    setForm({
      flowType,
      stageKey: defaults.stageKey,
      label: defaults.label,
      description: "",
      sortOrder: 0,
      isActive: true,
      requiredActions: [],
      triggersOrderCreation: false,
      triggersClose: false,
      tradeType: "BOTH",
    });
    setSelectedDocs([]);
    setOpen(true);
  };

  const openEdit = (rule: any) => {
    setEditing(rule);
    setForm({
      flowType: rule.flowType,
      stageKey: rule.stageKey,
      label: rule.label,
      description: rule.description || "",
      sortOrder: Number(rule.sortOrder || 0),
      isActive: rule.isActive !== false,
      requiredActions: Array.isArray(rule.requiredActions) ? rule.requiredActions : [],
      triggersOrderCreation: Boolean(rule.triggersOrderCreation),
      triggersClose: Boolean(rule.triggersClose),
      tradeType: String(rule.tradeType || "BOTH"),
    });
    const stageDocs = showDocRules
      ? docRules
          .filter((r: any) => String(r.stageType) === stageType && String(r.stageKey) === String(rule.stageKey))
          .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
          .map((r: any) => ({
            docType: String(r.docType),
            actionType: String(r.actionType || "UPLOAD"),
            visibility: String(r.visibility || "BOTH"),
            responsibleRole: String(r.responsibleRole || "SELLER"),
            tradeType: String(r.tradeType || "BOTH"),
            isRequired: Boolean(r.isRequired),
          }))
      : [];
    setSelectedDocs(stageDocs);
    setOpen(true);
  };

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (dragDisabled) return;
    const oldIndex = sortedRules.findIndex((r: any) => r._id === active.id);
    const newIndex = sortedRules.findIndex((r: any) => r._id === over.id);
    const reordered = arrayMove(sortedRules, oldIndex, newIndex);
    reordered.forEach((rule: any, idx: number) => {
      patchData(apiRoutes.flowRules.update(rule._id), { sortOrder: (idx + 1) * 10 });
    });
    queryClient.invalidateQueries({ queryKey: ["flow-rules", flowType] });
  };

  return (
    <section className="">
      <Title title="Flow Rules" />

      <div className="mx-2 md:mx-6 mb-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              size="sm"
              label="Flow Type"
              labelPlacement="outside"
              selectedKeys={[flowType]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys as Set<string>)[0] || defaultFlowType;
                setFlowType(value);
              }}
              className="max-w-[260px]"
            >
              {FLOW_TYPES.map((flow) => (
                <SelectItem key={flow.key} value={flow.key}>
                  {flow.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {flowType === "TRADE_ENQUIRY" ? (
            <RulesActionStrip
              title="Enquiry Actions"
              items={actionUsage.map(({ action, used }) => ({
                label: action.replaceAll("_", " "),
                used,
              }))}
            />
          ) : (
            <RulesActionStrip title="Actions" emptyMessage="No predefined actions configured yet." />
          )}

          <RulesSearchBar
            search={search}
            onSearch={setSearch}
            onRestore={() => seedMutation.mutate()}
            onAdd={openCreate}
            restoreLoading={seedMutation.isPending}
          />
          <RulesSortableList
            rules={sortedRules}
            filteredRules={filteredRules}
            dragDisabled={dragDisabled}
            onEdit={openEdit}
            onDragEnd={onDragEnd}
            sensors={sensors}
            renderBadges={(rule) => {
              const badges = [] as { label: string; colorClass?: string }[];
              if (flowType === "TRADE_ENQUIRY") {
                if ((rule.requiredActions || []).length) {
                  badges.push({ label: `${rule.requiredActions.length} actions`, colorClass: "text-primary-600 bg-primary-500/10" });
                } else {
                  badges.push({ label: "No required actions", colorClass: "text-default-600 bg-default-100/70" });
                }
                if (rule.triggersOrderCreation) {
                  badges.push({ label: "Triggers Order Creation", colorClass: "text-success-600 bg-success-500/10" });
                }
              }
              if (flowType === "TRADE_ORDER" && rule.tradeType) {
                badges.push({ label: String(rule.tradeType), colorClass: "text-default-600 bg-default-100/70" });
                if (rule.triggersClose) {
                  badges.push({ label: "Triggers Close", colorClass: "text-success-600 bg-success-500/10" });
                }
              }
              if (!rule.isActive) {
                badges.push({ label: "Inactive", colorClass: "text-warning-600 bg-warning-500/10" });
              }
              return badges;
            }}
          />
        </div>

        <RulesPreviewPanel
          body={
            sortedRules.length === 0 ? (
              <div className="text-xs text-default-500">No stages configured yet.</div>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-4">
                  {sortedRules.map((rule: any) => {
                    const isActiveStage = String(previewStage?.stageKey) === String(rule.stageKey);
                    return (
                      <button
                        key={rule._id || rule.stageKey}
                        onClick={() => setPreviewStageKey(rule.stageKey)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold border ${
                          isActiveStage
                            ? "border-primary-400 bg-primary-500/10 text-primary-600"
                            : "border-default-200/60 text-default-600 hover:bg-default-100/80"
                        }`}
                      >
                        {rule.label || rule.stageKey}
                      </button>
                    );
                  })}
                </div>

                {flowType === "TRADE_ENQUIRY" && (
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold text-default-500 uppercase tracking-widest mb-2">
                      Required Actions
                    </div>
                    <div className="flex flex-col gap-2">
                      {(previewStage?.requiredActions || []).length === 0 ? (
                        <div className="text-xs text-default-500">No required actions.</div>
                      ) : (
                        (previewStage?.requiredActions || []).map((action: string) => (
                          <label key={action} className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={Boolean(previewActionState[action])}
                              onChange={() =>
                                setPreviewActionState((prev) => ({ ...prev, [action]: !prev[action] }))
                              }
                            />
                            {action.replaceAll("_", " ")}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-[11px] font-semibold text-default-500 uppercase tracking-widest mb-2">
                    Required Documents
                  </div>
                  {!showDocRules ? (
                    <div className="text-xs text-default-500">Documents not configured for this flow.</div>
                  ) : stageDocRules.length === 0 ? (
                    <div className="text-xs text-default-500">No document rules for this stage.</div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {stageDocRules.map((doc: any) => {
                        const key = String(doc.docType);
                        return (
                          <label key={key} className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={Boolean(previewDocState[key])}
                              onChange={() =>
                                setPreviewDocState((prev) => ({ ...prev, [key]: !prev[key] }))
                              }
                            />
                            {key.replaceAll("_", " ")}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-default-200/60 bg-default-100/70 px-3 py-2 text-xs text-default-600">
                  {previewMissing.length === 0 ? "Ready to advance." : `Missing: ${previewMissing.join(", ")}`}
                </div>
              </>
            )
          }
        />
      </div>

      <Modal isOpen={open} onOpenChange={setOpen} isDismissable={false} isKeyboardDismissDisabled>
        <ModalContent className="bg-content1 text-foreground">
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-divider">
                {editing ? "Edit Stage" : "Create Stage"}
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <Input
                  label="Stage Key"
                  placeholder="E.g. INQUIRY_CREATED"
                  variant="bordered"
                  value={form.stageKey}
                  onValueChange={(value) => setForm({ ...form, stageKey: value.toUpperCase() })}
                />
                <Input
                  label="Label"
                  placeholder="Stage label"
                  variant="bordered"
                  value={form.label}
                  onValueChange={(value) => setForm({ ...form, label: value })}
                />
                <Input
                  label="Description"
                  placeholder="Short description"
                  variant="bordered"
                  value={form.description}
                  onValueChange={(value) => setForm({ ...form, description: value })}
                />

                {flowType === "TRADE_ENQUIRY" && (
                  <Select
                    selectionMode="multiple"
                    label="Required Actions"
                    variant="bordered"
                    selectedKeys={new Set(form.requiredActions)}
                    onSelectionChange={(keys) =>
                      setForm({ ...form, requiredActions: Array.from(keys as Set<string>) })
                    }
                  >
                    {ACTIONS.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </Select>
                )}

                {flowType === "TRADE_ORDER" && (
                  <Select
                    label="Trade Type"
                    variant="bordered"
                    selectedKeys={new Set([form.tradeType])}
                    onSelectionChange={(keys) =>
                      setForm({ ...form, tradeType: Array.from(keys as Set<string>)[0] || "BOTH" })
                    }
                  >
                    {TRADE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </Select>
                )}

                <Input
                  label="Sort Order"
                  placeholder="10"
                  variant="bordered"
                  type="number"
                  value={String(form.sortOrder)}
                  onValueChange={(value) => setForm({ ...form, sortOrder: Number(value || 0) })}
                />

                {flowType === "TRADE_ENQUIRY" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">Triggers Order Creation</span>
                    <Switch
                      size="sm"
                      isSelected={form.triggersOrderCreation}
                      onValueChange={(value) => setForm({ ...form, triggersOrderCreation: value })}
                    />
                  </div>
                )}

                {flowType === "TRADE_ORDER" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">Triggers Close</span>
                    <Switch
                      size="sm"
                      isSelected={form.triggersClose}
                      onValueChange={(value) => setForm({ ...form, triggersClose: value })}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">Active</span>
                  <Switch
                    size="sm"
                    isSelected={form.isActive}
                    onValueChange={(value) => setForm({ ...form, isActive: value })}
                  />
                </div>

                {showDocRules && (
                  <DocRulesEditor
                    docTypes={DOC_TYPES}
                    selectedDocs={selectedDocs}
                    setSelectedDocs={setSelectedDocs}
                    defaults={{
                      actionType: "UPLOAD",
                      visibility: "BOTH",
                      responsibleRole: "SELLER",
                      tradeType: "BOTH",
                    }}
                    actionTypes={ACTION_TYPES}
                    visibilityOptions={VISIBILITY}
                    responsibleRoles={RESPONSIBLE_ROLES}
                    tradeTypes={TRADE_TYPES}
                  />
                )}
              </ModalBody>
              <ModalFooter className="border-t border-divider">
                {editing && (
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => deleteMutation.mutate(editing._id)}
                  >
                    Delete
                  </Button>
                )}
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => (editing ? updateMutation.mutate() : createMutation.mutate())}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editing ? "Save Changes" : "Create Stage"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}
