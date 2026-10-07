import Image from "next/image";

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
    <div data-hero-panel="execution-map" className="relative min-w-0 lg:pt-1">
      <h2 className="sr-only">Ten-stage agro trade execution journey</h2>
      <div data-hero-ink-fade="true" className="relative">
        <div data-hero-lifecycle-visual="true" className="relative h-[17rem] overflow-hidden sm:h-[21rem] lg:h-[22.5rem] xl:h-[24rem]">
          <Image
            src="/images/hero-agro-execution-v2.webp"
            alt="Indian agro-trade lifecycle from crop sourcing and documentation through quality verification, packaging, warehousing, and delivery"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 58vw"
            className="object-cover object-center dark:brightness-[0.72] dark:saturate-[0.88]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/15 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/55 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />

          <p className="absolute right-6 top-6 text-[9px] font-semibold uppercase tracking-[0.18em] text-foreground/65 sm:right-8 sm:top-8 sm:text-[10px]">
            One connected agro execution system
          </p>

          <div data-execution-route="phase-rail" aria-label="Execution phases: Plan, Verify, Move, and Close" className="absolute inset-x-6 bottom-8 sm:inset-x-9 sm:bottom-10">
            <div className="absolute left-1 right-1 top-[7px] h-px bg-obaol-600/70 dark:bg-obaol-300/75" />
            <div className="relative grid grid-cols-[3fr_3fr_3fr_1fr]">
              {phaseGroups.map((phase, index) => (
                <div key={phase.phase} data-execution-phase={phase.phase.toLowerCase()} className={index === phaseGroups.length - 1 ? "text-right" : ""}>
                  <span className={`mb-3 block size-[15px] rounded-full border-[3px] border-background bg-obaol-500 shadow-[0_0_0_1px_rgba(180,119,18,0.75)] ${index === phaseGroups.length - 1 ? "ml-auto" : ""}`} />
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground sm:text-[11px]">{phase.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export function HeroStageBand({ stages }: { stages: readonly HeroStage[] }) {
  return (
    <section data-execution-stage-band="true" aria-labelledby="execution-stage-band-title" className="mt-12 border-y border-default-200/70 py-7 lg:mt-14 lg:py-8">
      <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
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
    </section>
  );
}
