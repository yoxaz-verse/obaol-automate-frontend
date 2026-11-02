"use client";

import { useEffect } from "react";

type PerformanceSample = {
  kind: "navigation" | "api" | "long-task" | "navigation-error";
  route: string;
  duration?: number;
  status?: number;
  at: number;
};

const STORAGE_KEY = "obaol:performance-samples";
const MAX_SAMPLES = 100;

/**
 * Keeps a small, session-scoped diagnostic trail for production performance
 * investigations. Samples contain route templates/timings only—never query
 * strings, request bodies, response data, tokens, or user identifiers.
 */
export default function DashboardPerformanceObserver() {
  useEffect(() => {
    const save = (sample: PerformanceSample) => {
      try {
        const current = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
        const samples = Array.isArray(current) ? current.slice(-(MAX_SAMPLES - 1)) : [];
        samples.push(sample);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
        window.dispatchEvent(new CustomEvent("obaol:performance-sample", { detail: sample }));
      } catch {
        // Diagnostics must never interfere with navigation or storage-restricted browsers.
      }
    };

    const navigation = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      save({
        kind: "navigation",
        route: String(detail.to || window.location.pathname).split("?")[0],
        duration: detail.contentReadyAt && detail.startedAt ? detail.contentReadyAt - detail.startedAt : undefined,
        at: Date.now(),
      });
    };
    const api = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      save({ kind: "api", route: String(detail.route || "unknown"), duration: Number(detail.duration || 0), status: Number(detail.status || 0), at: Date.now() });
    };
    const navigationError = () => save({ kind: "navigation-error", route: window.location.pathname, at: Date.now() });

    window.addEventListener("obaol:navigation-timing", navigation);
    window.addEventListener("obaol:api-timing", api);
    window.addEventListener("obaol:navigation-error", navigationError);

    let observer: PerformanceObserver | undefined;
    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          save({ kind: "long-task", route: window.location.pathname, duration: entry.duration, at: Date.now() });
        }
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch {
      // Long Task API is not supported by every browser.
    }

    return () => {
      window.removeEventListener("obaol:navigation-timing", navigation);
      window.removeEventListener("obaol:api-timing", api);
      window.removeEventListener("obaol:navigation-error", navigationError);
      observer?.disconnect();
    };
  }, []);

  return null;
}
