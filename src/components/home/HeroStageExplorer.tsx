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

type LabelSide = "above" | "below" | "destination";

const desktopStagePositions: ReadonlyArray<readonly [number, number, LabelSide]> = [
  [5.5, 310, "below"], [15, 310, "above"], [24.5, 310, "below"],
  [31.5, 230, "above"], [41.5, 230, "below"], [51.5, 230, "above"],
  [63.5, 150, "below"], [73.5, 150, "above"], [83.5, 150, "below"],
  [94.5, 70, "destination"],
] as const;

const phaseGroups = [
  { name: "Plan", range: "01—03", x: "5%", width: "20%" },
  { name: "Verify", range: "04—06", x: "31%", width: "21%" },
  { name: "Move", range: "07—09", x: "63%", width: "21%" },
  { name: "Close", range: "10", x: "91%", width: "7%" },
] as const;

function StageContent({ stage, index }: { stage: HeroStage; index: number }) {
  return (
    <>
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-obaol-500/14 font-mono text-[9px] font-black text-obaol-800 dark:bg-obaol-400/18 dark:text-obaol-200">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-[11px] font-black leading-tight text-inherit">{stage.label}</span>
      <span className="sr-only">. {stage.message} {stage.deliverable ? `Output: ${stage.deliverable}.` : ""}</span>
    </>
  );
}

