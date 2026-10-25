"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type DashboardNavigationContextValue = {
  pendingPath: string | null;
  isNavigating: boolean;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  prefetch: (path: string) => void;
};

const DashboardNavigationContext = createContext<DashboardNavigationContextValue | null>(null);

export function DashboardNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const originPathRef = useRef(pathname);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPending = useCallback(() => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = null;
    setPendingPath(null);
  }, []);

  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    if (!path || path === pathname) return;
    originPathRef.current = pathname;
    setPendingPath(path);
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(clearPending, 15000);
    if (options?.replace) router.replace(path);
    else router.push(path);
  }, [clearPending, pathname, router]);

  const prefetch = useCallback((path: string) => {
    if (!path || path === pathname) return;
    router.prefetch(path);
  }, [pathname, router]);

  useEffect(() => {
    if (pendingPath && pathname !== originPathRef.current) clearPending();
  }, [clearPending, pathname, pendingPath]);

  useEffect(() => () => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
  }, []);

  const value = useMemo(() => ({
    pendingPath,
    isNavigating: Boolean(pendingPath),
    navigate,
    prefetch,
  }), [navigate, pendingPath, prefetch]);

  return <DashboardNavigationContext.Provider value={value}>{children}</DashboardNavigationContext.Provider>;
}

export function useDashboardNavigation() {
  const value = useContext(DashboardNavigationContext);
  if (!value) throw new Error("useDashboardNavigation must be used within DashboardNavigationProvider");
  return value;
}
