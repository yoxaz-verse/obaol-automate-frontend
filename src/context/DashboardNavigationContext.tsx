"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
    if (!path || path === pathname) return;
    originPathRef.current = pathname;
    setPendingPath(path);
    if (typeof performance !== "undefined") {
      timingRef.current = {
        from: pathname,
        to: path,
        prefetched: prefetchedPathsRef.current.has(path),
        startedAt: performance.now(),
      };
      performance.clearMarks("dashboard-navigation-start");
      performance.mark("dashboard-navigation-start", { detail: { from: pathname, to: path } });
    }
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(clearPending, 15000);
    if (options?.replace) router.replace(path);
    else router.push(path);
  }, [clearPending, pathname, router]);

  const prefetch = useCallback((path: string) => {
    if (!path || path === pathname || prefetchedPathsRef.current.has(path)) return;
    prefetchedPathsRef.current.add(path);
    router.prefetch(path);
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
