"use client";

import dynamic from "next/dynamic";
import { useInViewport } from "@/hooks/useInViewport";

const UnifiedExecutionWorkspace = dynamic(
  () => import("@/components/home/UnifiedExecutionWorkspace"),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="min-h-[420px] rounded-[2rem] border border-default-200/60 bg-content1/40 public-surface-card"
      />
    ),
  },
);

/** Keep the sizeable interactive workspace out of the initial route chunk. */
export default function DeferredExecutionWorkspace() {
  const [anchorRef, shouldLoad] = useInViewport<HTMLDivElement>({
    rootMargin: "480px 0px",
    once: true,
  });

  return (
    <div ref={anchorRef} className="min-h-[420px]">
      {shouldLoad ? <UnifiedExecutionWorkspace /> : null}
    </div>
  );
}
