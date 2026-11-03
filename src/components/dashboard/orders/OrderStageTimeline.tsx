"use client";

import { useEffect, useRef } from "react";
import { FiCheck } from "react-icons/fi";

type OrderStageTimelineProps = {
  stages: string[];
  currentStage: string;
  labels: ReadonlyMap<string, string>;
};

export default function OrderStageTimeline({ stages, currentStage, labels }: OrderStageTimelineProps) {
  const railRef = useRef<HTMLOListElement>(null);
  const activeIndex = Math.max(0, stages.indexOf(currentStage));

  useEffect(() => {
    const rail = railRef.current;
    const active = rail?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!rail || !active) return;

    const target = active.offsetLeft - (rail.clientWidth - active.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [currentStage, stages.length]);

  return (
    <section aria-labelledby="order-progress-heading" className="relative w-full">
      <div className="mb-3 flex items-center justify-between gap-4 px-1">
        <h2 id="order-progress-heading" className="text-xs font-black uppercase tracking-[0.16em] text-foreground">
          Order progress
        </h2>
        <span className="shrink-0 text-[11px] font-semibold text-default-500">
          Stage {activeIndex + 1} of {stages.length}
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-0 top-8 z-20 w-7 bg-gradient-to-r from-background to-transparent sm:w-10" />
      <div className="pointer-events-none absolute bottom-2 right-0 top-8 z-20 w-7 bg-gradient-to-l from-background to-transparent sm:w-10" />

      <ol
        ref={railRef}
        aria-label="Order progress"
        className="order-progress-scrollbar relative flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-4 pt-1 scroll-smooth sm:gap-4 sm:px-6"
      >
        {stages.map((stage, index) => {
          const completed = index < activeIndex;
          const current = index === activeIndex;
          const label = String(labels.get(stage) || stage).replaceAll("_", " ");

          return (
            <li
              key={stage}
              aria-current={current ? "step" : undefined}
              className="relative min-w-[10.5rem] flex-1 snap-center first:ml-0 sm:min-w-[12rem]"
            >
              {index < stages.length - 1 ? (
                <div
                  aria-hidden="true"
                  className={`absolute left-[calc(50%+1.25rem)] top-5 h-px w-[calc(100%+0.75rem)] sm:w-[calc(100%+1rem)] ${completed ? "bg-success-500/60" : "bg-default-300"}`}
                />
              ) : null}
              <div
                className={`relative z-10 min-h-[5.5rem] rounded-2xl border px-3 py-3 transition-colors sm:px-4 ${
                  current
                    ? "border-obaol-500/70 bg-obaol-500/10"
                    : completed
                      ? "border-success-500/25 bg-success-500/5"
                      : "border-default-200 bg-content1/70"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-black ${
                      current
                        ? "border-obaol-500 bg-obaol-500 text-black"
                        : completed
                          ? "border-success-500 bg-success-500 text-white"
                          : "border-default-300 bg-content1 text-default-500"
                    }`}
                  >
                    {completed ? <FiCheck aria-hidden="true" /> : index + 1}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${current ? "text-obaol-600 dark:text-obaol-400" : completed ? "text-success-600 dark:text-success-400" : "text-default-400"}`}>
                    {current ? "Current" : completed ? "Complete" : "Upcoming"}
                  </span>
                </div>
                <p className="text-xs font-bold leading-snug text-foreground sm:text-[13px]">{label}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
