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
  coordinator?: string;
  provider?: string;
  evidence?: string;
  railOrder?: number;
};

type HeroResponsibility = {
  id: string;
  label: string;
  phase: HeroStage["phase"];
  coordinator: string;
  provider: string;
  evidence: string;
  railOrder: number;
};

type HeroSelection =
  | { kind: "phase"; id: HeroStage["phase"] }
  | { kind: "responsibility"; id: string };

type HeroRailItem =
  | { kind: "phase"; phase: (typeof phaseGroups)[number] }
  | { kind: "responsibility"; responsibility: HeroResponsibility };

const phaseGroups: Array<{ name: string; slug: string; range: string; phase: HeroStage["phase"]; summary: string; left: number; width: number; status: string; provider: string; evidence: string }> = [
  { name: "Plan", slug: "plan", range: "01—03", phase: "Plan", summary: "Coordinate the buyer requirement, qualified origins, suppliers, and representative samples.", left: 0, width: 25, status: "Requirement and supply plan coordinated", provider: "Buyer, sourcing partners, and suppliers", evidence: "Requirement, origin shortlist, and sample record" },
  { name: "Verify", slug: "verify", range: "04—06", phase: "Verify", summary: "Coordinate documentation, warehouse inspection, quality testing, and specification confirmation.", left: 25, width: 25, status: "Specification and trade file verified", provider: "Documentation specialists, inspectors, and laboratories", evidence: "Trade file, stock audit, and COA" },
  { name: "Move", slug: "move", range: "07—11", phase: "Move", summary: "Coordinate payment readiness, packaging, transport, customs clearance, and international freight.", left: 50, width: 25, status: "Cargo and shipment milestones coordinated", provider: "Payment parties, packers, carriers, CHA, and forwarders", evidence: "Readiness, clearance, tracking, and bill of lading" },
  { name: "Receive & Approve", slug: "receive-and-approve", range: "12", phase: "Receive & Approve", summary: "Coordinate destination receipt so the overseas buyer can inspect and approve the completed handoff.", left: 75, width: 25, status: "International buyer approved receipt", provider: "Buyer and destination receiving partner", evidence: "Acceptance and delivery record" },
];

const responsibilities: readonly HeroResponsibility[] = [
  { id: "buyer-requirement", label: "Buyer Requirement", phase: "Plan", coordinator: "OBAOL structures the required product, quantity, specification, destination, and timeline.", provider: "Buyer or procurement team", evidence: "Structured buyer requirement", railOrder: 1 },
  { id: "supplier-sourcing", label: "Supplier Sourcing", phase: "Plan", coordinator: "OBAOL coordinates qualified origin and supplier coverage for the requirement.", provider: "Bulk suppliers and sourcing partners", evidence: "Origin and supplier shortlist", railOrder: 2 },
  { id: "sampling", label: "Sampling", phase: "Plan", coordinator: "OBAOL coordinates representative samples and the buyer review milestone.", provider: "Supplier, sampler, and buyer", evidence: "Sample dispatch and review record", railOrder: 3 },
  { id: "documentation", label: "Documentation", phase: "Verify", coordinator: "OBAOL coordinates the commercial and compliance documents needed to progress the trade.", provider: "Documentation specialists and counterparties", evidence: "Commercial and customs-ready trade file", railOrder: 4 },
  { id: "warehouse-inspection", label: "Warehouse Inspection", phase: "Verify", coordinator: "OBAOL coordinates an independent check of stock, operations, and readiness at origin.", provider: "Independent warehouse inspector", evidence: "On-site stock and warehouse audit", railOrder: 5 },
  { id: "quality-coa", label: "Quality & COA", phase: "Verify", coordinator: "OBAOL coordinates testing against the agreed specification and tracks approval.", provider: "Accredited quality laboratory", evidence: "Certificate of Analysis (COA)", railOrder: 6 },
  { id: "payment-readiness", label: "Payment Readiness", phase: "Move", coordinator: "OBAOL tracks the agreed payment milestone before the relevant cargo release or shipment action.", provider: "Buyer, seller, bank, or agreed payment party", evidence: "Payment milestone confirmation", railOrder: 7 },
  { id: "packaging-fumigation", label: "Packaging & Fumigation", phase: "Move", coordinator: "OBAOL coordinates export-ready packing and required fumigation against the trade specification.", provider: "Packaging and fumigation providers", evidence: "Packing and fumigation record", railOrder: 8 },
  { id: "inland-transport", label: "Inland Transport", phase: "Move", coordinator: "OBAOL coordinates dispatch and inland movement from origin to the shipment handoff.", provider: "Inland carrier and logistics partner", evidence: "Dispatch and inland tracking record", railOrder: 9 },
  { id: "cha-customs", label: "CHA & Customs", phase: "Move", coordinator: "OBAOL coordinates clearance milestones with the appointed Customs House Agent.", provider: "Licensed Customs House Agent or customs broker", evidence: "Customs filing and clearance evidence", railOrder: 10 },
  { id: "freight-forwarding", label: "Freight Forwarding", phase: "Move", coordinator: "OBAOL coordinates the international booking, carrier handoff, and shipment milestones.", provider: "Freight forwarder and international carrier", evidence: "Booking, tracking, and bill of lading", railOrder: 11 },
  { id: "buyer-receipt", label: "Buyer Receipt & Acceptance", phase: "Receive & Approve", coordinator: "OBAOL records destination receipt, specification confirmation, and buyer acceptance.", provider: "Buyer and destination receiving partner", evidence: "Acceptance and delivery record", railOrder: 12 },
];

