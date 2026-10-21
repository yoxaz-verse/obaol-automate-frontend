import Image from "next/image";
import { inkArtworkMaskStyle } from "@/components/home/inkArtworkMask";

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
  return (
    <div data-hero-panel="execution-map" data-hero-depth-scene="true" className="relative min-w-0 px-2 py-5 sm:px-6 lg:py-8 [perspective:1200px]">
      <h2 className="sr-only">Connected Indian agro trade operations</h2>
      <div className="pointer-events-none absolute inset-[12%] rounded-full bg-obaol-400/15 blur-3xl dark:bg-obaol-400/10" />
      <div data-hero-depth-layer="back" aria-hidden="true" className="absolute inset-[12%_5%_5%_13%] rounded-[2rem] border border-obaol-400/20 bg-obaol-400/10 shadow-[0_28px_70px_-36px_rgba(207,152,60,0.7)] [transform:translate3d(18px,18px,-28px)_rotateY(-3deg)]" />
      <div data-hero-depth-layer="middle" aria-hidden="true" className="absolute inset-[8%_8%_9%_8%] rounded-[2rem] border border-white/50 bg-content1/45 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.65)] [transform:translate3d(8px,9px,-12px)_rotateY(-2deg)] dark:border-white/10" />
      <div data-hero-depth-layer="front" data-hero-lifecycle-visual="true" data-hero-masked-image="true" data-ink-artwork-mask="true" style={inkArtworkMaskStyle} className="relative aspect-[16/9] overflow-hidden drop-shadow-[0_30px_30px_rgba(15,23,42,0.18)] [transform:rotateX(1.5deg)_rotateY(-2deg)_translateZ(18px)]">
        <div className="absolute -inset-[2%]">
          <Image
            src="/images/hero-agro-execution-art-v2.webp"
            alt="Expressive ink-and-watercolor artwork of connected Indian agro trade operations from origin through processing and dispatch"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 58vw"
            className="object-cover object-center contrast-[1.02] saturate-[0.98] dark:brightness-[0.8] dark:saturate-[0.9]"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/14 via-transparent to-obaol-500/10" />
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
