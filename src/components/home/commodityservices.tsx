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
      {/* Soft background continuity */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="relative max-w-7xl mx-auto">



        {/* Heading */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase tracking-widest text-default-400">
            Who we are
          </span>

          <h2 className="mt-4 text-3xl md:text-4xl font-semibold leading-snug">
            Not a Marketplace.
            <br />
            <span className="text-orange-400">
              A Complete Trading System.
            </span>
          </h2>
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
            <div className="hidden md:block border border-default-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 bg-content1">
                <div className="p-4 text-sm font-medium text-default-500">
                  Aspect
                </div>
                <div className="p-4 text-sm font-medium text-default-500">
                  Traditional B2B Platforms
                </div>
                <div className="p-4 text-sm font-medium text-orange-400">
                  OBAOL – Trade Execution System
                </div>
              </div>

              {COMPARISON_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-3 border-t border-default-200 ${i % 2 === 0 ? "bg-background" : "bg-content1"
                    }`}
                >
                  <div className="p-4 text-sm text-default-600">
                    {row.label}
                  </div>
                  <div className="p-4 text-sm text-default-500">
                    {row.traditional}
                  </div>
                  <div className="p-4 text-sm text-foreground">
                    {row.obaol}
                  </div>
                </div>
              ))}
            </div>

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
        <div className="grid md:grid-cols-2 gap-16">
          {/* LEFT */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-default-400 mb-6">
              Trade Lifecycle
            </h3>

            <div className="space-y-2">
              {STAGES.map((stage) => {
                const active = obaolHandles.includes(stage.id);

                return (
                  <div
                    key={stage.id}
                    onClick={() => toggle(stage.id)}
                    className={`cursor-pointer px-5 py-4 border-l-2 transition-all duration-300
                      ${active
                        ? "border-orange-400 bg-content2"
                        : "border-default-200 bg-content1 hover:border-default-300"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">
                        {stage.label}
                      </span>
                      <span
                        className={`text-xs tracking-wide ${active
                          ? "text-orange-400"
                          : "text-default-400"
                          }`}
                      >
                        {active ? "Executed by OBAOL" : "Executed by You"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div className="p-8 border border-default-200 bg-content1">
            <h3 className="font-semibold text-foreground">
              Execution Responsibility
            </h3>

            {obaolHandles.length === 0 ? (
              <p className="mt-6 text-sm text-default-400">
                Select any stage to delegate execution to OBAOL.
              </p>
            ) : (
              <ul className="mt-6 space-y-6">
                {obaolHandles.map((id) => {
                  const stage = STAGES.find((s) => s.id === id);
                  return (
                    <li key={id}>
                      <p className="text-sm font-medium text-foreground">
                        {stage?.label}
                      </p>
                      <p className="mt-1 text-xs text-default-600 leading-relaxed">
                        {stage?.obaolDesc}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="mt-8 text-xs text-default-400">
              You remain in control. OBAOL executes selected responsibilities.
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
