import React from "react";
import { motion } from "framer-motion";

interface OrderStatusProps {
    status: string;
}

const OrderStatus: React.FC<OrderStatusProps> = ({ status }) => {
    const getStatusConfig = (s: string) => {
        const normalize = s?.toLowerCase() || "procuring";
        if (normalize.includes("procuring")) return { colorClass: "bg-warning-500", shadowClass: "shadow-[0_0_12px_rgba(245,165,36,0.5)]", textColor: "text-warning-500", step: 1, label: "Procuring" };
        if (normalize.includes("loaded")) return { colorClass: "bg-warning-500", shadowClass: "shadow-[0_0_12px_rgba(245,165,36,0.5)]", textColor: "text-warning-500", step: 2, label: "Loaded" };
        if (normalize.includes("transit")) return { colorClass: "bg-warning-500", shadowClass: "shadow-[0_0_12px_rgba(245,165,36,0.5)]", textColor: "text-warning-500", step: 3, label: "In Transit" };
        if (normalize.includes("arrived")) return { colorClass: "bg-success-500", shadowClass: "shadow-[0_0_12px_rgba(34,197,94,0.5)]", textColor: "text-success-500", step: 4, label: "Arrived" };
        if (normalize.includes("unloading")) return { colorClass: "bg-warning-500", shadowClass: "shadow-[0_0_12px_rgba(245,165,36,0.5)]", textColor: "text-warning-500", step: 5, label: "Unloading" };
        if (normalize.includes("complete")) return { colorClass: "bg-success-500", shadowClass: "shadow-[0_0_12px_rgba(34,197,94,0.5)]", textColor: "text-success-500", step: 6, label: "Completed" };
        if (normalize.includes("cancel")) return { colorClass: "bg-danger-500", shadowClass: "shadow-[0_0_12px_rgba(239,68,68,0.5)]", textColor: "text-danger-500", step: 0, label: "Cancelled" };
        return { colorClass: "bg-default-500", shadowClass: "", textColor: "text-default-500", step: 0, label: s || "Unknown" };
    };

    const config = getStatusConfig(status);

    return (
        <div className="flex flex-col gap-2.5 w-full">
            <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${config.textColor}`}>
                    {config.label}
                </span>
                {config.step > 0 && config.step < 6 && (
                    <span className="text-[9px] font-black text-default-400 uppercase tracking-widest bg-default-100 px-2 py-0.5 rounded-full">
                        {config.step} / 6
                    </span>
                )}
            </div>

            {config.step > 0 && (
                <div className="flex gap-1.5 h-1.5 w-full relative">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                        <div
                            key={step}
                            className={`flex-1 rounded-full transition-all duration-700 ${step <= config.step
                                ? `${config.colorClass} ${config.shadowClass}`
                                : "bg-default-200 dark:bg-default-100/10"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderStatus;
