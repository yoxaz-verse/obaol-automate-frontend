"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion/tokens";

function ProgressBarContent() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastPathKey, setLastPathKey] = useState("");
  const routeKey = pathname;

  useEffect(() => {
    if (lastPathKey === routeKey) return;
    setLastPathKey(routeKey);
    setIsLoading(true);
    setProgress(18);

    let active = true;
    const step1 = window.setTimeout(() => {
      if (!active) return;
      setProgress(46);
    }, 80);
    const step2 = window.setTimeout(() => {
      if (!active) return;
      setProgress(74);
    }, 180);
    const step3 = window.setTimeout(() => {
      if (!active) return;
      setProgress(92);
    }, 320);
    const finish = window.setTimeout(() => {
      if (!active) return;
      setProgress(100);
      window.setTimeout(() => {
        if (!active) return;
        setIsLoading(false);
        setProgress(0);
      }, 130);
    }, 520);

    return () => {
      active = false;
      window.clearTimeout(step1);
      window.clearTimeout(step2);
      window.clearTimeout(step3);
      window.clearTimeout(finish);
    };
  }, [lastPathKey, routeKey]);

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
