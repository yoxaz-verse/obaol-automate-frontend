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
import Title from "@/components/titles";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData, patchData, deleteData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
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

type RuleForm = {
  stageKey: string;
  label: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  triggersOrderCreation: boolean;
  requiredActions: string[];
};

type DocRuleDraft = import("@/components/rules/DocRulesEditor").DocRuleDraft;

export default function EnquiryRulesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [previewStageKey, setPreviewStageKey] = useState<string>("");
  const [previewActionState, setPreviewActionState] = useState<Record<string, boolean>>({});
  const [previewDocState, setPreviewDocState] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<RuleForm>({
    stageKey: "INQUIRY_CREATED",
    label: "Inquiry Created",
    description: "",
    sortOrder: 0,
    isActive: true,
    triggersOrderCreation: false,
    requiredActions: [],
  });
  const [selectedDocs, setSelectedDocs] = useState<DocRuleDraft[]>([]);

  const { data: rulesResponse } = useQuery({
    queryKey: ["enquiry-rules"],
    queryFn: () => getData(apiRoutes.enquiryRules.list),
  });
  const rules = Array.isArray(rulesResponse?.data?.data) ? rulesResponse.data.data : [];

  const { data: docRulesResponse } = useQuery({
    queryKey: ["document-rules"],
    queryFn: () => getData(apiRoutes.documentRules.list),
  });
