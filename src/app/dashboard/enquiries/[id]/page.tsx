"use client";

import React, { useState, useContext, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import AuthContext from "@/context/AuthContext";
import { apiRoutes } from "@/core/api/apiRoutes";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Chip,
    Divider,
    Progress,
    useDisclosure,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Select,
    SelectItem,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { FiPackage, FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheckCircle, FiPhone } from "react-icons/fi";

const STATUS_STEPS = [
    "Pending",
    "Supplier Accepted",
    "Buyer Confirmed",
    "Converted",
    "Completed",
    "Cancelled",
];

export default function EnquiryDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [conversionNote, setConversionNote] = useState("");
    const { user } = useContext(AuthContext);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [commitUntil, setCommitUntil] = useState<string>("");
    const [buyerSpecification, setBuyerSpecification] = useState<string>("");

    // Fetch Enquiry Data
    const { data: enquiry, isLoading } = useQuery({
        queryKey: ["enquiry", id],
        queryFn: () => getData(`${apiRoutes.enquiry.getAll}/${id}`),
        select: (res) => res?.data?.data,
    });
    const { data: employees } = useQuery({
        queryKey: ["employees"],
        queryFn: () => getData(apiRoutes.employee.getAll),
        enabled: !!user && (user.role === "Admin" || user.role === "Employee"),
        select: (res) => {
            const raw = res?.data;
            if (Array.isArray(raw)) return raw;
            if (Array.isArray(raw?.data)) return raw.data;
            if (Array.isArray(raw?.data?.data)) return raw.data.data;
            return [];
        },
    });


    // Fetch live variant rate (if linked) for the Market State tracker
    const variantRateId = enquiry?.variantRateId?._id || enquiry?.variantRateId;
    const { data: liveRate } = useQuery({
        queryKey: ["variantRate", variantRateId],
        queryFn: () => getData(`/variant-rates/${variantRateId}`),
        select: (res) => res?.data?.data,
        enabled: !!variantRateId,
    });
    useEffect(() => {
        setBuyerSpecification(enquiry?.specifications || "");
    }, [enquiry?.specifications]);

    // Convert to Order Mutation
    const convertMutation = useMutation({
        mutationFn: async () => {
            const orderRes = await postData(apiRoutes.orders.create, {
                enquiry: id,
                status: "Procuring",
                notes: conversionNote,
                customer: enquiry.customer,
                product: enquiry.productVariant?.product?._id,
                variant: enquiry.productVariant?._id,
                quantity: enquiry.details?.quantity || 1,
            });
            const orderId = orderRes?.data?.data?._id;
            await patchData(`${apiRoutes.enquiry.getAll}/${id}`, {
                status: "Converted",
                order: orderId,
                history: [
                    ...(enquiry.history || []),
                    { status: "Converted", note: conversionNote, timestamp: new Date() },
                ],
            });
            return orderId;
        },
        onSuccess: (orderId) => {
            toast.success("Enquiry converted to Order!");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
            router.push(`/dashboard/orders/${orderId}`);
        },
        onError: () => { toast.error("Failed to convert enquiry."); },
    });

    // Update Status Mutation
    const assignEmployeeMutation = useMutation({
        mutationFn: async () => {
            if (!selectedEmployeeId) return;
            return patchData(`${apiRoutes.enquiry.getAll}/${id}/assign`, {
                employeeId: selectedEmployeeId,
            });
        },
        onSuccess: () => {
            toast.success("Employee assigned successfully");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => {
            toast.error("Failed to assign employee.");
        },
    });

    const commitUntilMutation = useMutation({
        mutationFn: async () => {
            if (!commitUntil) return;
            return patchData(`${apiRoutes.enquiry.getAll}/${id}/commit`, {
                commitUntil,
            });
        },
        onSuccess: () => {
            toast.success("Commit-until date updated.");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => {
            toast.error("Failed to update commit-until date.");
        },
    });

    const sellerAcceptMutation = useMutation({
        mutationFn: async () =>
            patchData(`${apiRoutes.enquiry.getAll}/${id}/seller-accept`, {}),
        onSuccess: () => {
            toast.success("Enquiry accepted by supplier.");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => {
            toast.error("Failed to accept enquiry.");
        },
    });

    const buyerConfirmMutation = useMutation({
        mutationFn: async () =>
            patchData(`${apiRoutes.enquiry.getAll}/${id}/buyer-confirm`, {}),
        onSuccess: () => {
            toast.success("Marked as all good to go.");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => {
            toast.error("Failed to confirm enquiry.");
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: (newStatus: string) =>
            patchData(`${apiRoutes.enquiry.getAll}/${id}`, {
                status: newStatus,
                history: [
                    ...(enquiry.history || []),
                    { status: newStatus, note: `Status changed to ${newStatus}`, timestamp: new Date() },
                ],
            }),
        onSuccess: () => {
            toast.success("Status updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => { toast.error("Failed to update status."); },
    });
    const updateSpecificationMutation = useMutation({
        mutationFn: () =>
            patchData(`${apiRoutes.enquiry.getAll}/${id}`, {
                specifications: buyerSpecification,
            }),
        onSuccess: () => {
            toast.success("Specification updated.");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => { toast.error("Failed to update specification."); },
    });

    if (isLoading) return <div className="flex items-center justify-center h-screen"><Progress isIndeterminate className="max-w-md" /></div>;
    if (!enquiry) return <div className="p-10 text-center">Enquiry not found</div>;

    const normalizedStatus = String(enquiry.status || "").toUpperCase();
    const hasSellerAccepted = Boolean(enquiry.sellerAcceptedAt);
    const hasBuyerConfirmed = Boolean(enquiry.buyerConfirmedAt);
    const isCancelled = normalizedStatus === "CANCELLED";
    const isCompletedFlow = normalizedStatus === "COMPLETED" || normalizedStatus === "CLOSED";
    const isConvertedFlow = normalizedStatus === "CONVERTED";
    const currentStepIndex = (() => {
        if (isCancelled) return STATUS_STEPS.indexOf("Cancelled");
        if (isCompletedFlow) return STATUS_STEPS.indexOf("Completed");
        if (isConvertedFlow) return STATUS_STEPS.indexOf("Converted");
        if (hasBuyerConfirmed) return STATUS_STEPS.indexOf("Buyer Confirmed");
        if (hasSellerAccepted) return STATUS_STEPS.indexOf("Supplier Accepted");
        return STATUS_STEPS.indexOf("Pending");
    })();

    // assignedEmployeeId may be an object or just an ID string; handle both safely
    const assignedEmployeeObj = (enquiry.assignedEmployeeId && typeof enquiry.assignedEmployeeId === 'object') ? enquiry.assignedEmployeeId : null;
    const assignedEmployeeName =
        assignedEmployeeObj?.name ||
        (enquiry as any)?.assignedEmployeeName ||
        (typeof enquiry.assignedEmployeeId === "string" ? "Assigned team member" : "OBAOL Desk");

    // ─── Role Detection ───────────────────────────────────────────────────────
    const isAdmin = user?.role === "Admin" || user?.role === "Employee";
    const isMediator = enquiry?.mediatorAssociateId?._id
        ? enquiry?.mediatorAssociateId?._id.toString() === user?.id?.toString()
        : enquiry?.mediatorAssociateId?.toString() === user?.id?.toString();

    const buyerId = (enquiry as any)?.buyerAssociateId?._id || enquiry?.buyerAssociateId;
    const sellerId = (enquiry as any)?.sellerAssociateId?._id || enquiry?.sellerAssociateId;
    const userIdStr = user?.id?.toString();
    const isBuyer = buyerId && userIdStr && buyerId.toString() === userIdStr;
    const isSeller = sellerId && userIdStr && sellerId.toString() === userIdStr;
    const waitingMessage = (() => {
        if (isCancelled) return "This enquiry was cancelled.";
        if (isCompletedFlow) return "This enquiry is completed.";
        if (!hasSellerAccepted) {
            if (isSeller) return "Action pending from supplier: accept this enquiry to move forward.";
            return "Waiting for supplier to accept this enquiry.";
        }
        if (!hasBuyerConfirmed) {
            if (isBuyer) return "Action pending from buyer: click 'Mark All Good to Go'.";
            return "Waiting for buyer confirmation.";
        }
        if (!isConvertedFlow) return "Waiting for OBAOL team to convert this enquiry into an order.";
        return "Enquiry is converted. Order execution is now in progress.";
    })();
    const showBuyerPanel = isAdmin || isMediator || isSeller;
    const showSupplierPanel = isAdmin || isMediator || isBuyer;
    const partiesTitle = isAdmin || isMediator ? "Parties Involved" : "Counterparty";


    // ─── Financial Calculations ───────────────────────────────────────────────
    const quantity = enquiry.quantity || 0;
    const baseRate = enquiry.rate || 0;
    const adminCommission = enquiry.adminCommission || enquiry.commission || 0;
    const mediatorCommission = enquiry.mediatorCommission || 0;

    // For admins/mediators: show breakdown (base + commissions separately)
    // For associates: the rate already represents the market price — just display it
    const netRate =
        isAdmin || isMediator || isBuyer
            ? baseRate + adminCommission + mediatorCommission
            : isSeller
                ? baseRate
                : baseRate + adminCommission + mediatorCommission;

    const tradeVolume = (quantity * netRate).toLocaleString("en-IN");
    const estimatedProfit = (quantity * adminCommission).toLocaleString("en-IN");

    // ─── Market State (live rate) ─────────────────────────────────────────────
    const liveBaseRate: number = liveRate?.rate || 0;
    const liveNetRate = liveBaseRate + adminCommission + mediatorCommission;
    const priceDelta = liveNetRate - netRate;
    const priceDeltaPct = netRate > 0 ? ((priceDelta / netRate) * 100).toFixed(1) : "0";
    const isLive: boolean = liveRate?.isLive === true;
    const lastRateUpdate = liveRate?.updatedAt ? dayjs(liveRate.updatedAt).format("DD MMM, hh:mm A") : null;

    return (
        <div className="w-full p-6 flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header & Status */}
            <Card className="w-full shadow-md border-none bg-gradient-to-r from-content1 to-default-50">
                <CardHeader className="flex justify-between items-start px-6 py-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold tracking-tight">Enquiry #{(Array.isArray(id) ? id[0] : id)?.slice(-6).toUpperCase()}</h1>
                            <Chip
                                color={enquiry.status === "Converted" ? "success" : enquiry.status === "Cancelled" ? "danger" : "warning"}
                                variant="shadow" size="sm" className="font-bold"
                            >
                                {enquiry.status}
                            </Chip>
                        </div>
                        <span className="text-default-500 text-sm font-medium">
                            Submitted on {dayjs(enquiry.createdAt).format("DD MMM YYYY, hh:mm A")}
                        </span>
                    </div>

                    {/* Role-based action buttons */}
                    <div className="flex gap-2">
                        {isSeller && !enquiry.sellerAcceptedAt && (
                            <Button
                                color="success"
                                variant="flat"
                                isLoading={sellerAcceptMutation.isPending}
                                onPress={() => sellerAcceptMutation.mutate()}
                            >
                                Accept Enquiry
                            </Button>
                        )}
                        {isBuyer && enquiry.sellerAcceptedAt && !enquiry.buyerConfirmedAt && (
                            <Button
                                color="primary"
                                variant="flat"
                                isLoading={buyerConfirmMutation.isPending}
                                onPress={() => buyerConfirmMutation.mutate()}
                            >
                                Mark All Good to Go
                            </Button>
                        )}
                        {isAdmin && (
                            <>
                                {!isConvertedFlow && !isCompletedFlow && !isCancelled && enquiry.sellerAcceptedAt && enquiry.buyerConfirmedAt && (
                                    <Button color="primary" variant="shadow" onPress={onOpen}>
                                        Convert to Order
                                    </Button>
                                )}
                                {enquiry.status === "Converted" && (
                                    <div className="flex gap-2">
                                        <Button color="success" variant="flat"
                                            onPress={() => updateStatusMutation.mutate("Completed")}
                                            isLoading={updateStatusMutation.isPending}>
                                            Complete Enquiry
                                        </Button>
                                        <Button color="secondary" variant="shadow"
                                            onPress={() => router.push(`/dashboard/orders/${enquiry.order}`)}>
                                            View Order
                                        </Button>
                                    </div>
                                )}
                                {enquiry.status !== "Cancelled" && enquiry.status !== "Completed" && (
                                    <Button color="danger" variant="light"
                                        onPress={() => updateStatusMutation.mutate("Cancelled")}
                                        isLoading={updateStatusMutation.isPending}>
                                        Cancel
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="px-6 py-10">
                    {/* Status Stepper */}
                    <div className="relative flex items-center justify-between w-full mb-8 px-2 md:px-4">
                        <div className="absolute top-[15px] left-0 w-full h-[2px] bg-default-200 -z-0" />
                        <div
                            className="absolute top-[15px] left-0 h-[2px] bg-success transition-all duration-1000 -z-0"
                            style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                        />
                        {STATUS_STEPS.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            return (
                                <div key={step} className="flex flex-col items-center gap-2 bg-transparent relative z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCurrent ? "border-primary bg-primary text-white scale-110 shadow-lg" :
                                        isCompleted ? "border-success bg-success text-white" :
                                            "border-default-300 bg-content1 text-default-300"}`}>
                                        {index + 1}
                                    </div>
                                    <span className={`text-xs uppercase tracking-widest font-bold ${isCurrent ? "text-primary shadow-sm" :
                                        isCompleted ? "text-success" : "text-default-400"} text-center leading-tight max-w-[88px]`}>{step}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                        <span className="text-[10px] uppercase font-black tracking-widest text-primary-600">Current Progress</span>
                        <p className="text-sm font-medium text-default-700 mt-1">{waitingMessage}</p>
                    </div>
                </CardBody>
            </Card>

            {/* ── Market State Tracker (only buyer & admin see price-change insights) ───────────────── */}
            {(isAdmin || isBuyer) && (
            <Card className="w-full shadow-sm border border-default-200/50">
                <CardHeader className="flex justify-between items-center px-6 pt-5 pb-0">
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-lg">Market State</span>
                        <span className="text-[10px] uppercase font-black tracking-wider text-default-400">Live product tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {liveRate ? (
                            isLive ? (
                                <span className="flex items-center gap-1.5 text-success text-xs font-black uppercase tracking-widest bg-success/10 px-3 py-1 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> LIVE
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-danger text-xs font-black uppercase tracking-widest bg-danger/10 px-3 py-1 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-danger" /> OFF MARKET
                                </span>
                            )
                        ) : (
                            <span className="text-xs text-default-400 font-medium">No live rate linked</span>
                        )}
                    </div>
                </CardHeader>
                <Divider className="mt-4" />
                <CardBody className="px-6 py-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Enquiry Rate */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-black tracking-widest text-default-400">Enquiry Rate</span>
                            <span className="font-black text-xl text-primary">₹ {netRate} <span className="text-xs font-bold text-default-400">/KG</span></span>
                            <span className="text-xs text-default-400">At time of enquiry</span>
                        </div>

                        {/* Current Market Rate */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-black tracking-widest text-default-400">Current Rate</span>
                            {liveRate ? (
                                <span className="font-black text-xl text-foreground">₹ {liveNetRate} <span className="text-xs font-bold text-default-400">/KG</span></span>
                            ) : (
                                <span className="font-bold text-default-400 text-lg">—</span>
                            )}
                            {lastRateUpdate && <span className="text-xs text-default-400">Updated {lastRateUpdate}</span>}
                        </div>

                        {/* Price Delta */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-black tracking-widest text-default-400">Price Change</span>
                            {liveRate ? (
                                <span className={`flex items-center gap-1.5 font-black text-xl ${priceDelta > 0 ? "text-danger" : priceDelta < 0 ? "text-success" : "text-default-500"}`}>
                                    {priceDelta > 0 ? <FiTrendingUp size={18} /> : priceDelta < 0 ? <FiTrendingDown size={18} /> : null}
                                    {priceDelta > 0 ? "+" : ""}{priceDelta} <span className="text-xs font-bold text-default-400">({priceDeltaPct}%)</span>
                                </span>
                            ) : (
                                <span className="font-bold text-default-400 text-lg">—</span>
                            )}
                        </div>

                        {/* Stock Availability */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-black tracking-widest text-default-400">Stock Status</span>
                            {liveRate ? (
                                isLive ? (
                                    <span className="flex items-center gap-1.5 font-bold text-success">
                                        <FiCheckCircle size={16} /> Available
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 font-bold text-danger">
                                        <FiAlertCircle size={16} /> Unavailable
                                    </span>
                                )
                            ) : (
                                <span className="flex items-center gap-1.5 font-bold text-default-400">
                                    <FiPackage size={16} /> Not Tracked
                                </span>
                            )}
                            {liveRate?.stockNote && (
                                <span className="text-xs text-default-500 mt-1">{liveRate.stockNote}</span>
                            )}
                        </div>
                    </div>

                    {/* Price movement alert */}
                    {liveRate && Math.abs(priceDelta) > 0 && (
                        <div className={`mt-4 flex items-start gap-3 p-3 rounded-xl border text-sm font-medium ${priceDelta > 0
                            ? "bg-danger/5 border-danger/20 text-danger-700"
                            : "bg-success/5 border-success/20 text-success-700"}`}>
                            {priceDelta > 0 ? <FiTrendingUp size={16} className="mt-0.5 flex-shrink-0" /> : <FiTrendingDown size={16} className="mt-0.5 flex-shrink-0" />}
                            <span>
                                Market price has {priceDelta > 0 ? "increased" : "decreased"} by ₹{Math.abs(priceDelta)}/KG ({Math.abs(Number(priceDeltaPct))}%) since this enquiry was created.
                                {priceDelta > 0 ? " Costs may be higher than quoted." : " You may be able to negotiate a better price."}
                            </span>
                        </div>
                    )}
                </CardBody>
            </Card>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Parties Involved */}
                <Card className="md:col-span-1 shadow-sm border-none">
                    <CardHeader className="font-bold text-lg px-6 pt-6">{partiesTitle}</CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="flex flex-col gap-4 px-6 pb-6">
                        <div className="grid grid-cols-1 gap-3">
                            {showBuyerPanel && (
                                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-primary-600">Buyer</span>
                                    <span className="font-semibold text-base">{enquiry.buyerAssociateId?.name || "N/A"}</span>
                                    <span className="text-sm text-default-500 font-medium">{enquiry.buyerAssociateId?.associateCompany?.name || "N/A"}</span>
                                    {enquiry.buyerAssociateId?.phone && isAdmin && (
                                        <span
                                            className="font-medium text-primary hover:underline cursor-pointer text-sm mt-1 flex items-center gap-1"
                                            onClick={() => window.location.href = `tel:${enquiry.buyerAssociateId?.phone}`}
                                        >
                                            <FiPhone size={12} /> {enquiry.buyerAssociateId?.phone}
                                        </span>
                                    )}
                                </div>
                            )}
                            {showSupplierPanel && (
                                <div className="rounded-xl border border-success/20 bg-success/5 p-3 flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-success-700">Supplier</span>
                                    <span className="font-semibold text-base">{enquiry.sellerAssociateId?.name || "N/A"}</span>
                                    <span className="text-sm text-default-500 font-medium">{enquiry.sellerAssociateId?.associateCompany?.name || "N/A"}</span>
                                    {enquiry.sellerAssociateId?.phone && isAdmin && (
                                        <span
                                            className="font-medium text-success hover:underline cursor-pointer text-sm mt-1 flex items-center gap-1"
                                            onClick={() => window.location.href = `tel:${enquiry.sellerAssociateId?.phone}`}
                                        >
                                            <FiPhone size={12} /> {enquiry.sellerAssociateId?.phone}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        {(isBuyer || isSeller) && (
                            <div className="rounded-xl border border-default-200 bg-default-50 p-3">
                                <span className="text-[10px] uppercase font-black tracking-widest text-default-500">
                                    {isBuyer ? "Buyer View" : "Supplier View"}
                                </span>
                                <p className="text-sm font-medium text-default-700 mt-1">{waitingMessage}</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Product Info */}
                <Card className="md:col-span-1 shadow-sm border-none">
                    <CardHeader className="font-bold text-lg px-6 pt-6">Product Details</CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="flex flex-col gap-5 px-6 pb-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Product</span>
                            <span className="font-semibold text-lg">{enquiry.productId?.name || "N/A"}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Rate / KG</span>
                            <span className="font-bold text-success text-xl">₹ {netRate}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Quantity</span>
                            <span className="font-bold text-lg">{enquiry.quantity || 0} Ton</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] uppercase font-bold text-default-400">Buyer Specification</span>
                            {isBuyer ? (
                                <div className="flex gap-2 items-center">
                                    <Input
                                        size="sm"
                                        value={buyerSpecification}
                                        onChange={(e) => setBuyerSpecification(e.target.value)}
                                        placeholder="Add specific requirements..."
                                        className="flex-1"
                                    />
                                    <Button
                                        size="sm"
                                        color="primary"
                                        variant="flat"
                                        isLoading={updateSpecificationMutation.isPending}
                                        isDisabled={buyerSpecification.trim() === (enquiry.specifications || "").trim()}
                                        onPress={() => updateSpecificationMutation.mutate()}
                                    >
                                        Save
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-sm text-default-600">
                                    {enquiry.specifications || "No buyer specification shared yet."}
                                </span>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Pricing Scenario */}
                <Card className="md:col-span-1 shadow-sm border-none bg-success-50/30">
                    <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-2">
                        <span className="font-bold text-lg">Pricing Scenario</span>
                        <span className="text-[10px] uppercase font-black tracking-wider text-success-600">Excludes GST & Transportation</span>
                    </CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="flex flex-col gap-5 px-6 pb-6">
                        {(isAdmin || isMediator) ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-default-500 font-medium">Base Rate (Supplier)</span>
                                    <span className="font-semibold text-foreground">₹ {baseRate}</span>
                                </div>
                                {isAdmin && adminCommission > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-default-500 font-medium">+ OBAOL Margin</span>
                                        <span className="font-semibold text-success">₹ {adminCommission}</span>
                                    </div>
                                )}
                                {mediatorCommission > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-default-500 font-medium">+ Mediator Margin</span>
                                        <span className="font-semibold text-warning-600">₹ {mediatorCommission}</span>
                                    </div>
                                )}
                                <div className="w-full h-[1px] bg-default-200 my-1" />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs uppercase font-black tracking-widest text-default-400">Net Rate / KG</span>
                                    <span className="font-black text-lg text-primary">₹ {netRate}</span>
                                </div>
                                <div className="mt-4 p-4 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-success/20 flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black text-success-600 tracking-widest">Calculated Trade Volume</span>
                                    <span className="font-black text-2xl text-success-700 dark:text-success-400 tracking-tight">
                                        ₹ {tradeVolume}
                                    </span>
                                    <span className="text-xs text-default-500 font-medium mt-1">
                                        {quantity} Ton × ₹ {netRate}
                                    </span>
                                </div>
                                {isAdmin && (
                                    <div className="flex justify-between items-center text-sm bg-success/5 border border-success/20 rounded-lg px-3 py-2 mt-1">
                                        <span className="text-default-500 font-medium">OBAOL Est. Earnings</span>
                                        <span className="font-black text-success">₹ {estimatedProfit}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold text-default-400">Net Rate / KG</span>
                                    <span className="font-black text-xl text-primary">₹ {netRate}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold text-default-400">Total Trade Volume</span>
                                    <span className="font-black text-2xl text-success-600 tracking-tight">₹ {tradeVolume}</span>
                                    <span className="text-xs text-default-400">{quantity} Ton × ₹ {netRate}</span>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Handling & Associates */}
                <Card className="md:col-span-1 shadow-sm border-none">
                    <CardHeader className="font-bold text-lg px-6 pt-6">Handling & Assignment</CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="flex flex-col gap-5 px-6 pb-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Assigned Employee</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${assignedEmployeeName === "OBAOL Desk" ? "bg-default-400" : "bg-primary animate-pulse"}`} />
                                <span className={`font-bold ${assignedEmployeeName === "OBAOL Desk" ? "text-default-500" : "text-primary"}`}>{assignedEmployeeName}</span>
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] uppercase font-bold text-default-400">Assign / Reassign Employee</span>
                                <div className="flex gap-2">
                                    <Select
                                        size="sm"
                                        selectedKeys={selectedEmployeeId ? [selectedEmployeeId] : []}
                                        onSelectionChange={(keys) => {
                                            const arr = Array.from(keys as Set<string>);
                                            setSelectedEmployeeId(arr[0] || "");
                                        }}
                                        className="flex-1"
                                        placeholder="Select employee"
                                    >
                                        {(Array.isArray(employees) ? employees : []).map((emp: any) => (
                                            <SelectItem key={emp._id} value={emp._id}>
                                                {emp.name || emp.firstName || emp.email}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Button
                                        size="sm"
                                        color="primary"
                                        isLoading={assignEmployeeMutation.isPending}
                                        onPress={() => assignEmployeeMutation.mutate()}
                                        isDisabled={!selectedEmployeeId}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        )}
                        {enquiry.supplierCommitUntil && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-default-400">Supplier Commit Until</span>
                                <span className="text-sm font-medium text-default-600">
                                    {dayjs(enquiry.supplierCommitUntil).format("DD MMM YYYY")}
                                </span>
                            </div>
                        )}
                        {isSeller && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] uppercase font-bold text-default-400">Set Commit Until Date</span>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="date"
                                        size="sm"
                                        value={commitUntil}
                                        onChange={(e) => setCommitUntil(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button
                                        size="sm"
                                        color="secondary"
                                        variant="flat"
                                        isLoading={commitUntilMutation.isPending}
                                        onPress={() => commitUntilMutation.mutate()}
                                        isDisabled={!commitUntil}
                                    >
                                        Commit
                                    </Button>
                                </div>
                            </div>
                        )}
                        {enquiry.mediatorAssociateId && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-default-400">Mediator</span>
                                <span className="font-medium text-warning-600">{enquiry.mediatorAssociateId?.name || "N/A"}</span>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Conversion Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Convert to Order</ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to convert this enquiry to an order? This will create a new tracking workflow.</p>
                                <Input
                                    label="Initial Notes"
                                    placeholder="Any specific instructions..."
                                    value={conversionNote}
                                    onValueChange={setConversionNote}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
                                <Button color="primary" onPress={() => convertMutation.mutate()} isLoading={convertMutation.isPending}>
                                    Confirm Conversion
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
