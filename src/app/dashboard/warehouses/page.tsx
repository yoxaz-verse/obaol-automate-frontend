"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, postData, patchData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
import { LuWarehouse, LuPencil, LuPlus } from "react-icons/lu";
import { BsBoxes } from "react-icons/bs";
import { FiTrendingUp, FiTrendingDown, FiAlertCircle, FiLoader, FiX, FiActivity } from "react-icons/fi";
import { TbContainer, TbArrowsUpDown } from "react-icons/tb";
import { MdOutlineAssignment } from "react-icons/md";
import {
    Card, CardBody, CardHeader, Chip, Tab, Tabs, Divider,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Input, Select, SelectItem, Switch, Textarea
} from "@heroui/react";
import AuthContext from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Warehouse {
    _id: string;
    name: string;
    address?: string;
    category?: "GENERAL" | "COLD_STORAGE" | "BONDED" | "AGRO";
    allowedCategoryIds?: string[];
    storageRatePerUnit: number;
    unit: "KG" | "MT";
    isActive: boolean;
    listingType?: "PRIVATE" | "RENTAL";
    isRentalActive?: boolean;
}

const EMPTY_WAREHOUSE = {
    name: "",
    address: "",
    category: "GENERAL" as const,
    allowedCategoryIds: [] as string[],
    storageRatePerUnit: 0,
    unit: "MT" as const,
    isActive: true,
    listingType: "PRIVATE" as const,
    isRentalActive: false,
};
const EMPTY_MOVEMENT = { warehouseId: "", quantity: 0, note: "" };

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
    return (
        <Card className="bg-content1 border border-default-200/50 shadow-sm">
            <CardBody className="flex flex-row items-center gap-4 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-default-400 font-bold">{label}</p>
                    <p className="text-xl font-black text-foreground leading-tight">{value}</p>
                </div>
            </CardBody>
        </Card>
    );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-default-100 flex items-center justify-center text-3xl text-default-400 mb-4">{icon}</div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-2">{title}</h3>
            <p className="text-xs text-default-400 max-w-xs leading-relaxed">{description}</p>
        </div>
    );
}

