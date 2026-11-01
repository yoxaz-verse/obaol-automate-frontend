"use client";

import { useEffect, useState } from "react";
import { FiRefreshCw, FiWifiOff } from "react-icons/fi";
import { usePwaRuntime } from "@/context/PwaRuntimeContext";

export default function PwaRuntime() {
  const { isOnline, updateAvailable, activateUpdate } = usePwaRuntime();
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
      {!isOnline && <div data-offline-banner className="fixed inset-x-3 top-3 z-[10001] mx-auto flex min-h-12 max-w-xl items-center gap-3 rounded-2xl bg-brand-abyssal px-4 py-3 text-sm font-semibold text-white shadow-2xl safe-top"><FiWifiOff className="shrink-0" /><span>You’re offline. Reconnect to load live workspace data.</span></div>}
      {showOnline && <div className="fixed inset-x-3 top-3 z-[10001] mx-auto max-w-sm rounded-2xl bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-2xl safe-top">Back online. Live data is available.</div>}
      {updateAvailable && <div className="fixed bottom-[calc(1rem+var(--safe-bottom))] left-3 right-3 z-[10001] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-obaol-500/25 bg-content1 p-3 shadow-2xl"><div className="min-w-0 flex-1"><p className="text-sm font-bold">OBAOL update ready</p><p className="text-xs text-default-500">Refresh to use the latest app version.</p></div><button type="button" onClick={activateUpdate} className="touch-target inline-flex items-center gap-2 rounded-xl bg-obaol-500 px-3 text-sm font-bold text-obaol-950"><FiRefreshCw />Update</button></div>}
    </div>
  );
}
