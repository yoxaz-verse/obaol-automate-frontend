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
      <figure
        ref={sceneRef}
        data-hero-layered-artwork="true"
        data-hero-lifecycle-visual="true"
        role="img"
        aria-label="Watercolor illustration of connected Indian agro trade operations moving from farm sourcing through preparation and onward to delivery"
        className="relative aspect-[1672/941] w-full"
      >
        <div
          data-hero-atmosphere="true"
          data-atmosphere-motion="static"
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[12%] -left-[6%] -right-[6%] -top-[10%] z-0"
        >
          <div
            data-hero-atmosphere-theme="light"
            className="absolute inset-0 dark:hidden"
            style={{
              backgroundImage: "radial-gradient(ellipse 46% 40% at 22% 58%, rgba(255,255,255,0.96) 0%, rgba(235,245,255,0.72) 42%, transparent 76%), radial-gradient(ellipse 52% 44% at 76% 42%, rgba(255,255,255,0.92) 0%, rgba(219,235,248,0.62) 48%, transparent 80%), radial-gradient(ellipse 55% 30% at 58% 78%, rgba(255,247,229,0.58) 0%, transparent 76%)",
              filter: "blur(22px)",
            }}
          />
          <div
            data-hero-atmosphere-theme="dark"
            className="absolute inset-0 hidden dark:block"
            style={{
              backgroundImage: "radial-gradient(ellipse 48% 42% at 24% 56%, rgba(30,35,38,0.8) 0%, rgba(20,24,27,0.5) 48%, transparent 78%), radial-gradient(ellipse 54% 46% at 76% 42%, rgba(42,38,31,0.72) 0%, rgba(28,27,25,0.46) 50%, transparent 80%), radial-gradient(ellipse 50% 28% at 58% 78%, rgba(207,152,60,0.16) 0%, transparent 76%)",
              filter: "blur(24px)",
            }}
          />
        </div>
        <ParallaxTradeAccents placement="hero" progress={smoothScrollProgress} motionEnabled={parallaxEnabled} />
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

      <div data-execution-route="phase-rail" aria-label="Execution phases: Plan, Verify, Move, and Close" className="relative z-30 mx-[7%] mt-1 pb-2 sm:mx-[9%] sm:mt-2 lg:pb-0">
        <div className="absolute left-[7px] right-[7px] top-[7px] h-px bg-obaol-700/70 dark:bg-obaol-300/70" />
        <div className="relative grid grid-cols-4">
          {phaseGroups.map((phase, index) => (
            <div key={phase.phase} data-execution-phase={phase.phase.toLowerCase()} className={index === phaseGroups.length - 1 ? "text-right" : index > 0 ? "text-center" : ""}>
              <span className={`mb-2 block size-[15px] rounded-full border-[3px] border-background bg-obaol-500 shadow-[0_0_0_1px_rgba(180,119,18,0.75)] dark:shadow-[0_0_0_1px_rgba(228,199,153,0.72)] sm:mb-3 ${index === phaseGroups.length - 1 ? "ml-auto" : index > 0 ? "mx-auto" : ""}`} />
              <span className="block text-[8px] font-bold uppercase tracking-[0.14em] text-foreground sm:text-[10px] sm:tracking-[0.2em] xl:text-[11px]">{phase.name}</span>
            </div>
          ))}
        </div>
      </div>
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
