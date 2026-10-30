export type EnquiryPendingParty = "BUYER" | "SELLER" | null;
export type EnquiryViewerRole = "BUYER" | "SELLER" | "OTHER";

export interface EnquiryCardStatusInput {
    status?: unknown;
    workflowStage?: unknown;
    sellerAcceptedAt?: unknown;
    buyerConfirmedAt?: unknown;
    viewerRole?: EnquiryViewerRole;
}

export interface EnquiryCardStatusView {
    stageLabel: string;
    responsibilityLabel: string | null;
    pendingParty: EnquiryPendingParty;
    terminalState: "CONVERTED" | "COMPLETED" | "CANCELLED" | null;
}

const humanizeStage = (value: unknown) => {
    const stage = String(value || "").trim();
    if (!stage) return "Enquiry Created";
    return stage
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const getEnquiryCardStatus = ({
    status,
    workflowStage,
    sellerAcceptedAt,
    buyerConfirmedAt,
    viewerRole = "OTHER",
}: EnquiryCardStatusInput): EnquiryCardStatusView => {
    const normalizedStatus = String(
        typeof status === "string" ? status : (status as any)?.name || ""
    ).trim().toUpperCase();

    const terminalState = normalizedStatus === "CANCELLED"
        ? "CANCELLED"
        : ["COMPLETED", "CLOSED", "SUCCEEDED"].includes(normalizedStatus)
            ? "COMPLETED"
            : normalizedStatus === "CONVERTED"
                ? "CONVERTED"
                : null;

    if (terminalState) {
        const terminalLabels = {
            CONVERTED: "Converted",
            COMPLETED: "Completed",
            CANCELLED: "Cancelled",
        } as const;
        return {
            stageLabel: terminalLabels[terminalState],
            responsibilityLabel: null,
            pendingParty: null,
            terminalState,
        };
    }

    const pendingParty: EnquiryPendingParty = !sellerAcceptedAt
        ? "SELLER"
        : !buyerConfirmedAt
            ? "BUYER"
            : null;

    const isViewerResponsible = pendingParty === viewerRole;
    const responsibilityLabel = pendingParty
        ? isViewerResponsible
            ? "Your Action Pending"
            : `${pendingParty === "BUYER" ? "Buyer" : "Seller"} Pending`
        : null;

    return {
        stageLabel: humanizeStage(workflowStage),
        responsibilityLabel,
        pendingParty,
        terminalState: null,
    };
};

