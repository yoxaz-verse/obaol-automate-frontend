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
    Accordion,
    AccordionItem,
    Progress,
    Tooltip,
    Textarea,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import {
    FiArrowRight,
    FiCheckCircle,
    FiPackage,
    FiInfo,
    FiChevronRight,
    FiClock,
    FiCheck,
    FiCircle,
    FiLoader
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
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
    useEffect(() => {
        // Ensure relativeTime is extended for this component instance
        dayjs.extend(require("dayjs/plugin/relativeTime"));
    }, []);
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
    const [selectedSupplierOperatorId, setSelectedSupplierOperatorId] = useState("");
    const [selectedDealCloserOperatorId, setSelectedDealCloserOperatorId] = useState("");
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
    const { data: operators } = useQuery({
        queryKey: ["operators"],
        queryFn: () => getData(apiRoutes.operator.getAll),
        enabled: !!user && (user.role === "Admin" || user.role === "Operator" || user.role === "Team"),
        select: (res) => {
            const raw = res?.data;
            if (Array.isArray(raw)) return raw;
            if (Array.isArray(raw?.data)) return raw.data;
            if (Array.isArray(raw?.data?.data)) return raw.data.data;
            return [];
        },
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
    const { data: incotermResponse } = useQuery({
        queryKey: ["incoterms"],
        queryFn: () => getData(apiRoutes.incoterm.getAll),
    });
    const { data: paymentTermResponse } = useQuery({
        queryKey: ["payment-terms"],
        queryFn: () => getData(apiRoutes.paymentTerm.getAll),
    });
    const { data: orderDocsResponse } = useQuery({
        queryKey: ["trade-documents", "order", orderId],
        queryFn: () => getData(apiRoutes.tradeDocuments.list, { orderId, page: 1, limit: 200 }),
        enabled: Boolean(orderId),
    });
    useEffect(() => {
        const supplierOp =
            (order as any)?.supplierOperatorId?._id ||
            (order as any)?.supplierOperatorId ||
            (linkedEnquiry as any)?.supplierOperatorId?._id ||
            (linkedEnquiry as any)?.supplierOperatorId ||
            "";
        const dealCloserOp =
            (order as any)?.dealCloserOperatorId?._id ||
            (order as any)?.dealCloserOperatorId ||
            (linkedEnquiry as any)?.dealCloserOperatorId?._id ||
            (linkedEnquiry as any)?.dealCloserOperatorId ||
            "";
        setSelectedSupplierOperatorId(String(supplierOp || ""));
        setSelectedDealCloserOperatorId(String(dealCloserOp || ""));
    }, [order, linkedEnquiry]);
    const updateOrderOperatorsMutation = useMutation({
        mutationFn: (payload: any) => patchData(`${apiRoutes.orders.update}/${orderId}`, payload),
        onSuccess: () => {
            toast.success("Operators updated");
            queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Unable to update operators");
        },
    });
    const incotermOptions = Array.isArray(incotermResponse?.data?.data?.data)
        ? incotermResponse.data.data.data
        : Array.isArray(incotermResponse?.data?.data)
            ? incotermResponse.data.data
            : Array.isArray(incotermResponse?.data)
                ? incotermResponse.data
                : [];
    const paymentTermOptions = Array.isArray(paymentTermResponse?.data?.data?.data)
        ? paymentTermResponse.data.data.data
        : Array.isArray(paymentTermResponse?.data?.data)
            ? paymentTermResponse.data.data
            : Array.isArray(paymentTermResponse?.data)
                ? paymentTermResponse.data
                : [];
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

    const SUBFLOW_DATE_MAP: Record<string, { key: string; label: string; type: string }[]> = {
        PROCUREMENT: [
            { key: "procurementDate", label: "START DATE", type: "date" },
            { key: "procurementInspectionDate", label: "INSPECTION DATE", type: "date" },
            { key: "procurementCompletedDate", label: "COMPLETION DATE", type: "date" },
        ],
        PACKAGING: [
            { key: "packagingStartDate", label: "PACKING START", type: "date" },
            { key: "packagingCompletedDate", label: "PACKING DONE", type: "date" },
        ],
        INLAND_TRANSPORTATION: [
            { key: "transportDispatchDate", label: "DISPATCH DATE", type: "date" },
        ],
        CERTIFICATION: [
            { key: "certificateRequestedDate", label: "REQUESTED DATE", type: "date" },
            { key: "certificateIssuedDate", label: "ISSUED DATE", type: "date" },
        ],
        FREIGHT_FORWARDING: [
            { key: "shippingBookedDate", label: "BOOKING DATE", type: "date" },
            { key: "customsClearanceDate", label: "CUSTOMS DATE", type: "date" },
        ],
        QUALITY_QA: [
            { key: "qualitySampleSentDate", label: "SAMPLE SENT", type: "date" },
            { key: "labExpectedReportDate", label: "LAB ETA", type: "date" },
            { key: "qualityApprovedDate", label: "APPROVAL DATE", type: "date" },
        ],
    };

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
    const tradeType = String(
        (order as any)?.externalTradeType ||
        (linkedEnquiry as any)?.executionContext?.tradeType ||
        "DOMESTIC"
    ).toUpperCase();
    const executionTasks = Array.isArray((linkedEnquiry as any)?.executionInquiries)
        ? (linkedEnquiry as any).executionInquiries
        : null;
    const hasLinkedExecutionTasks = Array.isArray(executionTasks);
    const inlandTransportInstances = (() => {
        const rawInstances = Array.isArray((order as any)?.subflowInstances) ? (order as any).subflowInstances : [];
        const fromOrder = rawInstances
            .filter((inst: any) => String(inst?.type || "").toUpperCase() === "INLAND_TRANSPORTATION")
            .map((inst: any, index: number) => ({
                instanceKey: String(inst?.instanceKey || `SEGMENT_${index + 1}`),
                label: String(inst?.label || "").trim(),
            }))
            .filter((inst: any) => inst.instanceKey);
        if (fromOrder.length > 0) return fromOrder;
        if (!hasLinkedExecutionTasks) return [];
        return (executionTasks as any[])
            .filter((task: any) => String(task?.type || "").toUpperCase() === "TRANSPORTATION")
            .map((task: any, index: number) => ({
                instanceKey: String(task?._id || `SEGMENT_${index + 1}`),
                label: String(task?.details?.segmentLabel || task?.title || "").trim(),
            }))
            .filter((inst: any) => inst.instanceKey);
    })();
    const requiredSubflowTypeSet = new Set<string>();
    if (hasLinkedExecutionTasks) {
        executionTasks.forEach((task: any) => {
            const type = String(task?.type || "").toUpperCase();
            if (!type) return;
            if (type === "PROCUREMENT") requiredSubflowTypeSet.add("PROCUREMENT");
            if (type === "PACKAGING") requiredSubflowTypeSet.add("PACKAGING");
            if (type === "QUALITY_TESTING") requiredSubflowTypeSet.add("QUALITY_QA");
            if (type === "CERTIFICATION") requiredSubflowTypeSet.add("CERTIFICATION");
            if (type === "WAREHOUSE") requiredSubflowTypeSet.add("WAREHOUSE");
            if (type === "SHIPPING") requiredSubflowTypeSet.add("FREIGHT_FORWARDING");
            if (type === "TRANSPORTATION") requiredSubflowTypeSet.add("INLAND_TRANSPORTATION");
        });
    }
    const requiredSubflowTypes = Array.from(requiredSubflowTypeSet);
    const activeSubflowConfigs = subflowConfigs.filter((config: any) => config?.isActive !== false);
    const scopedSubflowConfigs = hasLinkedExecutionTasks
        ? (requiredSubflowTypes.length > 0
            ? activeSubflowConfigs.filter((config: any) => requiredSubflowTypeSet.has(String(config.subflowType || "").toUpperCase()))
            : [])
        : activeSubflowConfigs;
    const subflowTypes = Array.from(
        new Set(
            scopedSubflowConfigs
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
    const supplierOperatorId = (
        (linkedEnquiry as any)?.supplierOperatorId?._id ||
        (linkedEnquiry as any)?.supplierOperatorId ||
        (order as any)?.supplierOperatorId?._id ||
        (order as any)?.supplierOperatorId ||
        ""
    ).toString();
    const dealCloserOperatorId = (
        (linkedEnquiry as any)?.dealCloserOperatorId?._id ||
        (linkedEnquiry as any)?.dealCloserOperatorId ||
        (order as any)?.dealCloserOperatorId?._id ||
        (order as any)?.dealCloserOperatorId ||
        ""
    ).toString();
    if (
        isOperatorUser &&
        (!user?.id ||
            (assignedOperatorId !== String(user.id) &&
                supplierOperatorId !== String(user.id) &&
                dealCloserOperatorId !== String(user.id)))
    ) {
        return (
            <div className="p-10 text-center">
                <p className="text-lg font-semibold">Access restricted</p>
                <p className="text-default-500 mt-2">This order is not assigned to you.</p>
            </div>
        );
    }

    const orderRules = Array.isArray(orderRulesResponse?.data?.data) ? orderRulesResponse.data.data : [];
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
    const paymentPlan = (order as any)?.paymentPlan;
    const paymentMilestones = Array.isArray(paymentPlan?.milestones) ? paymentPlan.milestones : [];
    const orderIncotermId = (order as any)?.incotermId || (linkedEnquiry as any)?.preferredIncoterm;
    const orderPaymentTermId = (order as any)?.paymentTermId || (linkedEnquiry as any)?.paymentTermId;
    const incotermLabel =
        incotermOptions.find((item: any) => String(item?._id) === String(orderIncotermId))?.code ||
        incotermOptions.find((item: any) => String(item?._id) === String(orderIncotermId))?.name ||
        "Not specified";
    const paymentTermLabel =
        paymentTermOptions.find((item: any) => String(item?._id) === String(orderPaymentTermId))?.label || "Not specified";
    const DOC_TYPE_LABELS: Record<string, string> = {
        PROFORMA_INVOICE: "Proforma Invoice",
        BILL_OF_LADING: "Bill of Lading",
        AIR_WAYBILL: "Air Waybill",
        LORRY_RECEIPT: "Lorry Receipt",
        LCL_DRAFT: "LCL Draft",
        PACKING_LIST: "Packing List",
        INSPECTION_CERTIFICATE: "Inspection Certificate",
        QUALITY_CERTIFICATE: "Quality Certificate",
        PHYTOSANITARY_CERTIFICATE: "Phytosanitary Certificate",
        FUMIGATION_CERTIFICATE: "Fumigation Certificate",
        INSURANCE_CERTIFICATE: "Insurance Certificate",
        SALES_CONTRACT: "Sales Contract",
        PAYMENT_ADVICE: "Payment Advice",
        INVOICE: "Invoice",
    };
    const SUBFLOW_DOC_MAP: Record<string, string[]> = {
        PROCUREMENT: [],
        PACKAGING: ["PACKING_LIST"],
        QUALITY_QA: ["INSPECTION_CERTIFICATE", "QUALITY_CERTIFICATE"],
        CERTIFICATION: ["PHYTOSANITARY_CERTIFICATE", "FUMIGATION_CERTIFICATE"],
        INLAND_TRANSPORTATION: ["LORRY_RECEIPT", "LCL_DRAFT"],
        FREIGHT_FORWARDING: ["BILL_OF_LADING", "AIR_WAYBILL", "INSURANCE_CERTIFICATE"],
    };
    const ORDER_CORE_DOC_TYPES = ["SALES_CONTRACT", "INVOICE", "PAYMENT_ADVICE"];
    const docRulesAll = Array.isArray(docRulesResponse?.data?.data) ? docRulesResponse.data.data : [];
    const operatorOptions = Array.isArray(operators) ? operators : [];
    const docRuleByType = new Map<string, any>();
    docRulesAll.forEach((rule: any) => {
        const key = String(rule?.docType || "").toUpperCase();
        if (!key) return;
        if (!docRuleByType.has(key)) {
            docRuleByType.set(key, rule);
            return;
        }
        const existing = docRuleByType.get(key);
        if (String(rule?.stageType || "").toUpperCase() === "ORDER" && String(existing?.stageType || "").toUpperCase() !== "ORDER") {
            docRuleByType.set(key, rule);
        }
    });
    const mappedDocTypes = new Set<string>();
    Object.values(SUBFLOW_DOC_MAP).forEach((types) => types.forEach((t) => mappedDocTypes.add(t)));
    const docsForOrderTypes = Array.from(new Set((docsForOrder || []).map((doc: any) => String(doc?.type || "").toUpperCase())));
    const extraDocTypes = docsForOrderTypes.filter((type) => !mappedDocTypes.has(type) && !ORDER_CORE_DOC_TYPES.includes(type));
    const orderCoreDocTypes = [...ORDER_CORE_DOC_TYPES, ...extraDocTypes];
    const getDocRule = (docType: string) => docRuleByType.get(String(docType || "").toUpperCase());

    const subflowStatus = scopedSubflowConfigs
        .flatMap((config: any) => {
            const type = String(config.subflowType || "").toUpperCase();
            const flowRules = subflowRulesResponse?.get?.(type) || [];
            const sortedFlowRules = [...flowRules].sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
            const lastStage = sortedFlowRules.length ? sortedFlowRules[sortedFlowRules.length - 1] : null;
            const gateStage = String(config.mustCompleteBeforeOrderStage || "").toUpperCase();
            const gateLabel = stageLabelMap.get(gateStage) || gateStage;
            const currentRank = orderStageRank.get(String(workflowStage).toUpperCase()) ?? 0;
            const gateRank = orderStageRank.get(gateStage) ?? 0;
            const dependsOn = Array.isArray(config.dependsOnSubflows) ? config.dependsOnSubflows : [];

            const buildStatus = (instanceKey?: string, instanceLabel?: string) => {
                const stageKey = instanceKey
                    ? String((order as any)?.subflowStages?.[`INLAND_TRANSPORTATION::${instanceKey}`] || "").toUpperCase()
                    : String(
                        (order as any)?.subflowStages?.[type] ||
                        (order as any)?.subflowStages?.INLAND_LOGISTICS ||
                        (order as any)?.subflowStages?.LOGISTICS ||
                        ""
                    ).toUpperCase();
                const isComplete = Boolean(lastStage && stageKey && String(lastStage.stageKey) === stageKey);
                const currentIndex = sortedFlowRules.findIndex((rule: any) => String(rule.stageKey || "").toUpperCase() === stageKey);
                const completedCount = currentIndex >= 0 ? currentIndex + 1 : 0;
                const totalCount = sortedFlowRules.length;
                const labelBase = type.replaceAll("_", " ");
                const labelSuffix = instanceLabel ? ` — ${instanceLabel}` : "";
                const currentLabel = stageKey
                    ? (flowRules.find((r: any) => String(r.stageKey).toUpperCase() === stageKey)?.label || stageKey)
                    : "Not started";
                return {
                    type,
                    instanceKey,
                    label: `${labelBase}${labelSuffix}`,
                    currentStage: stageKey || "NOT_STARTED",
                    currentLabel,
                    isComplete,
                    isBlocking: !isComplete && currentRank >= gateRank,
                    gateLabel,
                    dependsOn,
                    stages: sortedFlowRules.map((rule: any) => ({
                        stageKey: String(rule.stageKey || "").toUpperCase(),
                        label: rule.label || rule.stageKey,
                        description: rule.description || "",
                    })),
                    currentIndex,
                    completedCount,
                    totalCount,
                };
            };

            if (type === "INLAND_TRANSPORTATION" && inlandTransportInstances.length > 0) {
                return inlandTransportInstances.map((inst: any) => buildStatus(inst.instanceKey, inst.label));
            }
            return [buildStatus()];
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

    const canEditSubflow = (subflowType: string) => {
        if (roleLower === "admin" || roleLower === "operator" || roleLower === "team") return true;

        const type = String(subflowType).toUpperCase();
        let respKey = "";
        if (type === "PROCUREMENT") respKey = "procurementBy";
        else if (type === "PACKAGING") respKey = "packagingBy";
        else if (type === "INLAND_TRANSPORTATION") respKey = "transportBy";
        else if (type === "CERTIFICATION") respKey = "certificateBy";
        else if (type === "FREIGHT_FORWARDING") respKey = "shippingBy";
        else if (type === "QUALITY_QA") respKey = "qualityTestingBy";

        if (!respKey) return false;

        const owner = responsibilities[respKey] || "obaol";
        const userId = String(user?.id || "");
        const buyerId = String((linkedEnquiry as any)?.buyerAssociateId?._id || (linkedEnquiry as any)?.buyerAssociateId || "");
        const sellerId = String((linkedEnquiry as any)?.sellerAssociateId?._id || (linkedEnquiry as any)?.sellerAssociateId || "");

        if (owner === "buyer") return buyerId === userId;
        if (owner === "seller") return sellerId === userId;
        return false;
    };

    const canSeeFleet = () => {
        const isLogisticsActive = subflowTypes.includes("INLAND_TRANSPORTATION");
        if (!isLogisticsActive) return false;

        if (roleLower === "admin" || roleLower === "operator" || roleLower === "team") return true;

        const transportOwner = responsibilities.transportBy || "obaol";
        const userId = String(user?.id || "");
        const buyerId = String((linkedEnquiry as any)?.buyerAssociateId?._id || (linkedEnquiry as any)?.buyerAssociateId || "");
        const sellerId = String((linkedEnquiry as any)?.sellerAssociateId?._id || (linkedEnquiry as any)?.sellerAssociateId || "");

        if (transportOwner === "buyer") return buyerId === userId;
        if (transportOwner === "seller") return sellerId === userId;
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
    const isSystemAdmin = roleLower === "admin";
    const formatActionByLabel = (value: string) => {
        const normalized = String(value || "").toUpperCase();
        if (normalized === "BUYER") return "Buyer";
        if (normalized === "SELLER" || normalized === "SUPPLIER") return "Supplier";
        if (normalized === "BOTH") return "Buyer & Supplier";
        if (normalized === "EITHER") return "Buyer or Supplier";
        if (normalized === "OBAOL" || normalized === "INTERNAL") return "OBAOL";
        return "";
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
                        <div className="text-sm font-black text-foreground/60 uppercase">
                            {order.updatedAt ? (
                                typeof (dayjs(order.updatedAt) as any).fromNow === 'function' ?
                                    dayjs(order.updatedAt).fromNow() :
                                    dayjs(order.updatedAt).format("DD MMM YY HH:mm")
                            ) : "Recent"}
                        </div>
                    </div>
                </div>
            </div>

            {(roleLower === "admin" || roleLower === "operator" || roleLower === "team") && (
                <Card className="border border-divider bg-content1/60">
                    <CardBody className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="flex-1">
                            <div className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
                                Supplier Ownership Operator
                            </div>
                            <Select
                                aria-label="Supplier operator"
                                placeholder="Select supplier operator"
                                selectedKeys={selectedSupplierOperatorId ? [selectedSupplierOperatorId] : []}
                                onSelectionChange={(keys) => {
                                    const nextId = Array.from(keys as Set<string>)[0] || "";
                                    setSelectedSupplierOperatorId(String(nextId));
                                }}
                            >
                                {operatorOptions.map((op: any) => (
                                    <SelectItem key={String(op._id)} value={String(op._id)}>
                                        {op.name || "Operator"}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
                                Deal Closer Operator
                            </div>
                            <Select
                                aria-label="Deal closer operator"
                                placeholder="Select deal closer operator"
                                selectedKeys={selectedDealCloserOperatorId ? [selectedDealCloserOperatorId] : []}
                                onSelectionChange={(keys) => {
                                    const nextId = Array.from(keys as Set<string>)[0] || "";
                                    setSelectedDealCloserOperatorId(String(nextId));
                                }}
                            >
                                {operatorOptions.map((op: any) => (
                                    <SelectItem key={String(op._id)} value={String(op._id)}>
                                        {op.name || "Operator"}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                className="bg-warning text-black font-bold"
                                isLoading={updateOrderOperatorsMutation.isLoading}
                                onPress={() => {
                                    updateOrderOperatorsMutation.mutate({
                                        supplierOperatorId: selectedSupplierOperatorId || null,
                                        dealCloserOperatorId: selectedDealCloserOperatorId || null,
                                    });
                                }}
                            >
                                Save Operators
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}

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
                {/* Strategic Command: Global Summary */}
                <div className="lg:col-span-2 bg-default-100/40 border border-divider rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-3 mb-1">
                                <span className="w-2 h-2 rounded-full bg-primary-500 block shadow-[0_0_8px_rgba(0,111,238,0.6)]" />
                                Strategic Command
                            </h2>
                            <p className="text-[10px] font-black text-default-400 uppercase tracking-widest ml-5">Global Planning & Date Summary</p>
                        </div>
                        {isSchedulingFinalized && (
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-success-500/10 border border-success-500/20 text-success-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                                Plan Finalized
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* @ts-ignore */}
                        <Select
                            label="SCHEDULING PROTOCOL"
                            selectedKeys={milestones.schedulingMode ? [milestones.schedulingMode] : []}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys as Set<string>);
                                updateMilestone("schedulingMode", String(arr[0] || ""));
                            }}
                            variant="bordered"
                            classNames={{
                                label: "text-[10px] font-black tracking-widest text-default-400",
                                trigger: "border-divider bg-default-100/50 h-14",
                                value: "text-foreground font-black uppercase text-xs"
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
                                label: "text-[10px] font-black tracking-widest text-default-400",
                                input: "text-foreground font-black text-xs",
                                inputWrapper: "border-divider bg-default-100/50 h-14"
                            }}
                        />

                        {/* @ts-ignore */}
                        <Textarea
                            className="md:col-span-2"
                            label="EXECUTION NOTES"
                            placeholder="Planning summary..."
                            value={milestones.schedulingNotes}
                            onValueChange={(v) => updateMilestone("schedulingNotes", v)}
                            variant="bordered"
                            minRows={1}
                            classNames={{
                                label: "text-[10px] font-black tracking-widest text-default-400",
                                input: "text-foreground/70 font-medium text-xs",
                                inputWrapper: "border-divider bg-default-100/50 min-h-[56px] py-2"
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: "Procurement", type: "PROCUREMENT", start: milestones.procurementDate, end: milestones.procurementCompletedDate },
                            { label: "Packaging", type: "PACKAGING", start: milestones.packagingStartDate, end: milestones.packagingCompletedDate },
                            { label: "Inland Transportation", type: "INLAND_TRANSPORTATION", start: null, end: milestones.transportDispatchDate },
                            { label: "QA/Testing", type: "QUALITY_QA", start: milestones.qualitySampleSentDate, end: milestones.qualityApprovedDate },
                            { label: "Certification", type: "CERTIFICATION", start: milestones.certificateRequestedDate, end: milestones.certificateIssuedDate },
                            { label: "Freight", type: "FREIGHT_FORWARDING", start: milestones.shippingBookedDate, end: milestones.customsClearanceDate },
                        ].map((m) => {
                            const isNeeded = subflowTypes.includes(m.type);
                            if (!isNeeded) return null;

                            return (
                                <div key={m.label} className="p-5 rounded-3xl border border-divider bg-default-50/50 flex flex-col gap-4 group/m hover:border-warning-500/30 transition-all backdrop-blur-sm relative overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10px] font-black text-warning-500 uppercase tracking-[0.2em]">{m.label}</div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-warning-500/20" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black text-default-400 uppercase tracking-widest opacity-60">Start Stage</span>
                                            <span className={`text-[11px] font-black font-mono uppercase tracking-tight ${m.start ? "text-foreground" : "text-default-300"}`}>
                                                {m.start ? dayjs(m.start).format("DD MMM YY") : "TBD"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 border-l border-divider/50 pl-4">
                                            <span className="text-[8px] font-black text-default-400 uppercase tracking-widest opacity-60">Finish Stage</span>
                                            <span className={`text-[11px] font-black font-mono uppercase tracking-tight ${m.end ? "text-foreground" : "text-default-300"}`}>
                                                {m.end ? dayjs(m.end).format("DD MMM YY") : "TBD"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Next Step Protocol: Action Roadmap */}
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <div className="bg-default-100/40 border border-divider rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group flex flex-col h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-warning-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-warning-500/20 transition-all duration-700" />

                        <h2 className="text-xs font-black uppercase tracking-widest text-warning-500 mb-6 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-warning-500 block shadow-[0_0_8px_rgba(245,165,36,0.6)]" />
                            Next Step Protocol
                        </h2>

                        <div className="flex-grow space-y-6">
                            {subflowStatus.length === 0 && hasLinkedExecutionTasks ? (
                                <div className="p-5 rounded-2xl bg-default-100/40 border border-divider flex flex-col items-center text-center gap-3">
                                    <FiInfo size={26} className="text-default-500" />
                                    <div className="text-sm font-black text-default-600 uppercase">No execution subflows selected</div>
                                    <p className="text-xs font-medium text-default-500">This order runs without execution support flows.</p>
                                </div>
                            ) : subflowStatus.find(f => !f.isComplete) ? (
                                <div className="p-5 rounded-2xl bg-warning-500/5 border border-warning-500/20 space-y-4">
                                    <div className="text-[10px] font-black text-warning-600 uppercase tracking-widest">Active Dependency</div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-warning-500/20 flex items-center justify-center text-warning-500">
                                            <FiArrowRight size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-foreground uppercase tracking-tight">
                                                {subflowStatus.find(f => !f.isComplete)?.label}
                                            </div>
                                            <div className="text-[10px] font-bold text-default-400 uppercase tracking-wider italic mt-0.5">
                                                Locked by: {subflowStatus.find(f => !f.isComplete)?.gateLabel}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-medium text-default-500 leading-relaxed">
                                        Update the milestones within the <span className="text-warning-500 font-bold">Synchronized Pipelines</span> below to unlock next stage.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-5 rounded-2xl bg-success-500/5 border border-success-500/20 flex flex-col items-center text-center gap-3">
                                    <FiCheckCircle size={32} className="text-success-500" />
                                    <div className="text-sm font-black text-success-600 uppercase">Subflows Operational</div>
                                    <p className="text-xs font-medium text-default-500">All parallel pipelines are synchronized with current order state.</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="text-[10px] font-black text-default-400 uppercase tracking-widest px-1">Upcoming Milestone</div>
                                <div className="relative pl-10 space-y-5">
                                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-divider" />
                                    {subflowStatus.length === 0 && hasLinkedExecutionTasks ? (
                                        <div className="text-[11px] font-black uppercase tracking-tight text-default-400">
                                            No subflow milestones configured.
                                        </div>
                                    ) : (
                                        subflowStatus.filter(f => !f.isComplete).slice(0, 2).map((f, i) => (
                                            <div key={f.type} className="relative flex items-center gap-3">
                                                <div className={`absolute -left-[30px] w-2.5 h-2.5 rounded-full border-2 border-background shadow-sm ${i === 0 ? 'bg-warning-500' : 'bg-default-300'}`} />
                                                <span className={`text-[11px] font-black uppercase tracking-tight ${i === 0 ? 'text-foreground' : 'text-default-400'}`}>
                                                    {f.label}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-divider flex flex-col gap-4">
                            <Button
                                color="warning"
                                variant="solid"
                                className="font-black text-sm uppercase tracking-widest h-14 rounded-2xl shadow-[0_10px_30px_rgba(245,165,36,0.2)] hover:shadow-[0_15px_40px_rgba(245,165,36,0.3)] hover:-translate-y-0.5 transition-all w-full"
                                onClick={handleGeneralUpdate}
                                isLoading={updateMutation.isPending}
                            >
                                Commit Execution Plan
                            </Button>
                            <p className="text-[10px] font-black text-default-400 uppercase tracking-widest text-center opacity-70">
                                Verify all sub-dates before committing.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Pipeline / Subflow Manifest */}
                {subflowStatus.length > 0 ? (
                    <div className="lg:col-span-2 bg-default-100/40 border border-divider rounded-3xl backdrop-blur-xl overflow-hidden h-full">
                        <div className="p-8 border-b border-divider flex justify-between items-end">
                            <div>
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-warning-500 flex items-center gap-3 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-warning-500 block animate-pulse shadow-[0_0_12px_rgba(245,165,36,0.6)]" />
                                    Synchronized Pipelines
                                </h2>
                                <p className="text-[11px] font-black text-default-400 uppercase tracking-widest max-w-xs leading-relaxed">
                                    Consolidated telemetry for parallel subflow execution and gate-locking.
                                </p>
                            </div>
                            <div className="text-[10px] font-black text-default-500 uppercase tracking-[0.1em] bg-default-100/50 px-4 py-1.5 rounded-full border border-divider">Global Telemetry Active</div>
                        </div>
                        <div className="p-6">
                            {/* @ts-ignore */}
                            <Accordion selectionMode="multiple" variant="splitted" className="gap-4 px-0">
                                {subflowStatus.map((flow) => {
                                    const dateFields = SUBFLOW_DATE_MAP[flow.type] || [];
                                    return (
                                        <AccordionItem
                                            key={`${flow.type}-${flow.instanceKey || "base"}`}
                                            aria-label={flow.label}
                                            title={
                                                <div className="flex items-center justify-between gap-4 w-full h-full relative group/item">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-3 h-3 rounded-full transition-all duration-700 ${flow.isComplete ? "bg-success-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-warning-500 shadow-[0_0_15px_rgba(245,165,36,0.6)] animate-pulse"}`} />
                                                        <div className="flex flex-col gap-1.5 text-left">
                                                            <div className="text-sm font-black text-foreground uppercase tracking-tight group-hover/item:text-warning-500 transition-colors">{flow.label}</div>
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                                                                <div className="text-[9px] font-black uppercase tracking-widest bg-default-200/50 dark:bg-default-50/10 px-2 py-0.5 rounded-md border border-divider">
                                                                    <span className="text-default-400 mr-1.5">STATUS:</span>
                                                                    <span className="text-warning-500">{flow.currentLabel}</span>
                                                                </div>
                                                                {flow.isBlocking && (
                                                                    <div className="text-[9px] font-black uppercase tracking-widest bg-danger-500/10 dark:bg-danger-500/5 px-2 py-0.5 rounded-md border border-danger-500/20 text-danger-500">
                                                                        <span className="text-danger-400/50 mr-1.5 ">GATE:</span> {flow.gateLabel}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        {/* @ts-ignore */}
                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            color={flow.isComplete ? "success" : "warning"}
                                                            className="text-[10px] font-black uppercase tracking-widest border border-divider bg-default-50/50"
                                                        >
                                                            {flow.isComplete ? "COMPLETED" : "PROCESSING"}
                                                        </Chip>
                                                    </div>
                                                </div>
                                            }
                                            classNames={{
                                                base: "bg-default-50/20 border border-divider rounded-[1.5rem] shadow-sm hover:border-warning-500/30 transition-all px-2",
                                                trigger: "py-5",
                                                content: "pt-2 pb-8 px-4",
                                                title: "w-full"
                                            }}
                                        >
                                                <div className="flex flex-col gap-8">
                                                    {/* Parallel Dates Section */}
                                                    {dateFields.length > 0 && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-[1.5rem] bg-default-100/20 border border-divider shadow-inner group/dates relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-warning-500/20" />
                                                        {dateFields.map((field) => (
                                                            <div key={field.key} className="flex flex-col gap-2.5">
                                                                <label className="text-[10px] font-black text-default-400 uppercase tracking-[0.2em] px-0.5">{field.label}</label>
                                                                <Input
                                                                    type="date"
                                                                    value={milestones[field.key]}
                                                                    onValueChange={(v) => updateMilestone(field.key, v)}
                                                                    variant="flat"
                                                                    size="sm"
                                                                    radius="lg"
                                                                    classNames={{
                                                                        input: "text-foreground font-black text-xs h-10",
                                                                        inputWrapper: "bg-background/50 hover:bg-default-100 border border-divider/50 shadow-sm"
                                                                    }}
                                                                    isDisabled={!isSchedulingFinalized || !canEditSubflow(flow.type)}
                                                                />
                                                            </div>
                                                        ))}
                                                        </div>
                                                    )}

                                                    {/* Subflow Documents */}
                                                    <div className="space-y-4">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-default-500 px-2">
                                                            Required Documents
                                                        </div>
                                                        {(() => {
                                                            const mappedDocs = SUBFLOW_DOC_MAP[flow.type] || [];
                                                            if (mappedDocs.length === 0) {
                                                                return (
                                                                    <div className="py-6 border border-dashed border-divider rounded-2xl text-center text-[10px] font-black text-default-400 uppercase tracking-widest">
                                                                        No documents required for this flow
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {mappedDocs.map((docType) => {
                                                                        const hasDoc = hasDocType(String(docType || ""));
                                                                        const rule = getDocRule(String(docType || ""));
                                                                        return (
                                                                            <div key={docType} className="p-4 rounded-xl bg-default-100/50 border border-divider flex items-center justify-between group hover:border-warning-500/30 transition-all">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`w-1.5 h-1.5 rounded-full ${hasDoc ? 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-warning-500 animate-pulse shadow-[0_0_8px_rgba(245,165,36,0.5)]'}`} />
                                                                                    <div className="text-xs font-black text-foreground uppercase tracking-wider">
                                                                                        {DOC_TYPE_LABELS[String(docType || "").toUpperCase()] || String(docType).replaceAll("_", " ")}
                                                                                    </div>
                                                                                </div>
                                                                                {!hasDoc && rule && canActOnRule(rule) && (
                                                                                    <div className="flex flex-col items-end gap-1">
                                                                                        <Button size="sm" color="warning" variant="flat" className="h-7 text-xs font-black uppercase px-4 rounded-lg" onPress={() => { setDocActionRule(rule); setDocActionOpen(true); }}>
                                                                                            {String(rule.actionType || "") === "UPLOAD" ? "UPLOAD" : "GENERATE"}
                                                                                        </Button>
                                                                                        {isSystemAdmin && formatActionByLabel(rule?.responsibleRole) && (
                                                                                            <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest">
                                                                                                Action by: {formatActionByLabel(rule?.responsibleRole)}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>

                                                    {/* Fleet Telemetry inside Inland Transportation */}
                                                    {flow.type === "INLAND_TRANSPORTATION" && canSeeFleet() && (
                                                        <div className="bg-default-100/40 border border-divider rounded-2xl p-6 backdrop-blur-xl">
                                                            <div className="flex justify-between items-center mb-6">
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
                                                                    <div className="py-10 border border-dashed border-divider rounded-2xl text-center text-xs font-black text-default-400 uppercase tracking-widest"> No fleet units prioritized </div>
                                                                )}
                                                                {logisticsList.map((truck, index) => (
                                                                    <div key={index} className="p-5 rounded-2xl bg-default-100/50 border border-divider relative group hover:border-warning-500/30 transition-all">
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
                                                    )}

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between px-2">
                                                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-default-500">
                                                                Subflow Progression Pipeline
                                                            </div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-warning-500 bg-warning-500/10 px-3 py-1 rounded-full border border-warning-500/20">
                                                            {flow.totalCount > 0 ? Math.round((flow.completedCount / flow.totalCount) * 100) : 0}% OVERALL
                                                        </div>
                                                    </div>
                                                    {/* @ts-ignore */}
                                                    <Progress
                                                        size="sm"
                                                        value={flow.totalCount > 0 ? (flow.completedCount / flow.totalCount) * 100 : 0}
                                                        color={flow.isComplete ? "success" : "warning"}
                                                        className="shadow-sm rounded-full overflow-hidden"
                                                    />

                                                    <div className="flex flex-col gap-6 mt-6">
                                                        {(() => {
                                                            const completedStages = flow.stages.filter((_, idx) => flow.currentIndex >= 0 && idx < flow.currentIndex);
                                                            const currentIdx = flow.currentIndex === -1 ? 0 : flow.currentIndex;
                                                            const activeStage = flow.stages[currentIdx];
                                                            const upcomingStages = flow.stages.slice(currentIdx + 1);

                                                            return (
                                                                <div className="flex flex-col gap-5">
                                                                    {/* COMPACT HISTORY TRAIL */}
                                                                    {completedStages.length > 0 && (
                                                                        <div className="flex items-center gap-2 px-1">
                                                                            <div className="text-[10px] font-black text-success-500 uppercase tracking-widest mr-2 flex items-center gap-1.5 bg-success-500/10 px-2 py-1 rounded">
                                                                                <FiCheck size={12} strokeWidth={3} /> History
                                                                            </div>
                                                                            <div className="flex items-center gap-1 flex-wrap">
                                                                                {completedStages.map((stage, sIdx) => (
                                                                                    <Tooltip key={stage.stageKey} content={stage.label} placement="bottom" showArrow={true} className="font-black text-[10px] uppercase tracking-widest bg-success-600">
                                                                                        <div className="w-5 h-5 rounded-md bg-success-500/20 border border-success-500/30 flex items-center justify-center text-success-500 hover:bg-success-500 hover:text-white transition-all cursor-crosshair">
                                                                                            <FiCheck size={10} strokeWidth={4} />
                                                                                        </div>
                                                                                    </Tooltip>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* ACTIVE STAGE CARD */}
                                                                    {!flow.isComplete && activeStage && (
                                                                        <div className="flex flex-col gap-3">
                                                                            <div className="text-[10px] font-black text-warning-500 uppercase tracking-widest px-1">In-Focus Objective</div>
                                                                            <div
                                                                                className="p-5 rounded-2xl border-2 border-warning-500/30 bg-warning-500/10 shadow-lg shadow-warning-500/5 relative overflow-hidden group/stageActive"
                                                                            >
                                                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/stageActive:rotate-12 transition-transform">
                                                                                    <FiLoader size={32} className="animate-spin-slow" />
                                                                                </div>
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <div className="text-sm font-black uppercase tracking-tight text-foreground flex items-center gap-2.5">
                                                                                        <span className="w-3 h-3 rounded-full bg-warning-500 animate-pulse-slow shadow-[0_0_12px_rgba(245,165,36,0.6)]" />
                                                                                        {activeStage.label}
                                                                                    </div>
                                                                                    <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border text-warning-500 border-warning-500/30 bg-warning-500/10">
                                                                                        Live Phase
                                                                                    </div>
                                                                                </div>
                                                                                {activeStage.description && (
                                                                                    <div className="text-xs text-default-500 font-bold leading-relaxed pr-12">{activeStage.description}</div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* UPCOMING STEPS */}
                                                                    {!flow.isComplete && upcomingStages.length > 0 && (
                                                                        <div className="flex flex-col gap-3">
                                                                            <div className="text-[10px] font-black text-default-400 uppercase tracking-widest px-1">Upcoming Pipelines</div>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                {upcomingStages.map((stage) => (
                                                                                    <div
                                                                                        key={stage.stageKey}
                                                                                        className="p-3.5 rounded-xl border border-divider bg-default-100/30 hover:bg-default-100/60 hover:border-default-300 transition-all flex items-center justify-between group/next"
                                                                                    >
                                                                                        <div className="flex items-center gap-3">
                                                                                            <FiCircle size={10} className="text-default-300 group-hover/next:text-warning-500 transition-colors" />
                                                                                            <span className="text-[11px] font-black uppercase tracking-tight text-default-600 group-hover/next:text-foreground">{stage.label}</span>
                                                                                        </div>
                                                                                        <FiChevronRight size={12} className="text-default-300 opacity-0 group-hover/next:opacity-100 transition-all" />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {flow.isComplete && (
                                                                        <div className="py-8 flex flex-col items-center justify-center gap-4 border border-dashed border-success-500/30 rounded-[2rem] bg-success-500/5">
                                                                            <div className="w-16 h-16 rounded-full bg-success-500/20 flex items-center justify-center text-success-500 border-2 border-success-500/30 animate-bounce-subtle">
                                                                                <FiCheck size={40} strokeWidth={2.5} />
                                                                            </div>
                                                                            <div className="text-center">
                                                                                <div className="text-lg font-black text-success-600 uppercase tracking-tighter leading-none mb-1">Pipeline Integrated</div>
                                                                                <div className="text-[10px] font-black text-success-500 opacity-70 uppercase tracking-[0.2em]">All nodes fully synchronized and operational</div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </div>
                    </div>
                ) : hasLinkedExecutionTasks ? (
                    <div className="lg:col-span-2 bg-default-100/30 border border-divider rounded-3xl p-10 text-center text-default-500">
                        <div className="text-sm font-black uppercase tracking-widest">No execution subflows selected</div>
                        <p className="text-xs mt-2">This order doesn’t require procurement/logistics/packaging flows.</p>
                    </div>
                ) : null}

                {/* Authority Configuration */}
                <div className="bg-default-100/40 border border-divider rounded-3xl p-8 backdrop-blur-xl h-full flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-widest text-warning-500 mb-8 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning-500 block" />
                        Authority Configuration
                    </h2>
                    <div className="flex-grow space-y-4">
                        {[
                            { key: "procurementBy", label: "Procurement", date: milestones.procurementCompletedDate },
                            { key: "certificateBy", label: "Certificates", date: milestones.certificateIssuedDate },
                            { key: "transportBy", label: "Transportation", date: milestones.transportDispatchDate },
                            { key: "packagingBy", label: "Packaging", date: milestones.packagingCompletedDate },
                            { key: "qualityTestingBy", label: "Quality/QA", date: milestones.qualityApprovedDate },
                            ...(isInternational ? [{ key: "shippingBy", label: "Freight", date: milestones.customsClearanceDate }] : []),
                        ].map((resp) => (
                            <div key={resp.key} className="flex flex-col gap-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-default-400 uppercase tracking-widest">{resp.label}</label>
                                    {resp.date && (
                                        <div className="text-[9px] font-black text-warning-500 bg-warning-500/10 px-2 py-0.5 rounded-md border border-warning-500/20">
                                            {dayjs(resp.date).format("DD MMM")}
                                        </div>
                                    )}
                                </div>
                                {/* @ts-ignore */}
                                <Select
                                    selectedKeys={responsibilities[resp.key] ? [responsibilities[resp.key]] : []}
                                    onSelectionChange={(keys) => {
                                        const arr = Array.from(keys as Set<string>);
                                        setResponsibilities((prev: any) => ({ ...prev, [resp.key]: arr[0] || "" }));
                                    }}
                                    variant="bordered"
                                    classNames={{ trigger: "border-divider bg-default-100/50 h-12" }}
                                    placeholder="Select Authority"
                                    isDisabled={!(roleLower === "admin" || roleLower === "operator" || roleLower === "team")}
                                >
                                    {OWNER_OPTIONS.map((item) => (
                                        <SelectItem key={item.key} value={item.key} className="uppercase font-black text-xs">{item.label}</SelectItem>
                                    ))}
                                </Select>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-divider">
                        <h3 className="text-[10px] font-black text-default-400 uppercase tracking-widest px-1 mb-4">Payment Plan</h3>
                        <div className="rounded-2xl border border-divider bg-default-50/20 p-4 space-y-3">
                            <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-widest">
                                <span className="text-default-400">Incoterm</span>
                                <span className="text-foreground">{incotermLabel}</span>
                                <span className="text-default-300">•</span>
                                <span className="text-default-400">Payment Term</span>
                                <span className="text-foreground">{paymentTermLabel}</span>
                            </div>
                            {paymentMilestones.length === 0 ? (
                                <div className="text-xs text-default-500">No payment milestones configured for this order.</div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {paymentMilestones.map((milestone: any, idx: number) => (
                                        <div
                                            key={`${milestone.label}-${idx}`}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-divider px-3 py-2 bg-background/40"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-foreground uppercase tracking-tight">{milestone.label}</span>
                                                <span className="text-[11px] text-default-500">
                                                    {milestone.dueAtStageKey
                                                        ? `Stage: ${String(milestone.dueAtStageKey || "").replaceAll("_", " ")}`
                                                        : `${DOC_TYPE_LABELS[String(milestone.dueAtDocType || "").toUpperCase()] || "Document"} required`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-default-600">{Number(milestone.percent || 0)}%</span>
                                                {/* @ts-ignore */}
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={milestone.status === "PAID" ? "success" : milestone.status === "DUE" ? "warning" : "default"}
                                                    className="text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    {milestone.status || "PENDING"}
                                                </Chip>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="text-[10px] font-black uppercase tracking-widest text-default-400">
                                Payments are released upon document verification.
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-divider">
                        <h3 className="text-[10px] font-black text-default-400 uppercase tracking-widest px-1 mb-4">Execution Metadata</h3>
                        <Input
                            label="TRACKING ID"
                            placeholder="HEX-XXX..."
                            value={trackingId}
                            onValueChange={setTrackingId}
                            variant="bordered"
                            classNames={{
                                label: "text-[10px] font-black text-default-400 tracking-widest",
                                input: "text-foreground font-black uppercase text-xs",
                                inputWrapper: "border-divider h-14 bg-default-100/50"
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Core Documents */}
                <div className="bg-default-100/40 border border-divider rounded-3xl p-8 backdrop-blur-xl">
                    <h2 className="text-xs font-black uppercase tracking-widest text-warning-500 mb-8 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning-500 block" /> Order Core Documents
                    </h2>
                    <div className="space-y-3">
                        {orderCoreDocTypes.length === 0 ? (
                            <div className="py-12 border border-dashed border-divider rounded-2xl text-center text-xs font-black text-default-400 uppercase tracking-widest"> No order documents yet </div>
                        ) : (
                            orderCoreDocTypes.map((docType) => {
                                const hasDoc = hasDocType(String(docType || ""));
                                const rule = getDocRule(String(docType || ""));
                                return (
                                    <div key={docType} className="p-4 rounded-xl bg-default-100/50 border border-divider flex items-center justify-between group hover:border-warning-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-1.5 h-1.5 rounded-full ${hasDoc ? 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-warning-500 animate-pulse shadow-[0_0_8px_rgba(245,165,36,0.5)]'}`} />
                                            <div className="text-xs font-black text-foreground uppercase tracking-wider">{DOC_TYPE_LABELS[String(docType || "").toUpperCase()] || String(docType).replaceAll("_", " ")}</div>
                                        </div>
                                        {!hasDoc && rule && canActOnRule(rule) && (
                                            <div className="flex flex-col items-end gap-1">
                                                <Button size="sm" color="warning" variant="flat" className="h-7 text-xs font-black uppercase px-4 rounded-lg" onPress={() => { setDocActionRule(rule); setDocActionOpen(true); }}>
                                                    {String(rule.actionType || "") === "UPLOAD" ? "UPLOAD" : "GENERATE"}
                                                </Button>
                                                {isSystemAdmin && formatActionByLabel(rule?.responsibleRole) && (
                                                    <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest">
                                                        Action by: {formatActionByLabel(rule?.responsibleRole)}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
            {/* @ts-ignore */}
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
