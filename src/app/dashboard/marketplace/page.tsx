"use client";

import React, { useContext, useState } from "react";
import { Spacer } from "@heroui/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import { Tab, Tabs } from "@nextui-org/tabs";
import AuthContext from "@/context/AuthContext";
import { LuWarehouse } from "react-icons/lu";

export default function MarketplacePage() {
    const [currentTable, setCurrentTable] = useState("marketplace-live");
    const { user } = useContext(AuthContext);

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
                        <div className="flex w-full gap-4 h-[75vh]">
                            <div className="w-full min-w-0 pb-10 overflow-auto">
                                <Tabs
                                    aria-label="Marketplace Tabs"
                                    selectedKey={currentTable}
                                    onSelectionChange={(key) => setCurrentTable(key as string)}
                                    variant="underlined"
                                    color="warning"
                                    classNames={{
                                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                        cursor: "w-full bg-warning-500",
                                        tab: "max-w-fit px-0 h-12",
                                        tabContent: "group-data-[selected=true]:text-warning-500 font-semibold"
                                    }}
                                >
                                    <Tab key={"marketplace-live"} title="Marketplace (Live)">
                                        {/* @ts-ignore */}
                                        <Spacer y={4} />
                                        <VariantRate
                                            rate="variantRate"
                                            additionalParams={{ view: "marketplace", isLive: true }}
                                        />
                                    </Tab>
                                    <Tab key={"marketplace-offline"} title="Marketplace (Offline)">
                                        {/* @ts-ignore */}
                                        <Spacer y={4} />
                                        <VariantRate
                                            rate="variantRate"
                                            additionalParams={{ view: "marketplace", isLive: false }}
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
