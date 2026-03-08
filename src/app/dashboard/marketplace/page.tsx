"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Spacer } from "@heroui/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import { Tab, Tabs } from "@nextui-org/tabs";
import { LuWarehouse } from "react-icons/lu";
import MarketplaceFilterBar, {
  MarketplaceFilterState,
} from "@/components/dashboard/Marketplace/MarketplaceFilterBar";

type MarketplaceTabKey = "marketplace-live" | "marketplace-offline";

const emptyState: MarketplaceFilterState = { search: "", filters: {} };

export default function MarketplacePage() {
    const [currentTable, setCurrentTable] = useState<MarketplaceTabKey>("marketplace-live");
    const [liveState, setLiveState] = useState<MarketplaceFilterState>(emptyState);
    const [offlineState, setOfflineState] = useState<MarketplaceFilterState>(emptyState);

    const activeState = useMemo(
        () => (currentTable === "marketplace-live" ? liveState : offlineState),
        [currentTable, liveState, offlineState]
    );

    const setActiveState = (nextState: MarketplaceFilterState) => {
        const normalizedState: MarketplaceFilterState = {
            search: String(nextState.search || ""),
            filters: {},
        };
        if (currentTable === "marketplace-live") {
            setLiveState(normalizedState);
            return;
        }
        setOfflineState(normalizedState);
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

                <div className="bg-content1 rounded-3xl border border-default-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                        <MarketplaceFilterBar
                            activeTab={currentTable}
                            state={activeState}
                            onStateChange={setActiveState}
                        />
                        <div className="flex w-full gap-4">
                            <div className="w-full min-w-0 pb-10 overflow-x-auto">
                                <Tabs
                                    aria-label="Marketplace Tabs"
                                    selectedKey={currentTable}
                                    onSelectionChange={(key) => setCurrentTable(key as MarketplaceTabKey)}
                                    variant="underlined"
                                    color="warning"
                                    classNames={{
                                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                        cursor: "w-full bg-warning-500",
                                        tab: "max-w-fit px-0 h-12",
                                        tabContent: "text-default-600 dark:text-default-300 group-data-[selected=true]:text-warning-500 font-semibold"
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
