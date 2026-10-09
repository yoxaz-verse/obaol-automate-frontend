"use client";

import { useEffect, useState } from "react";
import { FiDownload, FiRefreshCw, FiShare2, FiWifiOff, FiX } from "react-icons/fi";
import { usePwaInstall } from "@/context/PwaInstallContext";

export function InstallAppButton({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const { canInstall, isIOS, promptInstall } = usePwaInstall();
  const [showIOS, setShowIOS] = useState(false);
  if (!canInstall) return null;
  return (
    <>
      <button
        data-install-app
        type="button"
        onClick={async () => setShowIOS((await promptInstall()) === "ios")}
        className={`touch-target inline-flex items-center justify-center gap-2 rounded-xl border border-obaol-500/30 bg-obaol-500/10 px-3 text-sm font-bold text-obaol-800 transition active:scale-[.98] dark:text-obaol-200 ${className}`}
        aria-label="Install OBAOL app"
      >
        <FiDownload aria-hidden="true" />{compact ? <span className="sr-only">Install app</span> : <span>Install app</span>}
      </button>
      {showIOS && isIOS && (
        <div className="fixed inset-0 z-[10000] flex items-end bg-black/45 p-3 safe-pb sm:items-center sm:justify-center" role="presentation" onClick={() => setShowIOS(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="ios-install-title" onClick={(event) => event.stopPropagation()} className="mobile-sheet w-full rounded-t-[1.75rem] border bg-content1 p-5 shadow-2xl sm:max-w-md sm:rounded-3xl">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-default-300 sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-widest text-obaol-600">Install OBAOL</p><h2 id="ios-install-title" className="mt-1 text-xl font-bold">Add it to your Home Screen</h2></div>
              <button type="button" onClick={() => setShowIOS(false)} className="touch-target grid place-items-center rounded-full bg-default-100" aria-label="Close install instructions"><FiX /></button>
            </div>
            <ol className="mt-5 grid gap-3 text-sm leading-6 text-default-600">
              <li className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-obaol-500/10 text-obaol-700"><FiShare2 /></span><span>Tap Safari’s <strong>Share</strong> button.</span></li>
              <li className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-obaol-500/10 font-black text-obaol-700">+</span><span>Choose <strong>Add to Home Screen</strong>, then confirm Add.</span></li>
            </ol>
          </section>
        </div>
      )}
    </>
  );
}

export default function PwaRuntime() {
  const { isOnline, updateAvailable, activateUpdate } = usePwaInstall();
  const [showOnline, setShowOnline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  useEffect(() => {
    if (!isOnline) setWasOffline(true);
    if (isOnline && wasOffline) {
      setShowOnline(true);
      const timer = window.setTimeout(() => setShowOnline(false), 3500);
      return () => window.clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <div aria-live="polite" aria-atomic="true">
      {!isOnline && <div data-offline-banner className="fixed inset-x-3 top-3 z-[10001] mx-auto flex min-h-12 max-w-xl items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl safe-top"><FiWifiOff className="shrink-0" /><span>You’re offline. Reconnect to load live workspace data.</span></div>}
      {showOnline && <div className="fixed inset-x-3 top-3 z-[10001] mx-auto max-w-sm rounded-2xl bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-2xl safe-top">Back online. Live data is available.</div>}
      {updateAvailable && <div className="fixed bottom-[calc(1rem+var(--safe-bottom))] left-3 right-3 z-[10001] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-obaol-500/25 bg-content1 p-3 shadow-2xl"><div className="min-w-0 flex-1"><p className="text-sm font-bold">OBAOL update ready</p><p className="text-xs text-default-500">Refresh to use the latest app version.</p></div><button type="button" onClick={activateUpdate} className="touch-target inline-flex items-center gap-2 rounded-xl bg-obaol-500 px-3 text-sm font-bold text-obaol-950"><FiRefreshCw />Update</button></div>}
    </div>
  );
}
