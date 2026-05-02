import React from "react";
import { Card, CardBody, CardFooter, CardHeader, Button, Divider } from "@heroui/react";
import { FiPhone, FiArrowRight, FiPackage, FiUser, FiClock, FiShield, FiBriefcase, FiMapPin, FiActivity } from "react-icons/fi";
import EnquiryStatus from "./EnquiryStatus";
import { motion } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";
import AuthContext from "@/context/AuthContext";

interface EnquiryCardProps {
    data: any;
    action?: React.ReactNode;
    onCardClick?: () => void;
}

const EnquiryCard: React.FC<EnquiryCardProps> = ({ data, action, onCardClick }) => {
    const { user } = React.useContext(AuthContext);
    const { convertRate, formatRate } = useCurrency();
    // Extract data safely
    const productName = data.product || 'Unknown Product';
    const clientName = data.counterparty;
    const companyName = data.associateCompany;
    const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' }) : "Recent";
    const status = data.status || "New";
    const quantity = data.quantity ? `${data.quantity} Ton` : null;
    const isImportEnquiry = String(data?.sourceType || "").toUpperCase() === "IMPORT" || Boolean(data?.importListingId);
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
            <Card className="h-full bg-white dark:bg-[#04070f] border border-default-300 dark:border-white/20 shadow-none overflow-hidden group rounded-[2rem] transition-all duration-500 hover:dark:border-warning-500/30">
                <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2 gap-3">
                    <div className="flex flex-row justify-between w-full items-center gap-4">
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full ${
                            data.type === "Buying" ? "bg-warning-500/10 text-warning-600" :
                            data.type === "Selling" ? "bg-emerald-500/10 text-emerald-600" :
                            "bg-orange-500/10 text-orange-600"
                        }`}>
                            {data.type === "Buying" ? "PURCHASE" : data.type === "Selling" ? "SALE" : "MEDIATED"}
                        </span>
                        <div className="flex items-center gap-2 text-default-400">
                           <FiClock size={11} className="opacity-50" />
                           <span className="text-[10px] font-black tracking-widest uppercase">{date}</span>
                        </div>
                    </div>
                    <div className="w-full">
                        <h4 className="text-lg font-black text-foreground tracking-tight group-hover:text-warning-500 transition-colors line-clamp-2">
                            {productName}
                        </h4>
                        {variantName && (
                            <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest mt-1 block opacity-70">
                                {variantName}
                            </span>
                        )}
                    </div>
                </CardHeader>

                <CardBody className="px-6 py-5 flex flex-col gap-6">
                    {/* Identity - Precise & Spaced */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-warning-500/10 border border-warning-500/20 flex items-center justify-center shrink-0">
                            <FiUser size={18} className="text-warning-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h5 className="text-[10px] font-black text-foreground uppercase tracking-wider truncate">
                                {clientName || "Unknown Client"}
                            </h5>
                            <p className="text-[9px] font-bold text-default-400 uppercase tracking-widest truncate mt-0.5">
                                {companyName || "Verified Associate"}
                            </p>
                        </div>
                    </div>

                    {/* Financial Data Block - High Density */}
                    <div className="bg-foreground/[0.03] dark:bg-white/[0.03] border border-divider/40 rounded-2xl p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] font-black uppercase tracking-widest text-default-400">Target Rate</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-black text-foreground tracking-tighter">
                                        {formatRate(data.rate || 0)}
                                    </span>
                                    <span className="text-[8px] font-black text-default-400">/KG</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5 items-end text-right">
                                 <span className="text-[8px] font-black uppercase tracking-widest text-default-400">Mission Volume</span>
                                 <span className="text-xs font-black text-foreground uppercase tracking-tight">
                                    {quantity || "TBD"}
                                 </span>
                            </div>
                        </div>

                        {data.isAdmin && (data.adminCommission !== undefined || (data.mediatorCommission !== undefined && data.type === "Mediated")) && (
                            <div className="flex flex-wrap gap-2 pt-3 border-t border-divider/50">
                                {data.adminCommission !== undefined && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-warning-500/10 border border-warning-500/20">
                                        <span className="text-[7px] font-black text-warning-600 uppercase">OBAOL</span>
                                        <span className="text-[9px] font-black text-warning-700">+{formatRate(data.adminCommission)}</span>
                                    </div>
                                )}
                                {data.mediatorCommission !== undefined && data.type === "Mediated" && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <span className="text-[7px] font-black text-emerald-600 uppercase">MED</span>
                                        <span className="text-[9px] font-black text-emerald-700">+{formatRate(data.mediatorCommission)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-black text-default-400 uppercase tracking-[0.15em] px-1">
                        <div className="flex items-center gap-2.5">
                             <FiMapPin size={12} className="text-warning-500/60" />
                             <span>{data.portName || "Pending Port"}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                             <FiBriefcase size={12} className="text-warning-500/60" />
                             <span className="opacity-80">{data.assignedOperator}</span>
                        </div>
                    </div>
                </CardBody>

                <CardFooter className="px-6 pb-6 pt-0 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex flex-1 gap-2.5">
                            {data.isAdmin ? (
                                <>
                                    <Button
                                        variant="flat"
                                        className="flex-1 font-black text-[9px] tracking-widest h-10 rounded-xl bg-default-100 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/20 border border-transparent transition-all uppercase"
                                        onPress={(e) => { e.stopPropagation(); window.location.href = `tel:${data.supplierPhone}`; }}
                                    >
                                        Supplier
                                    </Button>
                                    <Button
                                        variant="flat"
                                        className="flex-1 font-black text-[9px] tracking-widest h-10 rounded-xl bg-default-100 hover:bg-warning-500/10 hover:text-warning-600 hover:border-warning-500/20 border border-transparent transition-all uppercase"
                                        onPress={(e) => { e.stopPropagation(); window.location.href = `tel:${data.buyerPhone}`; }}
                                    >
                                        Buyer
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="flat"
                                    className="w-full font-black text-[9px] tracking-widest h-10 rounded-xl bg-default-100 hover:bg-warning-500/10 hover:text-warning-600 hover:border-warning-500/20 border border-transparent transition-all uppercase"
                                    onPress={(e) => { e.stopPropagation(); window.location.href = `tel:${data.operatorPhone}`; }}
                                >
                                    View Enquiry Details
                                </Button>
                            )}
                        </div>
                        <div onClick={(e) => e.stopPropagation()} className="shrink-0">{action}</div>
                    </div>
                    <div className="flex justify-start items-center gap-4 px-4 py-2.5 bg-foreground/[0.03] dark:bg-white/[0.03] rounded-2xl border border-divider/20 transition-all group-hover:border-warning-500/20">
                        <EnquiryStatus status={status} />
                        <FiActivity className="text-default-200 group-hover:text-warning-500 transition-colors ml-auto opacity-30 group-hover:opacity-100" size={12} />
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default EnquiryCard;
