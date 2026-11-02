"use client";

import Image from "next/image";
import { useState } from "react";
import { useAdaptiveMotion } from "@/hooks/useAdaptiveMotion";

export type HeroStage = {
  id: string;
  label: string;
  message: string;
  src: string;
  deliverable?: string;
  phase: "Plan" | "Verify" | "Move" | "Receive & Approve";
};

const phaseGroups: Array<{ name: string; slug: string; range: string; phase: HeroStage["phase"]; summary: string; left: number; width: number; status: string; evidence: string }> = [
  { name: "Plan", slug: "plan", range: "01—03", phase: "Plan", summary: "Coordinate bulk suppliers, buyer requirements, and available inventory.", left: 0, width: 25, status: "Buyer requirement captured", evidence: "Origin and supplier coverage" },
  { name: "Verify", slug: "verify", range: "04—06", phase: "Verify", summary: "Inspect warehouses, sample commodities, and complete quality documentation.", left: 25, width: 25, status: "Specification approved", evidence: "Sample and COA verified" },
  { name: "Move", slug: "move", range: "07—09", phase: "Move", summary: "Package bulk goods and coordinate inland transport, freight, and shipment evidence.", left: 50, width: 25, status: "Shipment in execution", evidence: "Tracking and bill of lading" },
  { name: "Receive & Approve", slug: "receive-and-approve", range: "10", phase: "Receive & Approve", summary: "The overseas buyer receives the commodity, confirms the specification, and approves the completed import handoff.", left: 75, width: 25, status: "International buyer approved receipt", evidence: "Destination acceptance record" },
];

const HERO_ARTWORK = "/images/hero-bulk-execution-v6.webp";

