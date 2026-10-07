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
  [3, 69], [13.5, 58], [24, 66], [34.5, 54], [45, 62],
  [55.5, 49], [66, 57], [76.5, 44], [87, 52], [97, 38],
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

      <div className="pointer-events-none absolute -inset-y-12 left-[-12%] right-[-5%] bg-[radial-gradient(circle_at_62%_46%,rgba(207,152,60,0.22),transparent_42%)] blur-2xl dark:bg-[radial-gradient(circle_at_62%_46%,rgba(207,152,60,0.18),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[330px] overflow-hidden sm:h-[390px] lg:h-full [mask-image:linear-gradient(to_right,transparent_0%,black_14%,black_100%)]">
        <Image
          src="/images/hero-operations/port-operations-stock.webp"
          alt="Container handling and freight operations at an international port"
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 62vw"
          className="object-cover object-center opacity-80 saturate-[0.8] dark:opacity-55 dark:saturate-[0.65]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/20 to-background/80 dark:from-black/5 dark:via-black/25 dark:to-background/90" />
        <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(207,152,60,0.22),transparent_42%,rgba(0,0,0,0.12))] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="absolute right-2 top-4 z-10 max-w-[240px] rounded-2xl border border-obaol-500/25 bg-background/78 px-4 py-3 shadow-xl shadow-obaol-950/10 backdrop-blur-md sm:right-6 sm:top-8 lg:right-[7%] lg:top-[11%]">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-obaol-700 dark:text-obaol-300">
          <FiMapPin aria-hidden="true" /> Connected execution
        </div>
        <p className="mt-1.5 text-sm font-black leading-snug sm:text-base">Requirement to delivery</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/50">10 verified stages</p>
      </div>

      <div className="absolute left-0 right-0 top-[300px] z-10 grid grid-cols-4 gap-2 sm:top-[350px] xl:left-[4%] xl:right-[6%] xl:top-[20%]" aria-label="Execution phases">
        {phaseGroups.map((phase) => (
          <div key={phase.name} data-execution-phase={phase.name.toLowerCase()} className="flex items-center gap-2 border-t border-obaol-500/45 bg-background/45 px-2 pt-2 backdrop-blur-[2px]">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-obaol-800 dark:text-obaol-200">{phase.name}</span>
            <span className="hidden font-mono text-[8px] font-bold text-foreground/55 sm:inline">{phase.range}</span>
          </div>
        ))}
      </div>

      <svg className="pointer-events-none absolute inset-x-[2%] top-[27%] z-[1] hidden h-[52%] w-[96%] overflow-visible xl:block" viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="execution-route-gradient" x1="0" x2="1">
            <stop offset="0" stopColor="#CF983C" stopOpacity="0.2" />
            <stop offset="0.48" stopColor="#F5B942" stopOpacity="0.95" />
            <stop offset="1" stopColor="#CF983C" stopOpacity="0.34" />
          </linearGradient>
          <filter id="execution-route-glow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M30 245 C80 245 92 208 135 208 S195 238 240 238 S300 194 345 194 S405 224 450 224 S510 176 555 176 S615 205 660 205 S720 158 765 158 S825 187 870 187 S930 137 970 137" fill="none" stroke="url(#execution-route-gradient)" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 9" filter="url(#execution-route-glow)" className="motion-safe:animate-pulse" />
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
              className="group relative flex min-h-[42px] items-center gap-3 border-l border-obaol-500/25 py-2 pl-5 sm:min-h-[72px] sm:flex-col sm:items-start sm:justify-start sm:rounded-xl sm:border sm:border-default-200/70 sm:bg-background/72 sm:p-3 sm:shadow-sm sm:backdrop-blur-md xl:absolute xl:left-[var(--stage-x)] xl:top-[var(--stage-y)] xl:min-h-0 xl:w-[104px] xl:-translate-x-1/2 xl:-translate-y-1/2 xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none xl:backdrop-blur-none last:xl:-translate-x-full"
            >
              <span className="absolute -left-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-background bg-obaol-500 shadow-[0_0_14px_rgba(207,152,60,0.75)] sm:static sm:h-7 sm:w-7 sm:translate-y-0 sm:flex sm:items-center sm:justify-center sm:border sm:border-obaol-400/40 sm:bg-background sm:font-mono sm:text-[9px] sm:font-black sm:text-obaol-700 xl:h-8 xl:w-8 dark:sm:text-obaol-300"
              >
                <span className="hidden sm:inline">{String(index + 1).padStart(2, "0")}</span>
              </span>
              <div className="min-w-0 rounded-xl xl:bg-background/82 xl:px-2.5 xl:py-2 xl:shadow-lg xl:shadow-black/10 xl:backdrop-blur-md">
                <span className="font-mono text-[9px] font-black text-obaol-700 sm:hidden dark:text-obaol-300">{String(index + 1).padStart(2, "0")} </span>
                <span className="text-xs font-black leading-tight text-foreground xl:text-[11px]">{stage.label}</span>
                <span className="sr-only">. {stage.message} {stage.deliverable ? `Output: ${stage.deliverable}.` : ""}</span>
              </div>
              {index < stages.length - 1 && <FiArrowDown className="absolute -bottom-2 left-[-8px] text-obaol-500 sm:hidden" size={14} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <div className="absolute bottom-0 left-0 right-0 z-10 hidden items-center justify-between border-t border-default-200/70 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/45 xl:flex xl:left-[4%] xl:right-[6%]">
        <span>Origin intelligence</span>
        <span className="flex items-center gap-2 text-obaol-700 dark:text-obaol-300"><FiCheck aria-hidden="true" /> One accountable system</span>
        <span>Global delivery</span>
      </div>
    </div>
  );
}
