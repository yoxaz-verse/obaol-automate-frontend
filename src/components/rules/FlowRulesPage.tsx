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
import {
  FiShoppingCart,
  FiTruck,
  FiPackage,
  FiBox,
  FiGlobe,
  FiDatabase,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiAlertCircle,
  FiSettings,
  FiPlay,
  FiFastForward,
  FiActivity,
  FiLayers,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import RulesActionStrip from "@/components/rules/RulesActionStrip";
import RulesSearchBar from "@/components/rules/RulesSearchBar";
import RulesSortableList from "@/components/rules/RulesSortableList";
import RulesPreviewPanel from "@/components/rules/RulesPreviewPanel";
import DocRulesEditor from "@/components/rules/DocRulesEditor";

const SUBFLOW_ICONS: Record<string, any> = {
  PROCUREMENT: FiShoppingCart,
  LOGISTICS: FiTruck,
  INTERNAL_LOGISTICS: FiPackage,
  PACKAGING: FiBox,
  FREIGHT_FORWARDING: FiGlobe,
  INVENTORY: FiDatabase,
};

const SUBFLOW_DESCRIPTIONS: Record<string, string> = {
  PROCUREMENT: "Sourcing and purchasing raw materials or products.",
  LOGISTICS: "Standard shipping and delivery operations.",
  INTERNAL_LOGISTICS: "Movement of goods between internal warehouses or hubs.",
  PACKAGING: "Product labeling, boxing, and preparation for shipment.",
  FREIGHT_FORWARDING: "International cargo orchestration and documentation.",
  INVENTORY: "Stock management and storage allocation.",
};

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
  { key: "PROCUREMENT", label: "Procurement Flow" },
  { key: "LOGISTICS", label: "Logistics Flow" },
  { key: "INTERNAL_LOGISTICS", label: "Internal Logistics Flow" },
  { key: "PACKAGING", label: "Packaging Flow" },
  { key: "FREIGHT_FORWARDING", label: "Freight Forwarding Flow" },
  { key: "INVENTORY", label: "Inventory Flow" },
];

const ORDER_SUBFLOWS = [
  { key: "PROCUREMENT", label: "Procurement" },
  { key: "LOGISTICS", label: "Logistics" },
  { key: "INTERNAL_LOGISTICS", label: "Internal Logistics" },
  { key: "PACKAGING", label: "Packaging" },
  { key: "FREIGHT_FORWARDING", label: "Freight Forwarding" },
  { key: "INVENTORY", label: "Inventory" },
];

type SubflowConfig = {
  _id: string;
  subflowType: string;
  startAtOrderStage: string;
  mustCompleteBeforeOrderStage: string;
  dependsOnSubflows: string[];
  isActive: boolean;
};

