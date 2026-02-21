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
      className="relative py-32 md:py-48 px-6 border-t border-white/5 bg-background overflow-hidden"
    >
      {/* Deep Space Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-orange-400/5 rounded-full blur-[150px] -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-yellow-400/5 rounded-full blur-[120px] translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[500px] bg-indigo-500/5 blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mb-24 md:mb-32"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground">
            Trade Execution, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Explained by Process — Not Promises</span>
          </h2>
          <p className="mt-8 text-lg md:text-xl text-default-500 leading-relaxed max-w-3xl">
            The difference between delayed trades and fast execution is not
            intent — it is <span className="text-foreground font-medium">process structure</span>. Below is a realistic breakdown
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
        className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-10 flex items-center gap-4"
        whileHover={{ x: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <span className="w-8 h-px bg-gradient-to-r from-orange-400 to-transparent block hidden sm:block" />
        {title}
      </motion.h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Traditional */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden"
        >
          <span className="text-xs uppercase tracking-widest text-default-500 font-bold block mb-2">
            Traditional Method
          </span>
          <ul className="mt-6 space-y-4 relative z-10">
            {traditionalSteps.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center justify-between text-sm md:text-base text-default-400 py-3 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-default-600" />
                  <span>{s.label}</span>
                </div>
                <span className="text-default-500 font-medium whitespace-nowrap ml-4">{s.time}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* OBAOL */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`p-8 rounded-2xl backdrop-blur-xl border transition-all duration-500 relative overflow-hidden group/obaol shadow-2xl
            ${highlight
              ? "bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30 shadow-[0_0_40px_rgba(251,146,60,0.15)]"
              : "border-white/10 bg-white/[0.03] hover:border-orange-400/50 hover:bg-orange-500/5"
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

          <span className="text-xs uppercase tracking-widest font-bold relative z-10 text-default-400 block mb-2">
            With
            <span className="text-orange-400 ml-1">OBAOL</span>
          </span>
          <ul className="mt-6 space-y-4 relative z-10">
            {obaolSteps.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center justify-between text-sm md:text-base text-default-300 py-3 border-b border-orange-500/10 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
                  <span className="font-medium">{s.label}</span>
                </div>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 whitespace-nowrap ml-4 text-base md:text-lg tracking-tight drop-shadow-sm">{s.time}</span>
              </motion.li>
            ))}
          </ul>

          {note && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-4 text-xs text-default-500 italic relative z-10"
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
      transition={{ type: "spring", stiffness: 300, duration: 0.8 }}
      className={`relative p-8 md:p-12 rounded-3xl border overflow-hidden backdrop-blur-xl transition-all duration-500 ${highlight
        ? "border-orange-500/40 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent shadow-[0_0_60px_rgba(251,146,60,0.2)]"
        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
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
      <div className="relative z-10 flex flex-col items-center text-center">
        <h4 className="text-sm md:text-base tracking-widest uppercase font-bold text-default-400 mb-6">{title}</h4>
        <motion.p
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200 }}
          className={`text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter ${highlight ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 drop-shadow-xl" : "text-foreground"
            }`}
        >
          {time}
        </motion.p>
        <p className="mt-8 text-sm md:text-base text-default-500 leading-relaxed max-w-sm">{note}</p>
      </div>
    </motion.div>
  );
}
