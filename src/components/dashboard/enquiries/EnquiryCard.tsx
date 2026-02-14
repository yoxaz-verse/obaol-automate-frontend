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
    const productName = data.product || "Unknown Product";
    const variantName = data.productVariant || "";
    const clientName = data.name || "Unknown Client";
    const companyName = data.associateCompany || "Individual Client";
    const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' }) : "Recent";
    const associate = data.productAssociate || "Direct";
    const status = data.status || "New";
    const rate = data.variantRate || "N/A";
    const phone = data.phoneNumber || "No Phone";

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
        >
            <Card className="h-full bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-xl overflow-hidden group">
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

                <CardHeader className="flex flex-col items-start pb-0 px-5 pt-5 space-y-1">
                    <div className="flex justify-between w-full items-start gap-4">
                        <div className="flex-1">
                            <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight tracking-tight group-hover:text-primary transition-colors">
                                {productName}
                            </h4>
                            {variantName && (
                                <div className="flex items-center gap-1.5 mt-1">
                                    <FiPackage size={12} className="text-default-400" />
                                    <span className="text-xs font-bold text-default-500 uppercase tracking-wider">{variantName}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-[10px] font-black text-default-400 uppercase tracking-widest bg-default-100 px-2 py-0.5 rounded">
                                <FiClock size={10} />
                                {date}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="px-5 py-5 space-y-5">
                    {/* Client Identity Section */}
                    <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <FiUser size={14} />
                            </div>
                            <p className="text-md font-extrabold text-slate-700 dark:text-slate-300 antialiased">{clientName}</p>
                        </div>
                        <p className="text-xs font-semibold text-default-400 ml-8">{companyName}</p>
                    </div>

                    {/* Value Module */}
                    <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-default-100/50 to-transparent p-4 rounded-2xl border border-default-200/50">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-default-400 uppercase font-black tracking-widest mb-1">Indicative Rate</span>
                            <span className="text-md font-black text-success-600 dark:text-success-400 tabular-nums">₹ {rate}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-default-400 uppercase font-black tracking-widest mb-1">Contact</span>
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{phone}</span>
                        </div>
                    </div>

                    {/* Handling Insight */}
                    <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <span className="text-[10px] text-default-400 uppercase font-black tracking-widest mb-0.5 whitespace-nowrap">Assigned To</span>
                                <span className="text-primary-600 dark:text-primary-400 font-bold truncate">{data.assignedEmployee || "Not Assigned"}</span>
                            </div>
                            <div className="flex flex-col items-end min-w-0">
                                <span className="text-[10px] text-default-400 uppercase font-black tracking-widest mb-0.5 whitespace-nowrap text-right">Associate</span>
                                <span className="text-slate-600 dark:text-slate-400 font-bold text-right text-xs line-clamp-1">{associate}</span>
                            </div>
                        </div>
                    </div>
                </CardBody>

                <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center gap-2">
                    <EnquiryStatus status={status} />

                    <div className="flex items-center gap-2">
                        <Button
                            isIconOnly
                            variant="flat"
                            color="primary"
                            radius="lg"
                            className="w-10 h-10 min-w-10 bg-primary/10 hover:bg-primary hover:text-white transition-all shadow-sm"
                            onPress={() => window.location.href = `tel:${phone}`}
                        >
                            <FiPhone size={16} />
                        </Button>
                        {action}
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default EnquiryCard;
