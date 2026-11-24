"use client";

import { useEffect, useState } from "react";
import { FiDownloadCloud } from "react-icons/fi";

type UpdateStatus = {
  state: "idle" | "checking" | "available" | "downloading" | "ready" | "up-to-date" | "error";
  version?: string;
  percent?: number;
  message?: string;
};

const statusText = (status: UpdateStatus, version: string) => {
  if (status.state === "checking") return "Checking for updates…";
  if (status.state === "available") return `Version ${status.version ?? "new"} is available`;
  if (status.state === "downloading") return `Downloading${typeof status.percent === "number" ? ` · ${Math.round(status.percent)}%` : "…"}`;
  if (status.state === "ready") return `Version ${status.version ?? "new"} is ready to install`;
  if (status.state === "up-to-date") return `Version ${version} is up to date`;
  if (status.state === "error") return status.message ?? "Unable to check for updates";
  return `Installed version ${version}`;
};

export default function DesktopUpdateSettings() {
  const [desktop, setDesktop] = useState<Window["obaolDesktop"]>();
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<UpdateStatus>({ state: "idle" });

  useEffect(() => {
    const api = window.obaolDesktop;
    if (!api) return;
    setDesktop(api);
    void api.getAutoUpdatePreference?.().then(setEnabled).catch(() => {});
    const stopPreferenceListener = api.onAutoUpdatePreferenceChanged?.(setEnabled);
    const stopStatusListener = api.onUpdateStatus?.(setStatus);
    return () => {
      stopPreferenceListener?.();
      stopStatusListener?.();
    };
  }, []);

  if (!desktop) return null;

  const updatePreference = async () => {
    if (!desktop.setAutoUpdatePreference || saving) return;
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    try {
      setEnabled(await desktop.setAutoUpdatePreference(next));
    } catch {
      setEnabled(!next);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-4 flex flex-col gap-4 rounded-2xl border border-obaol-500/25 bg-obaol-500/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-labelledby="desktop-update-title">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-obaol-500/10 text-obaol-700 dark:text-obaol-300">
          <FiDownloadCloud size={21} aria-hidden="true" />
        </div>
        <div>
          <h2 id="desktop-update-title" className="font-semibold text-foreground">Desktop application updates</h2>
          <p className="mt-1 text-sm leading-6 db-muted">
            Download new Windows releases automatically and choose when to restart. macOS updates continue through the installer download.
          </p>
          <p className="mt-2 text-xs font-medium text-default-500" aria-live="polite">
            {statusText(status, desktop.version)}
          </p>
        </div>
      </div>
      <label className="flex shrink-0 cursor-pointer items-center justify-between gap-4 rounded-xl border db-border-subtle bg-content1 px-4 py-3 sm:min-w-52">
        <span className="text-sm font-semibold">Automatically update</span>
        <input
          type="checkbox"
          role="switch"
          aria-label="Automatically update OBAOL Supreme"
          checked={enabled}
          disabled={saving}
          onChange={updatePreference}
          className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-default-300 transition before:block before:h-4 before:w-4 before:translate-x-0.5 before:translate-y-0.5 before:rounded-full before:bg-white before:shadow before:transition checked:bg-obaol-500 checked:before:translate-x-[1.125rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 disabled:cursor-wait disabled:opacity-60"
        />
      </label>
    </section>
  );
}