function LoadingState({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center py-20 text-default-400 gap-2">
            <FiLoader size={18} className="animate-spin" />
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WarehousesPage() {
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);
    const roleLower = String(user?.role || "").toLowerCase();
    const initialTab = roleLower === "admin" ? "my" : "available";
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    // Modal states
    const [showAddWarehouse, setShowAddWarehouse] = useState(false);
    const [showEditWarehouse, setShowEditWarehouse] = useState(false);
    const [showMovementModal, setShowMovementModal] = useState<"inbound" | "outbound" | "adjust" | null>(null);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

    // Form states
    const [warehouseForm, setWarehouseForm] = useState(EMPTY_WAREHOUSE);
    const [movementForm, setMovementForm] = useState(EMPTY_MOVEMENT);

    // ── Queries ────────────────────────────────────────────────────────────────
    const warehouseScope =
        activeTab === "available"
            ? "available"
            : activeTab === "my"
                ? roleLower === "admin"
                    ? "all"
                    : "my"
                : "all";

    const { data: warehousesData, isLoading: loadingWarehouses, isError: errorWarehouses } = useQuery({
        queryKey: ["warehouses", warehouseScope],
        queryFn: async () => {
            const res: any = await getData(apiRoutes.warehouses.list, { scope: warehouseScope });
            return res?.data?.data || res?.data || [];
        },
    });
    const { data: warehousesAllData } = useQuery({
        queryKey: ["warehouses", "all"],
        queryFn: async () => {
            const res: any = await getData(apiRoutes.warehouses.list, { scope: "all" });
            return res?.data?.data || res?.data || [];
        },
        enabled: activeTab === "available" && roleLower === "admin",
    });

    const { data: categoriesData } = useQuery({
        queryKey: ["warehouse-categories"],
        queryFn: async () => {
            const res: any = await getData(apiRoutes.category.getAll, { page: 1, limit: 500 });
            const raw = res?.data?.data;
            if (Array.isArray(raw?.data)) return raw.data;
            if (Array.isArray(raw)) return raw;
            if (Array.isArray(res?.data)) return res.data;
            return [];
        },
    });

    const { data: movementsData, isLoading: loadingMovements } = useQuery({
        queryKey: ["warehouse-movements"],
        queryFn: async () => {
            const res: any = await getData(apiRoutes.warehouses.movements);
            return res?.data?.data || res?.data || [];
        },
        enabled: activeTab === "movements",
    });

    const { data: chargesData, isLoading: loadingCharges } = useQuery({
        queryKey: ["storage-charges"],
        queryFn: async () => {
            const res: any = await getData(apiRoutes.warehouses.storageCharges);
            return res?.data?.data || res?.data || [];
        },
        enabled: activeTab === "charges",
    });

    const warehouses: Warehouse[] = Array.isArray(warehousesData) ? warehousesData : [];
    const allWarehouses: Warehouse[] = Array.isArray(warehousesAllData) ? warehousesAllData : [];
    const availableWarehouses: Warehouse[] = useMemo(() => {
        if (activeTab !== "available") return warehouses;
        if (warehouses.length > 0) return warehouses;
        if (roleLower !== "admin") return warehouses;
        return allWarehouses.filter((wh) => {
            const listingType = String(wh?.listingType || "").toUpperCase();
            const rentalActive = wh?.isRentalActive === true || (wh as any)?.isRentalActive === "true" || (wh as any)?.isRentalActive === 1;
            const active = wh?.isActive === true || (wh as any)?.isActive === "true" || (wh as any)?.isActive === 1;
            return active && ((listingType === "RENTAL" && rentalActive) || (!wh?.listingType && rentalActive));
        });
    }, [activeTab, warehouses, allWarehouses, roleLower]);
    const categories = Array.isArray(categoriesData) ? categoriesData : [];
    const categoryNameMap = new Map(categories.map((cat: any) => [String(cat?._id || ""), cat?.name || ""]));
    const movements = Array.isArray(movementsData) ? movementsData : [];
    const charges = Array.isArray(chargesData) ? chargesData : [];

    // ── Mutations ──────────────────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: (data: typeof EMPTY_WAREHOUSE) => postData(apiRoutes.warehouses.create, data),
        onSuccess: () => {
            showToastMessage({ type: "success", message: "Warehouse created successfully!" });
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
            setShowAddWarehouse(false);
            setWarehouseForm(EMPTY_WAREHOUSE);
        },
        onError: () => showToastMessage({ type: "error", message: "Failed to create warehouse." }),
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Warehouse>) =>
            patchData(apiRoutes.warehouses.update(editingWarehouse!._id), data),
        onSuccess: () => {
            showToastMessage({ type: "success", message: "Warehouse updated!" });
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
            setShowEditWarehouse(false);
            setEditingWarehouse(null);
        },
        onError: () => showToastMessage({ type: "error", message: "Failed to update warehouse." }),
    });

    const movementMutation = useMutation({
        mutationFn: ({ type, data }: { type: "inbound" | "outbound" | "adjust"; data: typeof EMPTY_MOVEMENT }) => {
            const endpoint =
                type === "inbound" ? apiRoutes.warehouses.inbound
                    : type === "outbound" ? apiRoutes.warehouses.outbound
                        : apiRoutes.warehouses.adjust;
            return postData(endpoint, data);
        },
        onSuccess: () => {
            showToastMessage({ type: "success", message: "Stock movement recorded!" });
            queryClient.invalidateQueries({ queryKey: ["warehouse-movements"] });
            setShowMovementModal(null);
            setMovementForm(EMPTY_MOVEMENT);
        },
        onError: () => showToastMessage({ type: "error", message: "Failed to record movement." }),
    });

    // ── Handlers ───────────────────────────────────────────────────────────────
    const openEdit = (wh: Warehouse) => {
        setEditingWarehouse(wh);
        setWarehouseForm({
            name: wh.name,
            address: wh.address || "",
            category: wh.category || "GENERAL",
            allowedCategoryIds: Array.isArray(wh.allowedCategoryIds) ? wh.allowedCategoryIds : [],
            storageRatePerUnit: wh.storageRatePerUnit,
            unit: wh.unit,
            isActive: wh.isActive,
            listingType: wh.listingType || "PRIVATE",
            isRentalActive: Boolean(wh.isRentalActive),
        });
        setShowEditWarehouse(true);
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col w-full gap-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase leading-tight">
                        Warehouse <span className="text-warning-500">Management</span>
                    </h1>
                    <p className="text-xs text-default-400 mt-1 font-medium">
                        Monitor storage facilities, stock movements, assignments, and charges.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        color="default"
                        variant="flat"
                        size="sm"
                        startContent={<FiActivity size={14} />}
                        onPress={() => { setShowMovementModal("inbound"); }}
                        className="font-bold"
                    >
                        Inbound
                    </Button>
                    <Button
                        color="default"
                        variant="flat"
                        size="sm"
                        startContent={<FiTrendingDown size={14} />}
                        onPress={() => { setShowMovementModal("outbound"); }}
                        className="font-bold"
                    >
                        Outbound
                    </Button>
                    <Button
                        color="warning"
                        size="sm"
                        startContent={<LuPlus size={16} />}
                        onPress={() => { setWarehouseForm(EMPTY_WAREHOUSE); setShowAddWarehouse(true); }}
                        className="font-bold shadow-md shadow-warning-500/20"
                    >
                        Add Warehouse
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={<LuWarehouse />} label="Total" value={loadingWarehouses ? "—" : warehouses.length} color="bg-warning-500/10 text-warning-500" />
                <StatCard icon={<BsBoxes />} label="Active" value={loadingWarehouses ? "—" : warehouses.filter(w => w.isActive).length} color="bg-success-500/10 text-success-500" />
                <StatCard icon={<FiTrendingUp />} label="Movements" value={movements.length || "—"} color="bg-primary-500/10 text-primary-500" />
                <StatCard icon={<TbContainer />} label="Charge Records" value={charges.length || "—"} color="bg-secondary-500/10 text-secondary-500" />
            </div>

            {/* Tabs */}
            <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(String(key))}
                variant="underlined"
                color="warning"
                classNames={{
                    tabList: "gap-4 border-b border-default-200 w-full",
                    tab: "text-xs font-bold uppercase tracking-widest pb-3",
                    cursor: "bg-warning-500",
                }}
            >
                {/* ── My Warehouses Tab ── */}
                <Tab key="my" title={<div className="flex items-center gap-2"><LuWarehouse size={14} /><span>My Warehouses</span></div>}>
                    {loadingWarehouses ? <LoadingState label="Loading warehouses…" />
                        : errorWarehouses ? <EmptyState icon={<FiAlertCircle />} title="Unable to load" description="Could not fetch warehouse data. Please try again." />
                            : warehouses.length === 0 ? <EmptyState icon={<LuWarehouse />} title="No Warehouses" description="No warehouse facilities registered yet. Click 'Add Warehouse' to get started." />
                                : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                        {warehouses.map((wh) => (
                                            <Card key={wh._id} className="bg-content1 border border-default-200/50 shadow-sm hover:shadow-md hover:border-warning-500/30 transition-all duration-200 group">
                                                <CardHeader className="flex items-start justify-between gap-3 pb-2 px-4 pt-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-500 flex-shrink-0">
                                                            <LuWarehouse size={18} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-black text-sm text-foreground tracking-tight truncate">{wh.name}</h3>
                                                            <p className="text-[10px] text-default-400 font-medium uppercase tracking-widest">{wh.unit} · ₹{wh.storageRatePerUnit}/{wh.unit}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                        {wh.listingType === "RENTAL" && wh.isRentalActive && (
                                                            <Chip size="sm" variant="flat" color="warning" className="text-[9px] font-bold uppercase tracking-wide">
                                                                Rental
                                                            </Chip>
                                                        )}
                                                        <Chip size="sm" variant="flat" color={wh.isActive ? "success" : "default"} className="text-[9px] font-bold uppercase tracking-wide">
                                                            {wh.isActive ? "Active" : "Inactive"}
                                                        </Chip>
                                                        <button
                                                            onClick={() => openEdit(wh)}
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-default-400 hover:text-warning-500 hover:bg-warning-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <LuPencil size={13} />
                                                        </button>
                                                    </div>
                                                </CardHeader>
                                                <Divider className="opacity-50" />
                                                <CardBody className="px-4 py-3 space-y-2">
                                                    {wh.address && (
                                                        <p className="text-xs text-default-500 line-clamp-2">{wh.address}</p>
                                                    )}
                                                    <div className="flex items-center justify-between text-xs pt-1">
                                                        <span className="text-default-400 font-medium">
                                                            {wh.category === "COLD_STORAGE" ? "Cold Storage"
                                                                : wh.category === "BONDED" ? "Bonded Warehouse"
                                                                    : wh.category === "AGRO" ? "Agro Warehouse"
                                                                        : "General Warehouse"}
                                                        </span>
                                                        <span className="font-bold text-foreground">₹{wh.storageRatePerUnit} / {wh.unit}</span>
                                                    </div>
                                                    {Array.isArray(wh.allowedCategoryIds) && wh.allowedCategoryIds.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 pt-1">
                                                            {wh.allowedCategoryIds.map((catId) => (
                                                                <Chip key={catId} size="sm" variant="flat" className="text-[9px] font-bold uppercase tracking-wide">
                                                                    {categoryNameMap.get(String(catId)) || "Category"}
                                                                </Chip>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                </Tab>

                {/* ── Available Warehouses Tab ── */}
                <Tab key="available" title={<div className="flex items-center gap-2"><TbContainer size={14} /><span>Available Warehouses</span></div>}>
                    {loadingWarehouses ? <LoadingState label="Loading warehouses…" />
                        : errorWarehouses ? <EmptyState icon={<FiAlertCircle />} title="Unable to load" description="Could not fetch warehouse data. Please try again." />
                            : availableWarehouses.length === 0 ? <EmptyState icon={<TbContainer />} title="No Rentals Available" description="No rental warehouses are listed right now." />
                                : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                        {availableWarehouses.map((wh) => (
                                            <Card key={wh._id} className="bg-content1 border border-default-200/50 shadow-sm hover:shadow-md hover:border-warning-500/30 transition-all duration-200">
                                                <CardHeader className="flex items-start justify-between gap-3 pb-2 px-4 pt-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-500 flex-shrink-0">
                                                            <LuWarehouse size={18} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-black text-sm text-foreground tracking-tight truncate">{wh.name}</h3>
                                                            <p className="text-[10px] text-default-400 font-medium uppercase tracking-widest">{wh.unit} · ₹{wh.storageRatePerUnit}/{wh.unit}</p>
                                                        </div>
                                                    </div>
                                                    <Chip size="sm" variant="flat" color="warning" className="text-[9px] font-bold uppercase tracking-wide">Rental</Chip>
                                                </CardHeader>
                                                <Divider className="opacity-50" />
                                                <CardBody className="px-4 py-3 space-y-2">
                                                    {wh.address && (
                                                        <p className="text-xs text-default-500 line-clamp-2">{wh.address}</p>
                                                    )}
                                                    <div className="flex items-center justify-between text-xs pt-1">
                                                        <span className="text-default-400 font-medium">
                                                            {wh.category === "COLD_STORAGE" ? "Cold Storage"
                                                                : wh.category === "BONDED" ? "Bonded Warehouse"
                                                                    : wh.category === "AGRO" ? "Agro Warehouse"
                                                                        : "General Warehouse"}
                                                        </span>
                                                        <span className="font-bold text-foreground">₹{wh.storageRatePerUnit} / {wh.unit}</span>
                                                    </div>
                                                    {Array.isArray(wh.allowedCategoryIds) && wh.allowedCategoryIds.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 pt-1">
                                                            {wh.allowedCategoryIds.map((catId) => (
                                                                <Chip key={catId} size="sm" variant="flat" className="text-[9px] font-bold uppercase tracking-wide">
                                                                    {categoryNameMap.get(String(catId)) || "Category"}
                                                                </Chip>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                </Tab>

                {/* ── Movements Tab ── */}
                <Tab key="movements" title={<div className="flex items-center gap-2"><TbArrowsUpDown size={14} /><span>Movements</span></div>}>
                    {loadingMovements ? <LoadingState label="Loading movements…" />
                        : movements.length === 0 ? <EmptyState icon={<TbArrowsUpDown />} title="No Movements" description="No stock movement records logged yet." />
                            : (
                                <div className="pt-4 space-y-3">
                                    {movements.map((m: any) => (
                                        <Card key={m._id || m.id} className="bg-content1 border border-default-200/50 shadow-sm">
                                            <CardBody className="p-4 flex flex-row items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${m.type === "inbound" ? "bg-success-500/10 text-success-500" : m.type === "outbound" ? "bg-danger-500/10 text-danger-500" : "bg-default-100 text-default-500"}`}>
                                                        {m.type === "inbound" ? <FiTrendingUp size={14} /> : m.type === "outbound" ? <FiTrendingDown size={14} /> : <TbArrowsUpDown size={14} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground capitalize">{m.type || "Movement"}</p>
                                                        <p className="text-[10px] text-default-400 font-medium mt-0.5">{m.note || m.warehouseId?.name || "—"}</p>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-black text-foreground text-right">
                                                    <p>{m.quantity ? `${m.quantity} ${m.unit || "MT"}` : "—"}</p>
                                                    <p className="text-[10px] text-default-400 font-medium mt-0.5">{m.timestamp ? new Date(m.timestamp).toLocaleDateString() : m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ""}</p>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            )}
                </Tab>

                {/* ── Storage Charges Tab ── */}
                <Tab key="charges" title={<div className="flex items-center gap-2"><TbContainer size={14} /><span>Storage Charges</span></div>}>
                    {loadingCharges ? <LoadingState label="Loading charges…" />
                        : charges.length === 0 ? <EmptyState icon={<TbContainer />} title="No Storage Charges" description="No storage charge records have been created yet." />
                            : (
                                <div className="pt-4 space-y-3">
                                    {charges.map((c: any) => (
                                        <Card key={c._id || c.id} className="bg-content1 border border-default-200/50 shadow-sm">
                                            <CardBody className="p-4 flex flex-row items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{c.inventoryId?.name || "Inventory"}</p>
                                                    <p className="text-[10px] text-default-400 font-medium mt-0.5">
                                                        {c.fromDate ? new Date(c.fromDate).toLocaleDateString() : "—"} → {c.toDate ? new Date(c.toDate).toLocaleDateString() : "Ongoing"}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Chip size="sm" variant="flat" color={c.status === "paid" ? "success" : c.status === "pending" ? "warning" : "default"} className="text-[9px] font-bold uppercase">
                                                        {c.status || "Draft"}
                                                    </Chip>
                                                    {c.amount && <p className="text-xs font-black text-foreground mt-1">₹{c.amount}</p>}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            )}
                </Tab>
            </Tabs>

            {/* ─── Add Warehouse Modal ─────────────────────────────────────── */}
            <Modal isOpen={showAddWarehouse} onClose={() => setShowAddWarehouse(false)} size="md" placement="center">
                <ModalContent>
                    <ModalHeader className="font-black text-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-500"><LuWarehouse size={16} /></div>
                            Add New Warehouse
                        </div>
                    </ModalHeader>
                    <Divider />
                    <ModalBody className="py-5 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground pl-0.5">Warehouse Name <span className="text-danger-500">*</span></label>
                            <Input
                                placeholder="e.g. Chennai Cold Storage"
                                value={warehouseForm.name}
                                onValueChange={(v) => setWarehouseForm(f => ({ ...f, name: v }))}
                                classNames={{ inputWrapper: "bg-default-100/60 border-default-200" }}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground pl-0.5">Category <span className="text-danger-500">*</span></label>
                            <Select
                                selectedKeys={[warehouseForm.category]}
                                onSelectionChange={(keys) => setWarehouseForm(f => ({ ...f, category: Array.from(keys)[0] as any }))}
                                classNames={{ trigger: "bg-default-100/60 border-default-200" }}
                            >
                                <SelectItem key="GENERAL">General warehouse</SelectItem>
                                <SelectItem key="COLD_STORAGE">Cold storage</SelectItem>
                                <SelectItem key="BONDED">Bonded warehouse</SelectItem>
                                <SelectItem key="AGRO">Agro warehouse</SelectItem>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground pl-0.5">Allowed Commodities</label>
                            <Select
                                selectionMode="multiple"
                                selectedKeys={warehouseForm.allowedCategoryIds}
                                onSelectionChange={(keys) => setWarehouseForm(f => ({ ...f, allowedCategoryIds: Array.from(keys) as string[] }))}
                                classNames={{ trigger: "bg-default-100/60 border-default-200" }}
                                placeholder={categories.length ? "Select categories" : "No categories available"}
                            >
                                {categories.map((cat: any) => (
                                    <SelectItem key={cat._id}>{cat.name}</SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground pl-0.5">Allowed Commodities</label>
                            <Select
                                selectionMode="multiple"
                                selectedKeys={warehouseForm.allowedCategoryIds}
                                onSelectionChange={(keys) => setWarehouseForm(f => ({ ...f, allowedCategoryIds: Array.from(keys) as string[] }))}
                                classNames={{ trigger: "bg-default-100/60 border-default-200" }}
                                placeholder={categories.length ? "Select categories" : "No categories available"}
                            >
                                {categories.map((cat: any) => (
                                    <SelectItem key={cat._id}>{cat.name}</SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground pl-0.5">Address</label>
                            <Textarea
                                placeholder="Full warehouse address"
                                value={warehouseForm.address}
                                onValueChange={(v) => setWarehouseForm(f => ({ ...f, address: v }))}
                                minRows={2}
                                classNames={{ inputWrapper: "bg-default-100/60 border-default-200" }}
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-xs font-bold text-foreground pl-0.5">Storage Rate per Unit <span className="text-danger-500">*</span></label>
                                <Input
                                    placeholder="0"
                                    type="number"
                                    value={String(warehouseForm.storageRatePerUnit)}
                                    onValueChange={(v) => setWarehouseForm(f => ({ ...f, storageRatePerUnit: Number(v) }))}
                                    startContent={<span className="text-default-400 text-sm font-semibold">₹</span>}
                                    classNames={{ inputWrapper: "bg-default-100/60 border-default-200" }}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-xs font-bold text-foreground pl-0.5">Unit</label>
                                <Select
                                    selectedKeys={[warehouseForm.unit]}
                                    onSelectionChange={(keys) => setWarehouseForm(f => ({ ...f, unit: Array.from(keys)[0] as "KG" | "MT" }))}
                                    classNames={{ trigger: "bg-default-100/60 border-default-200" }}
                                >
                                    <SelectItem key="MT">MT (Metric Ton)</SelectItem>
                                    <SelectItem key="KG">KG (Kilogram)</SelectItem>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <p className="text-sm font-semibold text-foreground">List for Rental</p>
                                <p className="text-xs text-default-400">Allow other associates to use this warehouse</p>
                            </div>
                            <Switch
                                isSelected={warehouseForm.listingType === "RENTAL" && warehouseForm.isRentalActive}
                                onValueChange={(v) =>
                                    setWarehouseForm((f) => ({
                                        ...f,
                                        listingType: v ? "RENTAL" : "PRIVATE",
                                        isRentalActive: v,
                                    }))
                                }
                                color="warning"
                            />
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Active</p>
                                <p className="text-xs text-default-400">Enable this warehouse for use</p>
                            </div>
                            <Switch
                                isSelected={warehouseForm.isActive}
                                onValueChange={(v) => setWarehouseForm(f => ({ ...f, isActive: v }))}
                                color="warning"
                            />
                        </div>
                    </ModalBody>
                    <Divider />
                    <ModalFooter>
                        <Button variant="light" onPress={() => setShowAddWarehouse(false)}>Cancel</Button>
                        <Button
                            color="warning"
                            isLoading={createMutation.isPending}
                            isDisabled={!warehouseForm.name.trim()}
                            onPress={() => createMutation.mutate(warehouseForm)}
                            className="font-bold"
                        >
                            Create Warehouse
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ─── Edit Warehouse Modal ────────────────────────────────────── */}
            <Modal isOpen={showEditWarehouse} onClose={() => setShowEditWarehouse(false)} size="md" placement="center">
                <ModalContent>
                    <ModalHeader className="font-black text-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500"><LuPencil size={15} /></div>
                            Edit Warehouse
                        </div>
                    </ModalHeader>
                    <Divider />
                    <ModalBody className="py-5 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground pl-0.5">Warehouse Name <span className="text-danger-500">*</span></label>
                            <Input
                                value={warehouseForm.name}
                                onValueChange={(v) => setWarehouseForm(f => ({ ...f, name: v }))}
                                classNames={{ inputWrapper: "bg-default-100/60 border-default-200" }}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground pl-0.5">Category <span className="text-danger-500">*</span></label>
                            <Select
                                selectedKeys={[warehouseForm.category]}
                                onSelectionChange={(keys) => setWarehouseForm(f => ({ ...f, category: Array.from(keys)[0] as any }))}
                                classNames={{ trigger: "bg-default-100/60 border-default-200" }}
                            >
                                <SelectItem key="GENERAL">General warehouse</SelectItem>
                                <SelectItem key="COLD_STORAGE">Cold storage</SelectItem>
                                <SelectItem key="BONDED">Bonded warehouse</SelectItem>
                                <SelectItem key="AGRO">Agro warehouse</SelectItem>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground pl-0.5">Address</label>
                            <Textarea
                                value={warehouseForm.address}
                                onValueChange={(v) => setWarehouseForm(f => ({ ...f, address: v }))}
                                minRows={2}
                                classNames={{ inputWrapper: "bg-default-100/60 border-default-200" }}
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-xs font-bold text-foreground pl-0.5">Storage Rate <span className="text-danger-500">*</span></label>
                                <Input
                                    type="number"
                                    value={String(warehouseForm.storageRatePerUnit)}
                                    onValueChange={(v) => setWarehouseForm(f => ({ ...f, storageRatePerUnit: Number(v) }))}
                                    startContent={<span className="text-default-400 text-sm font-semibold">₹</span>}
                                    classNames={{ inputWrapper: "bg-default-100/60 border-default-200" }}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-xs font-bold text-foreground pl-0.5">Unit</label>
                                <Select
                                    selectedKeys={[warehouseForm.unit]}
                                    onSelectionChange={(keys) => setWarehouseForm(f => ({ ...f, unit: Array.from(keys)[0] as "KG" | "MT" }))}
                                    classNames={{ trigger: "bg-default-100/60 border-default-200" }}
                                >
                                    <SelectItem key="MT">MT (Metric Ton)</SelectItem>
                                    <SelectItem key="KG">KG (Kilogram)</SelectItem>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <p className="text-sm font-semibold text-foreground">List for Rental</p>
                                <p className="text-xs text-default-400">Allow other associates to use this warehouse</p>
                            </div>
                            <Switch
                                isSelected={warehouseForm.listingType === "RENTAL" && warehouseForm.isRentalActive}
                                onValueChange={(v) =>
                                    setWarehouseForm((f) => ({
                                        ...f,
                                        listingType: v ? "RENTAL" : "PRIVATE",
                                        isRentalActive: v,
                                    }))
                                }
                                color="warning"
                            />
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Active</p>
                                <p className="text-xs text-default-400">Disable to archive the warehouse</p>
                            </div>
                            <Switch
                                isSelected={warehouseForm.isActive}
                                onValueChange={(v) => setWarehouseForm(f => ({ ...f, isActive: v }))}
                                color="warning"
                            />
                        </div>
                    </ModalBody>
                    <Divider />
                    <ModalFooter>
                        <Button variant="light" onPress={() => setShowEditWarehouse(false)}>Cancel</Button>
                        <Button
                            color="primary"
                            isLoading={updateMutation.isPending}
                            isDisabled={!warehouseForm.name.trim()}
                            onPress={() => updateMutation.mutate(warehouseForm)}
                            className="font-bold"
                        >
                            Save Changes
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ─── Stock Movement Modal ────────────────────────────────────── */}
            <Modal isOpen={!!showMovementModal} onClose={() => setShowMovementModal(null)} size="md" placement="center">
                <ModalContent>
                    <ModalHeader className="font-black text-foreground capitalize">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${showMovementModal === "inbound" ? "bg-success-500/10 text-success-500" : showMovementModal === "outbound" ? "bg-danger-500/10 text-danger-500" : "bg-default-100 text-default-500"}`}>
                                {showMovementModal === "inbound" ? <FiTrendingUp size={15} /> : showMovementModal === "outbound" ? <FiTrendingDown size={15} /> : <TbArrowsUpDown size={15} />}
                            </div>
                            {showMovementModal} Stock
                        </div>
                    </ModalHeader>
                    <Divider />
                    <ModalBody className="py-5 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground pl-0.5">Warehouse <span className="text-danger-500">*</span></label>
                            <Select
                                placeholder="Select a warehouse"
                                selectedKeys={movementForm.warehouseId ? [movementForm.warehouseId] : []}
                                onSelectionChange={(keys) => setMovementForm(f => ({ ...f, warehouseId: Array.from(keys)[0] as string }))}
                                classNames={{ trigger: "bg-default-100/60 border-default-200" }}
                            >
                                {warehouses.filter(w => w.isActive).map(wh => (
                                    <SelectItem key={wh._id} textValue={wh.name}>{wh.name}</SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground pl-0.5">Quantity <span className="text-danger-500">*</span></label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={String(movementForm.quantity)}
                                onValueChange={(v) => setMovementForm(f => ({ ...f, quantity: Number(v) }))}
                                classNames={{ inputWrapper: "bg-default-100/60 border-default-200" }}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-foreground pl-0.5">Note / Reference</label>
                            <Textarea
                                placeholder="Optional note or invoice reference"
                                value={movementForm.note}
                                onValueChange={(v) => setMovementForm(f => ({ ...f, note: v }))}
                                minRows={2}
                                classNames={{ inputWrapper: "bg-default-100/60 border-default-200" }}
                            />
                        </div>
                    </ModalBody>
                    <Divider />
                    <ModalFooter>
                        <Button variant="light" onPress={() => setShowMovementModal(null)}>Cancel</Button>
                        <Button
                            color={showMovementModal === "inbound" ? "success" : showMovementModal === "outbound" ? "danger" : "default"}
                            isLoading={movementMutation.isPending}
                            isDisabled={!movementForm.warehouseId || movementForm.quantity <= 0}
                            onPress={() => movementMutation.mutate({ type: showMovementModal!, data: movementForm })}
                            className="font-bold capitalize"
                        >
                            Record {showMovementModal}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
