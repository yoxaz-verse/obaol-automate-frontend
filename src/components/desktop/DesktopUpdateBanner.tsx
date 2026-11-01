"use client";

import { useEffect, useState } from "react";

type UpdateStatus = {
  state: "idle" | "checking" | "available" | "downloading" | "ready" | "up-to-date" | "error";
  version?: string;
  percent?: number;
  message?: string;
};

export default function DesktopUpdateBanner() {
  const [status, setStatus] = useState<UpdateStatus>({ state: "idle" });
  const [dismissed, setDismissed] = useState(false);
  const desktop = typeof window === "undefined" ? undefined : window.obaolDesktop;

  useEffect(() => {
    const api = window.obaolDesktop;
    if (!api?.onUpdateStatus) return;
    return api.onUpdateStatus((nextStatus) => {
      setStatus(nextStatus);
      if (nextStatus.state === "available") setDismissed(false);
    });
  }, []);

  if (!desktop || dismissed || !["available", "downloading", "ready", "error"].includes(status.state)) {
    return null;
  }

  const isMac = desktop.platform === "darwin";
  const busy = status.state === "downloading";
  const title = status.state === "ready"
    ? `OBAOL Supreme ${status.version ?? "update"} is ready`
    : status.state === "error"
      ? "Desktop update could not be completed"
      : `OBAOL Supreme ${status.version ?? "update"} is available`;
  const detail = busy
    ? `Downloading securely${typeof status.percent === "number" ? ` · ${Math.round(status.percent)}%` : "…"}`
    : status.message ?? (isMac ? "Download the latest macOS installer." : "Install the latest desktop improvements.");
  const actionLabel = status.state === "ready"
    ? "Restart and install"
    : status.state === "error"
      ? "Try again"
      : isMac
        ? "Download update"
        : "Update now";

  const act = () => {
    if (status.state === "ready") void desktop.installUpdate?.();
    else if (status.state === "error") void desktop.checkForUpdates?.();
    else void desktop.downloadUpdate?.();
  };

  return (
    <aside
      aria-live="polite"
      aria-label="Desktop application update"
      className="fixed inset-x-3 top-3 z-[10000] mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-amber-400/35 bg-[#11100e]/95 px-4 py-3 text-white shadow-2xl shadow-black/40 backdrop-blur-md sm:inset-x-6"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-lg text-amber-300" aria-hidden="true">↑</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-zinc-400">{detail}</p>
        {busy && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-amber-400 transition-[width]" style={{ width: `${status.percent ?? 4}%` }} />
          </div>
        )}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={act}
        className="shrink-0 rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-black transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? "Downloading…" : actionLabel}
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss update notification"
        className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-200"
      >
        ×
      </button>
    </aside>
  );
}
