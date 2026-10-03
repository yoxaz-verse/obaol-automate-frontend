"use client";

import Image from "next/image";
import { useState } from "react";

export type HeroStage = {
  id: string;
  label: string;
  message: string;
  src: string;
};

export default function HeroStageExplorer({ stages }: { stages: readonly HeroStage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const active = stages[activeIndex];
  return (
    <div
      data-hero-panel="execution-flow"
      aria-label="OBAOL's ten-stage execution flow"
      className="relative w-full rounded-[2rem] border border-obaol-500/20 bg-content1/70 p-4 shadow-[0_24px_70px_-45px_rgba(207,152,60,0.45)] sm:p-5"
    >
      <div className="relative h-24 overflow-hidden rounded-[1.4rem] bg-black sm:h-auto sm:aspect-[16/9]">
        <Image src={active.src} alt="" fill priority={activeIndex === 0} sizes="(max-width: 1023px) 92vw, 52vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-obaol-200">Step {String(activeIndex + 1).padStart(2, "0")} · {active.label}</p>
          <p className="mt-2 text-lg font-bold sm:text-xl">{active.message}</p>
        </div>
      </div>
      <div role="tablist" aria-label="Execution stages" className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {stages.map((stage, index) => (
          <button
            key={stage.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Step ${index + 1}: ${stage.label}`}
            onClick={() => setActiveIndex(index)}
            className={`min-h-11 rounded-xl border text-xs font-bold transition-colors ${index === activeIndex ? "border-obaol-500 bg-obaol-500 text-obaol-950" : "border-default-200 bg-background/70 text-foreground/55 hover:border-obaol-500/40"}`}
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
    </div>
  );
}
