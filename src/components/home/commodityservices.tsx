"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type Stage = {
  id: string;
  label: string;
  obaolDesc: string;
};

const STAGES: Stage[] = [
  {
    id: "suppliers",
    label: "Supplier Access",
    obaolDesc: "Verified suppliers are sourced based on your trade requirements.",
  },
  {
    id: "verification",
    label: "Verification & Certification",
    obaolDesc:
      "Supplier legitimacy, stock availability, and documents are independently verified.",
  },
  {
    id: "documentation",
    label: "Trade Documentation",
    obaolDesc:
      "LOI, PO, contracts, confirmations, and compliance documents are structured.",
  },
  {
    id: "procurement",
    label: "On-Ground Procurement",
    obaolDesc:
      "OBAOL executes on-site stock inspection and quality verification.",
  },
  {
    id: "packaging",
    label: "Packaging",
    obaolDesc:
      "Packaging standards are validated and confirmed before dispatch.",
  },
  {
    id: "logistics",
    label: "Logistics & Transport",
    obaolDesc:
      "Domestic logistics and shipping coordination are executed.",
  },
  {
    id: "payments",
    label: "Payments",
    obaolDesc:
      "Milestone-based, secure payment execution based on agreed trade terms.",
  },
];

const COMPARISON_ROWS = [
  {
    label: "Primary Purpose",
    traditional: "Visibility and lead generation",
    obaol: "Trade execution and deal completion",
  },
  {
    label: "Core Focus",
    traditional: "Listings, inquiries, contacts",
    obaol: "Opportunity identification + execution",
  },
  {
    label: "Verification Level",
    traditional: "Limited or optional",
    obaol: "Mandatory, multi-step verification",
  },
  {
    label: "Role After Introduction",
    traditional: "No involvement",
    obaol: "Active involvement till closure",
  },
  {
    label: "Opportunity Quality",
    traditional: "High volume, mixed seriousness",
    obaol: "Fewer, filtered, serious opportunities",
  },
  {
    label: "Execution Support",
    traditional: "Not provided",
    obaol: "Provided (coordination, supervision)",
  },
  {
    label: "On-Ground Involvement",
    traditional: "None",
    obaol: "Yes (as required)",
  },
  {
    label: "Accountability",
    traditional: "None after contact exchange",
    obaol: "Exists through relationship ownership",
  },
  {
    label: "Revenue Model",
    traditional: "Subscriptions, ads, lead selling",
    obaol: "Success-based execution model",
  },
  {
    label: "Incentive Alignment",
    traditional: "Platform earns regardless of outcome",
    obaol: "OBAOL earns only if trade completes",
  },
  {
    label: "Risk Handling",
    traditional: "User-managed",
    obaol: "Supported and monitored",
  },
  {
    label: "Relationship Management",
    traditional: "No continuity",
    obaol: "Dedicated Relationship Partner",
  },
];

