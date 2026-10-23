"use client";
import type { ReactNode } from "react";
import { normalizeApiError } from "@/core/api/apiErrors";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";

type QueryStateProps = {
  loading: boolean;
  error?: unknown;
  empty?: boolean;
  onRetry?: () => void;
  loadingTitle?: string;
  errorTitle?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  children: ReactNode;
};

export default function QueryState({ loading, error, empty = false, onRetry, loadingTitle, errorTitle, emptyTitle, emptyMessage, children }: QueryStateProps) {
  if (loading) return <LoadingState title={loadingTitle} />;
  if (error) return <ErrorState title={errorTitle} message={normalizeApiError(error).message} onRetry={onRetry} />;
  if (empty) return <EmptyState title={emptyTitle} message={emptyMessage} />;
  return <>{children}</>;
}
