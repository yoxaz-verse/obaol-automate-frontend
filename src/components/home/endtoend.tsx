"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";




export default function EndToEndSection() {
  const sectionRef = useRef<HTMLElement>(null);

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



  return (

       <motion.section 
       
       ref={sectionRef}
       style={{
         opacity,
         y,
         scale,
         willChange: "transform, opacity",
       }}  
       className="relative py-32 px-6 border-t border-gray-800 bg-black overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-semibold">
              Trade Execution, Explained by Process — Not Promises
            </h2>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              The difference between delayed trades and fast execution is not
              intent — it is process structure. Below is a realistic breakdown
              of how commodity trades are executed traditionally versus through
              OBAOL.
            </p>
          </motion.div>

          <div className="space-y-14">
            {/* Supplier Discovery */}
            <TimeCompare
              title="Supplier Discovery & Initial Screening"
              traditionalSteps={[
                { label: "Market search & references", time: "2–4 days" },
                { label: "Informal supplier checks", time: "2–3 days" },
              ]}
              obaolSteps={[
                {
                  label: "Access pre-verified suppliers",
                  time: "5–10 minutes",
                },
              ]}
              highlight
            />

            {/* Stock Verification */}
            <TimeCompare
              title="Stock Verification (Mandatory Double Check)"
              traditionalSteps={[
                { label: "Supplier self-declared stock", time: "1–3 days" },
                {
                  label: "Independent verification",
                  time: "Often skipped or delayed",
                },
              ]}
              obaolSteps={[
                { label: "Supplier confirmation", time: "Same day" },
                { label: "Independent OBAOL verification", time: "1–2 days" },
              ]}
              highlight
            />

            {/* Documentation */}
            <TimeCompare
              title="Documentation (LOI, PO, Contract)"
              traditionalSteps={[
                { label: "Manual drafting & sharing", time: "2–3 days" },
                { label: "Revisions & approvals", time: "1–2 days" },
              ]}
              obaolSteps={[
                {
                  label: "Structured documentation workflow",
                  time: "Same day",
                },
              ]}
              highlight
            />

            {/* Procurement */}
            <TimeCompare
              title="Procurement & On-Ground Coordination"
              traditionalSteps={[
                { label: "Buyer travel & site visits", time: "3–6 days" },
                { label: "Local coordination delays", time: "1–2 days" },
              ]}
              obaolSteps={[
                {
                  label: "Nearest procurement specialist assigned",
                  time: "Same day",
                },
                { label: "On-site procurement & checks", time: "1–2 days" },
              ]}
              highlight
              note="For first-time suppliers, full procurement is conducted. For recurring suppliers, this step is significantly reduced."
            />

            {/* Packaging & Domestic Transport */}
            <TimeCompare
              title="Packaging & Domestic Transportation"
              traditionalSteps={[
                { label: "Source packaging solutions", time: "1–2 days" },
                { label: "Arrange inland transport", time: "1–2 days" },
              ]}
              obaolSteps={[
                {
                  label: "Packaging options sourced & finalized",
                  time: "Same day",
                },
                {
                  label: "Domestic transport planned & executed",
                  time: "Same day",
                },
              ]}
              highlight
            />

            {/* Logistics */}
            <TimeCompare
              title="Logistics & Shipping Allocation"
              traditionalSteps={[
                {
                  label: "Identify shipping routes & vessels",
                  time: "2–3 days",
                },
                { label: "Schedule coordination", time: "1–2 days" },
              ]}
              obaolSteps={[
                { label: "Pre-aligned logistics partners", time: "Few hours" },
                { label: "Route & vessel allocation", time: "Same day" },
              ]}
              highlight
            />

            {/* Payments */}
            <TimeCompare
              title="Payments & Settlement"
              traditionalSteps={[
                {
                  label: "Payment negotiation & risk checks",
                  time: "1–3 days",
                },
              ]}
              obaolSteps={[
                {
                  label: "Secure payment method (plan-based)",
                  time: "Immediate",
                },
                {
                  label: "Milestone-based settlement",
                  time: "Defined upfront",
                },
              ]}
              highlight
              note="Payment structure depends on the plan and method selected. Bank-based settlements may bypass escrow-style steps."
            />
          </div>

          {/* TOTAL TIME */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-24 grid md:grid-cols-2 gap-8"
          >
            <TotalTimeCard
              title="Traditional Trade Execution"
              time="18–30 Days"
              note="Timelines vary significantly due to travel, manual coordination, and lack of verification."
            />

            <TotalTimeCard
              title="With OBAOL"
              time="6–9 Days"
              highlight
              note="Time is reduced by structuring processes — not by skipping verification or due diligence."
            />
          </motion.div>
        </div>
      </motion.section>
  );
}



function TimeCompare({
    title,
    traditionalSteps,
    obaolSteps,
    highlight,
    note,
  }: {
    title: string;
    traditionalSteps: { label: string; time: string }[];
    obaolSteps: { label: string; time: string }[];
    highlight?: boolean;
    note?: string;
  }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: "-100px" }}
        className="group"
      >
        <motion.h3
          className="text-xl md:text-2xl font-semibold text-white mb-8"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {title}
        </motion.h3>
  
        <div className="grid md:grid-cols-2 gap-6">
          {/* Traditional */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-6 rounded-xl border border-gray-800 bg-neutral-950 hover:border-gray-700 transition-all duration-300"
          >
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">
              Traditional Method
            </span>
            <ul className="mt-4 space-y-3">
              {traditionalSteps.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex justify-between items-center text-sm text-gray-300 py-2 border-b border-gray-900 last:border-0"
                >
                  <span>{s.label}</span>
                  <span className="text-gray-500 font-medium">{s.time}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
  
          {/* OBAOL */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`p-6 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 border transition-all relative overflow-hidden group/obaol
            ${
              highlight
                ? "border-orange-400 shadow-[0_0_30px_rgba(255,165,0,0.3)]"
                : "border-gray-700 hover:border-orange-400/50"
            }`}
          >
            {/* Glow effect */}
            {highlight && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/10 to-orange-400/0 opacity-0 group-hover/obaol:opacity-100 transition-opacity duration-500"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}
  
            <span className="text-xs uppercase tracking-wide font-medium relative z-10">
              With
              <span className="text-orange-400"> OBAOL</span>
            </span>
            <ul className="mt-4 space-y-3 relative z-10">
              {obaolSteps.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex justify-between items-center text-sm text-gray-200 py-2 border-b border-gray-800 last:border-0"
                >
                  <span>{s.label}</span>
                  <span className="font-semibold text-orange-400">{s.time}</span>
                </motion.li>
              ))}
            </ul>
  
            {note && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-4 text-xs text-gray-400 italic relative z-10"
              >
                {note}
              </motion.p>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }
  
  function TotalTimeCard({
    title,
    time,
    note,
    highlight,
  }: {
    title: string;
    time: string;
    note: string;
    highlight?: boolean;
  }) {
    return (
      <motion.div
        whileHover={{ scale: 1.03, y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`relative p-8 rounded-xl border overflow-hidden ${
          highlight
            ? "border-orange-400/50 bg-gradient-to-br from-neutral-900 to-black shadow-[0_0_40px_rgba(255,165,0,0.2)]"
            : "border-gray-800 bg-black hover:border-gray-700"
        }`}
      >
        {highlight && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/5 to-orange-400/0"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
        <div className="relative z-10">
          <h4 className="text-lg font-semibold">{title}</h4>
          <motion.p
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className={`mt-4 text-4xl md:text-5xl font-bold ${
              highlight ? "text-orange-400" : "text-white"
            }`}
          >
            {time}
          </motion.p>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed">{note}</p>
        </div>
      </motion.div>
    );
  }
  