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
        <div className="flex w-full flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${config.textColor}`}>
                    {config.label}
                </span>
                {config.step > 0 && config.step < 6 && (
                    <span className="rounded-full border border-default-200 bg-content1 px-2 py-1 text-[10px] font-semibold leading-none text-default-500">
                        Stage {config.step} of 6
                    </span>
                )}
            </div>
 
            {config.step > 0 && (
                <div className="relative flex h-1.5 w-full gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                        <div
                            key={step}
                            className={`flex-1 rounded-full transition-all duration-500 ${step <= config.step
                                ? `${config.colorClass} opacity-100`
                                : "bg-default-200/80"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderStatus;