const docRules = Array.isArray(docRulesResponse?.data?.data) ? docRulesResponse.data.data : [];

  const actionUsage = useMemo(() => {
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
  }, [rules]);

  const seedMutation = useMutation({
    mutationFn: () => postData(`${apiRoutes.enquiryRules.seed}?force=true`, {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Default enquiry rules restored.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["enquiry-rules"] });
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
    if (!previewStage?.stageKey) return [];
    return docRules
      .filter((r: any) => String(r.stageType) === "INQUIRY" && String(r.stageKey) === String(previewStage.stageKey))
      .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  }, [docRules, previewStage?.stageKey]);

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
    const stageDocs = docRules.filter((r: any) => String(r.stageType) === "INQUIRY" && String(r.stageKey) === stageKey);
    const docMap = new Map(stageDocs.map((r: any) => [String(r.docType), r]));
    const keep = new Set(drafts.map((d) => d.docType));

    for (const [index, draft] of drafts.entries()) {
      const payload = {
        docType: draft.docType,
        stageType: "INQUIRY",
        stageKey,
        responsibleRole: draft.responsibleRole,
        actionType: draft.actionType,
        visibility: draft.visibility,
        tradeType: draft.tradeType,
        isRequired: draft.isRequired,
        isActive: true,
        sortOrder: (index + 1) * 10,
      };
      const existing = docMap.get(draft.docType);
      if (existing?._id) {
        await patchData(apiRoutes.documentRules.update(existing._id), payload);
      } else {
        await postData(apiRoutes.documentRules.create, payload);
      }
    }

    for (const existing of stageDocs) {
      if (!keep.has(String(existing.docType))) {
        await deleteData(apiRoutes.documentRules.delete(existing._id));
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await postData(apiRoutes.enquiryRules.create, form);
      await syncDocumentRules(form.stageKey, selectedDocs);
      return res;
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Rule created.", position: "top-right" });
      setOpen(false);
      setSelectedDocs([]);
      queryClient.invalidateQueries({ queryKey: ["enquiry-rules"] });
      queryClient.invalidateQueries({ queryKey: ["document-rules"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to create rule.", position: "top-right" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await patchData(apiRoutes.enquiryRules.update(editing?._id), form);
      await syncDocumentRules(form.stageKey, selectedDocs);
      return res;
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Rule updated.", position: "top-right" });
      setOpen(false);
      setEditing(null);
      setSelectedDocs([]);
      queryClient.invalidateQueries({ queryKey: ["enquiry-rules"] });
      queryClient.invalidateQueries({ queryKey: ["document-rules"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to update rule.", position: "top-right" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteData(apiRoutes.enquiryRules.delete(id)),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Rule deleted.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["enquiry-rules"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      stageKey: "INQUIRY_CREATED",
      label: "Inquiry Created",
      description: "",
      sortOrder: 0,
      isActive: true,
      triggersOrderCreation: false,
      requiredActions: [],
    });
    setSelectedDocs([]);
    setOpen(true);
  };

  const openEdit = (rule: any) => {
    setEditing(rule);
    setForm({
      stageKey: rule.stageKey,
      label: rule.label,
      description: rule.description || "",
      sortOrder: Number(rule.sortOrder || 0),
      isActive: rule.isActive !== false,
      triggersOrderCreation: Boolean(rule.triggersOrderCreation),
      requiredActions: Array.isArray(rule.requiredActions) ? rule.requiredActions : [],
    });
    const stageDocs = docRules
      .filter((r: any) => String(r.stageType) === "INQUIRY" && String(r.stageKey) === String(rule.stageKey))
      .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .map((r: any) => ({
        docType: String(r.docType),
        actionType: String(r.actionType || "UPLOAD"),
        visibility: String(r.visibility || "BOTH"),
        responsibleRole: String(r.responsibleRole || "SELLER"),
        tradeType: String(r.tradeType || "BOTH"),
        isRequired: Boolean(r.isRequired),
      }));
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
      patchData(apiRoutes.enquiryRules.update(rule._id), { sortOrder: (idx + 1) * 10 });
    });
    queryClient.invalidateQueries({ queryKey: ["enquiry-rules"] });
  };

  return (
    <section className="">
      <Title title="Enquiry Rules" />

      <div className="mx-2 md:mx-6 mb-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <div className="flex flex-col gap-4">
          <RulesActionStrip
            title="Enquiry Actions"
            items={actionUsage.map(({ action, used }) => ({
              label: action.replaceAll("_", " "),
              used,
            }))}
          />
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
              if ((rule.requiredActions || []).length) {
                badges.push({ label: `${rule.requiredActions.length} actions`, colorClass: "text-primary-600 bg-primary-500/10" });
              } else {
                badges.push({ label: "No required actions", colorClass: "text-default-600 bg-default-100/70" });
              }
              if (rule.triggersOrderCreation) {
                badges.push({ label: "Triggers Order Creation", colorClass: "text-success-600 bg-success-500/10" });
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
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold border ${isActiveStage
                          ? "border-primary-400 bg-primary-500/10 text-primary-600"
                          : "border-default-200/60 text-default-600 hover:bg-default-100/80"
                          }`}
                      >
                        {rule.label}
                        <div className="text-[10px] text-default-400">{rule.stageKey}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-semibold text-default-500 mb-1">Required Actions</div>
                <div className="flex flex-col gap-2 mb-4">
                  {(previewStage?.requiredActions || []).length === 0 ? (
                    <div className="text-[11px] text-default-400">No required actions.</div>
                  ) : (
                    previewStage?.requiredActions?.map((action: string) => (
                      <label key={action} className="flex items-center justify-between gap-2 text-xs">
                        <span>{action.replaceAll("_", " ")}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(previewActionState[action])}
                          onChange={() =>
                            setPreviewActionState((prev) => ({ ...prev, [action]: !prev[action] }))
                          }
                        />
                      </label>
                    ))
                  )}
                </div>

                <div className="text-xs font-semibold text-default-500 mb-1">Required Documents</div>
                <div className="flex flex-col gap-2 mb-4">
                  {stageDocRules.length === 0 ? (
                    <div className="text-[11px] text-default-400">No documents required.</div>
                  ) : (
                    stageDocRules.map((doc: any) => (
                      <label key={doc._id || doc.docType} className="flex items-center justify-between gap-2 text-xs">
                        <span>{String(doc.docType).replaceAll("_", " ")}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(previewDocState[String(doc.docType)])}
                          onChange={() =>
                            setPreviewDocState((prev) => ({
                              ...prev,
                              [String(doc.docType)]: !prev[String(doc.docType)],
                            }))
                          }
                        />
                      </label>
                    ))
                  )}
                </div>

                <div className={`rounded-lg border px-3 py-2 text-xs ${previewMissing.length === 0 ? "border-success-400/50 bg-success-500/10 text-success-600" : "border-warning-400/50 bg-warning-500/10 text-warning-700"}`}>
                  {previewMissing.length === 0 ? (
                    <div className="font-semibold">Ready to advance</div>
                  ) : (
                    <>
                      <div className="font-semibold mb-1">Missing requirements</div>
                      <ul className="list-disc pl-4">
                        {previewMissing.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </>
            )
          }
        />
      </div>

      <Modal isOpen={open} onOpenChange={setOpen} isDismissable={false} isKeyboardDismissDisabled>
        <ModalContent>
          <ModalHeader>{editing ? "Edit Stage" : "Create Stage"}</ModalHeader>
          <ModalBody>
            <Input
              label="Stage Key"
              placeholder="INQUIRY_CREATED"
              value={form.stageKey}
              onValueChange={(value) => setForm({ ...form, stageKey: value.toUpperCase() })}
            />
            <Input
              label="Label"
              placeholder="Inquiry Created"
              value={form.label}
              onValueChange={(value) => setForm({ ...form, label: value })}
            />
            <Input
              label="Description"
              placeholder="Optional description"
              value={form.description}
              onValueChange={(value) => setForm({ ...form, description: value })}
            />
            <Select
              label="Required Actions"
              selectionMode="multiple"
              selectedKeys={new Set(form.requiredActions)}
              onSelectionChange={(keys) => setForm({ ...form, requiredActions: Array.from(keys as Set<string>) })}
            >
              {ACTIONS.map((action) => (
                <SelectItem key={action}>{action}</SelectItem>
              ))}
            </Select>
            <Input
              label="Sort Order"
              type="number"
              value={String(form.sortOrder || 0)}
              onValueChange={(value) => setForm({ ...form, sortOrder: Number(value || 0) })}
            />
            <Switch
              isSelected={form.triggersOrderCreation}
              onValueChange={(value) => setForm({ ...form, triggersOrderCreation: value })}
            >
              Triggers Order Creation
            </Switch>
            <Switch
              isSelected={form.isActive}
              onValueChange={(value) => setForm({ ...form, isActive: value })}
            >
              Active
            </Switch>

            <DocRulesEditor
              docTypes={DOC_TYPES}
              selectedDocs={selectedDocs}
              setSelectedDocs={setSelectedDocs}
              defaults={{ actionType: "UPLOAD", visibility: "BOTH", responsibleRole: "SELLER", tradeType: "BOTH" }}
              actionTypes={ACTION_TYPES}
              visibilityOptions={VISIBILITY}
              responsibleRoles={RESPONSIBLE_ROLES}
              tradeTypes={TRADE_TYPES}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={() => (editing ? updateMutation.mutate() : createMutation.mutate())}>
              {editing ? "Update" : "Create"}
            </Button>
            {editing && (
              <Button color="danger" variant="flat" onPress={() => deleteMutation.mutate(editing._id)}>
                Delete
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}
