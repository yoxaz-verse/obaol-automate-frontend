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
  Chip,
} from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Title from "@/components/titles";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData, patchData, deleteData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

type DocRuleDraft = {
  docType: string;
  actionType: string;
  visibility: string;
  responsibleRole: string;
  tradeType: string;
  isRequired: boolean;
};

function SortableCard({ rule, onEdit, dragDisabled }: { rule: any; onEdit: (rule: any) => void; dragDisabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: rule._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-default-200/70 bg-content1/95 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-bold">{rule.label}</div>
          <div className="text-xs text-default-500">{rule.stageKey}</div>
          {rule.description && (
            <div className="text-xs text-default-400 mt-1">{rule.description}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="flat" onPress={() => onEdit(rule)}>Edit</Button>
          <Button
            size="sm"
            variant="light"
            {...attributes}
            {...listeners}
            isDisabled={dragDisabled}
            title={dragDisabled ? "Clear search to reorder" : "Drag to reorder"}
          >
            Drag
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(rule.requiredActions || []).length ? (
          rule.requiredActions.map((action: string) => (
            <Chip key={action} size="sm" color="primary" variant="flat">
              {action.replaceAll("_", " ")}
            </Chip>
          ))
        ) : (
          <Chip size="sm" variant="flat">No required actions</Chip>
        )}
        {rule.triggersOrderCreation && (
          <Chip size="sm" color="success" variant="flat">Triggers Order Creation</Chip>
        )}
        {!rule.isActive && (
          <Chip size="sm" color="warning" variant="flat">Inactive</Chip>
        )}
      </div>
    </div>
  );
}

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
  const [newDocType, setNewDocType] = useState<string>("");

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
        <div className="rounded-xl border border-default-200/70 bg-content1/95 p-4">
          <div className="text-xs font-semibold text-default-500 mb-2">Enquiry Actions</div>
          <div className="flex flex-wrap gap-2">
            {actionUsage.map(({ action, used }) => (
              <Chip
                key={action}
                size="sm"
                color={used ? "success" : "default"}
                variant={used ? "flat" : "bordered"}
              >
                {action.replaceAll("_", " ")} · {used ? "Used" : "Not used"}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Input
            className="w-full md:w-80"
            placeholder="Search stages"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button variant="flat" onPress={() => seedMutation.mutate()} isLoading={seedMutation.isPending}>
              Restore Defaults
            </Button>
            <Button color="primary" onPress={openCreate}>Add Stage</Button>
          </div>
        </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={sortedRules.map((r: any) => r._id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 gap-3">
                {filteredRules.length === 0 ? (
                  <div className="rounded-xl border border-default-200/70 bg-content1/95 p-6 text-center text-default-500">No rules found.</div>
                ) : (
                  filteredRules.map((rule: any) => (
                    <SortableCard key={rule._id} rule={rule} onEdit={openEdit} dragDisabled={dragDisabled} />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="rounded-xl border border-default-200/70 bg-content1/95 p-4 h-fit sticky top-6">
          <div className="text-sm font-bold mb-2">Flow Preview</div>
          {sortedRules.length === 0 ? (
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
          )}
        </div>
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

            <div className="pt-2">
              <div className="text-sm font-semibold mb-2">Required Documents</div>
              <div className="flex gap-2 items-end flex-wrap">
                <Select
                  label="Add Document"
                  className="min-w-[220px]"
                  selectedKeys={newDocType ? [newDocType] : []}
                  onSelectionChange={(keys) => setNewDocType(String(Array.from(keys)[0] || ""))}
                >
                  {DOC_TYPES.filter((t) => !selectedDocs.some((d) => d.docType === t)).map((t) => (
                    <SelectItem key={t}>{t}</SelectItem>
                  ))}
                </Select>
                <Button
                  size="sm"
                  onPress={() => {
                    if (!newDocType) return;
                    setSelectedDocs((prev) => [
                      ...prev,
                      {
                        docType: newDocType,
                        actionType: "UPLOAD",
                        visibility: "BOTH",
                        responsibleRole: "SELLER",
                        tradeType: "BOTH",
                        isRequired: true,
                      },
                    ]);
                    setNewDocType("");
                  }}
                >
                  Add
                </Button>
              </div>

              {selectedDocs.length === 0 ? (
                <div className="mt-3 text-xs text-default-500">No documents selected for this stage.</div>
              ) : (
                <div className="mt-3 flex flex-col gap-3">
                  {selectedDocs.map((doc, idx) => (
                    <div key={doc.docType} className="rounded-lg border border-default-200/70 p-3 bg-default-50/40">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{doc.docType}</div>
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => setSelectedDocs((prev) => prev.filter((d) => d.docType !== doc.docType))}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Select
                          label="Action Type"
                          selectedKeys={[doc.actionType]}
                          onSelectionChange={(keys) => {
                            const value = String(Array.from(keys)[0] || "UPLOAD");
                            setSelectedDocs((prev) =>
                              prev.map((d, i) => (i === idx ? { ...d, actionType: value } : d))
                            );
                          }}
                        >
                          {ACTION_TYPES.map((a) => (
                            <SelectItem key={a}>{a}</SelectItem>
                          ))}
                        </Select>
                        <Select
                          label="Visibility"
                          selectedKeys={[doc.visibility]}
                          onSelectionChange={(keys) => {
                            const value = String(Array.from(keys)[0] || "BOTH");
                            setSelectedDocs((prev) =>
                              prev.map((d, i) => (i === idx ? { ...d, visibility: value } : d))
                            );
                          }}
                        >
                          {VISIBILITY.map((v) => (
                            <SelectItem key={v}>{v}</SelectItem>
                          ))}
                        </Select>
                        <Select
                          label="Responsible Role"
                          selectedKeys={[doc.responsibleRole]}
                          onSelectionChange={(keys) => {
                            const value = String(Array.from(keys)[0] || "SELLER");
                            setSelectedDocs((prev) =>
                              prev.map((d, i) => (i === idx ? { ...d, responsibleRole: value } : d))
                            );
                          }}
                        >
                          {RESPONSIBLE_ROLES.map((r) => (
                            <SelectItem key={r}>{r}</SelectItem>
                          ))}
                        </Select>
                        <Select
                          label="Trade Type"
                          selectedKeys={[doc.tradeType]}
                          onSelectionChange={(keys) => {
                            const value = String(Array.from(keys)[0] || "BOTH");
                            setSelectedDocs((prev) =>
                              prev.map((d, i) => (i === idx ? { ...d, tradeType: value } : d))
                            );
                          }}
                        >
                          {TRADE_TYPES.map((t) => (
                            <SelectItem key={t}>{t}</SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div className="mt-2">
                        <Switch
                          isSelected={doc.isRequired}
                          onValueChange={(value) =>
                            setSelectedDocs((prev) =>
                              prev.map((d, i) => (i === idx ? { ...d, isRequired: value } : d))
                            )
                          }
                        >
                          Required
                        </Switch>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
