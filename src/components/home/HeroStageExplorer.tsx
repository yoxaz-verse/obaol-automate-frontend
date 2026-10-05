"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiCheckCircle, FiShield, FiArrowUpRight } from "react-icons/fi";

export type HeroStage = {
  id: string;
  label: string;
  message: string;
  src: string;
  deliverable?: string;
};

export default function HeroStageExplorer({ stages }: { stages: readonly HeroStage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const active = stages[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % stages.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + stages.length) % stages.length);
  };

  useEffect(() => {
    if (isPlaying && !isHovered) {
      autoPlayTimerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % stages.length);
      }, 4500);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isPlaying, isHovered, stages.length]);

  return (
    <div
      data-hero-panel="execution-flow"
      aria-label="OBAOL's ten-stage execution flow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full rounded-[2.25rem] border border-obaol-500/30 bg-content1/80 p-4 shadow-[0_30px_90px_-30px_rgba(207,152,60,0.35)] backdrop-blur-xl sm:p-6 transition-all duration-500 hover:border-obaol-500/50 hover:shadow-[0_35px_100px_-25px_rgba(207,152,60,0.45)]"
    >
      {/* Glow highlight line */}
      <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-obaol-400 to-transparent" />

      {/* Header Bar inside card */}
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-obaol-500/15 text-obaol-600 dark:text-obaol-300 font-mono text-xs font-black">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              {active.label}
            </span>
            <span className="hidden sm:inline text-xs text-foreground/40 font-mono ml-2">
              (Stage {activeIndex + 1} of {stages.length})
            </span>
          </div>
        </div>

        {/* Play / Pause & Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-default-200/80 bg-background/80 text-foreground/70 hover:bg-obaol-500/10 hover:text-obaol-600 transition-colors"
            title={isPlaying ? "Pause auto-rotation" : "Start auto-rotation"}
          >
            {isPlaying ? <FiPause size={14} /> : <FiPlay size={14} className="ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={handlePrev}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-default-200/80 bg-background/80 text-foreground/70 hover:bg-obaol-500/10 hover:text-obaol-600 transition-colors"
            title="Previous step"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-default-200/80 bg-background/80 text-foreground/70 hover:bg-obaol-500/10 hover:text-obaol-600 transition-colors"
            title="Next step"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Image Stage Preview Window */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[1.6rem] bg-slate-950 shadow-inner">
        <Image
          key={active.id}
          src={active.src}
          alt={active.label}
          fill
          priority={activeIndex === 0}
          sizes="(max-width: 1023px) 92vw, 52vw"
          className="object-cover transition-all duration-700 ease-out"
        />

        {/* Shading gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-transparent" />

        {/* Stage Status Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/70 px-3.5 py-1.5 backdrop-blur-md text-white text-xs font-bold">
          <FiShield className="text-obaol-400" size={13} />
          <span>Verified Execution Step</span>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white z-10 space-y-2">
          <p className="text-[11px] font-mono font-extrabold uppercase tracking-[0.2em] text-obaol-300">
            Step {String(activeIndex + 1).padStart(2, "0")} • {active.label}
          </p>
          <p className="text-lg font-bold sm:text-2xl leading-snug text-white drop-shadow-md">
            {active.message}
          </p>
          {active.deliverable && (
            <div className="inline-flex items-center gap-2 pt-1 text-xs font-semibold text-obaol-200/90">
              <FiCheckCircle size={14} className="text-obaol-400 shrink-0" />
              <span>Output: {active.deliverable}</span>
            </div>
          )}
        </div>

        {/* Progress bar along bottom of image */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-obaol-500 to-amber-400 transition-all duration-500"
            style={{ width: `${((activeIndex + 1) / stages.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Stage selector tabs */}
      <div role="tablist" aria-label="Execution stages" className="mt-4 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
        {stages.map((stage, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Step ${index + 1}: ${stage.label}`}
              onClick={() => setActiveIndex(index)}
              className={`relative flex min-h-[44px] flex-col items-center justify-center rounded-xl border font-mono text-xs font-extrabold transition-all duration-200 ${
                isActive
                  ? "border-obaol-500 bg-gradient-to-b from-obaol-500 to-amber-500 text-obaol-950 shadow-[0_4px_16px_rgba(207,152,60,0.4)] scale-105 z-10"
                  : "border-default-200/80 bg-background/60 text-foreground/60 hover:border-obaol-500/50 hover:bg-obaol-500/10 hover:text-foreground"
              }`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-3 rounded-full bg-obaol-950" />
              )}
            </button>
          );
        })}
      </div>

      {/* Deliverable details footer strip inside card */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-default-200/60 bg-background/50 px-4 py-2.5 text-xs text-foreground/70">
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-obaol-700 dark:text-obaol-300">Target Output:</span>
          <span className="font-medium truncate">{active.deliverable || active.message}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 font-bold text-obaol-600 dark:text-obaol-400 shrink-0">
          <span>Explore Flow</span>
          <FiArrowUpRight size={14} />
        </div>
      </div>
    </div>
  );
}

