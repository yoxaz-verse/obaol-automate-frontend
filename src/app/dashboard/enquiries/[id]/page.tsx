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
    Textarea,
    Select,
    SelectItem,
    Autocomplete,
    AutocompleteItem,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { FiPackage, FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheckCircle, FiPhone } from "react-icons/fi";
import { useCurrency } from "@/context/CurrencyContext";
import CurrencySelector from "@/components/dashboard/Catalog/currency-selector";

const STATUS_STEPS = [
    "Pending",
    "Supplier Accepted",
    "Buyer Confirmed",
    "Responsibilities Finalized",
    "Converted",
    "Completed",
];

type ResponsibilityPlan = {
    procurementBy: "buyer" | "seller" | "obaol" | "";
    certificateBy: "buyer" | "seller" | "obaol" | "";
    transportBy: "buyer" | "seller" | "obaol" | "";
    shippingBy: "buyer" | "seller" | "obaol" | "";
    packagingBy: "buyer" | "seller" | "obaol" | "";
    qualityTestingBy: "buyer" | "seller" | "obaol" | "";
    cargoInsuranceBy: "buyer" | "seller" | "obaol" | "";
    exportCustomsBy: "buyer" | "seller" | "obaol" | "";
    importCustomsBy: "buyer" | "obaol" | "";
    dutiesTaxesBy: "buyer" | "";
    portHandlingBy: "buyer" | "obaol" | "";
    destinationInlandTransportBy: "buyer" | "obaol" | "";
    destinationInspectionBy: "buyer" | "obaol" | "";
    finalDeliveryConfirmationBy: "obaol" | "";
};
type ExecutionContext = {
    tradeType: "DOMESTIC" | "INTERNATIONAL";
    originCountry: string;
    originState: string;
    originDistrict: string;
    originPort: string;
    destinationCountry: string;
    destinationState: string;
    destinationDistrict: string;
    destinationPort: string;
    routeNotes: string;
};

const OWNER_OPTIONS = [
    { key: "buyer", label: "Buyer" },
    { key: "seller", label: "Supplier" },
    { key: "obaol", label: "OBAOL Team" },
] as const;
const VALID_OWNER_KEYS = new Set(OWNER_OPTIONS.map((item) => item.key));
const sanitizeOwner = (value: any): "buyer" | "seller" | "obaol" => {
    const raw = String(value || "").toLowerCase();
    return VALID_OWNER_KEYS.has(raw as any) ? (raw as "buyer" | "seller" | "obaol") : "obaol";
};
const sanitizeBuyerOrObaol = (value: any): "buyer" | "obaol" => {
    const raw = String(value || "").toLowerCase();
    return raw === "obaol" ? "obaol" : "buyer";
};
const sanitizeBuyerOnly = (_value: any): "buyer" => "buyer";
const sanitizeObaolOnly = (_value: any): "obaol" => "obaol";

