import React from "react";
import { Card, CardBody, CardFooter, CardHeader, Button, Divider } from "@heroui/react";
import { FiPhone, FiArrowRight, FiPackage, FiUser, FiClock } from "react-icons/fi";
import EnquiryStatus from "./EnquiryStatus";
import { motion } from "framer-motion";

interface EnquiryCardProps {
    data: any;
    action?: React.ReactNode;
}

const EnquiryCard: React.FC<EnquiryCardProps> = ({ data, action }) => {
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
            className="h-full"
        >
            <Card className="h-full bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-lg overflow-hidden group">
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

                <CardHeader className="flex flex-col items-start pb-0 px-4 pt-4 space-y-1">
                    <div className="flex justify-between w-full items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm ${data.type === "Buying"
                                    ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 border border-primary-200/50"
                                    : data.type === "Selling"
                                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/50"
                                        : "bg-default-100 text-default-600 border border-default-200/50"
                                    }`}>
                                    {data.type === "Buying" ? "PURCHASE" : data.type === "Selling" ? "SALE" : "MEDIATED"}
                                </span>
                            </div>
                            <h4 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight tracking-tight group-hover:text-primary transition-colors">
                                {productName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                                        <span className="w-1 h-1 rounded-full bg-default-300" />
                                        <span className="text-xs font-semibold text-default-500 uppercase tracking-wider">{variantName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-[10px] font-black text-default-400 uppercase tracking-widest bg-default-100 px-2 py-0.5 rounded">
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
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 antialiased">{clientName}</p>
                            </div>
                            {companyName && <p className="text-xs font-semibold text-default-400 ml-8">{companyName}</p>}
                        </div>
                    )}

                    {/* Value Module */}
                    <div className="flex flex-wrap gap-4 md:gap-6 bg-gradient-to-br from-default-100/50 to-transparent p-3 rounded-xl border border-default-200/50">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-default-400 uppercase font-black tracking-widest mb-1">Indicative Rate</span>
                            <span className="text-sm font-black text-success-600 dark:text-success-400 tabular-nums">
                                {/*
                                  Admins see base + commissions as net; associates see the already-prepared rate.
                                  Mediators/buyers/sellers should not have commission breakdowns added again here.
                                */}
                                {(() => {
                                    if (data.isAdmin) {
                                        const base = data.rate || 0;
                                        const adminComm = data.adminCommission || 0;
                                        const mediatorComm = data.mediatorCommission || 0;
                                        return (
                                            <>
                                                ₹ {base + adminComm + mediatorComm}
                                                <span className="text-[10px] font-bold text-default-400 ml-1">/KG</span>
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            ₹ {data.rate || 0}
                                            <span className="text-[10px] font-bold text-default-400 ml-1">/KG</span>
                                        </>
                                    );
                                })()}
                            </span>
                        </div>

                        {data.adminCommission !== undefined && data.isAdmin && (
                            <div className="flex flex-col border-l border-default-200/60 pl-4 md:pl-6">
                                <span className="text-[10px] text-default-400 uppercase font-black tracking-widest mb-1">OBAOL Comm.</span>
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">₹ {data.adminCommission}</span>
                            </div>
                        )}

                        {data.mediatorCommission !== undefined && data.type === "Mediated" && data.isAdmin && (
                            <div className="flex flex-col border-l border-default-200/60 pl-4 md:pl-6">
                                <span className="text-[10px] text-default-400 uppercase font-black tracking-widest mb-1">Mediator Comm.</span>
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">₹ {data.mediatorCommission}</span>
                            </div>
                        )}
                    </div>

                    {/* Handling Insight */}
                    <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <span className="text-[10px] text-default-400 uppercase font-black tracking-widest mb-0.5 whitespace-nowrap">Assigned To</span>
                                <span className="text-primary-600 dark:text-primary-400 font-bold text-sm truncate">{data.assignedEmployee || "OBAOL Desk"}</span>
                            </div>
                            {!data.isAdmin && clientName && (
                                <div className="flex flex-col items-end min-w-0">
                                    <span className="text-[10px] text-default-400 uppercase font-black tracking-widest mb-0.5 whitespace-nowrap text-right">{data.counterpartyLabel}</span>
                                    <span className="text-slate-600 dark:text-slate-400 font-bold text-right text-xs line-clamp-1">{clientName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardBody>

                <CardFooter className="px-4 pb-3 pt-0 flex flex-col items-stretch gap-2">
                    {/* Call buttons for Admin, or Contact button for associates */}
                    {data.isAdmin ? (
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="flat"
                                color="secondary"
                                className="flex-1 bg-secondary/10 hover:bg-secondary hover:text-white transition-all shadow-sm font-bold text-[10px] tracking-widest uppercase"
                                onPress={() => window.location.href = `tel:${data.supplierPhone}`}
                            >
                                <FiPhone size={14} /> Supplier
                            </Button>
                            <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                className="flex-1 bg-primary/10 hover:bg-primary hover:text-white transition-all shadow-sm font-bold text-[10px] tracking-widest uppercase"
                                onPress={() => window.location.href = `tel:${data.buyerPhone}`}
                            >
                                <FiPhone size={14} /> Buyer
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            className="bg-primary/10 hover:bg-primary hover:text-white transition-all shadow-sm font-bold text-[10px] tracking-widest uppercase"
                            onPress={() => window.location.href = `tel:${data.employeePhone}`}
                        >
                            <FiPhone size={14} /> Contact
                        </Button>
                    )}
                    {/* Status + Action row */}
                    <div className="flex justify-between items-center">
                        <EnquiryStatus status={status} />
                        {action}
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default EnquiryCard;
