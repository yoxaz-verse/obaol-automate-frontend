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

// [xPercent, topPx, isTop]
const stagePositions = [
  [5, 335, false],  // 01 Discovery (Plan) - Bottom
  [14, 25, true],   // 02 Sampling (Plan) - Top
  [23, 335, false], // 03 Coordination (Plan) - Bottom
  [33, 25, true],   // 04 Documentation (Verify) - Top
  [43, 335, false], // 05 Inspection Visit (Verify) - Bottom
  [52, 25, true],   // 06 Quality Testing (Verify) - Top
  [63, 335, false], // 07 Packaging (Move) - Bottom
  [71, 25, true],   // 08 Procurement (Move) - Top
  [83, 335, false], // 09 Inland Transport (Move) - Bottom
  [95, 25, true],   // 10 Freight Forwarding (Close) - Top
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
      className="relative min-h-[660px] w-full text-foreground sm:min-h-[620px] lg:min-h-[580px] xl:w-[calc(100%+((100vw-80rem)/2)+3rem)]"
    >
      <h2 id="execution-map-title" className="sr-only">OBAOL&apos;s ten-stage execution journey</h2>

      {/* Frame wrapper with glass panel background */}
      <div className="relative h-[580px] w-full rounded-3xl border border-slate-200/80 bg-background/60 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 dark:shadow-black/50 overflow-hidden p-4 sm:p-6 flex flex-col justify-between">

        {/* Ambient glow mesh */}
        <div className="pointer-events-none absolute -inset-y-12 left-[-12%] right-[-5%] bg-[radial-gradient(circle_at_60%_48%,rgba(207,152,60,0.2),transparent_50%)] blur-3xl dark:bg-[radial-gradient(circle_at_60%_48%,rgba(207,152,60,0.15),transparent_55%)]" />

        {/* Background photo visual layer */}
        <div
          data-hero-lifecycle-visual="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl opacity-70 dark:opacity-50 [mask-image:radial-gradient(ellipse_90%_85%_at_50%_50%,black_45%,transparent_100%)]"
        >
          <Image
            src="/images/hero-agro-execution-v2.webp"
            alt="Indian agro-trade execution from crop sourcing and documentation through quality testing, packaging, warehousing, inland transport, and port delivery"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 62vw"
            className="object-cover object-center saturate-[0.85] contrast-[0.95]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/95 dark:from-slate-950/85 dark:via-slate-950/50 dark:to-slate-950/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/50 dark:from-slate-950/90 dark:via-transparent dark:to-slate-950/60" />
        </div>

        {/* Top Header Controls: Phase Group Trackers & Status Pill */}
        <div className="relative z-30 flex items-center justify-between gap-3 px-2 pt-1">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-background/90 px-3 py-1.5 shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-slate-900/85" aria-label="Execution phases">
            {phaseGroups.map((phase) => (
              <div
                key={phase.name}
                data-execution-phase={phase.name.toLowerCase()}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors hover:bg-obaol-500/10"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-obaol-800 dark:text-obaol-200">{phase.name}</span>
                <span className="hidden font-mono text-[9px] font-bold text-foreground/60 sm:inline">{phase.range}</span>
              </div>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-obaol-600/35 bg-background/90 px-3.5 py-1.5 shadow-md backdrop-blur-md dark:border-obaol-300/30 dark:bg-slate-950/90">
            <FiMapPin className="text-obaol-600 dark:text-obaol-400 text-xs" aria-hidden="true" />
            <div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-obaol-800 dark:text-obaol-200">Connected execution</div>
              <p className="text-[10px] font-bold text-foreground/70">Requirement to delivery • 10 verified stages</p>
            </div>
          </div>
        </div>

        {/* Desktop Interactive Canvas Area (XL view) */}
        <div className="relative inset-x-0 hidden h-[420px] w-full xl:block">

          {/* SVG Route Wave (Desktop / XL) */}
          <svg data-execution-route="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-full w-full overflow-visible" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="execution-route-gradient" x1="0" x2="1">
                <stop offset="0" stopColor="#9A6416" />
                <stop offset="0.5" stopColor="#D99B2B" />
                <stop offset="1" stopColor="#F0B33F" />
              </linearGradient>
              <filter id="execution-route-glow" x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Shadow Back Line */}
            <path
              d="M 50 275 C 95 275, 95 145, 140 145 C 185 145, 185 275, 230 275 C 280 275, 280 145, 330 145 C 380 145, 380 275, 430 275 C 475 275, 475 145, 520 145 C 575 145, 575 275, 630 275 C 670 275, 670 145, 710 145 C 770 145, 770 275, 830 275 C 890 275, 890 145, 950 145"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="8"
              strokeLinecap="round"
              className="dark:stroke-black/60"
            />
            {/* Golden Gradient Line */}
            <path
              d="M 50 275 C 95 275, 95 145, 140 145 C 185 145, 185 275, 230 275 C 280 275, 280 145, 330 145 C 380 145, 380 275, 430 275 C 475 275, 475 145, 520 145 C 575 145, 575 275, 630 275 C 670 275, 670 145, 710 145 C 770 145, 770 275, 830 275 C 890 275, 890 145, 950 145"
              fill="none"
              stroke="url(#execution-route-gradient)"
              strokeWidth="4.5"
              strokeLinecap="round"
              filter="url(#execution-route-glow)"
            />
          </svg>

          {/* Desktop Stage Cards & Connector Pins */}
          <ol className="absolute inset-0 z-20" aria-label="OBAOL's ten-stage execution flow">
            {stages.map((stage, index) => {
              const [x, topPx, isTop] = stagePositions[index];
              const position = { "--stage-x": `${x}%`, "--stage-top": `${topPx}px` } as CSSProperties;
              const pinY = isTop ? "145px" : "275px";

              return (
                <li
                  key={stage.id}
                  data-execution-stage={stage.id}
                  style={position}
                  className="group absolute left-[var(--stage-x)] top-[var(--stage-top)] -translate-x-1/2 last:left-[95%] last:-translate-x-full"
                >
                  {/* Glowing Pin Dot on Golden Route Line */}
                  <div
                    style={{ top: pinY }}
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                  >
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
                      <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-amber-500 bg-background shadow-[0_0_10px_rgba(217,155,43,0.9)]" />
                    </span>
                  </div>

                  {/* Vertical Connector Stem */}
                  <div
                    style={{ top: isTop ? "36px" : "-60px", height: isTop ? "109px" : "60px" }}
                    className="pointer-events-none absolute left-1/2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-500/70 via-amber-500/40 to-amber-500/10 z-10"
                  />

                  {/* Glass Stage Card Badge */}
                  <div className="relative z-20 min-w-[105px] max-w-[150px] rounded-xl border border-slate-200/90 bg-background/95 px-2.5 py-1.5 shadow-xl shadow-black/10 backdrop-blur-md transition-all duration-200 group-hover:scale-105 group-hover:border-amber-500/60 dark:border-white/20 dark:bg-slate-950/90 dark:sm:border-obaol-300/55 dark:xl:border-white/20">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex h-4 w-4.5 shrink-0 items-center justify-center rounded bg-obaol-500/15 font-mono text-[9px] font-black text-obaol-700 dark:bg-obaol-400/20 dark:text-obaol-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[11px] font-black leading-tight text-foreground whitespace-nowrap">
                        {stage.label}
                      </span>
                    </div>
                    <span className="sr-only">. {stage.message} {stage.deliverable ? `Output: ${stage.deliverable}.` : ""}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Mobile & Tablet Responsive List (under XL) */}
        <ol className="relative z-20 space-y-2 pt-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 lg:grid-cols-5 xl:hidden" aria-label="OBAOL's ten-stage execution flow">
          {stages.map((stage, index) => (
            <li
              key={stage.id}
              data-execution-stage={stage.id}
              className="group relative flex min-h-[46px] items-center gap-3 border-l-2 border-obaol-600/45 py-2 pl-4 sm:min-h-[68px] sm:flex-col sm:items-start sm:justify-start sm:rounded-xl sm:border sm:border-default-300/90 sm:bg-background/90 sm:p-3 sm:shadow-md sm:backdrop-blur-lg dark:sm:border-white/20 dark:sm:bg-black/78 dark:sm:border-obaol-300/55"
            >
              <span className="absolute -left-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-background bg-obaol-600 shadow-[0_0_12px_rgba(207,152,60,0.7)] sm:static sm:h-7 sm:w-7 sm:translate-y-0 sm:flex sm:items-center sm:justify-center sm:rounded-lg sm:border sm:border-obaol-600/40 sm:bg-obaol-500/10 sm:font-mono sm:text-[10px] sm:font-black sm:text-obaol-800 dark:sm:border-obaol-300/55 dark:sm:bg-slate-900 dark:sm:text-obaol-200">
                <span className="hidden sm:inline">{String(index + 1).padStart(2, "0")}</span>
              </span>
              <div className="min-w-0 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-black text-obaol-700 sm:hidden dark:text-obaol-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-black leading-tight text-foreground whitespace-nowrap">
                    {stage.label}
                  </span>
                </div>
                <span className="sr-only">. {stage.message} {stage.deliverable ? `Output: ${stage.deliverable}.` : ""}</span>
              </div>
              {index < stages.length - 1 && <FiArrowDown className="absolute -bottom-2 left-[-8px] text-obaol-500 sm:hidden" size={14} aria-hidden="true" />}
            </li>
          ))}
        </ol>

        {/* Footer info bar */}
        <div className="relative z-30 hidden items-center justify-between border-t border-slate-200/70 dark:border-white/10 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/55 xl:flex">
          <span>Origin intelligence</span>
          <span className="flex items-center gap-2 text-obaol-700 dark:text-obaol-300 font-extrabold"><FiCheck aria-hidden="true" /> One accountable system</span>
          <span>Global delivery</span>
        </div>
      </div>
    </div>
  );
}

