import React from "react";
import { Card, CardBody, CardFooter, CardHeader, Avatar, Button } from "@heroui/react";
import { LuTruck, LuCalendar, LuBox, LuPhone, LuUser, LuShield, LuBriefcase, LuFileText, LuCheck, LuAward } from "react-icons/lu";
import OrderStatus from "./OrderStatus";
import { motion } from "framer-motion";
import AuthContext from "@/context/AuthContext";

interface OrderCardProps {
    data: any;
    action?: React.ReactNode;
    onCardClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ data, action, onCardClick }) => {
    const { user } = React.useContext(AuthContext);
    const roleLower = String(user?.role || "").toLowerCase();
    const isOperator = roleLower === "admin" || roleLower === "operator" || roleLower === "team";

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

    // Entity Logic
    const buyerName = data.enquiry?.buyerAssociateId?.name || data.enquiry?.buyerName || data.externalBuyer?.name || "Buyer";
    const sellerName = data.enquiry?.sellerAssociateId?.name || data.enquiry?.sellerName || data.externalSeller?.name || "Supplier";
    const buyerCompany = data.enquiry?.buyerAssociateId?.associateCompany?.name || data.enquiry?.buyerAssociateCompanyName || "Direct Buyer";
    const sellerCompany = data.enquiry?.sellerAssociateId?.associateCompany?.name || data.enquiry?.sellerAssociateCompanyName || "Direct Supplier";

    const isBuying = String(data.enquiry?.buyerAssociateId?._id || data.enquiry?.buyerAssociateId) === String(user?.id);
    const isSelling = String(data.enquiry?.sellerAssociateId?._id || data.enquiry?.sellerAssociateId) === String(user?.id);

    const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' }) : "Recent";
    const status = data.status || "Procuring";

    // New informative metrics
    const respCount = Object.values(data.responsibilities || {}).filter(Boolean).length;
    const procurementOwner = ownerLabelMap[data.responsibilities?.procurementBy] || "Not set";

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

                <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2 gap-3">
                    <div className="flex flex-row justify-between w-full items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate tracking-tight">
                                {product}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest bg-foreground/[0.03] px-3 py-1 rounded-lg border border-foreground/5">
                                    {variant}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 self-start shrink-0">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-foreground/5 bg-foreground/[0.02] shadow-sm transition-all hover:bg-primary hover:text-white group/date">
                                <LuCalendar size={12} className="text-primary group-hover/date:text-white" />
                                <span className="text-[10px] font-bold tracking-wider">{date}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="px-6 py-4 space-y-5">
                    {/* Integrated Identity Profile */}
                    <div className="relative p-4 rounded-2xl bg-foreground/[0.01] border border-foreground/5 overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-[0.03]">
                            <LuUser size={40} />
                        </div>
 
                        {isOperator ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                        <span className="text-[10px] font-bold font-mono">B</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[8px] font-bold text-default-400 uppercase tracking-widest mb-0.5 opacity-60">Buyer Assignment</p>
                                        <p className="text-xs font-bold text-foreground truncate">{buyerName}</p>
                                    </div>
                                </div>
                                <div className="h-px bg-foreground/5 w-full" />
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-warning-500/10 flex items-center justify-center text-warning-600 border border-warning-500/20 shrink-0">
                                        <span className="text-[10px] font-bold font-mono">S</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[8px] font-bold text-default-400 uppercase tracking-widest mb-0.5 opacity-60">Seller Assignment</p>
                                        <p className="text-xs font-bold text-foreground truncate">{sellerName}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Avatar radius="lg" size="md" name={isBuying ? sellerName[0] : buyerName[0]} className={`${isBuying ? "bg-warning-500/10 text-warning-600" : "bg-primary/10 text-primary"} font-bold border border-foreground/5 shadow-sm rounded-xl`} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[8px] font-bold text-default-400 uppercase tracking-widest mb-1 opacity-60">Counterparty Node</p>
                                    <p className="text-xs font-bold text-foreground truncate leading-tight">{isBuying ? sellerName : buyerName}</p>
                                    <p className="text-[9px] font-semibold text-default-400 truncate mt-1 opacity-80">{isBuying ? sellerCompany : buyerCompany}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Operational Node Grid */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-foreground text-background flex items-center justify-center">
                                    <LuBriefcase size={10} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Execution Streams</span>
                            </div>
                            <span className="text-[8px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                                {respCount}/4 Operational
                            </span>
                        </div>
 
                        <div className="grid grid-cols-1 gap-2 px-1">
                            {[
                                { key: "procurementBy", label: "Procure", icon: <LuShield size={12} /> },
                                { key: "certificateBy", label: "Certify", icon: <LuAward size={12} /> },
                                { key: "transportBy", label: "Logist", icon: <LuTruck size={12} /> },
                                { key: "packagingBy", label: "Packag", icon: <LuBox size={12} /> },
                            ].map((task) => {
                                const owner = data.responsibilities?.[task.key];
                                return (
                                    <div key={task.key} className="flex items-center justify-between py-2 group/task transition-all border-b border-foreground/5 last:border-0 hover:px-2 hover:bg-foreground/[0.02] rounded-xl px-1">
                                        <div className="flex items-center gap-3">
                                            <div className="text-default-400 group-hover/task:text-primary transition-colors">
                                                {task.icon}
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-default-400 opacity-80 min-w-[50px]">{task.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {owner && <div className="w-1 h-1 rounded-full bg-success-500 animate-pulse" />}
                                            <span className={`text-[9px] font-bold uppercase tracking-wide ${owner ? "text-foreground" : "text-default-300 italic"}`}>
                                                {owner ? (ownerLabelMap[owner] || owner) : "Scheduled"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardBody>

                <CardFooter className="px-6 py-5 flex flex-col bg-foreground/[0.04] border-t border-foreground/5 gap-5">
                    {/* Visual Status Progress */}
                    <div className="w-full">
                        <OrderStatus status={status} />
                    </div>
 
                    {/* Actions Row */}
                    <div className="flex items-center justify-between w-full h-11 gap-4">
                        {isOperator && (
                            <Button
                                isIconOnly
                                variant="bordered"
                                color="default"
                                className="rounded-xl w-14 h-11 border-foreground/10 hover:bg-primary hover:text-white transition-all text-default-400 hover:border-primary shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <LuPhone size={18} />
                            </Button>
                        )}
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
