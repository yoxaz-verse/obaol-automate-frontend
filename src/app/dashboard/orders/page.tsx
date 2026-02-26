"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Tabs, Tab } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import Title from "@/components/titles";
import QueryComponent from "@/components/queryComponent";
import { apiRoutes } from "@/core/api/apiRoutes";
import OrderCard from "@/components/dashboard/orders/OrderCard";

export default function OrdersPage() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = React.useState<string>("All");

    return (
        <section className="">
            <Title title="Orders & Logistics" />

            <QueryComponent
                api={apiRoutes.orders.getAll}
                queryKey={["orders"]}
                page={1}
                limit={50}
            >
                {(orderResponse: any) => {
                    const extractOrders = (raw: any): any[] => {
                        const candidates = [
                            raw,
                            raw?.data,
                            raw?.data?.data,
                            raw?.data?.data?.data,
                            raw?.results,
                            raw?.items,
                        ];
                        const found = candidates.find((it) => Array.isArray(it));
                        if (!Array.isArray(found)) return [];
                        return found
                            .map((row: any) => row?.data?.data || row?.data || row)
                            .filter((row: any) => row && typeof row === "object");
                    };
                    const ordersData = extractOrders(orderResponse);

                    return (
                        <div className="flex items-center justify-center w-full">
                            <div className="w-[95%]">
                                {/* Status Tabs */}
                                <div className="flex justify-between items-center mb-6 overflow-x-auto">
                                    <Tabs
                                        aria-label="Order Stages"
                                        color="secondary"
                                        variant="underlined"
                                        selectedKey={selectedTab}
                                        onSelectionChange={(key) => setSelectedTab(key as string)}
                                        classNames={{
                                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                            cursor: "w-full bg-secondary",
                                            tab: "max-w-fit px-0 h-12",
                                            tabContent: "group-data-[selected=true]:text-secondary"
                                        }}
                                    >
                                        <Tab key="All" title="All Orders" />
                                        <Tab key="Procuring" title="Procuring" />
                                        <Tab key="Loaded" title="Loaded" />
                                        <Tab key="In Transit" title="In Transit" />
                                        <Tab key="Arrived" title="Arrived" />
                                        <Tab key="Completed" title="Completed" />
                                    </Tabs>
                                </div>

                                <section className="py-2 w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {ordersData
                                            .filter((item: any) => selectedTab === "All" || (String(item?.status || "") === selectedTab))
                                            .map((item: any) => (
                                                (() => {
                                                    const orderId = item?._id || item?.id || item?.orderId;
                                                    if (!orderId) return null;
                                                    return (
                                                <OrderCard
                                                    key={orderId}
                                                    data={item}
                                                    action={
                                                        <Button
                                                            className="bg-secondary text-white font-medium shadow-sm h-8"
                                                            size="sm"
                                                            onPress={() => router.push(`/dashboard/orders/${String(orderId)}`)}
                                                        >
                                                            Manage
                                                        </Button>
                                                    }
                                                />
                                                    );
                                                })()
                                            ))}
                                    </div>

                                    {ordersData.filter((item: any) => selectedTab === "All" || item.status === selectedTab).length === 0 && (
                                        <div className="text-center py-20 text-default-400 font-medium">
                                            No orders found in this stage.
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>
                    );
                }}
            </QueryComponent>
        </section>
    );
}
