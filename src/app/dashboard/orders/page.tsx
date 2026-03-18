"use client";

import React, { useEffect } from "react";
import { Button } from "@heroui/react";
import { Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Divider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import Title from "@/components/titles";
import QueryComponent from "@/components/queryComponent";
import { apiRoutes } from "@/core/api/apiRoutes";
import { deleteData, patchData, postData } from "@/core/api/apiHandler";
import { FiMessageSquare, FiPlusCircle, FiCheckCircle, FiPhone, FiUser, FiPackage, FiInfo, FiArrowRight, FiList, FiX } from "react-icons/fi";
import { LuPlus, LuShoppingBag, LuBookOpen } from "react-icons/lu";
import OrderCard from "@/components/dashboard/orders/OrderCard";
import AuthContext from "@/context/AuthContext";
import { useSoundEffect } from "@/context/SoundContext";
import { showToastMessage } from "@/utils/utils";

export default function OrdersPage() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = React.useState<string>("All");
    const [scopeTab, setScopeTab] = React.useState<"internal" | "external">("internal");
    const [navigatingId, setNavigatingId] = React.useState<string | null>(null);
    const [demoLoading, setDemoLoading] = React.useState(false);
    const [demoClearing, setDemoClearing] = React.useState(false);
    const [externalOpen, setExternalOpen] = React.useState(false);
    const [externalLoading, setExternalLoading] = React.useState(false);
    const [externalForm, setExternalForm] = React.useState({
        buyerName: "",
        buyerEmail: "",
        buyerPhone: "",
        sellerName: "",
        sellerEmail: "",
        sellerPhone: "",
        productName: "",
        productVariant: "",
        quantity: "",
        unit: "MT",
        tradeType: "DOMESTIC",
    });
    const [createOrderOpen, setCreateOrderOpen] = React.useState(false);
    const { user } = React.useContext(AuthContext);
    const { play } = useSoundEffect();
    const roleLower = String(user?.role || "").toLowerCase();
    const isOperatorUser = roleLower === "operator" || roleLower === "team";
    const canUseDemo = roleLower === "admin";
    const canCreateExternal = roleLower === "admin" || roleLower === "operator" || roleLower === "team" || roleLower === "associate";
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
                        if (item?.isExternal) return true;
                        const assignedOperatorId = (
                            item?.enquiry?.assignedOperatorId?._id ||
                            item?.enquiry?.assignedOperatorId ||
                            ""
                        ).toString();
                        return Boolean(user?.id && assignedOperatorId === String(user.id));
                    });

                    const filteredByScope = ordersData.filter((item: any) => scopeTab === "external"
                        ? Boolean(item?.isExternal)
                        : !item?.isExternal);
                    const scopedFiltered = filteredByScope.filter((item: any) => {
                        if (!isOperatorUser) return true;
                        if (item?.isExternal) return true;
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
                                                color="secondary"
                                                variant="underlined"
                                                selectedKey={scopeTab}
                                                onSelectionChange={(key) => {
                                                    setScopeTab(key as "internal" | "external");
                                                    setSelectedTab("All");
                                                }}
                                                classNames={{
                                                    tabList: "gap-4 sm:gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                                    cursor: "w-full bg-warning h-[3px]",
                                                    tab: "max-w-fit px-0 h-10",
                                                    tabContent: "group-data-[selected=true]:text-warning font-black uppercase tracking-widest text-[11px]"
                                                }}
                                            >
                                                <Tab key="internal" title="Internal Orders" />
                                                <Tab key="external" title="External Orders" />
                                            </Tabs>
                                            <div className="flex gap-2">
                                                {canCreateInternal && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-primary text-white font-black px-4 shadow-lg shadow-primary/20"
                                                        startContent={<LuPlus size={18} />}
                                                        onPress={() => setCreateOrderOpen(true)}
                                                    >
                                                        Create Order
                                                    </Button>
                                                )}
                                                {scopeTab === "external" && canCreateExternal && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-warning text-white"
                                                        onPress={() => setExternalOpen(true)}
                                                    >
                                                        Create External Order
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <Tabs
                                            aria-label="Order Stages"
                                            color="secondary"
                                            variant="underlined"
                                            selectedKey={selectedTab}
                                            onSelectionChange={(key) => setSelectedTab(key as string)}
                                            classNames={{
                                                tabList: "gap-4 sm:gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                                cursor: "w-full bg-warning h-[3px]",
                                                tab: "max-w-fit px-0 h-10",
                                                tabContent: "group-data-[selected=true]:text-warning font-black uppercase tracking-widest text-[11px]"
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
                                                                    className="bg-warning text-white font-semibold shadow-md h-8 min-w-[96px] px-4 border border-warning-600/60"
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

                                    {scopedFiltered.filter((item: any) => selectedTab === "All" || item.status === selectedTab).length === 0 && (
                                        <div className="text-center py-20 text-default-400 font-medium">
                                            No orders found in this stage.
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
                                                    <div className="p-3 bg-primary/20 text-primary rounded-xl group-hover:scale-110 transition-transform">
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
                                                    <div className="p-3 bg-warning/20 text-warning rounded-xl group-hover:scale-110 transition-transform">
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
                                                        Select a product → Create Enquiry → Negotiate & Finalize → Order Generated
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

                            <Modal isOpen={externalOpen} onOpenChange={setExternalOpen} size="2xl" backdrop="blur">
                                <ModalContent className="bg-gradient-to-br from-background to-content1 border border-divider">
                                    {(onClose) => (
                                        <>
                                            <ModalHeader className="px-6 pt-6">
                                                <h3 className="text-xl font-black tracking-tight">Create External Order</h3>
                                            </ModalHeader>
                                            <ModalBody className="gap-4 px-6 py-2">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-3">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-default-400">Buyer Information</span>
                                                        <Input label="Name" size="sm" variant="bordered" value={externalForm.buyerName} onValueChange={(v) => setExternalForm({ ...externalForm, buyerName: v })} />
                                                        <Input label="Email" size="sm" variant="bordered" value={externalForm.buyerEmail} onValueChange={(v) => setExternalForm({ ...externalForm, buyerEmail: v })} />
                                                        <Input label="Phone" size="sm" variant="bordered" value={externalForm.buyerPhone} onValueChange={(v) => setExternalForm({ ...externalForm, buyerPhone: v })} />
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-default-400">Seller Information</span>
                                                        <Input label="Name" size="sm" variant="bordered" value={externalForm.sellerName} onValueChange={(v) => setExternalForm({ ...externalForm, sellerName: v })} />
                                                        <Input label="Email" size="sm" variant="bordered" value={externalForm.sellerEmail} onValueChange={(v) => setExternalForm({ ...externalForm, sellerEmail: v })} />
                                                        <Input label="Phone" size="sm" variant="bordered" value={externalForm.sellerPhone} onValueChange={(v) => setExternalForm({ ...externalForm, sellerPhone: v })} />
                                                    </div>
                                                </div>
                                                <Divider className="my-2" />
                                                <div className="flex flex-col gap-3">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-default-400">Product Details</span>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <Input label="Product Name" size="sm" variant="bordered" value={externalForm.productName} onValueChange={(v) => setExternalForm({ ...externalForm, productName: v })} />
                                                        <Input label="Variant" size="sm" variant="bordered" value={externalForm.productVariant} onValueChange={(v) => setExternalForm({ ...externalForm, productVariant: v })} />
                                                        <Input label="Quantity" size="sm" variant="bordered" value={externalForm.quantity} onValueChange={(v) => setExternalForm({ ...externalForm, quantity: v })} />
                                                        <Input label="Unit" size="sm" variant="bordered" value={externalForm.unit} onValueChange={(v) => setExternalForm({ ...externalForm, unit: v })} />
                                                        <Select
                                                            label="Trade Type"
                                                            size="sm"
                                                            variant="bordered"
                                                            selectedKeys={[externalForm.tradeType]}
                                                            onSelectionChange={(keys) => {
                                                                const arr = Array.from(keys as Set<string>);
                                                                setExternalForm({ ...externalForm, tradeType: String(arr[0] || "DOMESTIC") });
                                                            }}
                                                        >
                                                            <SelectItem key="DOMESTIC" value="DOMESTIC">Domestic</SelectItem>
                                                            <SelectItem key="INTERNATIONAL" value="INTERNATIONAL">International</SelectItem>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </ModalBody>
                                            <ModalFooter className="px-6 pb-6 pt-4">
                                                <Button variant="light" onPress={onClose} className="font-bold">Cancel</Button>
                                                <Button
                                                    className="bg-warning text-white font-black px-6 shadow-lg shadow-warning/20"
                                                    isLoading={externalLoading}
                                                    onPress={async () => {
                                                        if (externalLoading) return;
                                                        if (!externalForm.buyerName || !externalForm.sellerName || !externalForm.productName || !externalForm.tradeType) {
                                                            showToastMessage({
                                                                type: "error",
                                                                message: "Buyer, seller, product, and trade type are required.",
                                                                position: "top-right",
                                                            });
                                                            return;
                                                        }
                                                        setExternalLoading(true);
                                                        try {
                                                            await postData(apiRoutes.orders.createExternal, {
                                                                externalTradeType: externalForm.tradeType,
                                                                externalBuyer: {
                                                                    name: externalForm.buyerName,
                                                                    email: externalForm.buyerEmail,
                                                                    phone: externalForm.buyerPhone,
                                                                },
                                                                externalSeller: {
                                                                    name: externalForm.sellerName,
                                                                    email: externalForm.sellerEmail,
                                                                    phone: externalForm.sellerPhone,
                                                                },
                                                                externalProduct: {
                                                                    name: externalForm.productName,
                                                                    variant: externalForm.productVariant,
                                                                    quantity: externalForm.quantity ? Number(externalForm.quantity) : null,
                                                                    unit: externalForm.unit,
                                                                },
                                                            });
                                                            showToastMessage({
                                                                type: "success",
                                                                message: "External order created.",
                                                                position: "top-right",
                                                            });
                                                            refetch?.();
                                                            setExternalOpen(false);
                                                        } catch (error: any) {
                                                            showToastMessage({
                                                                type: "error",
                                                                message: error?.response?.data?.message || "Unable to create external order.",
                                                                position: "top-right",
                                                            });
                                                        } finally {
                                                            setExternalLoading(false);
                                                        }
                                                    }}
                                                >
                                                    Create Order
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
