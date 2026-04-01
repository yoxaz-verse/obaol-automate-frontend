"use client";

import React, { useEffect } from "react";
import { Button } from "@heroui/react";
import { Tabs, Tab } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import Title from "@/components/titles";
import QueryComponent from "@/components/queryComponent";
import { apiRoutes } from "@/core/api/apiRoutes";
import { deleteData, patchData, postData } from "@/core/api/apiHandler";
import { LuPlus, LuShoppingBag, LuBookOpen, LuArrowRight, LuCheck, LuMessageSquare, LuPackage, LuSearch, LuActivity } from "react-icons/lu";
import OrderCard from "@/components/dashboard/orders/OrderCard";
import AuthContext from "@/context/AuthContext";
import { useSoundEffect } from "@/context/SoundContext";
import { showToastMessage } from "@/utils/utils";

export default function ExternalOrdersPage() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = React.useState<string>("All");
    const [navigatingId, setNavigatingId] = React.useState<string | null>(null);
    const [demoLoading, setDemoLoading] = React.useState(false);
    const [demoClearing, setDemoClearing] = React.useState(false);
    const { user } = React.useContext(AuthContext);
    const { play } = useSoundEffect();
    const roleLower = String(user?.role || "").toLowerCase();
    const canUseDemo = roleLower === "admin";
    const canCreateExternal = roleLower === "admin" || roleLower === "operator" || roleLower === "team" || roleLower === "associate";
    const [isRedirecting, setIsRedirecting] = React.useState(false);

    useEffect(() => {
        patchData(apiRoutes.notifications.markSectionRead("orders"), {}).catch(() => { });
    }, []);

    const handleCreateNew = () => {
        play("click");
        setIsRedirecting(true);
        router.push("/dashboard/external-orders/new");
    };

    return (
        <section className="">
            <Title title="External Orders" />

            <QueryComponent
                api={apiRoutes.orders.getAll}
                queryKey={["orders", "external"]}
                page={1}
                limit={20}
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
                    const externalOrders = ordersData.filter((item: any) => Boolean(item?.isExternal));

                    return (
                        <div className="flex flex-col items-center w-full">
                            <div className="w-full px-2 sm:px-4 md:px-0 md:w-[95%]">
                                {canUseDemo && (
                                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-warning/20 bg-warning/5 px-6 py-4 backdrop-blur-3xl shadow-sm">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm font-bold text-warning-700">Admin Resource Emulator</div>
                                            <div className="text-[11px] font-medium text-warning-600/80">
                                                Generate high-fidelity demo clusters to validate execution streams.
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="warning"
                                                className="h-9 rounded-xl font-bold uppercase tracking-wider text-[10px] px-5"
                                                isLoading={demoLoading}
                                                onPress={async () => {
                                                    setDemoLoading(true);
                                                    try {
                                                        await postData(apiRoutes.demo.orders, {});
                                                        showToastMessage({
                                                            type: "success",
                                                            message: "Demo cluster synchronized.",
                                                            position: "top-right",
                                                        });
                                                        refetch?.();
                                                    } catch (error: any) {
                                                        showToastMessage({
                                                            type: "error",
                                                            message: error?.response?.data?.message || "Unable to sync demo cluster.",
                                                            position: "top-right",
                                                        });
                                                    } finally {
                                                        setDemoLoading(false);
                                                    }
                                                }}
                                            >
                                                Initialize Demo
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                color="default"
                                                className="h-9 rounded-xl font-bold uppercase tracking-wider text-[10px] px-5 opacity-60"
                                                isLoading={demoClearing}
                                                onPress={async () => {
                                                    setDemoClearing(true);
                                                    try {
                                                        await deleteData(apiRoutes.demo.orders);
                                                        showToastMessage({
                                                            type: "success",
                                                            message: "Demo cluster purged.",
                                                            position: "top-right",
                                                        });
                                                        refetch?.();
                                                    } catch (error: any) {
                                                        showToastMessage({
                                                            type: "error",
                                                            message: error?.response?.data?.message || "Unable to purge demo cluster.",
                                                            position: "top-right",
                                                        });
                                                    } finally {
                                                        setDemoClearing(false);
                                                    }
                                                }}
                                            >
                                                Purge Stream
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mb-6 overflow-x-auto no-scrollbar touch-pan-x pb-2">
                                    <div className="w-full flex flex-col gap-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <Tabs
                                                aria-label="Order Stages"
                                                color="warning"
                                                variant="underlined"
                                                selectedKey={selectedTab}
                                                onSelectionChange={(key) => setSelectedTab(key as string)}
                                                classNames={{
                                                    tabList: "gap-8 relative rounded-none p-0 border-b border-divider/40",
                                                    cursor: "bg-warning w-full h-[2.5px] rounded-t-full shadow-[0_-1px_10px_rgba(var(--heroui-warning-rgb),0.3)]",
                                                    tab: "max-w-fit px-4 h-11 transition-all duration-300",
                                                    tabContent: "font-bold uppercase tracking-wider text-[11px] text-default-400 group-data-[selected=true]:text-warning"
                                                }}
                                            >
                                                <Tab key="All" title="All Orders" />
                                                <Tab key="Procuring" title="In Procurement" />
                                                <Tab key="Loaded" title="Loaded Hub" />
                                                <Tab key="In Transit" title="In Transit" />
                                                <Tab key="Arrived" title="Terminal Arrival" />
                                                <Tab key="Completed" title="Mission Complete" />
                                            </Tabs>
                                            {canCreateExternal && (
                                                <Button
                                                    size="sm"
                                                    color="warning"
                                                    className="h-11 rounded-xl font-bold uppercase tracking-wider text-[11px] px-6 shadow-xl shadow-warning/20"
                                                    isLoading={isRedirecting}
                                                    onPress={handleCreateNew}
                                                >
                                                    {isRedirecting ? "Initializing..." : "Create External Order"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <section className="py-2 w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {externalOrders
                                            .filter((item: any) => selectedTab === "All" || (String(item?.status || "") === selectedTab))
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
                                                                    className="bg-warning text-white font-semibold shadow-md h-9 min-w-[96px] px-4 rounded-xl"
                                                                    size="sm"
                                                                    isLoading={navigatingId === String(orderId)}
                                                                    onPress={() => {
                                                                        play("nav");
                                                                        setNavigatingId(String(orderId));
                                                                        router.push(`/dashboard/orders/${String(orderId)}`);
                                                                    }}
                                                                >
                                                                    {navigatingId === String(orderId) ? "Managing..." : "Manage Order"}
                                                                </Button>
                                                            }
                                                        />
                                                    );
                                                })()
                                            ))}
                                    </div>

                                    {externalOrders.filter((item: any) => selectedTab === "All" || item.status === selectedTab).length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-20 px-8 bg-foreground/[0.02] backdrop-blur-3xl rounded-[3rem] border border-foreground/5 shadow-sm max-w-5xl mx-auto w-full group transition-all hover:bg-foreground/[0.04]">
                                            <div className="w-20 h-20 bg-warning/10 rounded-[2rem] flex items-center justify-center text-warning mb-8 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                                                <LuShoppingBag size={40} />
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-center tracking-tight">Generate External Mission</h3>
                                            <p className="text-default-500 text-sm max-w-lg text-center mb-12 font-medium leading-relaxed">
                                                External orders enable mission-critical trade execution for outside procurement while maintaining high-fidelity tracking within the core ecosystem.
                                            </p>
 
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6 w-full mb-16 relative">
                                                {[
                                                    { icon: <LuSearch size={22} />, label: "Scoping", sub: "Trade Parameters" },
                                                    { icon: <LuMessageSquare size={22} />, label: "Routing", sub: "Stakeholder Flow" },
                                                    { icon: <LuPackage size={22} />, label: "Execution", sub: "Mission Activation" },
                                                    { icon: <LuCheck size={22} />, label: "Closure", sub: "Final Manifest" }
                                                ].map((step, idx) => (
                                                    <div key={idx} className="flex flex-col items-center gap-4 relative z-10">
                                                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-foreground/[0.05] flex items-center justify-center text-default-400 border border-foreground/5 transition-all duration-300 group-hover:border-warning/40 group-hover:text-warning shadow-sm">
                                                            {step.icon}
                                                        </div>
                                                        <div className="flex flex-col items-center text-center">
                                                            <span className="text-[11px] font-bold uppercase tracking-widest text-foreground leading-tight">{step.label}</span>
                                                            <span className="text-[10px] text-default-400 font-semibold uppercase tracking-tight mt-1 opacity-60">{step.sub}</span>
                                                        </div>
                                                        {idx < 3 && (
                                                            <div className="hidden sm:block absolute top-7 left-[calc(50%+35px)] w-[calc(100%-70px)] h-[1px] bg-gradient-to-r from-foreground/5 to-transparent" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
 
                                            {canCreateExternal && (
                                                <Button
                                                    color="warning"
                                                    className="font-bold px-12 h-14 rounded-2xl shadow-2xl shadow-warning/20 text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all text-black"
                                                    isLoading={isRedirecting}
                                                    onPress={handleCreateNew}
                                                    endContent={!isRedirecting && <LuArrowRight className="ml-2" />}
                                                >
                                                    {isRedirecting ? "Establishing..." : "Initiate External Order"}
                                                </Button>
                                            )}
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
