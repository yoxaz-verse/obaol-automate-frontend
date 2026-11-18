import type { ReactNode } from "react";
import type { AsyncActionState } from "./AsyncActionButton";

export default function ActionFeedback({ state, children, className = "" }: { state: AsyncActionState; children?: ReactNode; className?: string }) {
  if (!children || state === "idle") return null;
  const isError = state === "error";
  const isSuccess = state === "success";
  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      className={`${isError ? "border-danger-300/40 bg-danger-500/10 text-danger-700" : isSuccess ? "border-success-300/40 bg-success-500/10 text-success-700" : "border-default-200 bg-default-100 text-default-600"} rounded-xl border px-3 py-2 text-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}
