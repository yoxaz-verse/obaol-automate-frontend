export type ImportReservationStatus = "PENDING" | "APPROVED" | "LOCKED" | "REJECTED" | "CANCELLED" | "ACCEPTED" | "EXPIRED";

export type ImportReservationPresentation = {
  label: string;
  description: string;
  tone: "warning" | "success" | "neutral" | "danger";
};

const PRESENTATION_BY_STATUS: Record<ImportReservationStatus, ImportReservationPresentation> = {
  PENDING: {
    label: "Pending review",
    description: "The importer is reviewing your reservation request. You can still edit or cancel it.",
    tone: "warning",
  },
  APPROVED: {
    label: "Approved",
    description: "The importer approved this quantity. Lock it to create and continue with an enquiry.",
    tone: "success",
  },
  LOCKED: {
    label: "Enquiry created",
    description: "This reservation is locked and connected to an enquiry.",
    tone: "neutral",
  },
  ACCEPTED: {
    label: "Approved",
    description: "The importer approved this quantity. Lock it to create and continue with an enquiry.",
    tone: "success",
  },
  REJECTED: {
    label: "Not approved",
    description: "The importer did not approve this reservation request. No further action is available.",
    tone: "danger",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "This reservation request was cancelled and is no longer active.",
    tone: "neutral",
  },
  EXPIRED: {
    label: "Expired",
    description: "The importer did not respond within 15 days. This reservation has expired and the quantity has been released.",
    tone: "danger",
  },
};

export const getImportReservationPresentation = (status: unknown): ImportReservationPresentation => {
  const normalized = String(status || "PENDING").toUpperCase() as ImportReservationStatus;
  return PRESENTATION_BY_STATUS[normalized] || PRESENTATION_BY_STATUS.PENDING;
};

export const formatImportReservationDate = (value: unknown) => {
  if (!value) return "Not available";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};
