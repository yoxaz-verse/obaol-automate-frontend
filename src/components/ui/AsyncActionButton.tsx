"use client";

import type { ReactNode } from "react";
import AppButton, { type AppButtonProps } from "./AppButton";

export type AsyncActionState = "idle" | "validating" | "processing" | "success" | "error";

export type AsyncActionLabels = {
  idle: ReactNode;
  validating?: ReactNode;
  processing: ReactNode;
  success: ReactNode;
  error: ReactNode;
};

export interface AsyncActionButtonProps extends Omit<AppButtonProps, "children" | "isLoading"> {
  state: AsyncActionState;
  labels: AsyncActionLabels;
}

export const actionLabel = (state: AsyncActionState, labels: AsyncActionLabels) => {
  if (state === "validating") return labels.validating ?? labels.processing;
  return labels[state];
};

export default function AsyncActionButton({ state, labels, isDisabled, className = "", ...props }: AsyncActionButtonProps) {
  const pending = state === "validating" || state === "processing";
  const label = actionLabel(state, labels);
  return (
    <AppButton
      {...props}
      className={`min-w-[12rem] whitespace-normal text-center sm:min-w-[14rem] ${className}`.trim()}
      isDisabled={Boolean(isDisabled) || pending || state === "success"}
      isLoading={pending}
      aria-busy={pending}
      data-action-state={state}
    >
      <span aria-hidden={pending ? true : undefined}>{label}</span>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {typeof label === "string" ? label : "Action status updated"}
      </span>
    </AppButton>
  );
}
