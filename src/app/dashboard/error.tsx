"use client";
import { useEffect } from "react";
import ErrorState from "@/components/ui/ErrorState";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);
  return <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center p-6"><ErrorState title="This workspace could not be displayed" message="Your data is safe. Retry this section or return to it from the dashboard navigation." onRetry={reset} /></main>;
}
