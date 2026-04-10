"use client";

import React, { useState, useContext, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
    Tooltip,
    Checkbox,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { FiPackage, FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheckCircle, FiPhone, FiExternalLink, FiPlus, FiList, FiSearch, FiTruck, FiAnchor, FiFileText, FiShield, FiPercent, FiClipboard, FiNavigation, FiEye, FiCheck, FiInfo, FiArrowRight, FiEdit3 } from "react-icons/fi";
import { LuMail, LuPhone, LuPackage, LuTruck, LuAnchor, LuShieldCheck, LuClipboardCheck, LuFileCheck, LuGlobe, LuUser, LuTag, LuSearch, LuEye, LuCheck, LuMapPin, LuNavigation, LuChevronLeft, LuActivity, LuFileText, LuHistory, LuClock, LuStore } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { useCurrency } from "@/context/CurrencyContext";
import { formatLastSeen, getPresenceStatus, isOnline } from "@/utils/presence";
import ResponsibilityEventForm from "@/components/dashboard/responsibilities/ResponsibilityEventForm";
import DocumentTemplatePreview from "@/components/dashboard/Documents/DocumentTemplatePreview";
import BrandedLoader from "@/components/ui/BrandedLoader";

// Defensive aliases to avoid runtime crashes if older JSX still references Lu* icons.
const LuTrendingDown = FiTrendingDown;
const LuCreditCard = FiPercent;
const LuFileSignature = FiFileText;
const LuEdit3 = FiEdit3;
const LuCheckCircle = FiCheckCircle;

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
    const { convertRate, formatRate } = useCurrency();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isFinalizeOpen, onOpen: onFinalizeOpen, onOpenChange: onFinalizeOpenChange } = useDisclosure();
    const [conversionNote, setConversionNote] = useState("");
    const { user } = useContext(AuthContext);
    const [selectedSupplierOperatorId, setSelectedSupplierOperatorId] = useState<string>("");
    const [selectedDealCloserOperatorId, setSelectedDealCloserOperatorId] = useState<string>("");
    const [selectedHandlerOperatorId, setSelectedHandlerOperatorId] = useState<string>("");
    const [commitUntil, setCommitUntil] = useState<string>("");
    const [buyerSpecification, setBuyerSpecification] = useState<string>("");
    const [packagingSpecifications, setPackagingSpecifications] = useState<string>("");
    const [specSavedAt, setSpecSavedAt] = useState<string>("");
    const [responsibilitySavedAt, setResponsibilitySavedAt] = useState<string>("");
    const [responsibilitiesLockedOverride, setResponsibilitiesLockedOverride] = useState<boolean>(false);
    const [inlandTransportSegments, setInlandTransportSegments] = useState<Array<{ label: string; from: string; to: string }>>([]);
    const [workflowStage, setWorkflowStage] = useState<string>("ENQUIRY_CREATED");
    const [importDeliveryMode, setImportDeliveryMode] = useState<string>("");
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
    const [docViewerOpen, setDocViewerOpen] = useState(false);
    const [docViewerDoc, setDocViewerDoc] = useState<any>(null);
    const [conversionError, setConversionError] = useState("");
    const [isConvertingOrder, setIsConvertingOrder] = useState(false);
    const [reopenRequestOpen, setReopenRequestOpen] = useState(false);
    const [reopenReason, setReopenReason] = useState("");
    const [clarificationOpen, setClarificationOpen] = useState(false);
    const [clarificationRate, setClarificationRate] = useState("");
    const [clarificationReasonRate, setClarificationReasonRate] = useState(false);
    const [clarificationReasonPayment, setClarificationReasonPayment] = useState(false);
    const [clarificationReasonTimeline, setClarificationReasonTimeline] = useState(false);
    const [clarificationCommunicated, setClarificationCommunicated] = useState(false);
    const [clarificationDeliveryMode, setClarificationDeliveryMode] = useState<"DELIVER_TO_LOCATION" | "PRODUCT_READY" | "">("");
    const [clarificationDeliveryDate, setClarificationDeliveryDate] = useState("");
    const [revisionError, setRevisionError] = useState("");
    const [revisionReplyError, setRevisionReplyError] = useState("");
    const [revisionReplySuccess, setRevisionReplySuccess] = useState("");
    const [revisionConfirmError, setRevisionConfirmError] = useState("");
    const [revisionReplies, setRevisionReplies] = useState<Array<{ key: string; acknowledged: boolean; counterRate?: string }>>([]);
    const [pendingActionKey, setPendingActionKey] = useState<string>("");
    const [draftQuotationError, setDraftQuotationError] = useState<string>("");
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
    const [selectedIncotermId, setSelectedIncotermId] = useState<string>("");
    const [selectedPaymentTermId, setSelectedPaymentTermId] = useState<string>("");
    const [tradeTermsSavedAt, setTradeTermsSavedAt] = useState<string>("");
    const [assignmentSavedAt, setAssignmentSavedAt] = useState<string>("");

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
        queryKey: ["flow-rules", "TRADE_ENQUIRY"],
        queryFn: () => getData(apiRoutes.flowRules.list, { flowType: "TRADE_ENQUIRY" }),
    });
    const quotationRows = Array.isArray(quotationResponse?.data?.data?.data)
        ? quotationResponse?.data?.data?.data
        : (quotationResponse?.data?.data || []);
    const quotationDoc = quotationRows?.[0] || null;
    const quotationId = quotationDoc?._id || null;
    const quotationStatus = String(quotationDoc?.status || "").toUpperCase();
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
    const { data: sellerInventoryResponse, isLoading: isSellerInventoryLoading } = useQuery({
        queryKey: ["seller-inventories", sellerCompanyId, productVariantId],
        queryFn: () =>
            getData(inventoryRoutes.getAll, {
                associateCompany: sellerCompanyId,
                productVariant: productVariantId,
                limit: 200,
            }),
        enabled: Boolean(sellerCompanyId && productVariantId),
    });
    const { data: sellerReservationResponse, isLoading: isSellerReservationLoading } = useQuery({
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
    const { data: paymentTermResponse } = useQuery({
        queryKey: ["payment-terms"],
        queryFn: () => getData(apiRoutes.paymentTerm.getAll),
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
    const getCountryLabel = (country: any): string =>
        String(country?.name || country?.label || country?.countryName || country?.country || "");
    const sortedCountries = [...countries].sort((a: any, b: any) =>
        getCountryLabel(a).localeCompare(getCountryLabel(b), "en", { sensitivity: "base" })
    );
    const originSeaPorts = parseMasterRows(originPortsResponse).filter((item: any) => !item?.isDeleted);
    const destinationSeaPorts = parseMasterRows(destinationPortsResponse).filter((item: any) => !item?.isDeleted);
    const enquirySpecificationValue = (enquiry as any)?.specifications || (enquiry as any)?.specification || "";
    const enquiryPackagingSpecificationsValue = (enquiry as any)?.packagingSpecifications || "";
    const isImportEnquiry = String((enquiry as any)?.sourceType || "").toUpperCase() === "IMPORT" || Boolean((enquiry as any)?.importListingId);
    useEffect(() => {
        if (selectedPaymentTermId || paymentTermOptions.length === 0) return;
        const selectedIncoterm = incotermOptions.find((it: any) => String(it?._id || it?.id) === String(selectedIncotermId));
        const incotermCode = String(selectedIncoterm?.code || "").toUpperCase();
        const filteredTerms = paymentTermOptions.filter((term: any) => {
            const allowed = Array.isArray(term?.applicableIncoterms) ? term.applicableIncoterms : [];
            if (!incotermCode) return true;
            if (!allowed.length) return true;
            return allowed.map((v: any) => String(v).toUpperCase()).includes(incotermCode);
        });
        const defaultTerm =
            filteredTerms.find((term: any) => Boolean(term?.isDefault)) ||
            paymentTermOptions.find((term: any) => Boolean(term?.isDefault)) ||
            filteredTerms[0] ||
            paymentTermOptions[0];
        if (defaultTerm?._id) setSelectedPaymentTermId(String(defaultTerm._id));
    }, [paymentTermOptions, selectedPaymentTermId, selectedIncotermId, incotermOptions]);
    useEffect(() => {
        setBuyerSpecification(enquirySpecificationValue);
    }, [enquirySpecificationValue]);
    useEffect(() => {
        setPackagingSpecifications(String(enquiryPackagingSpecificationsValue || ""));
    }, [enquiryPackagingSpecificationsValue]);
    useEffect(() => {
        if (!enquiry) return;
        const docs = Array.isArray(enquiryDocsResponse?.data?.data?.data)
            ? enquiryDocsResponse?.data?.data?.data
            : Array.isArray(enquiryDocsResponse?.data?.data)
                ? enquiryDocsResponse?.data?.data
                : Array.isArray(enquiryDocsResponse?.data)
                    ? enquiryDocsResponse?.data
                    : [];
        const hasSubmittedDoc = (type: string) =>
            docs.some((doc: any) => String(doc?.type || "").toUpperCase() === type && String(doc?.status || "").toUpperCase() !== "DRAFT");
        const hasDocType = (type: string) =>
            docs.some((doc: any) => String(doc?.type || "").toUpperCase() === type);
        const fallbackStage = (() => {
            const status = String((enquiry as any)?.status || "").toUpperCase();
            if (status === "CONVERTED" || (enquiry as any)?.order) return "CONVERT_TO_ORDER";
            if (isImportEnquiry) return "QUOTATION_REVISION";
            if ((enquiry as any)?.poSubmittedAt) return "CONVERT_TO_ORDER";
            if ((enquiry as any)?.otherDocsCompletedAt) return "PURCHASE_ORDER_CREATED";
            if ((enquiry as any)?.proformaCreatedAt) return "OTHER_DOCUMENTS";
            if ((enquiry as any)?.responsibilitiesFinalizedAt) return "PROFORMA_ISSUED";
            if ((enquiry as any)?.buyerConfirmedAt) return "RESPONSIBILITIES_FINALIZED";
            if ((enquiry as any)?.quotationCreatedAt) return "QUOTATION_DECISION";
            if ((enquiry as any)?.revisionRequestedAt) return "QUOTATION_REVISION";
            if ((enquiry as any)?.supplierQtyConfirmedAt) return "QUOTATION_REVISION";
            if ((enquiry as any)?.loiSubmittedAt) return "LOI_ACCEPTED_QTY_CONFIRMED";
            if (hasSubmittedDoc("PURCHASE_ORDER")) return "CONVERT_TO_ORDER";
            if (hasSubmittedDoc("PROFORMA_INVOICE")) return "OTHER_DOCUMENTS";
            if (hasSubmittedDoc("QUOTATION")) return "QUOTATION_DECISION";
            return "ENQUIRY_CREATED";
        })();
        setWorkflowStage(String((enquiry as any)?.workflowStage || fallbackStage));
        setImportDeliveryMode(String((enquiry as any)?.importDeliveryMode || ""));
        setSelectedSupplierOperatorId(String((enquiry as any)?.supplierOperatorId?._id || (enquiry as any)?.supplierOperatorId || ""));
        setSelectedDealCloserOperatorId(String((enquiry as any)?.dealCloserOperatorId?._id || (enquiry as any)?.dealCloserOperatorId || ""));
        setSelectedHandlerOperatorId(String((enquiry as any)?.handlerOperatorId?._id || (enquiry as any)?.handlerOperatorId || ""));
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
        setSelectedIncotermId(String((enquiry as any)?.preferredIncoterm?._id || (enquiry as any)?.preferredIncoterm || ""));
        setSelectedPaymentTermId(String((enquiry as any)?.paymentTermId?._id || (enquiry as any)?.paymentTermId || ""));
        const rounds = Array.isArray((enquiry as any)?.revisionRounds) ? (enquiry as any).revisionRounds : [];
        const legacyItems = Array.isArray((enquiry as any)?.revisionThread?.items) ? (enquiry as any).revisionThread.items : [];
        const derivedRounds = rounds.length
            ? rounds
            : legacyItems.length
                ? [{
                    roundId: "legacy",
                    status: (enquiry as any)?.revisionThread?.buyerConfirmedAt ? "CONFIRMED" : "OPEN",
                    items: legacyItems,
                    buyerRequestedAt: (enquiry as any)?.revisionThread?.buyerRequestedAt || null,
                    buyerConfirmedAt: (enquiry as any)?.revisionThread?.buyerConfirmedAt || null,
                    closedAt: (enquiry as any)?.revisionThread?.buyerConfirmedAt || null,
                }]
                : [];
        const openRound = [...derivedRounds].reverse().find((round: any) => String(round?.status || "").toUpperCase() === "OPEN");
        const currentRound = openRound || derivedRounds[derivedRounds.length - 1];
        const currentItems = Array.isArray(currentRound?.items) ? currentRound.items : [];
        if (currentItems.length) {
            setRevisionReplies(currentItems.map((item: any) => ({
                key: String(item?.key || "").toUpperCase(),
                acknowledged: Boolean(item?.supplierAcknowledged),
                counterRate: item?.supplierCounterRate !== null && item?.supplierCounterRate !== undefined ? String(item.supplierCounterRate) : "",
            })));
        } else {
            setRevisionReplies([]);
        }
    }, [enquiry, enquiryDocsResponse, isImportEnquiry]);
    useEffect(() => {
        if (!enquiry) return;
        setResponsibilitiesLockedOverride(Boolean((enquiry as any)?.responsibilitiesFinalizedAt));
    }, [enquiry, (enquiry as any)?.responsibilitiesFinalizedAt]);
    useEffect(() => {
        if (!enquiry) return;
        if (inlandTransportSegments.length > 0) return;
        const tasks = Array.isArray((enquiry as any)?.executionInquiries)
            ? (enquiry as any).executionInquiries
            : [];
        const segments = tasks
            .filter((task: any) => String(task?.type || "").toUpperCase() === "TRANSPORTATION")
            .map((task: any, index: number) => ({
                label: String(task?.details?.segmentLabel || task?.title || "").replace(/^Inland Transportation:\s*/i, "").trim(),
                from: String(task?.details?.from || ""),
                to: String(task?.details?.to || ""),
            }))
            .filter((segment: any) => segment.label || segment.from || segment.to);
        if (segments.length > 0) setInlandTransportSegments(segments);
    }, [enquiry, inlandTransportSegments.length]);
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
    useEffect(() => {
        if (isOpen) {
            setConversionError("");
        }
    }, [isOpen]);

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
    const getCountryNameById = React.useCallback((countryId: string) =>
        countryRowsForCheck.find((c: any) => String(c?._id || c?.id || "") === String(countryId || ""))?.name || "", [countryRowsForCheck]);
    const isIndiaName = (name: string) => String(name || "").trim().toLowerCase() === "india";
    const isFromIndia = executionContext.tradeType === "INTERNATIONAL" && isIndiaName(getCountryNameById(executionContext.originCountry));
    const isToIndia = executionContext.tradeType === "INTERNATIONAL" && isIndiaName(getCountryNameById(executionContext.destinationCountry));

    const isImportPortPickup = isImportEnquiry && String(importDeliveryMode || "").toUpperCase() === "PORT_PICKUP";
    const responsibilityFieldConfig = React.useMemo(() => {
        return [
            { key: "procurementBy", label: "Procurement / Sourcing", allowed: ["buyer", "seller", "obaol"], show: true, icon: <LuSearch size={16} /> },
            { key: "qualityTestingBy", label: "Quality Testing", allowed: ["buyer", "seller", "obaol"], show: true, icon: <LuClipboardCheck size={16} /> },
            { key: "packagingBy", label: "Packaging & Labelling", allowed: ["buyer", "seller", "obaol"], show: true, icon: <LuPackage size={16} /> },
            { key: "transportBy", label: "Inland Transportation", allowed: ["buyer", "seller", "obaol"], show: !isImportPortPickup, icon: <LuTruck size={16} /> },
            { key: "shippingBy", label: "Freight Forwarding & Shipping", allowed: ["buyer", "seller", "obaol"], show: executionContext.tradeType === "INTERNATIONAL", icon: <LuAnchor size={16} /> },
            { key: "exportCustomsBy", label: "Export Customs", allowed: ["buyer", "seller", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isFromIndia, icon: <LuFileCheck size={16} /> },
            { key: "importCustomsBy", label: "Import Customs", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuFileCheck size={16} /> },
            { key: "dutiesTaxesBy", label: "Duties & Taxes", allowed: ["buyer"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuTag size={16} /> },
            { key: "portHandlingBy", label: "Port Handling", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuAnchor size={16} /> },
            { key: "destinationInlandTransportBy", label: "Port → Warehouse Transport", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia && !isImportPortPickup, icon: <LuTruck size={16} /> },
            { key: "destinationInspectionBy", label: "Destination Inspection", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia && !isImportPortPickup, icon: <LuEye size={16} /> },
            { key: "finalDeliveryConfirmationBy", label: "Final Delivery Check", allowed: ["obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia && !isImportPortPickup, icon: <LuCheck size={16} /> },
        ].filter((f) => f.show);
    }, [executionContext.tradeType, isFromIndia, isToIndia, isImportPortPickup]);

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
        ...(isImportPortPickup ? [] : ["transportBy"]),
    ];
    const internationalRequiredResponsibilities = [
        "shippingBy",
        ...(isFromIndia ? ["exportCustomsBy"] : []),
        ...(isToIndia
            ? [
                "importCustomsBy",
                "dutiesTaxesBy",
                "portHandlingBy",
                ...(isImportPortPickup ? [] : ["destinationInlandTransportBy", "destinationInspectionBy", "finalDeliveryConfirmationBy"]),
            ]
            : []),
    ];
    const requiredResponsibilityKeys = executionContext.tradeType === "INTERNATIONAL"
        ? [...domesticRequiredResponsibilities, ...internationalRequiredResponsibilities]
        : domesticRequiredResponsibilities;
    const hasFullResponsibilityPlan = requiredResponsibilityKeys.every((key) =>
        allowedResponsibilityValues[key]?.has(String((responsibilityPlan as any)[key] || ""))
    );

    const updateOperatorRolesMutation = useMutation({
        mutationFn: async () => {
            const roleLower = String(user?.role || "").toLowerCase();
            const payload: any = {
                supplierOperatorId: selectedSupplierOperatorId || null,
                dealCloserOperatorId: selectedDealCloserOperatorId || null,
            };
            if (roleLower === "admin") {
                payload.handlerOperatorId = selectedHandlerOperatorId || null;
            }
            return patchData(`${apiRoutes.enquiry.getAll}/${id}`, payload);
        },
        onSuccess: () => {
            toast.success("Operator roles updated.");
            setAssignmentSavedAt(new Date().toISOString());
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || "Failed to update operator roles.";
            toast.error(msg);
        },
    });
    const volunteerHandlerMutation = useMutation({
        mutationFn: async () =>
            patchData(`${apiRoutes.enquiry.getAll}/${id}`, {
                handlerOperatorId: user?.id || null,
            }),
        onSuccess: () => {
            toast.success("You are now assigned as handler.");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || "Failed to volunteer as handler.";
            toast.error(msg);
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

    const openDocViewer = (doc: any) => {
        if (!doc) return;
        setDocViewerDoc(doc);
        setDocViewerOpen(true);
    };

    const createQuotationMutation = useMutation({
        mutationFn: async () => {
            const request = postData(apiRoutes.tradeDocuments.create, { type: "QUOTATION", enquiryId: id });
            const timeout = new Promise((_, reject) => {
                const timer = setTimeout(() => {
                    clearTimeout(timer);
                    reject(new Error("Draft Quotation timed out. Please check server logs or OBAOL config."));
                }, 15000);
            });
            return (await Promise.race([request, timeout])) as any;
        },
        onSuccess: (res: any) => {
            toast.success("Quotation created.");
            setDraftQuotationError("");
            queryClient.invalidateQueries({ queryKey: ["trade-documents", id] });
            queryClient.invalidateQueries({ queryKey: ["trade-documents", "enquiry", id] });
            const createdDoc = res?.data?.data || null;
            if (createdDoc) {
                openDocViewer(createdDoc);
                return;
            }
            (async () => {
                try {
                    const refresh = await getData(apiRoutes.tradeDocuments.list, { page: 1, limit: 5, enquiryId: id, type: "QUOTATION" });
                    const rows = Array.isArray(refresh?.data?.data?.data)
                        ? refresh.data.data.data
                        : Array.isArray(refresh?.data?.data)
                            ? refresh.data.data
                            : Array.isArray(refresh?.data)
                                ? refresh.data
                                : [];
                    if (rows?.[0]) {
                        openDocViewer(rows[0]);
                        return;
                    }
                } catch {
                    // ignore fallback failure
                }
                toast.info("Quotation drafted.");
            })();
        },
        onError: (error: any) => {
            const details = error?.response?.data?.message || error?.message || "Failed to create quotation.";
            toast.error(details);
            setDraftQuotationError(details);
        },
    });
    const submitQuotationMutation = useMutation({
        mutationFn: async () => {
            if (!quotationId) throw new Error("Quotation not found.");
            await patchData(apiRoutes.tradeDocuments.update(quotationId), { status: "SENT" });
            await patchData(`${apiRoutes.enquiry.getAll}/${id}/actions`, { actionKey: "QUOTATION_CREATED" });
            return true;
        },
        onSuccess: () => {
            toast.success("Quotation submitted.");
            queryClient.invalidateQueries({ queryKey: ["trade-documents", id] });
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to submit quotation.");
        },
    });
    const reopenQuotationMutation = useMutation({
        mutationFn: async () => {
            if (!quotationId) throw new Error("Quotation not found.");
            return patchData(apiRoutes.tradeDocuments.update(quotationId), { status: "DRAFT" });
        },
        onSuccess: () => {
            toast.success("Quotation reopened for revision.");
            queryClient.invalidateQueries({ queryKey: ["trade-documents", id] });
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to reopen quotation.");
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
    const applyActionMutation = useMutation({
        mutationFn: async (payload: Record<string, any>) =>
            patchData(`${apiRoutes.enquiry.getAll}/${id}/actions`, payload),
        onSuccess: () => {
            toast.success("Action applied.");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to apply action.");
        },
        onSettled: () => {
            setPendingActionKey("");
        },
    });
    const revisionRequestMutation = useMutation({
        mutationFn: async () => {
            const reasons: string[] = [];
            if (clarificationReasonRate) reasons.push("RATE");
            if (clarificationReasonPayment) reasons.push("PAYMENT_TERMS");
            if (clarificationReasonTimeline) reasons.push("DELIVERY_TIMELINE");
            return patchData(`${apiRoutes.enquiry.getAll}/${id}/actions`, {
                actionKey: "REVISION_REQUESTED",
                reasons,
                revisionRate: clarificationReasonRate ? Number(clarificationRate) : undefined,
                deliveryMode: clarificationReasonTimeline ? clarificationDeliveryMode : undefined,
                deliveryDate: clarificationReasonTimeline ? clarificationDeliveryDate : undefined,
                communicatedConfirmed: clarificationCommunicated,
            });
        },
        onSuccess: () => {
            toast.success("Revision requested.");
            setClarificationOpen(false);
            setClarificationRate("");
            setClarificationReasonRate(false);
            setClarificationReasonPayment(false);
            setClarificationReasonTimeline(false);
            setClarificationCommunicated(false);
            setClarificationDeliveryMode("");
            setClarificationDeliveryDate("");
            setRevisionError("");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Failed to request revision.";
            setRevisionError(message);
            toast.error(message);
        },
    });
    const revisionReplyMutation = useMutation({
        mutationFn: async () => {
            if (!revisionReplies.length) {
                throw new Error("No replies to save.");
            }
            return patchData(`${apiRoutes.enquiry.getAll}/${id}/revision-reply`, {
            replies: revisionReplies.map((item) => ({
                key: String(item.key || "").toUpperCase(),
                acknowledged: item.acknowledged,
                counterRate: item.key === "RATE" && item.acknowledged
                    ? (() => {
                            const raw = String(item.counterRate ?? "").trim();
                            if (!raw) return undefined;
                            const parsed = Number(raw);
                            return Number.isNaN(parsed) ? undefined : parsed;
                        })()
                        : undefined,
                })),
            });
        },
        onSuccess: (res: any) => {
            toast.success("Revision reply saved.");
            setRevisionReplyError("");
            setRevisionReplySuccess("Reply saved.");
            setRevisionConfirmError("");
            const savedInquiry = res?.data?.data || null;
            const savedItems = Array.isArray(savedInquiry?.revisionThread?.items)
                ? savedInquiry.revisionThread.items
                : [];
            if (savedItems.length) {
                setRevisionReplies(savedItems.map((item: any) => ({
                    key: String(item?.key || "").toUpperCase(),
                    acknowledged: Boolean(item?.supplierAcknowledged),
                    counterRate: item?.supplierCounterRate !== null && item?.supplierCounterRate !== undefined ? String(item.supplierCounterRate) : "",
                })));
            }
            if (savedInquiry) {
                // Ensure cached data structure matches what's expected by useQuery's select function
                queryClient.setQueryData(["enquiry", id], { data: { data: savedInquiry } });
            }
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || error?.message || "Failed to save revision reply.";
            setRevisionReplyError(message);
            setRevisionReplySuccess("");
            toast.error(message);
        },
    });
    const finalizeResponsibilitiesMutation = useMutation({
        mutationFn: async () =>
            patchData(`${apiRoutes.enquiry.getAll}/${id}/finalize-responsibilities`, {
                executionContext,
                packagingSpecifications,
                inlandTransportSegments,
            }),
        onSuccess: (res: any) => {
            toast.success("Responsibilities finalized and execution inquiries generated.");
            setResponsibilitiesLockedOverride(true);
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
    const updateImportDeliveryModeMutation = useMutation({
        mutationFn: (mode: string) =>
            patchData(`${apiRoutes.enquiry.getAll}/${id}`, { importDeliveryMode: mode }),
        onSuccess: () => {
            toast.success("Import delivery mode updated.");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update import delivery mode.");
        },
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

    const responsibilitySummary = React.useMemo(() => {
        const plan = (responsibilityPlan || (enquiry as any)?.responsibilityPlan || {}) as any;
        const execution = (executionContext || {}) as any;
        const incotermLabel = incotermOptions.find((item: any) => item._id === selectedIncotermId)?.code
            || enquiry?.preferredIncoterm?.code
            || "Not specified";
        const paymentLabel = paymentTermOptions.find((item: any) => item._id === selectedPaymentTermId)?.label
            || enquiry?.paymentTermId?.label
            || "Not specified";
            
        const getStateNameById = (id: string) => states.find((s: any) => String(s?._id || s?.id) === String(id))?.name || "";
        const getDistrictNameById = (id: string) => districts.find((d: any) => String(d?._id || d?.id) === String(id))?.name || "";
        const getPortNameById = (id: string) => {
            const allPorts = [...originSeaPorts, ...destinationSeaPorts];
            return allPorts.find((p: any) => String(p?._id || p?.id) === String(id))?.name || "";
        };

        const buildDomesticLabel = (stateId?: string, districtId?: string) => {
            const parts = [getStateNameById(String(stateId || "")), getDistrictNameById(String(districtId || ""))].filter(Boolean);
            return parts.length ? parts.join(" • ") : "Not specified";
        };
        const buildInternationalLabel = (countryId?: string, stateId?: string, districtId?: string, portId?: string) => {
            const parts = [
                getCountryNameById(countryId) || String(countryId || ""),
                getStateNameById(String(stateId || "")),
                getDistrictNameById(String(districtId || "")),
                getPortNameById(String(portId || "")),
            ].filter(Boolean);
            return parts.length ? parts.join(" • ") : "Not specified";
        };

        const isInternational = execution.tradeType === "INTERNATIONAL";
        const originLabel = isInternational
            ? buildInternationalLabel(execution.originCountry, execution.originState, execution.originDistrict, execution.originPort)
            : buildDomesticLabel(execution.originState, execution.originDistrict);
        const destinationLabel = isInternational
            ? buildInternationalLabel(execution.destinationCountry, execution.destinationState, execution.destinationDistrict, execution.destinationPort)
            : buildDomesticLabel(execution.destinationState, execution.destinationDistrict);

        const listItems: any[] = [
            { label: "Procurement / Sourcing", value: plan.procurementBy || "Not set" },
            { label: "Quality Testing", value: plan.qualityTestingBy || "Not set" },
            { label: "Packaging & Labelling", value: plan.packagingBy || "Not set" },
            { label: "Inland Transportation", value: plan.transportBy || "Not set" },
        ];
        if (isInternational) {
            listItems.push(
                { label: "Freight Forwarding & Shipping", value: plan.shippingBy || "Not set" },
                { label: "Export Customs Clearance", value: plan.exportCustomsBy || plan.certificateBy || "Not set" },
                { label: "Import Customs Clearance", value: plan.importCustomsBy || "Not set" },
                { label: "Duties & Taxes", value: plan.dutiesTaxesBy || "Not set" },
                { label: "Port Handling", value: plan.portHandlingBy || "Not set" },
                { label: "Inland Transport (Port → Warehouse)", value: plan.destinationInlandTransportBy || "Not set" },
                { label: "Destination Inspection", value: plan.destinationInspectionBy || "Not set" },
                { label: "Final Delivery Confirmation", value: plan.finalDeliveryConfirmationBy || "Not set" }
            );
        }
        return {
            incotermLabel,
            paymentLabel,
            tradeType: execution.tradeType || "Not set",
            originLabel,
            destinationLabel,
            listItems,
            packagingSpecs: packagingSpecifications || "No specifications added",
        };
    }, [responsibilityPlan, enquiry, executionContext, incotermOptions, paymentTermOptions, selectedIncotermId, selectedPaymentTermId, packagingSpecifications, getCountryNameById]);
    const updateTradeTermsMutation = useMutation({
        mutationFn: () =>
            patchData(`${apiRoutes.enquiry.getAll}/${id}`, {
                preferredIncoterm: selectedIncotermId || null,
                paymentTermId: selectedPaymentTermId || null,
            }),
        onSuccess: () => {
            toast.success("Trade terms updated.");
            setTradeTermsSavedAt(new Date().toISOString());
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => {
            toast.error("Failed to update trade terms.");
        },
    });
    const createDocMutation = useMutation({
        mutationFn: async (ruleOverride?: any) => {
            const activeRule = ruleOverride || docActionRule;
            if (!activeRule) throw new Error("No document rule selected.");
            const payload: any = {
                type: activeRule.docType,
                enquiryId: id,
            };
            const docTypeKey = String(activeRule.docType || "").toUpperCase();
            const actionTypeKey = String(activeRule.actionType || "").toUpperCase();
            if (docTypeKey === "PURCHASE_ORDER" && actionTypeKey === "CREATE") {
                payload.status = "SENT";
            }
            if (docTypeKey === "PROFORMA_INVOICE" && actionTypeKey === "CREATE") {
                payload.status = "SENT";
            }
            if (String(activeRule.actionType) === "UPLOAD") {
                payload.fileUrl = docActionFileUrl;
            }
            return postData(apiRoutes.tradeDocuments.create, payload);
        },
        onSuccess: (res: any) => {
            toast.success("Document created.");
            setDocActionOpen(false);
            setDocActionRule(null);
            setDocActionFileUrl("");
            queryClient.invalidateQueries({ queryKey: ["trade-documents", "enquiry", id] });
            const createdDoc = res?.data?.data || null;
            if (createdDoc) {
                queryClient.setQueryData(["trade-documents", "enquiry", id], (prev: any) => {
                    const getRows = (raw: any): any[] => {
                        if (Array.isArray(raw?.data?.data?.data)) return raw.data.data.data;
                        if (Array.isArray(raw?.data?.data?.docs)) return raw.data.data.docs;
                        if (Array.isArray(raw?.data?.data)) return raw.data.data;
                        if (Array.isArray(raw?.data?.docs)) return raw.data.docs;
                        if (Array.isArray(raw?.data)) return raw.data;
                        if (Array.isArray(raw)) return raw;
                        return [];
                    };
                    const prevRows = getRows(prev);
                    const createdId = String(createdDoc?._id || createdDoc?.id || "");
                    const merged = [
                        createdDoc,
                        ...prevRows.filter((doc: any) => String(doc?._id || doc?.id || "") !== createdId),
                    ];
                    return {
                        ...(prev || {}),
                        data: {
                            ...(prev?.data || {}),
                            data: {
                                ...(prev?.data?.data || {}),
                                data: merged,
                            },
                        },
                    };
                });
            }
            if (createdDoc) {
                openDocViewer(createdDoc);
            }
            const createdType = String(createdDoc?.type || docActionRule?.docType || "").toUpperCase();
            if (createdType === "PROFORMA_INVOICE" && !(enquiry as any)?.proformaCreatedAt) {
                applyActionMutation.mutate({ actionKey: "PROFORMA_CREATED" });
            }
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create document.");
        },
    });
    const emailDocMutation = useMutation({
        mutationFn: async () => {
            if (!docViewerDoc?._id) throw new Error("No document selected.");
            return postData(apiRoutes.tradeDocuments.email(String(docViewerDoc._id)), {
                enquiryId: id,
            });
        },
        onSuccess: () => {
            toast.success("Document emailed successfully.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to email document.");
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

    const sellerInventoryRows = Array.isArray(sellerInventoryResponse?.data?.data?.data)
        ? sellerInventoryResponse?.data?.data?.data
        : (sellerInventoryResponse?.data?.data || []);
    const sellerReservationRows = Array.isArray(sellerReservationResponse?.data?.data?.data)
        ? sellerReservationResponse?.data?.data?.data
        : (sellerReservationResponse?.data?.data || []);
    const isInventoryLoading = isSellerInventoryLoading || isSellerReservationLoading;
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
    const missingQty = selectedInventory ? Math.max(0, requiredQty - Number(selectedInventory.availableQty || 0)) : 0;
    const projectedAvailable = !isAddingNewInventory && selectedInventory
        ? (selectedInventory.availableQty || 0) + (Number.isFinite(addedQty) ? addedQty : 0)
        : (selectedInventory?.availableQty || 0);
    const hasInsufficientStock = Boolean(!isAddingNewInventory && selectedInventory && requiredQty > projectedAvailable);
    const shouldShowInsufficient = Boolean(acceptAttempted && hasInsufficientStock);
    const shouldShowMissingQtyError = Boolean(
        acceptAttempted &&
        !isAddingNewInventory &&
        selectedInventory &&
        Number(selectedInventory.availableQty || 0) < requiredQty &&
        !inlineQuantity
    );

    useEffect(() => {
        if (!inventoryAcceptOpen) return;
        if (isInventoryLoading) return;
        if (inventoryOptions.length === 0) {
            setIsAddingNewInventory(true);
            if (!inlineQuantity) {
                setInlineQuantity(String(requiredQty || ""));
            }
        }
    }, [inventoryAcceptOpen, inventoryOptions.length, requiredQty, inlineQuantity, isInventoryLoading]);

    useEffect(() => {
        if (!inventoryAcceptOpen) return;
        if (isAddingNewInventory) return;
        if (!selectedInventory) return;
        if (missingQty <= 0) return;
        if (inlineQuantity) return;
        setInlineQuantity(String(missingQty));
    }, [inventoryAcceptOpen, isAddingNewInventory, selectedInventoryId, missingQty, inlineQuantity, selectedInventory]);

    if (isLoading) return <BrandedLoader fullScreen message="SYNCING TRADE PROTOCOL" />;
    if (!enquiry) return <div className="p-10 text-center">Enquiry not found</div>;

    const handleInventoryAccept = () => {
        setAcceptAttempted(true);
        if (!isAddingNewInventory && hasInsufficientStock) {
            toast.error("Please add the quantity as per the order into your warehouse. Otherwise, select another warehouse with the desired quantity.");
            return;
        }
        sellerAcceptMutation.mutate();
    };

    const normalizedStatus = String(enquiry.status || "").toUpperCase();
    const hasSellerAccepted = Boolean(enquiry.sellerAcceptedAt) || isImportEnquiry;
    const hasBuyerConfirmed = Boolean(enquiry.buyerConfirmedAt);
    const hasResponsibilitiesFinalized = Boolean(
        (enquiry as any).responsibilitiesFinalizedAt ||
        responsibilitiesLockedOverride
    );
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
    const isReadOnlyAfterConversion = normalizedStatus === "CONVERTED" || normalizedStatus === "CLOSED";
    const initialPlan = (enquiry as any)?.responsibilityPlan || {};
    const supplierOperatorObj = ((enquiry as any)?.supplierOperatorId && typeof (enquiry as any).supplierOperatorId === "object")
        ? (enquiry as any).supplierOperatorId
        : null;
    const dealCloserOperatorObj = ((enquiry as any)?.dealCloserOperatorId && typeof (enquiry as any).dealCloserOperatorId === "object")
        ? (enquiry as any).dealCloserOperatorId
        : null;
    const handlerOperatorObj = ((enquiry as any)?.handlerOperatorId && typeof (enquiry as any).handlerOperatorId === "object")
        ? (enquiry as any).handlerOperatorId
        : null;

    // ─── Role Detection ───────────────────────────────────────────────────────
    const roleLower = String(user?.role || "").toLowerCase();
    const isSystemAdmin = roleLower === "admin";
    const isOperatorUser = roleLower === "operator" || roleLower === "team";
    const canManageDocs = isSystemAdmin || isOperatorUser;
    const canManageWorkflow = isSystemAdmin || isOperatorUser;
    const supplierOperatorId = (supplierOperatorObj?._id || (enquiry as any)?.supplierOperatorId || "").toString();
    const dealCloserOperatorId = (dealCloserOperatorObj?._id || (enquiry as any)?.dealCloserOperatorId || "").toString();
    const handlerOperatorId = (handlerOperatorObj?._id || (enquiry as any)?.handlerOperatorId || "").toString();
    const isAssignedOperator = Boolean(
        isOperatorUser &&
        user?.id &&
        (supplierOperatorId === String(user.id) ||
            dealCloserOperatorId === String(user.id) ||
            handlerOperatorId === String(user.id))
    );
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
    const importListing = (enquiry as any)?.importListingId;
    const importSellerCompanyObj =
        isImportEnquiry && typeof importListing?.importerCompanyId === "object"
            ? importListing.importerCompanyId
            : null;
    const importSellerSupervisorObj =
        importSellerCompanyObj && typeof importSellerCompanyObj?.supervisor === "object"
            ? importSellerCompanyObj.supervisor
            : null;
    const importSellerAssociateObj =
        isImportEnquiry && typeof importListing?.importerAssociateId === "object"
            ? importListing.importerAssociateId
            : importSellerSupervisorObj;
    const importSellerCompanyName =
        isImportEnquiry
            ? importSellerCompanyObj?.name ||
              importListing?.importerCompanyName ||
              ""
            : "";
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
        (isImportEnquiry ? importSellerAssociateObj?.name : null) ||
        sellerAssociateObj?.name ||
        (enquiry as any)?.sellerAssociateName ||
        (enquiry as any)?.sellerName ||
        (isImportEnquiry && importSellerCompanyName ? `${importSellerCompanyName} (Importer)` : null) ||
        (typeof sellerId === "string" ? `Associate (${sellerId.slice(-6)})` : "N/A");
    const buyerCompanyName = extractAssociateCompanyName(buyerAssociateObj, "buyerAssociateCompanyName");
    const sellerCompanyName =
        (isImportEnquiry && importSellerCompanyName) ||
        extractAssociateCompanyName(sellerAssociateObj, "sellerAssociateCompanyName");
    const buyerPhone = buyerAssociateObj?.phone || (enquiry as any)?.buyerPhone || null;
    const sellerPhone =
        (isImportEnquiry ? importSellerAssociateObj?.phone : null) ||
        (isImportEnquiry ? importSellerCompanyObj?.phone : null) ||
        sellerAssociateObj?.phone ||
        (enquiry as any)?.sellerPhone ||
        null;
    const buyerPresence = {
        online: isOnline(buyerAssociateObj?.lastSeenAt),
        status: getPresenceStatus(buyerAssociateObj?.lastSeenAt),
        lastSeenLabel: formatLastSeen(buyerAssociateObj?.lastSeenAt),
    };
    const sellerPresenceSource = isImportEnquiry && importSellerAssociateObj ? importSellerAssociateObj : sellerAssociateObj;
    const sellerPresence = {
        online: isOnline(sellerPresenceSource?.lastSeenAt),
        status: getPresenceStatus(sellerPresenceSource?.lastSeenAt),
        lastSeenLabel: formatLastSeen(sellerPresenceSource?.lastSeenAt),
    };
    const supplierOperatorName = supplierOperatorObj?.name || supplierOperatorObj?.firstName || "Not assigned";
    const dealCloserOperatorName = dealCloserOperatorObj?.name || dealCloserOperatorObj?.firstName || "Not assigned";
    const handlerOperatorName = handlerOperatorObj?.name || handlerOperatorObj?.firstName || "Not assigned";
    const userIdStr = user?.id?.toString();
    const isBuyer = buyerId && userIdStr && buyerId.toString() === userIdStr;
    const isSeller = sellerId && userIdStr && sellerId.toString() === userIdStr;

    const docRules = parseMasterRows(docRulesResponse).filter((item: any) => !item?.isDeleted);
    const normalizedStageKey = String(workflowStage || "").toUpperCase();
    const enquiryRules = Array.isArray(enquiryRulesResponse?.data?.data?.data)
        ? enquiryRulesResponse.data.data.data
        : Array.isArray(enquiryRulesResponse?.data?.data)
            ? enquiryRulesResponse.data.data
            : Array.isArray(enquiryRulesResponse?.data)
                ? enquiryRulesResponse.data
                : [];
    const docsForEnquiry = Array.isArray(enquiryDocsResponse?.data?.data?.data)
        ? enquiryDocsResponse?.data?.data?.data
        : (enquiryDocsResponse?.data?.data || []);
    const rulesForStage = docRules
        .filter((r: any) => {
            const stageType = String(r.stageType || r.stage || "").toUpperCase();
            const isInquiryStage = stageType === "INQUIRY" || stageType === "ENQUIRY";
            return (
                isInquiryStage &&
                String(r.stageKey || "").toUpperCase() === normalizedStageKey &&
                r.isActive !== false &&
                (r.tradeType === "BOTH" || r.tradeType === executionContext.tradeType)
            );
        })
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
    const safeDocs = Array.isArray(docsForEnquiry) ? docsForEnquiry : [];
    const hasDocType = (type: string) => safeDocs.some((doc: any) => String(doc?.type || "").toUpperCase() === type);
    const currentRule = enquiryRules.find((r: any) => String(r.stageKey || "").toUpperCase() === normalizedStageKey);
    const requiredActions = Array.isArray(currentRule?.requiredActions) ? currentRule.requiredActions : [];
    const canCreateProformaDoc =
        (isSystemAdmin || isOperatorUser) &&
        normalizedStageKey === "PROFORMA_ISSUED" &&
        !hasDocType("PROFORMA_INVOICE");
    const displayActions = (() => {
        const filtered = requiredActions.filter((key: string) => !["REVISION_REQUESTED", "REVISION_CONFIRMED", "REVISION_SKIPPED"].includes(String(key || "").toUpperCase()));
        const noProformaAction = filtered.filter((key: string) => {
            const normalized = String(key || "").toUpperCase();
            if (normalizedStageKey === "PROFORMA_ISSUED" && normalized === "PROFORMA_CREATED") return false;
            return true;
        });
        const baseActions = isConvertedFlow
            ? noProformaAction.filter((key: string) => String(key || "").toUpperCase() !== "CONVERT_TO_ORDER")
            : noProformaAction;
        if (normalizedStageKey === "PROFORMA_ISSUED" && canCreateProformaDoc) {
            return baseActions.includes("PROFORMA_CREATED") ? baseActions : [...baseActions, "PROFORMA_CREATED"];
        }
        return baseActions;
    })();
    const actionBy = String((currentRule as any)?.actionBy || "").toUpperCase();
    const formatActionByLabel = (value: string) => {
        const normalized = String(value || "").toUpperCase();
        if (normalized === "BUYER") return "Buyer";
        if (normalized === "SELLER" || normalized === "SUPPLIER") return "Supplier";
        if (normalized === "BOTH") return "Buyer & Supplier";
        if (normalized === "EITHER") return "Buyer or Supplier";
        if (normalized === "OBAOL" || normalized === "INTERNAL") return "OBAOL";
        return "";
    };
    const actionByLabelText = formatActionByLabel(actionBy);
    const canActByRole = (() => {
        if (actionBy === "BUYER") return Boolean(isBuyer);
        if (actionBy === "SUPPLIER") return Boolean(isSeller);
        if (actionBy === "BOTH") return Boolean(isBuyer || isSeller);
        if (actionBy === "EITHER") return Boolean(isBuyer || isSeller);
        return true;
    })();
    const canPerformAction = isSystemAdmin || isAssignedOperator || canActByRole;
    const isActionLoading = (actionKey: string) => {
        if (applyActionMutation.isPending && pendingActionKey === actionKey) return true;
        if (actionKey === "QUOTATION_CREATED" && createQuotationMutation.isPending) return true;
        if (actionKey === "CONVERT_TO_ORDER" && isConvertingOrder) return true;
        return false;
    };
    const actionLabels: Record<string, string> = {
        LOI_SUBMITTED: "Submit LOI",
        SUPPLIER_QTY_CONFIRMED: "Confirm Quantity",
        REVISION_REQUESTED: "Request Revision",
        REVISION_CONFIRMED: "Confirm Revision",
        REVISION_SKIPPED: "Skip Revision",
        QUOTATION_CREATED: "Draft Quotation",
        QUOTATION_ACCEPTED: "Accept Quotation",
        RETURN_TO_REVISION: "Return to Revision",
        RESPONSIBILITIES_FINALIZED: "Finalize Responsibilities",
        PROFORMA_CREATED: "Create Proforma",
        OTHER_DOCS_UPLOADED: "Upload Other Docs",
        OTHER_DOCS_SKIPPED: "Skip Other Docs",
        PO_UPLOADED: "Upload or Create Purchase Order",
        PO_SKIPPED: "Skip Purchase Order",
        CONVERT_TO_ORDER: "Convert to Order",
    };
    const handleActionPress = (actionKey: string) => {
        if (!actionKey) return;
        if (actionKey === "REVISION_REQUESTED") {
            setClarificationOpen(true);
            return;
        }
        if (actionKey === "RESPONSIBILITIES_FINALIZED") {
            onFinalizeOpen();
            return;
        }
        if (actionKey === "CONVERT_TO_ORDER") {
            onOpen();
            return;
        }
        if (actionKey === "SUPPLIER_QTY_CONFIRMED") {
            setInventoryAcceptOpen(true);
            return;
        }
        if (actionKey === "QUOTATION_CREATED") {
            setDraftQuotationError("");
            if (quotationId && quotationDoc) {
                if (quotationStatus !== "DRAFT") {
                    setPendingActionKey("QUOTATION_CREATED");
                    applyActionMutation.mutate({ actionKey: "QUOTATION_CREATED" });
                    return;
                }
                openDocViewer(quotationDoc);
                return;
            }
            createQuotationMutation.mutate();
            return;
        }
        if (actionKey === "PROFORMA_CREATED") {
            const proformaRule = docRules.find((rule: any) => {
                const stageType = String(rule.stageType || rule.stage || "").toUpperCase();
                const isInquiryStage = stageType === "INQUIRY" || stageType === "ENQUIRY";
                return (
                    isInquiryStage &&
                    String(rule.stageKey || "").toUpperCase() === "PROFORMA_ISSUED" &&
                    String(rule.docType || "").toUpperCase() === "PROFORMA_INVOICE" &&
                    String(rule.actionType || "").toUpperCase() === "CREATE"
                );
            });
            if (proformaRule) {
                setDocActionRule(proformaRule);
                createDocMutation.mutate(proformaRule);
                return;
            }
        }
        setPendingActionKey(actionKey);
        applyActionMutation.mutate({ actionKey });
    };
    const actionStatus = {
        LOI_SUBMITTED: Boolean((enquiry as any)?.loiSubmittedAt),
        SUPPLIER_QTY_CONFIRMED: Boolean((enquiry as any)?.supplierQtyConfirmedAt),
        REVISION_REQUESTED: Boolean((enquiry as any)?.revisionRequestedAt),
        REVISION_CONFIRMED: Boolean((enquiry as any)?.revisionThread?.buyerConfirmedAt),
        // Keep QUOTATION_CREATED actionable while we're on that stage,
        // otherwise the user gets stuck after a revision loop.
        QUOTATION_CREATED:
            Boolean((enquiry as any)?.quotationCreatedAt) && normalizedStageKey !== "QUOTATION_CREATED",
        QUOTATION_ACCEPTED: Boolean(enquiry?.buyerConfirmedAt),
        RETURN_TO_REVISION: Boolean((enquiry as any)?.revisionRequestedAt),
        RESPONSIBILITIES_FINALIZED: Boolean((enquiry as any)?.responsibilitiesFinalizedAt),
        PROFORMA_CREATED: Boolean((enquiry as any)?.proformaCreatedAt),
        OTHER_DOCS_UPLOADED: Boolean((enquiry as any)?.otherDocsCompletedAt),
        OTHER_DOCS_SKIPPED: Boolean((enquiry as any)?.otherDocsCompletedAt),
        PO_UPLOADED: Boolean((enquiry as any)?.poSubmittedAt),
        PO_SKIPPED: Boolean((enquiry as any)?.poSubmittedAt),
        CONVERT_TO_ORDER: Boolean(isConvertedFlow),
    };
    const scrollToRevisionPanel = () => {
        if (typeof document === "undefined") return;
        document.getElementById("revision-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const enquiryDocs = Array.isArray(enquiryDocsResponse?.data?.data?.data)
        ? enquiryDocsResponse?.data?.data?.data
        : Array.isArray(enquiryDocsResponse?.data?.data)
            ? enquiryDocsResponse?.data?.data
            : Array.isArray(enquiryDocsResponse?.data)
                ? enquiryDocsResponse?.data
                : [];
    const hasLoiDoc = (enquiryDocs || []).some((doc: any) => String(doc?.type || "").toUpperCase() === "LOI");
    const showDraftQuotation = Boolean((enquiry as any)?.quotationCreatedAt);
    const filteredEnquiryDocs = (enquiryDocs || []).filter((doc: any) => {
        const type = String(doc?.type || "").toUpperCase();
        const status = String(doc?.status || "").toUpperCase();
        if (type === "QUOTATION" && status === "DRAFT" && !showDraftQuotation) return false;
        return true;
    });
    const syntheticLoiDoc = !hasLoiDoc && (enquiry as any)?.loiSubmittedAt ? [{
        _id: "synthetic-loi",
        type: "LOI",
        status: "SENT",
        createdAt: (enquiry as any)?.loiSubmittedAt,
        fileUrl: null,
        documentNumber: "LOI-AUTO",
        audienceScope: "OBAOL_BUYER",
    }] : [];
    const combinedEnquiryDocs = [...syntheticLoiDoc, ...filteredEnquiryDocs];
    const uniqueDocsByType = Object.values(
        combinedEnquiryDocs.reduce((acc: Record<string, any>, doc: any) => {
            const typeKey = String(doc?.type || "").toUpperCase();
            const scopeKey = String(doc?.audienceScope || "SELLER_OBAOL").toUpperCase();
            if (!typeKey) return acc;
            const docKey = `${typeKey}::${scopeKey}`;
            const existing = acc[docKey];
            if (!existing) {
                acc[docKey] = doc;
                return acc;
            }
            const existingStatus = String(existing?.status || "").toUpperCase();
            const nextStatus = String(doc?.status || "").toUpperCase();
            const existingTime = new Date(existing?.createdAt || 0).getTime();
            const nextTime = new Date(doc?.createdAt || 0).getTime();
            if (existingStatus === "DRAFT" && nextStatus !== "DRAFT") {
                acc[docKey] = doc;
                return acc;
            }
            if (existingStatus === nextStatus && nextTime > existingTime) {
                acc[docKey] = doc;
                return acc;
            }
            if (existingStatus !== "DRAFT" && nextStatus === "DRAFT") {
                return acc;
            }
            if (nextTime > existingTime) {
                acc[docKey] = doc;
            }
            return acc;
        }, {})
    );
    const sortedEnquiryDocs = uniqueDocsByType.sort((a: any, b: any) => {
        const aTime = new Date(a?.createdAt || 0).getTime();
        const bTime = new Date(b?.createdAt || 0).getTime();
        return bTime - aTime;
    });
    const DOC_TYPE_LABELS: Record<string, string> = {
        LOI: "Letter of Intent",
        QUOTATION: "Quotation",
        PROFORMA_INVOICE: "Proforma Invoice",
        INVOICE: "Invoice",
        PURCHASE_ORDER: "Purchase Order",
        SALES_CONTRACT: "Sales Contract",
        PACKING_LIST: "Packing List",
        QUALITY_CERTIFICATE: "Quality Certificate",
        INSPECTION_CERTIFICATE: "Inspection Certificate",
        PHYTOSANITARY_CERTIFICATE: "Phytosanitary Certificate",
        FUMIGATION_CERTIFICATE: "Fumigation Certificate",
        BILL_OF_LADING: "Bill of Lading",
        AIR_WAYBILL: "Air Waybill",
        LORRY_RECEIPT: "Lorry Receipt",
        LCL_DRAFT: "LCL Draft",
        INSURANCE_CERTIFICATE: "Insurance Certificate",
        PAYMENT_ADVICE: "Payment Advice",
    };
    const getAudienceLabel = (scope: any) => {
        const normalized = String(scope || "").toUpperCase();
        if (normalized === "SELLER_OBAOL") return "Seller ↔ OBAOL";
        if (normalized === "OBAOL_BUYER" || normalized === "BUYER_OBAOL") return "Buyer ↔ OBAOL";
        return "";
    };
    const getDocAudienceLabel = (doc: any) => {
        const typeKey = String(doc?.type || "").toUpperCase();
        if (typeKey === "LOI" || typeKey === "LETTER_OF_INTENT") return "Buyer ↔ OBAOL";
        return getAudienceLabel(doc?.audienceScope);
    };
    const sortedEnquiryStages = enquiryRules
        .filter((r: any) => r?.isActive !== false)
        .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
        .map((r: any) => String(r.stageKey || "").toUpperCase())
        .filter(Boolean);
    let workflowStageOptions = sortedEnquiryStages.length > 0
        ? [...sortedEnquiryStages]
        : [];
    if (isImportEnquiry) {
        workflowStageOptions = workflowStageOptions.filter(
            (key) => !["ENQUIRY_CREATED", "LOI_ACCEPTED_QTY_CONFIRMED"].includes(String(key || "").toUpperCase())
        );
    }
    const currentStepIndex = Math.max(0, workflowStageOptions.indexOf(workflowStage));
    const hasSubmittedDoc = (type: string) =>
        safeDocs.some(
            (doc: any) => String(doc?.type || "").toUpperCase() === type && String(doc?.status || "").toUpperCase() !== "DRAFT"
        );
    const stageLabelMap = new Map(
        enquiryRules.map((r: any) => [String(r.stageKey || "").toUpperCase(), r.label || r.stageKey])
    );
    const hasSubmittedQuotation = hasSubmittedDoc("QUOTATION");
    const isPreClarification = normalizedStageKey === "QUOTATION_REVISION" && !hasSubmittedQuotation && !showDraftQuotation;
    if (isPreClarification) {
        stageLabelMap.set("QUOTATION_REVISION", "Pre Clarification");
    }
    const canBuyerActions = isBuyer || isSystemAdmin;
    const revisionRounds = Array.isArray((enquiry as any)?.revisionRounds) ? (enquiry as any).revisionRounds : [];
    const legacyRevisionItems = Array.isArray((enquiry as any)?.revisionThread?.items) ? (enquiry as any).revisionThread.items : [];
    const derivedRevisionRounds = revisionRounds.length
        ? revisionRounds
        : legacyRevisionItems.length
            ? [{
                roundId: "legacy",
                status: (enquiry as any)?.revisionThread?.buyerConfirmedAt ? "CONFIRMED" : "OPEN",
                items: legacyRevisionItems,
                buyerRequestedAt: (enquiry as any)?.revisionThread?.buyerRequestedAt || null,
                buyerConfirmedAt: (enquiry as any)?.revisionThread?.buyerConfirmedAt || null,
                closedAt: (enquiry as any)?.revisionThread?.buyerConfirmedAt || null,
            }]
            : [];
    const openRevisionRound = [...derivedRevisionRounds].reverse().find((round: any) => String(round?.status || "").toUpperCase() === "OPEN");
    const activeRevisionRound = openRevisionRound || derivedRevisionRounds[derivedRevisionRounds.length - 1];
    const revisionItems = Array.isArray(activeRevisionRound?.items) ? activeRevisionRound.items : [];
    const revisionBuyerRequestedAt = activeRevisionRound?.buyerRequestedAt || (enquiry as any)?.revisionThread?.buyerRequestedAt || null;
    const revisionBuyerConfirmedAt = activeRevisionRound?.buyerConfirmedAt || (enquiry as any)?.revisionThread?.buyerConfirmedAt || null;
    const revisionAcknowledgedItems = revisionItems.filter((item: any) => {
        const acknowledged = Boolean(item?.supplierAcknowledged);
        const hasCounter = item?.supplierCounterRate !== null && item?.supplierCounterRate !== undefined;
        return acknowledged || hasCounter;
    });
    const revisionAcknowledgedLabels = revisionAcknowledgedItems.map((item: any) => {
        const rawKey = String(item?.key || "").toUpperCase();
        const label =
            rawKey === "RATE"
                ? "Rate"
                : rawKey === "PAYMENT_TERMS"
                    ? "Payment"
                    : rawKey === "DELIVERY_TIMELINE"
                        ? "Timeline"
                        : rawKey.replaceAll("_", " ");
        const counter = item?.supplierCounterRate;
        return counter !== null && counter !== undefined && counter !== ""
            ? `${label} • Counter: ${formatRate(counter)}`
            : label;
    });
    const allRevisionAcknowledged = revisionItems.length > 0 && revisionItems.every((item: any) => {
        const acknowledged = Boolean(item?.supplierAcknowledged);
        const counterSaved = item?.supplierCounterRate !== null && item?.supplierCounterRate !== undefined;
        return acknowledged || counterSaved;
    });
    const canBuyerRevision = isBuyer || isSystemAdmin || isAssignedOperator;
    const canSupplierRevision = isSeller || isSystemAdmin || isAssignedOperator;
    const fallbackProformaRule = {
        docType: "PROFORMA_INVOICE",
        actionType: "CREATE",
    };
    const requiredActionMode = String((currentRule as any)?.requiredActionMode || "ALL").toUpperCase();
    const isRequiredSatisfied = (() => {
        if (!requiredActions.length) return true;
        if (requiredActionMode === "ANY") return requiredActions.some((action: string) => actionStatus[action]);
        return requiredActions.every((action: string) => actionStatus[action]);
    })();
    const waitingMessage = (() => {
        if (isCancelled) return "This enquiry was cancelled.";
        if (isCompletedFlow) return "This enquiry is completed.";
        if (requiredActions.length && !isRequiredSatisfied) {
            const actionBy = String((currentRule as any)?.actionBy || "").toUpperCase();
            if (actionBy === "BUYER") return "Action pending from buyer.";
            if (actionBy === "SUPPLIER") return "Action pending from supplier.";
            if (actionBy === "BOTH") return "Action pending from buyer and supplier.";
            if (actionBy === "EITHER") return "Action pending from buyer or supplier.";
            return "Action pending for this stage.";
        }
        if (!isConvertedFlow) return "Waiting for OBAOL team to convert this enquiry into an order.";
        return "Enquiry is converted. Order execution is now in progress.";
    })();
    const isAssociateResponsibilityLocked = hasResponsibilitiesFinalized && !isAdmin;
    const canEditResponsibilityPlan = (isAdmin || isBuyer || isSeller) && !isAssociateResponsibilityLocked && !isReadOnlyAfterConversion;
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
    const isTransportSegmentsChanged =
        JSON.stringify(inlandTransportSegments) !== JSON.stringify((enquiry as any)?.inlandTransportSegments || []);
    const isResponsibilityEventChanged = isResponsibilityPlanChanged || isExecutionContextChanged || isPackagingSpecificationsChanged || isTransportSegmentsChanged;
    const isTradeTermsChanged =
        String(selectedIncotermId || "") !== String((enquiry as any)?.preferredIncoterm?._id || (enquiry as any)?.preferredIncoterm || "") ||
        String(selectedPaymentTermId || "") !== String((enquiry as any)?.paymentTermId?._id || (enquiry as any)?.paymentTermId || "");
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
    const paymentTermLabel = (() => {
        const raw = (enquiry as any)?.paymentTermId;
        if (!raw) return null;
        if (typeof raw === "object") return raw.label || raw.name || null;
        const found = paymentTermOptions.find((it: any) => it?._id?.toString() === raw?.toString());
        return found?.label || (typeof raw === "string" ? raw : null);
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
            {isReadOnlyAfterConversion && (
                <div className="w-full rounded-3xl border border-success-500/20 bg-success-500/5 px-6 py-4 text-success-600 text-xs font-black uppercase tracking-widest">
                    Enquiry is converted and locked. All responsibility and execution details are read-only.
                </div>
            )}

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

            <div className={isCancelled ? "opacity-60 pointer-events-none flex flex-col gap-10" : "flex flex-col gap-10"}>
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
                                    variant="flat" size="sm" className="font-bold border-none"
                                >
                                    {enquiry.status}
                                </Chip>
                                {(String(enquiry?.sourceType || "").toUpperCase() === "IMPORT" || enquiry?.importListingId) && (
                                    <Chip size="sm" variant="flat" className="font-bold border-none bg-warning-500/15 text-warning-600">
                                        Import Enquiry
                                    </Chip>
                                )}
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
                                {isImportEnquiry && (
                                    <div className="mt-4 flex items-center gap-4 p-5 rounded-[2rem] border border-warning-500/20 bg-warning-500/5 backdrop-blur-3xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-warning-500/10 blur-[40px] rounded-full -mr-16 -mt-16 animate-pulse" />
                                        <div className="w-12 h-12 rounded-2xl bg-warning-500/10 flex items-center justify-center text-warning-600 shrink-0 border border-warning-500/10 shadow-inner">
                                            <LuAnchor size={20} className="group-hover:rotate-12 transition-transform duration-500" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-warning-600/70">Import Protocol Active</span>
                                            <p className="text-[11px] font-bold text-foreground opacity-90 leading-tight pr-4">Inventory reservation is bypassed. Secure your logistics framework by choosing <span className="text-warning-600">Port Pickup</span> or <span className="text-warning-600">OBAOL Service</span> to proceed.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Contact & Actions */}
                        <div className="flex flex-col gap-5 w-full md:w-auto items-end">
                            {(isSystemAdmin || isOperatorUser) && (
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className={`font-black uppercase tracking-[0.2em] border-none h-6 w-fit ${
                                        handlerOperatorId
                                            ? "bg-success-500/15 text-success-600"
                                            : "bg-danger-500/15 text-danger-600"
                                    }`}
                                >
                                    {handlerOperatorId ? "Handler Assigned" : "Handler Missing"}
                                </Chip>
                            )}
                            {isImportEnquiry && (
                                <div className="w-full md:w-[280px] group">
                                    <Select
                                        label={<span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400 group-hover:text-warning-500 transition-colors">Logistics Strategy</span>}
                                        labelPlacement="outside"
                                        placeholder="Select Framework..."
                                        selectedKeys={importDeliveryMode ? [importDeliveryMode] : []}
                                        onSelectionChange={(keys) => {
                                            const key = Array.from(keys)[0] as string | undefined;
                                            const next = String(key || "").toUpperCase();
                                            setImportDeliveryMode(next);
                                            if (next) updateImportDeliveryModeMutation.mutate(next);
                                        }}
                                        isDisabled={updateImportDeliveryModeMutation.isPending || isReadOnlyAfterConversion}
                                        classNames={{
                                            trigger: "h-14 bg-background border border-divider/50 hover:border-warning-500/50 shadow-none rounded-2xl transition-all group-data-[selected=true]:bg-warning-500/5",
                                            value: "font-black text-sm uppercase tracking-wider text-foreground",
                                            label: "mb-2"
                                        }}
                                        startContent={<LuNavigation size={18} className="text-warning-500 mr-1" />}
                                    >
                                        <SelectItem 
                                            key="PORT_PICKUP" 
                                            value="PORT_PICKUP"
                                            textValue="Port Pickup"
                                            className="py-3"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-sm tracking-tight text-foreground">Port Pickup</span>
                                                <span className="text-[10px] text-default-400 font-medium">Self-managed arrival logistics</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem 
                                            key="OBAOL_SERVICE" 
                                            value="OBAOL_SERVICE"
                                            textValue="OBAOL Service"
                                            className="py-3"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-sm tracking-tight text-foreground">OBAOL Service</span>
                                                <span className="text-[10px] text-default-400 font-medium">Managed end-to-end framework</span>
                                            </div>
                                        </SelectItem>
                                    </Select>
                                    {!importDeliveryMode && (
                                        <div className="flex items-center gap-1.5 text-[9px] text-warning-600 font-black uppercase tracking-widest mt-3 ml-1 animate-pulse">
                                            <FiAlertCircle size={10} />
                                            Deployment required
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Support Contact Point (Client/Supplier View) */}
                            {!isSystemAdmin && !isOperatorUser && (
                                <div className="flex flex-col gap-2.5 p-3.5 bg-default-50/50 rounded-2xl border border-default-200/50 items-end text-right min-w-[220px]">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-default-400">Your Support Point</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                                    </div>

                                    {(() => {
                                        const opId =
                                            enquiry?.dealCloserOperatorId?._id ||
                                            enquiry?.dealCloserOperatorId ||
                                            enquiry?.supplierOperatorId?._id ||
                                            enquiry?.supplierOperatorId;
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
                                                        {(() => {
                                                            const enquiryIdShort = (Array.isArray(id) ? id[0] : id || "").slice(-6).toUpperCase();
                                                            const orderIdShort = (enquiry as any)?.order?._id || (enquiry as any)?.order || null;
                                                            const orderShort = orderIdShort ? String(orderIdShort).slice(-6).toUpperCase() : "";
                                                            const stageLabel = String(stageLabelMap.get(workflowStage) || workflowStage).replaceAll("_", " ");
                                                            const productLabel = getProductDisplayName(enquiry);
                                                            const variantLabel = getVariantDisplayName(enquiry, liveRate);
                                                            const qtyLabel = enquiry?.quantity ? `${enquiry.quantity} MT` : "N/A";
                                                            const buyerLabel = enquiry?.buyerAssociateId?.associateCompany?.name || enquiry?.buyerAssociateCompanyName || "N/A";
                                                            const sellerLabel = enquiry?.sellerAssociateId?.associateCompany?.name || enquiry?.sellerAssociateCompanyName || "N/A";
                                                            const messageLines = [
                                                                "OBAOL Support Request",
                                                                `Enquiry ID: #${enquiryIdShort}`,
                                                                orderShort ? `Order ID: #${orderShort}` : null,
                                                                `Stage: ${stageLabel}`,
                                                                `Status: ${waitingMessage}`,
                                                                `Product: ${productLabel}${variantLabel ? ` (${variantLabel})` : ""}`,
                                                                `Quantity: ${qtyLabel}`,
                                                                `Buyer: ${buyerLabel}`,
                                                                `Seller: ${sellerLabel}`,
                                                            ].filter(Boolean);
                                                            const message = messageLines.join("\n");
                                                            const whatsappUrl = `https://wa.me/919019351483?text=${encodeURIComponent(message)}`;
                                                            return (
                                                                <a
                                                                    href={whatsappUrl}
                                                            target="_blank"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-success-500 text-white rounded-xl text-[10px] font-black border border-success-600/20 hover:bg-success-600 transition-all hover:scale-105 active:scale-95 no-underline"
                                                                >
                                                                    <FaWhatsapp size={13} />
                                                                    WHATSAPP SUPPORT
                                                                </a>
                                                            );
                                                        })()}
                                                        <span className="text-[9px] text-default-400 font-bold tracking-wider mt-0.5">+91 90193 51483</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="px-4 md:px-6 py-6 md:py-10">
                        {/* Status Stepper */}
                        {workflowStageOptions.length === 0 ? (
                            <div className="rounded-xl border border-warning-500/20 bg-warning-500/5 px-4 py-3 text-xs font-bold text-warning-600 uppercase tracking-widest">
                                No flow rules configured for enquiries. Configure Flow Rules to unlock stages and actions.
                            </div>
                        ) : (
                            <Progress
                                size="sm"
                                radius="full"
                                value={workflowStageOptions.length > 1
                                    ? (currentStepIndex / (workflowStageOptions.length - 1)) * 100
                                    : 0}
                                color={isCompletedFlow ? "success" : "primary"}
                                className="mb-4"
                            />
                        )}
                        {workflowStageOptions.length > 0 && (
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
                        )}
                        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] uppercase font-black tracking-widest text-primary-600">Current Progress</span>
                                {isCancelled && <Chip size="sm" color="danger" variant="flat">Cancelled</Chip>}
                            </div>
                            <p className="text-sm font-medium text-default-700 mt-1">{waitingMessage}</p>
                            {revisionItems.length > 0 && (
                                <div className="mt-3 rounded-xl border border-default-200/60 bg-default-100/40 px-3 py-2">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-default-500">
                                        Revision Acknowledged
                                    </div>
                                    {revisionAcknowledgedLabels.length > 0 ? (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {revisionAcknowledgedLabels.map((label: string, idx: number) => (
                                                <span
                                                    key={`revision-ack-${label}-${idx}`}
                                                    className="px-2 py-0.5 rounded-full bg-success-500/10 border border-success-500/20 text-[9px] font-black uppercase tracking-widest text-success-600"
                                                >
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-1 text-[10px] font-semibold text-default-500">
                                            No revision acknowledgements yet.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 rounded-2xl border border-default-200/50 bg-foreground/[0.02] px-4 py-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-[10px] uppercase font-black tracking-widest text-default-500">Stage Actions</span>
                                <span className="text-[10px] font-bold text-default-400">{String(stageLabelMap.get(workflowStage) || workflowStage).replaceAll("_", " ")}</span>
                            </div>
                            {normalizedStageKey === "QUOTATION_REVISION" ? (
                                <div className="text-xs text-default-500">
                                    <div className="font-semibold text-default-600">Stage actions for this step:</div>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        <span className="px-2 py-0.5 rounded-full bg-default-100 text-[10px] font-bold uppercase tracking-widest">Submit Revision (Buyer)</span>
                                        <span className="px-2 py-0.5 rounded-full bg-default-100 text-[10px] font-bold uppercase tracking-widest">Save Reply (Supplier)</span>
                                        <span className="px-2 py-0.5 rounded-full bg-default-100 text-[10px] font-bold uppercase tracking-widest">Confirm Revision (Buyer)</span>
                                    </div>
                                    <div className="mt-1">Use the revision panel below to perform these actions.</div>
                                </div>
                            ) : displayActions.length === 0 ? (
                                <div className="text-xs text-default-500">No actions configured for this stage.</div>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {displayActions.map((actionKey: string) => (
                                        <div key={actionKey} className="flex flex-col items-start gap-1">
                                            <Button
                                                size="sm"
                                                color="primary"
                                                variant={actionKey === "RETURN_TO_REVISION" || actionKey === "OTHER_DOCS_SKIPPED" || actionKey === "PO_SKIPPED" ? "flat" : "solid"}
                                                className="font-bold px-4 rounded-xl h-9 text-[10px] tracking-widest uppercase"
                                                isDisabled={!canPerformAction || Boolean(actionStatus[actionKey]) || isConvertingOrder}
                                                onPress={() => handleActionPress(actionKey)}
                                                isLoading={isActionLoading(actionKey)}
                                            >
                                                {actionKey === "CONVERT_TO_ORDER" && isConvertingOrder
                                                    ? "Converting..."
                                                    : actionLabels[actionKey] || actionKey.replaceAll("_", " ")}
                                            </Button>
                                            {isSystemAdmin && actionByLabelText && (
                                                <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest">
                                                    Action by: {actionByLabelText}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isConvertingOrder && (
                                <div className="mt-3 text-[10px] font-semibold text-default-500">
                                    Converting order… Please wait.
                                </div>
                            )}
                            {draftQuotationError && (
                                <div className="mt-3 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-[11px] font-bold text-danger-200 uppercase tracking-wide">
                                    {draftQuotationError}
                                </div>
                            )}
                        </div>

                        {normalizedStageKey === "QUOTATION_REVISION" && (
                            <div id="revision-panel" className="mt-8 rounded-[1.75rem] border border-default-200/50 bg-content1/50 backdrop-blur-3xl overflow-hidden shadow-xl relative group/rev">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/rev:opacity-[0.04] transition-opacity pointer-events-none rotate-12 duration-700">
                                    <FiTrendingDown size={140} />
                                </div>
                                <div className="px-6 pt-6 pb-3 flex items-center justify-between border-b border-divider/50 bg-white/10 dark:bg-black/10">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-warning-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-default-500 dark:text-default-400">Negotiation Loop</span>
                                        </div>
                                        <h3 className="text-lg font-black text-foreground tracking-tighter inline-flex items-center gap-2">
                                            <FiEdit3 className="text-warning-500" size={20} />
                                            Revision Hub
                                        </h3>
                                    </div>
                                    {revisionBuyerConfirmedAt && (
                                        <div className="px-4 py-2 rounded-2xl bg-success-500/10 border border-success-500/20 text-success-600 dark:text-success-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <FiCheckCircle size={14} />
                                            Negotiation Finalized
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    {revisionItems.length === 0 && canBuyerRevision && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <button
                                                    onClick={() => setClarificationReasonRate(!clarificationReasonRate)}
                                                    className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300 ${clarificationReasonRate ? "bg-primary/10 border-primary shadow-lg shadow-primary/10 scale-[1.01]" : "bg-white/40 dark:bg-black/20 border-default-200 hover:border-primary/50"}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${clarificationReasonRate ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                                                        <FiTrendingDown size={20} />
                                                    </div>
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="text-sm font-black text-foreground tracking-tight">Rate Revision</span>
                                                        <span className="text-[10px] text-default-500 dark:text-default-400 font-bold uppercase tracking-widest text-left leading-none">Buyer Target Pricing</span>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => setClarificationReasonPayment(!clarificationReasonPayment)}
                                                    className={`flex flex-col gap-4 p-5 rounded-3xl border transition-all duration-300 ${clarificationReasonPayment ? "bg-success/10 border-success shadow-lg shadow-success/10 scale-[1.02]" : "bg-white/40 dark:bg-black/20 border-default-200 hover:border-success/50"}`}
                                                >
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${clarificationReasonPayment ? "bg-success text-white" : "bg-success/10 text-success"}`}>
                                                        <FiPercent size={24} />
                                                    </div>
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="text-sm font-black text-foreground tracking-tight">Payment Terms</span>
                                                        <span className="text-[10px] text-default-500 dark:text-default-400 font-bold uppercase tracking-widest text-left leading-none">Framework Adjustments</span>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => setClarificationReasonTimeline(!clarificationReasonTimeline)}
                                                    className={`flex flex-col gap-4 p-5 rounded-3xl border transition-all duration-300 ${clarificationReasonTimeline ? "bg-warning/10 border-warning shadow-lg shadow-warning/10 scale-[1.02]" : "bg-white/40 dark:bg-black/20 border-default-200 hover:border-warning/50"}`}
                                                >
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${clarificationReasonTimeline ? "bg-warning text-white" : "bg-warning/10 text-warning"}`}>
                                                        <LuClock size={24} />
                                                    </div>
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="text-sm font-black text-foreground tracking-tight">Timeline Shift</span>
                                                        <span className="text-[10px] text-default-500 dark:text-default-400 font-bold uppercase tracking-widest text-left leading-none">Logistics Milestone</span>
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                                {clarificationReasonRate && (
                                                    <div className="flex flex-col gap-3 max-w-md">
                                                        <Input
                                                            type="number"
                                                            label="Requested Rate"
                                                            variant="bordered"
                                                            placeholder="Enter preferred unit rate"
                                                            value={clarificationRate}
                                                            onValueChange={setClarificationRate}
                                                            classNames={{
                                                                label: "font-black uppercase text-[10px] tracking-widest text-primary mb-1 pl-1",
                                                                inputWrapper: "rounded-2xl border-divider bg-default-100/10 dark:bg-black/20 hover:bg-default-100/20 data-[hover=true]:border-primary transition-all h-14 shadow-inner",
                                                                input: "font-black text-sm",
                                                            }}
                                                        />

                                                        {/* Supplier Rate Context Hint */}
                                                        {baseRate > 0 && (
                                                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning-500/[0.05] border border-warning-500/20 relative overflow-hidden">
                                                                <div className="absolute top-0 left-0 w-1 h-full bg-warning-500/50 rounded-l-2xl" />
                                                                <div className="flex flex-col gap-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-warning-600 dark:text-warning-400">
                                                                            SUPPLIER ASKING RATE
                                                                        </span>
                                                                        <span className="text-sm font-black text-warning-600 dark:text-warning-300">
                                                                            {formatRate(baseRate)}<span className="text-[10px] font-bold text-default-400 ml-1">/KG</span>
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[11px] text-default-500 dark:text-default-400 leading-relaxed font-medium">
                                                                        This is the rate the supplier is currently offering. The further your bid goes below this rate, the lower the likelihood of securing the product.
                                                                    </p>
                                                                    {clarificationRate && Number(clarificationRate) < baseRate && (
                                                                        <div className="flex items-center gap-1.5 mt-1">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-danger-500 shrink-0" />
                                                                            <span className="text-[10px] font-black text-danger-500">
                                                                                Your bid is {formatRate(baseRate - Number(clarificationRate))}/KG below the supplier rate — acceptance is less likely.
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {clarificationRate && Number(clarificationRate) >= baseRate && (
                                                                        <div className="flex items-center gap-1.5 mt-1">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-success-500 shrink-0" />
                                                                            <span className="text-[10px] font-black text-success-600">
                                                                                Your bid meets or exceeds the supplier rate — high acceptance probability.
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}


                                                {clarificationReasonTimeline && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Select
                                                            label="Delivery Protocol"
                                                            variant="bordered"
                                                            placeholder="Select milestone"
                                                            selectedKeys={clarificationDeliveryMode ? [clarificationDeliveryMode] : []}
                                                            onSelectionChange={(keys) => {
                                                                const value = Array.from(keys)[0] as string | undefined;
                                                                setClarificationDeliveryMode((value as any) || "");
                                                            }}
                                                            classNames={{
                                                                label: "font-black uppercase text-[10px] tracking-widest text-warning-600 mb-1 pl-1",
                                                                trigger: "rounded-2xl border-divider bg-default-100/10 dark:bg-black/20 hover:bg-default-100/20 data-[hover=true]:border-warning transition-all h-14 shadow-inner",
                                                                value: "font-black text-xs uppercase"
                                                            }}
                                                        >
                                                            <SelectItem key="DELIVER_TO_LOCATION">DELIVER TO LOCATION</SelectItem>
                                                            <SelectItem key="PRODUCT_READY">PRODUCT READY</SelectItem>
                                                        </Select>
                                                        <Input
                                                            type="date"
                                                            label="Precision Date"
                                                            variant="bordered"
                                                            value={clarificationDeliveryDate}
                                                            onValueChange={setClarificationDeliveryDate}
                                                            classNames={{
                                                                label: "font-black uppercase text-[10px] tracking-widest text-warning-600 mb-1 pl-1",
                                                                inputWrapper: "rounded-2xl border-divider bg-default-100/10 dark:bg-black/20 hover:bg-default-100/20 data-[hover=true]:border-warning transition-all h-14 shadow-inner",
                                                                input: "font-black text-xs uppercase"
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[2rem] bg-default-100/30 border border-default-200/50">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            isSelected={clarificationCommunicated}
                                                            onValueChange={setClarificationCommunicated}
                                                            classNames={{ wrapper: "rounded-lg" }}
                                                        />
                                                        <span
                                                            className="text-xs font-black text-foreground uppercase tracking-tight italic cursor-pointer select-none"
                                                            onClick={() => setClarificationCommunicated(!clarificationCommunicated)}
                                                        >
                                                            External Synchronization Confirmed
                                                        </span>
                                                    </div>
                                                    <p
                                                        className="text-[10px] text-default-400 font-bold ml-8 cursor-pointer select-none"
                                                        onClick={() => setClarificationCommunicated(!clarificationCommunicated)}
                                                    >
                                                        I have informed the supplier about this revision through secure channels.
                                                    </p>
                                                    {!clarificationCommunicated && (
                                                        <span className="text-[9px] font-black text-warning-600 uppercase tracking-widest ml-8 animate-pulse mt-1 inline-flex items-center gap-2">
                                                            <FiAlertCircle size={10} />
                                                            Protocol confirmation required
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-end gap-3">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                                                        <Button
                                                            size="lg"
                                                            color="primary"
                                                            className="px-10 h-12 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                                            isLoading={revisionRequestMutation.isPending}
                                                            isDisabled={
                                                                !(clarificationReasonRate || clarificationReasonPayment || clarificationReasonTimeline) ||
                                                                (clarificationReasonRate && (!clarificationRate || Number.isNaN(Number(clarificationRate)))) ||
                                                                (clarificationReasonTimeline && (!clarificationDeliveryMode || !clarificationDeliveryDate)) ||
                                                                !clarificationCommunicated
                                                            }
                                                            onPress={() => revisionRequestMutation.mutate()}
                                                        >
                                                            Submit Revision
                                                        </Button>
                                                        <Button
                                                            size="lg"
                                                            color="warning"
                                                            variant="shadow"
                                                            className="px-8 h-12 rounded-xl font-black uppercase tracking-[0.22em] text-xs shadow-xl shadow-warning/30 text-black hover:scale-[1.03] active:scale-95 transition-all"
                                                            isDisabled={applyActionMutation.isPending}
                                                            onPress={() => applyActionMutation.mutate({ actionKey: "REVISION_SKIPPED" })}
                                                        >
                                                            Skip Revision
                                                        </Button>
                                                    </div>
                                                    {isSystemAdmin && (
                                                        <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest mr-2">
                                                            Action by: Buyer
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {revisionError && (
                                                <div className="text-xs font-bold text-danger-500 px-6 animate-bounce">{revisionError}</div>
                                            )}
                                        </div>
                                    )}

                                    {revisionItems.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {revisionItems.map((item: any) => {
                                                    const itemKey = String(item.key || "").toUpperCase();
                                                    const reply = revisionReplies.find((r) => r.key === itemKey) || { acknowledged: false, counterRate: "" };
                                                    const itemLabel = itemKey.replaceAll("_", " ");

                                                    return (
                                                        <div key={itemKey} className="group relative flex flex-col gap-4 p-6 rounded-[2rem] border border-white dark:border-default-200/10 bg-white/60 dark:bg-black/20 shadow-sm hover:shadow-xl transition-all duration-500">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${itemKey === "RATE" ? "bg-primary/10 text-primary" : itemKey === "DELIVERY_TIMELINE" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                                                                        {itemKey === "RATE" ? <FiTrendingDown size={20} /> : itemKey === "DELIVERY_TIMELINE" ? <LuClock size={20} /> : <FiPercent size={20} />}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500 dark:text-default-400 leading-none mb-1">{itemLabel}</span>
                                                                        <span className="text-base font-black text-foreground tracking-tighter">Buyer Request</span>
                                                                    </div>
                                                                </div>
                                                                {item.supplierAcknowledged && (
                                                                    <div className="px-3 py-1 rounded-full bg-success-500/10 border border-success-500/20 text-success-600 text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                                                                        <LuCheck size={12} />
                                                                        Synced
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="p-4 rounded-2xl bg-default-100/50 border border-divider/50 flex flex-col gap-2">
                                                                <span className="text-[10px] font-bold text-default-500 dark:text-default-400 uppercase tracking-widest leading-none">Specifications</span>
                                                                {itemKey === "RATE" && (
                                                                    <div className="text-sm font-black text-foreground">Requested Rate: <span className="text-primary italic">{formatRate(item.buyerRate)}</span></div>
                                                                )}
                                                                {itemKey === "DELIVERY_TIMELINE" && (
                                                                    <div className="text-sm font-black text-foreground">
                                                                        Target: <span className="text-warning-600 underline decoration-2 underline-offset-4">{item.buyerDeliveryMode === "DELIVER_TO_LOCATION" ? "To Location" : "Ready for Pickup"}</span> 
                                                                        <span className="text-default-400 font-bold mx-2">•</span> 
                                                                        {item.buyerDeliveryDate ? dayjs(item.buyerDeliveryDate).format("DD MMM YYYY") : "-"}
                                                                    </div>
                                                                )}
                                                                {itemKey === "PAYMENT_TERMS" && (
                                                                    <div className="text-sm font-black text-foreground">Framework Revision Requested</div>
                                                                )}
                                                            </div>

                                                            {canSupplierRevision && (
                                                                <div className="mt-2 flex flex-col gap-4 p-4 rounded-2xl bg-white dark:bg-black/40 border border-primary/20 shadow-lg shadow-primary/5">
                                                                    {itemKey === "RATE" ? (
                                                                        <div className="flex flex-col gap-3">
                                                                            <div className="text-[10px] font-black uppercase tracking-widest text-default-500">Rate Response</div>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant={reply.acknowledged && !reply.counterRate ? "solid" : "flat"}
                                                                                    color="success"
                                                                                    className="font-black uppercase tracking-widest text-[10px] px-4 h-8 rounded-xl"
                                                                                    onPress={() => {
                                                                                        setRevisionReplies((prev) => {
                                                                                            const existing = prev.find((r) => r.key === itemKey);
                                                                                            if (!existing) return [...prev, { key: itemKey, acknowledged: true, counterRate: "" }];
                                                                                            return prev.map((r) => r.key === itemKey ? { ...r, acknowledged: true, counterRate: "" } : r);
                                                                                        });
                                                                                        setRevisionConfirmError("");
                                                                                    }}
                                                                                >
                                                                                    Accept Requested Rate
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant={reply.counterRate ? "solid" : "flat"}
                                                                                    color="warning"
                                                                                    className="font-black uppercase tracking-widest text-[10px] px-4 h-8 rounded-xl"
                                                                                    onPress={() => {
                                                                                        setRevisionReplies((prev) => {
                                                                                            const existing = prev.find((r) => r.key === itemKey);
                                                                                            if (!existing) return [...prev, { key: itemKey, acknowledged: true, counterRate: "" }];
                                                                                            return prev.map((r) => r.key === itemKey ? { ...r, acknowledged: true } : r);
                                                                                        });
                                                                                        setRevisionConfirmError("");
                                                                                    }}
                                                                                >
                                                                                    Propose Max Rate
                                                                                </Button>
                                                                            </div>
                                                                            <Input
                                                                                type="number"
                                                                                size="sm"
                                                                                label="Maximum Rate (if proposing)"
                                                                                variant="bordered"
                                                                                placeholder="Enter max rate"
                                                                                value={reply.counterRate || ""}
                                                                                onValueChange={(val) => {
                                                                                    setRevisionReplies((prev) => {
                                                                                        const existing = prev.find((r) => r.key === itemKey);
                                                                                        if (!existing) return [...prev, { key: itemKey, acknowledged: true, counterRate: val }];
                                                                                        return prev.map((r) => r.key === itemKey ? { ...r, acknowledged: true, counterRate: val } : r);
                                                                                    });
                                                                                    setRevisionConfirmError("");
                                                                                }}
                                                                                classNames={{
                                                                                    label: "font-black uppercase text-[10px] tracking-widest text-default-400 group-focus-within/input:text-primary transition-colors",
                                                                                    inputWrapper: "rounded-xl border-divider bg-default-100/5 dark:bg-black/10 hover:bg-default-100/10 h-10 shadow-inner group-focus-within/input:border-primary",
                                                                                    input: "font-black text-sm"
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <Checkbox
                                                                            isSelected={reply.acknowledged}
                                                                            onValueChange={(val) => {
                                                                                setRevisionReplies((prev) => {
                                                                                    const existing = prev.find((r) => r.key === itemKey);
                                                                                    if (!existing) return [...prev, { key: itemKey, acknowledged: val, counterRate: "" }];
                                                                                    return prev.map((r) => r.key === itemKey ? { ...r, acknowledged: val } : r);
                                                                                });
                                                                                setRevisionConfirmError("");
                                                                            }}
                                                                            classNames={{ label: "text-xs font-black uppercase tracking-tight text-foreground" }}
                                                                        >
                                                                            Acknowledge Parameter
                                                                        </Checkbox>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-default-100/30 border border-default-200/50 mt-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-default-500 dark:text-default-400">Negotiation Status</span>
                                                    {!allRevisionAcknowledged ? (
                                                        <div className="flex items-center gap-1.5 text-warning-600 font-bold text-[10px] italic uppercase tracking-tight">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
                                                            Waiting for supplier acknowledgment
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-success-600 font-bold text-[10px] italic uppercase tracking-tight">
                                                            <FiCheckCircle size={14} />
                                                            All parameters synchronized
                                                        </div>
                                                    )}
                                                </div>
 
                                                <div className="flex items-center gap-3">
                                                    {canSupplierRevision && (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                color="primary"
                                                                variant="shadow"
                                                                className="px-6 h-10 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                                                                isLoading={revisionReplyMutation.isPending}
                                                                isDisabled={!revisionReplies.some((item: any) => item.acknowledged)}
                                                                onPress={() => revisionReplyMutation.mutate()}
                                                                startContent={!revisionReplyMutation.isPending && <LuFileCheck size={14} />}
                                                            >
                                                                Propagate Sync
                                                            </Button>
                                                            {isSystemAdmin && <span className="text-[8px] font-bold text-default-400 uppercase tracking-widest mr-1">Supplier</span>}
                                                        </div>
                                                    )}

                                                    {canBuyerRevision && (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                color="success"
                                                                className="px-6 h-10 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-success/20 text-white hover:scale-[1.02] active:scale-95 transition-all outline-none"
                                                                isDisabled={revisionItems.length > 0 && !allRevisionAcknowledged}
                                                                isLoading={applyActionMutation.isPending}
                                                                onPress={() => applyActionMutation.mutate({ actionKey: "REVISION_CONFIRMED" })}
                                                                startContent={!applyActionMutation.isPending && <FiCheckCircle size={16} />}
                                                            >
                                                                Authorize Revision
                                                            </Button>
                                                            {isSystemAdmin && <span className="text-[8px] font-bold text-default-400 uppercase tracking-widest mr-1">Buyer</span>}
                                                        </div>
                                                    )}
                                                    {canBuyerRevision && (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                color="default"
                                                                variant="flat"
                                                                className="px-6 h-10 rounded-xl font-black uppercase tracking-widest text-[10px]"
                                                                isDisabled={applyActionMutation.isPending}
                                                                onPress={() => applyActionMutation.mutate({ actionKey: "REVISION_SKIPPED" })}
                                                            >
                                                                Proceed Without Revision
                                                            </Button>
                                                            {isSystemAdmin && <span className="text-[8px] font-bold text-default-400 uppercase tracking-widest mr-1">Buyer</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="px-6 space-y-2">
                                                {revisionReplyError && <div className="text-xs font-bold text-danger-500 animate-bounce">{revisionReplyError}</div>}
                                                {revisionReplySuccess && <div className="text-xs font-bold text-success-600 animate-pulse">{revisionReplySuccess}</div>}
                                                {revisionConfirmError && <div className="text-xs font-bold text-danger-500 animate-bounce">{revisionConfirmError}</div>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card className="w-full border border-default-200/50 shadow-md rounded-2xl">
                    <CardHeader className="flex flex-col items-start gap-2 px-5 pt-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-base tracking-tight">Documentation Checklist</span>
                                <span className="text-[9px] uppercase font-black tracking-widest text-default-400">
                                    Stage: {String(stageLabelMap.get(workflowStage) || workflowStage).replaceAll("_", " ")}
                                </span>
                            </div>
                            {canCreateProformaDoc && (
                                <Button
                                    size="sm"
                                    color="primary"
                                    variant="flat"
                                    className="font-black text-[9px] uppercase tracking-widest h-8 px-4 rounded-lg"
                                    isLoading={createDocMutation.isPending}
                                    onPress={() => createDocMutation.mutate(fallbackProformaRule)}
                                >
                                    Create Proforma Invoice
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardBody className="px-5 pb-5 pt-3">
                        {rulesForStage.filter(canSeeRule).length === 0 ? (
                            <div className="text-xs text-default-400 py-4 italic">No configuration for this stage.</div>
                        ) : (
                            <div className="space-y-2">
                                {rulesForStage.filter(canSeeRule).map((rule: any) => {
                                    const docTypeKey = String(rule.docType || "").toUpperCase();
                                    const actionTypeKey = String(rule.actionType || "").toUpperCase();
                                    const isPurchaseOrder = docTypeKey === "PURCHASE_ORDER";
                                    const hasDoc = hasDocType(String(rule.docType || ""));
                                    const actionTypeLabel = isPurchaseOrder ? "UPLOAD OR CREATE" : actionTypeKey;
                                    return (
                                        <div key={rule._id} className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-divider/50 bg-default-50/30 hover:bg-default-50 transition-colors group">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-xs tracking-tight text-foreground group-hover:text-primary transition-colors">{rule.docType}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-default-400">{rule.responsibleRole}</span>
                                                    <div className="w-1 h-1 rounded-full bg-default-300" />
                                                    <span className="text-[9px] font-bold text-default-500 uppercase tracking-tight">{actionTypeLabel}</span>
                                                </div>
                                                <span className="text-[8px] font-bold uppercase tracking-widest text-default-400">
                                                    Seller ↔ OBAOL / OBAOL ↔ Buyer
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Chip 
                                                    size="sm" 
                                                    variant="dot" 
                                                    color={hasDoc ? "success" : actionTypeKey === "UPLOAD" ? "primary" : "secondary"}
                                                    className="font-black uppercase text-[8px] tracking-[0.1em] h-5 border-none bg-transparent"
                                                >
                                                    {hasDoc
                                                        ? "ARCHIVED"
                                                        : isPurchaseOrder
                                                            ? "UPLOAD / CREATE"
                                                            : actionTypeKey === "UPLOAD"
                                                                ? "UPLOAD"
                                                                : "CREATE"
                                                    }
                                                </Chip>
                                                {!hasDoc && canActOnRule(rule) && (
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        className="font-black text-[9px] uppercase tracking-widest h-8 px-4 rounded-lg"
                                                        onPress={() => {
                                                            setDocActionRule(rule);
                                                            setDocActionOpen(true);
                                                        }}
                                                    >
                                                        {actionTypeKey === "UPLOAD"
                                                            ? "Upload"
                                                            : "Create"}
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

                <Card className="w-full border border-default-200/50 bg-content1/50 backdrop-blur-xl overflow-hidden rounded-[1.75rem] shadow-xl group/vault">
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 pt-6 pb-0">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,0,0,0.1)]" />
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-default-500 dark:text-default-400">Document Vault</span>
                            </div>
                            <h3 className="text-lg font-black text-foreground tracking-tighter inline-flex items-center gap-2">
                                <LuFileText className="text-primary" size={20} />
                                Trade Repository
                            </h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1.5 rounded-xl bg-white/10 dark:bg-black/20 border border-divider/50 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                <LuHistory size={12} className="text-default-400" />
                                {sortedEnquiryDocs.length} Active Records
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="px-6 pb-6 pt-4">
                        {sortedEnquiryDocs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6 rounded-[2rem] border-2 border-dashed border-divider bg-default-50/50">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-default-100 flex items-center justify-center text-default-400 mb-4 opacity-50">
                                    <LuFileText size={32} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-default-400">No records found</p>
                                <p className="text-xs text-default-300 font-bold mt-1 italic">Initiate trade actions to generate documents.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sortedEnquiryDocs.map((doc: any) => {
                                        const typeKey = String(doc?.type || "").toUpperCase();
                                        const label = DOC_TYPE_LABELS[typeKey] || String(typeKey || "").replaceAll("_", " ");
                                        const status = String(doc?.status || "DRAFT").toUpperCase();
                                        const createdAt = doc?.createdAt ? dayjs(doc.createdAt).format("DD MMM YYYY") : "";
                                        const hasFile = Boolean(doc?.fileUrl);
                                        const audienceLabel = getDocAudienceLabel(doc);

                                    const isSent = status === "SENT";
                                    const isDraft = status === "DRAFT";

                                    return (
                                        <div key={String(doc?._id || doc?.id || `${typeKey}-${createdAt}`)} className="group relative flex items-center justify-between gap-4 p-4 rounded-[1.5rem] border border-white dark:border-default-200/10 bg-white/60 dark:bg-black/20 shadow-sm hover:shadow-xl hover:scale-[1.01] hover:border-primary/30 transition-all duration-500">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`w-11 h-11 rounded-[1rem] flex items-center justify-center shadow-inner transition-colors duration-500 ${isDraft ? "bg-default-100 dark:bg-default-50 text-default-400 dark:text-default-500" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"}`}>
                                                    {typeKey === "LETTER_OF_INTENT" ? <FiFileText size={20} /> : typeKey === "QUOTATION" ? <LuFileCheck size={20} /> : <LuFileText size={20} />}
                                                </div>
                                                <div className="flex flex-col gap-0.5 truncate">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-default-500 dark:text-default-400 leading-none mb-0.5">{isDraft ? "Draft Version" : "Finalized Record"}</span>
                                                    <span className="text-sm font-black text-foreground tracking-tighter truncate group-hover:text-primary transition-colors">{label}</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <div className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border transition-colors ${isSent ? "bg-success-500/10 border-success-500/20 text-success-600" : "bg-default-400/10 border-default-400/20 text-default-400"}`}>
                                                            {status}
                                                        </div>
                                                        {audienceLabel && (
                                                            <div className="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-primary/20 text-primary/80 bg-primary/10">
                                                                {audienceLabel}
                                                            </div>
                                                        )}
                                                        {createdAt && (
                                                            <div className="flex items-center gap-1 text-[8px] font-bold text-default-400 uppercase tracking-widest">
                                                                <LuClock size={9} />
                                                                {createdAt}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <Button
                                                    isIconOnly
                                                    variant="shadow"
                                                    color="primary"
                                                    size="md"
                                                    className="w-10 h-10 min-w-unit-10 rounded-xl shadow-lg shadow-primary/20"
                                                    onPress={() => openDocViewer(doc)}
                                                >
                                                    <LuEye size={18} />
                                                </Button>
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
                            <Card className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-6 rounded-3xl border border-divider bg-content1/50">
                                {/* Enquiry Rate */}
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-default-400">Enquiry Rate</span>
                                    <span className="font-black text-xl text-primary">{formatRate(netRate)} <span className="text-xs font-bold text-default-400">/KG</span></span>
                                    <span className="text-xs text-default-400">At time of enquiry</span>
                                </div>

                                {/* Current Market Rate */}
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-default-400">Current Rate</span>
                                    {liveRate ? (
                                        <span className="font-black text-xl text-foreground">{formatRate(liveNetRate)} <span className="text-xs font-bold text-default-400">/KG</span></span>
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
                                            {priceDelta > 0 ? "+" : ""}{formatRate(Math.abs(priceDelta))} <span className="text-xs font-bold text-default-400">({priceDeltaPct}%)</span>
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
                                        Market price has {priceDelta > 0 ? "increased" : "decreased"} by {formatRate(Math.abs(priceDelta))}/KG ({Math.abs(Number(priceDeltaPct))}%) since this enquiry was created.
                                        {priceDelta > 0 ? " Costs may be higher than quoted." : " You may be able to negotiate a better price."}
                                    </span>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                )}

                {/* Details Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Parties Involved */}
                    {(isAdmin || isMediator) && (
                        <Card className="md:col-span-1 border border-divider bg-content1/50">
                            <CardHeader className="font-semibold text-base px-6 pt-6 uppercase tracking-wider text-default-400">Parties Involved</CardHeader>
                            <Divider className="my-1" />
                            <CardBody className="flex flex-col gap-4 px-6 pb-6">
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
                        <CardHeader className="font-bold text-lg px-6 pt-6">Product Details</CardHeader>
                        <Divider className="my-1" />
                        <CardBody className="flex flex-col gap-4 md:gap-5 px-6 pb-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-default-400">Product</span>
                                <span className="font-semibold text-lg">{enquiry.productId?.name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-default-400">Rate / KG</span>
                                <span className="font-bold text-success text-xl">{formatRate(netRate)}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-default-400">Quantity</span>
                                <span className="font-bold text-lg">{Number(enquiry.quantity || 0).toLocaleString("en-IN")} Ton</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-default-400">Preferred Incoterm</span>
                                <span className="text-sm font-semibold text-default-700">{preferredIncoterm || "Not specified"}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-default-400">Payment Term</span>
                                <span className="text-sm font-semibold text-default-700">{paymentTermLabel || "Not specified"}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] uppercase font-bold text-default-400">Buyer Specification</span>
                                {isBuyer ? (
                                    <div className="flex flex-col gap-2">
                                        <Textarea
                                            minRows={3}
                                            value={buyerSpecification}
                                            onChange={(e) => setBuyerSpecification(e.target.value)}
                                            isDisabled={isReadOnlyAfterConversion}
                                            placeholder="Add specific requirements..."
                                            className="flex-1"
                                        />
                                        <Button
                                            size="sm"
                                            color="primary"
                                            variant="flat"
                                            isLoading={updateSpecificationMutation.isPending}
                                            isDisabled={isReadOnlyAfterConversion || buyerSpecification.trim() === String(specificationTextRaw || "").trim()}
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
                        <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-2">
                            <span className="font-bold text-lg">Pricing Scenario</span>
                            <span className="text-[10px] uppercase font-black tracking-wider text-success-600">Excludes GST & Transportation</span>
                        </CardHeader>
                        <Divider />
                        <CardBody className="px-6 pb-6 pt-4">
                            <div className="mt-3 text-[11px] text-default-500 font-medium leading-relaxed">
                                Base price only (Ex-Mill / EXW / Ex-Factory). Execution services (procurement/logistics/packaging/etc.) have separate charges.
                            </div>
                            {(isAdmin || isMediator) ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center text-sm mt-1">
                                        <span className="text-default-500 font-medium">Ex-Mill Rate (Supplier)</span>
                                        <span className="font-bold text-foreground">{formatRate(baseRate)}</span>
                                    </div>
                                    {isAdmin && adminCommission > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-default-500 font-medium">+ OBAOL Margin</span>
                                            <span className="font-bold text-success">{formatRate(adminCommission)}</span>
                                        </div>
                                    )}
                                    {mediatorCommission > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-default-500 font-medium">+ Mediator Margin</span>
                                            <span className="font-bold text-warning-600">{formatRate(mediatorCommission)}</span>
                                        </div>
                                    )}
                                    <div className="w-full h-[1px] bg-default-200 mt-1 mb-0.5" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-default-400">Net EXW Rate / KG</span>
                                        <span className="font-black text-lg text-primary">{formatRate(netRate)}</span>
                                    </div>
                                    <div className="mt-4 p-4 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-success/20 flex flex-col gap-1">
                                        <span className="text-[10px] uppercase font-black text-success-600 tracking-widest">Calculated Trade Volume</span>
                                        <span className="font-black text-2xl text-success-700 dark:text-success-400 tracking-tight">
                                            {convertRate(tradeVolume)}
                                        </span>
                                        <span className="text-xs text-default-500 font-medium mt-1">
                                            {quantity} Ton ({quantityKg.toLocaleString("en-IN")} KG) × {formatRate(netRate)}/KG
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
                                        <span className="font-black text-xl text-primary">{formatRate(netRate)}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] uppercase font-bold text-default-400">Total Trade Volume</span>
                                        <span className="font-black text-2xl text-success-600 tracking-tight">{convertRate(tradeVolume)}</span>
                                        <span className="text-xs text-default-400">{quantity} Ton ({quantityKg.toLocaleString("en-IN")} KG) × {formatRate(netRate)}/KG</span>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Responsibility Arena */}
                    {isImportPortPickup ? (
                        <Card className="md:col-span-2 lg:col-span-3 order-12 border border-warning-500/20 bg-warning-500/[0.02] backdrop-blur-3xl p-1 shadow-2xl rounded-[2.5rem] relative overflow-hidden group w-full">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-warning-500/5 blur-[100px] rounded-full -mr-40 -mt-40 transition-all duration-700 group-hover:scale-110" />
                            <CardBody className="flex flex-col md:flex-row items-center gap-8 px-8 py-10 relative z-10">
                                <div className="w-24 h-24 rounded-[2rem] bg-warning-500/10 flex items-center justify-center text-warning-600 border border-warning-500/10 shadow-inner group-hover:rotate-6 transition-transform duration-500">
                                    <LuAnchor size={40} />
                                </div>
                                <div className="flex flex-col gap-4 flex-1 text-center md:text-left">
                                    <div className="flex flex-col gap-1">
                                         <div className="flex items-center gap-2 justify-center md:justify-start">
                                            <div className="w-1.5 h-1.5 bg-warning-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-warning-600 opacity-80">Logistics Profile</span>
                                         </div>
                                        <h3 className="text-2xl font-bold tracking-tight text-foreground">Port Pickup Protocol</h3>
                                    </div>
                                    <p className="text-sm font-medium text-default-500 max-w-2xl leading-relaxed">
                                        Responsibility events and inland transport segments are <span className="text-foreground font-bold">automatically decoupled</span> for port-delivery frameworks. The mission transition point is established at the port of arrival.
                                    </p>
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                        <div className="px-4 py-2 rounded-xl bg-foreground/5 border border-foreground/5 text-[10px] font-bold uppercase tracking-wider text-default-500">
                                            Arrival Handling Only
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-foreground/5 border border-foreground/5 text-[10px] font-bold uppercase tracking-wider text-default-500">
                                            No Inland Reservation
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary-600 cursor-pointer hover:bg-primary/10 transition-colors"
                                             onClick={() => {
                                                 setImportDeliveryMode("OBAOL_SERVICE");
                                                 updateImportDeliveryModeMutation.mutate("OBAOL_SERVICE");
                                             }}
                                        >
                                            Switch to OBAOL Service
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className={`md:col-span-2 lg:col-span-3 relative transition-all duration-500 w-full ${workflowStage === "PROFORMA_ISSUED" ? "rounded-[2.5rem] ring-2 ring-warning-500/40 shadow-[0_0_40px_rgba(234,179,8,0.08)]" : ""}`}>
                            {!hasResponsibilitiesFinalized && workflowStage === "PROFORMA_ISSUED" && (
                                <div className="flex items-center gap-3 px-6 pt-5 pb-0">
                                    <div className="w-2 h-2 rounded-full bg-warning-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-warning-600 dark:text-warning-400">
                                        ACTION REQUIRED — Finalize Responsibilities
                                    </span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-warning-500/30 to-transparent" />
                                </div>
                            )}
                            <ResponsibilityEventForm
                            incotermOptions={incotermOptions}
                            paymentTermOptions={paymentTermOptions}
                            selectedIncotermId={selectedIncotermId}
                            setSelectedIncotermId={setSelectedIncotermId}
                            selectedPaymentTermId={selectedPaymentTermId}
                            setSelectedPaymentTermId={setSelectedPaymentTermId}
                            isTradeTermsChanged={isTradeTermsChanged}
                            onSaveTradeTerms={() => updateTradeTermsMutation.mutate()}
                            savingTradeTerms={updateTradeTermsMutation.isPending}
                            tradeTermsSavedAt={tradeTermsSavedAt}
                            executionContext={executionContext}
                            setExecutionContext={setExecutionContext}
                            canToggleTradeType={(isBuyer || isAdmin) && canEditResponsibilityPlan}
                            states={states}
                            originDistrictOptions={originDistrictOptions}
                            destinationDistrictOptions={destinationDistrictOptions}
                            originCountryOptions={sortedCountries}
                            destinationCountryOptions={sortedCountries}
                            originPortOptions={originPortOptions}
                            destinationPortOptions={destinationPortOptions}
                            showOriginLogisticsFields={showOriginLogisticsFields}
                            showDestinationLogisticsFields={showDestinationLogisticsFields}
                            canEditOriginLogistics={canEditOriginLogistics}
                            canEditDestinationLogistics={canEditDestinationLogistics}
                            canEditRouteNotes={canEditRouteNotes}
                            responsibilityPlan={responsibilityPlan}
                            setResponsibilityPlan={setResponsibilityPlan}
                            responsibilityFieldConfig={responsibilityFieldConfig}
                            canEditResponsibilityPlan={canEditResponsibilityPlan}
                            isReadOnlyAfterConversion={isReadOnlyAfterConversion || hasResponsibilitiesFinalized}
                            inlandTransportSegments={inlandTransportSegments}
                            setInlandTransportSegments={setInlandTransportSegments}
                            packagingSpecifications={packagingSpecifications}
                            setPackagingSpecifications={setPackagingSpecifications}
                            hasPackagingSpecifications={hasPackagingSpecifications}
                            isInternational={executionContext.tradeType === "INTERNATIONAL"}
                            showCargoInsuranceNote={executionContext.tradeType === "INTERNATIONAL"}
                            isResponsibilityEventChanged={isResponsibilityEventChanged}
                            onSaveFramework={!hasResponsibilitiesFinalized ? () => updateResponsibilityPlanMutation.mutate() : undefined}
                            savingFramework={updateResponsibilityPlanMutation.isPending}
                            onFinalize={() => {
                                if (isResponsibilityEventChanged) {
                                    updateResponsibilityPlanMutation.mutate(undefined, {
                                        onSuccess: () => onFinalizeOpen()
                                    });
                                } else {
                                    onFinalizeOpen();
                                }
                            }}
                            finalizeLoading={finalizeResponsibilitiesMutation.isPending}
                            responsibilitySavedAt={responsibilitySavedAt}
                            showFinalizeButton={false}
                            showSaveTermsButton={true}
                        />
                        </div>
                    )}

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
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] uppercase font-bold text-default-400">Supply Ownership Operator</span>
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <div className={`w-2 h-2 rounded-full ${supplierOperatorName === "Not assigned" ? "bg-default-400" : "bg-success-500 animate-pulse"}`} />
                                    <span className={supplierOperatorName === "Not assigned" ? "text-default-500" : "text-primary"}>{supplierOperatorName}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] uppercase font-bold text-default-400">Legal Closer Operator</span>
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <div className={`w-2 h-2 rounded-full ${dealCloserOperatorName === "Not assigned" ? "bg-default-400" : "bg-warning-500 animate-pulse"}`} />
                                    <span className={dealCloserOperatorName === "Not assigned" ? "text-default-500" : "text-warning-500"}>{dealCloserOperatorName}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] uppercase font-bold text-default-400">Handler Operator</span>
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <div className={`w-2 h-2 rounded-full ${handlerOperatorName === "Not assigned" ? "bg-default-400" : "bg-primary-500 animate-pulse"}`} />
                                    <span className={handlerOperatorName === "Not assigned" ? "text-default-500" : "text-primary"}>{handlerOperatorName}</span>
                                </div>
                            </div>
                            {isAdmin && (
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] uppercase font-bold text-default-400">Supplier Ownership Operator</span>
                                    <Select
                                        size="sm"
                                        selectedKeys={selectedSupplierOperatorId ? [selectedSupplierOperatorId] : []}
                                        onSelectionChange={(keys) => {
                                            const arr = Array.from(keys as Set<string>);
                                            setSelectedSupplierOperatorId(arr[0] || "");
                                        }}
                                        className="flex-1"
                                        placeholder="Select supplier operator"
                                        isDisabled={isReadOnlyAfterConversion}
                                    >
                                        {operatorOptions.map((emp: any) => (
                                            <SelectItem key={emp._id} value={emp._id}>
                                                {emp.name || emp.firstName || emp.email}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            )}
                            {isAdmin && (
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] uppercase font-bold text-default-400">Deal Closer Operator</span>
                                    <Select
                                        size="sm"
                                        selectedKeys={selectedDealCloserOperatorId ? [selectedDealCloserOperatorId] : []}
                                        onSelectionChange={(keys) => {
                                            const arr = Array.from(keys as Set<string>);
                                            setSelectedDealCloserOperatorId(arr[0] || "");
                                        }}
                                        className="flex-1"
                                        placeholder="Select deal closer operator"
                                        isDisabled={isReadOnlyAfterConversion}
                                    >
                                        {operatorOptions.map((emp: any) => (
                                            <SelectItem key={emp._id} value={emp._id}>
                                                {emp.name || emp.firstName || emp.email}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            )}
                            {isSystemAdmin && (
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] uppercase font-bold text-default-400">Handler Operator</span>
                                    <Select
                                        size="sm"
                                        selectedKeys={selectedHandlerOperatorId ? [selectedHandlerOperatorId] : []}
                                        onSelectionChange={(keys) => {
                                            const arr = Array.from(keys as Set<string>);
                                            setSelectedHandlerOperatorId(arr[0] || "");
                                        }}
                                        className="flex-1"
                                        placeholder="Select handler operator"
                                        isDisabled={isReadOnlyAfterConversion}
                                    >
                                        {operatorOptions.map((emp: any) => (
                                            <SelectItem key={emp._id} value={emp._id}>
                                                {emp.name || emp.firstName || emp.email}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            )}
                            {!isSystemAdmin && isOperatorUser && !handlerOperatorId && (supplierOperatorId === String(user?.id || "") || dealCloserOperatorId === String(user?.id || "")) && (
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] uppercase font-bold text-default-400">Handler Volunteer</span>
                                    <Button
                                        size="sm"
                                        color="primary"
                                        variant="flat"
                                        isLoading={volunteerHandlerMutation.isPending}
                                        onPress={() => volunteerHandlerMutation.mutate()}
                                        isDisabled={isReadOnlyAfterConversion}
                                    >
                                        Volunteer as Handler
                                    </Button>
                                </div>
                            )}
                            {isAdmin && (
                                <div className="flex flex-col gap-4 mt-2">
                                    <Button
                                        size="lg"
                                        color={updateOperatorRolesMutation.isSuccess ? "success" : "secondary"}
                                        variant={updateOperatorRolesMutation.isSuccess ? "flat" : "solid"}
                                        className={`h-12 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 ${
                                            updateOperatorRolesMutation.isSuccess 
                                            ? "bg-success-500/10 text-success shadow-[0_0_20px_rgba(34,197,94,0.1)] border border-success-500/20" 
                                            : "shadow-xl shadow-secondary/20"
                                        }`}
                                        isLoading={updateOperatorRolesMutation.isPending}
                                        onPress={() => updateOperatorRolesMutation.mutate()}
                                        isDisabled={isReadOnlyAfterConversion}
                                        startContent={updateOperatorRolesMutation.isSuccess ? <FiCheckCircle size={16} /> : undefined}
                                    >
                                        {updateOperatorRolesMutation.isSuccess ? "PROTOCOL_AUTHORIZED" : "Save Operator Roles"}
                                    </Button>
                                    
                                    {updateOperatorRolesMutation.isSuccess && (
                                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-success-500/5 border border-success-500/10 self-start animate-in fade-in slide-in-from-left-2 duration-500">
                                            <div className="w-1 h-1 bg-success rounded-full animate-pulse" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-success-600 italic">MISSION_SUCCESS // SYSTEM_SYNCED</span>
                                        </div>
                                    )}
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
                                            isDisabled={isReadOnlyAfterConversion}
                                            className="flex-1"
                                        />
                                        <Button
                                            size="sm"
                                            color="secondary"
                                            variant="flat"
                                            isLoading={commitUntilMutation.isPending}
                                            onPress={() => commitUntilMutation.mutate()}
                                            isDisabled={!commitUntil || isReadOnlyAfterConversion}
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
                <Divider className="my-6" />

                {/* Bottom Action Hub */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-center gap-10 bg-foreground/[0.02] backdrop-blur-3xl p-10 md:p-12 rounded-[3.5rem] border border-foreground/5 shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/5 blur-[80px] rounded-full -ml-32 -mt-32" />
                    
                    <div className="flex flex-col gap-2 text-center md:text-left relative z-10">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                             <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--heroui-primary-rgb),0.5)]" />
                             <span className="text-[10px] font-bold tracking-widest uppercase text-primary">Readiness Protocol</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight leading-none text-foreground">Finalize & Execute</h2>
                        <p className="text-default-500 text-[11px] font-medium max-w-md opacity-80 decoration-transparent">Review performance parameters and logistics framework before authorizing mission-critical execution.</p>
                    </div>

                    <div className="flex flex-wrap gap-6 justify-center md:justify-end items-center relative z-10 w-full">
                        {isAdmin && (
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start mr-auto">
                                {!isConvertedFlow && !isCompletedFlow && !isCancelled && workflowStage === "PROFORMA_ISSUED" && hasSellerAccepted && enquiry.buyerConfirmedAt && (
                                    <>
                                        {!hasResponsibilitiesFinalized && (
                                            <Tooltip
                                                content={
                                                    <div className="px-5 py-4 rounded-3xl bg-content1 shadow-2xl border border-divider">
                                                        <div className="text-[10px] font-bold uppercase tracking-widest mb-4 text-default-400">Readiness Gap Analysis</div>
                                                        <ul className="flex flex-col gap-3">
                                                            {!hasFullResponsibilityPlan && <li className="flex items-center gap-3 text-danger-500 text-[10px] font-bold uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-danger-500" /> Ownership Allocation</li>}
                                                            {!hasExecutionContext && <li className="flex items-center gap-3 text-danger-500 text-[10px] font-bold uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-danger-500" /> Logistics Context</li>}
                                                            {!hasPackagingSpecifications && <li className="flex items-center gap-3 text-danger-500 text-[10px] font-bold uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-danger-500" /> Packaging Specs</li>}
                                                        </ul>
                                                    </div>
                                                }
                                                isDisabled={hasFullResponsibilityPlan && hasExecutionContext && hasPackagingSpecifications}
                                                placement="top"
                                                showArrow
                                                closeDelay={0}
                                            >
                                                <div className="w-full sm:w-auto">
                                                    <Button
                                                        color="warning"
                                                        className="w-full sm:w-auto font-bold px-10 rounded-2xl h-14 text-[11px] tracking-widest uppercase bg-warning text-black shadow-xl"
                                                        isLoading={finalizeResponsibilitiesMutation.isPending}
                                                        isDisabled={isReadOnlyAfterConversion || !hasExecutionContext || !hasFullResponsibilityPlan || !hasPackagingSpecifications}
                                                        onPress={() => onFinalizeOpen()}
                                                        startContent={<LuFileCheck size={20} />}
                                                    >
                                                        Finalize Framework
                                                    </Button>
                                                </div>
                                            </Tooltip>
                                        )}
                                        <Button
                                            color="default"
                                            variant="light"
                                            className="w-full sm:w-auto font-black px-0 py-0 h-auto text-[9px] tracking-[0.25em] uppercase text-default-400 hover:text-danger-500 hover:underline transition-all opacity-40 hover:opacity-100 italic bg-transparent shadow-none"
                                            onPress={() => updateStatusMutation.mutate("CANCELLED")}
                                            isLoading={updateStatusMutation.isPending}
                                        >
                                            Terminate Thread
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                        {requiredActions.length > 0 && (
                            <div className="flex flex-wrap gap-3 justify-end w-full md:w-auto ml-auto">
                                {displayActions.map((actionKey: string) => (
                                    <div key={actionKey} className="flex flex-col items-start gap-1">
                                        <Button
                                            size="sm"
                                            color="primary"
                                            variant={actionKey === "RETURN_TO_REVISION" || actionKey === "OTHER_DOCS_SKIPPED" || actionKey === "PO_SKIPPED" ? "flat" : "solid"}
                                            className="font-bold px-6 rounded-xl h-11 text-[10px] tracking-widest uppercase"
                                            isDisabled={!canPerformAction || Boolean(actionStatus[actionKey])}
                                            onPress={() => handleActionPress(actionKey)}
                                            isLoading={applyActionMutation.isPending && pendingActionKey === actionKey}
                                        >
                                            {actionLabels[actionKey] || actionKey.replaceAll("_", " ")}
                                        </Button>
                                        {isSystemAdmin && actionByLabelText && (
                                            <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest">
                                                Action by: {actionByLabelText}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {normalizedStatus === "CONVERTED" && (
                            <div className="w-full md:w-auto flex items-center gap-3 px-6 py-4 rounded-2xl border border-success-500/10 bg-success-500/5 text-success-600 text-[10px] font-bold uppercase tracking-widest">
                                <LuCheck size={14} />
                                Mission Finalized • Order Active
                            </div>
                        )}
                        {normalizedStatus === "CLOSED" && (
                            <div className="w-full md:w-auto flex items-center gap-3 px-6 py-4 rounded-2xl border border-default-500/10 bg-default-500/5 text-default-600 text-[10px] font-bold uppercase tracking-widest">
                                Enquiry Closed • Termination Successful
                            </div>
                        )}
                        
                        {!isAdmin && (enquiry as any)?.order && normalizedStatus !== "CONVERTED" && normalizedStatus !== "CLOSED" && (
                            <Button
                                className="w-full sm:w-auto font-bold px-8 rounded-2xl h-14 text-[11px] tracking-wider uppercase bg-success text-success-foreground shadow-lg shadow-success-500/20"
                                onPress={() => router.push(`/dashboard/orders/${(enquiry as any).order}`)}
                                startContent={<LuTruck size={18} />}
                            >
                                View Active Order
                            </Button>
                        )}
                        {(normalizedStatus === "CONVERTED" || normalizedStatus === "CLOSED") && (
                            <Button
                                className="w-full sm:w-auto font-bold px-8 rounded-2xl h-14 text-[11px] tracking-wider uppercase bg-success text-success-foreground shadow-lg shadow-success-500/20"
                                isDisabled={!enquiryOrderId}
                                onPress={() => enquiryOrderId && router.push(`/dashboard/orders/${enquiryOrderId}`)}
                                startContent={<LuTruck size={18} />}
                            >
                                View Mission Order
                            </Button>
                        )}
                    </div>
                </motion.div>

                <Modal
                    isOpen={isFinalizeOpen}
                    onOpenChange={onFinalizeOpenChange}
                    size="lg"
                    placement="center"
                    scrollBehavior="inside"
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    <span className="text-sm font-black uppercase tracking-widest text-default-400">Confirm Responsibility Finalization</span>
                                    <span className="text-lg font-black">Review responsibilities before locking</span>
                                </ModalHeader>
                                <ModalBody className="flex flex-col gap-4 py-6">
                                        <div className="rounded-2xl border border-warning-500/30 bg-warning-500/10 px-4 py-3 text-[11px] font-bold text-warning-600 uppercase tracking-widest">
                                            Finalizing will create execution tasks and move this enquiry into the Execution Panel.
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(0,0,0,0.2)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                                            <span className="text-[10px] uppercase font-black tracking-widest text-default-500 dark:text-default-400 leading-none">Global Trade Terms</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            { [
                                                { label: "From", value: responsibilitySummary.originLabel, icon: <LuMapPin size={14} className="text-blue-500" /> },
                                                { label: "To", value: responsibilitySummary.destinationLabel, icon: <LuMapPin size={14} className="text-danger-500" /> },
                                                { label: "Incoterm", value: responsibilitySummary.incotermLabel, icon: <LuGlobe size={14} className="text-primary" /> },
                                                { label: "Payment", value: responsibilitySummary.paymentLabel, icon: <FiPercent size={14} className="text-warning-500" /> },
                                                { label: "Trade Type", value: responsibilitySummary.tradeType, icon: <LuActivity size={14} className="text-success-500" /> },
                                            ].map((term) => {
                                                const isMissing = String(term.value || "").toLowerCase().includes("not spec") || String(term.value || "").toLowerCase().includes("not set");
                                                return (
                                                    <div key={term.label} className="flex justify-between items-center rounded-xl bg-white/40 dark:bg-black/40 border border-default-200/50 px-4 py-2.5 shadow-sm">
                                                        <div className="flex items-center gap-2.5">
                                                            {term.icon}
                                                            <span className="text-default-500 dark:text-default-400 font-bold uppercase text-[9px] tracking-widest">{term.label}</span>
                                                        </div>
                                                        <span className={`font-black text-sm tracking-tight ${isMissing ? "text-danger-500 animate-pulse" : "text-foreground"}`}>
                                                            {term.value}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
 
                                    <div className="rounded-2xl border border-default-200/50 bg-content2/10 p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-3 rounded-full bg-success-500 shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
                                            <span className="text-[10px] uppercase font-black tracking-widest text-default-500 dark:text-default-400 leading-none">Packaging Specifications</span>
                                        </div>
                                        <div className={`p-4 rounded-xl border text-xs font-bold italic whitespace-pre-line leading-relaxed shadow-sm ${!responsibilitySummary.packagingSpecs || responsibilitySummary.packagingSpecs.includes("No specifications") 
                                            ? "bg-danger-500/5 border-danger-500/20 text-danger-500" 
                                            : "bg-white/40 dark:bg-black/40 border-default-200/50 text-default-600 dark:text-default-400"}`}>
                                            {responsibilitySummary.packagingSpecs || "No additional specifications provided."}
                                        </div>
                                    </div>
 
                                    <div className="rounded-2xl border border-default-200/50 bg-content2/10 p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-3 rounded-full bg-warning-500 shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
                                            <span className="text-[10px] uppercase font-black tracking-widest text-default-500 dark:text-default-400 leading-none">Responsibility Matrix</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {responsibilitySummary.listItems.map((item) => {
                                                const ownerKey = String(item.value || "").toLowerCase();
                                                let badgeStyles = "bg-default-100 text-default-400";
                                                let icon = <LuShieldCheck size={14} />;
                                                let label = "EXECUTION";
 
                                                if (ownerKey === "buyer") {
                                                    badgeStyles = "bg-primary/10 text-primary dark:text-primary-400 border border-primary/20";
                                                    icon = <LuUser size={14} />;
                                                    label = "BUYER";
                                                } else if (ownerKey === "seller" || ownerKey.includes("supp")) {
                                                    badgeStyles = "bg-success-500/10 text-success-600 dark:text-success-400 border border-success-500/20";
                                                    icon = <LuStore size={14} />;
                                                    label = "SUPPLIER";
                                                } else if (ownerKey === "obaol") {
                                                    badgeStyles = "bg-warning-500/10 text-warning-600 dark:text-warning-400 border border-warning-500/20";
                                                    icon = <LuShieldCheck size={14} />;
                                                    label = "OBAOL";
                                                }
 
                                                return (
                                                    <div key={item.label} className="flex flex-col gap-1.5 p-3 rounded-xl border border-default-200 bg-white/60 dark:bg-black/40 shadow-sm">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-default-500 dark:text-default-400 leading-none">{item.label}</span>
                                                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg w-fit ${badgeStyles}`}>
                                                            {icon}
                                                            <span className={`text-[10px] font-black tracking-wider ${ownerKey === "not set" ? "text-danger-500" : ""}`}>{label}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
 
                                    <div className="rounded-xl border border-warning-400/20 bg-warning-500/5 p-4 text-[10px] text-warning-600 dark:text-warning-500 font-bold flex items-start gap-3">
                                        <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
                                        <span>Finalizing will lock responsibilities and generate execution inquiries. Changes will not be allowed after conversion.</span>
                                    </div>
                                </ModalBody>
                                <ModalFooter className="flex items-center justify-between">
                                    <Button variant="light" onPress={onClose}>Cancel</Button>
                                    <Button
                                        color="warning"
                                        className="font-bold"
                                        isLoading={finalizeResponsibilitiesMutation.isPending}
                                        isDisabled={isReadOnlyAfterConversion || !hasExecutionContext || !hasFullResponsibilityPlan || !hasPackagingSpecifications}
                                        onPress={() => {
                                            finalizeResponsibilitiesMutation.mutate();
                                            onClose();
                                        }}
                                    >
                                        Finalize
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                <Modal
                    isOpen={clarificationOpen}
                    onOpenChange={setClarificationOpen}
                    size="lg"
                    placement="center"
                    scrollBehavior="inside"
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    <span className="text-sm font-black uppercase tracking-widest text-default-400">Revision Checklist</span>
                                    <span className="text-lg font-black">Request quotation revision</span>
                                </ModalHeader>
                                <ModalBody className="flex flex-col gap-4">
                                    <Checkbox isSelected={clarificationReasonRate} onValueChange={setClarificationReasonRate}>
                                        Rate
                                    </Checkbox>
                                    {clarificationReasonRate && (
                                        <Input
                                            type="number"
                                            label="Requested Rate"
                                            placeholder="Enter rate"
                                            value={clarificationRate}
                                            onValueChange={setClarificationRate}
                                        />
                                    )}
                                    <Checkbox isSelected={clarificationReasonPayment} onValueChange={setClarificationReasonPayment}>
                                        Payment Terms
                                    </Checkbox>
                                    <Checkbox isSelected={clarificationReasonTimeline} onValueChange={setClarificationReasonTimeline}>
                                        Delivery Timeline
                                    </Checkbox>
                                    <div className="flex flex-col gap-1">
                                        <Checkbox isSelected={clarificationCommunicated} onValueChange={setClarificationCommunicated}>
                                            I have informed the supplier about this revision.
                                        </Checkbox>
                                        {!clarificationCommunicated && (
                                            <span className="text-[11px] font-semibold text-warning-500">Check this box to enable Submit.</span>
                                        )}
                                    </div>
                                    {revisionError && (
                                        <div className="text-xs font-bold text-danger-500">{revisionError}</div>
                                    )}
                                </ModalBody>
                                <ModalFooter className="flex items-center justify-between">
                                    <Button variant="light" onPress={onClose}>Cancel</Button>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] text-default-400">
                                            {!clarificationReasonRate && !clarificationReasonPayment && !clarificationReasonTimeline
                                                ? "Select at least one reason."
                                                : clarificationReasonRate && (!clarificationRate || Number.isNaN(Number(clarificationRate)))
                                                    ? "Enter a valid rate."
                                                    : !clarificationCommunicated
                                                        ? "Confirm communication to supplier."
                                                        : ""}
                                        </span>
                                    <Button
                                        color="primary"
                                        className="font-bold"
                                        isLoading={revisionRequestMutation.isPending}
                                        isDisabled={
                                            !(clarificationReasonRate || clarificationReasonPayment || clarificationReasonTimeline) ||
                                            (clarificationReasonRate && (!clarificationRate || Number.isNaN(Number(clarificationRate)))) ||
                                            !clarificationCommunicated
                                        }
                                        onPress={async () => {
                                            const reasonsSelected = clarificationReasonRate || clarificationReasonPayment || clarificationReasonTimeline;
                                            if (!reasonsSelected) {
                                                setRevisionError("Select at least one reason.");
                                                return;
                                            }
                                            if (clarificationReasonRate && (!clarificationRate || Number.isNaN(Number(clarificationRate)))) {
                                                setRevisionError("Enter a valid rate.");
                                                return;
                                            }
                                            if (!clarificationCommunicated) {
                                                setRevisionError("Please confirm communication to supplier.");
                                                return;
                                            }
                                            setRevisionError("");
                                            const timeoutId = setTimeout(() => {
                                                setRevisionError("Request is taking too long. Please retry.");
                                            }, 15000);
                                            try {
                                                await revisionRequestMutation.mutateAsync();
                                            } finally {
                                                clearTimeout(timeoutId);
                                            }
                                        }}
                                    >
                                        Submit Revision
                                    </Button>
                                    </div>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                <Modal
                    isOpen={inventoryAcceptOpen}
                    onOpenChange={(open) => {
                        setInventoryAcceptOpen(open);
                        if (open) {
                            if (inventoryOptions.length === 0 && !isInventoryLoading) {
                                setIsAddingNewInventory(true);
                                if (!inlineQuantity) {
                                    setInlineQuantity(String(requiredQty || ""));
                                }
                            }
                        }
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
                                    <>
                                        {isInventoryLoading ? (
                                            <div className="rounded-lg border border-default-200/60 bg-default-100/50 px-3 py-2 text-sm text-default-500">
                                                Loading inventory...
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-warning-300/30 bg-warning-500/10 px-3 py-2 text-sm text-warning-700">
                                                No existing inventory found. Please add a new warehouse and stock below.
                                            </div>
                                        )}
                                    </>
                                )}

                                {!isAddingNewInventory && inventoryOptions.length > 0 ? (
                                    <>
                                        <Select
                                            label="Select Warehouse"
                                            placeholder="Choose inventory"
                                            selectedKeys={selectedInventoryId ? new Set([selectedInventoryId]) : new Set()}
                                            renderValue={() => {
                                                if (!selectedInventory) return "Choose inventory";
                                                return `${selectedInventory.warehouseName || "Warehouse"} • ${selectedInventory.availableQty} MT available`;
                                            }}
                                            onSelectionChange={(keys) => {
                                                const arr = Array.from(keys as Set<string>);
                                                const id = arr[0] || "";
                                                const picked = inventoryOptions.find((row: any) => String(row.invId) === String(id));
                                                const available = Number(picked?.availableQty || 0);
                                                const missing = Math.max(0, requiredQty - available);
                                                setSelectedInventoryId(id);
                                                setInlineQuantity(missing > 0 ? String(missing) : "");
                                                setAcceptAttempted(false);
                                            }}
                                        >
                                            {inventoryOptions.map((row: any) => (
                                                <SelectItem
                                                    key={row.invId}
                                                    value={row.invId}
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

                                {(isAddingNewInventory || inventoryOptions.length === 0 || (selectedInventory && selectedInventory.availableQty < requiredQty)) && (
                                    <div className="flex flex-col gap-2">
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
                                        {!isAddingNewInventory && selectedInventory && selectedInventory.availableQty < requiredQty && (
                                            <div className="text-[10px] text-warning-600 font-bold px-1 italic">
                                                * This inventory has insufficient stock. Please add the missing {(requiredQty - selectedInventory.availableQty).toFixed(2)} MT to enable selection.
                                            </div>
                                        )}
                                        <div className="text-[10px] text-default-400 font-medium px-1 leading-tight">
                                            The quantity field is required to ensure sufficient stock is available to fulfill this {requiredQty} MT requirement.
                                        </div>
                                    </div>
                                )}

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
                                {shouldShowMissingQtyError && (
                                    <div className="text-xs text-danger-600 font-semibold px-1">
                                        Please add the missing quantity to proceed.
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
                                        : (!selectedInventoryId || (selectedInventory && Number(selectedInventory.availableQty || 0) < requiredQty && !inlineQuantity))
                                }
                            >
                                Save & Accept Enquiry
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Conversion Modal */}
                <Modal 
                    isOpen={isOpen} 
                    onOpenChange={onOpenChange}
                    size="2xl"
                    backdrop="blur"
                    scrollBehavior="inside"
                    classNames={{
                        base: "bg-[#04070f] dark:bg-[#04070f] border border-white/5 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-[2.5rem] max-h-[92vh]",
                        wrapper: "z-[10000]",
                        backdrop: "bg-black/60 backdrop-blur-xl",
                        closeButton: "hover:bg-white/5 active:scale-95 transition-all top-6 right-6",
                        body: "overflow-y-auto",
                    }}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1 pt-12 px-10 shrink-0">
                                    <div className="flex items-center gap-5">
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all rounded-full" />
                                            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-2xl border border-primary/20">
                                                <FiArrowRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80 leading-none">COMMAND SEQUENCE INITIATED</span>
                                            <span className="text-3xl font-black tracking-tight text-white italic leading-none mt-1">Convert to Order</span>
                                        </div>
                                    </div>
                                </ModalHeader>
                                <ModalBody className="px-10 py-8 overflow-y-auto">
                                    <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 mb-6 flex items-start gap-4 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-all shadow-[0_0_15px_rgba(0,112,243,0.3)]" />
                                        <div className="mt-1 bg-primary/10 p-1.5 rounded-lg border border-primary/20">
                                            <FiInfo className="text-primary" size={20} />
                                        </div>
                                        <p className="text-[11px] font-bold text-default-300 dark:text-default-400 leading-relaxed uppercase tracking-wide">
                                            WARNING: PROCEEDING WITH CONVERSION WILL LOCK ALL TRADE PARAMETERS. 
                                            THIS ACTION SYNCHRONIZES RESPONSIBILITIES AND FINALIZES THE EXECUTION PROTOCOL.
                                        </p>
                                    </div>
                                    {conversionError && (
                                        <div className="mb-6 rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-[11px] font-bold text-danger-200 uppercase tracking-wide">
                                            {conversionError}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(0,112,243,0.5)]" />
                                        <span className="text-[11px] uppercase font-black tracking-[0.25em] text-white/50 italic">FINAL_RESPONSIBILITY_MATRIX</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                        {[
                                            { label: "Procurement / Sourcing", value: responsibilityPlan.procurementBy, icon: <LuSearch size={14} /> },
                                            { label: "Quality Testing", value: responsibilityPlan.qualityTestingBy, icon: <LuClipboardCheck size={14} /> },
                                            { label: "Packaging & Labelling", value: responsibilityPlan.packagingBy, icon: <LuPackage size={14} /> },
                                            { label: "Inland Transportation", value: responsibilityPlan.transportBy, icon: <LuTruck size={14} />, show: !isImportPortPickup },
                                            ...(executionContext.tradeType === "INTERNATIONAL" ? [
                                                { label: "Freight & Shipping", value: responsibilityPlan.shippingBy, icon: <LuAnchor size={14} /> },
                                                { label: "Cargo Insurance", value: responsibilityPlan.shippingBy, icon: <LuShieldCheck size={14} /> },
                                                { label: "Export Customs", value: responsibilityPlan.exportCustomsBy, icon: <LuFileCheck size={14} />, show: isFromIndia },
                                                { label: "Import Customs", value: responsibilityPlan.importCustomsBy, icon: <LuFileCheck size={14} />, show: isToIndia },
                                                { label: "Duties & Taxes", value: responsibilityPlan.dutiesTaxesBy, icon: <LuTag size={14} />, show: isToIndia },
                                                { label: "Port Handling", value: responsibilityPlan.portHandlingBy, icon: <LuAnchor size={14} />, show: isToIndia },
                                                { label: "Onward Transport", value: responsibilityPlan.destinationInlandTransportBy, icon: <LuTruck size={14} />, show: isToIndia && !isImportPortPickup },
                                            ] : [])
                                        ].filter(item => item.show !== false).map((item) => (
                                            <div key={item.label} className="group flex items-center justify-between p-4 rounded-2xl bg-content2/60 border border-white/10 hover:border-primary/40 hover:bg-content2/80 transition-all duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-primary/50 group-hover:text-primary transition-colors bg-black/40 p-2 rounded-xl border border-white/5 shadow-inner">
                                                        {item.icon}
                                                    </div>
                                                    <span className="text-[10px] font-black text-default-200 uppercase tracking-widest">{item.label}</span>
                                                </div>
                                                <Chip 
                                                    size="sm" 
                                                    variant="flat" 
                                                    color={item.value === "obaol" ? "primary" : item.value === "buyer" ? "success" : "warning"}
                                                    className="font-black uppercase text-[8px] tracking-[0.2em] h-6 px-3 bg-opacity-20 border border-current/20 shadow-lg"
                                                >
                                                    {item.value || "PENDING"}
                                                </Chip>
                                            </div>
                                        ))}
                                    </div>

                                    {packagingSpecifications && (
                                        <div className="mb-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-1.5 h-6 bg-success-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                                                <span className="text-[11px] uppercase font-black tracking-[0.25em] text-white/50 italic">PACKAGING_SPECIFICATIONS</span>
                                            </div>
                                            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 text-[11px] font-bold text-default-300 italic whitespace-pre-line leading-relaxed shadow-inner">
                                                {packagingSpecifications}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-warning-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                                            <span className="text-[11px] uppercase font-black tracking-[0.25em] text-white/50 italic">ORDER_CONTEXT_METADATA</span>
                                        </div>
                                        <Textarea
                                            label="Initial Notes"
                                            variant="flat"
                                            labelPlacement="outside"
                                            placeholder="Inject tactical instructions for mission execution..."
                                            value={conversionNote}
                                            onValueChange={setConversionNote}
                                            classNames={{
                                                inputWrapper: "bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all rounded-3xl p-6 min-h-[120px] shadow-inner focus-within:ring-1 focus-within:ring-primary/40",
                                                label: "hidden",
                                                input: "text-[12px] font-bold text-white placeholder:text-white/20"
                                            }}
                                        />
                                    </div>
                                </ModalBody>
                                <ModalFooter className="px-10 pb-12 pt-4 flex flex-col items-center gap-8">
                                    <Button 
                                        variant="light" 
                                        onPress={onClose}
                                        className="px-8 h-8 rounded-full font-black uppercase text-[9px] tracking-[0.3em] text-white/40 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        Close
                                    </Button>
                                    <div className="flex items-center justify-between w-full gap-4">
                                        <Button
                                            variant="flat"
                                            onPress={() => window?.open(`/dashboard/execution-enquiries?enquiryId=${Array.isArray(id) ? id[0] : id}`, "_blank")}
                                            className="flex-1 max-w-[240px] h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-warning-600 border border-warning-500/30 bg-warning-500/10 hover:bg-warning-500/20 shadow-xl shadow-warning-500/5"
                                        >
                                            Open Execution Panel
                                        </Button>
                                        <Button 
                                            color="primary"
                                            variant="shadow"
                                            onPress={async () => {
                                                setConversionError("");
                                                if (!hasSellerAccepted || !enquiry?.buyerConfirmedAt) {
                                                    setConversionError("Supplier acceptance and buyer confirmation are required before order conversion.");
                                                    return;
                                                }
                                                if (!hasResponsibilitiesFinalized) {
                                                    setConversionError("Finalize responsibilities before order conversion.");
                                                    return;
                                                }
                                                if (!hasFullResponsibilityPlan || !hasExecutionContext || !hasPackagingSpecifications) {
                                                    const missing: string[] = [];
                                                    if (!hasFullResponsibilityPlan) missing.push("responsibility plan");
                                                    if (!hasExecutionContext) missing.push("logistics context");
                                                    if (!hasPackagingSpecifications) missing.push("packaging specifications");
                                                    setConversionError(`Missing ${missing.join(", ")}. Please complete these before converting.`);
                                                    return;
                                                }
                                                try {
                                                    setIsConvertingOrder(true);
                                                    const res = await applyActionMutation.mutateAsync({
                                                        actionKey: "CONVERT_TO_ORDER",
                                                        notes: conversionNote,
                                                    });
                                                    const updatedInquiry = res?.data?.data || null;
                                                    const orderId = updatedInquiry?.order?._id || updatedInquiry?.order;
                                                    if (orderId) {
                                                        onClose();
                                                        router.push(`/dashboard/orders/${orderId}`);
                                                    }
                                                } catch (error: any) {
                                                    const msg = error?.response?.data?.message || error?.message || "Failed to convert to order.";
                                                    setConversionError(msg);
                                                } finally {
                                                    setIsConvertingOrder(false);
                                                }
                                            }}
                                            isLoading={applyActionMutation.isPending || isConvertingOrder}
                                            className="flex-1 max-w-[320px] h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-[0_0_30px_rgba(0,112,243,0.3)] bg-gradient-to-r from-primary to-primary-600 hover:scale-[1.02] active:scale-95 transition-all"
                                            startContent={!applyActionMutation.isPending && !isConvertingOrder && <FiCheckCircle size={16} />}
                                        >
                                            {isConvertingOrder ? "Converting..." : "ESTABLISH_ORDER_PROTOCOL"}
                                        </Button>
                                    </div>
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
                    classNames={{
                        base: "bg-black/90 dark:bg-[#0B0F14]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
                        wrapper: "z-[10000]",
                        backdrop: "bg-black/60 backdrop-blur-2xl",
                        closeButton: "hover:bg-white/5 active:scale-95 transition-all top-6 right-6",
                    }}
                >
                    <ModalContent>
                        <ModalHeader className="flex flex-col gap-1 pt-10 px-8 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-warning-500/10 flex items-center justify-center text-warning-500 border border-warning-500/20 shadow-lg">
                                    {String(docActionRule?.actionType || "") === "UPLOAD" ? <FiPackage size={22} /> : <FiPlus size={22} />}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-warning-500/80 leading-none italic">
                                        {String(docActionRule?.actionType || "EXECUTION") === "UPLOAD" ? "UPLOAD_SEQUENCE" : "GENERATION_REQUEST"}
                                    </span>
                                    <span className="text-xl font-black tracking-tight text-white uppercase italic leading-none mt-1">
                                        {docActionRule ? `${docActionRule.docType.replaceAll('_', ' ')}` : "EXECUTION_DOCUMENT"}
                                    </span>
                                </div>
                            </div>
                        </ModalHeader>
                        <ModalBody className="px-8 py-6">
                            {String(docActionRule?.actionType || "") === "UPLOAD" ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-1.5 h-4 bg-warning-500 rounded-full" />
                                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Resource Target</span>
                                    </div>
                                    <Input
                                        label="TACTICAL FILE URL"
                                        placeholder="Enter secure resource locator (https://...)"
                                        variant="flat"
                                        labelPlacement="outside"
                                        value={docActionFileUrl}
                                        onChange={(e) => setDocActionFileUrl(e.target.value)}
                                        classNames={{
                                            inputWrapper: "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all rounded-2xl h-14 px-5 focus-within:ring-1 focus-within:ring-warning-500/40",
                                            label: "hidden",
                                            input: "text-[12px] font-bold text-white placeholder:text-white/20"
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
                                    <div className="mt-1 bg-warning-500/10 p-1.5 rounded-lg">
                                        <FiInfo className="text-warning-500" size={18} />
                                    </div>
                                    <p className="text-[11px] font-bold text-default-400 leading-relaxed uppercase tracking-wide">
                                        Initiating automated generation protocol for {docActionRule?.docType?.replaceAll('_', ' ')}. 
                                        The document will be constructed based on current trade parameters and responsibility matrix.
                                    </p>
                                </div>
                            )}
                            
                            <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <LuUser className="text-default-500" size={14} />
                                    <span className="text-[10px] font-black text-default-400 uppercase tracking-widest leading-none">Authority Protocol</span>
                                </div>
                                <Chip 
                                    size="sm" 
                                    variant="flat" 
                                    className="font-black uppercase text-[8px] tracking-[0.2em] h-5 bg-warning-500/10 text-warning-500 border border-warning-500/20"
                                >
                                    {docActionRule?.responsibleRole ? docActionRule.responsibleRole : "AUTH_PENDING"}
                                </Chip>
                            </div>
                        </ModalBody>
                        <ModalFooter className="px-8 pb-10 pt-2 flex items-center justify-between gap-4">
                            <Button 
                                variant="light" 
                                onPress={() => setDocActionOpen(false)}
                                isDisabled={createDocMutation.isPending}
                                className="px-6 h-10 rounded-xl font-black uppercase text-[9px] tracking-[0.3em] text-white/40 hover:text-white hover:bg-white/5 transition-all"
                            >
                                ABORT
                            </Button>
                            <Button
                                color="warning"
                                variant="shadow"
                                onPress={() => createDocMutation.mutate(undefined)}
                                isLoading={createDocMutation.isPending}
                                isDisabled={String(docActionRule?.actionType || "") === "UPLOAD" && !docActionFileUrl.trim()}
                                className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-gradient-to-r from-warning-500 to-warning-600 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {String(docActionRule?.actionType || "") === "UPLOAD" ? "UPLOAD_FILE" : "EXECUTE_INITIATION"}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <Modal
                    isOpen={docViewerOpen}
                    onOpenChange={(open) => setDocViewerOpen(Boolean(open))}
                    size="4xl"
                    scrollBehavior="inside"
                >
                    <ModalContent>
                        <ModalHeader className="flex flex-col gap-1">
                            {DOC_TYPE_LABELS[String(docViewerDoc?.type || "").toUpperCase()] || String(docViewerDoc?.type || "Document").replaceAll("_", " ")}
                            <span className="text-[10px] uppercase font-black tracking-widest text-default-400">
                                {docViewerDoc?.documentNumber || "Draft Preview"}
                            </span>
                            {getDocAudienceLabel(docViewerDoc) && (
                                <span className="text-[9px] uppercase font-black tracking-widest text-primary/80">
                                    {getDocAudienceLabel(docViewerDoc)}
                                </span>
                            )}
                        </ModalHeader>
                        <ModalBody>
                            {docViewerDoc?.fileUrl ? (
                                <div className="space-y-3">
                                    <a
                                        href={docViewerDoc.fileUrl}
                                        target="_blank"
                                        className="text-xs font-bold text-primary-600 underline"
                                    >
                                        Open file in new tab
                                    </a>
                                    <div className="rounded-2xl border border-divider overflow-hidden">
                                        <iframe
                                            title="Document Preview"
                                            src={docViewerDoc.fileUrl}
                                            className="w-full h-[70vh]"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <DocumentTemplatePreview
                                    docType={String(docViewerDoc?.type || "")}
                                    actionType="CREATE"
                                    doc={docViewerDoc}
                                    enquiry={enquiry}
                                />
                            )}
                        </ModalBody>
                        <ModalFooter>
                            {(canManageDocs || isSystemAdmin) && (
                                <Button
                                    color="primary"
                                    variant="flat"
                                    onPress={() => emailDocMutation.mutate()}
                                    isLoading={emailDocMutation.isPending}
                                    isDisabled={!docViewerDoc?._id}
                                >
                                    Email Document
                                </Button>
                            )}
                            {(() => {
                                const docType = String(docViewerDoc?.type || "").toUpperCase();
                                const docStatus = String(docViewerDoc?.status || "").toUpperCase();
                                const canAdvance = canManageDocs || isSystemAdmin;
                                const actionButtons: React.ReactNode[] = [];

                                if (docType === "QUOTATION" && canAdvance) {
                                    if (!(enquiry as any)?.quotationCreatedAt) {
                                        actionButtons.push(
                                            <Button
                                                key="mark-quotation-created"
                                                color="secondary"
                                                variant="flat"
                                                onPress={() => applyActionMutation.mutate({ actionKey: "QUOTATION_CREATED" })}
                                                isLoading={applyActionMutation.isPending}
                                            >
                                                Mark Quotation Created
                                            </Button>
                                        );
                                    }
                                }

                                if (docType === "LOI" && canAdvance && !(enquiry as any)?.loiSubmittedAt) {
                                    actionButtons.push(
                                        <Button
                                            key="mark-loi-submitted"
                                            color="secondary"
                                            variant="flat"
                                            onPress={() => applyActionMutation.mutate({ actionKey: "LOI_SUBMITTED" })}
                                            isLoading={applyActionMutation.isPending}
                                        >
                                            Submit LOI
                                        </Button>
                                    );
                                }

                                if (docType === "PROFORMA_INVOICE" && canAdvance && !(enquiry as any)?.proformaCreatedAt) {
                                    actionButtons.push(
                                        <Button
                                            key="mark-proforma-created"
                                            color="secondary"
                                            variant="flat"
                                            onPress={() => applyActionMutation.mutate({ actionKey: "PROFORMA_CREATED" })}
                                            isLoading={applyActionMutation.isPending}
                                        >
                                            Mark Proforma Issued
                                        </Button>
                                    );
                                }

                                if (docType === "PURCHASE_ORDER" && canAdvance && !(enquiry as any)?.poSubmittedAt) {
                                    actionButtons.push(
                                        <Button
                                            key="mark-po-uploaded"
                                            color="secondary"
                                            variant="flat"
                                            onPress={() => applyActionMutation.mutate({ actionKey: "PO_UPLOADED" })}
                                            isLoading={applyActionMutation.isPending}
                                        >
                                            Mark PO Uploaded
                                        </Button>
                                    );
                                }

                                return actionButtons.length ? (
                                    <div className="flex flex-wrap gap-2">{actionButtons}</div>
                                ) : null;
                            })()}
                            <Button variant="light" onPress={() => setDocViewerOpen(false)}>
                                Close
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
                                onPress={() => reopenRequestMutation.mutate(undefined)}
                                isLoading={reopenRequestMutation.isPending}
                            >
                                Submit Request
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
}
