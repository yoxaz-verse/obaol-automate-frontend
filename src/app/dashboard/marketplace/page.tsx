"use client";

import React, { useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Spacer, Tab, Tabs } from "@heroui/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import { LuWarehouse } from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import MarketplaceFilterBar, {
  MarketplaceFilterState,
} from "@/components/dashboard/Marketplace/MarketplaceFilterBar";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { variantRateRoutes } from "@/core/api/apiRoutes";

type MarketplaceTabKey = "marketplace-live" | "marketplace-offline";

const emptyState: MarketplaceFilterState = { search: "", filters: {} };

const parseTotalCount = (response: any) => {
    const payload = response?.data?.data;
    if (typeof payload?.totalCount === "number") return payload.totalCount;
    if (typeof payload?.data?.totalCount === "number") return payload.data.totalCount;
    return 0;
};

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="rounded-2xl border border-default-200 bg-content1 p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">{label}</p>
        <p className="mt-1 text-2xl font-black tracking-tight text-foreground">{value}</p>
    </div>
);

export default function MarketplacePage() {
    const { user } = useContext(AuthContext);
    const roleLower = String(user?.role || "").toLowerCase();
    const isAdmin = roleLower === "admin";
    const isOperatorUser = roleLower === "operator" || roleLower === "team";
    const isAdminUser = roleLower === "admin" || isOperatorUser;
    const isAssociateUser = roleLower === "associate";
    const hasLinkedCompany = Boolean((user as any)?.associateCompanyId);
    const canAddOwnRate = isAdminUser || (isAssociateUser && hasLinkedCompany);

    const [currentTable, setCurrentTable] = useState<MarketplaceTabKey>("marketplace-live");
    const [liveState, setLiveState] = useState<MarketplaceFilterState>(emptyState);
    const [offlineState, setOfflineState] = useState<MarketplaceFilterState>(emptyState);
    const [openCreateModalSignal, setOpenCreateModalSignal] = useState(0);

    const activeState = useMemo(
        () => (currentTable === "marketplace-live" ? liveState : offlineState),
        [currentTable, liveState, offlineState]
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
    const liveCountQuery = useQuery({
        queryKey: ["marketplace-count", "live"],
        queryFn: async () => {
            const response = await getData(variantRateRoutes.getAll, {
                page: 1,
                limit: 1,
                view: "marketplace",
                isLive: true,
            });
            return parseTotalCount(response);
        },
        enabled: isAdmin,
    });

    const offlineCountQuery = useQuery({
        queryKey: ["marketplace-count", "offline"],
        queryFn: async () => {
            const response = await getData(variantRateRoutes.getAll, {
                page: 1,
                limit: 1,
                view: "marketplace",
                isLive: false,
            });
            return parseTotalCount(response);
        },
        enabled: isAdmin,
    });

    const liveCount = liveCountQuery.data ?? 0;
    const offlineCount = offlineCountQuery.data ?? 0;
    const totalCount = liveCount + offlineCount;
    const isCountLoading = liveCountQuery.isLoading || offlineCountQuery.isLoading;
    const hasCountError = liveCountQuery.isError || offlineCountQuery.isError;

    const displayCount = (value: number) => {
        if (isCountLoading) return "—";
        if (hasCountError) return 0;
        return value;
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8">
            <div className="w-full max-w-[1400px]">
                {/* Page Header */}
                <header className="mb-8 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-warning-100 rounded-2xl text-warning-600">
                            <LuWarehouse size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
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
                        <StatCard label="Total Products" value={displayCount(totalCount)} />
                        <StatCard label="Live Products" value={displayCount(liveCount)} />
                        <StatCard label="Offline Products" value={displayCount(offlineCount)} />
                    </div>
                )}

                <div className="bg-content1 rounded-3xl border border-default-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                        <MarketplaceFilterBar
                            activeTab={currentTable}
                            state={activeState}
                            onStateChange={setActiveState}
                        />
                        <div className="flex w-full gap-4">
                            <div className="w-full min-w-0 pb-10 overflow-x-auto">
                                <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-default-500">
                                        Marketplace Listings
                                    </div>
                                    {canAddOwnRate && (
                                        <Button
                                            size="sm"
                                            onPress={() => setOpenCreateModalSignal((prev) => prev + 1)}
                                            variant="shadow"
                                            color="warning"
                                            className="font-black tracking-widest px-5 h-10 rounded-xl uppercase text-[11px] shadow-warning-500/30"
                                            startContent={<FiPlus size={16} />}
                                        >
                                            Create Rate Listing
                                        </Button>
                                    )}
                                </div>
                                <Tabs
                                    aria-label="Marketplace Tabs"
                                    selectedKey={currentTable}
                                    onSelectionChange={(key) => setCurrentTable(key as MarketplaceTabKey)}
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
                                        <VariantRate
                                            rate="variantRate"
                                            additionalParams={{ view: "marketplace", isLive: true }}
                                            hideBuiltInFilters
                                            externalSearch={liveState.search}
                                            externalFilters={liveState.filters}
                                            showCreateButton={false}
                                            openCreateModalSignal={currentTable === "marketplace-live" ? openCreateModalSignal : 0}
                                        />
                                    </Tab>
                                    <Tab key={"marketplace-offline"} title="Marketplace (Offline)">
                                        {/* @ts-ignore */}
                                        <Spacer y={4} />
                                        <VariantRate
                                            rate="variantRate"
                                            additionalParams={{ view: "marketplace", isLive: false }}
                                            hideBuiltInFilters
                                            externalSearch={offlineState.search}
                                            externalFilters={offlineState.filters}
                                            showCreateButton={false}
                                            openCreateModalSignal={currentTable === "marketplace-offline" ? openCreateModalSignal : 0}
                                        />
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
