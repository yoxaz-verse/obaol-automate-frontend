"use client";

import React, { useState, useContext, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import AuthContext from "@/context/AuthContext";
import { apiRoutes, inventoryRoutes, inventoryReservationRoutes } from "@/core/api/apiRoutes";
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
    Breadcrumbs,
    BreadcrumbItem,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { FiPackage, FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheckCircle, FiPhone, FiExternalLink, FiPlus, FiList, FiSearch, FiTruck, FiAnchor, FiFileText, FiShield, FiPercent, FiClipboard, FiNavigation, FiEye, FiCheck, FiInfo } from "react-icons/fi";
import { LuMail, LuPhone, LuPackage, LuTruck, LuAnchor, LuShieldCheck, LuClipboardCheck, LuFileCheck, LuGlobe, LuUser, LuTag, LuSearch, LuEye, LuCheck, LuMapPin, LuNavigation, LuChevronLeft } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { useCurrency } from "@/context/CurrencyContext";
import CurrencySelector from "@/components/dashboard/Catalog/currency-selector";
import { formatLastSeen, getPresenceStatus, isOnline } from "@/utils/presence";

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
    { key: "obaol", label: "Executors" },
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
const sanitizeDisplayText = (value: any): string => String(value || "").trim();
const getProductDisplayName = (enquiry: any): string => {
    const candidates = [
        enquiry?.productId?.name,
        enquiry?.productVariant?.product?.name,
        enquiry?.variantRateId?.product?.name,
    ];
    return candidates.map(sanitizeDisplayText).find(Boolean) || "Unknown Product";
};
const getVariantDisplayName = (enquiry: any, liveRate: any): string => {
    const specificationFallback = sanitizeDisplayText((enquiry as any)?.specifications || (enquiry as any)?.specification || "")
        .replace(/\s+/g, " ")
        .split(/\s+Notes:/i)[0]
        .trim();
    const candidates = [
        enquiry?.productVariant?.name,
        enquiry?.variantId?.name,
        enquiry?.variantRateId?.productVariant?.name,
        enquiry?.variantRateId?.variant?.name,
        enquiry?.variantRateId?.name,
        liveRate?.productVariant?.name,
        liveRate?.variant?.name,
        (enquiry as any)?.productVariantName,
        (enquiry as any)?.variantName,
        specificationFallback,
    ];
    return candidates.map(sanitizeDisplayText).find(Boolean) || "Unknown Variant";
};

export default function EnquiryDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { convertRate } = useCurrency();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [conversionNote, setConversionNote] = useState("");
    const { user } = useContext(AuthContext);
    const [selectedOperatorId, setSelectedOperatorId] = useState<string>("");
    const [commitUntil, setCommitUntil] = useState<string>("");
    const [buyerSpecification, setBuyerSpecification] = useState<string>("");
    const [packagingSpecifications, setPackagingSpecifications] = useState<string>("");
    const [specSavedAt, setSpecSavedAt] = useState<string>("");
    const [responsibilitySavedAt, setResponsibilitySavedAt] = useState<string>("");
    const [workflowStage, setWorkflowStage] = useState<string>("INQUIRY_CREATED");
    const [inventoryAcceptOpen, setInventoryAcceptOpen] = useState(false);
    const [selectedInventoryId, setSelectedInventoryId] = useState<string>("");
    const [isAddingNewInventory, setIsAddingNewInventory] = useState(false);
    const [inlineWarehouseName, setInlineWarehouseName] = useState("");
    const [inlineQuantity, setInlineQuantity] = useState("");
    const [inlineStateId, setInlineStateId] = useState<string>("");
    const [inlineDistrictId, setInlineDistrictId] = useState<string>("");
    const [acceptAttempted, setAcceptAttempted] = useState(false);
    const [docActionOpen, setDocActionOpen] = useState(false);
    const [docActionRule, setDocActionRule] = useState<any>(null);
    const [docActionFileUrl, setDocActionFileUrl] = useState("");
    const [reopenRequestOpen, setReopenRequestOpen] = useState(false);
    const [reopenReason, setReopenReason] = useState("");
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
    const { data: quotationResponse } = useQuery({
        queryKey: ["trade-documents", id],
        queryFn: () => getData(apiRoutes.tradeDocuments.list, { page: 1, limit: 20, enquiryId: id, type: "QUOTATION" }),
        enabled: Boolean(id),
    });
    const { data: enquiryRulesResponse } = useQuery({
        queryKey: ["enquiry-rules"],
        queryFn: () => getData(apiRoutes.enquiryRules.list),
    });
    const quotationRows = Array.isArray(quotationResponse?.data?.data?.data)
        ? quotationResponse?.data?.data?.data
        : (quotationResponse?.data?.data || []);
    const quotationDoc = quotationRows?.[0] || null;
    const quotationId = quotationDoc?._id || null;
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


    // Fetch live variant rate (if linked) for the Market State tracker
    const variantRateId = enquiry?.variantRateId?._id || enquiry?.variantRateId;
    const { data: liveRate } = useQuery({
        queryKey: ["variantRate", variantRateId],
        queryFn: () => getData(`/variant-rates/${variantRateId}`),
        select: (res) => res?.data?.data,
        enabled: !!variantRateId,
    });
    const sellerCompanyId =
        (enquiry as any)?.sellerAssociateId?.associateCompany?._id ||
        (enquiry as any)?.sellerAssociateId?.associateCompany ||
        (enquiry as any)?.sellerAssociateCompanyId ||
        null;
    const productVariantId =
        (enquiry as any)?.variantRateId?.productVariant?._id ||
        (enquiry as any)?.variantRateId?.productVariant ||
        (enquiry as any)?.productVariant?._id ||
        (enquiry as any)?.productVariant ||
        null;
    const { data: sellerInventoryResponse } = useQuery({
        queryKey: ["seller-inventories", sellerCompanyId, productVariantId],
        queryFn: () =>
            getData(inventoryRoutes.getAll, {
                associateCompany: sellerCompanyId,
                productVariant: productVariantId,
                limit: 200,
            }),
        enabled: Boolean(sellerCompanyId && productVariantId),
    });
    const { data: sellerReservationResponse } = useQuery({
        queryKey: ["seller-reservations", sellerCompanyId, productVariantId],
        queryFn: () =>
            getData(inventoryReservationRoutes.getAll, {
                associateCompany: sellerCompanyId,
                productVariant: productVariantId,
                status: "RESERVED",
                limit: 200,
            }),
        enabled: Boolean(sellerCompanyId && productVariantId),
    });
    const productNameLabel = getProductDisplayName(enquiry);
    const variantNameLabel = getVariantDisplayName(enquiry, liveRate);
    const { data: incotermResponse } = useQuery({
        queryKey: ["incoterms"],
        queryFn: () => getData(apiRoutes.incoterm.getAll),
    });
    const { data: statesResponse } = useQuery({
        queryKey: ["states"],
        queryFn: () => getData(apiRoutes.state.getAll, { page: 1, limit: 500 }),
    });
    const { data: districtsResponse } = useQuery({
        queryKey: ["districts"],
        queryFn: () => getData(apiRoutes.district.getAll, { page: 1, limit: 2000 }),
    });
    const { data: countriesResponse } = useQuery({
        queryKey: ["countries"],
        queryFn: () => getData(apiRoutes.country.getAll, { page: 1, limit: 300 }),
    });
    const { data: originPortsResponse } = useQuery({
        queryKey: ["sea-ports", "origin", executionContext.originCountry],
        queryFn: () =>
            getData(apiRoutes.enquiry.seaPorts, {
                country: executionContext.originCountry,
                page: 1,
                limit: 300,
            }),
        enabled: executionContext.tradeType === "INTERNATIONAL" && Boolean(executionContext.originCountry),
    });
    const { data: destinationPortsResponse } = useQuery({
        queryKey: ["sea-ports", "destination", executionContext.destinationCountry],
        queryFn: () =>
            getData(apiRoutes.enquiry.seaPorts, {
                country: executionContext.destinationCountry,
                page: 1,
                limit: 300,
            }),
        enabled: executionContext.tradeType === "INTERNATIONAL" && Boolean(executionContext.destinationCountry),
    });
    const { data: docRulesResponse } = useQuery({
        queryKey: ["document-rules"],
        queryFn: () => getData(apiRoutes.documentRules.list),
    });
    const { data: enquiryDocsResponse } = useQuery({
        queryKey: ["trade-documents", "enquiry", id],
        queryFn: () => getData(apiRoutes.tradeDocuments.list, { enquiryId: id, page: 1, limit: 200 }),
        enabled: Boolean(id),
    });
    const enquirySpecificationValue = (enquiry as any)?.specifications || (enquiry as any)?.specification || "";
    const enquiryPackagingSpecificationsValue = (enquiry as any)?.packagingSpecifications || "";
    useEffect(() => {
        setBuyerSpecification(enquirySpecificationValue);
    }, [enquirySpecificationValue]);
    useEffect(() => {
        setPackagingSpecifications(String(enquiryPackagingSpecificationsValue || ""));
    }, [enquiryPackagingSpecificationsValue]);
    useEffect(() => {
        if (!enquiry) return;
        const fallbackStage = (() => {
            if ((enquiry as any)?.order) return "ORDER_CONFIRMED";
            if (enquiry?.buyerConfirmedAt) return "PURCHASE_ORDER_RECEIVED";
            if (enquiry?.sellerAcceptedAt) return "QUOTATION_SUBMITTED";
            return "INQUIRY_CREATED";
        })();
        setWorkflowStage(String((enquiry as any)?.workflowStage || fallbackStage));
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
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Failed to convert enquiry.";
            toast.error(msg);
        },
    });
    const operatorOptions = Array.isArray(operators) ? operators : [];
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
    const assignOperatorMutation = useMutation({
        mutationFn: async () => {
            if (!selectedOperatorId) return;
            return patchData(`${apiRoutes.enquiry.getAll}/${id}/assign`, {
                operatorId: selectedOperatorId,
            });
        },
        onSuccess: () => {
            toast.success("Operator assigned successfully");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => {
            toast.error("Failed to assign operator.");
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
        mutationFn: async () => {
            // If adding new or updating existing inline
            if (isAddingNewInventory || inventoryOptions.length === 0 || (selectedInventoryId && Number(inlineQuantity) > 0)) {
                const qty = Number(inlineQuantity);

                let targetInvId = selectedInventoryId;

                // 1. Handle Inventory (Create or Update)
                if (isAddingNewInventory || inventoryOptions.length === 0) {
                    if (!inlineWarehouseName) throw new Error("Warehouse name is required for new inventory.");
                    if (!qty || qty <= 0) throw new Error("Please enter a valid quantity.");
                    if (inventoryOptions.length === 0 && (!inlineStateId || !inlineDistrictId)) {
                        throw new Error("Please select state and district for the new warehouse.");
                    }

                    const invRes = await postData(inventoryRoutes.getAll, {
                        productVariant: productVariantId,
                        product: enquiry?.productVariant?.product?._id || enquiry?.productId?._id,
                        associateCompany: sellerCompanyId,
                        associate: (enquiry as any)?.sellerAssociateId?._id || (enquiry as any)?.sellerAssociateId,
                        warehouseName: inlineWarehouseName,
                        ...(inlineStateId && { state: inlineStateId }),
                        ...(inlineDistrictId && { district: inlineDistrictId }),
                        quantity: qty,
                        unit: "MT",
                    });
                    targetInvId = (invRes as any)?.data?.data?._id || (invRes as any)?.data?._id;
                } else if (selectedInventoryId && qty > 0) {
                    const currentQty = Number(selectedInventory?.quantity || 0);
                    await patchData(`${inventoryRoutes.getAll}/${selectedInventoryId}`, {
                        quantity: currentQty + qty,
                    });
                }

                if (!targetInvId) throw new Error("Failed to resolve inventory ID.");

                // 2. Finally Accept with the target inventory
                return patchData(`${apiRoutes.enquiry.getAll}/${id}/seller-accept`, {
                    inventoryId: targetInvId,
                });
            }

            // Normal flow: just accept with selected inventory
            if (!selectedInventoryId) {
                throw new Error("Select an inventory or add new stock to proceed.");
            }
            if (selectedInventory && (selectedInventory.availableQty || 0) < Number(enquiry?.quantity || 0)) {
                throw new Error("Please add the quantity as per the order into your warehouse. Otherwise, select another warehouse with the desired quantity.");
            }
            return patchData(`${apiRoutes.enquiry.getAll}/${id}/seller-accept`, {
                inventoryId: selectedInventoryId,
            });
        },
        onSuccess: () => {
            toast.success("Enquiry accepted and inventory updated.");
            setInventoryAcceptOpen(false);
            setSelectedInventoryId("");
            setIsAddingNewInventory(false);
            setInlineQuantity("");
            setInlineWarehouseName("");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
            queryClient.invalidateQueries({ queryKey: ["seller-inventories", sellerCompanyId, productVariantId] });
            queryClient.invalidateQueries({ queryKey: ["variantRate", variantRateId] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to accept enquiry.");
        },
    });

    const createQuotationMutation = useMutation({
        mutationFn: async () => {
            return postData(apiRoutes.tradeDocuments.create, { type: "QUOTATION", enquiryId: id });
        },
        onSuccess: (res: any) => {
            toast.success("Quotation created.");
            queryClient.invalidateQueries({ queryKey: ["trade-documents", id] });
            const createdId = res?.data?.data?._id;
            if (createdId) router.push(`/dashboard/documents/${createdId}`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to create quotation.");
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
            patchData(`${apiRoutes.enquiry.getAll}/${id}/finalize-responsibilities`, {
                executionContext,
                packagingSpecifications,
            }),
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
            patchData(`${apiRoutes.enquiry.getAll}/${id}/status`, { status: String(newStatus || "").toUpperCase() }),
        onSuccess: () => {
            toast.success("Status updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => { toast.error("Failed to update status."); },
    });
    const updateWorkflowStageMutation = useMutation({
        mutationFn: (stage: string) =>
            patchData(`${apiRoutes.enquiry.getAll}/${id}/workflow-stage`, { workflowStage: stage }),
        onSuccess: () => {
            toast.success("Workflow stage updated.");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update workflow stage.");
        },
    });
    const updateSpecificationMutation = useMutation({
        mutationFn: () => {
            const oldSpec = ((enquiry as any).specifications || (enquiry as any).specification || "").trim();
            const newSpec = (buyerSpecification || "").trim();
            const actor = (user as any)?.name || (user as any)?.email || "User";
            const productName = productNameLabel;
            const variantName = variantNameLabel;

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
            const productName = productNameLabel;
            const variantName = variantNameLabel;
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
                packagingSpecifications,
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
    const createDocMutation = useMutation({
        mutationFn: async () => {
            if (!docActionRule) throw new Error("No document rule selected.");
            const payload: any = {
                type: docActionRule.docType,
                enquiryId: id,
            };
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
            queryClient.invalidateQueries({ queryKey: ["trade-documents", "enquiry", id] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create document.");
        },
    });

    const reopenRequestMutation = useMutation({
        mutationFn: async () => {
            if (!id) throw new Error("Missing enquiry id.");
            const description = reopenReason.trim() || "Reopen enquiry request";
            return postData(apiRoutes.organizationReports.create, {
                reasonCode: "REOPEN_INQUIRY_REQUEST",
                description,
                payload: { inquiryId: id, note: description },
            });
        },
        onSuccess: () => {
            toast.success("Reopen request submitted for admin approval.");
            setReopenRequestOpen(false);
            setReopenReason("");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to submit reopen request.");
        },
    });

    if (isLoading) return <div className="flex items-center justify-center h-screen"><Progress isIndeterminate className="max-w-md" /></div>;
    if (!enquiry) return <div className="p-10 text-center">Enquiry not found</div>;

    const sellerInventoryRows = Array.isArray(sellerInventoryResponse?.data?.data?.data)
        ? sellerInventoryResponse?.data?.data?.data
        : (sellerInventoryResponse?.data?.data || []);
    const sellerReservationRows = Array.isArray(sellerReservationResponse?.data?.data?.data)
        ? sellerReservationResponse?.data?.data?.data
        : (sellerReservationResponse?.data?.data || []);
    const reservedByInventory = new Map<string, number>();
    for (const reservation of sellerReservationRows || []) {
        const invId = reservation.inventoryId?._id || reservation.inventoryId;
        if (!invId) continue;
        reservedByInventory.set(
            String(invId),
            (reservedByInventory.get(String(invId)) || 0) + Number(reservation.quantity || 0)
        );
    }
    const inventoryOptions = (sellerInventoryRows || []).map((row: any) => {
        const invId = row._id || row.id;
        const reservedQty = reservedByInventory.get(String(invId)) || 0;
        const totalQty = Number(row.quantity || 0);
        const availableQty = Math.max(0, totalQty - reservedQty);
        return {
            ...row,
            invId: String(invId || ""),
            reservedQty,
            availableQty,
        };
    });
    const selectedInventory = inventoryOptions.find((row: any) => String(row.invId) === String(selectedInventoryId));
    const requiredQty = Number(enquiry?.quantity || 0);
    const addedQty = Number(inlineQuantity || 0);
    const projectedAvailable = !isAddingNewInventory && selectedInventory
        ? (selectedInventory.availableQty || 0) + (Number.isFinite(addedQty) ? addedQty : 0)
        : (selectedInventory?.availableQty || 0);
    const hasInsufficientStock = Boolean(!isAddingNewInventory && selectedInventory && requiredQty > projectedAvailable);
    const shouldShowInsufficient = Boolean(acceptAttempted && hasInsufficientStock);

    const handleInventoryAccept = () => {
        setAcceptAttempted(true);
        if (!isAddingNewInventory && hasInsufficientStock) {
            toast.error("Please add the quantity as per the order into your warehouse. Otherwise, select another warehouse with the desired quantity.");
            return;
        }
        sellerAcceptMutation.mutate();
    };

    const normalizedStatus = String(enquiry.status || "").toUpperCase();
    const hasSellerAccepted = Boolean(enquiry.sellerAcceptedAt);
    const hasBuyerConfirmed = Boolean(enquiry.buyerConfirmedAt);
    const hasResponsibilitiesFinalized = Boolean((enquiry as any).responsibilitiesFinalizedAt);
    const hasExecutionContextForStage = executionContext.tradeType === "DOMESTIC"
        ? Boolean(executionContext.originState.trim()) &&
        Boolean(executionContext.originDistrict.trim()) &&
        Boolean(executionContext.destinationState.trim()) &&
        Boolean(executionContext.destinationDistrict.trim())
        : Boolean(executionContext.originCountry.trim()) &&
        Boolean(executionContext.originPort.trim()) &&
        Boolean(executionContext.destinationCountry.trim()) &&
        Boolean(executionContext.destinationPort.trim());
    const hasExecutionPlanReady = hasResponsibilitiesFinalized || (hasBuyerConfirmed && hasExecutionContextForStage && hasFullResponsibilityPlan);
    const isCancelled = normalizedStatus === "CANCELLED";
    const isCompletedFlow = normalizedStatus === "COMPLETED" || normalizedStatus === "CLOSED";
    const isConvertedFlow = normalizedStatus === "CONVERTED";
    const initialPlan = (enquiry as any)?.responsibilityPlan || {};
    // assignedOperatorId may be an object or just an ID string; handle both safely
    const assignedOperatorObj = (enquiry.assignedOperatorId && typeof enquiry.assignedOperatorId === 'object') ? enquiry.assignedOperatorId : null;
    const assignedOperatorName =
        assignedOperatorObj?.name ||
        (enquiry as any)?.assignedOperatorName ||
        (typeof enquiry.assignedOperatorId === "string" ? "Assigned operator" : "OBAOL Desk");

    // ─── Role Detection ───────────────────────────────────────────────────────
    const roleLower = String(user?.role || "").toLowerCase();
    const isSystemAdmin = roleLower === "admin";
    const isOperatorUser = roleLower === "operator" || roleLower === "team";
    const canManageDocs = isSystemAdmin || isOperatorUser;
    const canManageWorkflow = isSystemAdmin || isOperatorUser;
    const assignedOperatorId = (assignedOperatorObj?._id || enquiry.assignedOperatorId || "").toString();
    const isAssignedOperator = Boolean(isOperatorUser && user?.id && assignedOperatorId === String(user.id));
    const isAdmin = isSystemAdmin || isAssignedOperator;
    const isOperatorBlocked = Boolean(isOperatorUser && !isAssignedOperator);
    if (isOperatorBlocked) {
        return (
            <div className="p-10 text-center">
                <p className="text-lg font-semibold">Access restricted</p>
                <p className="text-default-500 mt-2">This enquiry is not assigned to you.</p>
            </div>
        );
    }
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
    const buyerPresence = {
        online: isOnline(buyerAssociateObj?.lastSeenAt),
        status: getPresenceStatus(buyerAssociateObj?.lastSeenAt),
        lastSeenLabel: formatLastSeen(buyerAssociateObj?.lastSeenAt),
    };
    const sellerPresence = {
        online: isOnline(sellerAssociateObj?.lastSeenAt),
        status: getPresenceStatus(sellerAssociateObj?.lastSeenAt),
        lastSeenLabel: formatLastSeen(sellerAssociateObj?.lastSeenAt),
    };
    const assignedPresence = {
        online: isOnline(assignedOperatorObj?.lastSeenAt),
        status: getPresenceStatus(assignedOperatorObj?.lastSeenAt),
        lastSeenLabel: formatLastSeen(assignedOperatorObj?.lastSeenAt),
    };
    const userIdStr = user?.id?.toString();
    const isBuyer = buyerId && userIdStr && buyerId.toString() === userIdStr;
    const isSeller = sellerId && userIdStr && sellerId.toString() === userIdStr;

    const docRules = Array.isArray(docRulesResponse?.data?.data) ? docRulesResponse.data.data : [];
    const enquiryRules = Array.isArray(enquiryRulesResponse?.data?.data) ? enquiryRulesResponse.data.data : [];
    const docsForEnquiry = Array.isArray(enquiryDocsResponse?.data?.data?.data)
        ? enquiryDocsResponse?.data?.data?.data
        : (enquiryDocsResponse?.data?.data || []);
    const rulesForStage = docRules
        .filter((r: any) =>
            String(r.stageType) === "INQUIRY" &&
            String(r.stageKey) === workflowStage &&
            r.isActive !== false &&
            (r.tradeType === "BOTH" || r.tradeType === executionContext.tradeType)
        )
        .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
    const canSeeRule = (rule: any) => {
        const visibility = String(rule.visibility || "BOTH");
        if (isAdmin || isOperatorUser) return true;
        if (visibility === "INTERNAL") return false;
        if (visibility === "BOTH") return true;
        if (visibility === "BUYER") return Boolean(isBuyer);
        if (visibility === "SELLER") return Boolean(isSeller);
        return false;
    };
    const canActOnRule = (rule: any) => {
        if (isAdmin || isOperatorUser) return true;
        const roleKey = String(rule.responsibleRole || "");
        if (roleKey === "BUYER") return Boolean(isBuyer);
        if (roleKey === "SELLER") return Boolean(isSeller);
        return false;
    };
    const currentRule = enquiryRules.find((r: any) => String(r.stageKey || "").toUpperCase() === workflowStage);
    const requiredActions = Array.isArray(currentRule?.requiredActions) ? currentRule.requiredActions : [];
    const actionStatus = {
        SUPPLIER_ACCEPTED: Boolean(enquiry?.sellerAcceptedAt),
        BUYER_CONFIRMED: Boolean(enquiry?.buyerConfirmedAt),
        RESPONSIBILITIES_FINALIZED: Boolean((enquiry as any)?.responsibilitiesFinalizedAt),
    };
    const sortedEnquiryStages = enquiryRules
        .filter((r: any) => r?.isActive !== false)
        .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
        .map((r: any) => String(r.stageKey || "").toUpperCase())
        .filter(Boolean);
    const stageLabelMap = new Map(
        enquiryRules.map((r: any) => [String(r.stageKey || "").toUpperCase(), r.label || r.stageKey])
    );
    const workflowStageOptions = sortedEnquiryStages.length > 0
        ? sortedEnquiryStages
        : ["INQUIRY_CREATED", "QUOTATION_SUBMITTED", "QUOTATION_REVISED", "PROFORMA_ISSUED", "PURCHASE_ORDER_RECEIVED", "ORDER_CONFIRMED"];
    const currentStepIndex = Math.max(0, workflowStageOptions.indexOf(workflowStage));
    const hasDocType = (type: string) => (docsForEnquiry || []).some((doc: any) => String(doc?.type || "") === type);
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
        if (!hasExecutionPlanReady) return "Waiting for execution plan finalization to generate execution inquiries.";
        if (!isConvertedFlow) return "Waiting for OBAOL team to convert this enquiry into an order.";
        return "Enquiry is converted. Order execution is now in progress.";
    })();
    const isAssociateResponsibilityLocked = hasResponsibilitiesFinalized && !isAdmin;
    const canEditResponsibilityPlan = (isAdmin || isBuyer || isSeller) && !isAssociateResponsibilityLocked;
    const transportOwner = sanitizeOwner(responsibilityPlan.transportBy || initialPlan.transportBy || "obaol");
    const buyerHandlesTransport = transportOwner === "buyer";
    const sellerHandlesTransport = transportOwner === "seller";
    const showOriginLogisticsFields = isAdmin || isSeller || (isBuyer && buyerHandlesTransport);
    const showDestinationLogisticsFields = isAdmin || isBuyer || (isSeller && sellerHandlesTransport);
    const canEditOriginLogistics = showOriginLogisticsFields && canEditResponsibilityPlan;
    const canEditDestinationLogistics = showDestinationLogisticsFields && canEditResponsibilityPlan;
    const canEditRouteNotes = canEditResponsibilityPlan && (isAdmin || isBuyer || isSeller);
    const hasExecutionContext = hasExecutionContextForStage;
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
    const isPackagingSpecificationsChanged =
        String(packagingSpecifications || "").trim() !== String((enquiry as any)?.packagingSpecifications || "").trim();
    const isResponsibilityEventChanged = isResponsibilityPlanChanged || isExecutionContextChanged || isPackagingSpecificationsChanged;
    const hasPackagingSpecifications = Boolean(String(packagingSpecifications || "").trim());
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
    const inlineDistrictOptions = districts.filter((item: any) => getEntityId(item?.state) === inlineStateId);
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
        obaol: "Executors",
    };
    const getOwnerOptions = (allowedKeys: string[]) =>
        allowedKeys.map((key) => ({ key, label: ownerLabelByKey[key] || key }));
    const responsibilityFieldConfig = [
        { key: "procurementBy", label: "Procurement / Sourcing", allowed: ["buyer", "seller", "obaol"], show: true, icon: <LuSearch size={16} /> },
        { key: "qualityTestingBy", label: "Quality Testing", allowed: ["buyer", "seller", "obaol"], show: true, icon: <LuClipboardCheck size={16} /> },
        { key: "packagingBy", label: "Packaging & Labelling", allowed: ["buyer", "seller", "obaol"], show: true, icon: <LuPackage size={16} /> },
        { key: "transportBy", label: "Inland Transportation", allowed: ["buyer", "seller", "obaol"], show: true, icon: <LuTruck size={16} /> },
        { key: "shippingBy", label: "Freight Forwarding & Shipping", allowed: ["buyer", "seller", "obaol"], show: executionContext.tradeType === "INTERNATIONAL", icon: <LuAnchor size={16} /> },
        { key: "exportCustomsBy", label: "Export Customs", allowed: ["buyer", "seller", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isFromIndia, icon: <LuFileCheck size={16} /> },
        { key: "importCustomsBy", label: "Import Customs", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuFileCheck size={16} /> },
        { key: "dutiesTaxesBy", label: "Duties & Taxes", allowed: ["buyer"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuTag size={16} /> },
        { key: "portHandlingBy", label: "Port Handling", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuAnchor size={16} /> },
        { key: "destinationInlandTransportBy", label: "Port → Warehouse Transport", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuTruck size={16} /> },
        { key: "destinationInspectionBy", label: "Destination Inspection", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuEye size={16} /> },
        { key: "finalDeliveryConfirmationBy", label: "Final Delivery Check", allowed: ["obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuCheck size={16} /> },
    ].filter((f) => f.show);

    return (
        <div className="w-full p-3 sm:p-4 md:p-6 flex flex-col gap-4 md:gap-6 max-w-none mx-0 text-left">
            <div className="flex items-center gap-2 mb-2">
                <Button isIconOnly size="sm" variant="light" radius="full" onPress={() => router.back()} className="text-default-500">
                    <LuChevronLeft size={20} />
                </Button>
                <Breadcrumbs size="sm" variant="light" color="primary">
                    <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
                    <BreadcrumbItem href="/dashboard/enquiries">Enquiries</BreadcrumbItem>
                    <BreadcrumbItem isCurrent>#{(Array.isArray(id) ? id[0] : id)?.slice(-6).toUpperCase()}</BreadcrumbItem>
                </Breadcrumbs>
            </div>

            {isCancelled && (
                <Card className="border border-danger-400/30 bg-danger-500/10">
                    <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-4 py-4">
                        <div className="text-left">
                            <div className="font-semibold text-danger-700">Enquiry cancelled</div>
                            <div className="text-sm text-default-500">This enquiry is closed. You can request a reopen for admin review.</div>
                        </div>
                        {(isBuyer || isSeller || isMediator || isAdmin) && (
                            <Button color="danger" variant="flat" onPress={() => setReopenRequestOpen(true)} className="font-bold">
                                Request Reopen
                            </Button>
                        )}
                    </CardBody>
                </Card>
            )}

            <div className={isCancelled ? "opacity-60 pointer-events-none flex flex-col gap-6" : "flex flex-col gap-6"}>
                {/* Header & Status Card */}
                <Card className="w-full border border-divider/50 bg-gradient-to-r from-content1 to-default-50 overflow-visible">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-6 py-6 border-b border-divider/50">
                        <div className="flex flex-col gap-2 text-left">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight break-all text-foreground">
                                    Enquiry #{(Array.isArray(id) ? id[0] : id)?.slice(-6).toUpperCase()}
                                </h1>
                                <Chip
                                    color={normalizedStatus === "CONVERTED" ? "success" : normalizedStatus === "CANCELLED" ? "danger" : "warning"}
                                    variant="shadow" size="sm" className="font-bold border-none"
                                >
                                    {enquiry.status}
                                </Chip>
                            </div>
                            <div className="flex flex-col gap-1.5 mt-0.5">
                                <span className="text-default-500 text-sm font-bold flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-default-300" />
                                    Submitted on {dayjs(enquiry.createdAt).format("DD MMM YYYY, hh:mm A")}
                                </span>
                                {(isSystemAdmin || isOperatorUser) && (
                                    <Chip size="sm" variant="flat" className="capitalize bg-default-100 text-default-600 font-bold border-none h-6 w-fit">
                                        {workflowStage.replaceAll("_", " ")}
                                    </Chip>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Contact & Actions */}
                        <div className="flex flex-col gap-5 w-full md:w-auto items-end">
                            {/* Support Contact Point (Client/Supplier View) */}
                            {!isSystemAdmin && !isOperatorUser && (
                                <div className="flex flex-col gap-2.5 p-3.5 bg-default-50/50 rounded-2xl border border-default-200/50 items-end text-right min-w-[220px]">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-default-400">Your Support Point</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                                    </div>

                                    {(() => {
                                        const opId = enquiry?.assignedOperator?._id || enquiry?.assignedOperatorId || enquiry?.assignedOperator;
                                        const op = operators?.find((o: any) => String(o._id) === String(opId));

                                        return (
                                            <div className="flex flex-col gap-2.5 items-end">
                                                {op && (
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-tight">{op.name}</span>
                                                        <div className="flex flex-col items-end gap-0 text-right">
                                                            {op.email && <span className="text-[10px] text-default-500 font-bold">{op.email}</span>}
                                                            {op.phone && <span className="text-[10px] text-default-400 font-medium">{op.phone}</span>}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex flex-col items-end gap-1.5">
                                                    {op && <div className="w-16 h-px bg-default-200/50 mb-0.5" />}
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        {!op && <span className="text-[11px] font-black text-foreground uppercase tracking-tight mb-1">OBAOL Desk</span>}
                                                        {op && <span className="text-[8px] font-bold text-default-400 uppercase tracking-tighter">Escalation Desk</span>}
                                                        <a
                                                            href="https://wa.me/919019351483"
                                                            target="_blank"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-success-500 text-white rounded-xl text-[10px] font-black border border-success-600/20 hover:bg-success-600 transition-all hover:scale-105 active:scale-95 no-underline"
                                                        >
                                                            <FaWhatsapp size={13} />
                                                            WHATSAPP SUPPORT
                                                        </a>
                                                        <span className="text-[9px] text-default-400 font-bold tracking-wider mt-0.5">+91 90193 51483</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Action Buttons Hub */}
                            <div className="flex flex-wrap gap-2.5 justify-end">
                                {quotationId && (
                                    <Button
                                        color="primary"
                                        variant="solid"
                                        className="w-full sm:w-auto font-black px-6 rounded-2xl h-11 text-xs tracking-wide"
                                        onPress={() => router.push(`/dashboard/documents/${quotationId}`)}
                                        startContent={<LuEye size={18} />}
                                    >
                                        View Quotation
                                    </Button>
                                )}
                                {!quotationId && canManageDocs && enquiry.sellerAcceptedAt && (
                                    <Button
                                        color="primary"
                                        variant="solid"
                                        className="w-full sm:w-auto font-black px-6 rounded-2xl h-11 text-xs tracking-wide"
                                        isLoading={createQuotationMutation.isPending}
                                        onPress={() => createQuotationMutation.mutate()}
                                        startContent={<FiPlus size={18} />}
                                    >
                                        Create Quotation
                                    </Button>
                                )}

                                {isSeller && !enquiry.sellerAcceptedAt && (
                                    <Button
                                        color="success"
                                        variant="flat"
                                        className="w-full sm:w-auto font-bold rounded-2xl h-11"
                                        isLoading={sellerAcceptMutation.isPending}
                                        onPress={() => setInventoryAcceptOpen(true)}
                                    >
                                        Accept Enquiry
                                    </Button>
                                )}

                                {isBuyer && enquiry.sellerAcceptedAt && !enquiry.buyerConfirmedAt && (
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        className="w-full sm:w-auto font-bold rounded-2xl h-11"
                                        isLoading={buyerConfirmMutation.isPending}
                                        onPress={() => buyerConfirmMutation.mutate()}
                                    >
                                        Mark All Good to Go
                                    </Button>
                                )}

                                {isAdmin && (
                                    <div className="flex flex-wrap gap-2 justify-end">
                                        {!isConvertedFlow && !isCompletedFlow && !isCancelled && enquiry.sellerAcceptedAt && enquiry.buyerConfirmedAt && (
                                            <>
                                                {!hasResponsibilitiesFinalized && (
                                                    <Button
                                                        color="warning"
                                                        variant="solid"
                                                        className="w-full sm:w-auto font-bold rounded-2xl h-11"
                                                        isLoading={finalizeResponsibilitiesMutation.isPending}
                                                        isDisabled={!hasExecutionContext || !hasFullResponsibilityPlan || !hasPackagingSpecifications}
                                                        onPress={() => finalizeResponsibilitiesMutation.mutate()}
                                                    >
                                                        Finalize Responsibilities
                                                    </Button>
                                                )}
                                                <Button
                                                    color="primary"
                                                    variant="solid"
                                                    className="w-full sm:w-auto font-bold rounded-2xl h-11"
                                                    onPress={onOpen}
                                                    isDisabled={!hasResponsibilitiesFinalized}
                                                >
                                                    Convert to Order
                                                </Button>
                                            </>
                                        )}

                                        {normalizedStatus === "CONVERTED" && (
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    color="success"
                                                    variant="flat"
                                                    className="w-full sm:w-auto font-bold rounded-2xl h-11"
                                                    onPress={() => updateStatusMutation.mutate("CLOSED")}
                                                    isLoading={updateStatusMutation.isPending}
                                                >
                                                    Complete Enquiry
                                                </Button>
                                                <Button
                                                    color="success"
                                                    variant="solid"
                                                    className="w-full sm:w-auto font-black px-6 rounded-2xl h-11"
                                                    isDisabled={!enquiryOrderId}
                                                    onPress={() => enquiryOrderId && router.push(`/dashboard/orders/${enquiryOrderId}`)}
                                                    startContent={<LuTruck size={18} />}
                                                >
                                                    View Order
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Order Context View for non-admins */}
                                {!isAdmin && (enquiry as any)?.order && (
                                    <Button
                                        color="success"
                                        variant="solid"
                                        className="w-full sm:w-auto font-black px-6 rounded-2xl h-11"
                                        onPress={() => router.push(`/dashboard/orders/${(enquiry as any).order}`)}
                                        startContent={<LuTruck size={18} />}
                                    >
                                        View Order
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="px-4 md:px-6 py-6 md:py-10">
                        {/* Status Stepper */}
                        <Progress
                            size="sm"
                            radius="full"
                            value={workflowStageOptions.length > 1
                                ? (currentStepIndex / (workflowStageOptions.length - 1)) * 100
                                : 0}
                            color={isCompletedFlow ? "success" : "primary"}
                            className="mb-4"
                        />
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                            {workflowStageOptions.map((step, index) => {
                                const isCompleted = index < currentStepIndex;
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
                                            {String(stageLabelMap.get(step) || step).replaceAll("_", " ")}
                                        </div>
                                        {index < workflowStageOptions.length - 1 && (
                                            <span className="text-default-300 text-xs">→</span>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] uppercase font-black tracking-widest text-primary-600">Current Progress</span>
                                {isCancelled && <Chip size="sm" color="danger" variant="flat">Cancelled</Chip>}
                            </div>
                            <p className="text-sm font-medium text-default-700 mt-1">{waitingMessage}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card className="w-full border border-default-200/50">
                    <CardHeader className="flex flex-col items-start gap-1 px-4 md:px-6 pt-4 md:pt-5">
                        <span className="font-bold text-lg">Documentation Checklist</span>
                        <span className="text-[10px] uppercase font-black tracking-wider text-default-400">
                            Stage: {String(stageLabelMap.get(workflowStage) || workflowStage).replaceAll("_", " ")}
                        </span>
                    </CardHeader>
                    <CardBody className="px-4 md:px-6 pb-4 md:pb-6">
                        {rulesForStage.filter(canSeeRule).length === 0 ? (
                            <div className="text-sm text-default-500 text-left">No documentation rules configured for this stage.</div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {rulesForStage.filter(canSeeRule).map((rule: any) => {
                                    const hasDoc = hasDocType(String(rule.docType || ""));
                                    return (
                                        <div key={rule._id} className="flex items-center justify-between gap-3 border border-default-200/60 rounded-lg px-3 py-2">
                                            <div className="text-sm">
                                                <span className="font-medium">{rule.docType}</span>
                                                <span className="text-default-500"> • {rule.responsibleRole} • {rule.actionType}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Chip size="sm" variant="flat" color={hasDoc ? "success" : "warning"}>
                                                    {hasDoc ? "Uploaded" : "Pending"}
                                                </Chip>
                                                {!hasDoc && canActOnRule(rule) && (
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        onPress={() => {
                                                            setDocActionRule(rule);
                                                            setDocActionOpen(true);
                                                        }}
                                                    >
                                                        {String(rule.actionType || "") === "UPLOAD" ? "Upload" : "Create"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* ── Market State Tracker (only buyer & admin see price-change insights) ───────────────── */}
                {(isAdmin || isBuyer) && (
                    <Card className="w-full border border-default-200/50">
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
                            <Card className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-3xl border border-divider bg-content1/50">
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
                            </Card>

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
                        <Card className="md:col-span-1 border border-divider bg-content1/50">
                            <CardHeader className="font-semibold text-base px-4 md:px-6 pt-4 md:pt-6">Parties Involved</CardHeader>
                            <Divider className="my-2" />
                            <CardBody className="flex flex-col gap-4 px-4 md:px-6 pb-4 md:pb-6">
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-col gap-1">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-primary-600">Buyer</span>
                                        <span className="font-semibold text-base">{buyerAssociateName}</span>
                                        <span className={`text-xs font-semibold ${buyerPresence.online ? "text-success-600" : "text-default-500"}`}>
                                            {buyerPresence.online ? "Online" : `Last seen ${buyerPresence.lastSeenLabel}`}
                                        </span>
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
                                        <span className={`text-xs font-semibold ${sellerPresence.online ? "text-success-600" : "text-default-500"}`}>
                                            {sellerPresence.online ? "Online" : `Last seen ${sellerPresence.lastSeenLabel}`}
                                        </span>
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
                    <Card className="md:col-span-1 border border-divider bg-content1/50">
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
                    <Card className="md:col-span-1 border border-divider bg-success-50/20">
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
                    <Card className="lg:col-span-3 order-12 border border-divider bg-content1/50">
                        <CardHeader className="px-4 md:px-6 pt-5 pb-0 flex flex-col items-start gap-1">
                            <span className="font-bold text-lg tracking-tight">Responsibility Event</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-default-400">Execution Ownership Allocation</span>
                        </CardHeader>
                        <Divider className="mt-4" />
                        <CardBody className="flex flex-col gap-4 md:gap-6 px-4 md:px-6 py-6 font-sans">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                {/* Column 1: Responsibility Event Allocation */}
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-base font-bold text-foreground inline-flex items-center gap-2">
                                            <LuClipboardCheck className="text-primary" size={18} />
                                            Responsibility Allocation
                                        </h3>
                                        <p className="text-xs text-default-500">Buyer and supplier finalize who owns each execution step before order conversion.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                        {responsibilityFieldConfig.map((field) => {
                                            const currentValue = (responsibilityPlan as any)[field.key] || "";
                                            const allowed = field.allowed;
                                            const getOwnerStyles = (owner: string) => {
                                                switch (owner) {
                                                    case "buyer": return "bg-indigo-500 text-white";
                                                    case "seller": return "bg-amber-500 text-white";
                                                    case "obaol": return "bg-cyan-600 text-white";
                                                    default: return "bg-white text-primary";
                                                }
                                            };
                                            return (
                                                <div key={field.key} className="flex flex-col gap-3 p-3 md:p-3.5 rounded-2xl border border-default-200 bg-default-50/50 dark:bg-default-100/5 transition-all hover:border-primary/30 group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold border border-primary-200/30">
                                                            {(field as any).icon}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[11px] font-black text-foreground/90 uppercase tracking-widest leading-none">{field.label}</span>
                                                            <span className="text-[9px] text-default-400 mt-1 truncate uppercase tracking-tight">Ownership Assignment</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex bg-default-100/50 dark:bg-black/20 p-1 rounded-xl gap-1 border border-default-200/50 group-data-[locked=true]:opacity-60">
                                                        {allowed.map((option: string) => {
                                                            const isSelected = currentValue === option;
                                                            const canSelect = canEditResponsibilityPlan && (allowed.length > 1 || !isSelected);
                                                            return (
                                                                <button
                                                                    key={option}
                                                                    onClick={() => {
                                                                        if (canSelect) {
                                                                            setResponsibilityPlan((prev) => ({ ...prev, [field.key]: option as any }));
                                                                        }
                                                                    }}
                                                                    disabled={!canSelect}
                                                                    className={`flex-1 flex items-center justify-center py-1.5 px-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300
                                                                    ${isSelected
                                                                            ? `${getOwnerStyles(option)} z-10 font-black`
                                                                            : "text-default-400 hover:text-default-700 hover:bg-white/40 dark:hover:bg-default-200/20"
                                                                        }
                                                                    ${!canSelect && !isSelected ? "opacity-30 cursor-not-allowed grayscale" : "cursor-pointer"}
                                                                `}
                                                                >
                                                                    {ownerLabelByKey[option] || option}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {executionContext.tradeType === "INTERNATIONAL" && (
                                        <div className="rounded-2xl border border-primary-100/40 bg-primary-50/40 dark:bg-primary-900/10 px-4 py-3 text-[11px] text-primary-700 dark:text-primary-300 font-semibold leading-relaxed flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                                            Cargo Insurance is auto-assigned to the same owner who handles Freight Forwarding & Shipping.
                                        </div>
                                    )}
                                </div>

                                {/* Column 2: Execution Context & Route Logistics */}
                                <div className="flex flex-col gap-6 lg:border-l lg:border-default-200 lg:pl-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <h3 className="text-base font-bold text-foreground inline-flex items-center gap-2">
                                                <LuNavigation className="text-primary" size={18} />
                                                Execution Context
                                            </h3>
                                            <p className="text-xs text-default-500">Route and logistics specifics for this order.</p>
                                        </div>
                                        <div className="flex bg-default-100/50 dark:bg-default-100/10 p-1.5 rounded-2xl gap-1.5 border border-default-200/40 group-data-[locked=true]:opacity-60">
                                            {["DOMESTIC", "INTERNATIONAL"].map((type) => {
                                                const isSelected = executionContext.tradeType === type;
                                                const canToggle = (isBuyer || isAdmin) && canEditResponsibilityPlan;
                                                return (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            if (canToggle) {
                                                                const value = type as "DOMESTIC" | "INTERNATIONAL";
                                                                setExecutionContext((prev) => ({
                                                                    ...prev,
                                                                    tradeType: value,
                                                                    ...(value === "DOMESTIC"
                                                                        ? { originCountry: "", destinationCountry: "", originPort: "", destinationPort: "" }
                                                                        : { originState: "", destinationState: "", originDistrict: "", destinationDistrict: "" }),
                                                                }));
                                                            }
                                                        }}
                                                        disabled={!canToggle}
                                                        className={`px-4 h-9 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isSelected
                                                            ? "bg-white dark:bg-default-200 text-primary z-10"
                                                            : "text-default-500 hover:text-default-700 hover:bg-white/40 dark:hover:bg-default-200/20"
                                                            } ${!canToggle ? "opacity-30 cursor-not-allowed grayscale" : "cursor-pointer"}`}
                                                    >
                                                        {type.charAt(0) + type.slice(1).toLowerCase()}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {executionContext.tradeType === "DOMESTIC" ? (
                                            <>
                                                {showOriginLogisticsFields && (
                                                    <div className="flex flex-col gap-4 p-3.5 md:p-4 rounded-2xl border border-default-200 bg-default-50/50 dark:bg-default-100/5">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                <LuMapPin size={16} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-default-400 leading-none">Logistics</span>
                                                                <span className="text-sm font-bold text-foreground">Ship From</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-3">
                                                            <Select
                                                                size="sm"
                                                                label="State"
                                                                variant="bordered"
                                                                classNames={{ trigger: "rounded-lg border-default-200 h-9 min-h-unit-9" }}
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
                                                                label="District"
                                                                variant="bordered"
                                                                classNames={{ trigger: "rounded-lg border-default-200 h-9 min-h-unit-9" }}
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
                                                        </div>
                                                    </div>
                                                )}
                                                {showDestinationLogisticsFields && (
                                                    <div className="flex flex-col gap-4 p-3.5 md:p-4 rounded-2xl border border-default-200 bg-default-50/50 dark:bg-default-100/5">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                <LuNavigation size={16} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-default-400 leading-none">Logistics</span>
                                                                <span className="text-sm font-bold text-foreground">Ship To</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-3">
                                                            <Select
                                                                size="sm"
                                                                label="State"
                                                                variant="bordered"
                                                                classNames={{ trigger: "rounded-lg border-default-200 h-9 min-h-unit-9" }}
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
                                                                label="District"
                                                                variant="bordered"
                                                                classNames={{ trigger: "rounded-lg border-default-200 h-9 min-h-unit-9" }}
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
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {showOriginLogisticsFields && (
                                                    <div className="flex flex-col gap-4 p-4 md:p-5 rounded-3xl border border-default-200/60 bg-content1/50">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                <LuGlobe size={16} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-default-400 leading-none">International</span>
                                                                <span className="text-sm font-bold text-foreground">Origin</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-3">
                                                            {/* @ts-ignore */}
                                                            <Autocomplete
                                                                size="sm"
                                                                label="Country"
                                                                variant="bordered"
                                                                classNames={{ base: "rounded-xl", listbox: "rounded-xl" }}
                                                                selectedKey={executionContext.originCountry || null}
                                                                items={countries}
                                                                onSelectionChange={(key) => {
                                                                    const value = String(key || "");
                                                                    setExecutionContext((prev) => ({
                                                                        ...prev,
                                                                        originCountry: value,
                                                                        originPort: "",
                                                                    }));
                                                                }}
                                                            >
                                                                {(item: any) => (
                                                                    <AutocompleteItem key={item._id} textValue={item.name}>
                                                                        {item.name}
                                                                    </AutocompleteItem>
                                                                )}
                                                            </Autocomplete>
                                                            {/* @ts-ignore */}
                                                            <Autocomplete
                                                                size="sm"
                                                                label="Port"
                                                                variant="bordered"
                                                                classNames={{ base: "rounded-xl", listbox: "rounded-xl" }}
                                                                selectedKey={executionContext.originPort || null}
                                                                items={originPortOptions}
                                                                onSelectionChange={(key) => {
                                                                    setExecutionContext((prev) => ({ ...prev, originPort: String(key || "") }));
                                                                }}
                                                            >
                                                                {(item: any) => (
                                                                    <AutocompleteItem key={item._id} textValue={`${item.loCode} - ${item.name}`}>
                                                                        {item.loCode} - {item.name}
                                                                    </AutocompleteItem>
                                                                )}
                                                            </Autocomplete>
                                                        </div>
                                                    </div>
                                                )}
                                                {showDestinationLogisticsFields && (
                                                    <div className="flex flex-col gap-4 p-4 md:p-5 rounded-3xl border border-default-200/60 bg-content1/50">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                <LuAnchor size={16} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-default-400 leading-none">International</span>
                                                                <span className="text-sm font-bold text-foreground">Destination</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-3">
                                                            {/* @ts-ignore */}
                                                            <Autocomplete
                                                                size="sm"
                                                                label="Country"
                                                                variant="bordered"
                                                                classNames={{ base: "rounded-xl", listbox: "rounded-xl" }}
                                                                selectedKey={executionContext.destinationCountry || null}
                                                                items={countries}
                                                                onSelectionChange={(key) => {
                                                                    const value = String(key || "");
                                                                    setExecutionContext((prev) => ({
                                                                        ...prev,
                                                                        destinationCountry: value,
                                                                        destinationPort: "",
                                                                    }));
                                                                }}
                                                            >
                                                                {(item: any) => (
                                                                    <AutocompleteItem key={item._id} textValue={item.name}>
                                                                        {item.name}
                                                                    </AutocompleteItem>
                                                                )}
                                                            </Autocomplete>
                                                            {/* @ts-ignore */}
                                                            <Autocomplete
                                                                size="sm"
                                                                label="Port"
                                                                variant="bordered"
                                                                classNames={{ base: "rounded-xl", listbox: "rounded-xl" }}
                                                                selectedKey={executionContext.destinationPort || null}
                                                                items={destinationPortOptions}
                                                                onSelectionChange={(key) => {
                                                                    setExecutionContext((prev) => ({ ...prev, destinationPort: String(key || "") }));
                                                                }}
                                                            >
                                                                {(item: any) => (
                                                                    <AutocompleteItem key={item._id} textValue={`${item.loCode} - ${item.name}`}>
                                                                        {item.loCode} - {item.name}
                                                                    </AutocompleteItem>
                                                                )}
                                                            </Autocomplete>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <div className="md:col-span-2 flex flex-col gap-4 p-4 md:p-6 rounded-3xl border border-default-200/60 bg-content1/50">
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <LuPackage size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-default-400 leading-none">Product Specs</span>
                                                    <span className="text-sm font-bold text-foreground">Packaging Specifications</span>
                                                </div>
                                            </div>
                                            <Textarea
                                                size="sm"
                                                variant="flat"
                                                value={packagingSpecifications}
                                                onValueChange={setPackagingSpecifications}
                                                isDisabled={!canEditResponsibilityPlan}
                                                minRows={4}
                                                placeholder="Enter dimensions, material, labels, stacking, handling notes..."
                                                classNames={{
                                                    input: "text-sm",
                                                    inputWrapper: "bg-default-100/50 dark:bg-default-100/10 border-transparent hover:border-default-300 focus-within:border-primary transition-colors rounded-2xl"
                                                }}
                                            />
                                            <Input
                                                size="sm"
                                                label="Route & Logistics Notes"
                                                variant="bordered"
                                                classNames={{ inputWrapper: "rounded-xl border-default-200" }}
                                                placeholder="Any additional notes for the logistics team..."
                                                value={executionContext.routeNotes}
                                                onValueChange={(v) => setExecutionContext((prev) => ({ ...prev, routeNotes: v }))}
                                                isDisabled={!canEditRouteNotes}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {!hasPackagingSpecifications && (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-danger/5 border border-danger/20 text-danger-700 animate-pulse">
                                                <FiAlertCircle size={18} className="shrink-0" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">Action Required</span>
                                                    <p className="text-xs opacity-90">Packaging specifications are mandatory before order conversion.</p>
                                                </div>
                                            </div>
                                        )}

                                        {executionContext.tradeType === "INTERNATIONAL" && (
                                            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20 text-warning-700">
                                                <FiInfo size={18} className="mt-0.5 shrink-0" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">International Logistics Info</span>
                                                    <p className="text-xs opacity-90 leading-normal">
                                                        Additional cost components apply: inland-to-port movement, export/import packaging, freight, and customs clearance.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {isAssociateResponsibilityLocked && (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-default-100 border border-default-200 text-default-600">
                                                <LuShieldCheck size={18} className="shrink-0" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">Immutable Area</span>
                                                    <p className="text-xs opacity-90 text-default-500">Execution context is locked after finalization. Contact admin for edits.</p>
                                                </div>
                                            </div>
                                        )}

                                        {canEditResponsibilityPlan && (
                                            <div className="flex flex-col gap-2 mt-2">
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    variant="flat"
                                                    onPress={() => updateResponsibilityPlanMutation.mutate()}
                                                    isLoading={updateResponsibilityPlanMutation.isPending}
                                                    isDisabled={!isResponsibilityEventChanged}
                                                    className="w-full h-10 font-bold"
                                                >
                                                    Save Responsibility Event
                                                </Button>
                                                <span className="text-[10px] text-default-400 text-center uppercase tracking-widest font-bold">
                                                    {updateResponsibilityPlanMutation.isPending
                                                        ? "Saving updates..."
                                                        : responsibilitySavedAt
                                                            ? `Last saved ${dayjs(responsibilitySavedAt).format("DD MMM YYYY, hh:mm A")}`
                                                            : "No unsaved changes"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardBody >
                    </Card >

                    {/* Execution Inquiries */}
                    {
                        Array.isArray((enquiry as any)?.executionInquiries) && (enquiry as any).executionInquiries.length > 0 && (
                            <Card className="md:col-span-1 border border-divider bg-content1/50">
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
                        )
                    }

                    {/* Handling & Associates */}
                    <Card className="md:col-span-1 order-11 border border-divider bg-content1/50">
                        <CardHeader className="font-bold text-lg px-4 md:px-6 pt-4 md:pt-6">Handling & Assignment</CardHeader>
                        <Divider className="my-2" />
                        <CardBody className="flex flex-col gap-4 md:gap-5 px-4 md:px-6 pb-4 md:pb-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-default-400">Assigned Operator</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${assignedOperatorName === "OBAOL Desk" ? "bg-default-400" : assignedPresence.online ? "bg-success-500 animate-pulse" : "bg-default-400"}`} />
                                    <span className={`font-bold ${assignedOperatorName === "OBAOL Desk" ? "text-default-500" : "text-primary"}`}>{assignedOperatorName}</span>
                                </div>
                                {assignedOperatorName !== "OBAOL Desk" && (
                                    <span className={`text-xs ${assignedPresence.online ? "text-success-600" : "text-default-500"}`}>
                                        {assignedPresence.online ? "Online" : `Last seen ${assignedPresence.lastSeenLabel}`}
                                    </span>
                                )}
                            </div>
                            {isAdmin && (
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] uppercase font-bold text-default-400">Assign / Reassign Operator</span>
                                    <div className="flex gap-2">
                                        <Select
                                            size="sm"
                                            selectedKeys={selectedOperatorId ? [selectedOperatorId] : []}
                                            onSelectionChange={(keys) => {
                                                const arr = Array.from(keys as Set<string>);
                                                setSelectedOperatorId(arr[0] || "");
                                            }}
                                            className="flex-1"
                                            placeholder="Select operator"
                                        >
                                            {operatorOptions.map((emp: any) => (
                                                <SelectItem key={emp._id} value={emp._id}>
                                                    {emp.name || emp.firstName || emp.email}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <Button
                                            size="sm"
                                            color="primary"
                                            isLoading={assignOperatorMutation.isPending}
                                            onPress={() => assignOperatorMutation.mutate()}
                                            isDisabled={!selectedOperatorId}
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
                </div >

            </div>

            <Modal
                isOpen={inventoryAcceptOpen}
                onOpenChange={(open) => {
                    setInventoryAcceptOpen(open);
                    if (!open) setSelectedInventoryId("");
                    if (!open) {
                        setAcceptAttempted(false);
                        setInlineQuantity("");
                        setInlineWarehouseName("");
                        setInlineStateId("");
                        setInlineDistrictId("");
                    }
                }}
                isDismissable={false}
                isKeyboardDismissDisabled
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Select Inventory for Supplier Acceptance</ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-4">
                            <div className="text-sm text-default-500">
                                Reserve <span className="font-semibold text-foreground">{enquiry?.quantity || 0} MT</span> from the selected warehouse.
                            </div>
                            <div className="rounded-lg border border-default-200/60 bg-default-50/60 px-3 py-2 text-xs text-default-500">
                                This inventory and location information is <span className="font-semibold">not visible to the buyer</span>. It is used only for internal documentation and fulfillment.
                            </div>

                            {inventoryOptions.length > 0 ? (
                                <div className="flex gap-2 p-1 bg-default-100 rounded-xl overflow-hidden">
                                    <Button
                                        size="sm"
                                        variant={!isAddingNewInventory ? "solid" : "light"}
                                        color={!isAddingNewInventory ? "primary" : "default"}
                                        className="flex-1 font-bold h-8"
                                        onPress={() => {
                                            setIsAddingNewInventory(false);
                                            setAcceptAttempted(false);
                                        }}
                                        data-sound="tab"
                                        startContent={<FiList size={14} />}
                                    >
                                        Existing
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={isAddingNewInventory ? "solid" : "light"}
                                        color={isAddingNewInventory ? "primary" : "default"}
                                        className="flex-1 font-bold h-8"
                                        onPress={() => {
                                            setIsAddingNewInventory(true);
                                            setAcceptAttempted(false);
                                        }}
                                        data-sound="tab"
                                        startContent={<FiPlus size={14} />}
                                    >
                                        New Stock
                                    </Button>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-warning-300/30 bg-warning-500/10 px-3 py-2 text-sm text-warning-700">
                                    No existing inventory found. Please add a new warehouse and stock below.
                                </div>
                            )}

                            {!isAddingNewInventory && inventoryOptions.length > 0 ? (
                                <>
                                    <Select
                                        label="Select Warehouse"
                                        placeholder="Choose inventory"
                                        selectedKeys={selectedInventoryId ? new Set([selectedInventoryId]) : new Set()}
                                        renderValue={(items) => {
                                            const item = items?.[0];
                                            const data = (item as any)?.data as any;
                                            if (!data) return "Choose inventory";
                                            const name = data.warehouseName || "Warehouse";
                                            return `${name} • ${data.availableQty} MT available`;
                                        }}
                                        onSelectionChange={(keys) => {
                                            const arr = Array.from(keys as Set<string>);
                                            const id = arr[0] || "";
                                            setSelectedInventoryId(id);
                                            setInlineQuantity("");
                                            setAcceptAttempted(false);
                                        }}
                                    >
                                        {inventoryOptions.map((row: any) => (
                                            <SelectItem
                                                key={row.invId}
                                                value={row.invId}
                                                isDisabled={row.availableQty <= 0}
                                                textValue={row.warehouseName || "Warehouse"}
                                            >
                                                {row.warehouseName || "Warehouse"} • {row.availableQty} MT available
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </>
                            ) : (
                                <>
                                    <Input
                                        label="Warehouse Name"
                                        placeholder="Enter warehouse name"
                                        value={inlineWarehouseName}
                                        onValueChange={setInlineWarehouseName}
                                        variant="bordered"
                                    />
                                    {inventoryOptions.length === 0 && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Select
                                                label="State"
                                                placeholder="Select state"
                                                selectedKeys={inlineStateId ? new Set([inlineStateId]) : new Set()}
                                                onSelectionChange={(keys) => {
                                                    const arr = Array.from(keys as Set<string>);
                                                    const id = arr[0] || "";
                                                    setInlineStateId(id);
                                                    setInlineDistrictId("");
                                                }}
                                            >
                                                {states.map((item: any) => (
                                                    <SelectItem key={getEntityId(item)} value={getEntityId(item)}>
                                                        {item?.name || item?.stateName || "State"}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                            <Select
                                                label="District"
                                                placeholder="Select district"
                                                selectedKeys={inlineDistrictId ? new Set([inlineDistrictId]) : new Set()}
                                                onSelectionChange={(keys) => {
                                                    const arr = Array.from(keys as Set<string>);
                                                    const id = arr[0] || "";
                                                    setInlineDistrictId(id);
                                                }}
                                                isDisabled={!inlineStateId}
                                            >
                                                {inlineDistrictOptions.map((item: any) => (
                                                    <SelectItem key={getEntityId(item)} value={getEntityId(item)}>
                                                        {item?.name || item?.districtName || "District"}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label={isAddingNewInventory ? "Total Stock (MT)" : "Add Stock (MT)"}
                                    type="number"
                                    placeholder="0"
                                    value={inlineQuantity}
                                    onValueChange={setInlineQuantity}
                                    variant="bordered"
                                />
                            </div>

                            {selectedInventory && !isAddingNewInventory && (
                                <div className="text-[10px] text-default-400 uppercase font-black px-1">
                                    Current Stock: {selectedInventory.availableQty} MT available • {selectedInventory.reservedQty} MT reserved • {selectedInventory.quantity} MT total
                                </div>
                            )}
                            {shouldShowInsufficient && (
                                <div className="text-xs text-danger-600 font-semibold px-1">
                                    Please add the quantity as per the order into your warehouse. Otherwise, select another warehouse with the desired quantity.
                                </div>
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter className="border-t border-divider">
                        <Button variant="light" onPress={() => setInventoryAcceptOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            color="success"
                            className="font-bold"
                            onPress={handleInventoryAccept}
                            isLoading={sellerAcceptMutation.isPending}
                            isDisabled={
                                (isAddingNewInventory || inventoryOptions.length === 0)
                                    ? (!inlineWarehouseName || !inlineQuantity || (inventoryOptions.length === 0 && (!inlineStateId || !inlineDistrictId)))
                                    : (!selectedInventoryId)
                            }
                        >
                            Save & Accept Enquiry
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

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
                                    <div className="rounded-lg bg-default-100 px-3 py-2 sm:col-span-2">
                                        Packaging Specs: <b>{String(packagingSpecifications || "").trim() || "Not provided"}</b>
                                    </div>
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

            <Modal
                isOpen={docActionOpen}
                onOpenChange={setDocActionOpen}
                isDismissable={false}
                isKeyboardDismissDisabled
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        {docActionRule ? `${docActionRule.docType} — ${docActionRule.actionType}` : "Create Document"}
                    </ModalHeader>
                    <ModalBody>
                        {String(docActionRule?.actionType || "") === "UPLOAD" && (
                            <Input
                                label="File URL"
                                placeholder="https://..."
                                value={docActionFileUrl}
                                onChange={(e) => setDocActionFileUrl(e.target.value)}
                            />
                        )}
                        <div className="text-xs text-default-500">
                            {docActionRule?.responsibleRole ? `Responsible: ${docActionRule.responsibleRole}` : ""}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={() => setDocActionOpen(false)} isDisabled={createDocMutation.isPending}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onPress={() => createDocMutation.mutate()}
                            isLoading={createDocMutation.isPending}
                            isDisabled={String(docActionRule?.actionType || "") === "UPLOAD" && !docActionFileUrl.trim()}
                        >
                            {String(docActionRule?.actionType || "") === "UPLOAD" ? "Upload" : "Create"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal
                isOpen={reopenRequestOpen}
                onOpenChange={(open) => {
                    setReopenRequestOpen(open);
                    if (!open) setReopenReason("");
                }}
                isDismissable={false}
                isKeyboardDismissDisabled
            >
                <ModalContent>
                    <ModalHeader>Request Reopen</ModalHeader>
                    <ModalBody>
                        <Textarea
                            label="Reason (optional)"
                            placeholder="Add a short reason for reopening this enquiry."
                            minRows={3}
                            value={reopenReason}
                            onValueChange={setReopenReason}
                        />
                        <div className="text-xs text-default-500">
                            This will be reviewed by admin. If approved, a new enquiry will be created.
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={() => setReopenRequestOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            color="danger"
                            onPress={() => reopenRequestMutation.mutate()}
                            isLoading={reopenRequestMutation.isPending}
                        >
                            Submit Request
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div >
    );
}
