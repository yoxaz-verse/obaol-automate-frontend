import React from "react";
import type { EnquiryPendingParty } from "@/utils/enquiryCardStatus";

interface EnquiryStatusProps {
    stageLabel: string;
    responsibilityLabel?: string | null;
    pendingParty?: EnquiryPendingParty;
    terminalState?: "CONVERTED" | "COMPLETED" | "CANCELLED" | null;
}

const EnquiryStatus: React.FC<EnquiryStatusProps> = ({
    stageLabel,
    responsibilityLabel,
    pendingParty,
    terminalState,
}) => {
    const color = terminalState === "COMPLETED"
        ? "#22c55e"
        : terminalState === "CANCELLED"
            ? "#ef4444"
            : terminalState === "CONVERTED"
                ? "#6366f1"
                : pendingParty === "SELLER"
                    ? "#d69e2e"
                    : "#06b6d4";

    return (
        <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2">
                <div
                    className={`w-2 h-2 rounded-full ${terminalState ? "" : "animate-pulse"}`}
                    style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                />
                <span
                    className="text-[11px] font-bold tracking-wider"
                    style={{ color }}
                >
                    {stageLabel}
                </span>
            </div>
            {responsibilityLabel && (
                <span className="text-[9px] font-black tracking-widest db-muted pl-4">
                    {responsibilityLabel}
                </span>
            )}
        </div>
    );
};

export default EnquiryStatus;
