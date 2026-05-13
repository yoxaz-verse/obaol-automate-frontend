"use client";

import React, { useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Spacer, Tab, Tabs } from "@heroui/react";
import { useRouter } from "next/navigation";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import { LuWarehouse } from "react-icons/lu";
import { FiGrid } from "react-icons/fi";
import { FiPlus } from "react-icons/fi";
import MarketplaceFilterBar, {
  MarketplaceFilterState,
} from "@/components/dashboard/Marketplace/MarketplaceFilterBar";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { variantRateRoutes } from "@/core/api/apiRoutes";
import { getClassificationOptions, getClassificationTheme, resolveActiveClassificationTheme } from "@/utils/classificationTheme";

type MarketplaceTabKey = "marketplace-live" | "marketplace-offline";
type ClassificationTabKey = "all" | "conventional" | "natural" | "organic" | "gi-tag";

const emptyState: MarketplaceFilterState = { search: "", filters: {} };

const StatCard = ({
    label,
    value,
    themeClass,
    borderClass,
}: {
    label: string;
    value: string | number;
    themeClass: string;
    borderClass: string;
}) => (
    <div className={`rounded-2xl border p-4 shadow-sm ${themeClass} ${borderClass}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">{label}</p>
        <p className="mt-1 text-2xl font-black tracking-tight text-foreground">{value}</p>
    </div>
);

export default function MarketplacePage() {
    const router = useRouter();
    const { user } = useContext(AuthContext);
    const roleLower = String(user?.role || "").toLowerCase();
    const isAdmin = roleLower === "admin";
    const isOperatorUser = roleLower === "operator" || roleLower === "team";
    const isAdminUser = roleLower === "admin" || isOperatorUser;
    const isAssociateUser = roleLower === "associate";
    const hasLinkedCompany = Boolean((user as any)?.associateCompanyId);
    const canAddOwnRate = isAdminUser || (isAssociateUser && hasLinkedCompany);

    const [currentTable, setCurrentTable] = useState<MarketplaceTabKey>("marketplace-live");
    const [classificationTab, setClassificationTab] = useState<ClassificationTabKey>("all");
    const [liveState, setLiveState] = useState<MarketplaceFilterState>(emptyState);
    const [offlineState, setOfflineState] = useState<MarketplaceFilterState>(emptyState);
    const [openCreateModalSignal, setOpenCreateModalSignal] = useState(0);
    const [loadedTabs, setLoadedTabs] = useState<Record<MarketplaceTabKey, boolean>>({
        "marketplace-live": true,
        "marketplace-offline": false,
    });

    const activeState = useMemo(
        () => (currentTable === "marketplace-live" ? liveState : offlineState),
        [currentTable, liveState, offlineState]
    );

    const effectiveClassifications = useMemo(() => {
        const selected = Array.isArray(activeState?.filters?.classifications) ? activeState.filters.classifications : [];
        if (classificationTab === "all") return selected;
        return Array.from(new Set([classificationTab, ...selected]));
    }, [activeState, classificationTab]);
    const activeTheme = useMemo(
        () => resolveActiveClassificationTheme(effectiveClassifications),
        [effectiveClassifications]
    );

    const setActiveState = (nextState: MarketplaceFilterState) => {
        const normalizedState: MarketplaceFilterState = {
            search: String(nextState.search || ""),
            filters: { ...(nextState.filters || {}) },
        };
        if (currentTable === "marketplace-live") {
            setLiveState(normalizedState);
            return;
        }
        setOfflineState(normalizedState);
    };
    const statsQuery = useQuery({
        queryKey: ["marketplace-stats"],
        queryFn: async () => {
            const response = await getData(variantRateRoutes.marketplaceStats);
            return response?.data?.data || {};
        },
        enabled: isAdmin,
    });

    const liveCount = Number(statsQuery.data?.live ?? 0);
    const offlineCount = Number(statsQuery.data?.offline ?? 0);
    const totalCount = Number(statsQuery.data?.total ?? (liveCount + offlineCount));
    const isCountLoading = statsQuery.isLoading;
    const hasCountError = statsQuery.isError;

    const displayCount = (value: number) => {
        if (isCountLoading) return "—";
        if (hasCountError) return 0;
        return value;
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-[560px] h-[560px] blur-[140px] rounded-full pointer-events-none ${activeTheme.pageGlowA}`} />
            <div className={`absolute bottom-0 left-0 w-[520px] h-[520px] blur-[150px] rounded-full pointer-events-none ${activeTheme.pageGlowB}`} />
            <div className="w-full max-w-[1400px]">
                {/* Page Header */}
                <header className={`mb-8 flex flex-col gap-2 rounded-3xl border px-5 py-6 ${activeTheme.shellClass} ${activeTheme.shellBorderClass}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-warning-100 rounded-2xl text-warning-600">
                            <LuWarehouse size={28} />
                        </div>
                        <div>
                            <h1 className={`text-3xl font-bold tracking-tight text-foreground`}>
                                Marketplace
                            </h1>
                            <p className="text-default-500 text-medium">
                                Browse and manage live products and inactive rates from across the network.
                            </p>
                        </div>
                    </div>
                </header>
                {isAdmin && (
                        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <StatCard label="Total Products" value={displayCount(totalCount)} themeClass={activeTheme.shellClass} borderClass={activeTheme.shellBorderClass} />
                        <StatCard label="Live Products" value={displayCount(liveCount)} themeClass={activeTheme.shellClass} borderClass={activeTheme.shellBorderClass} />
                        <StatCard label="Offline Products" value={displayCount(offlineCount)} themeClass={activeTheme.shellClass} borderClass={activeTheme.shellBorderClass} />
                    </div>
                )}

                <div className={`rounded-3xl border shadow-sm overflow-hidden ${activeTheme.shellClass} ${activeTheme.shellBorderClass}`}>
                    <div className="p-6">
                        <MarketplaceFilterBar
                            activeTab={currentTable}
                            state={activeState}
                            onStateChange={setActiveState}
                            activeTheme={activeTheme}
                        />
                        <div className="mb-4">
                            <Tabs
                                aria-label="Marketplace Classification Tabs"
                                selectedKey={classificationTab}
                                onSelectionChange={(key) => setClassificationTab(key as ClassificationTabKey)}
                                variant="underlined"
                                color="warning"
                                classNames={{
                                    tabList: "gap-6 relative rounded-none p-0 border-b border-divider/30",
                                    cursor: "bg-warning-500 w-full h-[2px] rounded-t-full",
                                    tab: "max-w-fit px-2 h-11",
                                    tabContent: "font-semibold uppercase tracking-wider text-[10px] text-default-400 transition-all group-data-[selected=true]:text-warning-500"
                                }}
                            >
                                <Tab
                                    key={"all"}
                                    title={(
                                        <span className="inline-flex items-center gap-1.5">
                                            <FiGrid size={13} />
                                            <span>All</span>
                                        </span>
                                    )}
                                />
                                {getClassificationOptions().map((item) => {
                                    const theme = getClassificationTheme(item.key);
                                    return (
                                        <Tab
                                            key={item.key}
                                            title={(
                                                <span className={`inline-flex items-center gap-1.5 transition-colors ${classificationTab === item.key ? theme.tabActiveClass : theme.tabIdleClass}`}>
                                                    <item.icon size={13} className={theme.iconClass} />
                                                    <span>{item.label}</span>
                                                </span>
                                            )}
                                        />
                                    );
                                })}
                            </Tabs>
                        </div>
                        <div className="flex w-full gap-4">
                            <div className="w-full min-w-0 pb-10 overflow-x-auto">
                                <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-default-500">
                                        Marketplace Listings
                                    </div>
                                    {canAddOwnRate && (
                                        <Button
                                            size="sm"
                                            onPress={() => router.push("/dashboard/product")}
                                            variant="shadow"
                                            color="warning"
                                            className="font-black tracking-widest px-5 h-10 rounded-xl uppercase text-[11px] shadow-warning-500/30"
                                            startContent={<FiPlus size={16} />}
                                        >
                                            List your product
                                        </Button>
                                    )}
                                </div>
                                <Tabs
                                    aria-label="Marketplace Tabs"
                                    selectedKey={currentTable}
                                    onSelectionChange={(key) => {
                                        const nextKey = key as MarketplaceTabKey;
                                        setCurrentTable(nextKey);
                                        setLoadedTabs((prev) => ({ ...prev, [nextKey]: true }));
                                    }}
                                    variant="underlined"
                                    color="primary"
                                    classNames={{
                                        tabList: "gap-10 relative rounded-none p-0 border-b border-divider/40",
                                        cursor: "bg-primary w-full h-[3px] rounded-t-full shadow-[0_-1px_10px_rgba(var(--heroui-primary-rgb),0.2)]",
                                        tab: "max-w-fit px-4 h-14 transition-all duration-300 hover:opacity-100",
                                        tabContent: "font-semibold uppercase tracking-wider text-[11px] text-default-400 group-data-[selected=true]:text-primary group-data-[selected=true]:scale-105 transition-transform"
                                    }}
                                >
                                    <Tab key={"marketplace-live"} title="Marketplace (Live)">
                                        {/* @ts-ignore */}
                                        <Spacer y={4} />
                                        {loadedTabs["marketplace-live"] && (
                                            <VariantRate
                                                rate="variantRate"
                                                additionalParams={{ view: "marketplace", isLive: true, classifications: effectiveClassifications }}
                                                hideBuiltInFilters
                                                externalSearch={liveState.search}
                                                externalFilters={liveState.filters}
                                                showCreateButton={false}
                                                openCreateModalSignal={currentTable === "marketplace-live" ? openCreateModalSignal : 0}
                                            />
                                        )}
                                    </Tab>
                                    <Tab key={"marketplace-offline"} title="Marketplace (Offline)">
                                        {/* @ts-ignore */}
                                        <Spacer y={4} />
                                        {loadedTabs["marketplace-offline"] && (
                                            <VariantRate
                                                rate="variantRate"
                                                additionalParams={{ view: "marketplace", isLive: false, classifications: effectiveClassifications }}
                                                hideBuiltInFilters
                                                externalSearch={offlineState.search}
                                                externalFilters={offlineState.filters}
                                                showCreateButton={false}
                                                openCreateModalSignal={currentTable === "marketplace-offline" ? openCreateModalSignal : 0}
                                            />
                                        )}
                                    </Tab>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
