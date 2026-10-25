"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useDashboardNavigation } from "@/context/DashboardNavigationContext";

export default function DashboardNavigationProgress() {
  const { isNavigating } = useDashboardNavigation();
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isNavigating) {
      setProgress((current) => current ? 100 : 0);
      const reset = window.setTimeout(() => setProgress(0), 180);
      return () => window.clearTimeout(reset);
    }
    setProgress(14);
    const steps = [
      window.setTimeout(() => setProgress(38), 120),
      window.setTimeout(() => setProgress(64), 420),
      window.setTimeout(() => setProgress(82), 1000),
      window.setTimeout(() => setProgress(91), 2400),
    ];
    return () => steps.forEach(window.clearTimeout);
  }, [isNavigating]);

  if (progress === 0) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[99999] h-1 origin-left bg-obaol-500 shadow-[0_0_10px_rgba(207,152,60,0.55)]"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
        transition: reducedMotion ? "none" : "width 260ms ease-out, opacity 180ms ease-out",
      }}
    />
  );
}
