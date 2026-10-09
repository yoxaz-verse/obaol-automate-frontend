"use client";

import React, { useContext, useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Chip,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Input,
    Textarea,
    Select,
    SelectItem,
    Switch,
    Tooltip,
    Tabs,
    Tab,
} from "@nextui-org/react";
import { FiSend, FiEdit2, FiEyeOff, FiMessageSquare, FiInfo } from "react-icons/fi";
import { LuMessageSquare, LuBoxes, LuPackageCheck, LuTags, LuWarehouse, LuSearch, LuX } from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRoutesByRole } from "@/utils/tableValues";

import CommonTable from "@/components/CurdTable/common-table";
import QueryComponent from "@/components/queryComponent";
import AuthContext from "@/context/AuthContext";
import SectionSkeleton from "@/components/ui/SectionSkeleton";
import { getInventoryColumns, inventoryApiEndpoint, inventoryTableFields } from "@/features/inventory/tableConfig";
import TableFrame from "@/components/CurdTable/table-frame";
import { getData, postData, patchData, deleteData } from "@/core/api/apiHandler";
import { apiRoutes, associateCompanyRoutes, associateRoutes, inventoryRoutes, variantRateRoutes, inventoryReservationRoutes, warehouseRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";

const AddModal = dynamic(() => import("@/components/CurdTable/add-model"), { ssr: false });
const EditModal = dynamic(() => import("@/components/CurdTable/edit-model"), { ssr: false });
const DeleteModal = dynamic(() => import("@/components/CurdTable/delete"), { ssr: false });
const DynamicFilter = dynamic(() => import("@/components/CurdTable/dynamic-filtering"), { ssr: false });
const CompanySearch = dynamic(() => import("@/components/dashboard/Company/CompanySearch"), { ssr: false });

const InventoryList: React.FC = () => {
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);
    const roleLower = String(user?.role || "").toLowerCase();
    const isAdmin = roleLower === "admin";
    const isOperatorUser = roleLower === "operator" || roleLower === "team";
    const isAssociate = roleLower === "associate";
    const canUseDemo = isAdmin || isOperatorUser;
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 25;
    const [rateModalOpen, setRateModalOpen] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState<any>(null);
    const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
    const [rateValue, setRateValue] = useState("");
    const [rateLive, setRateLive] = useState(true);
    const [submittingRate, setSubmittingRate] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedRate, setSelectedRate] = useState<any>(null);
    const [stockQty, setStockQty] = useState("");
    const [submittingStock, setSubmittingStock] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("inventory");
    const [demoLoading, setDemoLoading] = useState(false);
    const [demoClearing, setDemoClearing] = useState(false);
    const router = useRouter();
    const [costModalOpen, setCostModalOpen] = useState(false);
    const [costInventory, setCostInventory] = useState<any>(null);
    const [customDays, setCustomDays] = useState("");

    const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
    const [selectedEnquiryInventory, setSelectedEnquiryInventory] = useState<any>(null);
    const [enquiryQty, setEnquiryQty] = useState("");
    const [enquiryIncotermId, setEnquiryIncotermId] = useState("");
    const [enquiryNotes, setEnquiryNotes] = useState("");
    const [enquiryBuyerAssociateId, setEnquiryBuyerAssociateId] = useState("");
    const [enquiryContactName, setEnquiryContactName] = useState("");
    const [enquiryContactPhone, setEnquiryContactPhone] = useState("");
    const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

    const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;
    const normalizeObjectId = (value: any): string => {
        const raw = typeof value === "string" ? value : typeof value === "object" && value !== null ? value._id || value.id || "" : "";
        const normalized = String(raw || "").trim();
        return OBJECT_ID_REGEX.test(normalized) ? normalized : "";
    };

    const openEnquiryModal = (item: any) => {
        setSelectedEnquiryInventory(item);
        setEnquiryQty(item.availableQty ? String(item.availableQty) : item.quantity ? String(item.quantity) : "1");
        setEnquiryIncotermId("");
        setEnquiryNotes("");
        setEnquiryBuyerAssociateId("");
        setEnquiryContactName((user as any)?.name || "");
        setEnquiryContactPhone((user as any)?.phone || (user as any)?.phoneNumber || "");
        setEnquiryModalOpen(true);
    };

    const closeEnquiryModal = () => {
        setEnquiryModalOpen(false);
        setSelectedEnquiryInventory(null);
        setEnquiryQty("");
        setEnquiryIncotermId("");
        setEnquiryNotes("");
        setEnquiryBuyerAssociateId("");
        setEnquiryContactName("");
        setEnquiryContactPhone("");
        setSubmittingEnquiry(false);
    };

    const { data: incotermResponse } = useQuery({
        queryKey: ["inventory-incoterms"],
        queryFn: () => getData(apiRoutes.incoterm.getAll),
        enabled: enquiryModalOpen,
    });

    const incotermOptions = useMemo(() => {
        const raw = incotermResponse?.data;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.data)) return raw.data;
        if (Array.isArray(raw?.data?.data)) return raw.data.data;
        return [];
    }, [incotermResponse]);

    const { data: buyersResponse } = useQuery({
        queryKey: ["inventory-enquiry-buyers"],
        queryFn: () => getData(apiRoutes.enquiry.buyerOptions, { limit: 500 }),
        enabled: enquiryModalOpen && (isAdmin || isOperatorUser),
    });

    const buyerOptions = useMemo(() => {
        const raw = buyersResponse;
        let rows: any[] = [];
        if (Array.isArray(raw?.data?.data?.data)) rows = raw.data.data.data;
        else if (Array.isArray(raw?.data?.data?.docs)) rows = raw.data.data.docs;
        else if (Array.isArray(raw?.data?.docs)) rows = raw.data.docs;
        else if (Array.isArray(raw?.data?.data)) rows = raw.data.data;
        else if (Array.isArray(raw?.data)) rows = raw.data;
        else if (Array.isArray(raw)) rows = raw;
        return rows.filter((item: any) => !item?.isDeleted);
    }, [buyersResponse]);

    const handleEnquirySubmit = async () => {
        if (!selectedEnquiryInventory) return;

        const qty = Number(enquiryQty);
        if (!qty || Number.isNaN(qty) || qty <= 0) {
            showToastMessage({
                type: "error",
                message: "Please enter a valid quantity in MT.",
                position: "top-right",
            });
            return;
        }

        const rawProductId =
            selectedEnquiryInventory.productId ||
            selectedEnquiryInventory.product?._id ||
            selectedEnquiryInventory.product;
        const productId = normalizeObjectId(rawProductId);

        const rawVariantId =
            selectedEnquiryInventory.productVariantId ||
            selectedEnquiryInventory.productVariant?._id ||
            selectedEnquiryInventory.productVariant;
        const productVariantId = normalizeObjectId(rawVariantId);

        const rawSellerId =
            selectedEnquiryInventory.associateCompanyId ||
            selectedEnquiryInventory.associateCompany?._id ||
            selectedEnquiryInventory.associateId ||
            selectedEnquiryInventory.associate?._id ||
            selectedEnquiryInventory.associate;
        const sellerAssociateId = normalizeObjectId(rawSellerId);

        const buyerAssociateId = (isAdmin || isOperatorUser)
            ? normalizeObjectId(enquiryBuyerAssociateId)
            : normalizeObjectId((user as any)?.associateId || user?.id);

        if (!productId) {
            showToastMessage({
                type: "error",
                message: "Product reference is missing for this inventory item.",
                position: "top-right",
            });
            return;
        }

        if (!sellerAssociateId) {
            showToastMessage({
                type: "error",
                message: "Seller company mapping is missing for this inventory item.",
                position: "top-right",
            });
            return;
        }

        if ((isAdmin || isOperatorUser) && !buyerAssociateId) {
            showToastMessage({
                type: "error",
                message: "Please select a buyer associate for this enquiry.",
                position: "top-right",
            });
            return;
        }

        setSubmittingEnquiry(true);
        try {
            const baseSpec = `Inventory Batch: ${selectedEnquiryInventory.productVariant || "Standard"} (${selectedEnquiryInventory.warehouseName || "Warehouse"})`;
            const finalSpec = enquiryNotes?.trim()
                ? `${baseSpec}\n\nNotes: ${enquiryNotes.trim()}`
                : baseSpec;

            const payload: Record<string, any> = {
                productId,
                productVariantId: productVariantId || null,
                quantity: qty,
                specifications: finalSpec,
                buyerAssociateId,
                sellerAssociateId,
                sourceInventory: selectedEnquiryInventory._id,
                preferredIncoterm: normalizeObjectId(enquiryIncotermId) || null,
                notes: `Enquiry from Inventory: ${selectedEnquiryInventory.product} - ${selectedEnquiryInventory.productVariant}`,
                ...(isOperatorUser && user?.id ? { assignedOperatorId: user.id } : {}),
                ...(enquiryContactName ? { name: enquiryContactName } : {}),
                ...(enquiryContactPhone ? { phoneNumber: enquiryContactPhone } : {}),
            };

            if (selectedEnquiryInventory.linkedVariantRateId) {
                payload.variantRateId = normalizeObjectId(selectedEnquiryInventory.linkedVariantRateId);
            }

            const endpoint = apiRoutesByRole["enquiry"] || apiRoutes.enquiry.getAll;
            const response: any = await postData(endpoint, payload);
            const createdId =
                response?.data?.data?._id ||
                response?.data?._id ||
                response?._id ||
                null;

            showToastMessage({
                type: "success",
                message: "Trade enquiry created successfully.",
                position: "top-right",
            });

            closeEnquiryModal();
            queryClient.invalidateQueries();

            if (createdId) {
                router.push(`/dashboard/enquiries/${createdId}`);
            }
        } catch (error: any) {
            console.error("Inventory enquiry creation failed:", error);
            showToastMessage({
                type: "error",
                message: error?.response?.data?.message || "Failed to create trade enquiry. Please try again.",
                position: "top-right",
            });
            setSubmittingEnquiry(false);
        }
    };

    useEffect(() => {
        patchData(apiRoutes.notifications.markSectionRead("inventory"), {})
            .finally(() => queryClient.invalidateQueries({ queryKey: ["notifications", "unread-summary"] }));
    }, [queryClient]);

    const { data: companyData } = useQuery({
        queryKey: ["inventory-assigned-companies", associateCompanyRoutes.getAll, user?.id, roleLower],
        queryFn: () => getData(associateCompanyRoutes.getAll, { limit: 300 }),
        enabled: isOperatorUser,
    });

    const operatorScopedCompanyIds: string[] = useMemo(
        () => (
            isOperatorUser
                ? ((companyData?.data?.data?.data || []) as Array<{ _id?: string }>)
                    .map((company) => company?._id)
                    .filter((id): id is string => Boolean(id))
                : []
        ),
        [companyData, isOperatorUser]
    );

    useEffect(() => {
        if (isOperatorUser && !selectedCompanyId && operatorScopedCompanyIds.length === 1) {
            setSelectedCompanyId(operatorScopedCompanyIds[0]);
        }
    }, [isOperatorUser, operatorScopedCompanyIds, selectedCompanyId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const columns = useMemo(() => getInventoryColumns(user?.role), [user?.role]);
    const formFields = inventoryTableFields;

    // Filter form fields based on role if necessary
    const filteredFormFields = isAssociate
        ? formFields.filter(f => f.key !== "associate" && f.key !== "associateCompany")
        : formFields;

    const additionalParams = isAssociate
        ? ((user as any)?.associateCompanyId
            ? { associateCompany: (user as any)?.associateCompanyId }
            : { associate: user?.id })
        : {};
    const effectiveCompanyId = isAssociate
        ? ((user as any)?.associateCompanyId || null)
        : selectedCompanyId;
    const shouldFetchInventory = !isAdmin || Boolean(effectiveCompanyId);

    const filtersKey = JSON.stringify(filters || {});

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, filtersKey, effectiveCompanyId, activeTab]);

    const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
        setFilters(updatedFilters);
    };

    const { data: suggestedRateData } = useQuery({
        queryKey: ["inventory-suggested-rates", effectiveCompanyId, user?.id],
        queryFn: () =>
            getData(variantRateRoutes.getAll, {
                limit: 300,
                ...(effectiveCompanyId && { associateCompany: effectiveCompanyId }),
                ...(isAssociate && { associate: user?.id }),
            }),
        enabled: shouldFetchInventory && (Boolean(effectiveCompanyId) || isAssociate),
    });

    const { data: warehouseData } = useQuery({
        queryKey: ["inventory-my-warehouses", effectiveCompanyId, user?.id],
        queryFn: () =>
            getData(warehouseRoutes.getAll, {
                limit: 500,
                scope: "my",
                ...(effectiveCompanyId && { associateCompany: effectiveCompanyId }),
            }),
        enabled: shouldFetchInventory && Boolean(effectiveCompanyId),
    });

    const { data: reservationData, isLoading: reservationLoading, isFetching: reservationFetching } = useQuery({
        queryKey: ["inventory-reservations", effectiveCompanyId, user?.id],
        queryFn: () =>
            getData(inventoryReservationRoutes.getAll, {
                limit: 500,
                ...(effectiveCompanyId && { associateCompany: effectiveCompanyId }),
                ...(isAssociate && { associateCompany: (user as any)?.associateCompanyId }),
            }),
        enabled: shouldFetchInventory && (Boolean(effectiveCompanyId) || isAssociate),
    });

    const openRateModal = (item: any, rate: any | null) => {
        const linkedRate = rate || item?.linkedVariantRate || null;
        setSelectedInventory(item);
        setSelectedRateId(linkedRate?._id || linkedRate || null);
        setRateValue(linkedRate?.rate ? String(linkedRate.rate) : "");
        setRateLive(linkedRate?.isLive !== false);
        setRateModalOpen(true);
    };

    const closeRateModal = () => {
        setRateModalOpen(false);
        setSelectedInventory(null);
        setSelectedRateId(null);
        setRateValue("");
        setRateLive(true);
        setSubmittingRate(false);
    };

    const openCostModal = (item: any) => {
        setCostInventory(item);
        setCustomDays("");
        setCostModalOpen(true);
    };

    const closeCostModal = () => {
        setCostModalOpen(false);
        setCostInventory(null);
        setCustomDays("");
    };

    const computeDaysStored = (storedAt?: string | Date | null) => {
        if (!storedAt) return null;
        const storedTime = new Date(storedAt).getTime();
        if (Number.isNaN(storedTime)) return null;
        const now = Date.now();
        const diffDays = Math.floor((now - storedTime) / (24 * 60 * 60 * 1000));
        return Math.max(1, diffDays);
    };

    return (
        <div className="w-full">
            {(isAdmin || isOperatorUser) && (
                <div className="mb-4">
                    <CompanySearch
                        defaultSelected={selectedCompanyId}
                        onSelect={(id) => setSelectedCompanyId(id)}
                        itemsFilter={
                            isOperatorUser
                                ? (companies) => companies.filter((c) => operatorScopedCompanyIds.includes(c._id))
                                : undefined
                        }
                    />
                </div>
            )}

            {!shouldFetchInventory && (
                <div className="mb-6 rounded-xl border border-obaol-300/30 bg-obaol-500/10 px-4 py-3 text-sm text-obaol-700 dark:text-obaol-300">
                    Select a company to view and manage inventory.
                </div>
            )}

            {shouldFetchInventory && (
                <QueryComponent
                    api={inventoryApiEndpoint}
                    queryKey={[
                        "inventories",
                        filters,
                        debouncedSearch,
                        additionalParams,
                        effectiveCompanyId,
                        page,
                    ]}
                    page={page}
                    limit={limit}
                    search={debouncedSearch}
                    additionalParams={{
                        ...(filters || {}),
                        ...(additionalParams || {}),
                        ...(effectiveCompanyId && { associateCompany: effectiveCompanyId }),
                    }}
                >
                    {(inventoryData: any, refetch, meta) => {
                        const rawData = inventoryData?.data ?? inventoryData ?? [];
                        const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);

                        const reservationRows = Array.isArray(reservationData?.data?.data?.data)
                            ? reservationData?.data?.data?.data
                            : (reservationData?.data?.data || []);

                        const reservedByInventoryId = new Map<string, number>();
                        const reservedByVariantKey = new Map<string, number>();
                        for (const reservation of reservationRows || []) {
                            const inventoryId = reservation.inventoryId?._id || reservation.inventoryId;
                            const pvId = reservation.productVariant?._id || reservation.productVariant;
                            const compId = reservation.associateCompany?._id || reservation.associateCompany || "";
                            const qty = Number(reservation.quantity || 0);
                            if (inventoryId) {
                                reservedByInventoryId.set(
                                    String(inventoryId),
                                    (reservedByInventoryId.get(String(inventoryId)) || 0) + qty
                                );
                            }
                            if (pvId) {
                                const key = `${pvId}::${compId}`;
                                reservedByVariantKey.set(key, (reservedByVariantKey.get(key) || 0) + qty);
                            }
                        }

                        const tableData = items.map((item: any) => {
                            const inventoryId = String(item._id || item.id || "");
                            const reservedQty = reservedByInventoryId.get(inventoryId) || 0;
                            const totalQty = Number(item.quantity || 0);
                            const availableQty = Math.max(0, totalQty - reservedQty);
                            return ({
                                ...item,
                                product: item.product?.name || "N/A",
                                productVariant: item.productVariant?.name || "N/A",
                                associate: item.associateCompany?.name || item.associate?.name || "OBAOL",
                                associateId: item.associate?._id || item.associate,
                                associateCompanyId: item.associateCompany?._id || item.associateCompany,
                                productVariantId: item.productVariant?._id || item.productVariant,
                                productId: item.product?._id || item.product,
                                stateId: item.state?._id || item.state,
                                districtId: item.district?._id || item.district,
                                divisionId: item.division?._id || item.division,
                                pincodeEntryId: item.pincodeEntry?._id || item.pincodeEntry,
                                linkedVariantRateId: item.linkedVariantRate?._id || item.linkedVariantRate,
                                reservedQty,
                                availableQty,
                            });
                        });

                        const warehouseRows = Array.isArray(warehouseData?.data?.data?.data)
                            ? warehouseData?.data?.data?.data
                            : (warehouseData?.data?.data || []);
                        const warehouseMap = new Map<string, any>();
                        for (const wh of warehouseRows || []) {
                            const whId = wh?._id || wh?.id;
                            if (whId) warehouseMap.set(String(whId), wh);
                        }

                        const summaryMap = new Map<string, { key: string; name: string; company: string; totalQty: number; warehouses: Set<string>; reservedQty: number }>();
                        for (const row of tableData) {
                            const key = `${row.productVariantId}::${row.associateCompanyId || ""}`;
                            if (!summaryMap.has(key)) {
                                summaryMap.set(key, {
                                    key,
                                    name: row.productVariant,
                                    company: row.associate,
                                    totalQty: 0,
                                    warehouses: new Set<string>(),
                                    reservedQty: reservedByVariantKey.get(key) || 0,
                                });
                            }
                            const summary = summaryMap.get(key)!;
                            summary.totalQty += Number(row.quantity || 0);
                            if (row.warehouseName) summary.warehouses.add(String(row.warehouseName));
                        }

                        const summaryRows = Array.from(summaryMap.values());

                        const inventoryKeySet = new Set(
                            tableData.map((row: any) => `${row.productVariantId}::${row.associateCompanyId || ""}`)
                        );

                        const rateRows = Array.isArray(suggestedRateData?.data?.data?.data)
                            ? suggestedRateData?.data?.data?.data
                            : (suggestedRateData?.data?.data || []);

                        const rateMap = new Map<string, any>();
                        const rateById = new Map<string, any>();
                        for (const rate of rateRows || []) {
                            const pvId = rate.productVariant?._id || rate.productVariant;
                            const compId = rate.associateCompany?._id || rate.associateCompany || "";
                            const rateId = rate._id || rate.id;
                            if (rateId) rateById.set(String(rateId), rate);
                            if (pvId) rateMap.set(`${pvId}::${compId}`, rate);
                        }

                        const suggestedRates = (rateRows || []).filter((rate: any) => {
                            const pvId = rate.productVariant?._id || rate.productVariant;
                            const compId = rate.associateCompany?._id || rate.associateCompany;
                            if (!pvId) return false;
                            if (effectiveCompanyId && String(compId) !== String(effectiveCompanyId)) return false;
                            return !inventoryKeySet.has(`${pvId}::${compId || ""}`);
                        });

                        const openStockModal = (rate: any) => {
                            setSelectedRate(rate);
                            setStockQty("");
                            setStockModalOpen(true);
                        };

                        const closeStockModal = () => {
                            setSelectedRate(null);
                            setStockQty("");
                            setStockModalOpen(false);
                            setSubmittingStock(false);
                        };

                        const handleStockSubmit = async () => {
                            if (!selectedRate) return;
                            const qty = Number(stockQty);
                            if (!qty || Number.isNaN(qty) || qty <= 0) {
                                showToastMessage({
                                    type: "error",
                                    message: "Enter a valid quantity in MT.",
                                    position: "top-right",
                                });
                                return;
                            }

                            setSubmittingStock(true);
                            try {
                                const pvId = selectedRate.productVariant?._id || selectedRate.productVariant;
                                const productId = selectedRate.productVariant?.product?._id || selectedRate.productVariant?.product;
                                const associateCompanyId = selectedRate.associateCompany?._id || selectedRate.associateCompany || effectiveCompanyId;
                                let associateId = selectedRate.associate?._id || selectedRate.associate;

                                if (!associateId && associateCompanyId) {
                                    const assocResponse = await getData(associateRoutes.getAll, {
                                        associateCompany: associateCompanyId,
                                        limit: 1,
                                    });
                                    const assocRows = Array.isArray(assocResponse?.data?.data?.data)
                                        ? assocResponse?.data?.data?.data
                                        : (assocResponse?.data?.data || []);
                                    associateId = assocRows?.[0]?._id || assocRows?.[0]?.id;
                                }

                                if (!associateId) {
                                    showToastMessage({
                                        type: "error",
                                        message: "No associate found for this company.",
                                        position: "top-right",
                                    });
                                    setSubmittingStock(false);
                                    return;
                                }

                                await postData(inventoryRoutes.getAll, {
                                    productVariant: pvId,
                                    product: productId,
                                    associateCompany: associateCompanyId,
                                    associate: associateId,
                                    state: selectedRate.state?._id || selectedRate.state,
                                    district: selectedRate.district?._id || selectedRate.district,
                                    division: selectedRate.division?._id || selectedRate.division,
                                    pincodeEntry: selectedRate.pincodeEntry?._id || selectedRate.pincodeEntry,
                                    quantity: qty,
                                    unit: "MT",
                                });
                                showToastMessage({
                                    type: "success",
                                    message: "Inventory added successfully.",
                                    position: "top-right",
                                });
                                closeStockModal();
                                refetch?.();
                            } catch (error: any) {
                                console.error("Inventory add failed:", error?.response?.data || error);
                                showToastMessage({
                                    type: "error",
                                    message: error?.response?.data?.message || "Unable to add inventory. Please try again.",
                                    position: "top-right",
                                });
                                setSubmittingStock(false);
                            }
                        };

                        const handleRateSubmit = async () => {
                            if (!selectedInventory) return;
                            const rateNumber = Number(rateValue);
                            if (!rateNumber || Number.isNaN(rateNumber) || rateNumber <= 0) {
                                showToastMessage({
                                    type: "error",
                                    message: "Please enter a valid rate.",
                                    position: "top-right",
                                });
                                return;
                            }

                            setSubmittingRate(true);
                            try {
                                const linkedRateId =
                                    selectedRateId ||
                                    selectedInventory?.linkedVariantRate?._id ||
                                    selectedInventory?.linkedVariantRateId ||
                                    selectedInventory?.linkedVariantRate;

                                if (linkedRateId) {
                                    await patchData(`${variantRateRoutes.getAll}/${linkedRateId}`, {
                                        rate: rateNumber,
                                        isLive: rateLive,
                                    });
                                    showToastMessage({
                                        type: "success",
                                        message: "Rate updated successfully.",
                                        position: "top-right",
                                    });
                                } else {
                                    const createPayload: Record<string, any> = {
                                        rate: rateNumber,
                                        isLive: rateLive,
                                        sourceInventory: selectedInventory._id,
                                        productVariant: selectedInventory.productVariantId,
                                        quantity: selectedInventory.quantity,
                                        unit: "MT",
                                        state: selectedInventory.stateId,
                                        district: selectedInventory.districtId,
                                        division: selectedInventory.divisionId,
                                        pincodeEntry: selectedInventory.pincodeEntryId,
                                        associate: selectedInventory.associateId,
                                    };
                                    if (selectedInventory.associateCompanyId) {
                                        createPayload.associateCompany = selectedInventory.associateCompanyId;
                                    }

                                    await postData(variantRateRoutes.getAll, createPayload);
                                    showToastMessage({
                                        type: "success",
                                        message: "Rate published successfully.",
                                        position: "top-right",
                                    });
                                }
                                closeRateModal();
                                refetch?.();
                                await queryClient.invalidateQueries({
                                    queryKey: ["inventory-suggested-rates", effectiveCompanyId, user?.id],
                                });
                            } catch (error: any) {
                                showToastMessage({
                                    type: "error",
                                    message: error?.response?.data?.message || "Unable to save rate. Please try again.",
                                    position: "top-right",
                                });
                                setSubmittingRate(false);
                            }
                        };

                        const handleUnpublish = async (rateId?: string | null) => {
                            const linkedRateId = rateId || null;
                            if (!linkedRateId) return;
                            try {
                                await patchData(`${variantRateRoutes.getAll}/${linkedRateId}`, { isLive: false });
                                showToastMessage({
                                    type: "success",
                                    message: "Trade listing unpublished.",
                                    position: "top-right",
                                });
                                refetch?.();
                                await queryClient.invalidateQueries({
                                    queryKey: ["inventory-suggested-rates", effectiveCompanyId, user?.id],
                                });
                            } catch (error: any) {
                                showToastMessage({
                                    type: "error",
                                    message: error?.response?.data?.message || "Unable to unpublish rate.",
                                    position: "top-right",
                                });
                            }
                        };

                        return (
                            <div className="w-full">
                                {canUseDemo && (
                                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-default-200/40 bg-content1 px-4 py-3">
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">Admin Demo Preview</div>
                                            <div className="text-xs text-default-500">
                                                Create demo inventory rows for quick testing.
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-secondary text-white"
                                                isLoading={demoLoading}
                                                onPress={async () => {
                                                    const companyId = effectiveCompanyId;
                                                    if (!companyId) {
                                                        showToastMessage({
                                                            type: "warning",
                                                            message: "Select a company before loading demo inventory.",
                                                            position: "top-right",
                                                        });
                                                        return;
                                                    }
                                                    setDemoLoading(true);
                                                    try {
                                                        await postData(apiRoutes.demo.inventory, {
                                                            associateCompanyId: companyId,
                                                        });
                                                        showToastMessage({
                                                            type: "success",
                                                            message: "Demo inventory loaded.",
                                                            position: "top-right",
                                                        });
                                                        refetch?.();
                                                    } catch (error: any) {
                                                        showToastMessage({
                                                            type: "error",
                                                            message: error?.response?.data?.message || "Unable to load demo inventory.",
                                                            position: "top-right",
                                                        });
                                                    } finally {
                                                        setDemoLoading(false);
                                                    }
                                                }}
                                            >
                                                Load Demo Inventory
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="bordered"
                                                className="border-default-300 text-default-500"
                                                isLoading={demoClearing}
                                                onPress={async () => {
                                                    setDemoClearing(true);
                                                    try {
                                                        await deleteData(apiRoutes.demo.inventory);
                                                        showToastMessage({
                                                            type: "success",
                                                            message: "Demo inventory cleared.",
                                                            position: "top-right",
                                                        });
                                                        refetch?.();
                                                    } catch (error: any) {
                                                        showToastMessage({
                                                            type: "error",
                                                            message: error?.response?.data?.message || "Unable to clear demo inventory.",
                                                            position: "top-right",
                                                        });
                                                    } finally {
                                                        setDemoClearing(false);
                                                    }
                                                }}
                                            >
                                                Clear Demo Inventory
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(String(key))} aria-label="Inventory tabs">
                                    <Tab key="inventory" title="Inventory">
                                        {suggestedRates.length > 0 && (
                                            <div className="mb-6 rounded-xl border border-obaol-300/30 bg-obaol-500/10 px-4 py-4">
                                                <div className="mb-2 text-sm font-semibold text-obaol-700 dark:text-obaol-300">
                                                    Suggested From Rates
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {suggestedRates.map((rate: any) => (
                                                        <div key={rate._id} className="flex flex-wrap items-center gap-3 rounded-lg bg-background/60 px-3 py-2">
                                                            <div className="flex-1 min-w-[200px]">
                                                                <div className="text-sm font-semibold text-foreground">
                                                                    {rate.productVariant?.name || "Variant"}
                                                                </div>
                                                                <div className="text-xs text-default-500">
                                                                    {rate.productVariant?.product?.name || "Product"} · {rate.associateCompany?.name || "Company"}
                                                                </div>
                                                            </div>
                                                            <div className="text-sm font-semibold text-foreground">
                                                                {rate.rate ? `${rate.rate} / KG` : "Rate: N/A"}
                                                            </div>
                                                            <Button size="sm" color="warning" variant="flat" onPress={() => openStockModal(rate)}>
                                                                Add Stock
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {summaryRows.length > 0 && (
                                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                {summaryRows.map((summary) => (
                                                    <div key={summary.key} className="rounded-xl border border-default-200/30 bg-content1 px-4 py-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="font-semibold">{summary.name}</div>
                                                            <Chip size="sm" variant="flat" color="primary">
                                                                {summary.company}
                                                            </Chip>
                                                        </div>
                                                        <div className="mt-2 text-sm text-default-500">
                                                            Total: <span className="font-semibold text-foreground">{summary.totalQty} MT</span> • Warehouses: <span className="font-semibold text-foreground">{summary.warehouses.size || 0}</span>
                                                        </div>
                                                        <div className="mt-1 text-xs text-default-400">
                                                            Reserved: {summary.reservedQty || 0} MT
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center gap-3 mb-6">
                                            <DynamicFilter
                                                currentTable={"inventories"}
                                                formFields={filteredFormFields}
                                                onApply={handleFiltersUpdate}
                                                searchValue={search}
                                                onSearchChange={setSearch}
                                                searchPlaceholder="Search inventory..."
                                            />
                                            <AddModal
                                                buttonLabel="Add Stock"
                                                currentTable="inventories"
                                                formFields={filteredFormFields}
                                                apiEndpoint={inventoryApiEndpoint}
                                                refetchData={refetch}
                                                additionalVariable={{
                                                    ...(isAssociate && { associate: user?.id }),
                                                    ...(effectiveCompanyId && { associateCompany: effectiveCompanyId }),
                                                }}
                                            />
                                        </div>

                                        <TableFrame>
                                            <CommonTable
                                                TableData={tableData}
                                                columns={columns}
                                                isLoading={false}
                                                page={meta?.currentPage || page}
                                                totalPages={meta?.totalPages || 1}
                                                rowsPerPage={limit}
                                                onPageChange={(nextPage) => setPage(nextPage)}
                                                getRowClassName={(item: any) => {
                                                    const pvId = item.productVariantId;
                                                    const compId = item.associateCompanyId || "";
                                                    const matchedRate = rateMap.get(`${pvId}::${compId}`);
                                                    const hasRate = Boolean(
                                                        item.linkedVariantRateId ||
                                                        item.linkedVariantRate ||
                                                        matchedRate?._id
                                                    );
                                                    return hasRate
                                                        ? ""
                                                        : "!border-warning-300/60 !bg-warning-50/70 dark:!border-warning-500/30 dark:!bg-warning-500/[0.08] [&>td]:!bg-warning-50/70 dark:[&>td]:!bg-warning-500/[0.08]";
                                                }}
                                                emptyContent={(
                                                    (() => {
                                                        const isFiltered = Boolean(debouncedSearch || (filtersKey && filtersKey !== "{}"));
                                                        if (isFiltered) {
                                                            return (
                                                                <div className="flex flex-col items-center justify-center rounded-3xl border border-default-200/50 bg-content1/60 py-12 px-6 text-center shadow-sm">
                                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-default-200 bg-background/80 text-default-400">
                                                                        <LuSearch size={28} />
                                                                    </div>
                                                                    <h4 className="text-lg font-bold text-foreground">No Matching Inventory Found</h4>
                                                                    <p className="mt-1 text-sm text-default-500 max-w-md leading-relaxed">
                                                                        No stock records match your search or active filters. Try clearing your search or resetting filters.
                                                                    </p>
                                                                    <Button
                                                                        size="sm"
                                                                        color="warning"
                                                                        variant="flat"
                                                                        className="mt-5 font-bold rounded-xl px-5"
                                                                        startContent={<LuX size={16} />}
                                                                        onPress={() => {
                                                                            setSearch("");
                                                                            handleFiltersUpdate({});
                                                                        }}
                                                                    >
                                                                        Clear Search & Filters
                                                                    </Button>
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div className="relative overflow-hidden rounded-3xl border border-default-200/60 bg-content1/90 p-6 sm:p-10 md:p-12 shadow-md backdrop-blur-xl">
                                                                <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-obaol-500/10 blur-3xl pointer-events-none" />
                                                                <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                                                                <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
                                                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-obaol-500/30 bg-obaol-500/10 text-obaol-500 shadow-inner">
                                                                        <LuBoxes size={34} />
                                                                    </div>

                                                                    <div className="inline-flex items-center gap-2 rounded-full border border-obaol-500/30 bg-obaol-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-obaol-700 dark:text-obaol-300 mb-3">
                                                                        <span className="h-2 w-2 rounded-full bg-obaol-500 animate-pulse" />
                                                                        Physical Stock Management
                                                                    </div>

                                                                    <h3 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
                                                                        Start Tracking Your Physical Inventory
                                                                    </h3>

                                                                    <p className="mt-3 text-sm md:text-base text-default-500 leading-relaxed max-w-2xl font-medium">
                                                                        Inventory tracking connects your physical warehouse stock with live trade listings, buyer enquiries, and trade execution contracts across the OBAOL network.
                                                                    </p>

                                                                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left w-full">
                                                                        <div className="group rounded-2xl border border-default-200/60 bg-background/60 p-4 transition-all duration-200 hover:border-obaol-500/40 hover:shadow-md">
                                                                            <div className="flex items-center gap-2 text-obaol-600 dark:text-obaol-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                                                                                <LuPackageCheck size={16} className="shrink-0" /> Stock Visibility
                                                                            </div>
                                                                            <p className="text-xs text-default-500 leading-relaxed font-normal">
                                                                                Log batch quantities (in Metric Tons), harvest lot details, and storage conditions across licensed warehouses.
                                                                            </p>
                                                                        </div>

                                                                        <div className="group rounded-2xl border border-default-200/60 bg-background/60 p-4 transition-all duration-200 hover:border-obaol-500/40 hover:shadow-md">
                                                                            <div className="flex items-center gap-2 text-obaol-600 dark:text-obaol-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                                                                                <LuTags size={16} className="shrink-0" /> Trade Integration
                                                                            </div>
                                                                            <p className="text-xs text-default-500 leading-relaxed font-normal">
                                                                                Link physical stock directly to Trade Listings so verified buyers view real-time supply availability.
                                                                            </p>
                                                                        </div>

                                                                        <div className="group rounded-2xl border border-default-200/60 bg-background/60 p-4 transition-all duration-200 hover:border-obaol-500/40 hover:shadow-md">
                                                                            <div className="flex items-center gap-2 text-obaol-600 dark:text-obaol-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                                                                                <LuWarehouse size={16} className="shrink-0" /> Order Allocation
                                                                            </div>
                                                                            <p className="text-xs text-default-500 leading-relaxed font-normal">
                                                                                Reserve and allocate stored stock seamlessly when trade enquiries move into active contract execution.
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 w-full sm:w-auto">
                                                                        <AddModal
                                                                            buttonLabel="Record New Stock"
                                                                            currentTable="inventories"
                                                                            formFields={filteredFormFields}
                                                                            apiEndpoint={inventoryApiEndpoint}
                                                                            refetchData={refetch}
                                                                            additionalVariable={{
                                                                                ...(isAssociate && { associate: user?.id }),
                                                                                ...(effectiveCompanyId && { associateCompany: effectiveCompanyId }),
                                                                            }}
                                                                        />
                                                                        <Button
                                                                            as={Link}
                                                                            href="/dashboard/warehouses"
                                                                            variant="bordered"
                                                                            className="font-bold tracking-tight h-9 rounded-xl border-default-300 hover:border-obaol-500 px-4 text-xs sm:text-sm"
                                                                            startContent={<LuWarehouse size={16} />}
                                                                        >
                                                                            Explore Warehouses
                                                                        </Button>
                                                                        <Button
                                                                            as={Link}
                                                                            href="/dashboard/catalog"
                                                                            variant="flat"
                                                                            color="default"
                                                                            className="font-bold tracking-tight h-9 rounded-xl px-4 text-xs sm:text-sm"
                                                                        >
                                                                            Commodity Directory
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()
                                                )}
                                                editModal={(item: any) => (
                                                    <EditModal
                                                        _id={item._id}
                                                        initialData={item}
                                                        currentTable="inventories"
                                                        formFields={filteredFormFields}
                                                        apiEndpoint={inventoryApiEndpoint}
                                                        refetchData={refetch}
                                                    />
                                                )}
                                                deleteModal={(item: any) => (
                                                    <DeleteModal
                                                        _id={item._id}
                                                        name={`${item.productVariant}`}
                                                        deleteApiEndpoint={inventoryApiEndpoint}
                                                        refetchData={refetch}
                                                    />
                                                )}
                                                otherModal={(item: any) => {
                                                    const pvId = item.productVariantId;
                                                    const compId = item.associateCompanyId || "";
                                                    const matchedRate = rateMap.get(`${pvId}::${compId}`) || null;
                                                    const linkedRateId = item?.linkedVariantRateId || item?.linkedVariantRate || null;
                                                    const linkedRate =
                                                        matchedRate ||
                                                        (linkedRateId ? rateById.get(String(linkedRateId)) : null);
                                                    const isPublished = Boolean(linkedRateId || linkedRate?._id);
                                                    const isLive = linkedRate ? linkedRate?.isLive !== false : false;
                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            {/* Status Chip with live pulse */}
                                                            <Chip
                                                                size="sm"
                                                                variant={isPublished ? "flat" : "solid"}
                                                                color={isPublished ? (isLive ? "success" : "warning") : "default"}
                                                                startContent={
                                                                    isPublished && isLive ? (
                                                                        <span className="relative flex h-1.5 w-1.5 ml-0.5">
                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-500 opacity-75" />
                                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success-500" />
                                                                        </span>
                                                                    ) : null
                                                                }
                                                                className={!isPublished
                                                                    ? "!bg-warning-500 !text-warning-950 font-black shadow-sm ring-1 ring-warning-600/30"
                                                                    : undefined}
                                                            >
                                                                {isPublished ? (isLive ? "Live" : "Paused") : "Rate missing"}
                                                            </Chip>

                                                            {!isPublished ? (
                                                                <Tooltip content="Publish Trade Listing" placement="top" size="sm">
                                                                    <Button
                                                                        size="sm"
                                                                        color="warning"
                                                                        variant="flat"
                                                                        onPress={() => openRateModal(item, null)}
                                                                        startContent={<FiSend size={11} />}
                                                                        className="font-semibold h-7 px-2.5 text-xs"
                                                                    >
                                                                        Publish
                                                                    </Button>
                                                                </Tooltip>
                                                            ) : (
                                                                <div className="flex items-center gap-1">
                                                                    <Tooltip content="Edit rate" placement="top" size="sm">
                                                                        <Button
                                                                            isIconOnly
                                                                            size="sm"
                                                                            color="warning"
                                                                            variant="flat"
                                                                            onPress={() => openRateModal(item, linkedRate)}
                                                                            className="h-7 w-7 min-w-0"
                                                                        >
                                                                            <FiEdit2 size={12} />
                                                                        </Button>
                                                                    </Tooltip>
                                                                    <Tooltip
                                                                        content={isLive ? "Unpublish trade listing" : "Already paused"}
                                                                        placement="top"
                                                                        size="sm"
                                                                    >
                                                                        <Button
                                                                            isIconOnly
                                                                            size="sm"
                                                                            variant="flat"
                                                                            color={isLive ? "default" : "warning"}
                                                                            onPress={() => { if (isLive) handleUnpublish(linkedRateId); }}
                                                                            isDisabled={!isLive}
                                                                            className="h-7 w-7 min-w-0 opacity-70 hover:opacity-100"
                                                                        >
                                                                            <FiEyeOff size={12} />
                                                                        </Button>
                                                                    </Tooltip>
                                                                </div>
                                                            )}

                                                            <Tooltip content="Fill Trade Enquiry" placement="top" size="sm">
                                                                <Button
                                                                    size="sm"
                                                                    color="primary"
                                                                    variant="flat"
                                                                    onPress={() => openEnquiryModal(item)}
                                                                    startContent={<LuMessageSquare size={13} />}
                                                                    className="font-semibold h-7 px-2.5 text-xs"
                                                                >
                                                                    Enquiry
                                                                </Button>
                                                            </Tooltip>

                                                            <Tooltip content="Storage cost" placement="top" size="sm">
                                                                <Button
                                                                    size="sm"
                                                                    variant="flat"
                                                                    color="default"
                                                                    className="h-7 px-2.5 text-xs font-semibold"
                                                                    onPress={() => openCostModal(item)}
                                                                >
                                                                    Storage Cost
                                                                </Button>
                                                            </Tooltip>
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </TableFrame>
                                    </Tab>
                                    <Tab key="ordered" title="Ordered Inventory">
                                        <div className="rounded-xl border border-default-200/30 bg-content1 px-4 py-4">
                                            {(reservationLoading || reservationFetching) && !reservationData ? (
                                                <SectionSkeleton rows={3} className="py-2" />
                                            ) : reservationRows.length === 0 ? (
                                                <div className="text-sm text-default-500">No reserved inventory found.</div>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    {reservationRows.map((reservation: any) => {
                                                        const inventory = reservation.inventoryId || {};
                                                        const variant = reservation.productVariant || {};
                                                        return (
                                                            <div key={reservation._id} className="rounded-lg border border-default-200/20 bg-background/50 px-4 py-3">
                                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                                    <div className="font-semibold">
                                                                        {variant?.name || "Variant"} • {inventory?.warehouseName || "Warehouse"}
                                                                    </div>
                                                                    <Chip size="sm" variant="flat" color={reservation.status === "RESERVED" ? "warning" : reservation.status === "CONSUMED" ? "success" : "default"}>
                                                                        {reservation.status}
                                                                    </Chip>
                                                                </div>
                                                                <div className="mt-2 text-sm text-default-500">
                                                                    Reserved: <span className="font-semibold text-foreground">{reservation.quantity} MT</span>
                                                                </div>
                                                                {reservation.enquiryId && (
                                                                    <div className="mt-1 text-xs text-default-400">
                                                                        Enquiry: {String(reservation.enquiryId?._id || reservation.enquiryId).slice(-6).toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </Tab>
                                </Tabs>

                                <Modal
                                    isOpen={stockModalOpen}
                                    onOpenChange={(open) => {
                                        if (!open) closeStockModal();
                                    }}
                                    isDismissable={!submittingStock}
                                    size="lg"
                                >
                                    <ModalContent className="bg-gradient-to-br from-background to-content1 border border-divider">
                                        <ModalHeader className="flex flex-col gap-1 border-b border-divider pb-4 px-6">
                                            <div className="flex items-center gap-4 pt-2">
                                                <div className="p-2.5 bg-warning/10 rounded-xl text-obaol-500 shadow-sm shadow-warning/10">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black tracking-tight text-foreground">Add Stock</h3>
                                                    <p className="text-xs text-default-400 font-bold uppercase tracking-widest mt-0.5">Update inventory quantity (MT)</p>
                                                </div>
                                            </div>
                                        </ModalHeader>
                                        <ModalBody className="py-5 px-6 flex flex-col gap-4">
                                            {/* Context card */}
                                            {selectedInventory && (
                                                <div className="p-3 bg-default-100/50 rounded-xl border border-divider/30 flex justify-between items-center gap-3">
                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <span className="text-[10px] font-black text-default-400 uppercase tracking-widest">Product</span>
                                                        <span className="text-sm font-bold text-foreground truncate">
                                                            {selectedInventory?.product || selectedInventory?.productName || "—"}
                                                        </span>
                                                    </div>
                                                    {(selectedInventory?.productVariant || selectedInventory?.variantName) && (
                                                        <div className="px-3 py-1.5 bg-warning/10 text-obaol-600 rounded-xl text-xs font-black border border-warning/20 shadow-inner shrink-0">
                                                            {selectedInventory?.productVariant || selectedInventory?.variantName}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {/* Quantity input — labelPlacement outside prevents overlap */}
                                            <Input
                                                label="Quantity (MT)"
                                                labelPlacement="outside"
                                                type="number"
                                                value={stockQty}
                                                onChange={(e) => setStockQty(e.target.value)}
                                                placeholder="e.g. 10"
                                                isDisabled={submittingStock}
                                                variant="bordered"
                                                startContent={
                                                    <span className="text-default-400 text-sm font-semibold pointer-events-none">MT</span>
                                                }
                                                description="Enter the quantity to add in Metric Tonnes."
                                                classNames={{
                                                    label: "text-xs font-bold text-default-500 uppercase tracking-wider",
                                                }}
                                            />
                                            {/* Info note */}
                                            <div className="flex items-start gap-2 text-xs text-default-400 bg-default-100/40 px-3 py-2.5 rounded-xl border border-divider/20">
                                                <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-obaol-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                This will increase the available stock for this inventory item.
                                            </div>
                                        </ModalBody>
                                        <ModalFooter className="border-t border-divider px-6 py-4 gap-3">
                                            <Button
                                                variant="flat"
                                                color="default"
                                                onPress={closeStockModal}
                                                isDisabled={submittingStock}
                                                className="font-semibold"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                color="warning"
                                                onPress={handleStockSubmit}
                                                isLoading={submittingStock}
                                                className="font-bold"
                                                startContent={!submittingStock ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                ) : undefined}
                                            >
                                                Add Stock
                                            </Button>
                                        </ModalFooter>
                                    </ModalContent>

                                </Modal>

                                <Modal
                                    isOpen={costModalOpen}
                                    onOpenChange={(open) => {
                                        if (!open) closeCostModal();
                                    }}
                                    size="lg"
                                >
                                    <ModalContent className="bg-gradient-to-br from-background to-content1 border border-divider">
                                        <ModalHeader className="flex flex-col gap-1 border-b border-divider pb-4 px-6">
                                            <div className="text-lg font-black tracking-tight text-foreground">Storage Cost</div>
                                            <div className="text-xs text-default-500">
                                                Daily and projected storage costs based on warehouse rate.
                                            </div>
                                        </ModalHeader>
                                        <ModalBody className="py-5 px-6">
                                            {(() => {
                                                if (!costInventory) {
                                                    return (
                                                        <div className="text-sm text-default-500">Select an inventory item.</div>
                                                    );
                                                }
                                                const storedAt = costInventory?.storedAt;
                                                const warehouseId = costInventory?.warehouseId?._id || costInventory?.warehouseId;
                                                const warehouseName = costInventory?.warehouseName;
                                                const warehouse = warehouseId ? warehouseMap.get(String(warehouseId)) : null;
                                                const ratePerUnit = warehouse?.storageRatePerUnit;
                                                const rateUnit = warehouse?.unit || "KG";
                                                const daysStored = computeDaysStored(storedAt);
                                                const quantity = Number(costInventory?.quantity || 0);
                                                const dailyCost =
                                                    ratePerUnit && quantity ? Number(ratePerUnit) * quantity : null;
                                                const currentCost =
                                                    dailyCost && daysStored ? dailyCost * daysStored : null;

                                                if (!warehouseId || warehouseName === "Private Location" || !warehouseName) {
                                                    return (
                                                        <div className="rounded-xl border border-default-200/30 bg-content1 px-4 py-3 text-sm text-default-500">
                                                            No storage cost (not in warehouse).
                                                        </div>
                                                    );
                                                }

                                                if (!ratePerUnit) {
                                                    return (
                                                        <div className="rounded-xl border border-obaol-300/30 bg-obaol-500/10 px-4 py-3 text-sm text-obaol-700 dark:text-obaol-300">
                                                            Rate not configured for this warehouse.
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div className="flex flex-col gap-4">
                                                        <div className="rounded-xl border border-default-200/30 bg-content1 px-4 py-3">
                                                            <div className="text-sm font-semibold text-foreground">
                                                                {warehouseName}
                                                            </div>
                                                            <div className="text-xs text-default-500">
                                                                Rate: {ratePerUnit} / {rateUnit}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            <div className="rounded-xl border border-default-200/30 bg-content1 px-4 py-3">
                                                                <div className="text-xs text-default-500">Daily Cost</div>
                                                                <div className="text-lg font-semibold text-foreground">
                                                                    {dailyCost?.toFixed(2)}
                                                                </div>
                                                            </div>
                                                            <div className="rounded-xl border border-default-200/30 bg-content1 px-4 py-3">
                                                                <div className="text-xs text-default-500">Days Stored</div>
                                                                <div className="text-lg font-semibold text-foreground">
                                                                    {daysStored ?? "—"}
                                                                </div>
                                                            </div>
                                                            <div className="rounded-xl border border-default-200/30 bg-content1 px-4 py-3">
                                                                <div className="text-xs text-default-500">Current Total</div>
                                                                <div className="text-lg font-semibold text-foreground">
                                                                    {currentCost?.toFixed(2)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="rounded-xl border border-default-200/30 bg-content1 px-4 py-3">
                                                            <div className="text-sm font-semibold text-foreground">Projections</div>
                                                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                {[7, 30, 90].map((days) => (
                                                                    <div key={days} className="rounded-lg border border-default-200/30 bg-background/60 px-3 py-2">
                                                                        <div className="text-xs text-default-500">{days} Days</div>
                                                                        <div className="text-sm font-semibold text-foreground">
                                                                            {(dailyCost * days).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="mt-3 flex items-center gap-3">
                                                                <Input
                                                                    label="Custom days"
                                                                    type="number"
                                                                    value={customDays}
                                                                    onChange={(e) => setCustomDays(e.target.value)}
                                                                    placeholder="e.g. 45"
                                                                    labelPlacement="outside"
                                                                    className="max-w-[180px]"
                                                                />
                                                                <div className="text-sm text-default-500">
                                                                    {Number(customDays) > 0
                                                                        ? `Projected total: ${(dailyCost * Number(customDays)).toFixed(2)}`
                                                                        : "Enter days to project."}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </ModalBody>
                                        <ModalFooter className="px-6 py-4">
                                            <Button variant="flat" color="default" onPress={closeCostModal}>
                                                Close
                                            </Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>

                                <Modal
                                    isOpen={rateModalOpen}
                                    onOpenChange={(open) => {
                                        if (!open) closeRateModal();
                                    }}
                                    isDismissable={!submittingRate}
                                    size="lg"
                                >
                                    <ModalContent>
                                        <ModalHeader className="flex flex-col gap-1">
                                            {selectedInventory?.linkedVariantRate ? "Update Published Rate" : "Publish Rate from Inventory"}
                                        </ModalHeader>
                                        <ModalBody>
                                            <div className="flex flex-col gap-3">
                                                <Input
                                                    label="Rate (per KG)"
                                                    type="number"
                                                    value={rateValue}
                                                    onChange={(e) => setRateValue(e.target.value)}
                                                    placeholder="Enter rate"
                                                    isDisabled={submittingRate}
                                                />
                                                <div className="text-xs text-default-500">
                                                    Rate is per KG. Inventory quantity is in MT.
                                                </div>
                                                <div className="text-xs text-default-500">
                                                    Quantity and location will stay synced with inventory.
                                                </div>
                                                <Switch isSelected={rateLive} onValueChange={setRateLive}>
                                                    Publish trade listing
                                                </Switch>
                                            </div>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button variant="light" onPress={closeRateModal} isDisabled={submittingRate}>
                                                Cancel
                                            </Button>
                                            <Button color="warning" onPress={handleRateSubmit} isLoading={submittingRate}>
                                                {selectedInventory?.linkedVariantRate ? "Update Rate" : "Publish Rate"}
                                            </Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>

                                <Modal
                                    isOpen={enquiryModalOpen}
                                    onOpenChange={(open) => {
                                        if (!open) closeEnquiryModal();
                                    }}
                                    isDismissable={!submittingEnquiry}
                                    size="lg"
                                >
                                    <ModalContent className="bg-gradient-to-br from-background to-content1 border border-divider">
                                        <ModalHeader className="flex flex-col gap-1 border-b border-divider pb-4 px-6">
                                            <div className="flex items-center gap-3 pt-2">
                                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary-500 shadow-sm shadow-primary/10">
                                                    <FiMessageSquare size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black tracking-tight text-foreground">
                                                        New Trade Enquiry
                                                    </h3>
                                                    <p className="text-xs text-default-400 font-bold uppercase tracking-widest mt-0.5">
                                                        Direct Inventory Protocol
                                                    </p>
                                                </div>
                                            </div>
                                        </ModalHeader>
                                        <ModalBody className="py-5 px-6 flex flex-col gap-4">
                                            {selectedEnquiryInventory && (
                                                <div className="p-3.5 bg-default-100/60 rounded-2xl border border-divider/30 flex items-center justify-between gap-3 shadow-sm">
                                                    <div className="flex flex-col gap-1 min-w-0">
                                                        <span className="text-[10px] font-black text-default-400 uppercase tracking-widest">
                                                            Target Inventory Item
                                                        </span>
                                                        <span className="text-base font-black text-foreground truncate">
                                                            {selectedEnquiryInventory.product}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-xs text-default-500 font-medium">
                                                            <span>Warehouse: {selectedEnquiryInventory.warehouseName || "Private Location"}</span>
                                                            <span>•</span>
                                                            <span className="text-primary-500 font-bold">{selectedEnquiryInventory.availableQty ?? selectedEnquiryInventory.quantity} MT Available</span>
                                                        </div>
                                                    </div>
                                                    <Chip size="sm" color="primary" variant="flat" className="font-bold shrink-0">
                                                        {selectedEnquiryInventory.productVariant || "Standard"}
                                                    </Chip>
                                                </div>
                                            )}

                                            {(isAdmin || isOperatorUser) && (
                                                <Select
                                                    label="Buyer Associate"
                                                    labelPlacement="outside"
                                                    placeholder="Select buyer associate"
                                                    selectedKeys={enquiryBuyerAssociateId ? [enquiryBuyerAssociateId] : []}
                                                    onSelectionChange={(keys) => setEnquiryBuyerAssociateId(String(Array.from(keys)[0] || ""))}
                                                    variant="bordered"
                                                    description="Specify which associate is initiating this enquiry."
                                                    classNames={{
                                                        label: "text-xs font-bold text-default-500 uppercase tracking-wider",
                                                    }}
                                                >
                                                    {buyerOptions.map((opt: any) => {
                                                        const optId = String(opt._id || opt.id || "");
                                                        const companyName = typeof opt.associateCompany === "object" ? opt.associateCompany?.name : "";
                                                        const displayName = opt.name || opt.fullName || opt.user?.name || companyName || "Associate";
                                                        return (
                                                            <SelectItem key={optId} value={optId} textValue={displayName}>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-sm">{displayName}</span>
                                                                    {opt.email && <span className="text-xs text-default-400">{opt.email}</span>}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </Select>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <Input
                                                    label="Enquiry Quantity (MT)"
                                                    labelPlacement="outside"
                                                    type="number"
                                                    value={enquiryQty}
                                                    onChange={(e) => setEnquiryQty(e.target.value)}
                                                    placeholder="e.g. 10"
                                                    isDisabled={submittingEnquiry}
                                                    variant="bordered"
                                                    startContent={<span className="text-default-400 text-xs font-bold">MT</span>}
                                                    classNames={{
                                                        label: "text-xs font-bold text-default-500 uppercase tracking-wider",
                                                    }}
                                                />

                                                <Select
                                                    label="Preferred Incoterm"
                                                    labelPlacement="outside"
                                                    placeholder="Select incoterm (Optional)"
                                                    selectedKeys={enquiryIncotermId ? [enquiryIncotermId] : []}
                                                    onSelectionChange={(keys) => setEnquiryIncotermId(String(Array.from(keys)[0] || ""))}
                                                    variant="bordered"
                                                    classNames={{
                                                        label: "text-xs font-bold text-default-500 uppercase tracking-wider",
                                                    }}
                                                >
                                                    {incotermOptions.map((inco: any) => {
                                                        const incoId = String(inco._id || inco.id || "");
                                                        return (
                                                            <SelectItem key={incoId} value={incoId} textValue={inco.name || inco.code || incoId}>
                                                                <span className="font-bold text-sm">{inco.name || inco.code}</span>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </Select>
                                            </div>

                                            <Textarea
                                                label="Trade Specifications / Requirements"
                                                labelPlacement="outside"
                                                value={enquiryNotes}
                                                onChange={(e) => setEnquiryNotes(e.target.value)}
                                                placeholder="Enter specific grade, packaging, target price, or delivery timeline..."
                                                variant="bordered"
                                                minRows={3}
                                                classNames={{
                                                    label: "text-xs font-bold text-default-500 uppercase tracking-wider",
                                                }}
                                            />

                                            <div className="flex items-start gap-2 text-xs text-primary-600 dark:text-primary-400 bg-primary/10 px-3.5 py-2.5 rounded-xl border border-primary/20">
                                                <FiInfo size={14} className="shrink-0 mt-0.5" />
                                                <span>LOI will be automatically generated upon submitting this trade enquiry.</span>
                                            </div>
                                        </ModalBody>
                                        <ModalFooter className="border-t border-divider px-6 py-4 gap-3">
                                            <Button
                                                variant="flat"
                                                color="default"
                                                onPress={closeEnquiryModal}
                                                isDisabled={submittingEnquiry}
                                                className="font-semibold"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                color="primary"
                                                onPress={handleEnquirySubmit}
                                                isLoading={submittingEnquiry}
                                                className="font-bold px-6"
                                                startContent={!submittingEnquiry ? <FiMessageSquare size={16} /> : undefined}
                                            >
                                                Submit Trade Enquiry
                                            </Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
                            </div>
                        );
                    }}
                </QueryComponent>
            )}
        </div>
    );
};

export default InventoryList;
