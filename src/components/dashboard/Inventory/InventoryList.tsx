"use client";

import React, { useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Chip,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Input,
    Switch,
    Tooltip,
    Tabs,
    Tab,
} from "@nextui-org/react";
import { FiSend, FiEdit2, FiEyeOff } from "react-icons/fi";

import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "@/components/CurdTable/common-table";
import QueryComponent from "@/components/queryComponent";
import AuthContext from "@/context/AuthContext";
import { apiRoutesByRole, generateColumns, initialTableConfig } from "@/utils/tableValues";
import EditModal from "@/components/CurdTable/edit-model";
import DeleteModal from "@/components/CurdTable/delete";
import DynamicFilter from "@/components/CurdTable/dynamic-filtering";
import TableFrame from "@/components/CurdTable/table-frame";
import { getData, postData, patchData, deleteData } from "@/core/api/apiHandler";
import { apiRoutes, associateCompanyRoutes, associateRoutes, inventoryRoutes, variantRateRoutes, inventoryReservationRoutes, warehouseRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
import CompanySearch from "@/components/dashboard/Company/CompanySearch";

const InventoryList: React.FC = () => {
    const { user } = useContext(AuthContext);
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
    const [costModalOpen, setCostModalOpen] = useState(false);
    const [costInventory, setCostInventory] = useState<any>(null);
    const [customDays, setCustomDays] = useState("");

    const roleLower = String(user?.role || "").toLowerCase();
    const isAdmin = roleLower === "admin";
    const isOperatorUser = roleLower === "operator" || roleLower === "team";
    const isAssociate = roleLower === "associate";
    const canUseDemo = isAdmin || isOperatorUser;

    const { data: companyData } = useQuery({
        queryKey: ["inventory-assigned-companies", associateCompanyRoutes.getAll, user?.id, roleLower],
        queryFn: () => getData(associateCompanyRoutes.getAll, { limit: 300 }),
        enabled: isOperatorUser,
    });

    const operatorScopedCompanyIds: string[] = isOperatorUser
        ? ((companyData?.data?.data?.data || []) as Array<{ _id?: string }>)
            .map((company) => company?._id)
            .filter((id): id is string => Boolean(id))
        : [];

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

    const columns = generateColumns("inventories", initialTableConfig, user?.role);
    const formFields = initialTableConfig["inventories"];

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

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, JSON.stringify(filters || {}), effectiveCompanyId, activeTab]);

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

    const { data: reservationData } = useQuery({
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
                <div className="mb-6 rounded-xl border border-warning-300/30 bg-warning-500/10 px-4 py-3 text-sm text-warning-700 dark:text-warning-300">
                    Select a company to view and manage inventory.
                </div>
            )}

            {shouldFetchInventory && (
                <QueryComponent
                    api={apiRoutesByRole["inventories"]}
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
                                    message: "Rate unpublished (hidden from marketplace).",
                                    position: "top-right",
                                });
                                refetch?.();
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
                                            <div className="mb-6 rounded-xl border border-warning-300/30 bg-warning-500/10 px-4 py-4">
                                                <div className="mb-2 text-sm font-semibold text-warning-700 dark:text-warning-300">
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
                                                apiEndpoint={apiRoutesByRole["inventories"]}
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
                                                editModal={(item: any) => (
                                                    <EditModal
                                                        _id={item._id}
                                                        initialData={item}
                                                        currentTable="inventories"
                                                        formFields={filteredFormFields}
                                                        apiEndpoint={apiRoutesByRole["inventories"]}
                                                        refetchData={refetch}
                                                    />
                                                )}
                                                deleteModal={(item: any) => (
                                                    <DeleteModal
                                                        _id={item._id}
                                                        name={`${item.productVariant}`}
                                                        deleteApiEndpoint={apiRoutesByRole["inventories"]}
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
                                                                variant="flat"
                                                                color={isPublished ? (isLive ? "success" : "warning") : "default"}
                                                                startContent={
                                                                    isPublished && isLive ? (
                                                                        <span className="relative flex h-1.5 w-1.5 ml-0.5">
                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-500 opacity-75" />
                                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success-500" />
                                                                        </span>
                                                                    ) : null
                                                                }
                                                            >
                                                                {isPublished ? (isLive ? "Live" : "Paused") : "No Rate"}
                                                            </Chip>

                                                            {!isPublished ? (
                                                                <Tooltip content="Publish to Marketplace" placement="top" size="sm">
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
                                                                        content={isLive ? "Hide from marketplace" : "Already paused"}
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
                                            {reservationRows.length === 0 ? (
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
                                                <div className="p-2.5 bg-warning/10 rounded-xl text-warning-500 shadow-sm shadow-warning/10">
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
                                                        <div className="px-3 py-1.5 bg-warning/10 text-warning-600 rounded-xl text-xs font-black border border-warning/20 shadow-inner shrink-0">
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
                                                <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                        <div className="rounded-xl border border-warning-300/30 bg-warning-500/10 px-4 py-3 text-sm text-warning-700 dark:text-warning-300">
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
                                                    Publish to marketplace
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
                            </div>
                        );
                    }}
                </QueryComponent>
            )}
        </div>
    );
};

export default InventoryList;
