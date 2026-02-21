"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type Stage = {
  id: string;
  label: string;
  obaolDesc: string;
};



export default function ProcurementSpecialistSection() {
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
      {/* Cinematic Background Ambient Glows & Grid */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Glows */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full translate-x-1/3" />

        {/* Subtle Tech Grid */}
        <div
          className="w-full h-full opacity-[0.03] mix-blend-screen"
          style={{
            backgroundImage: `
                linear-gradient(to right, #ffffff 1px, transparent 1px),
                linear-gradient(to bottom, #ffffff 1px, transparent 1px)
              `,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)"
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mb-24 md:mb-32 text-center mx-auto"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground">
            Procurement Execution <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">— Step by Step</span>
          </h2>
          <p className="mt-8 text-lg md:text-xl text-default-500 leading-relaxed max-w-3xl mx-auto">
            Once order confirmation and supplier assignment are completed,
            OBAOL executes procurement as a third-party on-ground
            representative.
            <br className="hidden sm:block" />
            <span className="text-foreground font-medium mt-4 block">
              This is a structured, sequential process — not ad-hoc
              coordination.
            </span>
          </p>
        </motion.div>

        {/* Flow */}
        <div className="relative max-w-5xl mx-auto">
          {/* Glowing Vertical Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/0 via-orange-500/30 to-orange-500/0 md:-translate-x-1/2" />

          <div className="space-y-20">
            {[
              {
                step: "01",
                title: "Procurement Specialist Assigned",
                desc: "A nearby OBAOL procurement specialist is assigned based on supplier location, reducing travel time and delays.",
              },
              {
                step: "02",
                title: "On-Site Visit & Presence",
                desc: "Our representative visits the supplier location and acts on your behalf throughout the procurement process.",
              },
              {
                step: "03",
                title: "Stock Quantity Verification",
                desc: "Before transportation arrives, we verify that the promised quantity is physically available to prevent short loading.",
              },
              {
                step: "04",
                title: "Quality Inspection",
                desc: "Product quality is checked against agreed specifications to ensure readiness for dispatch.",
              },
              {
                step: "05",
                title: "Photo & Video Confirmation",
                desc: "Photos and videos of stock, packaging, and readiness are shared to provide real-time visibility.",
              },
              {
                step: "06",
                title: "Packaging Validation",
                desc: "Packaging is confirmed to meet requirements before goods are prepared for transportation.",
              },
              {
                step: "07",
                title: "Transport Readiness Check",
                desc: "We confirm that the transport vehicle has arrived, is suitable, and ready for loading.",
              },
              {
                step: "08",
                title: "Loading Supervision",
                desc: "Goods are supervised during loading to ensure correct handling and dispatch.",
              },
              {
                step: "09",
                title: "Payment Checkpoint",
                desc: "If payment is linked to dispatch, we ensure required payments are received before release.",
              },
              {
                step: "10",
                title: "Handover to Logistics",
                desc: "Once loading is complete, the shipment is handed over to the designated logistics partner.",
                highlight: true,
              },
            ].map((item, index) => (
              <FlowStep key={item.step} index={index} {...item} />
            ))}
          </div>

        </div>

        {/* Supplier Context */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-32 max-w-5xl mx-auto grid md:grid-cols-2 gap-8"
        >
          <ContextCard
            title="First-Time Suppliers"
            text="All steps are executed end-to-end to establish trust, validate stock, and ensure flawless execution."
          />

          <ContextCard
            title="Recurring Suppliers"
            text="Several steps are streamlined via automation while maintaining strict verification and execution control."
          />
        </motion.div>
      </div>
    </motion.section>
  );
}


function FlowStep({
  step,
  title,
  desc,
  highlight,
  index,
}: {
  step: string;
  title: string;
  desc: string;
  highlight?: boolean;
  index: number;
}) {
  const fromLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative flex flex-col md:flex-row w-full mb-12 last:mb-0
        ${fromLeft ? "md:justify-start" : "md:justify-end"}
      `}
    >
      {/* Desktop Connection Dot (Hidden on Mobile, acts as center anchor) */}
      <div className="hidden md:flex absolute top-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-orange-500/50 z-10 shadow-[0_0_15px_rgba(251,146,60,0.5)]" />

      {/* Card */}
      <div className={`relative w-full pl-20 md:pl-0 md:w-[45%] ${fromLeft ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"}`}>

        {/* Step Indicator (Mobile: Absolute Left, Desktop: Integrated into layout) */}
        <div
          className={`absolute left-0 top-2 md:top-auto md:relative md:inline-flex items-center justify-center
          w-12 h-12 rounded-full text-base font-black tracking-widest backdrop-blur-md border border-white/10
          ${fromLeft ? "md:ml-auto md:mb-4 md:float-right" : "md:mr-auto md:mb-4"}
          ${highlight
              ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-[0_0_30px_rgba(251,146,60,0.6)] border-orange-400/50"
              : "bg-white/[0.03] text-default-400 shadow-xl"
            }`}
        >
          {step}
        </div>

        {/* Content Container */}
        <div className={`md:clear-both p-6 rounded-2xl backdrop-blur-xl border transition-all duration-500
          ${highlight
            ? "bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30 shadow-[0_0_40px_rgba(251,146,60,0.1)]"
            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
          }`}
        >
          <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
            {title}
          </h3>

          <p className="mt-3 text-base text-default-500 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ContextCard({ title, text }: { title: string; text: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="p-8 md:p-10 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 group relative overflow-hidden"
    >
      {/* Hover ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <h4 className="font-bold text-xl md:text-2xl text-foreground tracking-tight">{title}</h4>
      <p className="mt-4 text-base text-default-500 leading-relaxed">{text}</p>
    </motion.div>
  );
}



