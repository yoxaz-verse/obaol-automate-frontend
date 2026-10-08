import Image from "next/image";
import type { CSSProperties } from "react";

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

const lifecycleMask = {
  maskImage:
    "radial-gradient(ellipse 62% 54% at 52% 50%, #000 45%, rgba(0,0,0,0.94) 60%, rgba(0,0,0,0.46) 78%, transparent 100%)",
  WebkitMaskImage:
    "radial-gradient(ellipse 62% 54% at 52% 50%, #000 45%, rgba(0,0,0,0.94) 60%, rgba(0,0,0,0.46) 78%, transparent 100%)",
} satisfies CSSProperties;

export default function HeroStageExplorer() {
  return (
    <div data-hero-panel="execution-map" className="relative min-w-0">
      <h2 className="sr-only">Ten-stage agro trade execution journey</h2>
      <div data-hero-ink-fade="true" data-hero-assistant-safe-zone="true" className="relative xl:pr-20">
        <div data-hero-lifecycle-heading="true" className="mb-3 flex items-end justify-between gap-4 px-5 sm:px-8">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-obaol-700 dark:text-obaol-300">Complete trade execution</p>
            <p className="mt-1 text-base font-bold tracking-tight text-foreground sm:text-lg">From origin to delivery</p>
          </div>
          <p className="pb-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-[10px]">10 verified stages</p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-[10%] rounded-full bg-obaol-400/10 blur-3xl dark:bg-obaol-400/[0.08]" />
          <div data-hero-lifecycle-visual="true" data-hero-masked-image="true" style={lifecycleMask} className="relative aspect-[16/9] overflow-hidden">
            <div className="absolute -inset-[3%]">
              <Image
                src="/images/hero-agro-execution-v2.webp"
                alt="Indian agro-trade lifecycle from crop sourcing and documentation through quality verification, packaging, warehousing, and delivery"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 58vw"
                className="object-cover object-center contrast-[1.02] saturate-[0.96] dark:brightness-[0.8] dark:saturate-[0.9]"
              />
            </div>
          </div>
        </div>

        <div data-execution-route="phase-rail" aria-label="Execution phases: Plan, Verify, Move, and Close" className="relative mx-5 mt-1 sm:mx-8 sm:mt-2">
          <div className="absolute left-[7px] right-[7px] top-[7px] h-px bg-obaol-700/80 dark:bg-obaol-300/85" />
          <div className="relative grid grid-cols-4">
            {phaseGroups.map((phase, index) => (
              <div key={phase.phase} data-execution-phase={phase.phase.toLowerCase()} className={index === phaseGroups.length - 1 ? "text-right" : index > 0 ? "text-center" : ""}>
                <span className={`mb-3 block size-[15px] rounded-full border-[3px] border-background bg-obaol-500 shadow-[0_0_0_1px_rgba(180,119,18,0.75)] ${index === phaseGroups.length - 1 ? "ml-auto" : index > 0 ? "mx-auto" : ""}`} />
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground sm:text-[11px]">{phase.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroStageBand({ stages }: { stages: readonly HeroStage[] }) {
  return (
    <section data-execution-stage-band="true" aria-labelledby="execution-stage-band-title" className="border-y border-default-200/70 bg-default-50/55 py-7 dark:bg-default-50/[0.025] lg:py-8">
      <div className="public-layout-container container mx-auto px-6 sm:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-obaol-700 dark:text-obaol-300">One accountable execution path</p>
              <h2 id="execution-stage-band-title" className="mt-1 text-lg font-bold tracking-tight text-foreground sm:text-xl">From requirement to delivery</h2>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">10 verified stages</p>
          </div>

          <div aria-label="All ten execution stages grouped by phase" className="grid gap-x-10 gap-y-7 sm:grid-cols-2 xl:grid-cols-[3fr_3fr_3fr_1.2fr]">
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
