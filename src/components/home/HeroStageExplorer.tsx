import Image from "next/image";
import { FiArrowDown, FiCheckCircle, FiShield } from "react-icons/fi";

export type HeroStage = {
  id: string;
  label: string;
  message: string;
  src: string;
  deliverable?: string;
  phase: "Plan" | "Verify" | "Move" | "Close";
};

const phaseStyles = {
  Plan: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  Verify: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  Move: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Close: "border-obaol-400/30 bg-obaol-400/10 text-obaol-200",
} as const;

export default function HeroStageExplorer({ stages }: { stages: readonly HeroStage[] }) {
  const featured = stages.find((stage) => stage.id === "quality") ?? stages[0];

  return (
    <div
      data-hero-panel="execution-map"
      aria-labelledby="execution-map-title"
      className="relative overflow-hidden rounded-[2rem] border border-obaol-500/25 bg-[#090a08]/95 p-4 text-white shadow-[0_30px_90px_-34px_rgba(207,152,60,0.45)] sm:p-6"
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-obaol-300 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-obaol-500/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-5">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-obaol-300">One connected journey</p>
          <h2 id="execution-map-title" className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
            From requirement to delivery.
          </h2>
        </div>
        <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/55 sm:inline-flex">
          10 verified stages
        </span>
      </div>

      <ol className="relative mt-6 grid gap-0 sm:grid-cols-2 lg:grid-cols-5" aria-label="OBAOL's ten-stage execution flow">
        {stages.map((stage, index) => (
          <li
            key={stage.id}
            data-execution-stage={stage.id}
            className="group relative flex min-h-[92px] items-start gap-4 border-l border-white/10 py-3 pl-5 pr-3 sm:min-h-[116px] sm:border-l-0 sm:border-t sm:px-2 sm:pb-4 sm:pt-5 lg:px-2.5"
          >
            <span className="absolute -left-[5px] top-5 h-2.5 w-2.5 rounded-full border-2 border-[#090a08] bg-obaol-400 shadow-[0_0_16px_rgba(207,152,60,0.7)] sm:-top-[5px] sm:left-2" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black text-obaol-300">{String(index + 1).padStart(2, "0")}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] ${phaseStyles[stage.phase]}`}>
                  {stage.phase}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-bold leading-tight text-white sm:text-[13px]">{stage.label}</h3>
              <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed text-white/48">{stage.message}</p>
            </div>
            {index < stages.length - 1 && (
              <FiArrowDown className="absolute -bottom-2 left-[-8px] z-10 text-obaol-400 sm:hidden" size={15} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>

      <div className="relative mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] sm:grid sm:grid-cols-[0.86fr_1.14fr]">
        <div className="relative min-h-[190px] sm:min-h-[220px]">
          <Image
            src={featured.src}
            alt="Independent laboratory quality testing within the OBAOL execution flow"
            fill
            priority
            sizes="(max-width: 639px) 90vw, 28vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#11120f]" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-[10px] font-bold backdrop-blur-md">
            <FiShield className="text-obaol-300" /> Verified checkpoint
          </span>
        </div>
        <div className="relative flex flex-col justify-center p-5 sm:p-7">
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-obaol-300">Representative outcome</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{featured.label}</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-white/62">{featured.message}</p>
          <div className="mt-4 flex items-start gap-2 text-xs font-semibold text-obaol-100">
            <FiCheckCircle className="mt-0.5 shrink-0 text-obaol-400" size={15} />
            <span>Output: {featured.deliverable}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
