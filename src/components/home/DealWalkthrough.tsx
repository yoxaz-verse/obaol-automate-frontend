"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";

type PhaseId = "agreement" | "fulfillment" | "closure";
type StepStatus = "complete" | "current" | "upcoming";

const phases: ReadonlyArray<{ id: PhaseId; title: string; label: string }> = [
    { id: "agreement", title: "Enquiry & Agreement", label: "Phase 01" },
    { id: "fulfillment", title: "Quality & Fulfillment", label: "Phase 02" },
    { id: "closure", title: "Movement & Closure", label: "Phase 03" },
];

const dealSteps = [
    { id: "enquiry", phase: "agreement", title: "Enquiry", description: "Trade-listing enquiry routed to trusted, verified suppliers for action." },
    { id: "documentation", phase: "agreement", title: "Documentation", description: "Trade documents are created step-by-step: PO, quotation, proforma invoice, and compliance files." },
    { id: "confirmed", phase: "agreement", title: "Order Confirmed", description: "The order is confirmed after buyer, seller, and OBAOL responsibilities are finalized." },
    { id: "tested", phase: "fulfillment", title: "Tested", description: "Laboratory testing and quality analysis are completed when the execution panel requires them." },
    { id: "procured", phase: "fulfillment", title: "Procured", description: "The OBAOL procurement team checks stock on-ground and completes buyer due diligence." },
    { id: "packed", phase: "fulfillment", title: "Packed", description: "Customized packing and grading are completed after procurement and readiness checks." },
    { id: "transport", phase: "closure", title: "Inland Transport", description: "Inland transport partners handle pickup, movement, and the port handoff." },
    { id: "bl-issued", phase: "closure", title: "BL Issued", description: "Freight forwarders manage customs clearance and issue the Bill of Lading." },
    { id: "delivered", phase: "closure", title: "Delivered", description: "Final delivery is verified, handover is completed, and settlement is closed." },
] as const satisfies ReadonlyArray<{
    id: string;
    phase: PhaseId;
    title: string;
    description: string;
}>;

const currentStepIndex = 6;
const progressPercent = (currentStepIndex / (dealSteps.length - 1)) * 100;

function getStepStatus(index: number): StepStatus {
    if (index < currentStepIndex) return "complete";
    if (index === currentStepIndex) return "current";
    return "upcoming";
}

const statusLabel: Record<StepStatus, string> = {
    complete: "Complete",
    current: "In progress",
    upcoming: "Upcoming",
};

function getPhaseStatus(phaseId: PhaseId): "Complete" | "Active" | "Upcoming" {
    const indices = dealSteps.flatMap((step, index) => (step.phase === phaseId ? [index] : []));
    if (indices.every((index) => index < currentStepIndex)) return "Complete";
    if (indices.includes(currentStepIndex)) return "Active";
    return "Upcoming";
}

