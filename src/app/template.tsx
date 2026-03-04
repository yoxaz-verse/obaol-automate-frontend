"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { pageTransition } from "@/lib/motion/variants";

function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const routeKey = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
  const [forceReduced, setForceReduced] = useState(false);
  const completedRef = useRef(true);

  useEffect(() => {
    completedRef.current = false;
    const fallback = window.setTimeout(() => {
      if (!completedRef.current) {
        setForceReduced(true);
      }
    }, 1200);
    return () => window.clearTimeout(fallback);
  }, [routeKey]);

  const variant = pageTransition(Boolean(reducedMotion || forceReduced));

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        initial={variant.initial}
        animate={variant.animate}
        exit={variant.exit}
        transition={variant.transition}
        onAnimationComplete={() => {
          completedRef.current = true;
          setForceReduced(false);
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default Template;
