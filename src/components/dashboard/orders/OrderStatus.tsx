import React from "react";
import { Chip } from "@heroui/react";

interface OrderStatusProps {
    status: string;
}

const OrderStatus: React.FC<OrderStatusProps> = ({ status }) => {
    const getStatusConfig = (s: string) => {
        const normalize = s?.toLowerCase() || "procuring";
        if (normalize.includes("procuring")) return { color: "primary", step: 1, label: "Procuring" };
        if (normalize.includes("loaded")) return { color: "warning", step: 2, label: "Loaded" };
        if (normalize.includes("transit")) return { color: "secondary", step: 3, label: "In Transit" };
        if (normalize.includes("arrived")) return { color: "success", step: 4, label: "Arrived" };
        if (normalize.includes("unloading")) return { color: "warning", step: 5, label: "Unloading" };
        if (normalize.includes("complete")) return { color: "success", step: 6, label: "Completed" };
        if (normalize.includes("cancel")) return { color: "danger", step: 0, label: "Cancelled" };
        return { color: "default", step: 0, label: s || "Unknown" };
    };

    const config = getStatusConfig(status);

    return (
        <div className="flex flex-col gap-1 min-w-[120px]">
            <div className="flex items-center justify-between">
                <span className={`text-xs font-bold text-${config.color === "default" ? "default-500" : config.color + "-500"}`}>
                    {config.label}
                </span>
            </div>

            {config.step > 0 && (
                <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                        <div
                            key={step}
                            className={`flex-1 rounded-full transition-all duration-500 ${step <= config.step
                                ? `bg-${config.color}-500 shadow-[0_0_8px_rgba(0,0,0,0.2)]`
                                : "bg-default-100"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderStatus;
