"use client";

import type { ReactNode } from "react";
import { useInViewport } from "@/hooks/useInViewport";

type DeferredSectionProps = {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  rootMargin?: string;
  minHeight?: number;
  id?: string;
};

/** Mounts expensive, below-the-fold UI shortly before it enters the viewport. */
export default function DeferredSection({
  children,
  fallback = null,
  className = "",
  rootMargin = "480px 0px",
  minHeight,
  id,
}: DeferredSectionProps) {
  const [anchorRef, shouldLoad] = useInViewport<HTMLDivElement>({ rootMargin, once: true });

  return (
    <div id={id} ref={anchorRef} className={className} style={minHeight ? { minHeight } : undefined}>
      {shouldLoad ? children : fallback}
    </div>
  );
}
