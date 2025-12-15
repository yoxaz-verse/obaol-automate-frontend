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
     className="relative py-32 px-6 border-t border-gray-800 bg-black overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 2px 2px, white 1px, transparent 0)
              `,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-semibold">
              Procurement Execution — Step by Step
            </h2>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              Once order confirmation and supplier assignment are completed,
              OBAOL executes procurement as a third-party on-ground
              representative.
              <br />
              <span className="text-white font-medium">
                This is a structured, sequential process — not ad-hoc
                coordination.
              </span>
            </p>
          </motion.div>

          {/* Flow */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-orange-400/40 via-gray-700 to-transparent" />

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
            transition={{ duration: 0.6 }}
            className="mt-20 grid md:grid-cols-2 gap-6"
          >
            <ContextCard
              title="First-Time Suppliers"
              text="All steps are executed end-to-end to establish trust,
        validate stock, and ensure smooth execution."
            />

            <ContextCard
              title="Recurring Suppliers"
              text="Several steps are streamlined while maintaining
        verification and execution control."
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
      initial={{
        opacity: 0,
        x: fromLeft ? -80 : 80,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
        margin: "-120px",
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`
        relative
        flex
        ${fromLeft ? "justify-start" : "justify-end"}
      `}
    >
      {/* Card */}
      <div className="relative w-full md:w-[520px] pl-16">
        {/* Step Indicator */}
        <div
          className={`absolute left-0 top-1 flex items-center justify-center
          w-10 h-10 rounded-full text-sm font-bold
          ${
            highlight
              ? "bg-orange-400 text-black shadow-[0_0_20px_rgba(255,165,0,0.6)]"
              : "bg-neutral-800 text-gray-300"
          }`}
        >
          {step}
        </div>

        <h3 className="text-lg md:text-xl font-semibold text-white">
          {title}
        </h3>

        <p className="mt-3 text-sm md:text-base text-gray-300 leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

  function ContextCard({ title, text }: { title: string; text: string }) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="p-6 rounded-xl border border-gray-800 bg-neutral-950 hover:border-gray-700 transition-all duration-300"
      >
        <h4 className="font-semibold text-lg text-white">{title}</h4>
        <p className="mt-3 text-sm text-gray-300 leading-relaxed">{text}</p>
      </motion.div>
    );
  }
  

 
  