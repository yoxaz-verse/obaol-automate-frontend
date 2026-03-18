import React from "react";
import { Card, CardBody, CardFooter, CardHeader, Button, Divider } from "@heroui/react";
import { FiPhone, FiArrowRight, FiPackage, FiUser, FiClock } from "react-icons/fi";
import EnquiryStatus from "./EnquiryStatus";
import { motion } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";

interface EnquiryCardProps {
    data: any;
    action?: React.ReactNode;
    onCardClick?: () => void;
}

const EnquiryCard: React.FC<EnquiryCardProps> = ({ data, action, onCardClick }) => {
    const { convertRate } = useCurrency();
    // Extract data safely
    const productName = data.product || 'Unknown Product';
    const clientName = data.counterparty;
    const companyName = data.associateCompany;
    const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' }) : "Recent";
    const status = data.status || "New";
    const quantity = data.quantity ? `${data.quantity} Ton` : null;
    // Filter out 'N/A' variant as it is meaningless
    const variantName = (data.productVariant && data.productVariant !== "N/A") ? data.productVariant : "";

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
            <Card className="h-full bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-default-200/50 dark:border-slate-800/80 shadow-none overflow-hidden group">
                {/* Visual Accent Top Bar */}
                <div
                    className="h-1.5 w-full bg-gradient-to-r"
                    style={{
                    backgroundImage: `linear-gradient(to right, ${data.dateColor === 'success' ? '#22c55e, #10b981' :
                            data.dateColor === 'warning' ? '#f59e0b, #fbbf24' :
                                data.dateColor === 'primary' ? '#06b6d4, #3b82f6' :
                                    '#64748b, #94a3b8'})`
                    }}
                />

                {/* Recently Opened / New Indicator Dot */}
                {data.dateColor === 'success' && (
                    <div className="absolute top-4 right-4 z-20 flex items-center justify-center">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        </span>
                    </div>
                )}

                <CardHeader className="flex flex-col items-start pb-0 px-3 sm:px-4 pt-4 space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between w-full items-start gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm ${data.type === "Buying"
                                    ? "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-200 border border-primary-300/60 dark:border-primary-400/40"
                                    : data.type === "Selling"
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-400/40"
                                        : "bg-default-100 text-default-700 dark:bg-default-700/30 dark:text-default-100 border border-default-300/60 dark:border-default-400/30"
                                    }`}>
                                    {data.type === "Buying" ? "PURCHASE" : data.type === "Selling" ? "SALE" : "MEDIATED"}
                                </span>
                                <div className="sm:hidden flex items-center gap-1 text-[10px] font-black text-default-600 dark:text-default-200 uppercase tracking-widest bg-default-100 dark:bg-default-700/40 px-2 py-0.5 rounded border border-default-200 dark:border-default-500/30">
                                    <FiClock size={10} />
                                    {date}
                                </div>
                            </div>
                            <h4 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                                {productName}
                            </h4>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                {quantity && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-md bg-warning/10 flex items-center justify-center text-warning-600">
                                            <FiPackage size={10} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{quantity}</span>
                                    </div>
                                )}
                                {variantName && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-default-400" />
                                        <span className="text-xs font-bold text-default-600 dark:text-slate-300 uppercase tracking-wider truncate max-w-[120px]">{variantName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="flex items-center gap-1 text-[10px] font-black text-default-600 dark:text-default-200 uppercase tracking-widest bg-default-100 dark:bg-default-700/40 px-2 py-0.5 rounded border border-default-200 dark:border-default-500/30">
                                <FiClock size={10} />
                                {date}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="px-4 py-4 space-y-4">
                    {/* Client Identity Section */}
                    {clientName && (
                        <div className="flex flex-col space-y-0.5">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <FiUser size={14} />
                                </div>
                                <p className="text-sm font-black text-slate-700 dark:text-slate-200 antialiased">{clientName}</p>
                            </div>
                            {companyName && <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-8 uppercase tracking-wide">{companyName}</p>}
                        </div>
                    )}

                    {/* Value Module */}
                    <div className="bg-gradient-to-br from-default-100/50 to-transparent p-3 rounded-xl border border-default-200/50">
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1.5">Indicative Rate</span>
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                            <span className="text-sm font-black text-success-600 dark:text-success-400 tabular-nums">
                                {(() => {
                                    if (data.isAdmin) {
                                        const base = data.rate || 0;
                                        const adminComm = data.adminCommission || 0;
                                        const mediatorComm = data.mediatorCommission || 0;
                                        return (
                                            <>
                                                {convertRate(base + adminComm + mediatorComm)}
                                                <span className="text-[10px] font-bold text-default-400 ml-1">/KG</span>
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            {convertRate(data.rate || 0)}
                                            <span className="text-[10px] font-bold text-default-400 ml-1">/KG</span>
                                        </>
                                    );
                                })()}
                            </span>

                            {data.isAdmin && (
                                <div className="flex items-center gap-1.5 sm:ml-2">
                                    {data.adminCommission !== undefined && (
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded leading-none tracking-tight">
                                            OBAOL: {convertRate(data.adminCommission)}
                                        </span>
                                    )}
                                    {data.mediatorCommission !== undefined && data.type === "Mediated" && (
                                        <span className="text-[8px] font-bold opacity-80 text-slate-400 dark:text-slate-500 bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded leading-none tracking-tighter">
                                            Med.: {convertRate(data.mediatorCommission)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Handling Insight */}
                    <div className="flex flex-col space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-0.5">Assigned To</span>
                                <span className="text-primary-600 dark:text-primary-300 font-bold text-sm truncate">{data.assignedOperator || "OBAOL Desk"}</span>
                            </div>
                            {!data.isAdmin && clientName && (
                                <div className="flex flex-col sm:items-end min-w-0 flex-1">
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-0.5 sm:text-right">{data.counterpartyLabel}</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-bold sm:text-right text-xs line-clamp-1">{clientName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardBody>

                <CardFooter className="px-4 pb-3 pt-0 flex flex-col items-stretch gap-2">
                    {/* Call buttons for Admin, or Contact button for associates */}
                    {data.isAdmin ? (
                        <div className="flex flex-row items-center gap-2">
                            <Button
                                size="sm"
                                variant="flat"
                                color="secondary"
                                className="flex-1 font-bold text-[10px] tracking-widest uppercase py-4 rounded-lg hover:bg-secondary hover:text-white transition-all shadow-none"
                                onClick={(e) => e.stopPropagation()}
                                onPress={() => window.location.href = `tel:${data.supplierPhone}`}
                            >
                                <FiPhone size={14} className="flex-shrink-0" /> <span className="truncate">Supplier</span>
                            </Button>
                            <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                className="flex-1 font-bold text-[10px] tracking-widest uppercase py-4 rounded-lg hover:bg-primary hover:text-white transition-all shadow-none"
                                onClick={(e) => e.stopPropagation()}
                                onPress={() => window.location.href = `tel:${data.buyerPhone}`}
                            >
                                <FiPhone size={14} className="flex-shrink-0" /> <span className="truncate">Buyer</span>
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            className="font-bold text-[10px] tracking-widest uppercase py-4 rounded-lg hover:bg-primary hover:text-white transition-all shadow-none w-full"
                            onClick={(e) => e.stopPropagation()}
                            onPress={() => window.location.href = `tel:${data.operatorPhone}`}
                        >
                            <FiPhone size={14} className="flex-shrink-0" /> Contact
                        </Button>
                    )}
                    {/* Status + Action row */}
                    <div className="flex justify-between items-center">
                        <EnquiryStatus status={status} />
                        <div
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            {action}
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default EnquiryCard;
