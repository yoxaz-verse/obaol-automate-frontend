"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type PwaRuntimeState = {
  isOnline: boolean;
  updateAvailable: boolean;
  activateUpdate: () => void;
};

const PwaRuntimeContext = createContext<PwaRuntimeState | null>(null);

export function PwaRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let reloading = false;
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((registration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setUpdateAvailable(true);
      }
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(worker);
            setUpdateAvailable(true);
          }
        });
      });
    }).catch(() => {
      // PWA enhancement is best-effort; the web application remains fully usable.
    });
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  const activateUpdate = useCallback(() => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
  }, [waitingWorker]);

  const value = useMemo<PwaRuntimeState>(() => ({
    isOnline,
    updateAvailable,
    activateUpdate,
  }), [activateUpdate, isOnline, updateAvailable]);

  return <PwaRuntimeContext.Provider value={value}>{children}</PwaRuntimeContext.Provider>;
}

export function usePwaRuntime() {
  const context = useContext(PwaRuntimeContext);
  if (!context) throw new Error("usePwaRuntime must be used inside PwaRuntimeProvider");
  return context;
}
