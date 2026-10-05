import type { HTMLAttributes, ReactNode } from "react";

const join = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

export function DashboardPage({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={join("dashboard-page", className)} {...props} />;
}

export function DashboardPanel({ className, feature = false, ...props }: HTMLAttributes<HTMLElement> & { feature?: boolean }) {
  return <section className={join("dashboard-panel", feature && "dashboard-feature-panel", className)} {...props} />;
}

export function DashboardSectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={join("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        <h2 className="dashboard-section-title">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 db-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function DashboardField({
  label,
  value,
  emptyValue = "Not provided",
  className,
}: {
  label: string;
  value: ReactNode;
  emptyValue?: string;
  className?: string;
}) {
  const hasValue = value !== null && value !== undefined && value !== "";
  return (
    <div className={join("min-w-0", className)}>
      <dt className="dashboard-label">{label}</dt>
      <dd className={join("dashboard-value mt-1", !hasValue && "db-muted")}>{hasValue ? value : emptyValue}</dd>
    </div>
  );
}

export function DashboardEmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <DashboardPanel className={join("flex flex-col items-center px-5 py-10 text-center", className)}>
      {icon && <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-obaol-500/20 bg-obaol-500/10 text-obaol-600 dark:text-obaol-300">{icon}</div>}
      <h2 className="dashboard-section-title">{title}</h2>
      {description && <p className="mt-2 max-w-xl text-sm leading-6 db-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </DashboardPanel>
  );
}

export function DashboardStatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "success" | "warning" | "danger" }) {
  const tones = {
    neutral: "border-[var(--db-border-subtle)] db-inset db-muted-strong",
    brand: "border-obaol-500/25 bg-obaol-500/10 text-obaol-700 dark:text-obaol-300",
    success: "border-success-500/25 bg-success-500/10 text-success-600 dark:text-success-400",
    warning: "border-warning-500/25 bg-warning-500/10 text-warning-700 dark:text-warning-400",
    danger: "border-danger-500/25 bg-danger-500/10 text-danger-600 dark:text-danger-400",
  };
  return <span className={join("inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}
