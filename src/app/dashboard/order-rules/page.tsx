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
  tradeType: string;
  triggersClose: boolean;
};

type DocRuleDraft = import("@/components/rules/DocRulesEditor").DocRuleDraft;

export default function OrderRulesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [previewStageKey, setPreviewStageKey] = useState<string>("");
  const [previewDocState, setPreviewDocState] = useState<Record<string, boolean>>({});
  const [previewTradeType, setPreviewTradeType] = useState<string>("BOTH");
  const [form, setForm] = useState<RuleForm>({
    stageKey: "ORDER_CREATED",
    label: "Order Created",
    description: "",
    sortOrder: 0,
    isActive: true,
    tradeType: "BOTH",
    triggersClose: false,
  });
  const [selectedDocs, setSelectedDocs] = useState<DocRuleDraft[]>([]);

  const { data: rulesResponse } = useQuery({
    queryKey: ["order-rules"],
    queryFn: () => getData(apiRoutes.orderRules.list),
  });
  const rules = Array.isArray(rulesResponse?.data?.data) ? rulesResponse.data.data : [];

  const { data: docRulesResponse } = useQuery({
    queryKey: ["document-rules"],
    queryFn: () => getData(apiRoutes.documentRules.list),
  });
  const docRules = Array.isArray(docRulesResponse?.data?.data) ? docRulesResponse.data.data : [];

  const seedMutation = useMutation({
    mutationFn: () => postData(`${apiRoutes.orderRules.seed}?force=true`, {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Default order rules restored.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["order-rules"] });
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const dragDisabled = Boolean(search.trim());

  const sortedRules = useMemo(() => {
    return [...rules]
      .filter((rule: any) =>
        previewTradeType === "BOTH"
          ? true
          : String(rule.tradeType || "BOTH") === "BOTH" || String(rule.tradeType) === previewTradeType
      )
      .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  }, [rules, previewTradeType]);

  const previewStage = useMemo(() => {
    if (!sortedRules.length) return null;
    const matched = sortedRules.find((r: any) => String(r.stageKey) === String(previewStageKey));
    return matched || sortedRules[0];
  }, [sortedRules, previewStageKey]);

  const stageDocRules = useMemo(() => {
    if (!previewStage?.stageKey) return [];
    return docRules
      .filter((r: any) => String(r.stageType) === "ORDER" && String(r.stageKey) === String(previewStage.stageKey))
      .filter((r: any) =>
        previewTradeType === "BOTH"
          ? true
          : String(r.tradeType || "BOTH") === "BOTH" || String(r.tradeType) === previewTradeType
      )
      .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  }, [docRules, previewStage?.stageKey, previewTradeType]);

  useEffect(() => {
    if (!previewStage?.stageKey) return;
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
    stageDocRules.forEach((doc: any) => {
      if (doc.isRequired && !previewDocState[String(doc.docType)]) {
        missing.push(String(doc.docType).replaceAll("_", " "));
      }
    });
    return missing;
  }, [previewStage, previewDocState, stageDocRules]);

  const syncDocumentRules = async (stageKey: string, drafts: DocRuleDraft[]) => {
    const stageDocs = docRules.filter((r: any) => String(r.stageType) === "ORDER" && String(r.stageKey) === stageKey);
    const docMap = new Map(stageDocs.map((r: any) => [String(r.docType), r]));
    const keep = new Set(drafts.map((d) => d.docType));

    for (const [index, draft] of drafts.entries()) {
      const payload = {
        docType: draft.docType,
        stageType: "ORDER",
        stageKey,
        responsibleRole: draft.responsibleRole,
        actionType: draft.actionType,
        visibility: draft.visibility,
        tradeType: draft.tradeType,
        isRequired: draft.isRequired,
        isActive: true,
        sortOrder: (index + 1) * 10,
      };
      const existing = docMap.get(draft.docType) as any;
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
      const res = await postData(apiRoutes.orderRules.create, form);
      await syncDocumentRules(form.stageKey, selectedDocs);
      return res;
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Rule created.", position: "top-right" });
      setOpen(false);
      setSelectedDocs([]);
      queryClient.invalidateQueries({ queryKey: ["order-rules"] });
      queryClient.invalidateQueries({ queryKey: ["document-rules"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to create rule.", position: "top-right" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await patchData(apiRoutes.orderRules.update(editing?._id), form);
      await syncDocumentRules(form.stageKey, selectedDocs);
      return res;
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Rule updated.", position: "top-right" });
      setOpen(false);
      setEditing(null);
      setSelectedDocs([]);
      queryClient.invalidateQueries({ queryKey: ["order-rules"] });
      queryClient.invalidateQueries({ queryKey: ["document-rules"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to update rule.", position: "top-right" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteData(apiRoutes.orderRules.delete(id)),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Rule deleted.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["order-rules"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      stageKey: "ORDER_CREATED",
      label: "Order Created",
      description: "",
      sortOrder: 0,
      isActive: true,
      tradeType: "BOTH",
      triggersClose: false,
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
      tradeType: String(rule.tradeType || "BOTH"),
      triggersClose: Boolean(rule.triggersClose),
    });
    const stageDocs = docRules
      .filter((r: any) => String(r.stageType) === "ORDER" && String(r.stageKey) === String(rule.stageKey))
      .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .map((r: any) => ({
        docType: String(r.docType),
        actionType: String(r.actionType || "UPLOAD"),
        visibility: String(r.visibility || "BOTH"),
        responsibleRole: String(r.responsibleRole || "OBAOL"),
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
      patchData(apiRoutes.orderRules.update(rule._id), { sortOrder: (idx + 1) * 10 });
    });
    queryClient.invalidateQueries({ queryKey: ["order-rules"] });
  };

  return (
    <section className="">
      <Title title="Order Rules" />

      <div className="mx-2 md:mx-6 mb-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <div className="flex flex-col gap-4">
          <RulesActionStrip
            title="Order Actions"
            items={[]}
            emptyMessage="No predefined order actions configured yet."
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
              if (rule.tradeType) {
                badges.push({ label: rule.tradeType, colorClass: "text-default-600 bg-default-100/70" });
              }
              if (rule.triggersClose) {
                badges.push({ label: "Final stage", colorClass: "text-success-600 bg-success-500/10" });
              }
              if (!rule.isActive) {
                badges.push({ label: "Inactive", colorClass: "text-warning-600 bg-warning-500/10" });
              }
              return badges;
            }}
          />
        </div>

        <RulesPreviewPanel
          header={(
            <Select
              aria-label="Trade Type"
              size="sm"
              selectedKeys={[previewTradeType]}
              onSelectionChange={(keys) => setPreviewTradeType(String(Array.from(keys)[0] || "BOTH"))}
              className="max-w-[160px]"
            >
              {TRADE_TYPES.map((t) => (
                <SelectItem key={t}>{t}</SelectItem>
              ))}
            </Select>
          )}
          body={sortedRules.length === 0 ? (
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
          )}
        />
      </div>

      <Modal isOpen={open} onOpenChange={setOpen} isDismissable={false} isKeyboardDismissDisabled>
        <ModalContent>
          <ModalHeader>{editing ? "Edit Stage" : "Create Stage"}</ModalHeader>
          <ModalBody>
            <Input
              label="Stage Key"
              placeholder="ORDER_CREATED"
              value={form.stageKey}
              onValueChange={(value) => setForm({ ...form, stageKey: value.toUpperCase() })}
            />
            <Input
              label="Label"
              placeholder="Order Created"
              value={form.label}
              onValueChange={(value) => setForm({ ...form, label: value })}
            />
            <Input
              label="Description"
              placeholder="Optional description"
              value={form.description}
              onValueChange={(value) => setForm({ ...form, description: value })}
            />
            <Input
              label="Sort Order"
              type="number"
              value={String(form.sortOrder || 0)}
              onValueChange={(value) => setForm({ ...form, sortOrder: Number(value || 0) })}
            />
            <Select
              label="Trade Type"
              selectedKeys={[form.tradeType]}
              onSelectionChange={(keys) => setForm({ ...form, tradeType: String(Array.from(keys)[0] || "BOTH") })}
            >
              {TRADE_TYPES.map((t) => (
                <SelectItem key={t}>{t}</SelectItem>
              ))}
            </Select>
            <Switch
              isSelected={form.triggersClose}
              onValueChange={(value) => setForm({ ...form, triggersClose: value })}
            >
              Mark as final stage
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
              defaults={{ actionType: "UPLOAD", visibility: "BOTH", responsibleRole: "OBAOL", tradeType: "BOTH" }}
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
