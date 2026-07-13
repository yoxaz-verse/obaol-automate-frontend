"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { KeyboardEvent, useRef, useState } from "react";
import {
  FiBox,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiFileText,
  FiGrid,
  FiPackage,
  FiSearch,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import type { IconType } from "react-icons";

type CapabilityId =
  | "verified"
  | "enquiries"
  | "execution"
  | "catalog"
  | "documents"
  | "imports"
  | "warehouse"
  | "orders";

type PhaseId = "agreement" | "fulfillment" | "closure";
type StepStatus = "complete" | "current" | "upcoming";

type PreviewConfig =
  | { type: "checks" }
  | { type: "pipeline" }
  | { type: "queues" }
  | { type: "listings" }
  | { type: "files" }
  | { type: "timeline" }
  | { type: "capacity" }
  | { type: "orderSummary" };

type Capability = {
  id: CapabilityId;
  title: string;
  shortTitle: string;
  summary: string;
  outcome: string;
  connections: readonly string[];
  icon: IconType;
  preview: PreviewConfig;
  defaultStep: number;
  relatedSteps: readonly number[];
};

const capabilities: readonly Capability[] = [
  {
    id: "verified",
    title: "Verified Ecosystem",
    shortTitle: "Verified Network",
    summary: "Approval checks, role-based access, and verified participants create a trusted operating layer before a trade begins.",
    outcome: "Know who is participating, what they can access, and which checks are complete.",
    connections: ["Participants", "Approvals", "Role access"],
    icon: FiShield,
    preview: { type: "checks" },
    defaultStep: 0,
    relatedSteps: [0],
  },
  {
    id: "enquiries",
    title: "Enquiry Hub",
    shortTitle: "Enquiry Hub",
    summary: "Capture buyer requirements once, route them to the right team, and keep supplier responses in one shared view.",
    outcome: "Move from an incoming requirement to an actionable, qualified enquiry without losing context.",
    connections: ["Buyer demand", "Supplier response", "Qualification"],
    icon: FiSearch,
    preview: { type: "pipeline" },
    defaultStep: 0,
    relatedSteps: [0],
  },
  {
    id: "execution",
    title: "Execution Panels",
    shortTitle: "Execution Panels",
    summary: "Give every function a focused queue of responsibilities, owners, deadlines, and handoffs for each active trade.",
    outcome: "Make the next action and accountable owner visible across the execution team.",
    connections: ["Functions", "Owners", "Live queues"],
    icon: FiGrid,
    preview: { type: "queues" },
    defaultStep: 4,
    relatedSteps: [2, 4, 5],
  },
  {
    id: "catalog",
    title: "Commodity Catalog & Trade Listings",
    shortTitle: "Catalog & Listings",
    summary: "Explore commodity coverage, origins, specifications, and available trade listings before starting an enquiry.",
    outcome: "Turn product discovery into a structured requirement that is ready for execution.",
    connections: ["Commodities", "Origins", "Availability"],
    icon: FiBox,
    preview: { type: "listings" },
    defaultStep: 0,
    relatedSteps: [0],
  },
  {
    id: "documents",
    title: "Samples & Documents",
    shortTitle: "Samples & Documents",
    summary: "Keep sample requests, laboratory results, compliance files, and commercial documents tied to the trade they support.",
    outcome: "See what is approved, missing, or waiting for action without searching through email threads.",
    connections: ["Samples", "Compliance", "Trade files"],
    icon: FiFileText,
    preview: { type: "files" },
    defaultStep: 1,
    relatedSteps: [1, 3],
  },
  {
    id: "imports",
    title: "Importer Service",
    shortTitle: "Importer Service",
    summary: "Coordinate customs, port handling, inland movement, and distribution as connected steps in the import workflow.",
    outcome: "Keep every import handoff visible from vessel arrival through final distribution.",
    connections: ["Customs", "Ports", "Distribution"],
    icon: FiTruck,
    preview: { type: "timeline" },
    defaultStep: 6,
    relatedSteps: [6, 7, 8],
  },
  {
    id: "warehouse",
    title: "Warehouse Rent Management",
    shortTitle: "Warehouse Rent",
    summary: "Find storage capacity, manage reservations, and align warehouse availability with procurement and dispatch dates.",
    outcome: "Reserve the right capacity while keeping stock movement and release windows connected.",
    connections: ["Capacity", "Reservations", "Stock"],
    icon: FiPackage,
    preview: { type: "capacity" },
    defaultStep: 5,
    relatedSteps: [4, 5],
  },
  {
    id: "orders",
    title: "Orders & External Orders",
    shortTitle: "Order Tracking",
    summary: "Track OBAOL-managed and external orders through one milestone view with live ownership and status updates.",
    outcome: "Give teams one reliable picture of order health, movement, and the next required action.",
    connections: ["Milestones", "Internal orders", "External orders"],
    icon: FiClipboard,
    preview: { type: "orderSummary" },
    defaultStep: 6,
    relatedSteps: [2, 6, 8],
  },
] as const;

const phases: ReadonlyArray<{ id: PhaseId; title: string; label: string }> = [
  { id: "agreement", title: "Enquiry & Agreement", label: "Phase 01" },
  { id: "fulfillment", title: "Quality & Fulfillment", label: "Phase 02" },
  { id: "closure", title: "Movement & Closure", label: "Phase 03" },
];

const dealSteps = [
  { id: "enquiry", phase: "agreement", title: "Enquiry", description: "A trade-listing enquiry is routed to trusted, verified suppliers for action.", primaryCapability: "enquiries" },
  { id: "documentation", phase: "agreement", title: "Documentation", description: "Purchase, quotation, invoice, and compliance files are prepared in one trade record.", primaryCapability: "documents" },
  { id: "confirmed", phase: "agreement", title: "Order Confirmed", description: "Buyer, seller, and OBAOL responsibilities are finalized before execution begins.", primaryCapability: "orders" },
  { id: "tested", phase: "fulfillment", title: "Tested", description: "Samples and laboratory analysis validate quality against the agreed specification.", primaryCapability: "documents" },
  { id: "procured", phase: "fulfillment", title: "Procured", description: "The execution team checks stock on-ground and completes buyer due diligence.", primaryCapability: "execution" },
  { id: "packed", phase: "fulfillment", title: "Packed", description: "Packing, grading, and storage readiness are completed for dispatch.", primaryCapability: "warehouse" },
  { id: "transport", phase: "closure", title: "Inland Transport", description: "Transport partners handle pickup, movement, and the port handoff.", primaryCapability: "imports" },
  { id: "bl-issued", phase: "closure", title: "BL Issued", description: "Freight forwarders manage customs clearance and issue the Bill of Lading.", primaryCapability: "imports" },
  { id: "delivered", phase: "closure", title: "Delivered", description: "Final delivery, handover, and settlement are verified and closed.", primaryCapability: "orders" },
] as const satisfies ReadonlyArray<{
  id: string;
  phase: PhaseId;
  title: string;
  description: string;
  primaryCapability: CapabilityId;
}>;

const currentStepIndex = 6;

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

const previewFrame = "rounded-[1.5rem] border border-default-200/60 bg-background/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5";
const microLabel = "text-[8px] font-bold uppercase tracking-[0.16em] text-foreground/40";

function StatusDot({ tone = "gold" }: { tone?: "gold" | "green" | "muted" }) {
  const color = tone === "green" ? "bg-success-500" : tone === "muted" ? "bg-foreground/20" : "bg-obaol-500";
  return <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} aria-hidden="true" />;
}

