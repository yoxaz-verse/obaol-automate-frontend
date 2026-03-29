"use client";

import React, { useEffect } from "react";
import { Button } from "@heroui/react";
import { Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import Title from "@/components/titles";
import QueryComponent from "@/components/queryComponent";
import { apiRoutes } from "@/core/api/apiRoutes";
import { deleteData, patchData, postData } from "@/core/api/apiHandler";
import { FiMessageSquare, FiCheckCircle, FiPackage, FiArrowRight, FiSearch } from "react-icons/fi";
import { LuPlus, LuShoppingBag, LuBookOpen } from "react-icons/lu";
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
    const [createOrderOpen, setCreateOrderOpen] = React.useState(false);
    const { user } = React.useContext(AuthContext);
    const { play } = useSoundEffect();
    const roleLower = String(user?.role || "").toLowerCase();
    const isOperatorUser = roleLower === "operator" || roleLower === "team";
    const canUseDemo = roleLower === "admin";
    const canCreateInternal = roleLower === "admin" || roleLower === "associate";

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
                    const scopedOrders = ordersData.filter((item: any) => {
                        if (!isOperatorUser) return true;
                        if (item?.isExternal) return true;
                        const assignedOperatorId = (
                            item?.enquiry?.assignedOperatorId?._id ||
                            item?.enquiry?.assignedOperatorId ||
                            ""
                        ).toString();
                        const supplierOperatorId = (
                            item?.enquiry?.supplierOperatorId?._id ||
                            item?.enquiry?.supplierOperatorId ||
                            ""
                        ).toString();
                        const dealCloserOperatorId = (
                            item?.enquiry?.dealCloserOperatorId?._id ||
                            item?.enquiry?.dealCloserOperatorId ||
                            ""
                        ).toString();
                        return Boolean(
                            user?.id &&
                            (assignedOperatorId === String(user.id) ||
                                supplierOperatorId === String(user.id) ||
                                dealCloserOperatorId === String(user.id))
                        );
                    });

                    const scopedFiltered = ordersData.filter((item: any) => {
                        if (item?.isExternal) return false;
                        if (!isOperatorUser) return true;
                        if (item?.isExternal) return true;
                        const assignedOperatorId = (
                            item?.enquiry?.assignedOperatorId?._id ||
                            item?.enquiry?.assignedOperatorId ||
                            ""
                        ).toString();
                        const supplierOperatorId = (
                            item?.enquiry?.supplierOperatorId?._id ||
                            item?.enquiry?.supplierOperatorId ||
                            ""
                        ).toString();
                        const dealCloserOperatorId = (
                            item?.enquiry?.dealCloserOperatorId?._id ||
                            item?.enquiry?.dealCloserOperatorId ||
                            ""
                        ).toString();
                        return Boolean(
                            user?.id &&
                            (assignedOperatorId === String(user.id) ||
                                supplierOperatorId === String(user.id) ||
                                dealCloserOperatorId === String(user.id))
                        );
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
                                                className="bg-warning text-white"
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
                                    <div className="w-full flex flex-col gap-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <Tabs
                                                aria-label="Order Scope"
                                                color="warning"
                                                variant="underlined"
                                                selectedKey="internal"
                                                onSelectionChange={() => setSelectedTab("All")}
                                                classNames={{
                                                    tabList: "gap-8 relative rounded-none p-0 border-b border-divider/40",
                                                    cursor: "bg-warning w-full h-[3px] rounded-t-full shadow-[0_-1px_10px_rgba(255,193,7,0.2)]",
                                                    tab: "max-w-fit px-4 h-14 transition-all duration-300 hover:opacity-100",
                                                    tabContent: "font-semibold uppercase tracking-wider text-[11px] text-default-400 group-data-[selected=true]:text-warning group-data-[selected=true]:scale-105 transition-transform"
                                                }}
                                            >
                                                <Tab key="internal" title="Orders" />
                                            </Tabs>
                                            <div className="flex gap-2">
                                                {canCreateInternal && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-primary text-white font-bold px-4 shadow-md shadow-primary/20 h-9 rounded-xl"
                                                        startContent={<LuPlus size={18} />}
                                                        onPress={() => setCreateOrderOpen(true)}
                                                    >
                                                        Create Order
                                                     </Button>
                                                )}
                                            </div>
                                        </div>
                                        <Tabs
                                            aria-label="Order Stages"
                                            color="warning"
                                            variant="underlined"
                                            selectedKey={selectedTab}
                                            onSelectionChange={(key) => setSelectedTab(key as string)}
                                            classNames={{
                                                tabList: "gap-6 relative rounded-none p-0 border-b border-divider/40",
                                                cursor: "bg-warning w-full h-[2.5px] rounded-t-full",
                                                tab: "max-w-fit px-4 h-10 transition-all duration-300",
                                                tabContent: "font-semibold uppercase tracking-wider text-[10px] text-default-500 group-data-[selected=true]:text-warning"
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
                                </div>

                                <section className="py-2 w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {scopedFiltered
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

                                    {scopedFiltered.filter((item: any) => selectedTab === "All" || item.status === selectedTab).length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-16 px-6 bg-content1/50 rounded-[2.5rem] border border-divider border-dashed max-w-4xl mx-auto w-full group transition-all hover:bg-content1/80">
                                            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                                                <LuShoppingBag size={32} />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black text-foreground mb-2 text-center">Start Your First Trade</h3>
                                            <p className="text-default-500 text-sm max-w-md text-center mb-10 font-medium">
                                                You don't have any orders here yet. Follow our simple verified trade process to get started.
                                            </p>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 w-full mb-12 relative">
                                                {[
                                                    { icon: <FiSearch size={18} />, label: "Discover", sub: "Marketplace" },
                                                    { icon: <FiMessageSquare size={18} />, label: "Enquiry", sub: "Price Quote" },
                                                    { icon: <FiPackage size={18} />, label: "Finalize", sub: "Trade Terms" },
                                                    { icon: <FiCheckCircle size={18} />, label: "Execute", sub: "Order Live" }
                                                ].map((step, idx) => (
                                                    <div key={idx} className="flex flex-col items-center gap-3 relative z-10">
                                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-default-100 flex items-center justify-center text-default-400 border border-divider transition-all duration-300 group-hover:border-primary/50 group-hover:text-primary shadow-sm">
                                                            {step.icon}
                                                        </div>
                                                        <div className="flex flex-col items-center text-center">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground leading-tight">{step.label}</span>
                                                            <span className="text-[9px] text-default-400 font-bold uppercase tracking-tight mt-0.5">{step.sub}</span>
                                                        </div>
                                                        {idx < 3 && (
                                                            <div className="hidden sm:block absolute top-6 left-[calc(50%+30px)] w-[calc(100%-60px)] h-[2px] bg-gradient-to-r from-divider to-transparent" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <Button
                                                color="primary"
                                                className="font-bold px-10 h-11 rounded-xl shadow-lg shadow-primary/20 text-sm tracking-wide hover:scale-105 active:scale-95 transition-all"
                                                onPress={() => router.push("/dashboard/marketplace")}
                                                endContent={<FiArrowRight className="ml-1" />}
                                            >
                                                Explore Marketplace
                                            </Button>
                                        </div>
                                    )}
                                </section>
                            </div>
                            {/* Create Order Source Selection Modal */}
                            <Modal isOpen={createOrderOpen} onOpenChange={setCreateOrderOpen} size="lg" backdrop="blur">
                                <ModalContent className="bg-gradient-to-br from-background to-content1 border border-divider">
                                    {(onClose) => (
                                        <>
                                            <ModalHeader className="flex flex-col gap-1 pt-6 px-6">
                                                <h3 className="text-xl font-black tracking-tight">Create New Order</h3>
                                                <p className="text-xs text-default-400 font-bold uppercase tracking-widest mt-0.5">Find a product to get started</p>
                                            </ModalHeader>
                                            <ModalBody className="py-6 px-6 gap-4">
                                                <div
                                                    className="group p-4 bg-default-100/50 hover:bg-primary/10 rounded-2xl border border-divider/50 hover:border-primary/30 cursor-pointer transition-all duration-300 flex items-center gap-4 shadow-sm"
                                                    onClick={() => {
                                                        router.push("/dashboard/marketplace");
                                                        onClose();
                                                    }}
                                                >
                                                    <div className="p-3 bg-primary/20 text-primary rounded-xl group-hover:scale-105 transition-transform">
                                                        <LuShoppingBag size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-foreground">Marketplace</h4>
                                                        <p className="text-xs text-default-500">Browse all verified global products and suppliers</p>
                                                    </div>
                                                    <FiArrowRight size={18} className="text-default-300 group-hover:text-primary transition-colors" />
                                                </div>

                                                <div
                                                    className="group p-4 bg-default-100/50 hover:bg-warning/10 rounded-2xl border border-divider/50 hover:border-warning/30 cursor-pointer transition-all duration-300 flex items-center gap-4 shadow-sm"
                                                    onClick={() => {
                                                        router.push("/dashboard/catalog");
                                                        onClose();
                                                    }}
                                                >
                                                    <div className="p-3 bg-warning/20 text-warning rounded-xl group-hover:scale-105 transition-transform">
                                                        <LuBookOpen size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-foreground">My Catalog</h4>
                                                        <p className="text-xs text-default-500">Select from products you have already added</p>
                                                    </div>
                                                    <FiArrowRight size={18} className="text-default-300 group-hover:text-warning transition-colors" />
                                                </div>

                                                <div className="mt-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                                                    <p className="text-[10px] text-primary-600 font-medium leading-relaxed">
                                                        <span className="font-bold uppercase tracking-wide mr-1">Process Flow:</span>
                                                        Select a product → Create Enquiry → Finalize Terms → Order Generated
                                                    </p>
                                                </div>
                                            </ModalBody>
                                            <ModalFooter className="pb-6 px-6">
                                                <Button variant="light" onPress={onClose} className="font-bold">
                                                    Maybe Later
                                                </Button>
                                            </ModalFooter>
                                        </>
                                    )}
                                </ModalContent>
                            </Modal>

                        </div>
                    );
                }}
            </QueryComponent>

        </section>
    );
}
