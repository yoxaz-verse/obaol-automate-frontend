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
    const { convertRate } = useCurrency();
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

                <CardBody className="px-6 py-4 space-y-5">
                    {/* Identity Section - Minimalist */}
                    <div className="flex items-start gap-4">
                        <div className="mt-1 text-warning-500/40 shrink-0">
                            <FiUser size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-foreground uppercase tracking-tight line-clamp-1">
                                {clientName || "Unknown Client"}
                            </p>
                            <p className="text-[10px] font-bold text-default-400 uppercase tracking-widest line-clamp-1 mt-0.5">
                                {companyName || "Verified Associate"}
                            </p>
                        </div>
                    </div>

                    <Divider className="opacity-50" />

                    {/* Financial Section - Compact with Commissions */}
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[8px] font-black uppercase tracking-widest text-default-400">Target Rate</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-foreground tracking-tighter tabular-nums">
                                        {convertRate(data.rate || 0)}
                                    </span>
                                    <span className="text-[8px] font-black text-default-400">/KG</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 items-end text-right">
                                 <span className="text-[8px] font-black uppercase tracking-widest text-default-400">Volume</span>
                                 <span className="text-xs font-black text-foreground uppercase tracking-tighter">
                                    {quantity || "TBD"}
                                 </span>
                            </div>
                        </div>

                        {data.isAdmin && (data.adminCommission !== undefined || (data.mediatorCommission !== undefined && data.type === "Mediated")) && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-divider/40">
                                {data.adminCommission !== undefined && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-warning-500/10 border border-warning-500/20">
                                        <span className="text-[7px] font-black text-warning-600 uppercase">OBAOL:</span>
                                        <span className="text-[9px] font-black text-warning-700">+{convertRate(data.adminCommission)}</span>
                                    </div>
                                )}
                                {data.mediatorCommission !== undefined && data.type === "Mediated" && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                        <span className="text-[7px] font-black text-emerald-600 uppercase">MED:</span>
                                        <span className="text-[9px] font-black text-emerald-700">+{convertRate(data.mediatorCommission)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-start gap-8 text-[9px] font-bold text-default-400 uppercase tracking-widest pt-1">
                        <div className="flex items-center gap-2">
                             <FiMapPin size={12} className="text-warning-500/50" />
                             <span>{data.portName || "Pending Port"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <FiBriefcase size={12} className="text-default-300" />
                             <span>{data.assignedOperator}</span>
                        </div>
                    </div>
                </CardBody>

                <CardFooter className="px-6 pb-6 pt-2 flex flex-col gap-4">
                    <div className="flex gap-2.5">
                        {data.isAdmin ? (
                            <>
                                <Button
                                    variant="flat"
                                    className="flex-1 font-black text-[9px] tracking-widest h-10 rounded-xl bg-default-100 hover:bg-secondary hover:text-white transition-all uppercase"
                                    onPress={() => window.location.href = `tel:${data.supplierPhone}`}
                                >
                                    Supplier
                                </Button>
                                <Button
                                    variant="flat"
                                    className="flex-1 font-black text-[9px] tracking-widest h-10 rounded-xl bg-default-100 hover:bg-warning-500 hover:text-white transition-all uppercase"
                                    onPress={() => window.location.href = `tel:${data.buyerPhone}`}
                                >
                                    Buyer
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="flat"
                                className="w-full font-black text-[9px] tracking-widest h-10 rounded-xl bg-default-100 hover:bg-warning-500 hover:text-white transition-all uppercase"
                                onPress={() => window.location.href = `tel:${data.operatorPhone}`}
                            >
                                Contact Desk
                            </Button>
                        )}
                        <div onClick={(e) => e.stopPropagation()}>{action}</div>
                    </div>
                    <div className="flex justify-start items-center gap-4 px-4 py-3 bg-default-50/50 dark:bg-default-100/5 rounded-2xl border border-divider/20 transition-all group-hover:border-warning-500/20">
                        <EnquiryStatus status={status} />
                        <FiActivity className="text-default-200 group-hover:text-warning-500 transition-colors ml-auto opacity-30 group-hover:opacity-100" size={12} />
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default EnquiryCard;
