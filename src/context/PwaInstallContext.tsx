"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallPlatform = "browser" | "ios" | "installed" | "unsupported";

type PwaInstallState = {
  canInstall: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isOnline: boolean;
  platform: InstallPlatform;
  updateAvailable: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "ios" | "unavailable">;
  dismissInstall: () => void;
  activateUpdate: () => void;
};

const DISMISS_KEY = "obaol:pwa-install-dismissed-at";
const DISMISS_COOLDOWN = 7 * 24 * 60 * 60 * 1000;

const PwaInstallContext = createContext<PwaInstallState | null>(null);

function standaloneMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function iosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function PwaInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isDismissed, setIsDismissed] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    setIsStandalone(standaloneMode());
    setIsIOS(iosDevice());
    setIsOnline(navigator.onLine);
    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
    setIsDismissed(Date.now() - dismissedAt < DISMISS_COOLDOWN);

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      window.localStorage.removeItem(DISMISS_KEY);
    };
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
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

  const dismissInstall = useCallback(() => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsDismissed(true);
  }, []);

  const promptInstall = useCallback(async () => {
    if (isStandalone) return "unavailable" as const;
    if (!deferredPrompt) return isIOS ? "ios" as const : "unavailable" as const;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") setDeferredPrompt(null);
    else dismissInstall();
    return choice.outcome;
  }, [deferredPrompt, dismissInstall, isIOS, isStandalone]);

  const activateUpdate = useCallback(() => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
  }, [waitingWorker]);

  const value = useMemo<PwaInstallState>(() => ({
    canInstall: !isStandalone && !isDismissed && (Boolean(deferredPrompt) || isIOS),
    isStandalone,
    isIOS,
    isOnline,
    platform: isStandalone ? "installed" : deferredPrompt ? "browser" : isIOS ? "ios" : "unsupported",
    updateAvailable,
    promptInstall,
    dismissInstall,
    activateUpdate,
  }), [activateUpdate, deferredPrompt, dismissInstall, isDismissed, isIOS, isOnline, isStandalone, promptInstall, updateAvailable]);

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
}

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);
  if (!context) throw new Error("usePwaInstall must be used inside PwaInstallProvider");
  return context;
}
