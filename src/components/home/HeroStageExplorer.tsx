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
    <div data-hero-panel="execution-map" data-hero-depth-scene="true" className="relative min-w-0 px-1 py-5 sm:px-4 lg:py-8 [perspective:1200px]">
      <h2 className="sr-only">Connected Indian agro trade operations</h2>
      <div className="pointer-events-none absolute inset-[16%_8%_10%] rounded-full bg-obaol-400/12 blur-3xl dark:bg-obaol-400/[0.08]" />
      <figure
        data-hero-segmented-artwork="true"
        data-hero-lifecycle-visual="true"
        role="img"
        aria-label="Watercolor illustration of connected Indian agro trade operations moving from farm sourcing through preparation and onward to delivery"
        className="relative grid aspect-[16/9] grid-cols-[0.86fr_1.18fr_0.92fr] items-stretch gap-1.5 sm:gap-2.5 lg:gap-3.5 [transform-style:preserve-3d]"
      >
        <div data-hero-depth-layer="origin" aria-hidden="true" className="relative my-[7%] overflow-hidden rounded-l-[1.4rem] rounded-r-lg border border-white/60 bg-content1 shadow-[0_18px_30px_-22px_rgba(15,23,42,0.48)] [transform:translate3d(0,8px,-14px)_rotateY(2deg)] sm:rounded-l-[1.75rem] dark:border-white/15">
          <Image
            src="/images/hero-agro-execution-art-v2.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(max-width: 1023px) 30vw, 18vw"
            className="object-cover contrast-[1.02] saturate-[0.98] dark:brightness-[0.8] dark:saturate-[0.9]"
            style={{ objectPosition: "16% center" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/[0.08]" />
        </div>
        <div data-hero-depth-layer="prepare" aria-hidden="true" className="relative my-[1.5%] overflow-hidden rounded-xl border border-white/70 bg-content1 shadow-[0_28px_44px_-27px_rgba(15,23,42,0.62)] [transform:translateZ(22px)] sm:rounded-[1.4rem] dark:border-white/20">
          <Image
            src="/images/hero-agro-execution-art-v2.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(max-width: 1023px) 40vw, 24vw"
            className="object-cover contrast-[1.03] saturate-[1.02] dark:brightness-[0.82] dark:saturate-[0.92]"
            style={{ objectPosition: "52% center" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/14 via-transparent to-obaol-500/[0.08]" />
          <div className="pointer-events-none absolute inset-y-[8%] left-0 w-px bg-white/70 dark:bg-white/25" />
          <div className="pointer-events-none absolute inset-y-[8%] right-0 w-px bg-black/10 dark:bg-white/10" />
        </div>
        <div data-hero-depth-layer="move" aria-hidden="true" className="relative my-[5%] overflow-hidden rounded-l-lg rounded-r-[1.4rem] border border-white/60 bg-content1 shadow-[0_20px_34px_-24px_rgba(15,23,42,0.52)] [transform:translate3d(0,5px,-8px)_rotateY(-2deg)] sm:rounded-r-[1.75rem] dark:border-white/15">
          <Image
            src="/images/hero-agro-execution-art-v2.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(max-width: 1023px) 32vw, 19vw"
            className="object-cover contrast-[1.02] saturate-[0.98] dark:brightness-[0.8] dark:saturate-[0.9]"
            style={{ objectPosition: "87% center" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-obaol-500/[0.08] via-transparent to-black/[0.08]" />
        </div>
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
