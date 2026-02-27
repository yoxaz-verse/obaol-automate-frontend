import React from "react";
import { Card, CardBody, CardFooter, CardHeader, Avatar, Button, Divider } from "@heroui/react";
import { FiTruck, FiCalendar, FiBox, FiPhone } from "react-icons/fi";
import OrderStatus from "./OrderStatus";

interface OrderCardProps {
    data: any;
    action?: React.ReactNode;
}

const OrderCard: React.FC<OrderCardProps> = ({ data, action }) => {
    const ownerLabelMap: Record<string, string> = {
        buyer: "Buyer",
        seller: "Supplier",
        obaol: "OBAOL Team",
    };
    // Extract data safely
    const product = data.enquiry?.productVariant?.product?.name || "Product";
    const variant = data.enquiry?.productVariant?.name || "Variant";
    const customer = data.enquiry?.name || "Customer";
    const company = data.enquiry?.associateCompany?.name || "Direct";
    const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' }) : "Recent";
    const status = data.status || "Procuring";
    const procurementOwner = ownerLabelMap[data.responsibilities?.procurementBy] || "Not set";
    const vehicleNo = data.logistics?.vehicleNo || "No Vehicle Info";
    const transportCompany = data.logistics?.transportCompany || "In-house";

    // Dynamic color for the accent bar based on status
    const getAccentColor = (s: string) => {
        const norm = s?.toLowerCase() || "";
        if (norm.includes("complete")) return "bg-success";
        if (norm.includes("cancel")) return "bg-danger";
        if (norm.includes("transit") || norm.includes("loaded")) return "bg-warning";
        return "bg-primary";
    };

    return (
        <Card className="h-full bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-lg overflow-hidden group">
            {/* Visual Accent Top Bar */}
            <div className={`h-1.5 w-full ${getAccentColor(status)} shadow-sm opacity-80`} />

            <CardHeader className="flex flex-col items-start pb-0 px-4 pt-4 space-y-2">
                <div className="flex flex-col sm:flex-row justify-between w-full items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight truncate group-hover:text-secondary transition-colors">
                                {product}
                            </h4>
                        </div>
                        <span className="text-[10px] font-bold text-default-500 uppercase tracking-widest truncate block">
                            {variant}
                        </span>
                    </div>
                    <div className="text-[10px] bg-secondary-100 text-secondary-700 dark:bg-secondary-500/20 dark:text-secondary-100 px-2.5 py-1 rounded font-black border border-secondary-300/60 dark:border-secondary-400/40 uppercase tracking-tighter whitespace-nowrap self-start">
                        {date}
                    </div>
                </div>
            </CardHeader>

            <CardBody className="px-4 py-4 space-y-4">
                {/* Customer Identity */}
                <div className="flex items-center gap-3">
                    <Avatar
                        radius="full"
                        size="sm"
                        name={customer[0]}
                        className="bg-secondary-50 text-secondary-600 font-black border border-secondary-100 shadow-sm"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight truncate">{customer}</p>
                        <p className="text-[10px] font-semibold text-default-400 uppercase tracking-wider truncate">{company}</p>
                    </div>
                </div>

                {/* Logistics Module */}
                <div className="bg-gradient-to-br from-default-100/60 to-transparent p-3 rounded-xl border border-default-200/60 space-y-2">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
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
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse" />
                        <span className="text-xs font-bold text-secondary-600 dark:text-secondary-400 flex items-center gap-2">
                            {procurementOwner}
                        </span>
                    </div>
                </div>
            </CardBody>

            <Divider className="opacity-30" />

            <CardFooter className="px-4 py-3 flex flex-col items-stretch gap-3">
                <div className="flex justify-between items-center w-full">
                    <OrderStatus status={status} />
                    <div className="flex items-center gap-2 ml-4">
                        <Button
                            size="sm"
                            isIconOnly
                            variant="flat"
                            color="secondary"
                            className="rounded-xl w-9 h-9 bg-secondary/10 hover:bg-secondary hover:text-white transition-all shadow-sm"
                        >
                            <FiPhone size={16} />
                        </Button>
                        {action}
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};

export default OrderCard;
