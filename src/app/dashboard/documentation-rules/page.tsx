"use client";

import React, { useMemo, useState } from "react";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Switch, Chip } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Title from "@/components/titles";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData, patchData, deleteData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import Link from "next/link";

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
const STAGE_TYPES = ["INQUIRY", "ORDER"];
const INQUIRY_STAGES = ["INQUIRY_CREATED", "QUOTATION_SUBMITTED", "QUOTATION_REVISED", "PROFORMA_ISSUED", "PURCHASE_ORDER_RECEIVED", "ORDER_CONFIRMED"];
const ORDER_STAGES = ["ORDER_CREATED", "CONTRACT_SIGNED", "PRODUCTION_STARTED", "QUALITY_VERIFIED", "COMPLIANCE_APPROVED", "PACKING_COMPLETED", "READY_FOR_SHIPMENT", "SHIPPED", "DELIVERED", "PAYMENT_PENDING", "PAYMENT_COMPLETED", "TRADE_CLOSED"];
const RESPONSIBLE_ROLES = ["BUYER", "SELLER", "OBAOL", "PACKAGING", "QUALITY", "TRANSPORT", "SHIPPING"];
const ACTION_TYPES = ["CREATE", "UPLOAD"];
const VISIBILITY = ["BUYER", "SELLER", "BOTH", "INTERNAL"];
const TRADE_TYPES = ["DOMESTIC", "INTERNATIONAL", "BOTH"];

