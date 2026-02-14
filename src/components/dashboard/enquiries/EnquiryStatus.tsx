import React from "react";
import { Tooltip } from "@heroui/react";

interface EnquiryStatusProps {
    status: string; // e.g., "New", "In Progress", "Quoted", "Completed", "Rejected"
}

const EnquiryStatus: React.FC<EnquiryStatusProps> = ({ status }) => {
    // Map status to colors and progress
    const getStatusConfig = (s: string) => {
        const normalize = s?.toLowerCase() || "unknown";
        if (normalize.includes("new") || normalize.includes("pending"))
            return { color: "#06b6d4", bg: "rgba(6, 182, 212, 0.1)", step: 1, label: "New / Pending" };
        if (normalize.includes("quot") || normalize.includes("progress") || normalize.includes("process"))
            return { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)", step: 1, label: s.includes("quot") ? "Quoted" : "Processing" };
        if (normalize.includes("convert"))
            return { color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.1)", step: 2, label: "Converted" };
        if (normalize.includes("complete") || normalize.includes("order"))
            return { color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)", step: 3, label: "Completed" };
        if (normalize.includes("reject") || normalize.includes("cancel"))
            return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", step: 0, label: "Cancelled" };
        return { color: "#64748b", bg: "rgba(100, 116, 139, 0.1)", step: 0, label: s || "Unknown" };
    };

    const config = getStatusConfig(status);

    return (
        <div className="flex flex-col gap-1.5 min-w-[100px]">
            <div className="flex items-center gap-2">
                <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.color}` }}
                />
                <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: config.color }}
                >
                    {config.label}
                </span>
            </div>

            {/* Visual Progress Bar - 3 Stage Minimalist */}
            {config.step > 0 && (
                <div className="flex gap-1.5 items-center w-full max-w-[80px]">
                    {[1, 2, 3].map((step) => (
                        <div
                            key={step}
                            className="h-1 rounded-full transition-all duration-700 ease-in-out"
                            style={{
                                flex: step <= config.step ? 2 : 1,
                                backgroundColor: step <= config.step ? config.color : "rgba(0,0,0,0.05)",
                                opacity: step <= config.step ? 1 : 0.3
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EnquiryStatus;
