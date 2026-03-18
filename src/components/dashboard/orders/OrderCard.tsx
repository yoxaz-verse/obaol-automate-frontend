import React from "react";
import { Card, CardBody, CardFooter, CardHeader, Avatar, Button, Divider } from "@heroui/react";
import { FiTruck, FiCalendar, FiBox, FiPhone } from "react-icons/fi";
import OrderStatus from "./OrderStatus";
import { motion } from "framer-motion";

interface OrderCardProps {
    data: any;
    action?: React.ReactNode;
    onCardClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ data, action, onCardClick }) => {
    const ownerLabelMap: Record<string, string> = {
        buyer: "Buyer",
        seller: "Supplier",
        obaol: "OBAOL Team",
    };
    // Extract data safely
    const isExternal = Boolean(data.isExternal);
    const product =
        (isExternal && data.externalProduct?.name) ||
        data.enquiry?.variantRateId?.productVariant?.product?.name ||
        data.enquiry?.productVariant?.product?.name ||
        data.enquiry?.productId?.name ||
        data.enquiry?.product?.name ||
        data.productVariant?.product?.name ||
        data.product?.name ||
        "Product";
    const variant =
        (isExternal && data.externalProduct?.variant) ||
        data.enquiry?.variantRateId?.productVariant?.name ||
        data.enquiry?.productVariant?.name ||
        data.productVariant?.name ||
        data.enquiry?.variantName ||
        data.variantName ||
        "Variant";
    const clientName = data.enquiry?.name || "Client";
    const company = data.enquiry?.associateCompany?.name || "Direct";
    const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' }) : "Recent";
    const status = data.status || "Procuring";
    const procurementOwner = ownerLabelMap[data.responsibilities?.procurementBy] || "Not set";
    const vehicleNo = data.logistics?.vehicleNo || "No Vehicle Info";
    const transportCompany = data.logistics?.transportCompany || "In-house";
    const isNew = data.createdAt ? (Date.now() - new Date(data.createdAt).getTime() < 86400000) : false;

    // Dynamic color for the accent bar based on status
    const getAccentColor = (s: string) => {
        const norm = s?.toLowerCase() || "";
        if (norm.includes("complete")) return "bg-success";
        if (norm.includes("cancel")) return "bg-danger";
        if (norm.includes("transit") || norm.includes("loaded")) return "bg-warning";
        return "bg-primary";
    };

    return (
        <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => onCardClick?.()}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onCardClick?.();
                }
            }}
        >
            <Card className="h-full bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-lg overflow-hidden group">
                {/* Visual Accent Top Bar */}
                <div className={`h-1.5 w-full ${getAccentColor(status)} shadow-sm opacity-80`} />

                {/* Recently Opened / New Indicator Dot */}
                {isNew && (
                    <div className="absolute top-4 right-4 z-20 flex items-center justify-center">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        </span>
                    </div>
                )}

                <CardHeader className="flex flex-col items-start pb-0 px-4 pt-4 space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between w-full items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight truncate group-hover:text-warning transition-colors">
                                    {product}
                                </h4>
                            </div>
                            <span className="text-[10px] font-bold text-default-500 uppercase tracking-widest truncate block">
                                {variant}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] bg-warning-100 text-warning-800 dark:bg-warning-500/10 dark:text-warning-400 px-2.5 py-1 rounded-md font-bold border border-warning-300/40 dark:border-warning-500/30 uppercase tracking-tighter whitespace-nowrap self-start shadow-sm">
                            <FiCalendar size={12} className="opacity-70" />
                            {date}
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="px-4 py-4 space-y-4">
                    {/* Client Identity */}
                    <div className="flex items-center gap-3">
                        <Avatar
                            radius="full"
                            size="sm"
                            name={clientName[0]}
                            className="bg-warning-50 text-warning-600 font-black border border-warning-100 shadow-sm"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight truncate">{clientName}</p>
                            <p className="text-[10px] font-semibold text-default-400 uppercase tracking-wider truncate">{company}</p>
                        </div>
                    </div>

                    {/* Logistics Module */}
                    <div className="bg-gradient-to-br from-default-100/60 to-transparent p-3 rounded-xl border border-default-200/60 space-y-2">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <div className="w-6 h-6 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                                <FiTruck size={14} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-wide truncate">{vehicleNo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-default-500">
                            <div className="w-6 h-6 rounded-lg bg-default-200/50 flex items-center justify-center">
                                <FiBox size={14} />
                            </div>
                            <span className="text-[11px] font-bold italic truncate">{transportCompany}</span>
                        </div>
                    </div>

                    {/* Handling Status */}
                    <div className="flex flex-col gap-1.5 pt-1">
                        <span className="text-[10px] text-default-400 uppercase font-black tracking-widest px-0.5">Procurement Owner</span>
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
                            <span className="text-xs font-bold text-warning-600 dark:text-warning-400 flex items-center gap-2">
                                {procurementOwner}
                            </span>
                        </div>
                    </div>
                </CardBody>

                <Divider className="opacity-30" />

                <CardFooter className="px-4 py-3 flex flex-col items-stretch gap-3">
                    <div className="flex flex-wrap items-center w-full gap-3">
                        <div className="min-w-0">
                            <OrderStatus status={status} />
                        </div>
                        <div
                            className="flex items-center gap-2 flex-wrap justify-end ml-auto"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <Button
                                size="sm"
                                isIconOnly
                                variant="flat"
                                color="warning"
                                className="rounded-xl w-9 h-9 bg-warning/10 hover:bg-warning hover:text-white transition-all shadow-sm"
                            >
                                <FiPhone size={16} />
                            </Button>
                            {action}
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default OrderCard;
