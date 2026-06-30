"use client";

export default function ErrorState({ title = "We could not load this information", message = "Check your connection and try again.", onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-danger-500/20 bg-danger-500/5 p-6 text-center">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm db-muted">{message}</p>
      {onRetry && <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-xl bg-danger-500 px-5 py-2 text-sm font-bold text-white">Try again</button>}
    </div>
  );
}
