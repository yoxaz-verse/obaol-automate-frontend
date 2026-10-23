"use client";

import dynamic from "next/dynamic";
import DeferredSection from "@/components/ui/DeferredSection";

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
  return (
    <DeferredSection
      id="execution-workspace"
      className="min-h-[420px]"
      minHeight={420}
      rootMargin="240px 0px"
      fallback={<div aria-hidden="true" className="min-h-[420px] rounded-[2rem] border border-default-200/60 bg-content1/40 public-surface-card" />}
    >
      <UnifiedExecutionWorkspace />
    </DeferredSection>
  );
}
