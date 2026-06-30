export const EXPERIENCE_TERMS = {
  buyer: "Buyer",
  seller: "Seller",
  both: "Buying and selling",
  operator: "Operator",
  enquiry: "Enquiry",
  sample: "Sample request",
  order: "Order",
  assignment: "Assignment",
  approval: "Approval",
  execution: "Trade execution",
} as const;

export const tradeModeLabel = (mode: unknown) => {
  const normalized = String(mode || "BOTH").toUpperCase();
  if (normalized === "BUY") return "Buying";
  if (normalized === "SELL") return "Selling";
  return "Buying and selling";
};

export const humanizeStatus = (status: unknown) => {
  const normalized = String(status || "UNKNOWN").trim().toUpperCase();
  const labels: Record<string, string> = {
    PENDING: "Waiting for review",
    IN_PROGRESS: "In progress",
    APPROVED: "Approved",
    REJECTED: "Needs attention",
    BLOCKED: "Blocked",
    FAILED: "Action failed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return labels[normalized] || normalized.toLowerCase().replace(/_/g, " ").replace(/^./, (value) => value.toUpperCase());
};
