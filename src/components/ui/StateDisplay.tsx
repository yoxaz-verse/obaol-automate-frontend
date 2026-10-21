import type { ReactNode } from "react";

export type StateDisplayVariant = "empty" | "error" | "loading";

export type StateDisplayProps = {
  title: string;
  description?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
  onRetry?: () => void;
  variant?: StateDisplayVariant;
  className?: string;
  compact?: boolean;
};

const join = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

const toneClasses: Record<StateDisplayVariant, string> = {
  empty: "border-default-200 bg-content1 text-obaol-600 dark:text-obaol-300",
  error: "border-danger-500/20 bg-danger-500/5 text-danger-600 dark:text-danger-400",
  loading: "border-default-200 bg-content1 text-obaol-600 dark:text-obaol-300",
};

export default function StateDisplay({
  title,
  description,
  message,
  icon,
  action,
  onRetry,
  variant = "empty",
  className,
  compact = false,
}: StateDisplayProps) {
  const detail = description ?? message;

  return (
    <section
      aria-live={variant === "loading" ? "polite" : undefined}
      aria-busy={variant === "loading" ? true : undefined}
      role={variant === "error" ? "alert" : "status"}
      className={join(
        "flex w-full flex-col items-center justify-center rounded-2xl border px-5 text-center",
        compact ? "py-8" : "py-12",
        toneClasses[variant],
        className,
      )}
    >
      {icon ? (
        <div className={join(
          "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-current/20 bg-current/5",
          variant === "loading" && "motion-safe:animate-pulse",
        )}>
          {icon}
        </div>
      ) : null}
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {detail ? <p className="mt-2 max-w-xl text-sm leading-6 text-default-500">{detail}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 min-h-11 rounded-xl bg-danger-500 px-5 py-2 text-sm font-bold text-white outline-none transition hover:bg-danger-600 focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      ) : null}
    </section>
  );
}
