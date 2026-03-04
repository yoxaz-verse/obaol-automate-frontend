"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion/tokens";

function ProgressBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const routeKey = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
  const lastRouteKeyRef = useRef("");
  const timeoutsRef = useRef<number[]>([]);

  const clearAllTimers = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  const hardReset = () => {
    clearAllTimers();
    setIsLoading(false);
    setProgress(0);
  };

  useEffect(() => {
    // Do not animate on first mount/hydration.
    if (!lastRouteKeyRef.current) {
      lastRouteKeyRef.current = routeKey;
      return;
    }

    if (lastRouteKeyRef.current === routeKey) return;
    lastRouteKeyRef.current = routeKey;
    clearAllTimers();
    setIsLoading(true);
    setProgress(18);

    const step1 = window.setTimeout(() => {
      setProgress(46);
    }, 80);
    const step2 = window.setTimeout(() => {
      setProgress(74);
    }, 180);
    const step3 = window.setTimeout(() => {
      setProgress(92);
    }, 320);
    const finish = window.setTimeout(() => {
      setProgress(100);
      const fadeOut = window.setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 130);
      timeoutsRef.current.push(fadeOut);
    }, 520);
    const safetyFinish = window.setTimeout(hardReset, 2200);

    timeoutsRef.current.push(step1, step2, step3, finish, safetyFinish);

    return () => {
      clearAllTimers();
    };
  }, [routeKey]);

  // Extra guard: if bar ever stays loading due unexpected render path, auto-clear.
  useEffect(() => {
    if (!isLoading) return;
    const watchdog = window.setTimeout(hardReset, 4000);
    return () => window.clearTimeout(watchdog);
  }, [isLoading]);

  return (
    <AnimatePresence initial={false}>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? MOTION_DURATION.instant : MOTION_DURATION.fast,
            ease: MOTION_EASE.smooth,
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: `${progress}%`,
            height: "3px",
            background:
              "linear-gradient(90deg, rgba(251,146,60,1) 0%, rgba(245,158,11,1) 55%, rgba(251,191,36,1) 100%)",
            boxShadow: "0 0 10px rgba(251,146,60,0.45)",
            zIndex: 99999,
            pointerEvents: "none",
          }}
        />
      )}
    </AnimatePresence>
  );
}

export default function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarContent />
    </Suspense>
  );
}
