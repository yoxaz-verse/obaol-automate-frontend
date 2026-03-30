"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
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
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiAnchor,
  FiZap,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import RulesActionStrip from "@/components/rules/RulesActionStrip";
import RulesSearchBar from "@/components/rules/RulesSearchBar";
import RulesSortableList from "@/components/rules/RulesSortableList";
import RulesPreviewPanel from "@/components/rules/RulesPreviewPanel";
import DocRulesEditor from "@/components/rules/DocRulesEditor";

const SUBFLOW_ICONS: Record<string, any> = {
  PROCUREMENT: FiShoppingCart,
  INLAND_TRANSPORTATION: FiTruck,
  PACKAGING: FiPackage,
  FREIGHT_FORWARDING: FiGlobe,
  INVENTORY: FiBox,
  CERTIFICATION: FiShield,
  QUALITY_QA: FiCheckCircle,
  WAREHOUSE: FiLayers,
  SHIPPING: FiAnchor,
  CUSTOMS: FiShield,
};

const SUBFLOW_DESCRIPTIONS: Record<string, string> = {
  PROCUREMENT: "Sourcing and purchasing raw materials or products.",
  INLAND_TRANSPORTATION: "Movement of goods through inland routes and road transport.",
  PACKAGING: "Product labeling, boxing, and preparation for shipment.",
  FREIGHT_FORWARDING: "International cargo orchestration and documentation.",
  INVENTORY: "Stock management and storage allocation.",
  CERTIFICATION: "Certification and compliance clearance steps.",
  QUALITY_QA: "Quality assurance and lab validation checkpoints.",
  WAREHOUSE: "Inbound storage, holding, and release operations.",
};

const ACTIONS = [
  "LOI_SUBMITTED",
  "SUPPLIER_QTY_CONFIRMED",
  "REVISION_REQUESTED",
  "QUOTATION_CREATED",
  "QUOTATION_ACCEPTED",
  "RETURN_TO_REVISION",
  "RESPONSIBILITIES_FINALIZED",
  "PROFORMA_CREATED",
  "OTHER_DOCS_UPLOADED",
  "OTHER_DOCS_SKIPPED",
  "PO_UPLOADED",
  "PO_SKIPPED",
] as const;

const ACTION_LABELS: Record<string, string> = {
  LOI_SUBMITTED: "LOI Submitted",
  SUPPLIER_QTY_CONFIRMED: "Supplier Qty Confirmed",
  REVISION_REQUESTED: "Revision Requested",
  QUOTATION_CREATED: "Quotation Created",
  QUOTATION_ACCEPTED: "Quotation Accepted",
  RETURN_TO_REVISION: "Return To Revision",
  RESPONSIBILITIES_FINALIZED: "Responsibilities Finalized",
  PROFORMA_CREATED: "Proforma Created",
  OTHER_DOCS_UPLOADED: "Other Docs Uploaded",
  OTHER_DOCS_SKIPPED: "Other Docs Skipped",
  PO_UPLOADED: "PO Uploaded",
  PO_SKIPPED: "PO Skipped",
};
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
  "LORRY_RECEIPT",
  "LCL_DRAFT",
  "INSURANCE_CERTIFICATE",
  "PAYMENT_ADVICE",
];
const RESPONSIBLE_ROLES = ["BUYER", "SELLER", "OBAOL", "PACKAGING", "QUALITY", "TRANSPORT", "SHIPPING"];
const ACTION_TYPES = ["CREATE", "UPLOAD"];
const VISIBILITY = ["BUYER", "SELLER", "BOTH", "INTERNAL"];
const TRADE_TYPES = ["DOMESTIC", "INTERNATIONAL", "BOTH"];
const ACTION_BY = ["BUYER", "SUPPLIER", "BOTH", "EITHER"];

const FLOW_TYPES = [
  { key: "TRADE_ENQUIRY", label: "Enquiry Flow" },
  { key: "TRADE_ORDER", label: "Order Flow" },
  { key: "SAMPLING", label: "Sampling Flow" },
  { key: "WAREHOUSE", label: "Warehouse Flow" },
  { key: "PROCUREMENT", label: "Procurement Flow" },
  { key: "INLAND_TRANSPORTATION", label: "Inland Transportation Flow" },
  { key: "PACKAGING", label: "Packaging Flow" },
  { key: "FREIGHT_FORWARDING", label: "Freight Forwarding Flow" },
  { key: "INVENTORY", label: "Inventory Flow" },
  { key: "CERTIFICATION", label: "Certification Flow" },
  { key: "QUALITY_QA", label: "Quality & QA Flow" },
];