export default function HeroStageExplorer({ stages }: { stages: readonly HeroStage[] }) {
  return (
    <div data-hero-panel="execution-map" aria-labelledby="execution-map-title" className="relative w-full text-foreground xl:w-[calc(100%+((100vw-80rem)/2)+3rem)]">
      <h2 id="execution-map-title" className="sr-only">OBAOL&apos;s ten-stage execution journey</h2>

      <div data-hero-ink-fade="true" className="relative overflow-visible">
        <div className="pointer-events-none absolute inset-x-[2%] inset-y-[4%] bg-[radial-gradient(ellipse_at_center,rgba(207,152,60,0.14),transparent_68%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(207,152,60,0.11),transparent_70%)]" />

        <div data-hero-lifecycle-visual="true" className="relative -mx-3 h-[220px] overflow-hidden sm:-mx-5 sm:h-[260px] xl:absolute xl:bottom-[-3%] xl:left-0 xl:right-[-4%] xl:top-[-3%] xl:h-auto [mask-image:radial-gradient(ellipse_94%_88%_at_54%_48%,black_52%,transparent_100%)] xl:[mask-image:radial-gradient(ellipse_96%_90%_at_55%_48%,black_58%,transparent_100%)]">
          <Image src="/images/hero-agro-execution-v2.webp" alt="Indian agro-trade execution from crop sourcing and documentation through quality testing, packaging, warehousing, inland transport, and port delivery" fill priority sizes="(max-width: 1023px) 100vw, 62vw" className="object-cover object-center opacity-80 saturate-[0.9] contrast-[0.98] dark:opacity-58 dark:saturate-[0.72]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/8 via-transparent to-background/60 dark:from-slate-950/12 dark:via-transparent dark:to-slate-950/72" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/42 via-transparent to-background/6 dark:from-slate-950/48 dark:via-transparent dark:to-slate-950/10" />
          <div className="absolute inset-0 opacity-30 mix-blend-multiply [background-image:radial-gradient(circle_at_35%_42%,rgba(153,102,31,0.18),transparent_34%),radial-gradient(circle_at_72%_58%,rgba(153,102,31,0.12),transparent_38%)] dark:mix-blend-screen" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background via-background/38 to-transparent dark:from-slate-950 dark:via-slate-950/42" />
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background via-background/32 to-transparent dark:from-slate-950 dark:via-slate-950/38" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/42 to-transparent dark:from-slate-950 dark:via-slate-950/48" />
        </div>

        <div className="relative px-5 pb-6 sm:px-7 sm:pb-7 xl:h-[550px] xl:p-0">
          <div className="absolute right-[4%] top-5 z-30 hidden items-center gap-2 border-b border-obaol-700/35 bg-background/58 px-2 py-2 text-slate-950 backdrop-blur-sm dark:border-obaol-300/30 dark:bg-slate-950/48 dark:text-white xl:flex">
            <FiMapPin className="text-obaol-600 dark:text-obaol-300" aria-hidden="true" />
            <span className="text-[9px] font-black uppercase tracking-[0.16em]">Requirement to delivery · 10 verified stages</span>
          </div>

          <div className="relative hidden h-[400px] translate-y-[88px] xl:block">
            <svg data-execution-route="stepped" className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="execution-spine-gradient" x1="0" x2="1"><stop offset="0" stopColor="#9A6416" /><stop offset="0.58" stopColor="#D99B2B" /><stop offset="1" stopColor="#F2B84B" /></linearGradient></defs>
              <path d="M55 310 H245 L315 230 H515 L635 150 H835 L915 70 H955" fill="none" stroke="rgba(255,255,255,0.82)" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" className="dark:stroke-slate-950/80" />
              <path d="M55 310 H245 L315 230 H515 L635 150 H835 L915 70 H955" fill="none" stroke="url(#execution-spine-gradient)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
            </svg>

            {phaseGroups.map((phase) => (
              <div key={phase.name} data-execution-phase={phase.name.toLowerCase()} style={{ left: phase.x, width: phase.width }} className="absolute top-1 z-10 flex items-center gap-2 border-b border-obaol-600/45 pb-2 text-obaol-900 dark:border-obaol-300/40 dark:text-obaol-100">
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{phase.name}</span><span className="font-mono text-[8px] font-bold opacity-60">{phase.range}</span>
              </div>
            ))}

            <ol className="absolute inset-0 z-20" aria-label="OBAOL's ten-stage execution flow">
              {stages.map((stage, index) => {
                const [x, y, labelSide] = desktopStagePositions[index];
                const position = { "--stage-x": `${x}%`, "--stage-y": `${y}px` } as CSSProperties;
                const labelPosition = labelSide === "above" ? "bottom-5" : labelSide === "destination" ? "right-0 bottom-5" : "top-5";
                return (
                  <li key={stage.id} data-execution-stage={stage.id} style={position} className="absolute left-[var(--stage-x)] top-[var(--stage-y)] -translate-x-1/2 -translate-y-1/2 last:-translate-x-full">
                    <span className="relative z-20 block h-5 w-5 rounded-full border-[5px] border-white bg-obaol-600 shadow-[0_0_0_1px_rgba(154,100,22,0.42)] dark:border-slate-950 dark:bg-obaol-300" aria-hidden="true" />
                    <div className={`absolute ${labelPosition} flex min-w-max items-center gap-2 rounded-md border-l-2 border-obaol-700/55 bg-[#fffaf2]/82 px-2.5 py-1.5 text-slate-950 backdrop-blur-md dark:border-obaol-300/55 dark:bg-slate-950/78 dark:text-white`}><StageContent stage={stage} index={index} /></div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="hidden sm:block xl:hidden">
            <div className="mb-4 flex items-center justify-between gap-2" aria-label="Execution phases">
              {phaseGroups.map((phase) => <div key={phase.name} data-execution-phase={phase.name.toLowerCase()} className="flex items-center gap-1.5 text-obaol-800 dark:text-obaol-200"><span className="text-[9px] font-black uppercase tracking-[0.16em]">{phase.name}</span><span className="font-mono text-[8px] font-bold opacity-60">{phase.range}</span></div>)}
            </div>
            <ol data-execution-route="stepped" className="grid grid-cols-5 gap-2" aria-label="OBAOL's ten-stage execution flow">
              {stages.map((stage, index) => <li key={stage.id} data-execution-stage={stage.id} className="relative min-w-0 rounded-md border-l-2 border-obaol-700/50 bg-[#fffaf2]/80 p-2.5 text-slate-950 backdrop-blur-md dark:border-obaol-300/50 dark:bg-slate-950/76 dark:text-white"><div className="flex items-center gap-1.5"><StageContent stage={stage} index={index} /></div></li>)}
            </ol>
          </div>

          <ol data-execution-route="stepped" className="relative space-y-1 sm:hidden" aria-label="OBAOL's ten-stage execution flow">
            {stages.map((stage, index) => (
              <li key={stage.id} data-execution-stage={stage.id} className="relative flex min-h-12 items-center gap-3 border-l-2 border-obaol-600/40 py-2 pl-5 text-slate-950 dark:border-obaol-300/40 dark:text-white">
                <span className="absolute -left-[6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-background bg-obaol-600 dark:bg-obaol-300" aria-hidden="true" />
                <StageContent stage={stage} index={index} />
                {index < stages.length - 1 && <FiArrowDown className="absolute -bottom-2 left-[-8px] text-obaol-600 dark:text-obaol-300" size={14} aria-hidden="true" />}
              </li>
            ))}
          </ol>

          <div className="mt-5 hidden items-center justify-between border-t border-slate-300/65 pt-3 text-[9px] font-bold uppercase tracking-[0.16em] text-foreground/52 dark:border-white/10 xl:flex">
            <span>Origin intelligence</span><span className="flex items-center gap-2 text-obaol-800 dark:text-obaol-200"><FiCheck aria-hidden="true" /> One accountable system</span><span>Global delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}