export default function ResponsibilityTransferSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [obaolHandles, setObaolHandles] = useState<string[]>([]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /**
   * SCROLL → SPACE MAPPING
   * This is the core of the effect you want
   */
  // SLOW, SOFT, CINEMATIC FADE
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [0, 1, 1, 0]
  );

  // COMING FROM BACK → GOING BACK
  const y = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [200, 0, 0, -200]
  );

  // DEPTH FEEL
  const scale = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [0.94, 1, 1, 0.94]
  );

  const toggle = (id: string) => {
    setObaolHandles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <motion.section
      ref={sectionRef}
      style={{
        opacity,
        y,
        scale,
        willChange: "transform, opacity",
      }} className="relative py-40 px-6 bg-background border-t border-default-200 overflow-hidden"
    >
      {/* Soft background continuity & Futuristic ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-400/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px]" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
      </div>

      <div className="relative max-w-7xl mx-auto">



        {/* Heading */}
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl md:text-5xl font-bold leading-snug tracking-tight">
            <span className="text-orange-400">Who</span> are we?
          </h2>

          <p className="mt-6 text-default-500 text-lg leading-relaxed">
            We <span className="text-foreground font-medium">list</span>. We <span className="text-foreground font-medium">match</span>. We <span className="text-orange-400 font-semibold">execute</span>.
          </p>
        </div>
        {/* Differentiation Panel */}
        <div className="mt-12 mb-32">
          <div className=" mx-auto">
            <h3 className="text-xl text-default-500 mb-4">
              Why OBAOL is not a traditional B2B Platform
            </h3>

            <p className="text-default-500 mb-10 max-w-3xl">
              Most B2B platforms stop at introductions. OBAOL stays accountable
              through execution, verification, and closure.
            </p>

            {/* Desktop Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="hidden md:block rounded-2xl overflow-hidden backdrop-blur-xl bg-white/[0.02] border border-white/10 shadow-2xl"
            >
              <div className="grid grid-cols-3 bg-white/[0.04] border-b border-white/10">
                <div className="p-5 text-sm font-semibold tracking-wider uppercase text-default-400">
                  Aspect
                </div>
                <div className="p-5 text-sm font-semibold tracking-wider uppercase text-default-400">
                  Traditional B2B Platforms
                </div>
                <div className="p-5 text-sm font-bold tracking-wider uppercase text-orange-400">
                  OBAOL – Trade Execution System
                </div>
              </div>

              {COMPARISON_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-3 border-b border-white/5 transition-all duration-300 hover:bg-white/[0.06] ${i % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
                    }`}
                >
                  <div className="p-5 text-sm font-medium text-default-300">
                    {row.label}
                  </div>
                  <div className="p-5 text-sm text-default-500">
                    {row.traditional}
                  </div>
                  <div className="p-5 text-sm text-foreground font-medium">
                    {row.obaol}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Mobile (Stacked) */}
            <div className="md:hidden space-y-6">
              {COMPARISON_ROWS.map((row) => (
                <div
                  key={row.label}
                  className="border border-default-200 rounded-lg p-4 bg-content1"
                >
                  <p className="text-sm text-default-500 mb-2">
                    {row.label}
                  </p>
                  <p className="text-xs text-default-400">
                    Traditional: {row.traditional}
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    OBAOL: {row.obaol}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-3xl mb-12">

          <p className="mt-6 text-default-600 leading-relaxed">
            OBAOL executes the full commodity trade lifecycle — from supplier
            discovery and verification to logistics, documentation, and
            settlement.
          </p>

          <p className="mt-6 text-default-500">
            Delegate execution selectively. Retain strategic control.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-10 items-start">

          {/* LEFT — Stage Selector */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs uppercase tracking-widest text-default-400 font-bold">
                Trade Lifecycle
              </h3>
              {/* Hint pill — tells user it's interactive */}
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-orange-400/70 border border-orange-400/20 rounded-full px-3 py-1 bg-orange-400/5 animate-pulse">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
                Click to assign
              </span>
            </div>

            <div className="space-y-2.5">
              {STAGES.map((stage, i) => {
                const active = obaolHandles.includes(stage.id);

                return (
                  <div
                    key={stage.id}
                    onClick={() => toggle(stage.id)}
                    className={`group relative cursor-pointer flex items-center justify-between gap-4 px-5 py-4 rounded-xl border-l-[3px] transition-all duration-200 select-none
                      ${active
                        ? "border-orange-400 bg-orange-400/10 shadow-[inset_0_0_30px_rgba(251,146,60,0.08)] ring-1 ring-orange-400/20"
                        : "border-transparent bg-foreground/[0.04] hover:bg-foreground/[0.07] hover:border-orange-400/40 hover:ring-1 hover:ring-orange-400/10"
                      }`}
                  >
                    {/* Step number */}
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors duration-300
                      ${active ? "bg-orange-400 text-black" : "bg-foreground/10 text-default-500 group-hover:bg-orange-400/20 group-hover:text-orange-400"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Label */}
                    <span className={`flex-1 text-sm font-medium tracking-wide transition-colors duration-300
                      ${active ? "text-foreground" : "text-default-400 group-hover:text-foreground/70"}`}>
                      {stage.label}
                    </span>

                    {/* Toggle pill */}
                    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex-shrink-0
                      ${active
                        ? "bg-orange-400/20 text-orange-400 border border-orange-400/30"
                        : "bg-foreground/5 text-default-500 border border-foreground/10 group-hover:border-orange-400/20 group-hover:text-orange-400/60"
                      }`}>
                      {/* Dot indicator */}
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300
                        ${active ? "bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.8)]" : "bg-default-500"}`} />
                      {active ? "OBAOL" : "You"}
                    </div>

                    {/* Chevron */}
                    <svg
                      className={`w-4 h-4 flex-shrink-0 transition-all duration-300
                        ${active ? "text-orange-400 rotate-90" : "text-default-600 group-hover:text-orange-400/50"}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — Responsibility Panel */}
          <div className="sticky top-28 p-8 rounded-2xl border border-foreground/10 bg-foreground/[0.02] backdrop-blur-xl shadow-2xl relative overflow-hidden h-[480px] flex flex-col">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 blur-[80px] pointer-events-none" />
            {/* Active glow — visible when something is selected */}
            {obaolHandles.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-orange-400/5 via-transparent to-transparent pointer-events-none"
              />
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-semibold text-base text-foreground tracking-tight flex items-center gap-3">
                <span className="w-6 h-px bg-orange-400/50 inline-block" />
                OBAOL Handles
              </h3>
              {obaolHandles.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-400 text-black text-xs font-black shadow-[0_0_12px_rgba(251,146,60,0.6)]"
                >
                  {obaolHandles.length}
                </motion.span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 relative z-10 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(251,146,60,0.3)_transparent]">
              {obaolHandles.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center gap-4 py-8"
                >
                  {/* Arrow pointing left to hint clicking */}
                  <div className="flex items-center gap-2 text-default-500/50">
                    <svg className="w-6 h-6 animate-bounce -rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span className="text-sm text-default-500 font-medium">
                      Select stages to delegate
                    </span>
                  </div>
                  <p className="text-xs text-default-600 max-w-[200px] leading-relaxed">
                    Click any stage on the left to assign execution to OBAOL.
                  </p>
                </motion.div>
              ) : (
                <ul className="space-y-3">
                  {obaolHandles.map((id) => {
                    const stage = STAGES.find((s) => s.id === id);
                    return (
                      <motion.li
                        key={id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex gap-3 p-3 rounded-xl bg-orange-400/5 border border-orange-400/15"
                      >
                        <span className="w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-orange-400 to-yellow-400 self-stretch" />
                        <div>
                          <p className="text-sm font-bold text-foreground tracking-wide">
                            {stage?.label}
                          </p>
                          <p className="mt-1.5 text-xs text-default-400 leading-relaxed">
                            {stage?.obaolDesc}
                          </p>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-default-600 relative z-10 border-t border-foreground/5 pt-4 flex-shrink-0">
              You remain in control. OBAOL executes selected steps.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="max-w-3xl mt-28">
          <p className="text-lg text-default-600">
            Trading is no longer a collection of disconnected steps.
          </p>

          <p className="mt-4 text-default-500 leading-relaxed">
            OBAOL replaces fragmented tools and informal coordination with a
            single structured execution system built for real-world commodity
            trade.
          </p>
        </div>
      </div>


    </motion.section>
  );
}
