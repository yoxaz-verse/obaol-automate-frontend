import { Chip } from "@nextui-org/react";
import { FiClock } from "react-icons/fi";

const labels: Record<string, string> = {
  PENDING_REVIEW: "Pending Review",
  PUBLISHED: "Published",
  APPROVED: "Approved",
  REJECTED: "Changes Requested",
  ARCHIVED: "Archived",
  DRAFT: "Draft",
};

const tones: Record<string, "success" | "warning" | "danger" | "default"> = {
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  APPROVED: "success",
  REJECTED: "danger",
};

export default function ReviewStatusChip({ status, className = "" }: { status?: string; className?: string }) {
  const value = String(status || "DRAFT").toUpperCase();
  const pending = value === "PENDING_REVIEW";
  return <Chip
    aria-label={`Status: ${labels[value] || value.replaceAll("_", " ")}`}
    className={`${pending ? "border border-warning-400 bg-warning-100 font-bold text-warning-800 shadow-sm dark:bg-warning-900/40 dark:text-warning-200" : ""} ${className}`.trim()}
    color={tones[value] || "default"}
    size={pending ? "md" : "sm"}
    startContent={pending ? <FiClock aria-hidden className="ml-1" /> : undefined}
    variant="flat"
  >
    {labels[value] || value.replaceAll("_", " ")}
  </Chip>;
}
