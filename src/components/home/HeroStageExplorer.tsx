import Image from "next/image";
import type { CSSProperties } from "react";
import { FiArrowDown, FiCheck, FiMapPin } from "react-icons/fi";

export type HeroStage = {
  id: string;
  label: string;
  message: string;
  src: string;
  deliverable?: string;
  phase: "Plan" | "Verify" | "Move" | "Close";
};

const stagePositions = [
  [4, 71], [14, 62], [24, 68], [34, 57], [44, 63],
  [54, 52], [64, 58], [74, 47], [84, 53], [96, 42],
] as const;

const phaseGroups = [
  { name: "Plan", range: "01—03" },
  { name: "Verify", range: "04—06" },
  { name: "Move", range: "07—09" },
  { name: "Close", range: "10" },
] as const;

export default function HeroStageExplorer({ stages }: { stages: readonly HeroStage[] }) {
  return (
    <div
      data-hero-panel="execution-map"
      aria-labelledby="execution-map-title"
      className="relative min-h-[760px] w-full text-foreground sm:min-h-[690px] lg:min-h-[680px] xl:w-[calc(100%+((100vw-80rem)/2)+3rem)]"
    >
      <h2 id="execution-map-title" className="sr-only">OBAOL&apos;s ten-stage execution journey</h2>

      <div className="pointer-events-none absolute -inset-y-12 left-[-12%] right-[-5%] bg-[radial-gradient(circle_at_60%_48%,rgba(207,152,60,0.2),transparent_48%)] blur-2xl dark:bg-[radial-gradient(circle_at_60%_48%,rgba(207,152,60,0.16),transparent_50%)]" />
      <div
        data-hero-lifecycle-visual="true"
        className="pointer-events-none absolute inset-x-[-2%] -top-8 h-[370px] overflow-hidden sm:h-[430px] lg:-bottom-8 lg:h-auto [mask-image:radial-gradient(ellipse_88%_78%_at_62%_48%,black_48%,transparent_100%)]"
      >
        <Image
          src="/images/hero-agro-execution-v2.webp"
          alt="Indian agro-trade execution from crop sourcing and documentation through quality testing, packaging, warehousing, inland transport, and port delivery"
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 62vw"
          className="object-cover object-center opacity-68 saturate-[0.78] contrast-[0.92] dark:opacity-52 dark:saturate-[0.68] dark:contrast-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-background/10 to-background/85 dark:from-background/40 dark:via-black/20 dark:to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/18 to-background/5 dark:from-background dark:via-background/28 dark:to-black/5" />
        <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(207,152,60,0.16),transparent_45%,rgba(15,23,42,0.08))] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="absolute left-0 right-0 top-[300px] z-30 grid grid-cols-4 gap-1.5 sm:top-[350px] xl:left-[5%] xl:right-[5%] xl:top-[13%]" aria-label="Execution phases">
        {phaseGroups.map((phase) => (
          <div key={phase.name} data-execution-phase={phase.name.toLowerCase()} className="flex items-center gap-2 rounded-full border border-obaol-600/35 bg-background/90 px-3 py-2 shadow-sm backdrop-blur-md dark:border-obaol-300/30 dark:bg-black/72">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-obaol-800 dark:text-obaol-200">{phase.name}</span>
            <span className="hidden font-mono text-[8px] font-bold text-foreground/60 sm:inline">{phase.range}</span>
          </div>
        ))}
      </div>

      <svg data-execution-route="true" className="pointer-events-none absolute inset-[0_2%] z-10 hidden h-full w-[96%] overflow-visible xl:block" viewBox="0 0 1000 680" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="execution-route-gradient" x1="0" x2="1">
            <stop offset="0" stopColor="#9A6416" />
            <stop offset="0.5" stopColor="#D99B2B" />
            <stop offset="1" stopColor="#F0B33F" />
          </linearGradient>
          <filter id="execution-route-glow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M40 483 C85 483 100 422 140 422 S200 462 240 462 S300 388 340 388 S400 428 440 428 S500 354 540 354 S600 394 640 394 S700 320 740 320 S800 360 840 360 S920 286 960 286" fill="none" stroke="rgba(255,255,255,0.86)" strokeWidth="8" strokeLinecap="round" className="dark:stroke-black/55" />
        <path d="M40 483 C85 483 100 422 140 422 S200 462 240 462 S300 388 340 388 S400 428 440 428 S500 354 540 354 S600 394 640 394 S700 320 740 320 S800 360 840 360 S920 286 960 286" fill="none" stroke="url(#execution-route-gradient)" strokeWidth="4.5" strokeLinecap="round" filter="url(#execution-route-glow)" />
      </svg>

      <ol className="absolute inset-x-0 top-[350px] z-20 space-y-0 pl-2 sm:top-[405px] sm:grid sm:grid-cols-5 sm:gap-x-3 sm:gap-y-5 sm:pl-0 xl:inset-0 xl:block" aria-label="OBAOL's ten-stage execution flow">
        {stages.map((stage, index) => {
          const [x, y] = stagePositions[index];
          const position = { "--stage-x": `${x}%`, "--stage-y": `${y}%` } as CSSProperties;
          return (
            <li
              key={stage.id}
              data-execution-stage={stage.id}
              style={position}
              className="group relative flex min-h-[42px] items-center gap-3 border-l-2 border-obaol-600/45 py-2 pl-5 sm:min-h-[72px] sm:flex-col sm:items-start sm:justify-start sm:rounded-xl sm:border sm:border-default-300/90 sm:bg-background/90 sm:p-3 sm:shadow-md sm:backdrop-blur-lg xl:absolute xl:left-[var(--stage-x)] xl:top-[var(--stage-y)] xl:min-h-0 xl:w-[126px] xl:-translate-x-1/2 xl:-translate-y-1/2 xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none xl:backdrop-blur-none last:xl:-translate-x-full dark:sm:border-white/20 dark:sm:bg-black/78"
            >
              <span className="absolute -left-[6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-background bg-obaol-600 shadow-[0_0_14px_rgba(207,152,60,0.7)] sm:static sm:h-8 sm:w-8 sm:translate-y-0 sm:flex sm:items-center sm:justify-center sm:border-2 sm:border-obaol-700/55 sm:bg-background sm:font-mono sm:text-[10px] sm:font-black sm:text-obaol-800 xl:h-10 xl:w-10 dark:sm:border-obaol-300/55 dark:sm:bg-slate-950 dark:sm:text-obaol-200"
              >
                <span className="hidden sm:inline">{String(index + 1).padStart(2, "0")}</span>
              </span>
              <div className="min-w-0 rounded-xl xl:border xl:border-default-300/90 xl:bg-background/95 xl:px-3 xl:py-2.5 xl:shadow-lg xl:shadow-black/15 xl:backdrop-blur-lg dark:xl:border-white/20 dark:xl:bg-slate-950/90">
                <span className="font-mono text-[9px] font-black text-obaol-700 sm:hidden dark:text-obaol-300">{String(index + 1).padStart(2, "0")} </span>
                <span className="text-xs font-black leading-tight text-foreground xl:text-xs">{stage.label}</span>
                <span className="sr-only">. {stage.message} {stage.deliverable ? `Output: ${stage.deliverable}.` : ""}</span>
              </div>
              {index < stages.length - 1 && <FiArrowDown className="absolute -bottom-2 left-[-8px] text-obaol-500 sm:hidden" size={14} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <div className="absolute right-[4%] top-[23%] z-30 hidden max-w-[210px] rounded-2xl border border-obaol-600/35 bg-background/94 px-4 py-3 shadow-xl shadow-black/15 backdrop-blur-lg xl:block dark:border-obaol-300/30 dark:bg-slate-950/90">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-obaol-800 dark:text-obaol-200"><FiMapPin aria-hidden="true" /> Connected execution</div>
        <p className="mt-1.5 text-sm font-black leading-snug">Requirement to delivery</p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-foreground/55">10 verified stages</p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 hidden items-center justify-between border-t border-default-200/70 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/45 xl:flex xl:left-[4%] xl:right-[6%]">
        <span>Origin intelligence</span>
        <span className="flex items-center gap-2 text-obaol-700 dark:text-obaol-300"><FiCheck aria-hidden="true" /> One accountable system</span>
        <span>Global delivery</span>
      </div>
    </div>
  );
}