const ORDER_SUBFLOWS = [
  { key: "PROCUREMENT", label: "Procurement" },
  { key: "INLAND_TRANSPORTATION", label: "Inland Transportation" },
  { key: "PACKAGING", label: "Packaging" },
  { key: "FREIGHT_FORWARDING", label: "Freight Forwarding" },
  { key: "INVENTORY", label: "Inventory" },
  { key: "CERTIFICATION", label: "Certification" },
  { key: "QUALITY_QA", label: "Quality & QA" },
  { key: "WAREHOUSE", label: "Warehouse" },
];

type SubflowConfig = {
  _id: string;
  subflowType: string;
  startAtOrderStage: string;
  mustCompleteBeforeOrderStage: string;
  biddingStartAtOrderStage?: string | null;
  biddingEndAtOrderStage?: string | null;
  dependsOnSubflows: string[];
  isActive: boolean;
};

const STAGE_DEFAULTS: Record<string, { stageKey: string; label: string }> = {
  TRADE_ENQUIRY: { stageKey: "ENQUIRY_CREATED", label: "Enquiry Created" },
  TRADE_ORDER: { stageKey: "ORDER_CREATED", label: "Order Created" },
  SAMPLING: { stageKey: "REQUESTED", label: "Requested" },
  WAREHOUSE: { stageKey: "INBOUND_REQUESTED", label: "Inbound Requested" },
  PROCUREMENT: { stageKey: "PROCUREMENT_SPECIALIST_ASSIGNED", label: "Procurement Specialist Assigned" },
  INLAND_TRANSPORTATION: { stageKey: "PICKUP_SCHEDULED", label: "Pickup Scheduled" },
  PACKAGING: { stageKey: "PACKAGING_REQUEST_RECEIVED", label: "Packaging Request Received" },
  FREIGHT_FORWARDING: { stageKey: "BOOKING_REQUESTED", label: "Booking Requested" },
  INVENTORY: { stageKey: "STOCK_IN", label: "Stock In" },
  CERTIFICATION: { stageKey: "DOCS_COLLECTED", label: "Docs Collected" },
  QUALITY_QA: { stageKey: "SAMPLE_SENT", label: "Sample Sent" },
};

