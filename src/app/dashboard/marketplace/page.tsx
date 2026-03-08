"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Spacer } from "@heroui/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import { Tab, Tabs } from "@nextui-org/tabs";
import { LuWarehouse } from "react-icons/lu";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MarketplaceFilterBar, {
  MarketplaceFilterState,
} from "@/components/dashboard/Marketplace/MarketplaceFilterBar";

type MarketplaceTabKey = "marketplace-live" | "marketplace-offline";

const emptyState: MarketplaceFilterState = { search: "", filters: {} };

const parseStateFromParams = (
  params: URLSearchParams,
  prefix: "ml_" | "mo_"
): MarketplaceFilterState => {
  const next: MarketplaceFilterState = { search: "", filters: {} };
  const search = params.get(`${prefix}search`);
  if (search) next.search = search;
  return next;
};

const serializeStateToParams = (
  params: URLSearchParams,
  prefix: "ml_" | "mo_",
  state: MarketplaceFilterState
) => {
  Array.from(params.keys()).forEach((key) => {
    if (key.startsWith(prefix) && key !== `${prefix}search`) {
      params.delete(key);
    }
  });
  params.delete(`${prefix}search`);

  const search = String(state.search || "").trim();
  if (search) params.set(`${prefix}search`, search);
};

export default function MarketplacePage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isHydratedFromUrl, setIsHydratedFromUrl] = useState(false);
    const [currentTable, setCurrentTable] = useState<MarketplaceTabKey>("marketplace-live");
    const [liveState, setLiveState] = useState<MarketplaceFilterState>(emptyState);
    const [offlineState, setOfflineState] = useState<MarketplaceFilterState>(emptyState);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const tabFromUrl = params.get("tab");
        const tab = tabFromUrl === "marketplace-offline" ? "marketplace-offline" : "marketplace-live";
        setCurrentTable(tab);
        setLiveState(parseStateFromParams(params, "ml_"));
        setOfflineState(parseStateFromParams(params, "mo_"));
        setIsHydratedFromUrl(true);
    }, [searchParams]);

    useEffect(() => {
        if (!isHydratedFromUrl) return;
        const current = new URLSearchParams(searchParams.toString());
        const next = new URLSearchParams(searchParams.toString());

        next.set("tab", currentTable);
        serializeStateToParams(next, "ml_", liveState);
        serializeStateToParams(next, "mo_", offlineState);

        if (next.toString() !== current.toString()) {
            router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        }
    }, [currentTable, liveState, offlineState, isHydratedFromUrl, pathname, router, searchParams]);

    const activeState = useMemo(
        () => (currentTable === "marketplace-live" ? liveState : offlineState),
        [currentTable, liveState, offlineState]
    );

    const setActiveState = (nextState: MarketplaceFilterState) => {
        if (currentTable === "marketplace-live") {
            setLiveState(nextState);
            return;
        }
        setOfflineState(nextState);
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
                                            externalFilters={liveState.filters}
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