export default function DocumentationRulesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({
    docType: "QUOTATION",
    stageType: "INQUIRY",
    stageKey: "INQUIRY_CREATED",
    responsibleRole: "SELLER",
    actionType: "CREATE",
    visibility: "BOTH",
    tradeType: "BOTH",
    isRequired: true,
    isActive: true,
    sortOrder: 0,
  });

  const { data: rulesResponse } = useQuery({
    queryKey: ["document-rules"],
    queryFn: () => getData(apiRoutes.documentRules.list),
  });
  const rules = Array.isArray(rulesResponse?.data?.data) ? rulesResponse.data.data : [];

  const filteredRules = useMemo(() => {
    if (!search.trim()) return rules;
    const needle = search.toLowerCase();
    return rules.filter((r: any) =>
      [r.docType, r.stageType, r.stageKey, r.responsibleRole].some((v: any) => String(v || "").toLowerCase().includes(needle))
    );
  }, [rules, search]);

  const createMutation = useMutation({
    mutationFn: () => postData(apiRoutes.documentRules.create, form),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Rule created.", position: "top-right" });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["document-rules"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to create rule.", position: "top-right" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => patchData(apiRoutes.documentRules.update(editing?._id), form),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Rule updated.", position: "top-right" });
      setOpen(false);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["document-rules"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to update rule.", position: "top-right" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteData(apiRoutes.documentRules.delete(id)),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Rule deleted.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["document-rules"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      docType: "QUOTATION",
      stageType: "INQUIRY",
      stageKey: "INQUIRY_CREATED",
      responsibleRole: "SELLER",
      actionType: "CREATE",
      visibility: "BOTH",
      tradeType: "BOTH",
      isRequired: true,
      isActive: true,
      sortOrder: 0,
    });
    setOpen(true);
  };

  const openEdit = (rule: any) => {
    setEditing(rule);
    setForm({
      docType: rule.docType,
      stageType: rule.stageType,
      stageKey: rule.stageKey,
      responsibleRole: rule.responsibleRole,
      actionType: rule.actionType,
      visibility: rule.visibility,
      tradeType: rule.tradeType,
      isRequired: Boolean(rule.isRequired),
      isActive: rule.isActive !== false,
      sortOrder: Number(rule.sortOrder || 0),
    });
    setOpen(true);
  };

  const stageOptions = form.stageType === "INQUIRY" ? INQUIRY_STAGES : ORDER_STAGES;

  const [previewStageType, setPreviewStageType] = useState<string>("INQUIRY");
  const [previewStageKey, setPreviewStageKey] = useState<string>("INQUIRY_CREATED");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const handleRowSelect = (rule: any) => {
    setSelectedRuleId(rule?._id || null);
    if (rule?.stageType) setPreviewStageType(String(rule.stageType));
    if (rule?.stageKey) setPreviewStageKey(String(rule.stageKey));
  };

  const previewStageOptions = previewStageType === "INQUIRY" ? INQUIRY_STAGES : ORDER_STAGES;
  const previewStageRules = rules.filter(
    (rule: any) => rule.stageType === previewStageType && rule.stageKey === previewStageKey
  );

  return (
    <section className="">
      <Title title="Documentation Rules" />

      <div className="mx-2 md:mx-6 mb-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Input
              className="w-full md:w-80"
              placeholder="Search rules"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button color="primary" onPress={openCreate}>Add Rule</Button>
          </div>

          <div className="rounded-xl border border-default-200/70 bg-content1/95 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-default-500 border-b border-default-200/60">
                <tr>
                  <th className="text-left px-4 py-3">Doc Type</th>
                  <th className="text-left px-4 py-3">Stage</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3">Trade</th>
                  <th className="text-left px-4 py-3">Required</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-default-500">No rules found.</td>
                  </tr>
                ) : (
                  filteredRules.map((rule: any) => (
                    <tr
                      key={rule._id}
                      className={`border-t border-default-200/60 group hover:bg-default-50/50 transition-colors cursor-pointer ${
                        selectedRuleId === rule._id ? "bg-default-100/60" : ""
                      }`}
                      onClick={() => handleRowSelect(rule)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-default-700">{rule.docType}</div>
                        <div className="text-[10px] text-default-400 uppercase tracking-tight">{rule.visibility} Visibility</div>
                      </td>
                      <td className="px-4 py-3 border-l border-default-200/20">
                        <div className="text-[11px] font-black text-secondary-500">{rule.stageType}</div>
                        <div className="text-xs font-semibold">{rule.stageKey}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold">{rule.responsibleRole}</td>
                      <td className="px-4 py-3 text-xs">{rule.actionType}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          rule.tradeType === "INTERNATIONAL" ? "bg-primary-500/10 text-primary-600 border-primary-200" :
                          rule.tradeType === "DOMESTIC" ? "bg-success-500/10 text-success-600 border-success-200" :
                          "bg-default-100 text-default-600 border-default-200"
                        }`}>
                          {rule.tradeType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {rule.isRequired ? (
                          <span className="text-danger font-bold text-xs">Yes</span>
                        ) : (
                          <span className="text-default-400 text-xs">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="flat" onPress={(e) => { e.stopPropagation(); openEdit(rule); }}>Edit</Button>
                          <Button size="sm" color="danger" variant="flat" onPress={(e) => { e.stopPropagation(); deleteMutation.mutate(rule._id); }}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stage Preview Sidebar */}
        <div className="rounded-xl border border-default-200/70 bg-content1/95 p-4 h-fit sticky top-6 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">Stage Preview</h3>
                <p className="text-xs text-default-500">Documentation requirements by step</p>
              </div>
            </div>
            <Button as={Link} href="/dashboard/documentation-preview" size="sm" variant="flat" color="secondary">
              A4 Preview
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-4">
            <Select
              aria-label="Select Stage Type"
              size="sm"
              selectedKeys={[previewStageType]}
              onSelectionChange={(keys) => {
                const next = String(Array.from(keys)[0] || "INQUIRY");
                setPreviewStageType(next);
                setPreviewStageKey(next === "INQUIRY" ? "INQUIRY_CREATED" : "ORDER_CREATED");
              }}
            >
              {STAGE_TYPES.map((t) => (
                <SelectItem key={t}>{t}</SelectItem>
              ))}
            </Select>
            <Select
              aria-label="Select Stage"
              size="sm"
              selectedKeys={[previewStageKey]}
              onSelectionChange={(keys) => setPreviewStageKey(String(Array.from(keys)[0] || ""))}
            >
              {previewStageOptions.map((t) => (
                <SelectItem key={t}>{t}</SelectItem>
              ))}
            </Select>
          </div>

          <div className="max-h-[680px] overflow-y-auto pr-1 custom-scrollbar space-y-3">
            {previewStageRules.length === 0 ? (
              <div className="text-xs text-default-500">No documentation rules configured for this stage.</div>
            ) : (
              previewStageRules.map((rule: any) => (
                <div key={rule._id} className="rounded-xl border border-default-200/60 bg-default-50/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground">{rule.docType}</div>
                    <Chip size="sm" variant="flat" color={rule.isRequired ? "danger" : "default"}>
                      {rule.isRequired ? "Required" : "Optional"}
                    </Chip>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-default-500">
                    <div>Role: <span className="text-foreground/80 font-semibold">{rule.responsibleRole}</span></div>
                    <div>Action: <span className="text-foreground/80 font-semibold">{rule.actionType}</span></div>
                    <div>Visibility: <span className="text-foreground/80 font-semibold">{rule.visibility}</span></div>
                    <div>Trade: <span className="text-foreground/80 font-semibold">{rule.tradeType}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={open} onOpenChange={setOpen} isDismissable={false} isKeyboardDismissDisabled>
        <ModalContent>
          <ModalHeader>{editing ? "Edit Rule" : "Create Rule"}</ModalHeader>
          <ModalBody>
            <Select label="Document Type" selectedKeys={[form.docType]} onSelectionChange={(keys) => setForm({ ...form, docType: String(Array.from(keys)[0] || "QUOTATION") })}>
              {DOC_TYPES.map((t) => (<SelectItem key={t}>{t}</SelectItem>))}
            </Select>
            <Select label="Stage Type" selectedKeys={[form.stageType]} onSelectionChange={(keys) => {
              const next = String(Array.from(keys)[0] || "INQUIRY");
              setForm({ ...form, stageType: next, stageKey: next === "INQUIRY" ? "INQUIRY_CREATED" : "ORDER_CREATED" });
            }}>
              {STAGE_TYPES.map((t) => (<SelectItem key={t}>{t}</SelectItem>))}
            </Select>
            <Select label="Stage Key" selectedKeys={[form.stageKey]} onSelectionChange={(keys) => setForm({ ...form, stageKey: String(Array.from(keys)[0] || "") })}>
              {stageOptions.map((s) => (<SelectItem key={s}>{s}</SelectItem>))}
            </Select>
            <Select label="Responsible Role" selectedKeys={[form.responsibleRole]} onSelectionChange={(keys) => setForm({ ...form, responsibleRole: String(Array.from(keys)[0] || "SELLER") })}>
              {RESPONSIBLE_ROLES.map((r) => (<SelectItem key={r}>{r}</SelectItem>))}
            </Select>
            <Select label="Action Type" selectedKeys={[form.actionType]} onSelectionChange={(keys) => setForm({ ...form, actionType: String(Array.from(keys)[0] || "CREATE") })}>
              {ACTION_TYPES.map((a) => (<SelectItem key={a}>{a}</SelectItem>))}
            </Select>
            <Select label="Visibility" selectedKeys={[form.visibility]} onSelectionChange={(keys) => setForm({ ...form, visibility: String(Array.from(keys)[0] || "BOTH") })}>
              {VISIBILITY.map((v) => (<SelectItem key={v}>{v}</SelectItem>))}
            </Select>
            <Select label="Trade Type" selectedKeys={[form.tradeType]} onSelectionChange={(keys) => setForm({ ...form, tradeType: String(Array.from(keys)[0] || "BOTH") })}>
              {TRADE_TYPES.map((t) => (<SelectItem key={t}>{t}</SelectItem>))}
            </Select>
            <Input label="Sort Order" type="number" value={String(form.sortOrder)} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value || 0) })} />
            <Switch isSelected={form.isRequired} onValueChange={(v) => setForm({ ...form, isRequired: v })}>Required</Switch>
            <Switch isSelected={form.isActive} onValueChange={(v) => setForm({ ...form, isActive: v })}>Active</Switch>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setOpen(false)}>Cancel</Button>
            <Button color="primary" onPress={() => (editing ? updateMutation.mutate() : createMutation.mutate())}>
              {editing ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}