type RuleForm = {
  flowType: string;
  stageKey: string;
  label: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  requiredActions: string[];
  actionBy: string;
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
      "INLAND_TRANSPORTATION",
      "PACKAGING",
      "FREIGHT_FORWARDING",
      "INVENTORY",
      "CERTIFICATION",
      "QUALITY_QA",
      "WAREHOUSE",
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
  const [subflowErrors, setSubflowErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<RuleForm>({
    flowType: defaultFlowType,
    stageKey: STAGE_DEFAULTS[defaultFlowType]?.stageKey || "ENQUIRY_CREATED",
    label: STAGE_DEFAULTS[defaultFlowType]?.label || "Enquiry Created",
    description: "",
    sortOrder: 0,
    isActive: true,
    requiredActions: [],
    actionBy: "",
    triggersOrderCreation: false,
    triggersClose: false,
    tradeType: "BOTH",
  });
  const [selectedDocs, setSelectedDocs] = useState<DocRuleDraft[]>([]);
  const [autoSeeding, setAutoSeeding] = useState(false);
  const autoSeededFlowsRef = useRef(new Set<string>());

  const stageType = flowStageType(flowType);
  const showDocRules = Boolean(stageType);

  const parseMasterRows = (raw: any): any[] => {
    const payload = raw?.data?.data ?? raw?.data ?? raw;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const { data: rulesResponse, isLoading: rulesLoading, isFetching: rulesFetching } = useQuery({
    queryKey: ["flow-rules", flowType],
    queryFn: () => getData(apiRoutes.flowRules.list, { flowType }),
  });
  const rules = parseMasterRows(rulesResponse);

  const { data: docRulesResponse } = useQuery({
    queryKey: ["document-rules"],
    queryFn: () => getData(apiRoutes.documentRules.list),
  });
  const docRules = parseMasterRows(docRulesResponse);

  const { data: subflowResponse } = useQuery({
    queryKey: ["order-subflows"],
    queryFn: () => getData(apiRoutes.orderSubflowConfigs.list),
    enabled: flowType === "TRADE_ORDER",
  });
  const subflowConfigs = parseMasterRows(subflowResponse);

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
    mutationFn: () => patchData(`${apiRoutes.flowRules.seed}?force=true&flowType=${flowType}`, {}),
    onSuccess: (res: any) => {
      const restored = parseMasterRows(res);
      if (restored.length === 0) {
        showToastMessage({ type: "error", message: "No defaults found for this flow type.", position: "top-right" });
        return;
      }
      showToastMessage({ type: "success", message: "Default flow rules restored.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["flow-rules", flowType] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Failed to restore defaults.", position: "top-right" });
    },
  });

  useEffect(() => {
    if (!flowType) return;
    if (rulesLoading || rulesFetching) return;
    if (seedMutation.isPending || autoSeeding) return;
    if (rules.length > 0) return;
    if (autoSeededFlowsRef.current.has(flowType)) return;
    autoSeededFlowsRef.current.add(flowType);
    setAutoSeeding(true);
    seedMutation.mutate(undefined, {
      onSettled: () => setAutoSeeding(false),
    });
  }, [flowType, rulesLoading, rulesFetching, rules.length, seedMutation, autoSeeding]);

  const subflowMutation = useMutation({
    mutationFn: async (payload: {
      id?: string;
      subflowType: string;
      startAtOrderStage: string;
      mustCompleteBeforeOrderStage: string;
      biddingStartAtOrderStage?: string | null;
      biddingEndAtOrderStage?: string | null;
      dependsOnSubflows: string[];
      isActive: boolean;
    }) => {
      if (payload.id) {
        return patchData(apiRoutes.orderSubflowConfigs.update(payload.id), {
          startAtOrderStage: payload.startAtOrderStage,
          mustCompleteBeforeOrderStage: payload.mustCompleteBeforeOrderStage,
          biddingStartAtOrderStage: payload.biddingStartAtOrderStage,
          biddingEndAtOrderStage: payload.biddingEndAtOrderStage,
          dependsOnSubflows: payload.dependsOnSubflows,
          isActive: payload.isActive,
        });
      }
      return postData(apiRoutes.orderSubflowConfigs.create, {
        subflowType: payload.subflowType,
        startAtOrderStage: payload.startAtOrderStage,
        mustCompleteBeforeOrderStage: payload.mustCompleteBeforeOrderStage,
        biddingStartAtOrderStage: payload.biddingStartAtOrderStage,
        biddingEndAtOrderStage: payload.biddingEndAtOrderStage,
        dependsOnSubflows: payload.dependsOnSubflows,
        isActive: payload.isActive,
      });
    },
    onSuccess: (_data, variables: any) => {
      showToastMessage({ type: "success", message: "Subflow configuration saved.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["order-subflows"] });
      const subflowType = String(variables?.subflowType || "");
      if (subflowType) {
        setSubflowErrors((prev) => {
          const next = { ...prev };
          delete next[subflowType];
          return next;
        });
      }
    },
    onError: (error: any, variables: any) => {
      const subflowType = String(variables?.subflowType || "");
      if (subflowType) {
        setSubflowErrors((prev) => ({
          ...prev,
          [subflowType]: error?.response?.data?.message || "Failed to save subflow configuration.",
        }));
      }
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

  const normalizeBiddingStage = (value?: string | null) => {
    if (!value) return "";
    if (value === "NONE" || value === "NULL") return "";
    if (!orderStageLabelMap.has(value)) return "";
    return value;
  };

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
      if (!previewActionState[action]) missing.push(ACTION_LABELS[action] || action.replaceAll("_", " "));
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
      <div className="rounded-[2rem] border border-divider bg-content1 shadow-2xl shadow-black/5 overflow-hidden">
        <div className="bg-default-50/50 px-6 py-4 border-b border-divider flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-500/10 rounded-xl text-warning-600">
              <FiActivity size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/80">
              Flow Manifest
            </span>
          </div>
          <span className="text-[10px] font-black text-default-400 bg-default-100 px-2 py-0.5 rounded-full uppercase">Pipeline</span>
        </div>
        <div className="p-6 flex flex-col gap-5">
          {ORDER_SUBFLOWS.map((flow) => {
            const config = subflowConfigMap.get(flow.key);
            if (!config || !config.isActive) return null;

            const startLabel = orderStageLabelMap.get(String(config.startAtOrderStage)) || "Start";
            const endLabel = orderStageLabelMap.get(String(config.mustCompleteBeforeOrderStage)) || "End";

            return (
              <div key={flow.key} className="group relative pl-5 border-l-2 border-warning-500/30 hover:border-warning-500 transition-colors duration-300">
                <div className="flex flex-col gap-2.5 mb-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-foreground uppercase tracking-tight">{flow.label}</span>
                    <span className="text-[9px] font-black text-default-400 uppercase tracking-widest opacity-60">Subflow Node</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-default-50/50 p-1.5 rounded-xl border border-divider self-start">
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-warning-500 text-black shadow-sm uppercase">{startLabel}</span>
                    <FiArrowRight size={12} className="text-default-400 mx-1 shrink-0" />
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-background border border-divider text-default-500 uppercase shadow-sm">{endLabel}</span>
                  </div>
                </div>
                {config.biddingStartAtOrderStage && (
                  <div className="flex items-center gap-3 mt-2 px-3 py-1.5 rounded-xl bg-warning-500/5 border border-warning-500/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-warning-700 tracking-widest">Bidding Window:</span>
                    <span className="text-[9px] font-black text-warning-600 italic tracking-tight">
                      {orderStageLabelMap.get(String(config.biddingStartAtOrderStage))} ⇢ {orderStageLabelMap.get(String(config.biddingEndAtOrderStage)) || "End"}
                    </span>
                  </div>
                )}
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
      actionBy: "",
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
      actionBy: String(rule.actionBy || ""),
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
              items={FLOW_TYPES}
            >
              {(flow) => (
                <SelectItem key={flow.key} textValue={flow.label}>
                  {flow.label}
                </SelectItem>
              )}
            </Select>
          </div>

          {flowType === "TRADE_ENQUIRY" ? (
            <RulesActionStrip
              title="Enquiry Actions"
              items={actionUsage.map(({ action, used }) => ({
                label: ACTION_LABELS[action] || action.replaceAll("_", " "),
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
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                    {ORDER_SUBFLOWS.map((flow, index) => {
                      const config = subflowConfigMap.get(flow.key);
                      const startStage = config?.startAtOrderStage || orderStageOptions[0]?.key || "";
                      const endStage = config?.mustCompleteBeforeOrderStage || orderStageOptions[orderStageOptions.length - 1]?.key || "";
                      const biddingStartStage = normalizeBiddingStage(config?.biddingStartAtOrderStage);
                      const biddingEndStage = normalizeBiddingStage(config?.biddingEndAtOrderStage);
                      const Icon = SUBFLOW_ICONS[flow.key] || FiActivity;
                      const isActive = config?.isActive ?? false;
                      const errorMessage = subflowErrors[flow.key];

                      return (
                        <motion.div
                          key={flow.key}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`group relative flex flex-col rounded-[2rem] border-2 transition-all duration-500 overflow-hidden
                            ${isActive
                              ? "bg-content1 border-warning-500/20 shadow-2xl shadow-warning-500/5 hover:border-warning-500/40"
                              : "bg-default-50/10 border-default-100 opacity-40 grayscale scale-[0.98]"
                            }`}
                        >
                          {/* Header Wrapper */}
                          <div className={`p-6 flex items-center justify-between border-b ${isActive ? "bg-default-50/50 border-default-100" : "bg-default-50 border-default-100/50"}`}>
                            <div className="flex items-center gap-5">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg
                                ${isActive ? "bg-gradient-to-br from-warning-400 to-warning-600 text-black shadow-warning-500/20" : "bg-default-200 text-default-400"}`}>
                                <Icon size={24} strokeWidth={2.5} />
                              </div>
                              <div>
                                <h4 className="text-lg font-black tracking-tight text-foreground uppercase">{flow.label}</h4>
                                <p className="text-[10px] font-black text-default-400 tracking-[0.25em] uppercase mt-0.5">Execution Subflow</p>
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
                                  biddingStartAtOrderStage: biddingStartStage || null,
                                  biddingEndAtOrderStage: biddingEndStage || null,
                                  dependsOnSubflows: config?.dependsOnSubflows || [],
                                  isActive: value,
                                })
                              }
                              classNames={{ wrapper: "bg-default-200 active:scale-95 transition-transform" }}
                            />
                          </div>

                          {/* Config Body */}
                          <div className="p-6 space-y-6">
                            {/* Execution window */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <FiPlay className="text-default-400 text-xs" />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-default-400">Execution Window</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[9px] font-black uppercase tracking-widest text-default-400 mb-1.5 block">Start Stage</label>
                                  <Select
                                    size="sm"
                                    variant="bordered"
                                    radius="lg"
                                    selectedKeys={startStage ? [startStage] : []}
                                    isDisabled={!isActive}
                                    classNames={{ trigger: "h-10 bg-content2/50 border-default-200/60", value: "text-[11px] font-black uppercase" }}
                                    onSelectionChange={(keys) => {
                                      const next = String(Array.from(keys)[0] || "");
                                      subflowMutation.mutate({
                                        id: config?._id,
                                        subflowType: flow.key,
                                        startAtOrderStage: next,
                                        mustCompleteBeforeOrderStage: endStage,
                                        biddingStartAtOrderStage: biddingStartStage || null,
                                        biddingEndAtOrderStage: biddingEndStage || null,
                                        dependsOnSubflows: config?.dependsOnSubflows || [],
                                        isActive: isActive,
                                      });
                                    }}
                                    items={orderStageOptions}
                                  >
                                    {(stage: any) => (
                                      <SelectItem key={stage.key} textValue={stage.label}>
                                        <span className="text-[10px] font-bold uppercase">{stage.label}</span>
                                      </SelectItem>
                                    )}
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-[9px] font-black uppercase tracking-widest text-default-400 mb-1.5 block">End Stage</label>
                                  <Select
                                    size="sm"
                                    variant="bordered"
                                    radius="lg"
                                    selectedKeys={endStage ? [endStage] : []}
                                    isDisabled={!isActive}
                                    classNames={{ trigger: "h-10 bg-content2/50 border-default-200/60", value: "text-[11px] font-black uppercase" }}
                                    onSelectionChange={(keys) => {
                                      const next = String(Array.from(keys)[0] || "");
                                      subflowMutation.mutate({
                                        id: config?._id,
                                        subflowType: flow.key,
                                        startAtOrderStage: startStage,
                                        mustCompleteBeforeOrderStage: next,
                                        biddingStartAtOrderStage: biddingStartStage || null,
                                        biddingEndAtOrderStage: biddingEndStage || null,
                                        dependsOnSubflows: config?.dependsOnSubflows || [],
                                        isActive: isActive,
                                      });
                                    }}
                                    items={orderStageOptions}
                                  >
                                    {(stage: any) => (
                                      <SelectItem key={stage.key} textValue={stage.label}>
                                        <span className="text-[10px] font-bold uppercase">{stage.label}</span>
                                      </SelectItem>
                                    )}
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* Bidding Window */}
                            <div className="space-y-3 p-4 rounded-2xl bg-default-50/50 border border-default-100">
                              <div className="flex items-center gap-2">
                                <FiActivity className="text-default-400 text-xs" />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-default-400">Bidding Window</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[9px] font-black uppercase tracking-widest text-default-400 mb-1.5 block">Bidding Start</label>
                                  <Select
                                    size="sm"
                                    variant="flat"
                                    radius="lg"
                                    placeholder="None"
                                    selectedKeys={biddingStartStage ? [biddingStartStage] : ["__NONE__"]}
                                    isDisabled={!isActive}
                                    classNames={{ trigger: "h-9 bg-content1 border-default-100/50", value: "text-[10px] font-bold uppercase" }}
                                    onSelectionChange={(keys) => {
                                      const next = String(Array.from(keys)[0] || "");
                                      subflowMutation.mutate({
                                        id: config?._id,
                                        subflowType: flow.key,
                                        startAtOrderStage: startStage,
                                        mustCompleteBeforeOrderStage: endStage,
                                        biddingStartAtOrderStage: next === "__NONE__" ? null : next || null,
                                        biddingEndAtOrderStage: biddingEndStage || null,
                                        dependsOnSubflows: config?.dependsOnSubflows || [],
                                        isActive: isActive,
                                      });
                                    }}
                                    items={orderStageOptions}
                                  >
                                    <SelectItem key="__NONE__" textValue="None">
                                      <span className="text-[9px] font-bold uppercase">None</span>
                                    </SelectItem>
                                    {(stage: any) => (
                                      <SelectItem key={stage.key} textValue={stage.label}>
                                        <span className="text-[9px] font-bold uppercase">{stage.label}</span>
                                      </SelectItem>
                                    )}
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-[9px] font-black uppercase tracking-widest text-default-400 mb-1.5 block">Bidding End</label>
                                  <Select
                                    size="sm"
                                    variant="flat"
                                    radius="lg"
                                    placeholder="None"
                                    selectedKeys={biddingEndStage ? [biddingEndStage] : ["__NONE__"]}
                                    isDisabled={!isActive}
                                    classNames={{ trigger: "h-9 bg-content1 border-default-100/50", value: "text-[10px] font-bold uppercase" }}
                                    onSelectionChange={(keys) => {
                                      const next = String(Array.from(keys)[0] || "");
                                      subflowMutation.mutate({
                                        id: config?._id,
                                        subflowType: flow.key,
                                        startAtOrderStage: startStage,
                                        mustCompleteBeforeOrderStage: endStage,
                                        biddingStartAtOrderStage: biddingStartStage || null,
                                        biddingEndAtOrderStage: next === "__NONE__" ? null : next || null,
                                        dependsOnSubflows: config?.dependsOnSubflows || [],
                                        isActive: isActive,
                                      });
                                    }}
                                    items={orderStageOptions}
                                  >
                                    <SelectItem key="__NONE__" textValue="None">
                                      <span className="text-[9px] font-bold uppercase">None</span>
                                    </SelectItem>
                                    {(stage: any) => (
                                      <SelectItem key={stage.key} textValue={stage.label}>
                                        <span className="text-[9px] font-bold uppercase">{stage.label}</span>
                                      </SelectItem>
                                    )}
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* Dependencies */}
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-default-400 mb-2 flex items-center gap-1.5">
                                <FiLayers className="text-[8px]" /> Gates Execution Until
                              </label>
                              <Select
                                size="sm"
                                variant="bordered"
                                radius="lg"
                                selectionMode="multiple"
                                placeholder="No dependencies"
                                selectedKeys={new Set(config?.dependsOnSubflows || [])}
                                isDisabled={!isActive}
                                classNames={{ trigger: "min-h-10 py-1 bg-content2/30 border-default-100/60", value: "text-[10px] font-bold" }}
                                onSelectionChange={(keys) => {
                                  const nextDeps = Array.from(keys as Set<string>);
                                  subflowMutation.mutate({
                                    id: config?._id,
                                    subflowType: flow.key,
                                    startAtOrderStage: startStage,
                                    mustCompleteBeforeOrderStage: endStage,
                                    biddingStartAtOrderStage: biddingStartStage || null,
                                    biddingEndAtOrderStage: biddingEndStage || null,
                                    dependsOnSubflows: nextDeps,
                                    isActive: isActive,
                                  });
                                }}
                                items={ORDER_SUBFLOWS.filter((f) => f.key !== flow.key)}
                              >
                                {(f: any) => (
                                  <SelectItem key={f.key} textValue={f.label}>
                                    <span className="text-xs font-bold">{f.label}</span>
                                  </SelectItem>
                                )}
                              </Select>
                            </div>
                          </div>

                          {/* Footer Info */}
                          {isActive && (
                            <div className="px-5 py-3 bg-success-500/5 flex items-center gap-2">
                              <FiCheckCircle className="text-success-600 text-xs" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-success-600/80">Active Configuration</span>
                            </div>
                          )}
                          {errorMessage && (
                            <div className="px-5 py-3 bg-danger-500/5 flex items-center gap-2 border-t border-danger-500/10">
                              <FiAlertCircle className="text-danger-500 text-xs" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-danger-500/80">{errorMessage}</span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex items-center gap-2 p-3 rounded-xl bg-warning-500/5 border border-warning-500/10">
                    <FiAlertCircle className="text-warning-500 shrink-0" />
                    <span className="text-[10px] font-semibold text-warning-700/80 uppercase tracking-widest">
                      Subflows run in parallel and gate order stages. Bidding is allowed only between the configured bidding stages.
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
          {rules.length === 0 && (autoSeeding || seedMutation.isPending) && (
            <div className="mt-3 px-4 py-3 rounded-xl border border-warning-500/20 bg-warning-500/10 text-[10px] font-black uppercase tracking-widest text-warning-700/80 flex items-center gap-2">
              <FiAlertCircle className="text-warning-600" />
              Restoring default flow rules…
            </div>
          )}
          <RulesSortableList
            rules={sortedRules}
            filteredRules={filteredRules}
            dragDisabled={dragDisabled}
            onEdit={openEdit}
            onDragEnd={onDragEnd}
            sensors={sensors}
            gridCols={flowType === "TRADE_ORDER" ? 2 : 1}
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
                <div className="flex flex-col gap-0 mb-8 max-h-[400px] overflow-y-auto scrollbar-hide pr-1 border-b border-divider/30 pb-4">
                  {sortedRules.map((rule: any, idx: number) => {
                    const isActiveStage = String(previewStage?.stageKey) === String(rule.stageKey);
                    const isLast = idx === sortedRules.length - 1;

                    // Check if this stage is within ANY bidding window
                    let isBiddingStage = false;
                    Object.values(subflowConfigMap).forEach((config: any) => {
                      if (!config.isActive || !config.biddingStartAtOrderStage) return;
                      const stages = sortedRules.map(r => r.stageKey);
                      const startIdx = stages.indexOf(config.biddingStartAtOrderStage);
                      const endIdx = stages.indexOf(config.biddingEndAtOrderStage || stages[stages.length - 1]);
                      if (idx >= startIdx && idx <= endIdx) isBiddingStage = true;
                    });

                    return (
                      <div key={rule._id || rule.stageKey} className="flex gap-6 group/item">
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => setPreviewStageKey(rule.stageKey)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 shrink-0 ${isActiveStage
                              ? "bg-warning-500 border-warning-500 shadow-lg shadow-warning-500/40"
                              : isBiddingStage
                                ? "bg-content1 border-warning-500/40"
                                : "bg-content1 border-default-300 hover:border-warning-400"
                              }`}
                          >
                            {isActiveStage ? (
                              <FiCheck className="text-white text-[10px] font-black" />
                            ) : isBiddingStage ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-warning-500/60 animate-pulse" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-default-300" />
                            )}
                          </button>
                          {!isLast && (
                            <div className={`w-0.5 flex-1 min-h-[2.5rem] transition-colors duration-500 ${isActiveStage ? "bg-warning-500/50" : "bg-divider/40"
                              }`} />
                          )}
                        </div>
                        <button
                          onClick={() => setPreviewStageKey(rule.stageKey)}
                          className={`flex-1 pb-6 text-left group transition-all duration-500 ${isActiveStage ? "translate-x-2" : ""}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`text-xs font-black uppercase tracking-[0.15em] transition-colors ${isActiveStage ? "text-warning-600" : "text-default-500 group-hover/item:text-default-800"}`}>
                              {rule.label || rule.stageKey}
                            </div>
                            {isBiddingStage && (
                              <span className="text-[9px] font-black uppercase tracking-widest text-warning-500/80 flex items-center gap-1 bg-warning-500/5 px-2 py-0.5 rounded-md border border-warning-500/10">
                                <FiZap size={8} className="animate-pulse" /> Bidding
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] font-black transition-opacity uppercase tracking-widest ${isActiveStage ? "text-warning-500/60" : "text-default-400 opacity-40"}`}>
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
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-default-400 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-warning-500 rounded-full" />
                          <span>Required Actions</span>
                        </div>
                        <span className="text-[9px] opacity-40">STAGE PROTOCOL</span>
                      </div>
                      <div className="space-y-3 pl-3">
                        {(previewStage?.requiredActions || []).length === 0 ? (
                          <div className="text-[11px] font-black uppercase tracking-widest text-default-400 flex items-center gap-2 bg-default-50/50 p-4 rounded-2xl border border-dashed border-default-200 ml-1">
                            None configured for this stage
                          </div>
                        ) : (
                          (previewStage?.requiredActions || []).map((action: string) => {
                            const isDone = Boolean(previewActionState[action]);
                            return (
                              <motion.label
                                whileTap={{ scale: 0.98 }}
                                key={action}
                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${isDone
                                  ? "bg-success-500/5 border-success-500/20 text-success-700 shadow-sm"
                                  : "bg-content2/10 border-divider text-default-600 hover:border-default-300"
                                  }`}
                              >
                                <div className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all shadow-sm ${isDone ? "bg-success-500 text-white" : "bg-default-200 text-default-400"
                                  }`}>
                                  {isDone && <FiCheck size={14} strokeWidth={3} />}
                                </div>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={isDone}
                                  onChange={() =>
                                    setPreviewActionState((prev) => ({ ...prev, [action]: !prev[action] }))
                                  }
                                />
                                <span className="text-xs font-black uppercase tracking-tight">
                                  {ACTION_LABELS[action] || action.replaceAll("_", " ")}
                                </span>
                              </motion.label>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-default-400 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-primary-500 rounded-full" />
                          <span>Document Protocol</span>
                        </div>
                        <span className="text-[9px] opacity-40">COMPLIANCE</span>
                      </div>
                      {!showDocRules ? (
                        <div className="text-[11px] font-black uppercase tracking-widest text-default-400 pl-4">Standard flow (no documents).</div>
                      ) : stageDocRules.length === 0 ? (
                        <div className="text-[11px] font-black uppercase tracking-widest text-default-400 py-4 px-6 bg-default-50/50 rounded-2xl border border-dashed border-default-200 ml-4">No documents required</div>
                      ) : (
                        <div className="space-y-3 pl-4">
                          {stageDocRules.map((doc: any) => {
                            const key = String(doc.docType);
                            const isUploaded = Boolean(previewDocState[key]);
                            return (
                              <motion.label
                                whileTap={{ scale: 0.98 }}
                                key={key}
                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${isUploaded
                                  ? "bg-primary-500/5 border-primary-500/20 text-primary-700 shadow-sm"
                                  : "bg-content2/10 border-divider text-default-600 hover:border-default-300"
                                  }`}
                              >
                                <div className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all shadow-sm ${isUploaded ? "bg-primary-500 text-white" : "bg-default-200 text-default-400"
                                  }`}>
                                  {isUploaded && <FiCheck size={14} strokeWidth={3} />}
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
                                  <span className="text-xs font-black uppercase tracking-tight leading-none mb-1">{key.replaceAll("_", " ")}</span>
                                  <span className="text-[9px] font-black opacity-50 uppercase tracking-[0.2em]">{doc.responsibleRole}</span>
                                </div>
                              </motion.label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className={`mt-8 p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 ${previewMissing.length === 0
                      ? "bg-success-500/5 border-success-500/20 text-success-700 shadow-sm"
                      : "bg-content2/50 border-default-200 text-default-500"
                      }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${previewMissing.length === 0 ? "bg-success-500 text-white" : "bg-default-200 text-default-400"
                        }`}>
                        {previewMissing.length === 0 ? <FiCheck className="text-xl" /> : <FiActivity className="text-lg" />}
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
                  placeholder="E.g. ENQUIRY_CREATED"
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
                        items={ACTIONS.map(a => ({ key: a, label: ACTION_LABELS[a] || a.replaceAll("_", " ") }))}
                      >
                        {(action) => (
                          <SelectItem key={action.key} textValue={action.label}>
                            {action.label}
                          </SelectItem>
                        )}
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
                {flowType === "TRADE_ENQUIRY" && (
                  <Select
                    label="Action By"
                    variant="bordered"
                    selectedKeys={new Set([form.actionBy || ""])}
                    onSelectionChange={(keys) =>
                      setForm({ ...form, actionBy: Array.from(keys as Set<string>)[0] || "" })
                    }
                    items={ACTION_BY.map((item) => ({ key: item, label: item.replaceAll("_", " ") }))}
                  >
                    {(item) => (
                      <SelectItem key={item.key} textValue={item.label}>
                        {item.label}
                      </SelectItem>
                    )}
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
                    items={TRADE_TYPES.map(t => ({ key: t, label: t }))}
                  >
                    {(t) => (
                      <SelectItem key={t.key} textValue={t.label}>
                        {t.label}
                      </SelectItem>
                    )}
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
