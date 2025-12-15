"use client";

import { useState } from "react";

type FailureStage = {
  id: string;
  stage: string;
  failure: string;
  detail: string;
};

const FAILURES: FailureStage[] = [
  {
    id: "supplier",
    stage: "Supplier Discovery",
    failure: "Discovery doesn’t mean reliability",
    detail:
      "Even after days of searching, suppliers may not be genuine, certified, or available. Stock may already be committed elsewhere.",
  },
  {
    id: "validation",
    stage: "Supplier Validation",
    failure: "Trust is assumed, not verified",
    detail:
      "Certifications are outdated, capacity is unclear, and there is no structured way to validate legitimacy.",
  },
  {
    id: "buyer",
    stage: "Buyer Confirmation",
    failure: "Demand may not be real",
    detail:
      "Suppliers waste time on floated or non-serious inquiries without knowing if the buyer can actually execute.",
  },
  {
    id: "documentation",
    stage: "Documentation",
    failure: "Paperwork slows everything",
    detail:
      "LOIs, POs, and contracts are manually prepared, revised repeatedly, and exchanged over disconnected channels.",
  },
  {
    id: "payment",
    stage: "Payments",
    failure: "High risk, low protection",
    detail:
      "Advance payments carry fraud risk, timelines are unclear, and disputes have no structured resolution.",
  },
  {
    id: "logistics",
    stage: "Logistics & Transport",
    failure: "Execution breaks down",
    detail:
      "Transport, packaging, and scheduling are uncoordinated, causing delays and missed timelines.",
  },
];

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function BrokenTradeExperience() {
  const [index, setIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const current = FAILURES[index];
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
  return (
    <motion.section 
    
    ref={sectionRef}
    style={{
      opacity,
      y,
      scale,
      willChange: "transform, opacity",
    }}
  className="py-20 sm:py-32 px-4 sm:px-6 border-t border-gray-800 bg-neutral-950">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="max-w-3xl mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Why Commodity Trading Still Feels Broken
          </h2>
          <p className="mt-4 sm:mt-6 text-gray-300 text-sm sm:text-base">
            Let’s walk through a typical commodity trade — and see where it
            actually breaks down.
          </p>
        </div>

        {/* Trade Simulator */}
        <div className="relative border border-gray-800 rounded-xl bg-black p-5 sm:p-10">
          {/* Progress – mobile scroll, desktop static */}
          <div className="mb-8 sm:mb-10">
            {/* Mobile progress dots */}
            <div className="md:hidden mt-2 mb-2 flex gap-1">
              {FAILURES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-6 rounded-full ${
                    i === index ? "bg-orange-400" : "bg-gray-700"
                  }`}
                />
              ))}
            </div>
            {/* Desktop Progress */}
            <div className="hidden md:flex justify-between text-xs text-gray-500">
              {FAILURES.map((f, i) => (
                <span
                  key={f.id}
                  className={i === index ? "text-orange-400" : ""}
                >
                  {f.stage}
                </span>
              ))}
            </div>

            {/* Mobile Active Step */}
            <div className="md:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs font-medium text-orange-400"
                >
                  {current.stage}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Failure */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {current.failure}
              </h3>

              <p className="mt-3 sm:mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
                {current.detail}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <span className="text-xs sm:text-sm text-gray-500">
              Trade Stage {index + 1} of {FAILURES.length}
            </span>

            <button
              onClick={() =>
                setIndex((prev) =>
                  prev === FAILURES.length - 1 ? 0 : prev + 1
                )
              }
              className="w-full sm:w-auto px-6 py-3 rounded-md
                         border border-gray-700 text-sm
                         hover:border-orange-400 transition"
            >
              {index === FAILURES.length - 1
                ? "Restart Trade Flow"
                : "Next Stage →"}
            </button>
          </div>
        </div>

        {/* End Note */}
        {index === FAILURES.length - 1 && (
          <div className="mt-10 sm:mt-16 max-w-3xl">
            <p className="text-xs sm:text-sm text-gray-400">
              This is not a rare failure — this is how most commodity trades
              operate today.
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
