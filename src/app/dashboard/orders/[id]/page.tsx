"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, patchData } from "@/core/api/apiHandler";
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
} from "@nextui-org/react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ORDER_STATUSES = [
    "Procuring",
    "Loaded",
    "In Transit",
    "Arrived",
    "Unloading",
    "Completed",
    "Cancelled",
];

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
    const { id } = useParams();
    const orderId = Array.isArray(id) ? id[0] : id;
    const queryClient = useQueryClient();
    const [logisticsList, setLogisticsList] = useState<any[]>([]);
    const [trackingId, setTrackingId] = useState("");
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
    const enquiryRefId = (order as any)?.enquiry?._id || (order as any)?.enquiry;
    const { data: linkedEnquiry } = useQuery({
        queryKey: ["order-enquiry", enquiryRefId],
        queryFn: () => getData(`${apiRoutes.enquiry.getAll}/${enquiryRefId}`),
        select: (res) => res?.data?.data,
        enabled: Boolean(enquiryRefId),
    });
    // Update Status Mutation
    const updateMutation = useMutation({
        mutationFn: async (payload: any) => {
            return patchData(`${apiRoutes.orders.getAll}/${orderId}`, payload);
        },
        onSuccess: () => {
            toast.success("Order updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["order", id] });
        },
    });

    // Sync state with fetching data
    React.useEffect(() => {
        if (order) {
            setLogisticsList(order.logistics || []);
            setTrackingId(order.trackingId || "");
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

    const handleStatusChange = (newStatus: string) => {
        updateMutation.mutate({ status: newStatus });
    };

    const handleGeneralUpdate = () => {
        if (!milestones.schedulingMode || !milestones.schedulingFinalizedDate) {
            toast.error("Finalize scheduling mode and scheduling date before saving the order plan.");
            return;
        }
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
    const tradeType = String((linkedEnquiry as any)?.executionContext?.tradeType || (order as any)?.enquiry?.executionContext?.tradeType || "DOMESTIC").toUpperCase();
    const isInternational = tradeType === "INTERNATIONAL";
    const isSchedulingFinalized = Boolean(milestones.schedulingFinalizedDate);
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

    if (isLoading) return <div>Loading...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="w-full p-6 flex flex-col gap-6">
            {/* Header */}
            <Card className="w-full bg-gradient-to-r from-blue-900 to-slate-900 text-white">
                <CardHeader className="flex justify-between items-center px-6 py-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold">Order #{orderId?.slice(-6).toUpperCase()}</h1>
                        <span className="opacity-80">
                            Generated from Enquiry #{(order.enquiry?._id || order.enquiry)?.slice(-6).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Chip className="capitalize font-bold" color="primary" size="lg">
                            {order.status}
                        </Chip>
                        <span className="text-xs opacity-70">Last updated: {dayjs(order.updatedAt).fromNow()}</span>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Actions */}
                <Card className="lg:col-span-1">
                    <CardHeader className="font-bold text-lg">Workflow Actions</CardHeader>
                    <Divider />
                    <CardBody className="flex flex-col gap-4">
                        <Select
                            label="Update Status"
                            selectedKeys={[order.status]}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            {ORDER_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </Select>

                        <Input
                            label="Internal Tracking ID"
                            placeholder="e.g. OBA-2024-X100"
                            value={trackingId}
                            onValueChange={setTrackingId}
                        />

                        <Button color="primary" variant="shadow" className="mt-2" onClick={handleGeneralUpdate} isLoading={updateMutation.isPending}>
                            Save Order Plan & Timeline
                        </Button>
                        <p className="text-xs text-default-500">
                            Scheduling mode and finalized date are required before saving execution updates.
                        </p>
                    </CardBody>
                </Card>

                {/* Execution Milestones */}
                <Card className="lg:col-span-2">
                    <CardHeader className="font-bold text-lg">Execution Milestones</CardHeader>
                    <Divider />
                    <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Scheduling Mode"
                            selectedKeys={milestones.schedulingMode ? [milestones.schedulingMode] : []}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys as Set<string>);
                                updateMilestone("schedulingMode", String(arr[0] || ""));
                            }}
                        >
                            <SelectItem key="IMMEDIATE" value="IMMEDIATE">Immediate</SelectItem>
                            <SelectItem key="PLANNED" value="PLANNED">Planned</SelectItem>
                            <SelectItem key="PHASED" value="PHASED">Phased</SelectItem>
                        </Select>
                        <Input
                            type="date"
                            label="Scheduling Finalized Date"
                            value={milestones.schedulingFinalizedDate}
                            onValueChange={(v) => updateMilestone("schedulingFinalizedDate", v)}
                        />
                        <Input
                            className="md:col-span-2"
                            label="Scheduling Notes"
                            placeholder="Plan summary before execution starts"
                            value={milestones.schedulingNotes}
                            onValueChange={(v) => updateMilestone("schedulingNotes", v)}
                        />
                        {!isSchedulingFinalized && (
                            <div className="md:col-span-2 rounded-lg border border-warning-200 bg-warning-50/70 px-3 py-2 text-xs text-warning-700">
                                Finalize scheduling first, then update procurement/quality/packaging/logistics milestones.
                            </div>
                        )}

                        {!!responsibilities.procurementBy && (
                            <>
                                <Input
                                    type="date"
                                    label={`Procurement Date (${getOwnerLabel(responsibilities.procurementBy)})`}
                                    value={milestones.procurementDate}
                                    onValueChange={(v) => updateMilestone("procurementDate", v)}
                                    isDisabled={!isSchedulingFinalized}
                                />
                                <Input
                                    type="date"
                                    label="Source Inspection Date"
                                    value={milestones.procurementInspectionDate}
                                    onValueChange={(v) => updateMilestone("procurementInspectionDate", v)}
                                    isDisabled={!isSchedulingFinalized}
                                />
                                <Input
                                    type="date"
                                    label="Procurement Completed Date"
                                    value={milestones.procurementCompletedDate}
                                    onValueChange={(v) => updateMilestone("procurementCompletedDate", v)}
                                    isDisabled={!isSchedulingFinalized}
                                />
                            </>
                        )}

                        {!!responsibilities.qualityTestingBy && (
                            <>
                                <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-default-200 px-3 py-2">
                                    <span className="text-sm font-medium">Quality Testing Required</span>
                                    <Switch
                                        size="sm"
                                        isSelected={milestones.qualityTestingRequired !== false}
                                        onValueChange={(v) => updateMilestone("qualityTestingRequired", v)}
                                        isDisabled={!isSchedulingFinalized}
                                    />
                                </div>
                                {milestones.qualityTestingRequired !== false && (
                                    <>
                                        <Input
                                            type="date"
                                            label={`Sample Sent to Lab (${getOwnerLabel(responsibilities.qualityTestingBy)})`}
                                            value={milestones.qualitySampleSentDate}
                                            onValueChange={(v) => updateMilestone("qualitySampleSentDate", v)}
                                            isDisabled={!isSchedulingFinalized}
                                        />
                                        <Input
                                            label="Lab Name"
                                            placeholder="e.g. SGS / NABL Lab"
                                            value={milestones.labName}
                                            onValueChange={(v) => updateMilestone("labName", v)}
                                            isDisabled={!isSchedulingFinalized}
                                        />
                                        <Input
                                            type="date"
                                            label="Lab Report Due Date"
                                            value={milestones.labExpectedReportDate}
                                            onValueChange={(v) => updateMilestone("labExpectedReportDate", v)}
                                            isDisabled={!isSchedulingFinalized}
                                        />
                                        <Input
                                            type="date"
                                            label="Lab Report Received Date"
                                            value={milestones.labReportReceivedDate}
                                            onValueChange={(v) => updateMilestone("labReportReceivedDate", v)}
                                            isDisabled={!isSchedulingFinalized}
                                        />
                                        <Input
                                            type="date"
                                            label="Quality Approval Date"
                                            value={milestones.qualityApprovedDate}
                                            onValueChange={(v) => updateMilestone("qualityApprovedDate", v)}
                                            isDisabled={!isSchedulingFinalized}
                                        />
                                    </>
                                )}
                            </>
                        )}

                        {!!responsibilities.packagingBy && (
                            <>
                                <Input
                                    type="date"
                                    label={`Packaging Start Date (${getOwnerLabel(responsibilities.packagingBy)})`}
                                    value={milestones.packagingStartDate}
                                    onValueChange={(v) => updateMilestone("packagingStartDate", v)}
                                    isDisabled={!isSchedulingFinalized}
                                />
                                <Input
                                    type="date"
                                    label="Packaging Completed Date"
                                    value={milestones.packagingCompletedDate}
                                    onValueChange={(v) => updateMilestone("packagingCompletedDate", v)}
                                    isDisabled={!isSchedulingFinalized}
                                />
                            </>
                        )}

                        {!!responsibilities.certificateBy && (
                            <>
                                <Input
                                    type="date"
                                    label={`Certificate Request Date (${getOwnerLabel(responsibilities.certificateBy)})`}
                                    value={milestones.certificateRequestedDate}
                                    onValueChange={(v) => updateMilestone("certificateRequestedDate", v)}
                                    isDisabled={!isSchedulingFinalized}
                                />
                                <Input
                                    type="date"
                                    label="Certificate Issued Date"
                                    value={milestones.certificateIssuedDate}
                                    onValueChange={(v) => updateMilestone("certificateIssuedDate", v)}
                                    isDisabled={!isSchedulingFinalized}
                                />
                            </>
                        )}

                        {!!responsibilities.transportBy && (
                            <Input
                                type="date"
                                label={`Transport Dispatch Date (${getOwnerLabel(responsibilities.transportBy)})`}
                                value={milestones.transportDispatchDate}
                                onValueChange={(v) => updateMilestone("transportDispatchDate", v)}
                                isDisabled={!isSchedulingFinalized}
                            />
                        )}

                        {isInternational && !!responsibilities.shippingBy && (
                            <>
                                <Input
                                    type="date"
                                    label={`Shipping Booked Date (${getOwnerLabel(responsibilities.shippingBy)})`}
                                    value={milestones.shippingBookedDate}
                                    onValueChange={(v) => updateMilestone("shippingBookedDate", v)}
                                    isDisabled={!isSchedulingFinalized}
                                />
                                <Input
                                    type="date"
                                    label="Customs Clearance Date"
                                    value={milestones.customsClearanceDate}
                                    onValueChange={(v) => updateMilestone("customsClearanceDate", v)}
                                    isDisabled={!isSchedulingFinalized}
                                />
                            </>
                        )}
                    </CardBody>
                </Card>

                {/* Responsibility Owners */}
                <Card className="lg:col-span-2">
                    <CardHeader className="font-bold text-lg">Order Responsibilities</CardHeader>
                    <Divider />
                    <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label={`Procurement (${getOwnerLabel(order?.responsibilities?.procurementBy)})`}
                            selectedKeys={responsibilities.procurementBy ? [responsibilities.procurementBy] : []}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys as Set<string>);
                                setResponsibilities((prev: any) => ({ ...prev, procurementBy: arr[0] || "" }));
                            }}
                        >
                            {OWNER_OPTIONS.map((item) => (
                                <SelectItem key={item.key} value={item.key}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </Select>
                        <Select
                            label={`Certificates (${getOwnerLabel(order?.responsibilities?.certificateBy)})`}
                            selectedKeys={responsibilities.certificateBy ? [responsibilities.certificateBy] : []}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys as Set<string>);
                                setResponsibilities((prev: any) => ({ ...prev, certificateBy: arr[0] || "" }));
                            }}
                        >
                            {OWNER_OPTIONS.map((item) => (
                                <SelectItem key={item.key} value={item.key}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </Select>
                        <Select
                            label={`Transportation (${getOwnerLabel(order?.responsibilities?.transportBy)})`}
                            selectedKeys={responsibilities.transportBy ? [responsibilities.transportBy] : []}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys as Set<string>);
                                setResponsibilities((prev: any) => ({ ...prev, transportBy: arr[0] || "" }));
                            }}
                        >
                            {OWNER_OPTIONS.map((item) => (
                                <SelectItem key={item.key} value={item.key}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </Select>
                        {isInternational && (
                            <Select
                                label={`Shipping (${getOwnerLabel(order?.responsibilities?.shippingBy)})`}
                                selectedKeys={responsibilities.shippingBy ? [responsibilities.shippingBy] : []}
                                onSelectionChange={(keys) => {
                                    const arr = Array.from(keys as Set<string>);
                                    setResponsibilities((prev: any) => ({ ...prev, shippingBy: arr[0] || "" }));
                                }}
                            >
                                {OWNER_OPTIONS.map((item) => (
                                    <SelectItem key={item.key} value={item.key}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        )}
                        <Select
                            label={`Packaging (${getOwnerLabel(order?.responsibilities?.packagingBy)})`}
                            selectedKeys={responsibilities.packagingBy ? [responsibilities.packagingBy] : []}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys as Set<string>);
                                setResponsibilities((prev: any) => ({ ...prev, packagingBy: arr[0] || "" }));
                            }}
                        >
                            {OWNER_OPTIONS.map((item) => (
                                <SelectItem key={item.key} value={item.key}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </Select>
                        <Select
                            label={`Quality Testing & Assurance (${getOwnerLabel(order?.responsibilities?.qualityTestingBy)})`}
                            selectedKeys={responsibilities.qualityTestingBy ? [responsibilities.qualityTestingBy] : []}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys as Set<string>);
                                setResponsibilities((prev: any) => ({ ...prev, qualityTestingBy: arr[0] || "" }));
                            }}
                        >
                            {OWNER_OPTIONS.map((item) => (
                                <SelectItem key={item.key} value={item.key}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </CardBody>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader className="font-bold text-lg">Responsibility Layers</CardHeader>
                    <Divider />
                    <CardBody className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {ownerLayers.map((layer) => {
                            const assignedTasks = RESPONSIBILITY_TASKS.filter((task) => {
                                if (task.internationalOnly && !isInternational) return false;
                                return responsibilities?.[task.key] === layer.key;
                            });
                            return (
                                <div key={layer.key} className="rounded-xl border border-default-200 p-4 bg-default-50/30">
                                    <div className="font-semibold mb-3">{layer.title}</div>
                                    {assignedTasks.length === 0 ? (
                                        <p className="text-xs text-default-500">No responsibilities assigned.</p>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {assignedTasks.map((task) => (
                                                <div key={task.key} className="rounded-lg border border-default-200 px-3 py-2">
                                                    <p className="text-sm font-medium">{task.label}</p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {task.dateKeys.map((dateKey) => (
                                                            <Chip key={dateKey} size="sm" variant="flat">
                                                                {MILESTONE_LABELS[dateKey]}: {formatMilestoneDate(milestones?.[dateKey])}
                                                            </Chip>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </CardBody>
                </Card>

                {/* Logistics Details */}
                <Card className="lg:col-span-2">
                    <CardHeader className="font-bold text-lg flex justify-between">
                        <span>Truck Loads & Dispatch</span>
                        <Button size="sm" color="secondary" variant="flat" onPress={addTruck}>+ Add Truck</Button>
                    </CardHeader>
                    <Divider />
                    <CardBody className="flex flex-col gap-8">
                        {logisticsList.length === 0 && (
                            <div className="text-center py-10 text-default-400 italic">
                                No trucks assigned to this order yet.
                            </div>
                        )}
                        {logisticsList.map((truck, index) => (
                            <div key={index} className="p-5 border border-default-200 rounded-2xl relative bg-default-50/50">
                                <div className="absolute top-4 right-4 text-xs font-bold text-default-300 uppercase">
                                    Truck #{index + 1}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <Input
                                        label="Vehicle Number"
                                        placeholder="e.g. KA-01-AB-1234"
                                        value={truck.vehicleNo}
                                        onValueChange={(v) => updateTruck(index, "vehicleNo", v)}
                                    />
                                    <Input
                                        label="Transport Company"
                                        placeholder="e.g. Fast Movers Ltd."
                                        value={truck.transportCompany}
                                        onValueChange={(v) => updateTruck(index, "transportCompany", v)}
                                    />
                                    <Input
                                        label="Driver Name"
                                        value={truck.driverName}
                                        onValueChange={(v) => updateTruck(index, "driverName", v)}
                                    />
                                    <Input
                                        label="Driver Phone"
                                        value={truck.driverPhone}
                                        onValueChange={(v) => updateTruck(index, "driverPhone", v)}
                                    />
                                    <Input
                                        label="Current Location"
                                        className="md:col-span-2"
                                        value={truck.currentLocation}
                                        onValueChange={(v) => updateTruck(index, "currentLocation", v)}
                                    />
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button size="sm" color="danger" variant="light" onPress={() => removeTruck(index)}>Remove Truck</Button>
                                </div>
                            </div>
                        ))}
                    </CardBody>
                </Card>
            </div>

            {/* Documents Section (Initial Placeholder) */}
            <Card>
                <CardHeader className="font-bold text-lg">Documents & Invoices</CardHeader>
                <Divider />
                <CardBody>
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-default-300 rounded-lg text-default-500">
                        <p>Invoice Ninja Integration Pending</p>
                        <Button size="sm" variant="light" color="primary" className="mt-2">Upload Manually</Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