function StepMarker({ index, status }: { index: number; status: StepStatus }) {
    return (
        <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-colors duration-200 ${
                status === "current"
                    ? "border-obaol-500 bg-obaol-500 text-obaol-950 shadow-[0_8px_22px_-12px_rgba(207,152,60,0.9)]"
                    : status === "complete"
                      ? "border-obaol-500/30 bg-obaol-500/10 text-obaol-700 dark:text-obaol-300"
                      : "border-default-200/70 bg-background/60 text-foreground/35"
            }`}
            aria-hidden="true"
        >
            {status === "complete" ? <FiCheck size={15} strokeWidth={2.5} /> : String(index + 1).padStart(2, "0")}
        </span>
    );
}

type StepDetailProps = {
    selectedIndex: number;
    onSelect: (index: number) => void;
    reducedMotion: boolean;
};

function StepDetail({ selectedIndex, onSelect, reducedMotion }: StepDetailProps) {
    const step = dealSteps[selectedIndex];
    const phase = phases.find((item) => item.id === step.phase)!;
    const status = getStepStatus(selectedIndex);

    return (
        <motion.article
            key={step.id}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[1.75rem] border border-obaol-500/25 bg-gradient-to-br from-obaol-500/12 via-content1/80 to-background/75 p-5 sm:p-6"
            aria-live="polite"
        >
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-obaol-500/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">
                        {phase.label} · Stage {String(selectedIndex + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-foreground/45">{phase.title}</p>
                </div>
                <span
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${
                        status === "current"
                            ? "border-obaol-500/35 bg-obaol-500/15 text-obaol-700 dark:text-obaol-300"
                            : status === "complete"
                              ? "border-default-200/70 bg-background/55 text-foreground/50"
                              : "border-default-200/60 text-foreground/35"
                    }`}
                >
                    {statusLabel[status]}
                </span>
            </div>

            <div className="relative mt-5 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(240px,0.9fr)] md:items-end">
                <div>
                    <span className="block text-4xl font-bold tracking-[-0.06em] text-obaol-500/20" aria-hidden="true">
                        {String(selectedIndex + 1).padStart(2, "0")}
                    </span>
                    <h5 className="-mt-2 text-2xl font-bold tracking-tight text-foreground">{step.title}</h5>
                    <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-foreground/60">{step.description}</p>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.14em] text-foreground/45">
                        <span>Order progress</span>
                        <span>{currentStepIndex + 1} of {dealSteps.length}</span>
                    </div>
                    <div
                        className="h-1.5 overflow-hidden rounded-full bg-default-200/65"
                        role="progressbar"
                        aria-label="Order progress"
                        aria-valuemin={1}
                        aria-valuemax={dealSteps.length}
                        aria-valuenow={currentStepIndex + 1}
                        aria-valuetext={`Stage ${currentStepIndex + 1} of ${dealSteps.length}: ${dealSteps[currentStepIndex].title}`}
                    >
                        <motion.div
                            initial={reducedMotion ? false : { width: 0 }}
                            whileInView={{ width: `${progressPercent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: reducedMotion ? 0 : 0.7, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-obaol-600 to-obaol-400"
                        />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => onSelect(selectedIndex - 1)}
                            disabled={selectedIndex === 0}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-default-200/70 bg-background/60 px-3.5 text-[9px] font-bold uppercase tracking-[0.12em] text-foreground/65 transition-colors hover:border-obaol-500/45 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="View previous execution stage"
                        >
                            <FiChevronLeft size={14} /> Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => onSelect(selectedIndex + 1)}
                            disabled={selectedIndex === dealSteps.length - 1}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-obaol-500/30 bg-obaol-500 px-3.5 text-[9px] font-bold uppercase tracking-[0.12em] text-obaol-950 transition-colors hover:bg-obaol-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="View next execution stage"
                        >
                            Next <FiChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

export default function DealWalkthrough() {
    const [selectedStepIndex, setSelectedStepIndex] = useState(currentStepIndex);
    const prefersReducedMotion = useReducedMotion() ?? false;
    const activePhaseId = dealSteps[selectedStepIndex].phase;
    const visibleSteps = dealSteps.flatMap((step, index) => (step.phase === activePhaseId ? [{ step, index }] : []));

    const selectStep = (index: number) => {
        if (index < 0 || index >= dealSteps.length) return;
        setSelectedStepIndex(index);
    };

    const selectPhase = (phaseId: PhaseId) => {
        const firstStepIndex = dealSteps.findIndex((step) => step.phase === phaseId);
        selectStep(firstStepIndex);
    };

    return (
        <section
            id="deal-walkthrough"
            aria-labelledby="execution-journey-title"
            className="group/panel relative mt-16 scroll-mt-28 overflow-hidden rounded-[2.5rem] border border-obaol-500/20 border-b-obaol-500/40 bg-gradient-to-b from-obaol-50/35 via-content1/50 to-background/40 px-5 py-6 shadow-lg shadow-default-200/50 backdrop-blur-3xl sm:px-7 md:scroll-mt-36 md:rounded-[3rem] md:px-9 md:py-8 dark:from-obaol-950/25 dark:via-content1/40 dark:shadow-none"
        >
            <div className="pointer-events-none absolute -right-[10%] -top-[35%] h-[440px] w-[440px] bg-obaol-500/5 blur-[120px] transition-colors duration-1000 group-hover/panel:bg-obaol-500/10" />
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-obaol-400/60 to-transparent" />

            <header className="relative z-10 flex flex-col items-start justify-between gap-4 border-b border-default-200/60 pb-5 md:flex-row md:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 animate-[pulse_2s_infinite] rounded-full bg-success-500 shadow-[0_0_10px_rgba(34,197,94,0.55)] motion-reduce:animate-none" />
                        <h3 id="execution-journey-title" className="text-base font-bold uppercase tracking-[0.16em] text-foreground md:text-lg">Live execution journey</h3>
                    </div>
                    <p className="mt-2 max-w-2xl text-xs font-medium leading-relaxed text-foreground/55 md:text-sm">
                        Explore how one order moves through agreement, fulfillment, and final delivery.
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-full border border-obaol-500/25 bg-obaol-500/10 px-4 py-2 text-obaol-700 dark:text-obaol-300">
                    <span className="text-[9px] font-bold uppercase tracking-widest md:text-[10px]">Current: Inland Transport</span>
                    <span className="rounded-full bg-obaol-500 px-2 py-0.5 text-[9px] font-bold text-obaol-950">7 / 9</span>
                </div>
            </header>

            <nav className="relative z-10 mt-5" aria-label="Execution phases">
                <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
                    {phases.map((phase) => {
                        const isActive = phase.id === activePhaseId;
                        const phaseState = getPhaseStatus(phase.id);

                        return (
                            <button
                                key={phase.id}
                                type="button"
                                onClick={() => selectPhase(phase.id)}
                                aria-pressed={isActive}
                                className={`group/phase flex min-w-[220px] snap-start items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 md:min-w-0 ${
                                    isActive
                                        ? "border-obaol-500/45 bg-obaol-500/10 shadow-[inset_0_1px_0_rgba(207,152,60,0.12)]"
                                        : "border-default-200/55 bg-content1/40 hover:border-obaol-500/30 hover:bg-background/55"
                                }`}
                            >
                                <span className="min-w-0">
                                    <span className="block text-[8px] font-bold uppercase tracking-[0.17em] text-obaol-700 dark:text-obaol-300">{phase.label}</span>
                                    <span className="mt-1 block truncate text-xs font-bold text-foreground md:text-sm">{phase.title}</span>
                                </span>
                                <span className={`rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] ${isActive ? "border-obaol-500/30 text-obaol-700 dark:text-obaol-300" : "border-default-200/60 text-foreground/35"}`}>
                                    {phaseState}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            <div className="relative z-10 mt-4 grid gap-4 lg:grid-cols-[minmax(230px,0.34fr)_minmax(0,1fr)]">
                <ol className="grid grid-cols-3 gap-2 lg:grid-cols-1" aria-label={`${phases.find((phase) => phase.id === activePhaseId)?.title} stages`}>
                    {visibleSteps.map(({ step, index }) => {
                        const status = getStepStatus(index);
                        const isSelected = selectedStepIndex === index;

                        return (
                            <li key={step.id}>
                                <button
                                    type="button"
                                    onClick={() => selectStep(index)}
                                    aria-pressed={isSelected}
                                    className={`flex h-full w-full flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 sm:flex-row sm:items-center lg:min-h-[70px] ${
                                        isSelected
                                            ? "border-obaol-500/45 bg-obaol-500/10"
                                            : "border-default-200/50 bg-content1/35 hover:border-obaol-500/25 hover:bg-background/55"
                                    }`}
                                >
                                    <StepMarker index={index} status={status} />
                                    <span className="min-w-0 flex-1">
                                        <span className={`block text-[11px] font-bold leading-tight sm:text-xs ${isSelected ? "text-foreground" : "text-foreground/70"}`}>{step.title}</span>
                                        <span className={`mt-1 block text-[7px] font-bold uppercase tracking-[0.12em] sm:text-[8px] ${status === "current" ? "text-obaol-700 dark:text-obaol-300" : "text-foreground/35"}`}>{statusLabel[status]}</span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>

                <AnimatePresence mode="wait" initial={false}>
                    <StepDetail selectedIndex={selectedStepIndex} onSelect={selectStep} reducedMotion={prefersReducedMotion} />
                </AnimatePresence>
            </div>

            <aside className="relative z-10 mt-5 grid overflow-hidden rounded-[1.75rem] border border-default-200/60 bg-content1/45 p-3 md:grid-cols-[260px_minmax(0,1fr)_auto] md:items-center md:gap-5 lg:grid-cols-[320px_minmax(0,1fr)_auto]" aria-labelledby="deal-example-title">
                <figure className="relative aspect-[16/9] overflow-hidden rounded-[1.25rem] border border-obaol-500/20 bg-black md:aspect-[16/10]">
                    <Image
                        src="/images/order-execution-tracking.png"
                        alt="OBAOL execution panel tracking a Black Pepper export order"
                        fill
                        sizes="(min-width: 1024px) 320px, (min-width: 768px) 260px, calc(100vw - 88px)"
                        className="object-cover object-[center_62%]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    <figcaption className="absolute bottom-2.5 left-3 text-[8px] font-bold uppercase tracking-[0.15em] text-white/80">Inside the OBAOL panel</figcaption>
                </figure>

                <div className="px-1 py-4 md:py-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">Deal walkthrough</p>
                    <h4 id="deal-example-title" className="mt-1 text-lg font-bold tracking-tight text-foreground">Black Pepper · India → GCC</h4>
                    <p className="mt-1.5 max-w-2xl text-xs font-medium leading-relaxed text-foreground/55 md:text-sm">
                        One real-world flow managed end-to-end — from the first enquiry through documentation, movement, and settlement.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 px-1 pb-1 md:max-w-[190px] md:justify-end md:p-0" aria-label="Example highlights">
                    {["9 stages", "Live visibility"].map((item) => (
                        <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-default-200/70 bg-background/55 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-foreground/55">
                            <span className="h-1.5 w-1.5 rounded-full bg-obaol-500" /> {item}
                        </span>
                    ))}
                </div>
            </aside>
        </section>
    );
}
