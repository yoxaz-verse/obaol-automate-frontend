import React from "react";
import { Card, CardBody, CardFooter, CardHeader, Avatar, Button } from "@heroui/react";
import { FiTruck, FiCalendar, FiBox, FiPhoneCall } from "react-icons/fi";
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
    const vehicleNo = data.logistics?.vehicleNo || "NO VEHICLE INFO";
    const transportCompany = data.logistics?.transportCompany || "In-house";
    const isNew = data.createdAt ? (Date.now() - new Date(data.createdAt).getTime() < 86400000) : false;

    // Dynamic coloring based on status priority
    const isCompleted = String(status).toLowerCase().includes("complete");
    const isTransit = String(status).toLowerCase().includes("transit") || String(status).toLowerCase().includes("loaded");

    const getStatusGradients = () => {
        if (isCompleted) return "from-success-500/5 via-transparent to-transparent border-success-500/30";
        if (isTransit) return "from-warning-500/10 via-warning-500/5 to-transparent border-warning-500/40";
        return "from-default-100/50 via-transparent to-transparent border-default-200/50";
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full cursor-pointer h-full"
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
            <Card
                className={`h-full bg-content1/80 backdrop-blur-3xl overflow-hidden group rounded-[2rem] border transition-all duration-500 hover:shadow-2xl ${isTransit ? "hover:shadow-warning-500/10 hover:border-warning-500/50" : "hover:border-default-400"
                    } ${getStatusGradients().split(" ")[3]}`}
            >
                {/* Visual Accent Glow (Background) */}
                <div className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-br ${getStatusGradients()} opacity-70 pointer-events-none`} />

                {/* Recently Opened / New Indicator Dot */}
                {isNew && (
                    <div className="absolute top-5 right-5 z-20 flex items-center justify-center">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        </span>
                    </div>
                )}

                <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between w-full items-start gap-4">
                        <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="text-xl font-black text-foreground uppercase tracking-tighter leading-none group-hover:text-warning-500 transition-colors truncate">
                                    {product}
                                </h4>
                            </div>
                            <span className="text-[10px] font-black text-default-400 uppercase tracking-[0.2em] truncate block">
                                {variant}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-default-100/50 px-3 py-1.5 rounded-xl border border-default-200 uppercase whitespace-nowrap self-start shadow-sm mt-0.5">
                            <FiCalendar size={12} className="text-warning-500" />
                            <span className="text-[10px] font-black text-foreground tracking-widest">{date}</span>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="px-6 py-4 space-y-6">
                    {/* Entity Identity Profile */}
                    <div className="flex items-center gap-4 bg-default-50/50 p-3 rounded-2xl border border-divider">
                        <Avatar
                            radius="md"
                            size="md"
                            name={clientName[0]}
                            className="bg-warning-500/10 text-warning-600 font-black border border-warning-500/20 shadow-inner"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-foreground uppercase tracking-tight leading-tight truncate">{clientName}</p>
                            <p className="text-[9px] font-black text-default-400 uppercase tracking-[0.15em] opacity-80 mt-0.5 truncate">{company}</p>
                        </div>
                    </div>

                    {/* Logistics Manifest Box */}
                    <div className="bg-background/40 p-3.5 rounded-2xl border border-divider flex flex-col gap-3 relative overflow-hidden group/logistics">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-default-200 to-transparent group-hover/logistics:from-warning-400 opacity-50 transition-colors" />

                        <div className="flex items-center justify-between gap-3 text-foreground pl-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <FiTruck size={14} className="text-default-400 group-hover/logistics:text-warning-500 transition-colors shrink-0" />
                                <span className={`text-[11px] font-black uppercase tracking-widest truncate ${vehicleNo.includes("NO VEHICLE") ? "text-default-300" : "text-foreground"}`}>
                                    {vehicleNo}
                                </span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-divider/60" />

                        <div className="flex items-center justify-between gap-3 text-default-500 pl-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <FiBox size={14} className="opacity-60 shrink-0" />
                                <span className="text-[10px] font-bold tracking-widest uppercase truncate">{transportCompany}</span>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info Array */}
                    <div className="flex flex-col gap-2 bg-default-50/30 rounded-2xl p-3.5 border border-divider">
                        <div className="text-[9px] text-default-400 uppercase font-black tracking-[0.2em]">Procurement Owner</div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
                            <span className="text-[11px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                {procurementOwner}
                            </span>
                        </div>
                    </div>
                </CardBody>

                <CardFooter className="px-6 py-5 flex flex-col bg-default-50/50 border-t border-divider gap-5">
                    {/* Visual Status Progress */}
                    <div className="w-full">
                        <OrderStatus status={status} />
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between w-full h-10 gap-3">
                        <Button
                            isIconOnly
                            variant="flat"
                            color="default"
                            className="rounded-xl w-12 h-10 bg-default-200/50 hover:bg-warning-500 hover:text-white transition-all text-default-500"
                            onClick={(e) => {
                                e.stopPropagation();
                                // Open phone dialer
                            }}
                        >
                            <FiPhoneCall size={16} />
                        </Button>
                        <div className="flex-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
                            {action}
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default OrderCard;
