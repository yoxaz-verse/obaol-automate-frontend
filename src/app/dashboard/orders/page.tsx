"use client";

import React, { useEffect } from "react";
import { Button } from "@heroui/react";
import { Tabs, Tab } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import Title from "@/components/titles";
import QueryComponent from "@/components/queryComponent";
import { apiRoutes } from "@/core/api/apiRoutes";
import { deleteData, patchData, postData } from "@/core/api/apiHandler";
import OrderCard from "@/components/dashboard/orders/OrderCard";
import AuthContext from "@/context/AuthContext";
import { useSoundEffect } from "@/context/SoundContext";
import { showToastMessage } from "@/utils/utils";

export default function OrdersPage() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = React.useState<string>("All");
    const [navigatingId, setNavigatingId] = React.useState<string | null>(null);
    const [demoLoading, setDemoLoading] = React.useState(false);
    const [demoClearing, setDemoClearing] = React.useState(false);
    const { user } = React.useContext(AuthContext);
    const { play } = useSoundEffect();
    const roleLower = String(user?.role || "").toLowerCase();
    const isOperatorUser = roleLower === "operator" || roleLower === "team";
    const canUseDemo = roleLower === "admin";

    useEffect(() => {
        patchData(apiRoutes.notifications.markSectionRead("orders"), {}).catch(() => { });
    }, []);

    return (
        <section className="">
            <Title title="Orders & Logistics" />

            <QueryComponent
                api={apiRoutes.orders.getAll}
                queryKey={["orders"]}
                page={1}
                limit={50}
            >
                {(orderResponse: any, refetch) => {
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
                    const scopedOrders = ordersData.filter((item: any) => {
                        if (!isOperatorUser) return true;
                        const assignedOperatorId = (
                            item?.enquiry?.assignedOperatorId?._id ||
                            item?.enquiry?.assignedOperatorId ||
                            ""
                        ).toString();
                        return Boolean(user?.id && assignedOperatorId === String(user.id));
                    });

                    return (
                        <div className="flex flex-col items-center w-full">
                            <div className="w-full px-2 sm:px-4 md:px-0 md:w-[95%]">
                                {canUseDemo && (
                                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-default-200/40 bg-content1 px-4 py-3">
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">Admin Demo Preview</div>
                                            <div className="text-xs text-default-500">
                                                Create realistic demo orders to test flows without creating enquiries.
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-secondary text-white"
                                                isLoading={demoLoading}
                                                onPress={async () => {
                                                    setDemoLoading(true);
                                                    try {
                                                        await postData(apiRoutes.demo.orders, {});
                                                        showToastMessage({
                                                            type: "success",
                                                            message: "Demo orders loaded.",
                                                            position: "top-right",
                                                        });
                                                        refetch?.();
                                                    } catch (error: any) {
                                                        showToastMessage({
                                                            type: "error",
                                                            message: error?.response?.data?.message || "Unable to load demo orders.",
                                                            position: "top-right",
                                                        });
                                                    } finally {
                                                        setDemoLoading(false);
                                                    }
                                                }}
                                            >
                                                Load Demo Orders
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="bordered"
                                                className="border-default-300 text-default-500"
                                                isLoading={demoClearing}
                                                onPress={async () => {
                                                    setDemoClearing(true);
                                                    try {
                                                        await deleteData(apiRoutes.demo.orders);
                                                        showToastMessage({
                                                            type: "success",
                                                            message: "Demo orders cleared.",
                                                            position: "top-right",
                                                        });
                                                        refetch?.();
                                                    } catch (error: any) {
                                                        showToastMessage({
                                                            type: "error",
                                                            message: error?.response?.data?.message || "Unable to clear demo orders.",
                                                            position: "top-right",
                                                        });
                                                    } finally {
                                                        setDemoClearing(false);
                                                    }
                                                }}
                                            >
                                                Clear Demo Orders
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {/* Status Tabs */}
                                <div className="flex justify-between items-center mb-6 overflow-x-auto no-scrollbar touch-pan-x pb-2">
                                    <Tabs
                                        aria-label="Order Stages"
                                        color="secondary"
                                        variant="underlined"
                                        selectedKey={selectedTab}
                                        onSelectionChange={(key) => setSelectedTab(key as string)}
                                        classNames={{
                                            tabList: "gap-4 sm:gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                            cursor: "w-full bg-secondary h-[3px]",
                                            tab: "max-w-fit px-0 h-10",
                                            tabContent: "group-data-[selected=true]:text-secondary font-black uppercase tracking-widest text-[11px]"
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
                                            .filter((item: any) => {
                                                if (!isOperatorUser) return true;
                                                const assignedOperatorId = (
                                                    item?.enquiry?.assignedOperatorId?._id ||
                                                    item?.enquiry?.assignedOperatorId ||
                                                    ""
                                                ).toString();
                                                return Boolean(user?.id && assignedOperatorId === String(user.id));
                                            })
                                            .map((item: any) => (
                                                (() => {
                                                    const orderId = item?._id || item?.id || item?.orderId;
                                                    if (!orderId) return null;
                                                    return (
                                                        <OrderCard
                                                            key={orderId}
                                                            data={item}
                                                            onCardClick={() => {
                                                                play("nav");
                                                                setNavigatingId(String(orderId));
                                                                router.push(`/dashboard/orders/${String(orderId)}`);
                                                            }}
                                                            action={
                                                                <Button
                                                                    className="bg-secondary text-white font-semibold shadow-md h-8 min-w-[96px] px-4 border border-secondary-600/60"
                                                                    size="sm"
                                                                    isLoading={navigatingId === String(orderId)}
                                                                    onPress={() => {
                                                                        play("nav");
                                                                        setNavigatingId(String(orderId));
                                                                        router.push(`/dashboard/orders/${String(orderId)}`);
                                                                    }}
                                                                >
                                                                    {navigatingId === String(orderId) ? "" : "Manage"}
                                                                </Button>
                                                            }
                                                        />
                                                    );
                                                })()
                                            ))}
                                    </div>

                                    {scopedOrders.filter((item: any) => selectedTab === "All" || item.status === selectedTab).length === 0 && (
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
