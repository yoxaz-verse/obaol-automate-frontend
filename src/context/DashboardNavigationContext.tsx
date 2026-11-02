"use client";

import { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type DashboardNavigationContextValue = {
  pendingPath: string | null;
  isNavigating: boolean;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  prefetch: (path: string) => void;
  markContentReady: (path?: string) => void;
};

export type DashboardNavigationTiming = {
  from: string;
  to: string;
  prefetched: boolean;
  startedAt: number;
  routeCommittedAt?: number;
  contentReadyAt?: number;
};

const DashboardNavigationContext = createContext<DashboardNavigationContextValue | null>(null);

const normalizedDestination = (path: string) => {
  if (typeof window === "undefined") return path;
  try {
    const url = new URL(path, window.location.href);
    return `${url.pathname}${url.search}`;
  } catch {
    return path;
  }
};

export function DashboardNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const originPathRef = useRef(pathname);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchedPathsRef = useRef(new Set<string>());
  const timingRef = useRef<DashboardNavigationTiming | null>(null);

  const clearPending = useCallback(() => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = null;
    setPendingPath(null);
  }, []);

  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    if (!path) {
      clearPending();
      return;
    }
    const destination = normalizedDestination(path);
    const current = typeof window === "undefined" ? pathname : `${window.location.pathname}${window.location.search}`;
    if (destination === current) {
      clearPending();
      return;
    }
    originPathRef.current = pathname;
    setPendingPath(destination);
    if (typeof performance !== "undefined") {
      timingRef.current = {
        from: pathname,
        to: destination,
        prefetched: prefetchedPathsRef.current.has(destination),
        startedAt: performance.now(),
      };
      performance.clearMarks("dashboard-navigation-start");
      performance.mark("dashboard-navigation-start", { detail: { from: pathname, to: destination } });
    }
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(clearPending, 15000);
    // Keep feedback synchronous while allowing React to schedule the route tree.
    // A synchronous router failure must never leave the shell permanently busy.
    try {
      startTransition(() => {
        if (options?.replace) router.replace(destination);
        else router.push(destination);
      });
    } catch (error) {
      clearPending();
      window.dispatchEvent(new CustomEvent("obaol:navigation-error", { detail: { from: pathname, to: destination } }));
      throw error;
    }
  }, [clearPending, pathname, router]);

  const prefetch = useCallback((path: string) => {
    const destination = normalizedDestination(path);
    if (!destination || destination.split("?")[0] === pathname || prefetchedPathsRef.current.has(destination)) return;
    prefetchedPathsRef.current.add(destination);
    try {
      router.prefetch(destination);
    } catch {
      prefetchedPathsRef.current.delete(destination);
    }
  }, [pathname, router]);

  const markContentReady = useCallback((path = pathname) => {
    const timing = timingRef.current;
    if (!timing || timing.to.split("?")[0] !== path.split("?")[0] || typeof performance === "undefined") return;
    timing.contentReadyAt = performance.now();
    performance.mark("dashboard-navigation-content-ready", { detail: { path, prefetched: timing.prefetched } });
    try {
      performance.measure("dashboard-navigation-content", "dashboard-navigation-start", "dashboard-navigation-content-ready");
    } catch {
      // Direct visits do not have a navigation start mark.
    }
    window.dispatchEvent(new CustomEvent("obaol:navigation-timing", { detail: { ...timing } }));
    timingRef.current = null;
    clearPending();
  }, [clearPending, pathname]);

  useEffect(() => {
    if (!pendingPath || pathname === originPathRef.current) return;
    if (typeof performance !== "undefined") {
      if (timingRef.current) timingRef.current.routeCommittedAt = performance.now();
      performance.mark("dashboard-navigation-ready", { detail: { path: pathname } });
      try {
        const measure = performance.measure(
          "dashboard-navigation",
          "dashboard-navigation-start",
          "dashboard-navigation-ready",
        );
        if (process.env.NODE_ENV !== "production") console.debug(`[navigation] ${pathname} committed in ${Math.round(measure.duration)}ms`);
      } catch {
        // Direct visits do not have a navigation start mark.
      }
    }
  }, [clearPending, pathname, pendingPath]);

  useEffect(() => () => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
  }, []);

  useEffect(() => {
    const clearOnHistoryNavigation = () => clearPending();
    window.addEventListener("popstate", clearOnHistoryNavigation);
    window.addEventListener("pagehide", clearOnHistoryNavigation);
    return () => {
      window.removeEventListener("popstate", clearOnHistoryNavigation);
      window.removeEventListener("pagehide", clearOnHistoryNavigation);
    };
  }, [clearPending]);

  const value = useMemo(() => ({
    pendingPath,
    isNavigating: Boolean(pendingPath),
    navigate,
    prefetch,
    markContentReady,
  }), [markContentReady, navigate, pendingPath, prefetch]);

  return <DashboardNavigationContext.Provider value={value}>{children}</DashboardNavigationContext.Provider>;
}

export function useDashboardNavigation() {
  const value = useContext(DashboardNavigationContext);
  if (!value) throw new Error("useDashboardNavigation must be used within DashboardNavigationProvider");
  return value;
}
