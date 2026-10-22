"use client";

import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { inkArtworkMaskStyle } from "@/components/home/inkArtworkMask";
import ParallaxTradeAccents from "@/components/home/ParallaxTradeAccents";
import { useAdaptiveMotion } from "@/hooks/useAdaptiveMotion";

export type HeroStage = {
  id: string;
  label: string;
  message: string;
  src: string;
  deliverable?: string;
  phase: "Plan" | "Verify" | "Move" | "Close";
};

const phaseGroups: Array<{ name: string; range: string; phase: HeroStage["phase"] }> = [
  { name: "Plan", range: "01—03", phase: "Plan" },
  { name: "Verify", range: "04—06", phase: "Verify" },
  { name: "Move", range: "07—09", phase: "Move" },
  { name: "Close", range: "10", phase: "Close" },
];

export default function HeroStageExplorer() {
  const sceneRef = useRef<HTMLElement>(null);
  const adaptiveMotion = useAdaptiveMotion();
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start 85%", "end 15%"] });
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.35,
  });
  const logisticsY = useTransform(smoothScrollProgress, [0, 1], [10, -10]);
  const operationsY = useTransform(smoothScrollProgress, [0, 1], [22.5, -22.5]);
  const commoditiesY = useTransform(smoothScrollProgress, [0, 1], [40, -40]);
  const parallaxEnabled = !adaptiveMotion.prefersReducedMotion && !adaptiveMotion.isMobile && !adaptiveMotion.isTouch;

  return (
    <div data-hero-panel="execution-map" data-hero-depth-scene="true" data-hero-parallax={parallaxEnabled ? "active" : "static"} className="relative min-w-0 px-1 py-5 sm:px-4 lg:px-0 lg:py-0 xl:w-[calc(100%+clamp(3rem,8vw,10rem))] xl:max-w-none">
      <h2 className="sr-only">Connected Indian agro trade operations</h2>
      <div className="pointer-events-none absolute inset-[16%_8%_10%] rounded-full bg-obaol-400/12 blur-3xl dark:bg-obaol-400/[0.08]" />
      <ParallaxTradeAccents placement="hero" progress={smoothScrollProgress} motionEnabled={parallaxEnabled} />
      <figure
        ref={sceneRef}
        data-hero-layered-artwork="true"
        data-hero-lifecycle-visual="true"
        role="img"
        aria-label="Watercolor illustration of connected Indian agro trade operations moving from farm sourcing through preparation and onward to delivery"
        className="relative aspect-[1672/941] w-full"
      >
        <div data-hero-depth-layer="background" aria-hidden="true" data-ink-artwork-mask="true" style={inkArtworkMaskStyle} className="absolute inset-0">
          <Image
            src="/images/hero-layers/background.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 58vw"
            className="object-contain contrast-[1.01] saturate-[0.98] dark:brightness-[0.8] dark:saturate-[0.9]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-obaol-500/[0.04]" />
        </div>
        <motion.div data-hero-depth-layer="logistics" aria-hidden="true" style={{ y: parallaxEnabled ? logisticsY : 0 }} className="absolute inset-0 z-10 will-change-transform [filter:drop-shadow(0_4px_5px_rgba(15,23,42,0.08))]">
          <Image
            src="/images/hero-layers/logistics.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 58vw"
            className="origin-right scale-[0.62] object-contain dark:brightness-[0.82] dark:saturate-[0.92]"
          />
        </motion.div>
        <motion.div data-hero-depth-layer="operations" aria-hidden="true" style={{ y: parallaxEnabled ? operationsY : 0 }} className="absolute inset-0 z-20 will-change-transform [filter:drop-shadow(0_5px_7px_rgba(15,23,42,0.1))]">
          <Image
            src="/images/hero-layers/operations.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 58vw"
            className="origin-bottom-left scale-[0.88] object-contain dark:brightness-[0.82] dark:saturate-[0.92]"
          />
        </motion.div>
        <motion.div data-hero-depth-layer="commodities" aria-hidden="true" style={{ y: parallaxEnabled ? commoditiesY : 0 }} className="absolute inset-0 z-30 will-change-transform [filter:drop-shadow(0_7px_9px_rgba(15,23,42,0.12))]">
          <Image
            src="/images/hero-layers/commodities.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 58vw"
            className="origin-bottom-left scale-[0.58] object-contain dark:brightness-[0.82] dark:saturate-[0.92]"
          />
        </motion.div>
      </figure>
    </div>
  );
}

export function HeroStageBand({ stages }: { stages: readonly HeroStage[] }) {
  return (
    <section data-execution-stage-band="true" aria-labelledby="execution-stage-band-title" className="hidden border-y border-default-200/70 bg-default-50/55 py-7 dark:bg-default-50/[0.025] md:block lg:py-8">
      <div className="public-layout-container container mx-auto px-6 sm:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-obaol-700 dark:text-obaol-300">A shared path for every trade role</p>
              <h2 id="execution-stage-band-title" className="mt-1 text-lg font-bold tracking-tight text-foreground sm:text-xl">From requirement to delivery</h2>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">10 connected stages</p>
          </div>

          <div data-execution-stage-grid="true" aria-label="All ten execution stages grouped by phase" className="grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2 xl:grid-cols-[3fr_3fr_3fr_1.2fr]">
            {phaseGroups.map((phase) => {
              const phaseStages = stages.filter((stage) => stage.phase === phase.phase);
              return (
                <section key={phase.phase} data-execution-stage-group={phase.phase.toLowerCase()} className="border-t border-obaol-500/35 pt-3" aria-labelledby={`hero-phase-${phase.phase.toLowerCase()}`}>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h3 id={`hero-phase-${phase.phase.toLowerCase()}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-obaol-700 dark:text-obaol-300">{phase.name}</h3>
                    <span className="font-mono text-[9px] text-muted-foreground">{phase.range}</span>
                  </div>
                  <ol className="space-y-2">
                    {phaseStages.map((stage) => (
                      <li key={stage.id} data-execution-stage={stage.id} className="flex items-baseline gap-2.5 text-[13px] leading-5 text-foreground">
                        <span className="w-5 shrink-0 font-mono text-[9px] font-bold text-obaol-700 dark:text-obaol-300">{String(stages.indexOf(stage) + 1).padStart(2, "0")}</span>
                        <span className="font-semibold">{stage.label}</span>
                        <span className="sr-only">{stage.message}. {stage.deliverable ? `Output: ${stage.deliverable}.` : ""}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