const STAGE_DEFAULTS: Record<string, { stageKey: string; label: string }> = {
  TRADE_ENQUIRY: { stageKey: "INQUIRY_CREATED", label: "Inquiry Created" },
  TRADE_ORDER: { stageKey: "ORDER_CREATED", label: "Order Created" },
  SAMPLING: { stageKey: "REQUESTED", label: "Requested" },
  WAREHOUSE: { stageKey: "INBOUND_REQUESTED", label: "Inbound Requested" },
  PROCUREMENT: { stageKey: "REQUESTED", label: "Requested" },
  LOGISTICS: { stageKey: "PICKUP_SCHEDULED", label: "Pickup Scheduled" },
  INTERNAL_LOGISTICS: { stageKey: "VEHICLE_ASSIGNED", label: "Vehicle Assigned" },
  PACKAGING: { stageKey: "SPEC_RECEIVED", label: "Spec Received" },
  FREIGHT_FORWARDING: { stageKey: "BOOKING_REQUESTED", label: "Booking Requested" },
  INVENTORY: { stageKey: "STOCK_IN", label: "Stock In" },
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

const flowStageType = (flowType: string) => {
  if (flowType === "TRADE_ENQUIRY") return "INQUIRY";
  if (flowType === "TRADE_ORDER") return "ORDER";
  if (
    [
      "PROCUREMENT",
      "LOGISTICS",
      "INTERNAL_LOGISTICS",
      "PACKAGING",
      "FREIGHT_FORWARDING",
      "INVENTORY",
    ].includes(flowType)
  ) {
    return flowType;
  }
  return null;
};

const parseActionList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim().toUpperCase().replace(/\s+/g, "_"))
    .filter(Boolean);

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

  const { data: subflowResponse } = useQuery({
    queryKey: ["order-subflows"],
    queryFn: () => getData(apiRoutes.orderSubflowConfigs.list),
    enabled: flowType === "TRADE_ORDER",
  });
  const subflowConfigs = Array.isArray(subflowResponse?.data?.data) ? subflowResponse.data.data : [];

  const subflowConfigMap = useMemo(() => {
    const map = new Map<string, SubflowConfig>();
    (subflowConfigs || []).forEach((config: SubflowConfig) => {
      map.set(String(config.subflowType), config);
    });
    return map;
  }, [subflowConfigs]);

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

  const subflowMutation = useMutation({
    mutationFn: async (payload: {
      id?: string;
      subflowType: string;
      startAtOrderStage: string;
      mustCompleteBeforeOrderStage: string;
      dependsOnSubflows: string[];
      isActive: boolean;
    }) => {
      if (payload.id) {
        return patchData(apiRoutes.orderSubflowConfigs.update(payload.id), {
          startAtOrderStage: payload.startAtOrderStage,
          mustCompleteBeforeOrderStage: payload.mustCompleteBeforeOrderStage,
          dependsOnSubflows: payload.dependsOnSubflows,
          isActive: payload.isActive,
        });
      }
      return postData(apiRoutes.orderSubflowConfigs.create, {
        subflowType: payload.subflowType,
        startAtOrderStage: payload.startAtOrderStage,
        mustCompleteBeforeOrderStage: payload.mustCompleteBeforeOrderStage,
        dependsOnSubflows: payload.dependsOnSubflows,
        isActive: payload.isActive,
      });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Subflow configuration saved.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["order-subflows"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to save subflow configuration.", position: "top-right" });
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
  ) as any;

  const dragDisabled = Boolean(search.trim());

  const previewStage = useMemo(() => {
    if (!sortedRules.length) return null;
    const matched = sortedRules.find((r: any) => String(r.stageKey) === String(previewStageKey));
    return matched || sortedRules[0];
  }, [sortedRules, previewStageKey]);

  const orderStageOptions = useMemo(() => {
    if (flowType !== "TRADE_ORDER") return [] as { key: string; label: string }[];
    return sortedRules.map((rule: any) => ({
      key: String(rule.stageKey),
      label: String(rule.label || rule.stageKey),
    }));
  }, [sortedRules, flowType]);

  const orderStageLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    orderStageOptions.forEach((stage) => map.set(stage.key, stage.label));
    return map;
  }, [orderStageOptions]);

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

  const renderSubflowIndicator = () => {
    if (flowType !== "TRADE_ORDER") return null;
    if (ORDER_SUBFLOWS.length === 0) return null;
    return (
      <div className="rounded-xl border border-default-200/70 bg-content1/90 p-3">
        <div className="text-[11px] font-semibold text-default-600 uppercase tracking-widest mb-2">
          Subflow Indicator
        </div>
        <div className="flex flex-col gap-2">
          {ORDER_SUBFLOWS.map((flow) => {
            const config = subflowConfigMap.get(flow.key);
            if (!config) {
              return (
                <div key={flow.key} className="flex items-center justify-between text-xs text-default-500">
                  <span className="font-semibold text-default-600">{flow.label}</span>
                  <span className="italic">Not configured</span>
                </div>
              );
            }
            const startLabel =
              orderStageLabelMap.get(String(config.startAtOrderStage)) || "Start not set";
            const endLabel =
              orderStageLabelMap.get(String(config.mustCompleteBeforeOrderStage)) || "End not set";
            return (
              <div key={flow.key} className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-default-700">{flow.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-default-100 text-default-600 border border-default-200">
                  {startLabel}
                </span>
                <span className="text-default-400">→</span>
                <span className="px-2 py-0.5 rounded-full bg-default-100 text-default-600 border border-default-200">
                  {endLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
      const existing = docMap.get(draft.docType) as any;
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

          {flowType === "TRADE_ORDER" && (
            <div className="rounded-xl border border-default-200/70 bg-content1/90 p-4">
              <div className="text-xs font-semibold text-default-600 uppercase tracking-widest mb-3">
                Order Subflows (Display Only)
              </div>
              <div className="flex flex-wrap gap-2">
                {ORDER_SUBFLOWS.map((flow) => (
                  <button
                    key={flow.key}
                    onClick={() => setFlowType(flow.key)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-default-200 text-default-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-500/10 transition"
                  >
                    {flow.label}
                  </button>
                ))}
              </div>

              {orderStageOptions.length > 0 && (
                <div className="mt-4 border-t border-default-200/60 pt-4">
                  <div className="text-xs font-semibold text-default-600 uppercase tracking-widest mb-3">
                    Subflow Orchestration
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {ORDER_SUBFLOWS.map((flow, index) => {
                      const config = subflowConfigMap.get(flow.key);
                      const startStage = config?.startAtOrderStage || orderStageOptions[0]?.key || "";
                      const endStage = config?.mustCompleteBeforeOrderStage || orderStageOptions[orderStageOptions.length - 1]?.key || "";
                      const Icon = SUBFLOW_ICONS[flow.key] || FiActivity;
                      const isActive = config?.isActive ?? false;

                      return (
                        <motion.div
                          key={flow.key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${isActive
                            ? "bg-content1 border-default-200/60 shadow-md hover:shadow-xl hover:border-warning-400/30"
                            : "bg-default-50/50 border-default-100 opacity-60 grayscale-[0.5]"
                            }`}
                        >
                          <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-500 ${isActive ? "bg-warning-500 shadow-[2px_0_10px_rgba(245,158,11,0.2)]" : "bg-default-300"}`} />

                          <div className="p-4 sm:p-5">
                            <div className="flex items-start justify-between mb-5">
                              <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? "bg-warning-500/10 text-warning-600 shadow-inner" : "bg-default-200 text-default-400"
                                  }`}>
                                  <Icon className="text-xl" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <div className="text-base font-black tracking-tight flex items-center gap-2">
                                    {flow.label}
                                    {isActive ? (
                                      <span className="flex w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                                    ) : (
                                      <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest bg-default-100 px-1.5 py-0.5 rounded">Off</span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-default-400 max-w-[200px] leading-tight font-medium">
                                    {SUBFLOW_DESCRIPTIONS[flow.key] || "Automated trade execution sub-module."}
                                  </p>
                                </div>
                              </div>
                              <Switch
                                size="sm"
                                isSelected={isActive}
                                onValueChange={(value) =>
                                  subflowMutation.mutate({
                                    id: config?._id,
                                    subflowType: flow.key,
                                    startAtOrderStage: startStage,
                                    mustCompleteBeforeOrderStage: endStage,
                                    dependsOnSubflows: config?.dependsOnSubflows || [],
                                    isActive: value,
                                  })
                                }
                                classNames={{ wrapper: "group-hover:scale-110 transition-transform shadow-sm" }}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-default-400 pl-1 flex items-center gap-1">
                                  <FiPlay className="text-[9px]" /> Start
                                </label>
                                <Select
                                  size="sm"
                                  variant="bordered"
                                  radius="lg"
                                  selectedKeys={startStage ? [startStage] : []}
                                  isDisabled={!isActive}
                                  classNames={{ trigger: "h-11 bg-content2/40 border-default-200/50 hover:border-warning-500/50" }}
                                  onSelectionChange={(keys) => {
                                    const next = String(Array.from(keys)[0] || "");
                                    subflowMutation.mutate({
                                      id: config?._id,
                                      subflowType: flow.key,
                                      startAtOrderStage: next,
                                      mustCompleteBeforeOrderStage: endStage,
                                      dependsOnSubflows: config?.dependsOnSubflows || [],
                                      isActive: isActive,
                                    });
                                  }}
                                >
                                  {orderStageOptions.map((stage) => (
                                    <SelectItem key={stage.key} value={stage.key}>
                                      {stage.label}
                                    </SelectItem>
                                  ))}
                                </Select>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-default-400 pl-1 flex items-center gap-1">
                                  <FiFastForward className="text-[9px]" /> Limit
                                </label>
                                <Select
                                  size="sm"
                                  variant="bordered"
                                  radius="lg"
                                  selectedKeys={endStage ? [endStage] : []}
                                  isDisabled={!isActive}
                                  classNames={{ trigger: "h-11 bg-content2/40 border-default-200/50 hover:border-warning-500/50" }}
                                  onSelectionChange={(keys) => {
                                    const next = String(Array.from(keys)[0] || "");
                                    subflowMutation.mutate({
                                      id: config?._id,
                                      subflowType: flow.key,
                                      startAtOrderStage: startStage,
                                      mustCompleteBeforeOrderStage: next,
                                      dependsOnSubflows: config?.dependsOnSubflows || [],
                                      isActive: isActive,
                                    });
                                  }}
                                >
                                  {orderStageOptions.map((stage) => (
                                    <SelectItem key={stage.key} value={stage.key}>
                                      {stage.label}
                                    </SelectItem>
                                  ))}
                                </Select>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-default-400 pl-1 flex items-center gap-1">
                                  <FiLayers className="text-[9px]" /> Depends
                                </label>
                                <Select
                                  size="sm"
                                  variant="bordered"
                                  radius="lg"
                                  selectionMode="multiple"
                                  selectedKeys={new Set(config?.dependsOnSubflows || [])}
                                  isDisabled={!isActive}
                                  placeholder="None"
                                  classNames={{ trigger: "h-11 bg-content2/40 border-default-200/50 hover:border-warning-500/50" }}
                                  onSelectionChange={(keys) => {
                                    const nextDeps = Array.from(keys as Set<string>);
                                    subflowMutation.mutate({
                                      id: config?._id,
                                      subflowType: flow.key,
                                      startAtOrderStage: startStage,
                                      mustCompleteBeforeOrderStage: endStage,
                                      dependsOnSubflows: nextDeps,
                                      isActive: isActive,
                                    });
                                  }}
                                >
                                  {ORDER_SUBFLOWS.filter((f) => f.key !== flow.key).map((f) => (
                                    <SelectItem key={f.key} value={f.key}>
                                      {f.label}
                                    </SelectItem>
                                  ))}
                                </Select>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex items-center gap-2 p-3 rounded-xl bg-warning-500/5 border border-warning-500/10">
                    <FiAlertCircle className="text-warning-500 shrink-0" />
                    <span className="text-[10px] font-semibold text-warning-700/80 uppercase tracking-widest">
                      Orchestration Warning: Subflows run in parallel but act as hard-gates for their configured 'Limit' stages.
                    </span>
                  </div>
                </div>
              )}
              <div className="mt-4">
                {renderSubflowIndicator()}
              </div>
            </div>
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
                {flowType === "TRADE_ORDER" && (
                  <div className="mb-4">
                    {renderSubflowIndicator()}
                  </div>
                )}
                <div className="flex flex-col gap-0 mb-6 sticky top-0 bg-content1/50 backdrop-blur-md z-10 py-1">
                  {sortedRules.map((rule: any, idx: number) => {
                    const isActiveStage = String(previewStage?.stageKey) === String(rule.stageKey);
                    const isLast = idx === sortedRules.length - 1;
                    return (
                      <div key={rule._id || rule.stageKey} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => setPreviewStageKey(rule.stageKey)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${isActiveStage
                              ? "bg-warning-500 border-warning-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                              : "bg-content1 border-default-300 hover:border-warning-400"
                              }`}
                          >
                            {isActiveStage ? <FiCheck className="text-white text-[10px] font-bold" /> : <div className="w-1.5 h-1.5 rounded-full bg-default-300" />}
                          </button>
                          {!isLast && <div className={`w-0.5 flex-1 transition-colors duration-500 ${isActiveStage ? "bg-warning-500/30" : "bg-default-200/50"}`} />}
                        </div>
                        <button
                          onClick={() => setPreviewStageKey(rule.stageKey)}
                          className={`flex-1 pb-4 text-left group transition-all duration-300 ${isActiveStage ? "translate-x-1" : ""}`}
                        >
                          <div className={`text-xs font-black uppercase tracking-widest transition-colors ${isActiveStage ? "text-warning-600" : "text-default-500 group-hover:text-default-700"}`}>
                            {rule.label || rule.stageKey}
                          </div>
                          <div className={`text-[10px] font-bold transition-opacity ${isActiveStage ? "text-warning-500/70" : "text-default-400 opacity-50"}`}>
                            {rule.stageKey}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={previewStage?.stageKey}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400 mb-3 flex items-center gap-2">
                        <div className="w-1 h-3 bg-warning-500 rounded-full" />
                        Required Actions
                      </div>
                      <div className="space-y-2 pl-3">
                        {(previewStage?.requiredActions || []).length === 0 ? (
                          <div className="text-[11px] italic text-default-400 flex items-center gap-2 bg-default-50 p-2 rounded-lg border border-dashed border-default-200">
                            None configured for this stage.
                          </div>
                        ) : (
                          (previewStage?.requiredActions || []).map((action: string) => {
                            const isDone = Boolean(previewActionState[action]);
                            return (
                              <motion.label
                                whileTap={{ scale: 0.98 }}
                                key={action}
                                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${isDone
                                  ? "bg-success-500/5 border-success-500/20 text-success-700"
                                  : "bg-content2/30 border-default-200/50 text-default-600 hover:border-default-300"
                                  }`}
                              >
                                <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${isDone ? "bg-success-500 text-white shadow-lg shadow-success-500/20" : "bg-default-200 text-default-400"
                                  }`}>
                                  {isDone && <FiCheck className="text-xs" />}
                                </div>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={isDone}
                                  onChange={() =>
                                    setPreviewActionState((prev) => ({ ...prev, [action]: !prev[action] }))
                                  }
                                />
                                <span className="text-xs font-bold tracking-tight">{action.replaceAll("_", " ")}</span>
                              </motion.label>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400 mb-3 flex items-center gap-2">
                        <div className="w-1 h-3 bg-primary-500 rounded-full" />
                        Document Protocol
                      </div>
                      {!showDocRules ? (
                        <div className="text-[11px] italic text-default-400 pl-3">Standard flow (no documents).</div>
                      ) : stageDocRules.length === 0 ? (
                        <div className="text-[11px] italic text-default-400 pl-3 bg-default-50 p-2 rounded-lg border border-dashed border-default-200 ml-3">No documents required at this stage.</div>
                      ) : (
                        <div className="space-y-2 pl-3">
                          {stageDocRules.map((doc: any) => {
                            const key = String(doc.docType);
                            const isUploaded = Boolean(previewDocState[key]);
                            return (
                              <motion.label
                                whileTap={{ scale: 0.98 }}
                                key={key}
                                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${isUploaded
                                  ? "bg-primary-500/5 border-primary-500/20 text-primary-700"
                                  : "bg-content2/30 border-default-200/50 text-default-600 hover:border-default-300"
                                  }`}
                              >
                                <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${isUploaded ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "bg-default-200 text-default-400"
                                  }`}>
                                  {isUploaded && <FiCheck className="text-xs" />}
                                </div>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={isUploaded}
                                  onChange={() =>
                                    setPreviewDocState((prev) => ({ ...prev, [key]: !prev[key] }))
                                  }
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold tracking-tight">{key.replaceAll("_", " ")}</span>
                                  <span className="text-[9px] font-black opacity-50 uppercase tracking-widest">{doc.responsibleRole}</span>
                                </div>
                              </motion.label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className={`mt-8 p-4 rounded-2xl border flex items-center gap-3 transition-all duration-500 ${previewMissing.length === 0
                      ? "bg-success-500/10 border-success-500/20 text-success-700 shadow-lg shadow-success-500/5 rotate-0"
                      : "bg-content2/50 border-default-200 text-default-500"
                      }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${previewMissing.length === 0 ? "bg-success-500 text-white shadow-lg shadow-success-500/20" : "bg-default-200 text-default-400"
                        }`}>
                        {previewMissing.length === 0 ? <FiCheck className="text-xl" /> : <FiActivity className="text-lg animate-pulse" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Execution Status</div>
                        <div className="text-sm font-black tracking-tight leading-none">
                          {previewMissing.length === 0 ? "Compliant & Verified" : "Awaiting Protocol"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </>
            )
          }
        />
      </div>

      <Modal
        isOpen={open}
        onOpenChange={setOpen}
        isDismissable={false}
        isKeyboardDismissDisabled
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent className="bg-content1 text-foreground">
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-divider">
                {editing ? "Edit Stage" : "Create Stage"}
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
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

                {flowType !== "TRADE_ORDER" && (
                  <>
                    {flowType === "TRADE_ENQUIRY" ? (
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
                    ) : (
                      <Input
                        label="Required Actions"
                        placeholder="E.g. REQUEST_ACCEPTED, DOCUMENTS_COLLECTED"
                        variant="bordered"
                        value={(form.requiredActions || []).join(", ")}
                        onValueChange={(value) =>
                          setForm({ ...form, requiredActions: parseActionList(value) })
                        }
                        description="Comma-separated action keys for this flow."
                      />
                    )}
                  </>
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
