"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { homeTitleStyles } from "@/components/home/homeTitleStyles";

type PhaseId = "agreement" | "fulfillment" | "closure";
type StepStatus = "complete" | "current" | "upcoming";

const phases: ReadonlyArray<{ id: PhaseId; title: string; label: string }> = [
    { id: "agreement", title: "Enquiry & Agreement", label: "Phase 01" },
    { id: "fulfillment", title: "Quality & Fulfillment", label: "Phase 02" },
    { id: "closure", title: "Movement & Closure", label: "Phase 03" },
];

const dealSteps = [
    { id: "enquiry", phase: "agreement", title: "Enquiry", shortTitle: "Enquired", description: "Trade-listing enquiry routed to trusted, verified suppliers for action." },
    { id: "documentation", phase: "agreement", title: "Documentation", shortTitle: "Docs", description: "Trade documents are created step-by-step: PO, quotation, proforma invoice, and compliance files." },
    { id: "confirmed", phase: "agreement", title: "Order Confirmed", shortTitle: "Confirmed", description: "The order is confirmed after buyer, seller, and OBAOL responsibilities are finalized." },
    { id: "tested", phase: "fulfillment", title: "Tested", shortTitle: "Tested", description: "Laboratory testing and quality analysis are completed when the execution panel requires them." },
    { id: "procured", phase: "fulfillment", title: "Procured", shortTitle: "Procured", description: "The OBAOL procurement team checks stock on-ground and completes buyer due diligence." },
    { id: "packed", phase: "fulfillment", title: "Packed", shortTitle: "Packed", description: "Customized packing and grading are completed after procurement and readiness checks." },
    { id: "transport", phase: "closure", title: "Inland Transport", shortTitle: "Transport", description: "Inland transport partners handle pickup, movement, and the port handoff." },
    { id: "bl-issued", phase: "closure", title: "BL Issued", shortTitle: "BL Issued", description: "Freight forwarders manage customs clearance and issue the Bill of Lading." },
    { id: "delivered", phase: "closure", title: "Delivered", shortTitle: "Delivered", description: "Final delivery is verified, handover is completed, and settlement is closed." },
] as const satisfies ReadonlyArray<{
    id: string;
    phase: PhaseId;
    title: string;
    shortTitle: string;
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
    compact?: boolean;
};

