"use client";

import React, { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Chip,
    Divider,
    Select,
    SelectItem,
    Input,
    Switch,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Progress,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import AuthContext from "@/context/AuthContext";
import BrandedLoader from "@/components/ui/BrandedLoader";

dayjs.extend(relativeTime);

const OWNER_OPTIONS = [
    { key: "buyer", label: "Buyer" },
    { key: "seller", label: "Supplier" },
    { key: "obaol", label: "OBAOL Team" },
] as const;

const RESPONSIBILITY_TASKS = [
    { key: "procurementBy", label: "Procurement", dateKeys: ["procurementDate", "procurementCompletedDate"] },
    { key: "certificateBy", label: "Certification", dateKeys: ["certificateRequestedDate", "certificateIssuedDate"] },
    { key: "transportBy", label: "Inland Transportation", dateKeys: ["transportDispatchDate"] },
    { key: "packagingBy", label: "Packaging", dateKeys: ["packagingStartDate", "packagingCompletedDate"] },
    { key: "qualityTestingBy", label: "Quality Testing", dateKeys: ["qualitySampleSentDate", "qualityApprovedDate"] },
    { key: "shippingBy", label: "Freight Forwarding / Shipping", dateKeys: ["shippingBookedDate", "customsClearanceDate"], internationalOnly: true },
] as const;

const MILESTONE_LABELS: Record<string, string> = {
    procurementDate: "Start",
    procurementCompletedDate: "Done",
    certificateRequestedDate: "Requested",
    certificateIssuedDate: "Issued",
    transportDispatchDate: "Dispatch",
    packagingStartDate: "Start",
    packagingCompletedDate: "Done",
    qualitySampleSentDate: "Sample Sent",
    qualityApprovedDate: "Approved",
    shippingBookedDate: "Booked",
    customsClearanceDate: "Customs",
};

export default function OrderDetailsPage() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const router = useRouter();
    const orderId = Array.isArray(id) ? id[0] : id;
    const queryClient = useQueryClient();
    const [logisticsList, setLogisticsList] = useState<any[]>([]);
    const [trackingId, setTrackingId] = useState("");
    const [planError, setPlanError] = useState<string>("");
    const [workflowStage, setWorkflowStage] = useState("ORDER_CREATED");
    const [docActionOpen, setDocActionOpen] = useState(false);
    const [docActionRule, setDocActionRule] = useState<any>(null);
    const [docActionFileUrl, setDocActionFileUrl] = useState("");
    const [responsibilities, setResponsibilities] = useState<any>({
        procurementBy: "",
        certificateBy: "",
        transportBy: "",
        shippingBy: "",
        packagingBy: "",
        qualityTestingBy: "",
    });
    const [milestones, setMilestones] = useState<any>({
        schedulingMode: "",
        schedulingFinalizedDate: "",
        schedulingNotes: "",
        qualityTestingRequired: true,
        procurementDate: "",
        procurementInspectionDate: "",
        procurementCompletedDate: "",
        qualitySampleSentDate: "",
        labName: "",
        labExpectedReportDate: "",
        labReportReceivedDate: "",
        qualityApprovedDate: "",
        packagingStartDate: "",
        packagingCompletedDate: "",
        certificateRequestedDate: "",
        certificateIssuedDate: "",
        transportDispatchDate: "",
        shippingBookedDate: "",
        customsClearanceDate: "",
    });

    // Fetch Order Data
    const { data: order, isLoading } = useQuery({
        queryKey: ["order", orderId],
        queryFn: async () => {
            try {
                const byId = await getData(`${apiRoutes.orders.getAll}/${orderId}`);
                return byId;
            } catch {
                const listRes = await getData(apiRoutes.orders.getAll, { page: 1, limit: 100, sort: "createdAt:desc" });
                const rows = Array.isArray(listRes?.data?.data?.data)
                    ? listRes.data.data.data
                    : Array.isArray(listRes?.data?.data)
                        ? listRes.data.data
                        : Array.isArray(listRes?.data)
                            ? listRes.data
                            : [];
                const matched = rows.find((row: any) => {
                    const rowOrderId = (row?._id || row?.id || row?.orderId || "").toString();
                    const enquiryId = (row?.enquiry?._id || row?.enquiry || "").toString();
                    return rowOrderId === String(orderId) || enquiryId === String(orderId);
                });
                if (!matched?._id) throw new Error("Order not found");
                return { data: { data: matched } } as any;
            }
        },
        select: (res) => res?.data?.data,
        enabled: !!orderId,
    });

    const { data: orderRulesResponse } = useQuery({
        queryKey: ["flow-rules", "TRADE_ORDER"],
        queryFn: () => getData(apiRoutes.flowRules.list, { flowType: "TRADE_ORDER" }),
    });
    const { data: subflowConfigResponse } = useQuery({
        queryKey: ["order-subflows"],
        queryFn: () => getData(apiRoutes.orderSubflowConfigs.list),
    });
    const enquiryRefId = (order as any)?.enquiry?._id || (order as any)?.enquiry;
    const { data: linkedEnquiry } = useQuery({
        queryKey: ["order-enquiry", enquiryRefId],
        queryFn: () => getData(`${apiRoutes.enquiry.getAll}/${enquiryRefId}`),
        select: (res) => res?.data?.data,
        enabled: Boolean(enquiryRefId),
    });
    const { data: docRulesResponse } = useQuery({
        queryKey: ["document-rules"],
        queryFn: () => getData(apiRoutes.documentRules.list),
    });
    const { data: orderDocsResponse } = useQuery({
        queryKey: ["trade-documents", "order", orderId],
        queryFn: () => getData(apiRoutes.tradeDocuments.list, { orderId, page: 1, limit: 200 }),
        enabled: Boolean(orderId),
    });
    // Update Status Mutation
    const updateMutation = useMutation({
        mutationFn: async (payload: any) => {
            return patchData(`${apiRoutes.orders.getAll}/${orderId}`, payload);
        },
        onSuccess: () => {
            toast.success("Order updated successfully!");
            setPlanError("");
            queryClient.invalidateQueries({ queryKey: ["order", id] });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || error?.message || "Failed to update order.";
            toast.error(message);
            setPlanError(message);
        }
    });
    const updateWorkflowStageMutation = useMutation({
        mutationFn: async (stage: string) => {
            return patchData(`${apiRoutes.orders.getAll}/${orderId}`, { workflowStage: stage });
        },
        onSuccess: () => {
            toast.success("Workflow stage updated.");
            queryClient.invalidateQueries({ queryKey: ["order", id] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to update workflow stage.");
        },
    });
    const createDocMutation = useMutation({
        mutationFn: async () => {
            if (!docActionRule) throw new Error("No document rule selected.");
            const payload: any = { type: docActionRule.docType, orderId };
            if (String(docActionRule.actionType) === "UPLOAD") {
                payload.fileUrl = docActionFileUrl;
            }
            return postData(apiRoutes.tradeDocuments.create, payload);
        },
        onSuccess: () => {
            toast.success("Document created.");
            setDocActionOpen(false);
            setDocActionRule(null);
            setDocActionFileUrl("");
            queryClient.invalidateQueries({ queryKey: ["trade-documents", "order", orderId] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create document.");
        },
    });

    // Sync state with fetching data
    React.useEffect(() => {
        if (order) {
            setLogisticsList(order.logistics || []);
            setTrackingId(order.trackingId || "");
            const fallbackStage = (() => {
                const legacy = String(order?.status || "").toLowerCase();
                if (legacy === "completed") return "TRADE_CLOSED";
                if (legacy === "arrived") return "DELIVERED";
                if (legacy === "in transit") return "SHIPPED";
                if (legacy === "loaded") return "READY_FOR_SHIPMENT";
                return "ORDER_CREATED";
            })();
            setWorkflowStage(String(order?.workflowStage || fallbackStage));
            setResponsibilities({
                procurementBy: order?.responsibilities?.procurementBy || "obaol",
                certificateBy: order?.responsibilities?.certificateBy || "obaol",
                transportBy: order?.responsibilities?.transportBy || "obaol",
                shippingBy: order?.responsibilities?.shippingBy || "obaol",
                packagingBy: order?.responsibilities?.packagingBy || "obaol",
                qualityTestingBy: order?.responsibilities?.qualityTestingBy || "obaol",
            });
            const m = order?.milestones || {};
            const toDateInput = (value: any) => (value ? dayjs(value).format("YYYY-MM-DD") : "");
            setMilestones({
                schedulingMode: m.schedulingMode || "",
                schedulingFinalizedDate: toDateInput(m.schedulingFinalizedDate),
                schedulingNotes: m.schedulingNotes || "",
                qualityTestingRequired: m.qualityTestingRequired !== false,
                procurementDate: toDateInput(m.procurementDate),
                procurementInspectionDate: toDateInput(m.procurementInspectionDate),
                procurementCompletedDate: toDateInput(m.procurementCompletedDate),
                qualitySampleSentDate: toDateInput(m.qualitySampleSentDate),
                labName: m.labName || "",
                labExpectedReportDate: toDateInput(m.labExpectedReportDate),
                labReportReceivedDate: toDateInput(m.labReportReceivedDate),
                qualityApprovedDate: toDateInput(m.qualityApprovedDate),
                packagingStartDate: toDateInput(m.packagingStartDate),
                packagingCompletedDate: toDateInput(m.packagingCompletedDate),
                certificateRequestedDate: toDateInput(m.certificateRequestedDate),
                certificateIssuedDate: toDateInput(m.certificateIssuedDate),
                transportDispatchDate: toDateInput(m.transportDispatchDate),
                shippingBookedDate: toDateInput(m.shippingBookedDate),
                customsClearanceDate: toDateInput(m.customsClearanceDate),
            });
        }
    }, [order]);

    const handleWorkflowStageChange = (newStage: string) => {
        setWorkflowStage(newStage);
        updateWorkflowStageMutation.mutate(newStage);
    };

    const handleGeneralUpdate = () => {
        if (!milestones.schedulingMode || !milestones.schedulingFinalizedDate) {
            const message = "Finalize scheduling mode and scheduling date before saving the order plan.";
            toast.error(message);
            setPlanError(message);
            return;
        }
        setPlanError("");
        const dateOrNull = (value: any) => (value ? value : null);
        updateMutation.mutate({
            logistics: logisticsList,
            trackingId,
            responsibilities,
            milestones: {
                schedulingMode: milestones.schedulingMode || "",
                schedulingFinalizedDate: dateOrNull(milestones.schedulingFinalizedDate),
                schedulingNotes: milestones.schedulingNotes || "",
                qualityTestingRequired: milestones.qualityTestingRequired !== false,
                procurementDate: dateOrNull(milestones.procurementDate),
                procurementInspectionDate: dateOrNull(milestones.procurementInspectionDate),
                procurementCompletedDate: dateOrNull(milestones.procurementCompletedDate),
                qualitySampleSentDate: dateOrNull(milestones.qualitySampleSentDate),
                labName: milestones.labName || "",
                labExpectedReportDate: dateOrNull(milestones.labExpectedReportDate),
                labReportReceivedDate: dateOrNull(milestones.labReportReceivedDate),
                qualityApprovedDate: dateOrNull(milestones.qualityApprovedDate),
                packagingStartDate: dateOrNull(milestones.packagingStartDate),
                packagingCompletedDate: dateOrNull(milestones.packagingCompletedDate),
                certificateRequestedDate: dateOrNull(milestones.certificateRequestedDate),
                certificateIssuedDate: dateOrNull(milestones.certificateIssuedDate),
                transportDispatchDate: dateOrNull(milestones.transportDispatchDate),
                shippingBookedDate: dateOrNull(milestones.shippingBookedDate),
                customsClearanceDate: dateOrNull(milestones.customsClearanceDate),
            }
        });
    }
    const getOwnerLabel = (val: string) => OWNER_OPTIONS.find((item) => item.key === val)?.label || "Not set";
    const updateMilestone = (key: string, value: any) =>
        setMilestones((prev: any) => ({ ...prev, [key]: value }));
    const orderTradeType = String(
        (order as any)?.externalTradeType ||
        (linkedEnquiry as any)?.executionContext?.tradeType ||
        (order as any)?.enquiry?.executionContext?.tradeType ||
        "DOMESTIC"
    ).toUpperCase();
    const isInternational = orderTradeType === "INTERNATIONAL";
    const isSchedulingFinalized = Boolean(milestones.schedulingFinalizedDate);
    React.useEffect(() => {
        if (planError && milestones.schedulingMode && milestones.schedulingFinalizedDate) {
            setPlanError("");
        }
    }, [planError, milestones.schedulingMode, milestones.schedulingFinalizedDate]);
    const ownerLayers = [
        { key: "buyer", title: "Buyer Layer" },
        { key: "seller", title: "Supplier Layer" },
        { key: "obaol", title: "Authority Layer (OBAOL)" },
    ] as const;
    const formatMilestoneDate = (value: any) => (value ? dayjs(value).format("DD MMM YYYY") : "Pending");

    const addTruck = () => {
        setLogisticsList([...logisticsList, {
            vehicleNo: "",
            driverName: "",
            driverPhone: "",
            transportCompany: "",
            currentLocation: "",
            estimatedArrival: null
        }]);
    };

    const updateTruck = (index: number, field: string, value: any) => {
        const newList = [...logisticsList];
        newList[index] = { ...newList[index], [field]: value };
        setLogisticsList(newList);
    };

    const removeTruck = (index: number) => {
        setLogisticsList(logisticsList.filter((_, i) => i !== index));
    };

    const subflowConfigs = Array.isArray(subflowConfigResponse?.data?.data) ? subflowConfigResponse.data.data : [];
    const subflowTypes = Array.from(
        new Set(
            subflowConfigs
                .filter((config: any) => config?.isActive !== false)
                .map((config: any) => String(config.subflowType || "").toUpperCase())
                .filter(Boolean)
        )
    );
    const { data: subflowRulesResponse } = useQuery({
        queryKey: ["subflow-rules", subflowTypes.join("|")],
        enabled: subflowTypes.length > 0,
        queryFn: async () => {
            const results = await Promise.all(
                subflowTypes.map((type) => getData(apiRoutes.flowRules.list, { flowType: type }))
            );
            const map = new Map<string, any[]>();
            results.forEach((res, index) => {
                const flowType = String(subflowTypes[index]);
                const rules = Array.isArray(res?.data?.data) ? res.data.data : [];
                map.set(flowType, rules);
            });
            return map;
        },
    });

    if (isLoading) return <BrandedLoader message="Loading order details" />;
    if (!order) return <div>Order not found</div>;
    const roleLower = String(user?.role || "").toLowerCase();
    const isOperatorUser = roleLower === "operator" || roleLower === "team";
    const assignedOperatorId = (
        (linkedEnquiry as any)?.assignedOperatorId?._id ||
        (linkedEnquiry as any)?.assignedOperatorId ||
        (order as any)?.enquiry?.assignedOperatorId?._id ||
        (order as any)?.enquiry?.assignedOperatorId ||
        ""
    ).toString();
    if (isOperatorUser && (!user?.id || assignedOperatorId !== String(user.id))) {
        return (
            <div className="p-10 text-center">
                <p className="text-lg font-semibold">Access restricted</p>
                <p className="text-default-500 mt-2">This order is not assigned to you.</p>
            </div>
        );
    }

    const docRules = Array.isArray(docRulesResponse?.data?.data) ? docRulesResponse.data.data : [];
    const orderRules = Array.isArray(orderRulesResponse?.data?.data) ? orderRulesResponse.data.data : [];
    const tradeType = String(
        (order as any)?.externalTradeType ||
        (linkedEnquiry as any)?.executionContext?.tradeType ||
        "DOMESTIC"
    ).toUpperCase();
    const isExternal = Boolean((order as any)?.isExternal);
    const sortedOrderStages = orderRules
        .filter((r: any) => r?.isActive !== false)
        .filter((r: any) => !r?.tradeType || r.tradeType === "BOTH" || String(r.tradeType) === tradeType)
        .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
        .map((r: any) => String(r.stageKey || "").toUpperCase())
        .filter(Boolean);
    const stageLabelMap = new Map(
        orderRules.map((r: any) => [String(r.stageKey || "").toUpperCase(), r.label || r.stageKey])
    );
    const orderStageRank = new Map<string, number>();
    orderRules.forEach((r: any) => {
        if (!r?.stageKey) return;
        if (r?.isActive === false) return;
        if (r?.tradeType && r.tradeType !== "BOTH" && String(r.tradeType) !== tradeType) return;
        orderStageRank.set(String(r.stageKey).toUpperCase(), Number(r.sortOrder || 0));
    });
    const workflowStageOptions = sortedOrderStages.length > 0
        ? sortedOrderStages
        : ["ORDER_CREATED", "CONTRACT_SIGNED", "PRODUCTION_STARTED", "QUALITY_VERIFIED", "COMPLIANCE_APPROVED", "PACKING_COMPLETED", "READY_FOR_SHIPMENT", "SHIPPED", "DELIVERED", "PAYMENT_PENDING", "PAYMENT_COMPLETED", "TRADE_CLOSED"];
    const docsForOrder = Array.isArray(orderDocsResponse?.data?.data?.data)
        ? orderDocsResponse?.data?.data?.data
        : (orderDocsResponse?.data?.data || []);
    const rulesForStage = docRules
        .filter((r: any) =>
            String(r.stageType) === "ORDER" &&
            String(r.stageKey) === workflowStage &&
            r.isActive !== false &&
            (r.tradeType === "BOTH" || r.tradeType === tradeType)
        )
        .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

    const subflowStatus = subflowConfigs
        .filter((config: any) => config?.isActive !== false)
        .map((config: any) => {
            const type = String(config.subflowType || "").toUpperCase();
            const flowRules = subflowRulesResponse?.get?.(type) || [];
            const sortedFlowRules = [...flowRules].sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
            const lastStage = sortedFlowRules.length ? sortedFlowRules[sortedFlowRules.length - 1] : null;
            const currentStage = String((order as any)?.subflowStages?.[type] || "").toUpperCase();
            const isComplete = Boolean(lastStage && currentStage && String(lastStage.stageKey) === currentStage);
            const gateStage = String(config.mustCompleteBeforeOrderStage || "").toUpperCase();
            const gateLabel = stageLabelMap.get(gateStage) || gateStage;
            const currentRank = orderStageRank.get(String(workflowStage).toUpperCase()) ?? 0;
            const gateRank = orderStageRank.get(gateStage) ?? 0;
            const isBlocking = !isComplete && currentRank >= gateRank;
            return {
                type,
                label: type.replaceAll("_", " "),
                currentStage: currentStage || "NOT_STARTED",
                currentLabel: currentStage ? (flowRules.find((r: any) => String(r.stageKey).toUpperCase() === currentStage)?.label || currentStage) : "Not started",
                isComplete,
                isBlocking,
                gateLabel,
                dependsOn: Array.isArray(config.dependsOnSubflows) ? config.dependsOnSubflows : [],
            };
        });
    const canSeeRule = (rule: any) => {
        const visibility = String(rule.visibility || "BOTH");
        if (roleLower === "admin" || roleLower === "operator" || roleLower === "team") return true;
        if (visibility === "INTERNAL") return false;
        if (visibility === "BOTH") return true;
        const buyerId = String((linkedEnquiry as any)?.buyerAssociateId?._id || (linkedEnquiry as any)?.buyerAssociateId || "");
        const sellerId = String((linkedEnquiry as any)?.sellerAssociateId?._id || (linkedEnquiry as any)?.sellerAssociateId || "");
        const userId = String(user?.id || "");
        if (visibility === "BUYER") return buyerId === userId;
        if (visibility === "SELLER") return sellerId === userId;
        return false;
    };
    const canActOnRule = (rule: any) => {
        if (roleLower === "admin" || roleLower === "operator" || roleLower === "team") return true;
        const roleKey = String(rule.responsibleRole || "");
        const buyerId = String((linkedEnquiry as any)?.buyerAssociateId?._id || (linkedEnquiry as any)?.buyerAssociateId || "");
        const sellerId = String((linkedEnquiry as any)?.sellerAssociateId?._id || (linkedEnquiry as any)?.sellerAssociateId || "");
        const userId = String(user?.id || "");
        if (roleKey === "BUYER") return buyerId === userId;
        if (roleKey === "SELLER") return sellerId === userId;
        return false;
    };
    const hasDocType = (type: string) => (docsForOrder || []).some((doc: any) => String(doc?.type || "") === type);

    return (
        <div className="w-full min-h-screen p-6 flex flex-col gap-8 bg-background text-foreground selection:bg-warning-500/30">
            {/* Header: Elite Identification */}
            <div className="flex items-center justify-between gap-6 pb-6 border-b border-divider">
                <div className="flex items-center gap-5">
                    <Button
                        isIconOnly
                        variant="light"
                        className="text-default-400 hover:text-warning-500 hover:bg-default-100 transition-all"
                        onPress={() => router.back()}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none">ORDER: {orderId?.slice(-8).toUpperCase()}</h1>
                            <div className="px-2 py-0.5 rounded bg-warning-500 text-xs font-black text-black uppercase tracking-widest">LIVE EXECUTION</div>
                        </div>
                        <p className="text-sm font-bold text-default-500 mt-2 uppercase tracking-wider opacity-80">
                            {isExternal ? "External Logistics Terminal" : `ENQUIRY REF: ${(order.enquiry?._id || order.enquiry)?.slice(-8).toUpperCase()}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="h-12 w-px bg-divider hidden md:block" />
                    <div className="text-right">
                        <div className="text-xs font-black text-warning-500 uppercase tracking-widest mb-1">Workflow Stage</div>
                        <div className="text-xl font-black text-foreground uppercase tracking-tight">{String(order.workflowStage || order.status || "").replaceAll("_", " ")}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-black text-default-500 uppercase tracking-widest mb-1">Terminal Synced</div>
                        <div className="text-sm font-black text-foreground/60 uppercase">{dayjs(order.updatedAt).fromNow()}</div>
                    </div>
                </div>
            </div>

            {isExternal && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-default-100/40 border border-divider rounded-2xl p-5 hover:bg-default-100 transition-colors backdrop-blur-md">
                        <div className="text-xs font-black text-warning-500 uppercase tracking-wider mb-3">CONSIGNEE (BUYER)</div>
                        <div className="text-lg font-black text-foreground uppercase truncate">{(order as any)?.externalBuyer?.name || "Buyer"}</div>
                        <div className="text-sm text-default-500 mt-1 font-medium">{(order as any)?.externalBuyer?.email || "No email"}</div>
                    </div>
                    <div className="bg-default-100/40 border border-divider rounded-2xl p-5 hover:bg-default-100 transition-colors backdrop-blur-md">
                        <div className="text-xs font-black text-warning-500 uppercase tracking-wider mb-3">CONSIGNOR (SELLER)</div>
                        <div className="text-lg font-black text-foreground uppercase truncate">{(order as any)?.externalSeller?.name || "Seller"}</div>
                        <div className="text-sm text-default-500 mt-1 font-medium">{(order as any)?.externalSeller?.email || "No email"}</div>
                    </div>
                    <div className="bg-default-100/40 border border-divider rounded-2xl p-5 hover:bg-default-100 transition-colors backdrop-blur-md">
                        <div className="text-xs font-black text-warning-500 uppercase tracking-wider mb-3">PRODUCT SCOPE</div>
                        <div className="text-lg font-black text-foreground uppercase truncate">{(order as any)?.externalProduct?.name || "Product"}</div>
                        <div className="text-sm text-default-500 mt-1 font-medium">{(order as any)?.externalProduct?.quantity || "0"} {(order as any)?.externalProduct?.unit || ""}</div>
                    </div>
                </div>
            )}

            {/* Status Pipeline: Modern Connected Flow */}
            <div className="w-full relative py-6">
                <div className="absolute top-[38px] left-0 right-0 h-0.5 bg-divider" />
                <div className="relative flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
                    {workflowStageOptions.map((step, index) => {
                        const currentStepIndex = workflowStageOptions.indexOf(workflowStage);
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        return (
                            <div key={step} className="flex flex-col items-center gap-4 min-w-[120px] shrink-0 group">
                                <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 z-10 ${isCurrent ? 'bg-warning-500 border-warning-400 scale-125 shadow-[0_0_15px_rgba(245,165,36,0.6)]' :
                                    isCompleted ? 'bg-success-500 border-success-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]' :
                                        'bg-default-200 border-divider'
                                    }`} />
                                <div className={`text-xs font-black uppercase tracking-tight transition-colors text-center ${isCurrent ? 'text-warning-500' :
                                    isCompleted ? 'text-success-500/80' :
                                        'text-default-500 group-hover:text-default-700 dark:group-hover:text-default-300'
                                    }`}>
                                    {String(stageLabelMap.get(step) || step).replaceAll("_", " ")}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Control Panel: Workflow Context */}
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <div className="bg-default-100/40 border border-divider rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-warning-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-warning-500/20 transition-all duration-700" />

                        <h2 className="text-xs font-black uppercase tracking-widest text-warning-500 mb-8 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-warning-500 block shadow-[0_0_8px_rgba(245,165,36,0.6)]" />
                            Execution Control
                        </h2>

                        <div className="flex flex-col gap-6">
                            <Input
                                label="TRACKING IDENTIFIER"
                                placeholder="HEX-001X..."
                                value={trackingId}
                                onValueChange={setTrackingId}
                                variant="bordered"
                                classNames={{
                                    label: "text-xs font-black text-default-400 tracking-wider",
                                    input: "text-foreground font-black uppercase",
                                    inputWrapper: "border-divider h-14 bg-default-100/50 hover:border-warning-500/40 transition-colors"
                                }}
                            />

                            <Button
                                color="warning"
                                variant="solid"
                                className="font-black text-sm uppercase tracking-widest h-14 rounded-2xl shadow-[0_10px_30px_rgba(245,165,36,0.2)] hover:shadow-[0_15px_40px_rgba(245,165,36,0.3)] hover:-translate-y-0.5 transition-all"
                                onClick={handleGeneralUpdate}
                                isLoading={updateMutation.isPending}
                            >
                                Commit Plan Updates
                            </Button>

                            {planError && (
                                <div className="rounded-2xl border border-danger-500/30 bg-danger-500/10 p-4 text-sm font-bold text-danger-400 uppercase tracking-tight leading-relaxed animate-pulse">
                                    {planError}
                                </div>
                            )}

                            <p className="text-xs font-bold text-default-400 uppercase tracking-wider leading-loose">
                                Scheduling mode synchronization is required for subflow activation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Strategic Milestones */}
                <div className="lg:col-span-2 bg-default-100/40 border border-divider rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />

                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-primary-500 block shadow-[0_0_8px_rgba(0,111,238,0.6)]" />
                            Strategic Milestones
                        </h2>
                        {isSchedulingFinalized && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success-500/10 border border-success-500/20 text-success-500 text-xs font-black uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                                Finalized
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Select
                            label="SCHEDULING PROTOCOL"
                            selectedKeys={milestones.schedulingMode ? [milestones.schedulingMode] : []}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys as Set<string>);
                                updateMilestone("schedulingMode", String(arr[0] || ""));
                            }}
                            variant="bordered"
                            classNames={{
                                label: "text-xs font-black tracking-wider text-default-400",
                                trigger: "border-divider bg-default-100/50 h-14",
                                value: "text-foreground font-black uppercase"
                            }}
                        >
                            <SelectItem key="IMMEDIATE" value="IMMEDIATE" className="uppercase font-black text-xs">Immediate</SelectItem>
                            <SelectItem key="PLANNED" value="PLANNED" className="uppercase font-black text-xs">Planned</SelectItem>
                            <SelectItem key="PHASED" value="PHASED" className="uppercase font-black text-xs">Phased</SelectItem>
                        </Select>

                        <Input
                            type="date"
                            label="DEADLINE FINALIZED"
                            value={milestones.schedulingFinalizedDate}
                            onValueChange={(v) => updateMilestone("schedulingFinalizedDate", v)}
                            variant="bordered"
                            classNames={{
                                label: "text-xs font-black tracking-wider text-default-400",
                                input: "text-foreground font-black",
                                inputWrapper: "border-divider bg-default-100/50 h-14"
                            }}
                        />

                        <Input
                            className="md:col-span-2"
                            label="EXECUTION NOTES"
                            placeholder="Pipeline planning summary..."
                            value={milestones.schedulingNotes}
                            onValueChange={(v) => updateMilestone("schedulingNotes", v)}
                            variant="bordered"
                            classNames={{
                                label: "text-xs font-black tracking-wider text-default-400",
                                input: "text-foreground/70 font-medium",
                                inputWrapper: "border-divider bg-default-100/50 h-14"
                            }}
                        />

                        {!isSchedulingFinalized && (
                            <div className="md:col-span-2 p-4 rounded-2xl bg-warning-500/5 border border-warning-500/10 text-sm font-bold text-warning-500 uppercase tracking-wide leading-relaxed">
                                <span className="text-warning-600 mr-2 font-black">NOTICE:</span> Finalize execution dates to enable downstream processing and compliance locks.
                            </div>
                        )}

                        <div className="md:col-span-2 space-y-8">
                            {!!responsibilities.procurementBy && (
                                    <div className="p-6 rounded-2xl bg-default-100/20 border border-divider space-y-6">
                                    <div className="text-xs font-black text-warning-500 uppercase tracking-widest">Procurement Pipeline</div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input type="date" label="START" value={milestones.procurementDate} onValueChange={(v) => updateMilestone("procurementDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                        <Input type="date" label="INSPECTION" value={milestones.procurementInspectionDate} onValueChange={(v) => updateMilestone("procurementInspectionDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                        <Input type="date" label="COMPLETED" value={milestones.procurementCompletedDate} onValueChange={(v) => updateMilestone("procurementCompletedDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                    </div>
                                </div>
                            )}

                            {!!responsibilities.qualityTestingBy && (
                                <div className="p-6 rounded-2xl bg-default-100/20 border border-divider space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-black text-warning-500 uppercase tracking-widest">Quality Assurance Terminal</div>
                                        <Switch size="sm" color="warning" isSelected={milestones.qualityTestingRequired !== false} onValueChange={(v) => updateMilestone("qualityTestingRequired", v)} isDisabled={!isSchedulingFinalized} />
                                    </div>
                                    {milestones.qualityTestingRequired !== false && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <Input type="date" label="SAMPLE" value={milestones.qualitySampleSentDate} onValueChange={(v) => updateMilestone("qualitySampleSentDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                            <Input label="LAB" placeholder="NABL..." value={milestones.labName} onValueChange={(v) => updateMilestone("labName", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                            <Input type="date" label="DUE" value={milestones.labExpectedReportDate} onValueChange={(v) => updateMilestone("labExpectedReportDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                            <Input type="date" label="APPROVED" value={milestones.qualityApprovedDate} onValueChange={(v) => updateMilestone("qualityApprovedDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {!!responsibilities.packagingBy && (
                                    <div className="p-6 rounded-2xl bg-default-100/20 border border-divider space-y-4">
                                        <div className="text-xs font-black text-warning-500 uppercase tracking-widest">Packaging Units</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input type="date" label="START" value={milestones.packagingStartDate} onValueChange={(v) => updateMilestone("packagingStartDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                            <Input type="date" label="DONE" value={milestones.packagingCompletedDate} onValueChange={(v) => updateMilestone("packagingCompletedDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                        </div>
                                    </div>
                                )}
                                {!!responsibilities.transportBy && (
                                    <div className="p-6 rounded-2xl bg-default-100/20 border border-divider space-y-4">
                                        <div className="text-xs font-black text-warning-500 uppercase tracking-widest">Inland Logistics</div>
                                        <Input type="date" label="DISPATCH" value={milestones.transportDispatchDate} onValueChange={(v) => updateMilestone("transportDispatchDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {!!responsibilities.certificateBy && (
                                    <div className="p-6 rounded-2xl bg-default-100/20 border border-divider space-y-4">
                                        <div className="text-xs font-black text-warning-500 uppercase tracking-widest">Certification Protocol</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input type="date" label="REQUESTED" value={milestones.certificateRequestedDate} onValueChange={(v) => updateMilestone("certificateRequestedDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                            <Input type="date" label="ISSUED" value={milestones.certificateIssuedDate} onValueChange={(v) => updateMilestone("certificateIssuedDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                        </div>
                                    </div>
                                )}
                                {isInternational && !!responsibilities.shippingBy && (
                                    <div className="p-6 rounded-2xl bg-default-100/20 border border-divider space-y-4">
                                        <div className="text-xs font-black text-warning-500 uppercase tracking-widest">International Freight</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input type="date" label="BOOKED" value={milestones.shippingBookedDate} onValueChange={(v) => updateMilestone("shippingBookedDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                            <Input type="date" label="CUSTOMS" value={milestones.customsClearanceDate} onValueChange={(v) => updateMilestone("customsClearanceDate", v)} variant="underlined" classNames={{ label: "text-sm font-black", input: "text-foreground" }} isDisabled={!isSchedulingFinalized} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ownership Matrix */}
                <div className="bg-default-100/40 border border-divider rounded-3xl p-8 backdrop-blur-xl">
                    <h2 className="text-xs font-black uppercase tracking-widest text-warning-500 mb-8 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning-500 block" />
                        Authority Configuration
                    </h2>
                    <div className="space-y-4">
                        {[
                            { key: "procurementBy", label: "Procurement" },
                            { key: "certificateBy", label: "Certificates" },
                            { key: "transportBy", label: "Transportation" },
                            { key: "packagingBy", label: "Packaging" },
                            { key: "qualityTestingBy", label: "Quality/QA" },
                            ...(isInternational ? [{ key: "shippingBy", label: "Freight" }] : []),
                        ].map((resp) => (
                            <Select
                                key={resp.key}
                                label={resp.label.toUpperCase()}
                                selectedKeys={responsibilities[resp.key] ? [responsibilities[resp.key]] : []}
                                onSelectionChange={(keys) => {
                                    const arr = Array.from(keys as Set<string>);
                                    setResponsibilities((prev: any) => ({ ...prev, [resp.key]: arr[0] || "" }));
                                }}
                                variant="bordered"
                                classNames={{ label: "text-xs font-black text-default-500", trigger: "border-divider bg-default-100/50 h-12" }}
                            >
                                {OWNER_OPTIONS.map((item) => (
                                    <SelectItem key={item.key} value={item.key} className="uppercase font-black text-xs">{item.label}</SelectItem>
                                ))}
                            </Select>
                        ))}
                    </div>
                </div>

                {/* Subflow Manifest */}
                {subflowStatus.length > 0 && (
                    <div className="lg:col-span-2 bg-default-100/40 border border-divider rounded-3xl backdrop-blur-xl overflow-hidden">
                        <div className="p-8 border-b border-divider flex justify-between items-center">
                            <h2 className="text-xs font-black uppercase tracking-widest text-warning-500 flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-warning-500 block animate-pulse" />
                                Synchronized Pipelines
                            </h2>
                            <div className="text-xs font-black text-default-500 uppercase tracking-wider">Global Telemetry Active</div>
                        </div>
                        <div className="divide-y divide-divider/50">
                            {subflowStatus.map((flow) => (
                                <div key={flow.type} className="px-8 py-5 flex items-center justify-between hover:bg-default-100/50 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-2 h-2 rounded-full ${flow.isComplete ? 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-warning-500 shadow-[0_0_8px_rgba(245,165,36,0.5)]'}`} />
                                        <div>
                                            <div className="text-sm font-black text-foreground uppercase tracking-wider">{flow.label}</div>
                                            <div className="text-[9px] font-bold text-default-500 uppercase mt-1">STATUS: <span className="text-warning-500">{flow.currentLabel}</span></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        {flow.isBlocking && (
                                            <div className="px-3 py-1 rounded bg-danger-500/10 border border-danger-500/20 text-xs font-black text-danger-400 uppercase tracking-widest"> GATE: {flow.gateLabel} </div>
                                        )}
                                        <Chip size="sm" variant="dot" color={flow.isComplete ? "success" : "warning"} className="text-xs font-black uppercase border-divider bg-default-100/50">
                                            {flow.isComplete ? "LIVE" : "ACTIVE"}
                                        </Chip>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Fleet Ops */}
                <div className="bg-default-100/40 border border-divider rounded-3xl p-8 backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-xs font-black uppercase tracking-widest text-warning-500 flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-warning-500 block" /> Fleet Telemetry
                        </h2>
                        <div className="flex gap-2">
                            <Button size="sm" color="warning" variant="flat" className="h-8 text-xs font-black uppercase px-4 rounded-lg" onPress={addTruck}> + UNIT </Button>
                            <Button size="sm" color="warning" variant="solid" className="h-8 text-xs font-black uppercase px-4 rounded-lg shadow-lg shadow-warning-500/20" onPress={() => updateMutation.mutate({ logistics: logisticsList })} isLoading={updateMutation.isPending}> SYNC FLEET </Button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {logisticsList.length === 0 && (
                            <div className="py-12 border border-dashed border-divider rounded-2xl text-center text-xs font-black text-default-400 uppercase tracking-widest"> No fleet units prioritized </div>
                        )}
                        {logisticsList.map((truck, index) => (
                            <div key={index} className="p-6 rounded-2xl bg-default-100/50 border border-divider relative group hover:border-warning-500/30 transition-all">
                                <Button isIconOnly size="sm" variant="light" className="absolute top-4 right-4 text-danger-400 group-hover:opacity-100 transition-opacity" onPress={() => removeTruck(index)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </Button>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="VEHICLE NO" value={truck.vehicleNo} onValueChange={(v) => updateTruck(index, "vehicleNo", v)} variant="underlined" classNames={{ label: "text-xs font-black", input: "text-foreground uppercase font-black" }} />
                                    <Input label="OPERATOR" value={truck.transportCompany} onValueChange={(v) => updateTruck(index, "transportCompany", v)} variant="underlined" classNames={{ label: "text-xs font-black", input: "text-foreground uppercase font-black" }} />
                                    <Input label="DRIVER" value={truck.driverName} onValueChange={(v) => updateTruck(index, "driverName", v)} variant="underlined" classNames={{ label: "text-xs font-black", input: "text-foreground uppercase font-black" }} />
                                    <Input label="POSITION" value={truck.currentLocation} onValueChange={(v) => updateTruck(index, "currentLocation", v)} variant="underlined" classNames={{ label: "text-xs font-black", input: "text-foreground uppercase font-black" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Compliance Center */}
                <div className="bg-default-100/40 border border-divider rounded-3xl p-8 backdrop-blur-xl">
                    <h2 className="text-xs font-black uppercase tracking-widest text-warning-500 mb-8 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning-500 block" /> Compliance Registry
                    </h2>
                    <div className="space-y-3">
                        {rulesForStage.filter(canSeeRule).length === 0 ? (
                            <div className="py-12 border border-dashed border-divider rounded-2xl text-center text-xs font-black text-default-400 uppercase tracking-widest"> No verification required </div>
                        ) : (
                            rulesForStage.filter(canSeeRule).map((rule: any) => {
                                const hasDoc = hasDocType(String(rule.docType || ""));
                                return (
                                    <div key={rule._id} className="p-4 rounded-xl bg-default-100/50 border border-divider flex items-center justify-between group hover:border-warning-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-1.5 h-1.5 rounded-full ${hasDoc ? 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-warning-500 animate-pulse shadow-[0_0_8px_rgba(245,165,36,0.5)]'}`} />
                                            <div className="text-xs font-black text-foreground uppercase tracking-wider">{rule.docType}</div>
                                        </div>
                                        {!hasDoc && canActOnRule(rule) && (
                                            <Button size="sm" color="warning" variant="flat" className="h-7 text-xs font-black uppercase px-4 rounded-lg" onPress={() => { setDocActionRule(rule); setDocActionOpen(true); }}>
                                                {String(rule.actionType || "") === "UPLOAD" ? "UPLOAD" : "GENERATE"}
                                            </Button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={docActionOpen} onOpenChange={setDocActionOpen} className="bg-background border border-divider">
                <ModalContent>
                    <ModalHeader className="text-sm font-black uppercase tracking-tighter text-foreground"> {docActionRule ? `${docActionRule.docType} ENTRY` : "Compliance Entry"} </ModalHeader>
                    <ModalBody>
                        {String(docActionRule?.actionType || "") === "UPLOAD" && (
                            <Input label="REMOTE SECURE URL" placeholder="https://..." value={docActionFileUrl} onChange={(e) => setDocActionFileUrl(e.target.value)} variant="bordered" classNames={{ input: "text-foreground" }} />
                        )}
                        <div className="text-xs font-black text-warning-500 uppercase tracking-widest mt-2">{docActionRule?.responsibleRole ? `PRIORITY: ${docActionRule.responsibleRole} AUTHORITY` : ""}</div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" className="text-default-400 font-black text-xs uppercase" onPress={() => setDocActionOpen(false)}> CANCEL </Button>
                        <Button color="warning" className="font-black text-xs uppercase shadow-lg shadow-warning-500/20" onPress={() => createDocMutation.mutate()}> COMMIT TO REGISTRY </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
