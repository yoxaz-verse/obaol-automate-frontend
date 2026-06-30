import { humanizeStatus } from "@/utils/terminology";

const statusStyles: Record<string, string> = {
  APPROVED: "bg-success-500/15 text-success-700 dark:text-success-400",
  COMPLETED: "bg-success-500/15 text-success-700 dark:text-success-400",
  PENDING: "bg-warning-500/15 text-warning-700 dark:text-warning-400",
  IN_PROGRESS: "bg-primary-500/15 text-primary-700 dark:text-primary-400",
  REJECTED: "bg-danger-500/15 text-danger-700 dark:text-danger-400",
  FAILED: "bg-danger-500/15 text-danger-700 dark:text-danger-400",
  BLOCKED: "bg-danger-500/15 text-danger-700 dark:text-danger-400",
};

export default function StatusBadge({ status }: { status: unknown }) {
  const normalized = String(status || "UNKNOWN").toUpperCase();
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[normalized] || "bg-default-100 text-default-600"}`}>{humanizeStatus(normalized)}</span>;
}