export default function EnquiryDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { convertRate } = useCurrency();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [conversionNote, setConversionNote] = useState("");
    const { user } = useContext(AuthContext);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [commitUntil, setCommitUntil] = useState<string>("");
    const [buyerSpecification, setBuyerSpecification] = useState<string>("");
    const [specSavedAt, setSpecSavedAt] = useState<string>("");
    const [responsibilitySavedAt, setResponsibilitySavedAt] = useState<string>("");
    const [executionContext, setExecutionContext] = useState<ExecutionContext>({
        tradeType: "DOMESTIC",
        originCountry: "",
        originState: "",
        originDistrict: "",
        originPort: "",
        destinationCountry: "",
        destinationState: "",
        destinationDistrict: "",
        destinationPort: "",
        routeNotes: "",
    });
    const [responsibilityPlan, setResponsibilityPlan] = useState<ResponsibilityPlan>({
        procurementBy: "",
        certificateBy: "",
        transportBy: "",
        shippingBy: "",
        packagingBy: "",
        qualityTestingBy: "",
        cargoInsuranceBy: "",
        exportCustomsBy: "",
        importCustomsBy: "",
        dutiesTaxesBy: "",
        portHandlingBy: "",
        destinationInlandTransportBy: "",
        destinationInspectionBy: "",
        finalDeliveryConfirmationBy: "",
    });

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
    const { data: incotermResponse } = useQuery({
        queryKey: ["incoterms"],
        queryFn: () => getData(apiRoutes.incoterm.getAll),
    });
    const { data: statesResponse } = useQuery({
        queryKey: ["states"],
        queryFn: () => getData(apiRoutes.state.getAll, { page: 1, limit: 5000 }),
    });
    const { data: districtsResponse } = useQuery({
        queryKey: ["districts"],
        queryFn: () => getData(apiRoutes.district.getAll, { page: 1, limit: 50000 }),
    });
    const { data: countriesResponse } = useQuery({
        queryKey: ["countries"],
        queryFn: () => getData(apiRoutes.country.getAll, { page: 1, limit: 1000 }),
    });
    const { data: originPortsResponse } = useQuery({
        queryKey: ["sea-ports", "origin", executionContext.originCountry],
        queryFn: () =>
            getData(apiRoutes.enquiry.seaPorts, {
                country: executionContext.originCountry,
                page: 1,
                limit: 1000,
            }),
        enabled: executionContext.tradeType === "INTERNATIONAL" && Boolean(executionContext.originCountry),
    });
    const { data: destinationPortsResponse } = useQuery({
        queryKey: ["sea-ports", "destination", executionContext.destinationCountry],
        queryFn: () =>
            getData(apiRoutes.enquiry.seaPorts, {
                country: executionContext.destinationCountry,
                page: 1,
                limit: 1000,
            }),
        enabled: executionContext.tradeType === "INTERNATIONAL" && Boolean(executionContext.destinationCountry),
    });
    const enquirySpecificationValue = (enquiry as any)?.specifications || (enquiry as any)?.specification || "";
    useEffect(() => {
        setBuyerSpecification(enquirySpecificationValue);
    }, [enquirySpecificationValue]);
    useEffect(() => {
        if (!enquiry) return;
        const savedPlan = (enquiry as any)?.responsibilityPlan || {};
        const savedCtx = (enquiry as any)?.executionContext || {};
        setResponsibilityPlan({
            procurementBy: sanitizeOwner(savedPlan.procurementBy),
            certificateBy: sanitizeOwner(savedPlan.certificateBy || savedPlan.exportCustomsBy),
            transportBy: sanitizeOwner(savedPlan.transportBy),
            shippingBy: sanitizeOwner(savedPlan.shippingBy),
            packagingBy: sanitizeOwner(savedPlan.packagingBy),
            qualityTestingBy: sanitizeOwner(savedPlan.qualityTestingBy),
            cargoInsuranceBy: sanitizeOwner(savedPlan.cargoInsuranceBy),
            exportCustomsBy: sanitizeOwner(savedPlan.exportCustomsBy || savedPlan.certificateBy),
            importCustomsBy: sanitizeBuyerOrObaol(savedPlan.importCustomsBy),
            dutiesTaxesBy: sanitizeBuyerOnly(savedPlan.dutiesTaxesBy),
            portHandlingBy: sanitizeBuyerOrObaol(savedPlan.portHandlingBy),
            destinationInlandTransportBy: sanitizeBuyerOrObaol(savedPlan.destinationInlandTransportBy),
            destinationInspectionBy: sanitizeBuyerOrObaol(savedPlan.destinationInspectionBy),
            finalDeliveryConfirmationBy: sanitizeObaolOnly(savedPlan.finalDeliveryConfirmationBy),
        });
        setExecutionContext({
            tradeType: String(savedCtx.tradeType || "DOMESTIC").toUpperCase() === "INTERNATIONAL" ? "INTERNATIONAL" : "DOMESTIC",
            originCountry: savedCtx.originCountry || "",
            originState: savedCtx.originState || "",
            originDistrict: savedCtx.originDistrict || "",
            originPort: savedCtx.originPort || "",
            destinationCountry: savedCtx.destinationCountry || "",
            destinationState: savedCtx.destinationState || "",
            destinationDistrict: savedCtx.destinationDistrict || "",
            destinationPort: savedCtx.destinationPort || "",
            routeNotes: savedCtx.routeNotes || "",
        });
    }, [enquiry]);
    useEffect(() => {
        setResponsibilityPlan((prev) => {
            const next = { ...prev };
            if (!next.dutiesTaxesBy) next.dutiesTaxesBy = "buyer";
            if (!next.finalDeliveryConfirmationBy) next.finalDeliveryConfirmationBy = "obaol";
            if (!next.importCustomsBy) next.importCustomsBy = "buyer";
            if (!next.portHandlingBy) next.portHandlingBy = "buyer";
            if (!next.destinationInlandTransportBy) next.destinationInlandTransportBy = "buyer";
            if (!next.destinationInspectionBy) next.destinationInspectionBy = "buyer";
            if (!next.exportCustomsBy) next.exportCustomsBy = (next.certificateBy as any) || "obaol";
            return next;
        });
    }, [executionContext.tradeType]);

    // Convert to Order Mutation
    const convertMutation = useMutation({
        mutationFn: async () => {
            const enquiryId = Array.isArray(id) ? id[0] : id;
            const normalizedPlan = {
                procurementBy: sanitizeOwner(responsibilityPlan.procurementBy),
                certificateBy: sanitizeOwner(responsibilityPlan.exportCustomsBy || responsibilityPlan.certificateBy),
                transportBy: sanitizeOwner(responsibilityPlan.transportBy),
                shippingBy: sanitizeOwner(responsibilityPlan.shippingBy),
                packagingBy: sanitizeOwner(responsibilityPlan.packagingBy),
                qualityTestingBy: sanitizeOwner(responsibilityPlan.qualityTestingBy),
                cargoInsuranceBy: sanitizeOwner(responsibilityPlan.shippingBy || responsibilityPlan.cargoInsuranceBy),
                exportCustomsBy: sanitizeOwner(responsibilityPlan.exportCustomsBy || responsibilityPlan.certificateBy),
                importCustomsBy: sanitizeBuyerOrObaol(responsibilityPlan.importCustomsBy),
                dutiesTaxesBy: sanitizeBuyerOnly(responsibilityPlan.dutiesTaxesBy),
                portHandlingBy: sanitizeBuyerOrObaol(responsibilityPlan.portHandlingBy),
                destinationInlandTransportBy: sanitizeBuyerOrObaol(responsibilityPlan.destinationInlandTransportBy),
                destinationInspectionBy: sanitizeBuyerOrObaol(responsibilityPlan.destinationInspectionBy),
                finalDeliveryConfirmationBy: sanitizeObaolOnly(responsibilityPlan.finalDeliveryConfirmationBy),
            };
            const orderRes = await postData(apiRoutes.orders.create, {
                enquiry: enquiryId,
                status: "Procuring",
                notes: conversionNote,
                customer: enquiry.customer,
                product: enquiry.productVariant?.product?._id,
                variant: enquiry.productVariant?._id,
                quantity: enquiry.details?.quantity || 1,
                responsibilities: {
                    procurementBy: normalizedPlan.procurementBy,
                    certificateBy: normalizedPlan.certificateBy,
                    transportBy: normalizedPlan.transportBy,
                    shippingBy: normalizedPlan.shippingBy,
                    packagingBy: normalizedPlan.packagingBy,
                    qualityTestingBy: normalizedPlan.qualityTestingBy,
                },
            });
            const resBody = (orderRes as any)?.data;
            let orderId = resBody?.data?._id || resBody?._id;

            if (!orderId || !/^[a-f0-9]{24}$/i.test(String(orderId))) {
                const listRes = await getData(apiRoutes.orders.getAll, { page: 1, limit: 100, sort: "createdAt:desc" });
                const listBody = (listRes as any)?.data;
                const rows = Array.isArray(listBody?.data?.data)
                    ? listBody.data.data
                    : Array.isArray(listBody?.data)
                        ? listBody.data
                        : Array.isArray(listBody)
                            ? listBody
                            : [];
                const matched = rows.find((row: any) => {
                    const rowEnquiryId = (row?.enquiry?._id || row?.enquiry || "").toString();
                    return rowEnquiryId === String(enquiryId);
                });
                orderId = matched?._id;
            }
            if (!orderId || !/^[a-f0-9]{24}$/i.test(String(orderId))) {
                throw new Error("Order created but valid order ID could not be resolved.");
            }
            return String(orderId);
        },
        onSuccess: (orderId) => {
            toast.success("Enquiry converted to Order!");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
            router.push(`/dashboard/orders/${orderId}`);
        },
        onError: () => { toast.error("Failed to convert enquiry."); },
    });
    const employeeOptions = Array.isArray(employees) ? employees : [];
    const countryRowsForCheck = Array.isArray(countriesResponse?.data?.data?.data)
        ? countriesResponse.data.data.data
        : Array.isArray(countriesResponse?.data?.data?.docs)
            ? countriesResponse.data.data.docs
            : Array.isArray(countriesResponse?.data?.data)
                ? countriesResponse.data.data
                : Array.isArray(countriesResponse?.data?.docs)
                    ? countriesResponse.data.docs
                    : Array.isArray(countriesResponse?.data)
                        ? countriesResponse.data
                        : Array.isArray(countriesResponse)
                            ? countriesResponse
                            : [];
    const getCountryNameById = (countryId: string) =>
        countryRowsForCheck.find((c: any) => String(c?._id || c?.id || "") === String(countryId || ""))?.name || "";
    const isIndiaName = (name: string) => String(name || "").trim().toLowerCase() === "india";
    const isFromIndia = executionContext.tradeType === "INTERNATIONAL" && isIndiaName(getCountryNameById(executionContext.originCountry));
    const isToIndia = executionContext.tradeType === "INTERNATIONAL" && isIndiaName(getCountryNameById(executionContext.destinationCountry));
    const allowedResponsibilityValues: Record<string, Set<string>> = {
        procurementBy: new Set(["buyer", "seller", "obaol"]),
        qualityTestingBy: new Set(["buyer", "seller", "obaol"]),
        packagingBy: new Set(["buyer", "seller", "obaol"]),
        transportBy: new Set(["buyer", "seller", "obaol"]),
        shippingBy: new Set(["buyer", "seller", "obaol"]),
        cargoInsuranceBy: new Set(["buyer", "seller", "obaol"]),
        exportCustomsBy: new Set(["buyer", "seller", "obaol"]),
        importCustomsBy: new Set(["buyer", "obaol"]),
        dutiesTaxesBy: new Set(["buyer"]),
        portHandlingBy: new Set(["buyer", "obaol"]),
        destinationInlandTransportBy: new Set(["buyer", "obaol"]),
        destinationInspectionBy: new Set(["buyer", "obaol"]),
        finalDeliveryConfirmationBy: new Set(["obaol"]),
    };
    const domesticRequiredResponsibilities = [
        "procurementBy",
        "qualityTestingBy",
        "packagingBy",
        "transportBy",
    ];
    const internationalRequiredResponsibilities = [
        "shippingBy",
        ...(isFromIndia ? ["exportCustomsBy"] : []),
        ...(isToIndia
            ? [
                "importCustomsBy",
                "dutiesTaxesBy",
                "portHandlingBy",
                "destinationInlandTransportBy",
                "destinationInspectionBy",
                "finalDeliveryConfirmationBy",
            ]
            : []),
    ];
    const requiredResponsibilityKeys = executionContext.tradeType === "INTERNATIONAL"
        ? [...domesticRequiredResponsibilities, ...internationalRequiredResponsibilities]
        : domesticRequiredResponsibilities;
    const hasFullResponsibilityPlan = requiredResponsibilityKeys.every((key) =>
        allowedResponsibilityValues[key]?.has(String((responsibilityPlan as any)[key] || ""))
    );

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
    const finalizeResponsibilitiesMutation = useMutation({
        mutationFn: async () =>
            patchData(`${apiRoutes.enquiry.getAll}/${id}/finalize-responsibilities`, { executionContext }),
        onSuccess: () => {
            toast.success("Responsibilities finalized and execution inquiries generated.");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => {
            toast.error("Failed to finalize responsibilities.");
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
        mutationFn: () => {
            const oldSpec = ((enquiry as any).specifications || (enquiry as any).specification || "").trim();
            const newSpec = (buyerSpecification || "").trim();
            const actor = (user as any)?.name || (user as any)?.email || "User";
            const productName = enquiry?.productId?.name || enquiry?.productVariant?.product?.name || "Unknown Product";
            const variantName = enquiry?.productVariant?.name || enquiry?.variantId?.name || "Unknown Variant";

            return patchData(`${apiRoutes.enquiry.getAll}/${id}`, {
                specifications: buyerSpecification,
                history: [
                    ...(enquiry.history || []),
                    {
                        status: enquiry.status || "Pending",
                        note: `Specification updated by ${actor} for ${productName} - ${variantName}: "${oldSpec || "Empty"}" -> "${newSpec || "Empty"}"`,
                        timestamp: new Date(),
                    },
                ],
            });
        },
        onSuccess: () => {
            toast.success("Specification updated.");
            setSpecSavedAt(new Date().toISOString());
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => { toast.error("Failed to update specification."); },
    });
    const updateResponsibilityPlanMutation = useMutation({
        mutationFn: () => {
            const actor = (user as any)?.name || (user as any)?.email || "User";
            const oldPlan = (enquiry as any)?.responsibilityPlan || {};
            const productName = enquiry?.productId?.name || enquiry?.productVariant?.product?.name || "Unknown Product";
            const variantName = enquiry?.productVariant?.name || enquiry?.variantId?.name || "Unknown Variant";
            const normalizedPlan = {
                procurementBy: sanitizeOwner(responsibilityPlan.procurementBy),
                certificateBy: sanitizeOwner(responsibilityPlan.exportCustomsBy || responsibilityPlan.certificateBy),
                transportBy: sanitizeOwner(responsibilityPlan.transportBy),
                shippingBy: sanitizeOwner(responsibilityPlan.shippingBy),
                packagingBy: sanitizeOwner(responsibilityPlan.packagingBy),
                qualityTestingBy: sanitizeOwner(responsibilityPlan.qualityTestingBy),
                cargoInsuranceBy: sanitizeOwner(responsibilityPlan.shippingBy || responsibilityPlan.cargoInsuranceBy),
                exportCustomsBy: sanitizeOwner(responsibilityPlan.exportCustomsBy || responsibilityPlan.certificateBy),
                importCustomsBy: sanitizeBuyerOrObaol(responsibilityPlan.importCustomsBy),
                dutiesTaxesBy: sanitizeBuyerOnly(responsibilityPlan.dutiesTaxesBy),
                portHandlingBy: sanitizeBuyerOrObaol(responsibilityPlan.portHandlingBy),
                destinationInlandTransportBy: sanitizeBuyerOrObaol(responsibilityPlan.destinationInlandTransportBy),
                destinationInspectionBy: sanitizeBuyerOrObaol(responsibilityPlan.destinationInspectionBy),
                finalDeliveryConfirmationBy: sanitizeObaolOnly(responsibilityPlan.finalDeliveryConfirmationBy),
            };
            return patchData(`${apiRoutes.enquiry.getAll}/${id}`, {
                responsibilityPlan: normalizedPlan,
                executionContext,
                history: [
                    ...(enquiry.history || []),
                    {
                        status: enquiry.status || "Pending",
                        note: `Responsibility plan updated by ${actor} for ${productName} - ${variantName}: ${JSON.stringify(oldPlan)} -> ${JSON.stringify(normalizedPlan)} | Context: ${JSON.stringify(executionContext)}`,
                        timestamp: new Date(),
                    },
                ],
            });
        },
        onSuccess: () => {
            toast.success("Responsibility plan saved.");
            setResponsibilitySavedAt(new Date().toISOString());
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => {
            toast.error("Failed to save responsibility plan.");
        },
    });

    if (isLoading) return <div className="flex items-center justify-center h-screen"><Progress isIndeterminate className="max-w-md" /></div>;
    if (!enquiry) return <div className="p-10 text-center">Enquiry not found</div>;

    const normalizedStatus = String(enquiry.status || "").toUpperCase();
    const hasSellerAccepted = Boolean(enquiry.sellerAcceptedAt);
    const hasBuyerConfirmed = Boolean(enquiry.buyerConfirmedAt);
    const hasResponsibilitiesFinalized = Boolean((enquiry as any).responsibilitiesFinalizedAt);
    const isCancelled = normalizedStatus === "CANCELLED";
    const isCompletedFlow = normalizedStatus === "COMPLETED" || normalizedStatus === "CLOSED";
    const isConvertedFlow = normalizedStatus === "CONVERTED";
    const initialPlan = (enquiry as any)?.responsibilityPlan || {};
    const currentStepIndex = (() => {
        if (isCompletedFlow) return STATUS_STEPS.indexOf("Completed");
        if (isConvertedFlow) return STATUS_STEPS.indexOf("Converted");
        if (hasResponsibilitiesFinalized) return STATUS_STEPS.indexOf("Responsibilities Finalized");
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
    const buyerAssociateObj = typeof (enquiry as any)?.buyerAssociateId === "object" ? (enquiry as any).buyerAssociateId : null;
    const sellerAssociateObj = typeof (enquiry as any)?.sellerAssociateId === "object" ? (enquiry as any).sellerAssociateId : null;
    const extractAssociateCompanyName = (associate: any, fallbackField: string) =>
        associate?.associateCompany?.name ||
        associate?.associateCompanyId?.name ||
        associate?.company?.name ||
        (enquiry as any)?.[fallbackField] ||
        "N/A";
    const buyerAssociateName =
        buyerAssociateObj?.name ||
        (enquiry as any)?.buyerAssociateName ||
        (enquiry as any)?.buyerName ||
        (typeof buyerId === "string" ? `Associate (${buyerId.slice(-6)})` : "N/A");
    const sellerAssociateName =
        sellerAssociateObj?.name ||
        (enquiry as any)?.sellerAssociateName ||
        (enquiry as any)?.sellerName ||
        (typeof sellerId === "string" ? `Associate (${sellerId.slice(-6)})` : "N/A");
    const buyerCompanyName = extractAssociateCompanyName(buyerAssociateObj, "buyerAssociateCompanyName");
    const sellerCompanyName = extractAssociateCompanyName(sellerAssociateObj, "sellerAssociateCompanyName");
    const buyerPhone = buyerAssociateObj?.phone || (enquiry as any)?.buyerPhone || null;
    const sellerPhone = sellerAssociateObj?.phone || (enquiry as any)?.sellerPhone || null;
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
        if (!hasResponsibilitiesFinalized) return "Waiting for responsibility finalization to generate execution inquiries.";
        if (!isConvertedFlow) return "Waiting for OBAOL team to convert this enquiry into an order.";
        return "Enquiry is converted. Order execution is now in progress.";
    })();
    const isAssociateResponsibilityLocked = hasResponsibilitiesFinalized && !isAdmin;
    const canEditResponsibilityPlan = (isAdmin || isBuyer || isSeller) && !isAssociateResponsibilityLocked;
    const transportOwner = sanitizeOwner(responsibilityPlan.transportBy || initialPlan.transportBy || "obaol");
    const buyerHandlesTransport = transportOwner === "buyer";
    const sellerHandlesTransport = transportOwner === "seller";
    const showOriginLogisticsFields = isAdmin || (isSeller && sellerHandlesTransport);
    const showDestinationLogisticsFields = isAdmin || (isBuyer && buyerHandlesTransport);
    const canEditOriginLogistics = showOriginLogisticsFields && canEditResponsibilityPlan;
    const canEditDestinationLogistics = showDestinationLogisticsFields && canEditResponsibilityPlan;
    const canEditRouteNotes = canEditResponsibilityPlan && (isAdmin || (isBuyer && buyerHandlesTransport) || (isSeller && sellerHandlesTransport));
    const hasExecutionContext = executionContext.tradeType === "DOMESTIC"
        ? Boolean(executionContext.originState.trim()) &&
        Boolean(executionContext.originDistrict.trim()) &&
        Boolean(executionContext.destinationState.trim()) &&
        Boolean(executionContext.destinationDistrict.trim())
        : Boolean(executionContext.originCountry.trim()) &&
        Boolean(executionContext.originPort.trim()) &&
        Boolean(executionContext.destinationCountry.trim()) &&
        Boolean(executionContext.destinationPort.trim());
    const canConvert =
        hasFullResponsibilityPlan &&
        hasSellerAccepted &&
        hasBuyerConfirmed &&
        hasResponsibilitiesFinalized;
    const initialExecutionContext = (() => {
        const raw = (enquiry as any)?.executionContext || {};
        return {
            tradeType: String(raw.tradeType || "DOMESTIC").toUpperCase() === "INTERNATIONAL" ? "INTERNATIONAL" : "DOMESTIC",
            originCountry: String(raw.originCountry || ""),
            originState: String(raw.originState || ""),
            originDistrict: String(raw.originDistrict || ""),
            originPort: String(raw.originPort || ""),
            destinationCountry: String(raw.destinationCountry || ""),
            destinationState: String(raw.destinationState || ""),
            destinationDistrict: String(raw.destinationDistrict || ""),
            destinationPort: String(raw.destinationPort || ""),
            routeNotes: String(raw.routeNotes || ""),
        } as ExecutionContext;
    })();
    const normalizeExecutionContext = (ctx: ExecutionContext): ExecutionContext => ({
        tradeType: ctx.tradeType === "INTERNATIONAL" ? "INTERNATIONAL" : "DOMESTIC",
        originCountry: String(ctx.originCountry || ""),
        originState: String(ctx.originState || ""),
        originDistrict: String(ctx.originDistrict || ""),
        originPort: String(ctx.originPort || ""),
        destinationCountry: String(ctx.destinationCountry || ""),
        destinationState: String(ctx.destinationState || ""),
        destinationDistrict: String(ctx.destinationDistrict || ""),
        destinationPort: String(ctx.destinationPort || ""),
        routeNotes: String(ctx.routeNotes || ""),
    });
    const isResponsibilityPlanChanged =
        (responsibilityPlan.procurementBy || "") !== (initialPlan.procurementBy || "") ||
        (responsibilityPlan.certificateBy || "") !== (initialPlan.certificateBy || "") ||
        (responsibilityPlan.transportBy || "") !== (initialPlan.transportBy || "") ||
        (responsibilityPlan.shippingBy || "") !== (initialPlan.shippingBy || "") ||
        (responsibilityPlan.packagingBy || "") !== (initialPlan.packagingBy || "") ||
        (responsibilityPlan.qualityTestingBy || "") !== (initialPlan.qualityTestingBy || "") ||
        (responsibilityPlan.exportCustomsBy || "") !== (initialPlan.exportCustomsBy || initialPlan.certificateBy || "") ||
        (responsibilityPlan.importCustomsBy || "") !== (initialPlan.importCustomsBy || "") ||
        (responsibilityPlan.dutiesTaxesBy || "") !== (initialPlan.dutiesTaxesBy || "") ||
        (responsibilityPlan.portHandlingBy || "") !== (initialPlan.portHandlingBy || "") ||
        (responsibilityPlan.destinationInlandTransportBy || "") !== (initialPlan.destinationInlandTransportBy || "") ||
        (responsibilityPlan.destinationInspectionBy || "") !== (initialPlan.destinationInspectionBy || "") ||
        (responsibilityPlan.finalDeliveryConfirmationBy || "") !== (initialPlan.finalDeliveryConfirmationBy || "");
    const isExecutionContextChanged =
        JSON.stringify(normalizeExecutionContext(executionContext)) !==
        JSON.stringify(normalizeExecutionContext(initialExecutionContext));
    const isResponsibilityEventChanged = isResponsibilityPlanChanged || isExecutionContextChanged;
    const productNameLabel = enquiry?.productId?.name || enquiry?.productVariant?.product?.name || "Unknown Product";
    const variantNameLabel = enquiry?.productVariant?.name || enquiry?.variantId?.name || "Unknown Variant";
    // ─── Financial Calculations ───────────────────────────────────────────────
    const quantity = enquiry.quantity || 0;
    const quantityKg = quantity * 1000;
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

    const tradeVolume = quantityKg * netRate;
    const estimatedProfit = quantityKg * adminCommission;

    // ─── Market State (live rate) ─────────────────────────────────────────────
    const liveBaseRate: number = liveRate?.rate || 0;
    const liveNetRate = liveBaseRate + adminCommission + mediatorCommission;
    const priceDelta = liveNetRate - netRate;
    const priceDeltaPct = netRate > 0 ? ((priceDelta / netRate) * 100).toFixed(1) : "0";
    const isLive: boolean = liveRate?.isLive === true;
    const lastRateUpdate = liveRate?.updatedAt ? dayjs(liveRate.updatedAt).format("DD MMM, hh:mm A") : null;
    const enquiryOrderId = (enquiry as any)?.order?._id || (enquiry as any)?.order || null;
    const incotermOptions = Array.isArray(incotermResponse?.data?.data?.data)
        ? incotermResponse.data.data.data
        : Array.isArray(incotermResponse?.data?.data)
            ? incotermResponse.data.data
            : Array.isArray(incotermResponse?.data)
                ? incotermResponse.data
                : [];
    const parseMasterRows = (raw: any): any[] => {
        if (Array.isArray(raw?.data?.data?.data)) return raw.data.data.data;
        if (Array.isArray(raw?.data?.data?.docs)) return raw.data.data.docs;
        if (Array.isArray(raw?.data?.data)) return raw.data.data;
        if (Array.isArray(raw?.data?.docs)) return raw.data.docs;
        if (Array.isArray(raw?.data)) return raw.data;
        if (Array.isArray(raw)) return raw;
        return [];
    };
    const getEntityId = (value: any): string => String(value?._id || value?.id || value || "");
    const states = parseMasterRows(statesResponse).filter((item: any) => !item?.isDeleted);
    const districts = parseMasterRows(districtsResponse).filter((item: any) => !item?.isDeleted);
    const countries = parseMasterRows(countriesResponse).filter((item: any) => !item?.isDeleted);
    const originSeaPorts = parseMasterRows(originPortsResponse).filter((item: any) => !item?.isDeleted);
    const destinationSeaPorts = parseMasterRows(destinationPortsResponse).filter((item: any) => !item?.isDeleted);
    const originDistrictOptions = districts.filter((item: any) => getEntityId(item?.state) === executionContext.originState);
    const destinationDistrictOptions = districts.filter((item: any) => getEntityId(item?.state) === executionContext.destinationState);
    const originPortOptions = originSeaPorts;
    const destinationPortOptions = destinationSeaPorts;
    const preferredIncoterm = (() => {
        const raw = (enquiry as any)?.preferredIncoterm || (enquiry as any)?.preferredIncotermId;
        if (!raw) return null;
        if (typeof raw === "object") {
            const code = raw.code || "";
            const name = raw.name || "";
            return [code, name].filter(Boolean).join(" — ") || "N/A";
        }
        const found = incotermOptions.find((it: any) => it?._id?.toString() === raw?.toString());
        if (!found) return /^[a-f0-9]{24}$/i.test(String(raw)) ? "Not specified" : String(raw);
        return [found.code, found.name].filter(Boolean).join(" — ");
    })();
    const specificationTextRaw = (enquiry as any).specifications || (enquiry as any).specification || "";
    const specificationText = String(specificationTextRaw).replace(/\s+Notes:/i, "\nNotes:");
    const specChangeHistory = (enquiry.history || []).filter((h: any) =>
        String(h?.note || "").toLowerCase().includes("specification updated")
    );
    const ownerLabelByKey: Record<string, string> = {
        buyer: "Buyer",
        seller: "Supplier",
        obaol: "Our Team",
    };
    const getOwnerOptions = (allowedKeys: string[]) =>
        allowedKeys.map((key) => ({ key, label: ownerLabelByKey[key] || key }));
    const responsibilityFieldConfig = [
        { key: "procurementBy", label: "Procurement / Sourcing", allowed: ["buyer", "seller", "obaol"], show: true },
        { key: "qualityTestingBy", label: "Quality Testing", allowed: ["buyer", "seller", "obaol"], show: true },
        { key: "packagingBy", label: "Packaging & Labelling", allowed: ["buyer", "seller", "obaol"], show: true },
        { key: "transportBy", label: "Inland Transportation", allowed: ["buyer", "seller", "obaol"], show: true },
        { key: "shippingBy", label: "Freight Forwarding & Shipping", allowed: ["buyer", "seller", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" },
        { key: "exportCustomsBy", label: "Export Customs Clearance", allowed: ["buyer", "seller", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isFromIndia },
        { key: "importCustomsBy", label: "Import Customs Clearance", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia },
        { key: "dutiesTaxesBy", label: "Duties & Taxes", allowed: ["buyer"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia },
        { key: "portHandlingBy", label: "Port Handling", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia },
        { key: "destinationInlandTransportBy", label: "Inland Transport (Port → Warehouse)", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia },
        { key: "destinationInspectionBy", label: "Destination Inspection", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia },
        { key: "finalDeliveryConfirmationBy", label: "Final Delivery Confirmation", allowed: ["obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia },
    ].filter((f) => f.show);

    return (
        <div className="w-full p-3 sm:p-4 md:p-6 flex flex-col gap-4 md:gap-6 max-w-none mx-0">
            {/* Header & Status */}
            <Card className="w-full shadow-md border-none bg-gradient-to-r from-content1 to-default-50">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 md:px-6 py-4 md:py-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight break-all">Enquiry #{(Array.isArray(id) ? id[0] : id)?.slice(-6).toUpperCase()}</h1>
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
                    <div className="flex flex-wrap gap-2 w-full md:w-auto md:justify-end">
                        {isSeller && !enquiry.sellerAcceptedAt && (
                            <Button
                                color="success"
                                variant="flat"
                                className="w-full sm:w-auto"
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
                                className="w-full sm:w-auto"
                                isLoading={buyerConfirmMutation.isPending}
                                onPress={() => buyerConfirmMutation.mutate()}
                            >
                                Mark All Good to Go
                            </Button>
                        )}
                        {isAdmin && !enquiry.sellerAcceptedAt && (
                            <Button
                                color="success"
                                variant="flat"
                                className="w-full sm:w-auto"
                                isLoading={sellerAcceptMutation.isPending}
                                onPress={() => sellerAcceptMutation.mutate()}
                            >
                                Supplier Accept
                            </Button>
                        )}
                        {isAdmin && enquiry.sellerAcceptedAt && !enquiry.buyerConfirmedAt && (
                            <Button
                                color="primary"
                                variant="flat"
                                className="w-full sm:w-auto"
                                isLoading={buyerConfirmMutation.isPending}
                                onPress={() => buyerConfirmMutation.mutate()}
                            >
                                Buyer Confirm
                            </Button>
                        )}
                        {isAdmin && (
                            <>
                                {!isConvertedFlow && !isCompletedFlow && !isCancelled && enquiry.sellerAcceptedAt && enquiry.buyerConfirmedAt && (
                                    <>
                                        {!hasResponsibilitiesFinalized && (
                                            <Button
                                                color="warning"
                                                variant="shadow"
                                                className="w-full sm:w-auto"
                                                isLoading={finalizeResponsibilitiesMutation.isPending}
                                                isDisabled={!hasExecutionContext || !hasFullResponsibilityPlan}
                                                onPress={() => finalizeResponsibilitiesMutation.mutate()}
                                            >
                                                Finalize Responsibilities
                                            </Button>
                                        )}
                                        <Button color="primary" variant="shadow" className="w-full sm:w-auto" onPress={onOpen} isDisabled={!hasResponsibilitiesFinalized}>
                                            Convert to Order
                                        </Button>
                                        {hasResponsibilitiesFinalized && (
                                            <Button color="secondary" variant="flat" className="w-full sm:w-auto" onPress={() => router.push("/dashboard/execution-enquiries")}>
                                                Open Execution Panel
                                            </Button>
                                        )}
                                    </>
                                )}
                                {enquiry.status === "Converted" && (
                                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                        <Button color="success" variant="flat" className="w-full sm:w-auto"
                                            onPress={() => updateStatusMutation.mutate("Completed")}
                                            isLoading={updateStatusMutation.isPending}>
                                            Complete Enquiry
                                        </Button>
                                        <Button color="secondary" variant="shadow" className="w-full sm:w-auto"
                                            isDisabled={!enquiryOrderId}
                                            onPress={() => enquiryOrderId && router.push(`/dashboard/orders/${enquiryOrderId}`)}>
                                            View Order
                                        </Button>
                                    </div>
                                )}
                                {enquiry.status !== "Cancelled" && enquiry.status !== "Completed" && (
                                    <Button color="danger" variant="light" className="w-full sm:w-auto"
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
                <CardBody className="px-4 md:px-6 py-6 md:py-10">
                    {/* Status Stepper */}
                    <div className="flex flex-wrap items-center gap-2 mb-5">
                        {STATUS_STEPS.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            return (
                                <React.Fragment key={step}>
                                    <div
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${isCurrent
                                            ? "bg-primary text-white border-primary"
                                            : isCompleted
                                                ? "bg-success/10 text-success-700 border-success/30"
                                                : "bg-default-100 text-default-500 border-default-200"
                                            }`}
                                    >
                                        {step}
                                    </div>
                                    {index < STATUS_STEPS.length - 1 && (
                                        <span className="text-default-300 text-xs">→</span>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase font-black tracking-widest text-primary-600">Current Progress</span>
                            {isCancelled && <Chip size="sm" color="danger" variant="flat">Cancelled</Chip>}
                        </div>
                        <p className="text-sm font-medium text-default-700 mt-1">{waitingMessage}</p>
                    </div>
                </CardBody>
            </Card>

            {/* ── Market State Tracker (only buyer & admin see price-change insights) ───────────────── */}
            {(isAdmin || isBuyer) && (
                <Card className="w-full shadow-sm border border-default-200/50">
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 md:px-6 pt-4 md:pt-5 pb-0">
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
                    <CardBody className="px-4 md:px-6 py-4 md:py-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {/* Enquiry Rate */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-black tracking-widest text-default-400">Enquiry Rate</span>
                                <span className="font-black text-xl text-primary">{convertRate(netRate)} <span className="text-xs font-bold text-default-400">/KG</span></span>
                                <span className="text-xs text-default-400">At time of enquiry</span>
                            </div>

                            {/* Current Market Rate */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-black tracking-widest text-default-400">Current Rate</span>
                                {liveRate ? (
                                    <span className="font-black text-xl text-foreground">{convertRate(liveNetRate)} <span className="text-xs font-bold text-default-400">/KG</span></span>
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
                                        {priceDelta > 0 ? "+" : ""}{convertRate(Math.abs(priceDelta))} <span className="text-xs font-bold text-default-400">({priceDeltaPct}%)</span>
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
                                    Market price has {priceDelta > 0 ? "increased" : "decreased"} by {convertRate(Math.abs(priceDelta))}/KG ({Math.abs(Number(priceDeltaPct))}%) since this enquiry was created.
                                    {priceDelta > 0 ? " Costs may be higher than quoted." : " You may be able to negotiate a better price."}
                                </span>
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Details Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Parties Involved */}
                {(isAdmin || isMediator) && (
                    <Card className="md:col-span-1 shadow-sm border-none">
                        <CardHeader className="font-semibold text-base px-4 md:px-6 pt-4 md:pt-6">Parties Involved</CardHeader>
                        <Divider className="my-2" />
                        <CardBody className="flex flex-col gap-4 px-4 md:px-6 pb-4 md:pb-6">
                            <div className="grid grid-cols-1 gap-3">
                                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-primary-600">Buyer</span>
                                    <span className="font-semibold text-base">{buyerAssociateName}</span>
                                    <span className="text-sm text-default-500 font-medium">{buyerCompanyName}</span>
                                    {buyerPhone && isAdmin && (
                                        <span
                                            className="font-medium text-primary hover:underline cursor-pointer text-sm mt-1 flex items-center gap-1"
                                            onClick={() => window.location.href = `tel:${buyerPhone}`}
                                        >
                                            <FiPhone size={12} /> {buyerPhone}
                                        </span>
                                    )}
                                </div>
                                <div className="rounded-xl border border-success/20 bg-success/5 p-3 flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-success-700">Supplier</span>
                                    <span className="font-semibold text-base">{sellerAssociateName}</span>
                                    <span className="text-sm text-default-500 font-medium">{sellerCompanyName}</span>
                                    {sellerPhone && isAdmin && (
                                        <span
                                            className="font-medium text-success hover:underline cursor-pointer text-sm mt-1 flex items-center gap-1"
                                            onClick={() => window.location.href = `tel:${sellerPhone}`}
                                        >
                                            <FiPhone size={12} /> {sellerPhone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* Product Info */}
                <Card className="md:col-span-1 shadow-sm border-none">
                    <CardHeader className="font-bold text-lg px-4 md:px-6 pt-4 md:pt-6">Product Details</CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="flex flex-col gap-4 md:gap-5 px-4 md:px-6 pb-4 md:pb-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Product</span>
                            <span className="font-semibold text-lg">{enquiry.productId?.name || "N/A"}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Rate / KG</span>
                            <span className="font-bold text-success text-xl">{convertRate(netRate)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Quantity</span>
                            <span className="font-bold text-lg">{Number(enquiry.quantity || 0).toLocaleString("en-IN")} Ton</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Preferred Incoterm</span>
                            <span className="text-sm font-semibold text-default-700">{preferredIncoterm || "Not specified"}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] uppercase font-bold text-default-400">Buyer Specification</span>
                            {isBuyer ? (
                                <div className="flex flex-col gap-2">
                                    <Textarea
                                        minRows={3}
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
                                        isDisabled={buyerSpecification.trim() === String(specificationTextRaw || "").trim()}
                                        onPress={() => updateSpecificationMutation.mutate()}
                                    >
                                        Save
                                    </Button>
                                    <span className="text-xs text-default-500">
                                        {updateSpecificationMutation.isPending
                                            ? `Saving specification for ${productNameLabel} - ${variantNameLabel}...`
                                            : specSavedAt
                                                ? `Saved at ${dayjs(specSavedAt).format("DD MMM YYYY, hh:mm A")} for ${productNameLabel} - ${variantNameLabel}`
                                                : `Ready to save for ${productNameLabel} - ${variantNameLabel}`}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm text-default-600 whitespace-pre-line">
                                    {specificationText || "No buyer specification shared yet."}
                                </span>
                            )}
                        </div>
                        {specChangeHistory.length > 0 && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-default-400">Specification Updates</span>
                                <div className="text-xs text-default-600 space-y-1">
                                    {specChangeHistory.slice(-3).reverse().map((h: any, idx: number) => (
                                        <p key={idx}>
                                            {dayjs(h.timestamp).format("DD MMM YYYY, hh:mm A")} - {h.note}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Pricing Scenario */}
                <Card className="md:col-span-1 shadow-sm border-none bg-success-50/30">
                    <CardHeader className="flex flex-col items-start gap-1 px-4 md:px-6 pt-4 md:pt-6 pb-2">
                        <span className="font-bold text-lg">Pricing Scenario</span>
                        <span className="text-[10px] uppercase font-black tracking-wider text-success-600">Excludes GST & Transportation</span>
                    </CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="flex flex-col gap-4 md:gap-5 px-4 md:px-6 pb-4 md:pb-6">
                        <div className="flex justify-end">
                            <CurrencySelector />
                        </div>
                        {(isAdmin || isMediator) ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-default-500 font-medium">Base Rate (Supplier)</span>
                                    <span className="font-semibold text-foreground">{convertRate(baseRate)}</span>
                                </div>
                                {isAdmin && adminCommission > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-default-500 font-medium">+ OBAOL Margin</span>
                                        <span className="font-semibold text-success">{convertRate(adminCommission)}</span>
                                    </div>
                                )}
                                {mediatorCommission > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-default-500 font-medium">+ Mediator Margin</span>
                                        <span className="font-semibold text-warning-600">{convertRate(mediatorCommission)}</span>
                                    </div>
                                )}
                                <div className="w-full h-[1px] bg-default-200 my-1" />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs uppercase font-black tracking-widest text-default-400">Net Rate / KG</span>
                                    <span className="font-black text-lg text-primary">{convertRate(netRate)}</span>
                                </div>
                                <div className="mt-4 p-4 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-success/20 flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black text-success-600 tracking-widest">Calculated Trade Volume</span>
                                    <span className="font-black text-2xl text-success-700 dark:text-success-400 tracking-tight">
                                        {convertRate(tradeVolume)}
                                    </span>
                                    <span className="text-xs text-default-500 font-medium mt-1">
                                        {quantity} Ton ({quantityKg.toLocaleString("en-IN")} KG) × {convertRate(netRate)}/KG
                                    </span>
                                </div>
                                {isAdmin && (
                                    <div className="flex justify-between items-center text-sm bg-success/5 border border-success/20 rounded-lg px-3 py-2 mt-1">
                                        <span className="text-default-500 font-medium">OBAOL Est. Earnings</span>
                                        <span className="font-black text-success">{convertRate(estimatedProfit)}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold text-default-400">Net Rate / KG</span>
                                    <span className="font-black text-xl text-primary">{convertRate(netRate)}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold text-default-400">Total Trade Volume</span>
                                    <span className="font-black text-2xl text-success-600 tracking-tight">{convertRate(tradeVolume)}</span>
                                    <span className="text-xs text-default-400">{quantity} Ton ({quantityKg.toLocaleString("en-IN")} KG) × {convertRate(netRate)}/KG</span>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Responsibility Arena */}
                <Card className="md:col-span-2 order-12 shadow-sm border-none md:min-h-[560px]">
                    <CardHeader className="font-bold text-lg px-4 md:px-6 pt-4 md:pt-6">Responsibility Event</CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="flex flex-col gap-4 md:gap-5 px-4 md:px-6 pb-4 md:pb-8">
                        <p className="text-sm text-default-600">
                            Buyer and supplier finalize who owns each execution step before order conversion.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {responsibilityFieldConfig.map((field) => {
                                const selectedValue = (responsibilityPlan as any)[field.key] || "";
                                const allowedOptions = getOwnerOptions(field.allowed);
                                return (
                                    <Select
                                        key={field.key}
                                        size="sm"
                                        label={field.label}
                                        selectedKeys={selectedValue ? [selectedValue] : []}
                                        onSelectionChange={(keys) => {
                                            const arr = Array.from(keys as Set<string>);
                                            const nextValue = String(arr[0] || "");
                                            setResponsibilityPlan((prev) => ({ ...prev, [field.key]: nextValue as any }));
                                        }}
                                        isDisabled={!canEditResponsibilityPlan || allowedOptions.length === 1}
                                    >
                                        {allowedOptions.map((item) => (
                                            <SelectItem key={item.key} value={item.key}>{item.label}</SelectItem>
                                        ))}
                                    </Select>
                                );
                            })}
                        </div>
                        {executionContext.tradeType === "INTERNATIONAL" && (
                            <div className="rounded-md border border-default-200 bg-default-100/60 px-3 py-2 text-xs text-default-600">
                                Cargo Insurance is auto-assigned to the same owner who handles Freight Forwarding & Shipping.
                            </div>
                        )}
                        <div className="rounded-lg border border-default-200 p-4 bg-default-50">
                            <p className="text-xs font-bold uppercase tracking-wider text-default-500 mb-2">Execution Context</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Select
                                    size="sm"
                                    label="Trade Type"
                                    selectedKeys={[executionContext.tradeType]}
                                    onSelectionChange={(keys) => {
                                        const arr = Array.from(keys as Set<string>);
                                        const value = (arr[0] === "INTERNATIONAL" ? "INTERNATIONAL" : "DOMESTIC") as "DOMESTIC" | "INTERNATIONAL";
                                        setExecutionContext((prev) => ({
                                            ...prev,
                                            tradeType: value,
                                            ...(value === "DOMESTIC"
                                                ? { originCountry: "", destinationCountry: "", originPort: "", destinationPort: "" }
                                                : { originState: "", destinationState: "", originDistrict: "", destinationDistrict: "" }),
                                        }));
                                    }}
                                    isDisabled={!isAdmin || !canEditResponsibilityPlan}
                                >
                                    <SelectItem key="DOMESTIC" value="DOMESTIC">Domestic</SelectItem>
                                    <SelectItem key="INTERNATIONAL" value="INTERNATIONAL">International</SelectItem>
                                </Select>
                                {executionContext.tradeType === "DOMESTIC" ? (
                                    <>
                                        {showOriginLogisticsFields && (
                                            <>
                                                <Select
                                                    size="sm"
                                                    label="From State"
                                                    selectedKeys={executionContext.originState ? [executionContext.originState] : []}
                                                    onSelectionChange={(keys) => {
                                                        const arr = Array.from(keys as Set<string>);
                                                        const value = (arr[0] as string) || "";
                                                        setExecutionContext((prev) => ({
                                                            ...prev,
                                                            originState: value,
                                                            originDistrict: "",
                                                        }));
                                                    }}
                                                    isDisabled={!canEditOriginLogistics}
                                                >
                                                    {states.map((item: any) => (
                                                        <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                                                    ))}
                                                </Select>
                                                <Select
                                                    size="sm"
                                                    label="From District"
                                                    selectedKeys={executionContext.originDistrict ? [executionContext.originDistrict] : []}
                                                    onSelectionChange={(keys) => {
                                                        const arr = Array.from(keys as Set<string>);
                                                        setExecutionContext((prev) => ({ ...prev, originDistrict: (arr[0] as string) || "" }));
                                                    }}
                                                    isDisabled={!canEditOriginLogistics || !executionContext.originState}
                                                >
                                                    {originDistrictOptions.map((item: any) => (
                                                        <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                                                    ))}
                                                </Select>
                                            </>
                                        )}
                                        {showDestinationLogisticsFields && (
                                            <>
                                                <Select
                                                    size="sm"
                                                    label="To State"
                                                    selectedKeys={executionContext.destinationState ? [executionContext.destinationState] : []}
                                                    onSelectionChange={(keys) => {
                                                        const arr = Array.from(keys as Set<string>);
                                                        const value = (arr[0] as string) || "";
                                                        setExecutionContext((prev) => ({
                                                            ...prev,
                                                            destinationState: value,
                                                            destinationDistrict: "",
                                                        }));
                                                    }}
                                                    isDisabled={!canEditDestinationLogistics}
                                                >
                                                    {states.map((item: any) => (
                                                        <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                                                    ))}
                                                </Select>
                                                <Select
                                                    size="sm"
                                                    label="To District"
                                                    selectedKeys={executionContext.destinationDistrict ? [executionContext.destinationDistrict] : []}
                                                    onSelectionChange={(keys) => {
                                                        const arr = Array.from(keys as Set<string>);
                                                        setExecutionContext((prev) => ({ ...prev, destinationDistrict: (arr[0] as string) || "" }));
                                                    }}
                                                    isDisabled={!canEditDestinationLogistics || !executionContext.destinationState}
                                                >
                                                    {destinationDistrictOptions.map((item: any) => (
                                                        <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                                                    ))}
                                                </Select>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {showOriginLogisticsFields && (
                                            <>
                                                <Autocomplete
                                                    size="sm"
                                                    label="From Country"
                                                    selectedKey={executionContext.originCountry || null}
                                                    onSelectionChange={(key) => {
                                                        const value = String(key || "");
                                                        setExecutionContext((prev) => ({
                                                            ...prev,
                                                            originCountry: value,
                                                            originPort: "",
                                                        }));
                                                    }}
                                                    defaultItems={countries}
                                                    isDisabled={!canEditOriginLogistics}
                                                >
                                                    {(item: any) => (
                                                        <AutocompleteItem key={item._id} value={item._id}>{item.name}</AutocompleteItem>
                                                    )}
                                                </Autocomplete>
                                                <Autocomplete
                                                    size="sm"
                                                    label="From Port"
                                                    selectedKey={executionContext.originPort || null}
                                                    onSelectionChange={(key) => {
                                                        setExecutionContext((prev) => ({ ...prev, originPort: String(key || "") }));
                                                    }}
                                                    defaultItems={originPortOptions}
                                                    isDisabled={!canEditOriginLogistics || !executionContext.originCountry}
                                                >
                                                    {(item: any) => (
                                                        <AutocompleteItem key={item._id} value={item._id}>{item.loCode} - {item.name}</AutocompleteItem>
                                                    )}
                                                </Autocomplete>
                                            </>
                                        )}
                                        {showDestinationLogisticsFields && (
                                            <>
                                                <Autocomplete
                                                    size="sm"
                                                    label="To Country"
                                                    selectedKey={executionContext.destinationCountry || null}
                                                    onSelectionChange={(key) => {
                                                        const value = String(key || "");
                                                        setExecutionContext((prev) => ({
                                                            ...prev,
                                                            destinationCountry: value,
                                                            destinationPort: "",
                                                        }));
                                                    }}
                                                    defaultItems={countries}
                                                    isDisabled={!canEditDestinationLogistics}
                                                >
                                                    {(item: any) => (
                                                        <AutocompleteItem key={item._id} value={item._id}>{item.name}</AutocompleteItem>
                                                    )}
                                                </Autocomplete>
                                                <Autocomplete
                                                    size="sm"
                                                    label="To Port"
                                                    selectedKey={executionContext.destinationPort || null}
                                                    onSelectionChange={(key) => {
                                                        setExecutionContext((prev) => ({ ...prev, destinationPort: String(key || "") }));
                                                    }}
                                                    defaultItems={destinationPortOptions}
                                                    isDisabled={!canEditDestinationLogistics || !executionContext.destinationCountry}
                                                >
                                                    {(item: any) => (
                                                        <AutocompleteItem key={item._id} value={item._id}>{item.loCode} - {item.name}</AutocompleteItem>
                                                    )}
                                                </Autocomplete>
                                            </>
                                        )}
                                    </>
                                )}
                                {!isAdmin && !buyerHandlesTransport && !sellerHandlesTransport && (
                                    <div className="md:col-span-2 rounded-md border border-default-200 bg-default-100/60 px-3 py-2 text-xs text-default-600">
                                        Route details are managed by the assigned logistics owner.
                                    </div>
                                )}
                                {!isAdmin && isBuyer && !buyerHandlesTransport && (
                                    <div className="md:col-span-2 rounded-md border border-default-200 bg-default-100/60 px-3 py-2 text-xs text-default-600">
                                        Buyer can edit only destination logistics when transportation is assigned to buyer.
                                    </div>
                                )}
                                {!isAdmin && isSeller && !sellerHandlesTransport && (
                                    <div className="md:col-span-2 rounded-md border border-default-200 bg-default-100/60 px-3 py-2 text-xs text-default-600">
                                        Supplier can edit only origin logistics when transportation is assigned to supplier.
                                    </div>
                                )}
                                <Input
                                    size="sm"
                                    className="md:col-span-2"
                                    label="Route Notes"
                                    value={executionContext.routeNotes}
                                    onValueChange={(v) => setExecutionContext((prev) => ({ ...prev, routeNotes: v }))}
                                    isDisabled={!canEditRouteNotes}
                                />
                            </div>
                            <p className="text-xs text-default-500 mt-2">
                                Domestic: choose state and district. International: choose country and port.
                            </p>
                            {executionContext.tradeType === "INTERNATIONAL" && (
                                <p className="text-xs text-warning-600 mt-1">
                                    International trade will include additional cost components such as inland-to-port movement, packaging, freight forwarding, shipping, and customs clearance.
                                </p>
                            )}
                            {executionContext.tradeType === "INTERNATIONAL" && (
                                <p className="text-xs text-primary-600 mt-1">
                                    Current support scope: Export from India and Import to India. Import-side responsibilities apply to import-to-India flows.
                                </p>
                            )}
                            {isAssociateResponsibilityLocked && (
                                <p className="text-xs text-danger-500 mt-1">
                                    Responsibility and execution context are locked after finalization. Only admin can edit now.
                                </p>
                            )}
                        </div>
                        {canEditResponsibilityPlan && (
                            <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                onPress={() => updateResponsibilityPlanMutation.mutate()}
                                isLoading={updateResponsibilityPlanMutation.isPending}
                                isDisabled={!isResponsibilityEventChanged}
                            >
                                Save Responsibility Event
                            </Button>
                        )}
                        {canEditResponsibilityPlan && (
                            <span className="text-xs text-default-500">
                                {updateResponsibilityPlanMutation.isPending
                                    ? `Saving responsibility event for ${productNameLabel} - ${variantNameLabel}...`
                                    : responsibilitySavedAt
                                        ? `Saved at ${dayjs(responsibilitySavedAt).format("DD MMM YYYY, hh:mm A")} for ${productNameLabel} - ${variantNameLabel}`
                                        : `Ready to save for ${productNameLabel} - ${variantNameLabel}`}
                            </span>
                        )}
                    </CardBody>
                </Card>

                {/* Execution Inquiries */}
                {Array.isArray((enquiry as any)?.executionInquiries) && (enquiry as any).executionInquiries.length > 0 && (
                    <Card className="md:col-span-1 shadow-sm border-none">
                        <CardHeader className="font-bold text-lg px-4 md:px-6 pt-4 md:pt-6">Generated Execution Inquiries</CardHeader>
                        <Divider className="my-2" />
                        <CardBody className="flex flex-col gap-2 px-4 md:px-6 pb-4 md:pb-6">
                            {(enquiry as any).executionInquiries.map((task: any, idx: number) => (
                                <div key={`${task.type}-${idx}`} className="rounded-lg border border-default-200 px-3 py-2 bg-default-50">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold">{task.title || task.type}</span>
                                        <Chip size="sm" variant="flat" color={task.status === "COMPLETED" ? "success" : "warning"}>
                                            {task.status || "OPEN"}
                                        </Chip>
                                    </div>
                                    <div className="text-xs text-default-500 mt-1">
                                        Owner: {String(task.ownerBy || "obaol").toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                )}

                {/* Handling & Associates */}
                <Card className="md:col-span-1 order-11 shadow-sm border-none">
                    <CardHeader className="font-bold text-lg px-4 md:px-6 pt-4 md:pt-6">Handling & Assignment</CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="flex flex-col gap-4 md:gap-5 px-4 md:px-6 pb-4 md:pb-6">
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
                                        {employeeOptions.map((emp: any) => (
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
                                <p>Confirm conversion after supplier acceptance, buyer confirmation, and finalized responsibility event.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    <div className="rounded-lg bg-default-100 px-3 py-2">Procurement / Sourcing: <b>{responsibilityPlan.procurementBy || "Not set"}</b></div>
                                    <div className="rounded-lg bg-default-100 px-3 py-2">Quality Testing: <b>{responsibilityPlan.qualityTestingBy || "Not set"}</b></div>
                                    <div className="rounded-lg bg-default-100 px-3 py-2">Packaging & Labelling: <b>{responsibilityPlan.packagingBy || "Not set"}</b></div>
                                    <div className="rounded-lg bg-default-100 px-3 py-2">Inland Transportation: <b>{responsibilityPlan.transportBy || "Not set"}</b></div>
                                    {executionContext.tradeType === "INTERNATIONAL" && (
                                        <>
                                            <div className="rounded-lg bg-default-100 px-3 py-2">Freight Forwarding & Shipping: <b>{responsibilityPlan.shippingBy || "Not set"}</b></div>
                                            <div className="rounded-lg bg-default-100 px-3 py-2">Cargo Insurance (Auto from Freight/Shipping): <b>{responsibilityPlan.shippingBy || "Not set"}</b></div>
                                            {isFromIndia && (
                                                <div className="rounded-lg bg-default-100 px-3 py-2">Export Customs Clearance: <b>{responsibilityPlan.exportCustomsBy || "Not set"}</b></div>
                                            )}
                                            {isToIndia && (
                                                <>
                                                    <div className="rounded-lg bg-default-100 px-3 py-2">Import Customs Clearance: <b>{responsibilityPlan.importCustomsBy || "Not set"}</b></div>
                                                    <div className="rounded-lg bg-default-100 px-3 py-2">Duties & Taxes: <b>{responsibilityPlan.dutiesTaxesBy || "Not set"}</b></div>
                                                    <div className="rounded-lg bg-default-100 px-3 py-2">Port Handling: <b>{responsibilityPlan.portHandlingBy || "Not set"}</b></div>
                                                    <div className="rounded-lg bg-default-100 px-3 py-2">Inland Transport (Port → Warehouse): <b>{responsibilityPlan.destinationInlandTransportBy || "Not set"}</b></div>
                                                    <div className="rounded-lg bg-default-100 px-3 py-2">Destination Inspection: <b>{responsibilityPlan.destinationInspectionBy || "Not set"}</b></div>
                                                    <div className="rounded-lg bg-default-100 px-3 py-2">Final Delivery Confirmation: <b>{responsibilityPlan.finalDeliveryConfirmationBy || "Not set"}</b></div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                                <Input
                                    label="Initial Notes"
                                    placeholder="Any specific instructions..."
                                    value={conversionNote}
                                    onValueChange={setConversionNote}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
                                <Button
                                    color="primary"
                                    onPress={() => convertMutation.mutate()}
                                    isLoading={convertMutation.isPending}
                                    isDisabled={!canConvert}
                                >
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
