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
      className="relative py-28 sm:py-40 px-4 sm:px-6 bg-background overflow-hidden"
    >
      {/* Ambient error glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-red-500/5 blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Heading */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Why Commodity Trading <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Still Feels Broken</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-default-500 text-lg md:text-xl leading-relaxed"
          >
            Let’s walk through a typical commodity trade — and see where it
            actually breaks down.
          </motion.p>
        </div>

        {/* Trade Simulator */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl backdrop-blur-2xl bg-white/[0.02] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] p-6 sm:p-12 overflow-hidden min-h-[400px] flex flex-col justify-between"
        >
          {/* Subtle warning glow tied to progress */}
          <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />

          {/* Progress tracking */}
          <div className="mb-12 relative z-10">
            {/* Desktop Progress Bar */}
            <div className="hidden md:flex justify-between items-center relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/5 -z-10" />
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-orange-400 to-red-400 -z-10"
                initial={{ width: "0%" }}
                animate={{ width: `${(index / (FAILURES.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />

              {FAILURES.map((f, i) => {
                const isActive = i === index;
                const isPast = i < index;
                return (
                  <div key={f.id} className="relative flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${isActive ? "bg-red-400 border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.8)]" :
                      isPast ? "bg-orange-400 border-orange-400" : "bg-background border-white/20"
                      }`} />
                    <span
                      className={`absolute top-6 whitespace-nowrap text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${isActive ? "text-red-400" :
                        isPast ? "text-orange-400/70" : "text-default-500/50"
                        }`}
                    >
                      {f.stage}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Progress */}
            <div className="md:hidden mt-2 mb-6 flex gap-1.5 justify-center">
              {FAILURES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full transition-all duration-300 ${i === index ? "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]" : i < index ? "bg-orange-400/50" : "bg-white/10"
                    }`}
                />
              ))}
            </div>

            {/* Mobile Active Step Label */}
            <div className="md:hidden flex justify-center mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-bold tracking-widest uppercase text-red-400"
                >
                  {current.stage}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Failure Content */}
          <div className="flex-1 flex flex-col justify-center mt-8 md:mt-16 mb-8 md:mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(8px)" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="max-w-2xl"
              >
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
                  <span className="text-red-400">—</span> {current.failure}
                </h3>

                <p className="mt-6 text-default-500 text-base sm:text-lg md:text-xl leading-relaxed">
                  {current.detail}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mt-auto">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold tracking-widest uppercase text-default-500">
                Stage {index + 1}
              </span>
              <span className="text-default-600">/</span>
              <span className="text-sm font-medium tracking-widest text-default-600">
                {FAILURES.length}
              </span>
            </div>

            <button
              onClick={() =>
                setIndex((prev) =>
                  prev === FAILURES.length - 1 ? 0 : prev + 1
                )
              }
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${index === FAILURES.length - 1
                ? "bg-white/5 text-default-300 hover:bg-white/10 hover:text-white border border-white/10"
                : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(248,113,113,0.2)]"
                }`}
            >
              {index === FAILURES.length - 1
                ? "Restart Simulator"
                : "Next Stage →"}
            </button>
          </div>
        </motion.div>

        {/* End Note */}
        {index === FAILURES.length - 1 && (
          <div className="mt-10 sm:mt-16 max-w-3xl">
            <p className="text-xs sm:text-sm text-default-500">
              This is not a rare failure — this is how most commodity trades
              operate today.
            </p>
          </div>
        )}
      </div>
    </ motion.section>
  );
}