const responsibilityItems = (phase: HeroStage["phase"]): HeroRailItem[] => responsibilities
  .filter((item) => item.phase === phase)
  .map((responsibility) => ({ kind: "responsibility", responsibility }));

const executionRail: readonly HeroRailItem[] = [
  { kind: "phase", phase: phaseGroups[0] },
  ...responsibilityItems("Plan"),
  { kind: "phase", phase: phaseGroups[1] },
  ...responsibilityItems("Verify"),
  { kind: "phase", phase: phaseGroups[2] },
  ...responsibilityItems("Move"),
  ...responsibilityItems("Receive & Approve"),
  { kind: "phase", phase: phaseGroups[3] },
];

const railPosition = (index: number) => {
  if (index <= 4) return (index / 4) * (100 / 3);
  if (index <= 8) return (100 / 3) + ((index - 4) / 4) * (100 / 3);
  return (200 / 3) + ((index - 8) / 7) * (100 / 3);
};

const HERO_ARTWORK = "/images/hero-bulk-execution-v7.webp";

export default function HeroStageExplorer() {
  const adaptiveMotion = useAdaptiveMotion();
  const reducedMotion = adaptiveMotion.prefersReducedMotion;
  const [selectedItem, setSelectedItem] = useState<HeroSelection | null>(null);
  const [previewItem, setPreviewItem] = useState<HeroSelection | null>(null);
  const activeItem = previewItem ?? selectedItem;
  const panelVisible = Boolean(activeItem);
  const activeResponsibility = activeItem?.kind === "responsibility" ? responsibilities.find((item) => item.id === activeItem.id) : undefined;
  const activePhase = activeItem?.kind === "phase" ? activeItem.id : activeResponsibility?.phase;
  const activePhaseGroup = phaseGroups.find((phase) => phase.phase === activePhase);
  const displayedPhaseGroup = activePhaseGroup ?? phaseGroups[0];
  const displayedResponsibility = activeResponsibility;
  const transitionClass = reducedMotion ? "" : "transition-[filter,opacity,transform,background-color,color] duration-300 ease-out";

  const activeRailIndex = activeItem
    ? executionRail.findIndex((item) =>
        item.kind === "phase"
          ? item.phase.phase === activePhase
          : item.responsibility.id === activeResponsibility?.id
      )
    : -1;
  const progressPercent = activeRailIndex >= 0 ? railPosition(activeRailIndex) : 0;

  const selectionKey = (item: HeroSelection | null) => item ? `${item.kind}:${item.id}` : "none";
  const preview = (item: HeroSelection) => setPreviewItem(item);
  const stopPreview = () => setPreviewItem(null);
  const select = (item: HeroSelection) => setSelectedItem((current) => selectionKey(current) === selectionKey(item) ? null : item);

  return (
    <div data-hero-panel="execution-map" data-active-phase={activePhaseGroup?.slug ?? "none"} className="relative min-w-0 px-1 py-5 sm:px-4 lg:px-0 lg:py-0 xl:w-[calc(100%+clamp(3rem,8vw,10rem))] xl:max-w-none">
      <h2 className="sr-only">Connected bulk trade execution network</h2>
      <div className="pointer-events-none absolute -inset-3 sm:-inset-6 rounded-3xl bg-gradient-to-tr from-obaol-500/15 via-amber-500/10 to-obaol-700/10 blur-2xl dark:from-obaol-500/10 dark:via-amber-500/[0.06] dark:to-transparent" />
      <div className="pointer-events-none absolute inset-[16%_8%_10%] rounded-full bg-obaol-400/12 blur-3xl dark:bg-obaol-400/[0.08]" />
      <div
        data-hero-bulk-artwork="true"
        data-hero-lifecycle-visual="true"
        aria-label="Interactive panorama of independent bulk suppliers, warehouse inspectors, quality specialists, logistics providers, and an overseas buyer coordinating one agricultural commodity trade"
        className="relative aspect-[1983/793] w-full overflow-hidden rounded-xl bg-content2 ring-1 ring-obaol-900/10 shadow-[0_12px_36px_-10px_rgba(27,38,50,0.14)] dark:ring-obaol-300/15 dark:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.55)] focus-within:ring-1 focus-within:ring-obaol-500/70 sm:rounded-2xl"
      >
        <Image src={HERO_ARTWORK} alt="" aria-hidden="true" fill priority fetchPriority="high" quality={75} sizes="(max-width: 1279px) 100vw, 68vw" className={`object-cover ${transitionClass} ${activePhase ? "opacity-55 saturate-[0.65] brightness-[0.82]" : "opacity-100"}`} />
        {phaseGroups.map((phase) => (
          <div
            key={`highlight-${phase.phase}`}
            data-hero-phase-highlight={phase.slug}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-10 overflow-hidden ${transitionClass} ${activePhase === phase.phase ? "opacity-100" : "opacity-0"}`}
            style={{ clipPath: `inset(0 ${100 - phase.left - phase.width}% 0 ${phase.left}%)` }}
          >
            <Image src={HERO_ARTWORK} alt="" fill quality={75} sizes="(max-width: 1023px) 100vw, 68vw" className={`object-cover ${transitionClass}`} />
            <div className="absolute inset-y-0 bg-gradient-to-t from-obaol-500/[0.07] via-transparent to-white/[0.04]" style={{ left: `${phase.left}%`, width: `${phase.width}%` }} />
            <div className="absolute inset-y-0 bg-gradient-to-t from-obaol-950/25 via-transparent to-amber-400/[0.12]" style={{ left: `${phase.left}%`, width: `${phase.width}%` }} />
            <div className="absolute top-0 h-[2.5px] bg-gradient-to-r from-obaol-400 via-amber-300 to-obaol-400 shadow-[0_1px_8px_rgba(233,140,80,0.7)]" style={{ left: `${phase.left}%`, width: `${phase.width}%` }} />
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
              aria-pressed={selectedItem?.kind === "phase" && selectedItem.id === phase.phase}
              onMouseEnter={() => preview({ kind: "phase", id: phase.phase })}
              onMouseLeave={stopPreview}
              onFocus={() => preview({ kind: "phase", id: phase.phase })}
              onBlur={stopPreview}
              onClick={() => select({ kind: "phase", id: phase.phase })}
              className="group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-obaol-300"
            >
              <span className={`absolute inset-x-2 bottom-2 rounded-full px-2 py-1 text-center text-[8px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm sm:bottom-3 sm:text-[9px] ${transitionClass} ${activePhase === phase.phase ? "opacity-100 bg-[#1B2632]/85 text-obaol-200 border border-obaol-400/40 shadow-sm" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 bg-black/65 text-white"}`}>{phase.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div data-execution-route="phase-rail" aria-label="Execution phases: Plan, Verify, Move, and Receive and Approve" className="relative z-30 mt-2 overflow-x-auto pb-2 sm:mt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div data-execution-map="hierarchical" data-execution-layout="single-rail" className="min-w-[68rem] px-[7%] sm:px-[9%]">
          <div className="relative h-[3.5rem]">
            <div className="absolute left-[7px] right-[7px] top-[7px] h-px bg-obaol-700/70 dark:bg-obaol-300/70" />
            {progressPercent > 0 && (
              <div
                className={`absolute left-[7px] top-[7px] h-px bg-gradient-to-r from-obaol-600 via-obaol-400 to-amber-300 shadow-[0_0_8px_rgba(233,140,80,0.55)] ${transitionClass}`}
                style={{ width: `calc(${progressPercent}% - 7px)` }}
              />
            )}
            {executionRail.map((item, index) => {
              if (item.kind === "phase") {
                const phase = item.phase;
                const isFinal = phase.phase === "Receive & Approve";
                return (
                  <button
                    key={`phase-${phase.slug}`}
                    type="button"
                    data-execution-phase={phase.slug}
                    aria-label={`${phase.name}: ${phase.summary}`}
                    aria-pressed={selectedItem?.kind === "phase" && selectedItem.id === phase.phase}
                    onMouseEnter={() => preview({ kind: "phase", id: phase.phase })}
                    onMouseLeave={stopPreview}
                    onFocus={() => preview({ kind: "phase", id: phase.phase })}
                    onBlur={stopPreview}
                    onClick={() => select({ kind: "phase", id: phase.phase })}
                    data-node-hit-target="milestone"
                    className={`group absolute top-0 z-10 flex size-11 snap-center flex-col rounded-md focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/80 ${index === 0 ? "items-start text-left" : isFinal ? "-translate-x-full items-end text-right" : "-translate-x-1/2 items-center text-center"}`}
                    style={{ left: `${railPosition(index)}%` }}
                  >
                    <span data-node-size="milestone" className={`mb-2 block size-[15px] rounded-full border-[3px] border-background bg-obaol-500 shadow-[0_0_0_1px_rgba(180,119,18,0.75)] dark:shadow-[0_0_0_1px_rgba(228,199,153,0.72)] ${transitionClass} ${activePhase === phase.phase && !activeResponsibility ? "scale-125 bg-amber-300 shadow-[0_0_18px_rgba(207,152,60,0.9)]" : activePhase === phase.phase ? "bg-amber-300" : ""}`} />
                    <span className={`pointer-events-none absolute top-6 whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.14em] sm:text-[9px] sm:tracking-[0.17em] xl:text-[10px] ${index === 0 ? "left-0" : isFinal ? "right-0" : "left-1/2 -translate-x-1/2"} ${transitionClass} ${activePhase === phase.phase ? "text-obaol-700 dark:text-obaol-200" : activePhase ? "text-foreground/40" : "text-foreground"}`}>{phase.name}</span>
                  </button>
                );
              }

              const responsibility = item.responsibility;
              const parentPhase = phaseGroups.find((phase) => phase.phase === responsibility.phase)!;
              const isActive = activeResponsibility?.id === responsibility.id;
              return (
                <button
                  key={`responsibility-${responsibility.id}`}
                  type="button"
                  data-execution-responsibility={responsibility.id}
                  data-parent-phase={parentPhase.slug}
                  data-rail-order={responsibility.railOrder}
                  data-node-hit-target="responsibility"
                  aria-label={`${responsibility.label}. ${responsibility.coordinator} Provider: ${responsibility.provider}. Evidence: ${responsibility.evidence}.`}
                  aria-pressed={selectedItem?.kind === "responsibility" && selectedItem.id === responsibility.id}
                  onMouseEnter={() => preview({ kind: "responsibility", id: responsibility.id })}
                  onMouseLeave={stopPreview}
                  onFocus={() => preview({ kind: "responsibility", id: responsibility.id })}
                  onBlur={stopPreview}
                  onClick={() => select({ kind: "responsibility", id: responsibility.id })}
                  className="group absolute top-0 z-10 flex size-10 -translate-x-1/2 snap-center justify-center rounded-md pt-[3px] focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/80"
                  style={{ left: `${railPosition(index)}%` }}
                >
                  <span data-node-size="responsibility" className={`block size-2.5 rounded-full border border-obaol-600 ${transitionClass} ${isActive ? "bg-amber-300 shadow-[0_0_0_4px_rgba(245,158,11,0.18)]" : "bg-background group-hover:bg-obaol-200 group-focus-visible:bg-obaol-200"}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        data-hero-trade-detail="true"
        data-detail-kind={displayedResponsibility ? "responsibility" : "phase"}
        data-detail-visible={panelVisible ? "true" : "false"}
        aria-hidden={!panelVisible}
        aria-live="polite"
        className={`mt-1 h-[8.5rem] overflow-hidden rounded-2xl border border-obaol-500/35 border-l-[3.5px] border-l-obaol-600 dark:border-l-obaol-400 bg-gradient-to-br from-[#FFFDF9]/95 via-[#FBF7F0]/95 to-[#F5ECE0]/95 dark:from-[#1E2B38]/95 dark:via-[#1B2632]/95 dark:to-[#17222D]/95 p-3.5 shadow-[0_8px_24px_-6px_rgba(44,59,77,0.08),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:h-[6.75rem] sm:px-4 ${reducedMotion ? "" : "transition-opacity duration-300 ease-out"} ${panelVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="flex h-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          <div className="min-w-0 sm:max-w-[42%]">
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">Illustrative trade · {displayedPhaseGroup.name}</p>
              <span className="rounded bg-obaol-500/15 px-1.5 py-0.5 font-mono text-[8px] font-bold text-obaol-800 dark:text-obaol-200">{displayedPhaseGroup.range}</span>
            </div>
            <p className="mt-1 truncate text-sm font-black text-foreground">Black Pepper · 18 MT</p>
            <p className="mt-1 truncate text-[11px] font-bold text-obaol-900 dark:text-obaol-100">{displayedResponsibility?.label ?? displayedPhaseGroup.status}</p>
          </div>
          <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-1 text-[10px] sm:grid-cols-3 sm:text-right">
            <div className="col-span-2 sm:col-span-1"><dt className="font-semibold db-muted text-[9px] uppercase tracking-wider text-obaol-800/75 dark:text-obaol-300/75">OBAOL coordinates</dt><dd className="mt-0.5 line-clamp-3 font-semibold text-foreground">{displayedResponsibility?.coordinator ?? displayedPhaseGroup.summary}</dd></div>
            <div><dt className="font-semibold db-muted text-[9px] uppercase tracking-wider text-obaol-800/75 dark:text-obaol-300/75">Specialist</dt><dd className="mt-0.5 line-clamp-2 font-bold text-foreground">{displayedResponsibility?.provider ?? displayedPhaseGroup.provider}</dd></div>
            <div><dt className="font-semibold db-muted text-[9px] uppercase tracking-wider text-obaol-800/75 dark:text-obaol-300/75">Evidence</dt><dd className="mt-0.5 line-clamp-2 font-bold text-foreground">{displayedResponsibility?.evidence ?? displayedPhaseGroup.evidence}</dd></div>
          </dl>
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
