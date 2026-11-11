export type EnquiryPendingParty = "BUYER" | "SELLER" | "BOTH" | "EITHER" | null;
export type EnquiryViewerRole = "BUYER" | "SELLER" | "OTHER";

export interface EnquiryWorkflowSummary {
    pendingParty?: EnquiryPendingParty;
    requiredActions?: string[];
    completedActions?: string[];
    pendingActions?: string[];
    isSatisfied?: boolean;
    hasWorkflowRule?: boolean;
}

export interface EnquiryCardStatusInput {
    status?: unknown;
    workflowStage?: unknown;
    sellerAcceptedAt?: unknown;
    buyerConfirmedAt?: unknown;
    viewerRole?: EnquiryViewerRole;
    workflowSummary?: EnquiryWorkflowSummary | null;
}

export interface EnquiryCardStatusView {
    stageLabel: string;
    responsibilityLabel: string | null;
    pendingParty: EnquiryPendingParty;
    terminalState: "CONVERTED" | "COMPLETED" | "CANCELLED" | null;
}

export const getEnquiryPendingOwnerLabel = (
    pendingParty: EnquiryPendingParty,
    viewerRole: EnquiryViewerRole = "OTHER"
): string | null => {
    if (!pendingParty) return null;

    const ownerLabel = pendingParty === "BUYER"
        ? "Buyer"
        : pendingParty === "SELLER"
            ? "Supplier"
            : pendingParty === "BOTH"
                ? "Buyer and Supplier"
                : "Buyer or Supplier";
    const isViewerResponsible = pendingParty === viewerRole ||
        (pendingParty === "BOTH" && ["BUYER", "SELLER"].includes(viewerRole)) ||
        (pendingParty === "EITHER" && ["BUYER", "SELLER"].includes(viewerRole));

    return `${ownerLabel}${isViewerResponsible ? " (You)" : ""}`;
};

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
    workflowSummary,
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

    const hasWorkflowRule = Boolean(workflowSummary?.hasWorkflowRule);
    const pendingParty: EnquiryPendingParty = hasWorkflowRule
        ? (workflowSummary?.isSatisfied ? null : workflowSummary?.pendingParty || null)
        : !sellerAcceptedAt
            ? "SELLER"
            : !buyerConfirmedAt
                ? "BUYER"
                : null;

    const ownerLabel = getEnquiryPendingOwnerLabel(pendingParty, viewerRole);
    const responsibilityLabel = ownerLabel ? `Action required from ${ownerLabel}` : null;

    return {
        stageLabel: humanizeStage(workflowStage),
        responsibilityLabel,
        pendingParty,
        terminalState: null,
    };
};

