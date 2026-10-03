"use client";

import dynamic from "next/dynamic";

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
    <div id="execution-workspace" className="min-h-[420px]">
      <UnifiedExecutionWorkspace />
    </div>
  );
}