function StepDetail({ selectedIndex, onSelect, reducedMotion, compact = false }: StepDetailProps) {
    const step = dealSteps[selectedIndex];
    const phase = phases.find((item) => item.id === step.phase)!;
    const status = getStepStatus(selectedIndex);

    return (
        <motion.div
            key={step.id}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
            className={`relative overflow-hidden border border-obaol-500/25 bg-gradient-to-br from-obaol-500/12 via-content1/80 to-background/75 ${
                compact ? "mt-3 rounded-[1.5rem] p-5" : "min-h-[410px] rounded-[2rem] p-7 xl:p-8"
            }`}
            aria-live="polite"
        >
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-obaol-500/10 blur-3xl" />

            <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">
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

                <div className={compact ? "mt-5" : "mt-8"}>
                    <span className="block text-5xl font-bold tracking-[-0.06em] text-obaol-500/20" aria-hidden="true">
                        {String(selectedIndex + 1).padStart(2, "0")}
                    </span>
                    <h4 className="-mt-2 text-2xl font-bold tracking-tight text-foreground xl:text-3xl">{step.title}</h4>
                    <p className="mt-4 text-sm font-medium leading-relaxed text-foreground/60">{step.description}</p>
                </div>

                <div className={compact ? "mt-6" : "mt-auto pt-9"}>
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
                            transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-obaol-600 to-obaol-400"
                        />
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => onSelect(selectedIndex - 1)}
                            disabled={selectedIndex === 0}
                            className="inline-flex h-10 items-center gap-2 rounded-full border border-default-200/70 bg-background/60 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/65 transition-colors hover:border-obaol-500/45 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="View previous execution stage"
                        >
                            <FiChevronLeft size={15} /> Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => onSelect(selectedIndex + 1)}
                            disabled={selectedIndex === dealSteps.length - 1}
                            className="inline-flex h-10 items-center gap-2 rounded-full border border-obaol-500/30 bg-obaol-500 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-obaol-950 transition-colors hover:bg-obaol-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="View next execution stage"
                        >
                            Next <FiChevronRight size={15} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function DealWalkthrough() {
    const [selectedStepIndex, setSelectedStepIndex] = useState(currentStepIndex);
    const prefersReducedMotion = useReducedMotion() ?? false;

    const selectStep = (index: number) => {
        if (index < 0 || index >= dealSteps.length) return;
        setSelectedStepIndex(index);
    };

    return (
        <div
            id="deal-walkthrough"
            className="group/panel relative mt-20 scroll-mt-28 overflow-hidden rounded-[2.5rem] border border-obaol-500/20 border-b-obaol-500/40 bg-gradient-to-b from-obaol-50/35 via-content1/50 to-background/40 px-5 py-8 shadow-lg shadow-default-200/50 backdrop-blur-3xl sm:px-8 md:scroll-mt-36 md:rounded-[3.5rem] md:px-14 md:py-14 dark:from-obaol-950/25 dark:via-content1/40 dark:shadow-none"
        >
            <div className="pointer-events-none absolute -right-[10%] -top-[20%] h-[500px] w-[500px] bg-obaol-500/5 blur-[120px] transition-colors duration-1000 group-hover/panel:bg-obaol-500/10" />
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-obaol-400/60 to-transparent" />

            <div className="relative z-10 grid items-center gap-9 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.82fr)] lg:gap-14">
                <div className="max-w-3xl space-y-5">
                    <p className={homeTitleStyles.sectionKicker}>Deal Walkthrough</p>
                    <h3 className={homeTitleStyles.sectionTitle}>Example: Black Pepper export from India to GCC</h3>
                    <p className="max-w-xl text-sm font-medium leading-relaxed text-foreground/60 md:text-base">
                        A real-world flow managed end-to-end inside the panel — from the first enquiry to final settlement.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2" aria-label="Walkthrough highlights">
                        {["9 execution stages", "Live panel visibility", "India → GCC"].map((item) => (
                            <span key={item} className="inline-flex items-center gap-2 rounded-full border border-default-200/70 bg-background/55 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/65 backdrop-blur-sm md:text-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-obaol-500" />
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                <figure className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-[2rem] border border-obaol-500/30 bg-black p-1.5 shadow-2xl shadow-black/25">
                    <div className="relative overflow-hidden rounded-[1.65rem]">
                        <Image
                            src="/images/order-execution-tracking.png"
                            alt="OBAOL order execution dashboard showing live progress from sampling through port operations"
                            width={1254}
                            height={1254}
                            sizes="(min-width: 1280px) 430px, (min-width: 1024px) 36vw, (min-width: 640px) 480px, calc(100vw - 72px)"
                            className="h-auto w-full"
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 to-transparent" />
                    </div>
                    <figcaption className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 md:text-xs">Inside the OBAOL panel</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-obaol-300/25 bg-black/55 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-obaol-300 backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-obaol-400" /> Live view
                        </span>
                    </figcaption>
                </figure>
            </div>

            <section className="relative z-10 mt-10 overflow-hidden rounded-[2rem] border border-default-200/60 bg-background/70 p-4 shadow-inner backdrop-blur-xl sm:p-6 md:rounded-[2.5rem] md:p-8" aria-labelledby="execution-journey-title">
                <div className="flex flex-col items-start justify-between gap-4 border-b border-default-200/60 pb-6 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="h-2.5 w-2.5 animate-[pulse_2s_infinite] rounded-full bg-success-500 shadow-[0_0_10px_rgba(34,197,94,0.55)] motion-reduce:animate-none" />
                            <h4 id="execution-journey-title" className="text-sm font-bold uppercase tracking-[0.16em] text-foreground md:text-base">Live execution journey</h4>
                        </div>
                        <p className="mt-2 max-w-2xl text-xs font-medium leading-relaxed text-foreground/55 md:text-sm">
                            Select any stage to see how the order moves through the OBAOL execution panel.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 rounded-full border border-obaol-500/25 bg-obaol-500/10 px-4 py-2 text-obaol-700 dark:text-obaol-300">
                        <span className="text-[9px] font-bold uppercase tracking-widest md:text-[10px]">Current: Inland Transport</span>
                        <span className="rounded-full bg-obaol-500 px-2 py-0.5 text-[9px] font-bold text-obaol-950">7 / 9</span>
                    </div>
                </div>

                <div className="mt-6 hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.75fr)] xl:gap-8">
                    <div className="grid grid-cols-3 gap-3 xl:gap-4">
                        {phases.map((phase) => (
                            <article key={phase.id} className="rounded-[1.75rem] border border-default-200/55 bg-content1/45 p-3 xl:p-4">
                                <header className="px-2 pb-4 pt-1">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-obaol-700 dark:text-obaol-300">{phase.label}</p>
                                    <h5 className="mt-1 text-sm font-bold leading-tight text-foreground xl:text-base">{phase.title}</h5>
                                </header>
                                <ol className="space-y-2">
                                    {dealSteps.map((step, index) => {
                                        if (step.phase !== phase.id) return null;
                                        const status = getStepStatus(index);
                                        const isSelected = selectedStepIndex === index;

                                        return (
                                            <li key={step.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => selectStep(index)}
                                                    aria-pressed={isSelected}
                                                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 ${
                                                        isSelected
                                                            ? "border-obaol-500/45 bg-obaol-500/10 shadow-[inset_0_1px_0_rgba(207,152,60,0.12)]"
                                                            : "border-transparent hover:border-default-200/70 hover:bg-background/60"
                                                    }`}
                                                >
                                                    <StepMarker index={index} status={status} />
                                                    <span className="min-w-0 flex-1">
                                                        <span className={`block text-xs font-bold leading-tight xl:text-sm ${isSelected ? "text-foreground" : "text-foreground/70"}`}>{step.title}</span>
                                                        <span className={`mt-1 block text-[8px] font-bold uppercase tracking-[0.13em] ${status === "current" ? "text-obaol-700 dark:text-obaol-300" : "text-foreground/35"}`}>{statusLabel[status]}</span>
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </article>
                        ))}
                    </div>

                    <AnimatePresence mode="wait" initial={false}>
                        <StepDetail selectedIndex={selectedStepIndex} onSelect={selectStep} reducedMotion={prefersReducedMotion} />
                    </AnimatePresence>
                </div>

                <div className="mt-6 space-y-4 lg:hidden">
                    {phases.map((phase) => (
                        <article key={phase.id} className="overflow-hidden rounded-[1.75rem] border border-default-200/60 bg-content1/45 p-3 sm:p-4">
                            <header className="px-2 pb-4 pt-1">
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-obaol-700 dark:text-obaol-300">{phase.label}</p>
                                <h5 className="mt-1 text-base font-bold text-foreground">{phase.title}</h5>
                            </header>
                            <ol className="space-y-2">
                                {dealSteps.map((step, index) => {
                                    if (step.phase !== phase.id) return null;
                                    const status = getStepStatus(index);
                                    const isSelected = selectedStepIndex === index;

                                    return (
                                        <li key={step.id}>
                                            <button
                                                type="button"
                                                onClick={() => selectStep(index)}
                                                aria-expanded={isSelected}
                                                aria-controls={`mobile-step-${step.id}`}
                                                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 ${
                                                    isSelected ? "border-obaol-500/45 bg-obaol-500/10" : "border-transparent bg-background/35"
                                                }`}
                                            >
                                                <StepMarker index={index} status={status} />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-sm font-bold text-foreground">{step.title}</span>
                                                    <span className={`mt-1 block text-[8px] font-bold uppercase tracking-[0.13em] ${status === "current" ? "text-obaol-700 dark:text-obaol-300" : "text-foreground/35"}`}>{statusLabel[status]}</span>
                                                </span>
                                                <FiChevronRight className={`text-foreground/35 transition-transform duration-200 ${isSelected ? "rotate-90" : ""}`} aria-hidden="true" />
                                            </button>

                                            <AnimatePresence initial={false}>
                                                {isSelected && (
                                                    <div id={`mobile-step-${step.id}`}>
                                                        <StepDetail selectedIndex={selectedStepIndex} onSelect={selectStep} reducedMotion={prefersReducedMotion} compact />
                                                    </div>
                                                )}
                                            </AnimatePresence>
                                        </li>
                                    );
                                })}
                            </ol>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