function ChecksPreview() {
  const checks = [
    ["Business identity", "Verified"],
    ["Trade credentials", "Approved"],
    ["Role permissions", "Active"],
  ] as const;
  return (
    <div className={previewFrame}>
      <div className="flex items-center justify-between">
        <span className={microLabel}>Participant verification</span>
        <span className="rounded-full bg-success-500/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-success-600 dark:text-success-400">3 checks passed</span>
      </div>
      <div className="mt-4 space-y-2.5">
        {checks.map(([label, status], index) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-default-200/55 bg-content1/55 px-3 py-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-500/10 text-success-600 dark:text-success-400"><FiCheck size={14} /></span>
            <span className="min-w-0 flex-1 text-xs font-bold text-foreground/75">{label}</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-foreground/40">{status}</span>
            <span className="text-[9px] font-bold text-foreground/25">0{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelinePreview() {
  const stages = [
    ["New request", "12", "gold"],
    ["Qualified", "08", "green"],
    ["Supplier replies", "05", "muted"],
  ] as const;
  return (
    <div className={previewFrame}>
      <div className="flex items-center justify-between">
        <span className={microLabel}>Enquiry pipeline</span>
        <span className="text-[9px] font-bold text-obaol-700 dark:text-obaol-300">Live · 25 records</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {stages.map(([label, value, tone]) => (
          <div key={label} className="rounded-xl border border-default-200/55 bg-content1/55 p-3">
            <div className="flex items-center gap-2"><StatusDot tone={tone} /><span className="text-[8px] font-bold uppercase leading-tight tracking-wider text-foreground/40">{label}</span></div>
            <p className="mt-5 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-obaol-500/25 bg-obaol-500/8 px-3 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-obaol-500 text-obaol-950"><FiSearch size={14} /></span>
        <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-foreground">Black Pepper · 18 MT</p><p className="mt-0.5 text-[9px] font-medium text-foreground/45">Buyer requirement qualified</p></div>
        <span className="rounded-full border border-obaol-500/25 px-2 py-1 text-[8px] font-bold text-obaol-700 dark:text-obaol-300">Ready</span>
      </div>
    </div>
  );
}

function QueuesPreview() {
  const rows = [
    ["Documentation", "A. Mehta", "Due today"],
    ["Quality testing", "Lab partner", "In progress"],
    ["Inland logistics", "Ops team", "Next"],
  ] as const;
  return (
    <div className={previewFrame}>
      <div className="flex items-center justify-between"><span className={microLabel}>Function queue</span><span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-success-600 dark:text-success-400"><StatusDot tone="green" /> Synced</span></div>
      <div className="mt-4 overflow-hidden rounded-xl border border-default-200/55">
        {rows.map(([task, owner, state], index) => (
          <div key={task} className={`grid grid-cols-[1fr_auto] gap-2 bg-content1/55 px-3 py-3 ${index ? "border-t border-default-200/55" : ""}`}>
            <div className="flex min-w-0 items-center gap-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-obaol-500/10 text-[9px] font-bold text-obaol-700 dark:text-obaol-300">0{index + 1}</span><div className="min-w-0"><p className="truncate text-[11px] font-bold text-foreground/75">{task}</p><p className="text-[8px] font-medium text-foreground/40">{owner}</p></div></div>
            <span className="self-center rounded-full bg-background/70 px-2 py-1 text-[8px] font-bold text-foreground/45">{state}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListingsPreview() {
  const listings = [
    ["Black Pepper", "Kerala", "18 MT"],
    ["Turmeric", "Telangana", "32 MT"],
    ["Basmati Rice", "Punjab", "64 MT"],
  ] as const;
  return (
    <div className={previewFrame}>
      <div className="flex items-center gap-2 rounded-xl border border-default-200/55 bg-content1/55 px-3 py-2.5"><FiSearch className="text-foreground/35" size={14} /><span className="text-[10px] font-medium text-foreground/35">Search commodity, origin, grade…</span></div>
      <div className="mt-3 space-y-2">
        {listings.map(([name, origin, stock]) => (
          <div key={name} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-default-200/55 bg-content1/55 px-3 py-3">
            <div className="min-w-0"><p className="truncate text-xs font-bold text-foreground/75">{name}</p><p className="mt-0.5 text-[8px] font-medium uppercase tracking-wider text-foreground/40">Origin · {origin}</p></div>
            <div className="text-right"><p className="text-xs font-bold text-foreground">{stock}</p><p className="text-[8px] font-bold text-success-600 dark:text-success-400">Available</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilesPreview() {
  const files = [
    ["Sample request", "Approved", true],
    ["Quality certificate", "Uploaded", true],
    ["Packing list", "Awaiting owner", false],
  ] as const;
  return (
    <div className={previewFrame}>
      <div className="flex items-center justify-between"><span className={microLabel}>Trade file · ORD-2407</span><span className="text-[9px] font-bold text-foreground/45">2 of 3 ready</span></div>
      <div className="mt-4 space-y-2.5">
        {files.map(([name, state, ready]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl border border-default-200/55 bg-content1/55 px-3 py-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${ready ? "bg-success-500/10 text-success-600 dark:text-success-400" : "bg-obaol-500/10 text-obaol-700 dark:text-obaol-300"}`}>{ready ? <FiCheck size={14} /> : <FiFileText size={14} />}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-foreground/75">{name}</p><p className="mt-0.5 text-[8px] font-medium text-foreground/40">{state}</p></div>
            <StatusDot tone={ready ? "green" : "gold"} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelinePreview() {
  const steps = [
    ["Customs filing", "Complete", true],
    ["Port handling", "In progress", true],
    ["Distribution", "Scheduled", false],
  ] as const;
  return (
    <div className={previewFrame}>
      <div className="flex items-center justify-between"><span className={microLabel}>Import movement</span><span className="rounded-full bg-obaol-500/10 px-2.5 py-1 text-[8px] font-bold text-obaol-700 dark:text-obaol-300">ETA · 2 days</span></div>
      <div className="relative mt-5 grid grid-cols-3 gap-2">
        <div className="absolute left-[16%] right-[16%] top-4 h-px bg-default-200" aria-hidden="true" />
        <div className="absolute left-[16%] top-4 h-px w-[34%] bg-obaol-500" aria-hidden="true" />
        {steps.map(([name, state, active], index) => (
          <div key={name} className="relative text-center"><span className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-[9px] font-bold ${active ? "border-obaol-500 bg-obaol-500 text-obaol-950" : "border-default-200 bg-background text-foreground/35"}`}>{index + 1}</span><p className="mt-3 text-[9px] font-bold leading-tight text-foreground/70">{name}</p><p className="mt-1 text-[8px] font-medium text-foreground/35">{state}</p></div>
        ))}
      </div>
    </div>
  );
}

function CapacityPreview() {
  return (
    <div className={previewFrame}>
      <div className="flex items-center justify-between"><span className={microLabel}>Warehouse · Navi Mumbai</span><span className="flex items-center gap-1.5 text-[8px] font-bold text-success-600 dark:text-success-400"><StatusDot tone="green" /> Open</span></div>
      <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4"><div><p className="text-3xl font-bold tracking-tight text-foreground">68%</p><p className="mt-1 text-[9px] font-medium text-foreground/40">Capacity allocated</p></div><div className="text-right"><p className="text-sm font-bold text-foreground/75">320 MT</p><p className="text-[8px] font-medium text-foreground/40">Available now</p></div></div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-default-200/70"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-obaol-600 to-obaol-400" /></div>
      <div className="mt-4 grid grid-cols-2 gap-2.5"><div className="rounded-xl border border-default-200/55 bg-content1/55 p-3"><p className={microLabel}>Reserved</p><p className="mt-2 text-lg font-bold text-foreground">680 MT</p></div><div className="rounded-xl border border-default-200/55 bg-content1/55 p-3"><p className={microLabel}>Release window</p><p className="mt-2 text-sm font-bold text-foreground">12–14 Jul</p></div></div>
    </div>
  );
}

function OrderSummaryPreview() {
  return (
    <div className={previewFrame}>
      <div className="flex items-start justify-between gap-3"><div><span className={microLabel}>Order · OBA-2407</span><p className="mt-1 text-sm font-bold text-foreground">Black Pepper · India → GCC</p></div><span className="rounded-full bg-obaol-500/10 px-2.5 py-1 text-[8px] font-bold text-obaol-700 dark:text-obaol-300">In movement</span></div>
      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {[["Owner", "Ops team"], ["Health", "On track"], ["Next action", "Port handoff"]].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-default-200/55 bg-content1/55 p-3">
            <p className={microLabel}>{label}</p>
            <p className="mt-2 text-[10px] font-bold leading-tight text-foreground/75 sm:text-xs">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between rounded-xl border border-default-200/55 bg-content1/55 px-3 py-3"><div className="flex items-center gap-2"><FiTruck size={14} className="text-obaol-600" /><span className="text-[10px] font-bold text-foreground/70">Inland transport underway</span></div><span className="text-[8px] font-bold text-foreground/35">Updated now</span></div>
    </div>
  );
}

function CapabilityPreview({ preview }: { preview: PreviewConfig }) {
  switch (preview.type) {
    case "checks": return <ChecksPreview />;
    case "pipeline": return <PipelinePreview />;
    case "queues": return <QueuesPreview />;
    case "listings": return <ListingsPreview />;
    case "files": return <FilesPreview />;
    case "timeline": return <TimelinePreview />;
    case "capacity": return <CapacityPreview />;
    case "orderSummary": return <OrderSummaryPreview />;
  }
}

function trackCapabilitySelection(capability: Capability) {
  if (typeof window === "undefined") return;
  const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", "what_we_do_capability_select", {
    capability_id: capability.id,
    capability_title: capability.title,
  });
}

function trackJourneyStage(step: (typeof dealSteps)[number], index: number) {
  if (typeof window === "undefined") return;
  const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", "execution_journey_stage_select", {
    stage_id: step.id,
    stage_index: index + 1,
    phase_id: step.phase,
  });
}

export default function UnifiedExecutionWorkspace() {
  const [activeId, setActiveId] = useState<CapabilityId>("enquiries");
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useReducedMotion() ?? false;
  const activeIndex = capabilities.findIndex((capability) => capability.id === activeId);
  const activeCapability = capabilities[activeIndex];
  const selectedStep = dealSteps[selectedStepIndex];
  const selectedPhase = phases.find((phase) => phase.id === selectedStep.phase)!;
  const selectedStatus = getStepStatus(selectedStepIndex);

  const selectCapability = (capability: Capability, focus = false) => {
    setActiveId(capability.id);
    setSelectedStepIndex(capability.defaultStep);
    trackCapabilitySelection(capability);
    if (focus) tabRefs.current[capabilities.indexOf(capability)]?.focus();
  };

  const selectStep = (index: number, focus = false) => {
    if (index < 0 || index >= dealSteps.length) return;
    const step = dealSteps[index];
    setSelectedStepIndex(index);
    setActiveId(step.primaryCapability);
    trackJourneyStage(step, index);
    if (focus) stepRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % capabilities.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + capabilities.length) % capabilities.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = capabilities.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    selectCapability(capabilities[nextIndex], true);
  };

  const handleStepKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % dealSteps.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + dealSteps.length) % dealSteps.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = dealSteps.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    selectStep(nextIndex, true);
  };

  return (
    <section aria-labelledby="unified-workspace-title" className="group/workspace relative overflow-hidden rounded-[2rem] border border-obaol-500/20 bg-gradient-to-b from-obaol-50/30 via-content1/40 to-background/45 p-3 shadow-[0_24px_80px_-48px_rgba(207,152,60,0.35)] backdrop-blur-3xl sm:p-4 md:rounded-[2.75rem] md:p-6 dark:from-obaol-950/20 dark:via-content1/35">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-obaol-500/8 blur-3xl" />

      <header className="relative mb-4 flex flex-col gap-4 border-b border-default-200/60 px-2 pb-5 sm:px-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <figure className="relative hidden h-16 w-28 shrink-0 overflow-hidden rounded-2xl border border-obaol-500/20 bg-black sm:block">
            <Image src="/images/order-execution-tracking.png" alt="OBAOL panel tracking a Black Pepper export order" fill loading="eager" sizes="112px" className="object-cover object-[center_62%]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
          </figure>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-success-500 shadow-[0_0_10px_rgba(34,197,94,0.55)]" aria-hidden="true" />
              <h3 id="unified-workspace-title" className="text-sm font-bold uppercase tracking-[0.16em] text-foreground sm:text-base">Live connected workspace</h3>
            </div>
            <p className="mt-1.5 truncate text-xs font-semibold text-foreground/50 sm:text-sm">Black Pepper · India → GCC</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 rounded-full border border-obaol-500/25 bg-obaol-500/10 px-4 py-2 md:justify-start">
          <span className="text-[9px] font-bold uppercase tracking-widest text-obaol-700 dark:text-obaol-300">Current · Inland Transport</span>
          <span className="rounded-full bg-obaol-500 px-2 py-0.5 text-[9px] font-bold text-obaol-950">7 / 9</span>
        </div>
      </header>

      <div className="relative grid gap-4 lg:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)] lg:gap-5">
        <div role="tablist" aria-label="OBAOL platform capabilities" className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-1">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            const isActive = capability.id === activeId;
            return (
              <button
                key={capability.id}
                ref={(node) => { tabRefs.current[index] = node; }}
                id={`capability-tab-${capability.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`capability-panel-${capability.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectCapability(capability)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={`group flex min-h-[82px] items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4 lg:min-h-0 ${isActive ? "border-obaol-500/50 bg-obaol-500/10 shadow-[inset_3px_0_0_rgba(207,152,60,0.8),0_12px_30px_-24px_rgba(207,152,60,0.7)]" : "border-default-200/50 bg-background/35 hover:border-obaol-500/30 hover:bg-background/65"}`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors sm:h-10 sm:w-10 ${isActive ? "border-obaol-500/35 bg-obaol-500 text-obaol-950" : "border-default-200/60 bg-content1/65 text-foreground/45 group-hover:text-obaol-600"}`}><Icon size={17} /></span>
                <span className="min-w-0 flex-1"><span className="block text-[11px] font-bold leading-tight text-foreground sm:text-xs">{capability.shortTitle}</span><span className={`mt-1 hidden text-[8px] font-bold uppercase tracking-[0.13em] sm:block ${isActive ? "text-obaol-700 dark:text-obaol-300" : "text-foreground/30"}`}>{isActive ? "Exploring now" : "Explore capability"}</span></span>
                <FiChevronRight className={`hidden shrink-0 transition-all sm:block ${isActive ? "translate-x-0 text-obaol-600" : "-translate-x-1 text-foreground/20 group-hover:translate-x-0 group-hover:text-foreground/45"}`} size={15} />
              </button>
            );
          })}
        </div>

        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={activeCapability.id}
              id={`capability-panel-${activeCapability.id}`}
              role="tabpanel"
              aria-labelledby={`capability-tab-${activeCapability.id}`}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
              className="flex h-full min-h-[500px] flex-col overflow-hidden rounded-[1.75rem] border border-obaol-500/20 bg-gradient-to-br from-obaol-500/10 via-content1/75 to-background/70 p-5 sm:p-6 md:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-obaol-700 dark:text-obaol-300">Capability {String(activeIndex + 1).padStart(2, "0")} · Connected workspace</p><h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">{activeCapability.title}</h3></div>
                <span className="hidden items-center gap-2 rounded-full border border-success-500/20 bg-success-500/8 px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider text-success-600 dark:text-success-400 sm:flex"><StatusDot tone="green" /> Live view</span>
              </div>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-foreground/60 md:text-base">{activeCapability.summary}</p>

              <div className="my-5 sm:my-6"><CapabilityPreview preview={activeCapability.preview} /></div>

              <div className="mt-auto border-t border-default-200/60 pt-5">
                <p className={microLabel}>Why it matters</p><p className="mt-2 max-w-xl text-xs font-semibold leading-relaxed text-foreground/65 sm:text-sm">{activeCapability.outcome}</p><div className="mt-3 flex flex-wrap gap-2" aria-label="Connected workflow areas">{activeCapability.connections.map((connection) => <span key={connection} className="rounded-full border border-default-200/60 bg-background/50 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-foreground/45">{connection}</span>)}</div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative mt-5 border-t border-default-200/60 px-1 pt-5 sm:px-2" aria-labelledby="execution-lifecycle-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">One order · nine connected stages</p>
            <h4 id="execution-lifecycle-title" className="mt-1 text-lg font-bold tracking-tight text-foreground">Execution lifecycle</h4>
          </div>
          <p className="text-[9px] font-semibold text-foreground/40">Select a stage to see the capability responsible for it.</p>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3" aria-label="Black Pepper order phases">
          {phases.map((phase) => {
            const phaseStatus = getPhaseStatus(phase.id);
            const phaseSteps = dealSteps.flatMap((step, index) => step.phase === phase.id ? [{ step, index }] : []);
            return (
              <section key={phase.id} aria-labelledby={`execution-${phase.id}-title`} className={`relative rounded-[1.5rem] border p-3 sm:p-4 ${phaseStatus === "Active" ? "border-obaol-500/35 bg-obaol-500/[0.045]" : "border-default-200/55 bg-content1/25"}`}>
                <header className="mb-3 flex items-start justify-between gap-3 border-b border-default-200/50 pb-3">
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-obaol-700 dark:text-obaol-300">{phase.label}</p>
                    <h5 id={`execution-${phase.id}-title`} className="mt-1 text-xs font-bold leading-tight text-foreground sm:text-sm">{phase.title}</h5>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.12em] ${phaseStatus === "Active" ? "border-obaol-500/35 bg-obaol-500/10 text-obaol-700 dark:text-obaol-300" : "border-default-200/60 text-foreground/35"}`}>{phaseStatus}</span>
                </header>

                <ol className="relative grid gap-2 sm:grid-cols-3 lg:grid-cols-1" aria-label={`${phase.title} stages`}>
                  <span className="pointer-events-none absolute bottom-5 left-[22px] top-5 hidden w-px bg-gradient-to-b from-obaol-500/30 via-default-200 to-default-200 lg:block" aria-hidden="true" />
                  <span className="pointer-events-none absolute left-[16%] right-[16%] top-[22px] hidden h-px bg-gradient-to-r from-obaol-500/30 via-default-200 to-default-200 sm:block lg:hidden" aria-hidden="true" />
                  {phaseSteps.map(({ step, index }) => {
                    const status = getStepStatus(index);
                    const isSelected = selectedStepIndex === index;
                    const isRelated = activeCapability.relatedSteps.includes(index);
                    return (
                      <li key={step.id} className="relative min-w-0">
                        <button
                          id={`execution-stage-${step.id}`}
                          ref={(node) => { stepRefs.current[index] = node; }}
                          type="button"
                          aria-pressed={isSelected}
                          aria-current={status === "current" ? "step" : undefined}
                          data-workflow-step={step.id}
                          tabIndex={isSelected ? 0 : -1}
                          onClick={() => selectStep(index)}
                          onKeyDown={(event) => handleStepKeyDown(event, index)}
                          className={`relative z-10 flex h-full min-h-[76px] w-full min-w-0 items-start gap-3 rounded-2xl border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 ${isSelected ? "border-obaol-500/55 bg-obaol-500/12 shadow-[0_12px_28px_-22px_rgba(207,152,60,0.8)]" : isRelated ? "border-obaol-500/30 bg-obaol-500/5" : "border-default-200/55 bg-background/45 hover:border-obaol-500/25 hover:bg-background/70"}`}
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[9px] font-bold ${status === "current" ? "border-obaol-500 bg-obaol-500 text-obaol-950" : status === "complete" ? "border-obaol-500/30 bg-background text-obaol-700 dark:text-obaol-300" : "border-default-200/70 bg-background text-foreground/35"}`}>{status === "complete" ? <FiCheck size={13} /> : String(index + 1).padStart(2, "0")}</span>
                          <span className="min-w-0 flex-1 pt-0.5"><span className="block whitespace-normal break-words text-[10px] font-bold leading-snug text-foreground/75 sm:text-[11px]">{step.title}</span><span className={`mt-1 block text-[7px] font-bold uppercase tracking-[0.12em] ${status === "current" ? "text-obaol-700 dark:text-obaol-300" : "text-foreground/35"}`}>{statusLabel[status]}</span></span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedStep.id}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
            className="mt-2 grid gap-4 rounded-[1.5rem] border border-default-200/60 bg-content1/45 p-4 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.65fr)] md:items-center md:p-5"
            aria-live="polite"
          >
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-obaol-700 dark:text-obaol-300">{selectedPhase.label} · {selectedPhase.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2.5"><h5 className="text-lg font-bold tracking-tight text-foreground">{selectedStep.title}</h5><span className="rounded-full border border-default-200/60 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-foreground/45">{statusLabel[selectedStatus]}</span></div>
              <p className="mt-2 max-w-2xl text-xs font-medium leading-relaxed text-foreground/55 sm:text-sm">{selectedStep.description}</p>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.14em] text-foreground/40"><span>Live order progress</span><span>{currentStepIndex + 1} of {dealSteps.length}</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-default-200/65" role="progressbar" aria-label="Live order progress" aria-valuemin={1} aria-valuemax={dealSteps.length} aria-valuenow={currentStepIndex + 1}><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-obaol-600 to-obaol-400" /></div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <button type="button" data-workflow-step="previous" onClick={() => selectStep(selectedStepIndex - 1)} disabled={selectedStepIndex === 0} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-default-200/70 bg-background/60 px-3 text-[8px] font-bold uppercase tracking-wider text-foreground/60 hover:border-obaol-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 disabled:cursor-not-allowed disabled:opacity-35"><FiChevronLeft size={13} /> Previous</button>
                <button type="button" data-workflow-step="next" onClick={() => selectStep(selectedStepIndex + 1)} disabled={selectedStepIndex === dealSteps.length - 1} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-obaol-500 px-3 text-[8px] font-bold uppercase tracking-wider text-obaol-950 hover:bg-obaol-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 disabled:cursor-not-allowed disabled:opacity-35">Next <FiChevronRight size={13} /></button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