export default function HeroStageExplorer() {
  const adaptiveMotion = useAdaptiveMotion();
  const reducedMotion = adaptiveMotion.prefersReducedMotion;
  const [selectedPhase, setSelectedPhase] = useState<HeroStage["phase"] | null>(null);
  const [previewPhase, setPreviewPhase] = useState<HeroStage["phase"] | null>(null);
  const activePhase = previewPhase ?? selectedPhase;
  const activePhaseGroup = phaseGroups.find((phase) => phase.phase === activePhase);
  const displayedPhaseGroup = activePhaseGroup ?? phaseGroups[0];
  const transitionClass = reducedMotion ? "" : "transition-[filter,opacity,transform,background-color,color] duration-300 ease-out";

  const preview = (phase: HeroStage["phase"]) => setPreviewPhase(phase);
  const stopPreview = () => setPreviewPhase(null);
  const select = (phase: HeroStage["phase"]) => setSelectedPhase((current) => current === phase ? null : phase);

  return (
    <div data-hero-panel="execution-map" data-active-phase={activePhaseGroup?.slug ?? "none"} className="relative min-w-0 px-1 py-5 sm:px-4 lg:px-0 lg:py-0 xl:w-[calc(100%+clamp(3rem,8vw,10rem))] xl:max-w-none">
      <h2 className="sr-only">Connected bulk trade execution network</h2>
      <div className="pointer-events-none absolute inset-[16%_8%_10%] rounded-full bg-obaol-400/12 blur-3xl dark:bg-obaol-400/[0.08]" />
      <div
        data-hero-bulk-artwork="true"
        data-hero-lifecycle-visual="true"
        aria-label="Interactive panorama of independent bulk suppliers, warehouse inspectors, quality specialists, logistics providers, and an overseas buyer coordinating one agricultural commodity trade"
        className="relative aspect-[1983/793] w-full overflow-hidden rounded-xl bg-content2 focus-within:ring-1 focus-within:ring-obaol-500/70 sm:rounded-2xl"
      >
        <Image src={HERO_ARTWORK} alt="" aria-hidden="true" fill priority quality={88} sizes="(max-width: 1023px) 100vw, 68vw" className={`object-cover ${transitionClass} ${activePhase ? "opacity-55 saturate-[0.65] brightness-[0.82]" : "opacity-100"}`} />
        {phaseGroups.map((phase) => (
          <div
            key={`highlight-${phase.phase}`}
            data-hero-phase-highlight={phase.slug}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-10 overflow-hidden ${transitionClass} ${activePhase === phase.phase ? "opacity-100" : "opacity-0"}`}
            style={{ clipPath: `inset(0 ${100 - phase.left - phase.width}% 0 ${phase.left}%)` }}
          >
            <Image src={HERO_ARTWORK} alt="" fill quality={88} sizes="(max-width: 1023px) 100vw, 68vw" className={`object-cover ${transitionClass}`} />
            <div className="absolute inset-y-0 bg-gradient-to-t from-obaol-500/[0.07] via-transparent to-white/[0.04]" style={{ left: `${phase.left}%`, width: `${phase.width}%` }} />
          </div>
        ))}
        <div data-hero-phase-dividers="true" aria-hidden="true" className="pointer-events-none absolute inset-0 z-[15]">
          {[25, 50, 75].map((position) => (
            <span key={position} data-hero-phase-divider="true" className="absolute inset-y-[5%] w-px bg-white/25 shadow-[1px_0_0_rgba(20,35,45,0.12)]" style={{ left: `${position}%` }} />
          ))}
        </div>
        <div role="group" aria-label="Explore the four bulk trade execution phases" className="absolute inset-0 z-20 grid grid-cols-4">
          {phaseGroups.map((phase) => (
            <button
              key={`region-${phase.phase}`}
              type="button"
              data-hero-phase-region={phase.slug}
              aria-label={`${phase.name}: ${phase.summary}`}
              aria-pressed={selectedPhase === phase.phase}
              onMouseEnter={() => preview(phase.phase)}
              onMouseLeave={stopPreview}
              onFocus={() => preview(phase.phase)}
              onBlur={stopPreview}
              onClick={() => select(phase.phase)}
              className="group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-obaol-300"
            >
              <span className={`absolute inset-x-2 bottom-2 rounded-full bg-black/65 px-2 py-1 text-center text-[8px] font-bold uppercase tracking-[0.16em] text-white opacity-0 backdrop-blur-sm group-hover:opacity-100 group-focus-visible:opacity-100 sm:bottom-3 sm:text-[9px] ${transitionClass}`}>{phase.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite" className="min-h-[5.75rem] pt-3 sm:min-h-[5.25rem]">
        <div
          data-hero-phase-outcome={activePhaseGroup?.slug ?? "none"}
          aria-hidden={!activePhaseGroup}
          className={`flex flex-col gap-3 rounded-2xl border border-obaol-500/30 bg-content1/95 p-3.5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-4 ${transitionClass} ${activePhaseGroup ? "visible opacity-100" : "invisible opacity-0"}`}
        >
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">Illustrative trade · {displayedPhaseGroup.name}</p>
            <p className="mt-1 truncate text-sm font-black text-foreground">Black Pepper · 18 MT</p>
          </div>
          <dl className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-1 text-[10px] sm:text-right">
            <div><dt className="font-semibold db-muted">Status</dt><dd className="mt-0.5 font-bold text-foreground">{displayedPhaseGroup.status}</dd></div>
            <div><dt className="font-semibold db-muted">Evidence</dt><dd className="mt-0.5 font-bold text-foreground">{displayedPhaseGroup.evidence}</dd></div>
          </dl>
        </div>
      </div>

      <div data-execution-route="phase-rail" aria-label="Execution phases: Plan, Verify, Move, and Receive and Approve" className="relative z-30 mx-[7%] mt-1 pb-2 sm:mx-[9%] sm:mt-2 lg:pb-0">
        <div className="absolute left-[7px] right-[7px] top-[7px] h-px bg-obaol-700/70 dark:bg-obaol-300/70" />
        <div className="relative grid grid-cols-4">
          {phaseGroups.map((phase, index) => (
            <button
              key={phase.phase}
              type="button"
              data-execution-phase={phase.slug}
              aria-label={`${phase.name}: ${phase.summary}`}
              aria-pressed={selectedPhase === phase.phase}
              onMouseEnter={() => preview(phase.phase)}
              onMouseLeave={stopPreview}
              onFocus={() => preview(phase.phase)}
              onBlur={stopPreview}
              onClick={() => select(phase.phase)}
              className={`group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/80 ${index === phaseGroups.length - 1 ? "text-right" : index > 0 ? "text-center" : ""}`}
            >
              <span className={`mb-2 block size-[15px] rounded-full border-[3px] border-background shadow-[0_0_0_1px_rgba(180,119,18,0.75)] dark:shadow-[0_0_0_1px_rgba(228,199,153,0.72)] sm:mb-3 ${transitionClass} ${activePhase === phase.phase ? "scale-125 bg-amber-300 shadow-[0_0_18px_rgba(207,152,60,0.9)]" : "bg-obaol-500"} ${index === phaseGroups.length - 1 ? "ml-auto" : index > 0 ? "mx-auto" : ""}`} />
              <span className={`block text-[8px] font-bold uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.2em] xl:text-[11px] ${transitionClass} ${activePhase === phase.phase ? "text-obaol-700 dark:text-obaol-200" : activePhase ? "text-foreground/40" : "text-foreground"}`}>{phase.name}</span>
            </button>
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
                <section key={phase.phase} data-execution-stage-group={phase.slug} className="border-t border-obaol-500/35 pt-3" aria-labelledby={`hero-phase-${phase.slug}`}>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h3 id={`hero-phase-${phase.slug}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-obaol-700 dark:text-obaol-300">{phase.name}</h3>
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
