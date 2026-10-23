'use client'
import ErrorState from "@/components/ui/ErrorState";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center p-6"><ErrorState title="Something went wrong" message="The page could not be displayed. Retry without losing your current session." onRetry={reset} /></main>
  )
}
