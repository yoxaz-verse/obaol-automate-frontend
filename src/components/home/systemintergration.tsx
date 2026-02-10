"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";




export default function SystemIntergrationSection() {
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
      }} className="relative py-28 px-6 border-t border-default-200 bg-content1 overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-96 bg-gradient-to-r from-orange-400/20 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-16 items-center"
        >
          {/* Left: Narrative */}
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-sm uppercase tracking-wider text-default-500 font-medium"
            >
              System Ready
            </motion.span>

            <h2 className="mt-4 text-3xl md:text-4xl font-semibold leading-snug">
              Built as Trading Infrastructure,
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Not Just a Platform
              </span>
            </h2>

            <p className="mt-6 text-default-600 leading-relaxed">
              OBAOL is designed to operate at the system level. Beyond the
              interface, we provide structured mechanisms that allow
              businesses to integrate trading workflows directly into their
              existing operations.
            </p>

            <p className="mt-4 text-default-500 leading-relaxed">
              Advanced capabilities such as MCP and API-based automation are
              available for organizations that require deeper integration and
              programmable trade execution.
            </p>

            <p className="mt-6 text-sm text-default-400">
              Detailed documentation and automation workflows are available
              separately.
            </p>
          </div>

          {/* Right: Futuristic Visual Cue */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-8 rounded-xl border border-default-200 bg-background relative overflow-hidden"
            >
              <div className="space-y-3 text-sm text-default-600 relative z-10">
                <SystemLine label="Live Rates" highlight />
                <SystemLine label="MCP" />
                <SystemLine label="Automation Layer" />
                <SystemLine label="Secure APIs" />
                <SystemLine label="Enterprise Systems" />
              </div>

              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Subtle Glow */}
            <motion.div
              className="absolute inset-0 rounded-xl border border-orange-400/20 shadow-[0_0_60px_rgba(255,165,0,0.15)] pointer-events-none"
              animate={{
                boxShadow: [
                  "0_0_60px_rgba(255,165,0,0.15)",
                  "0_0_80px_rgba(255,165,0,0.25)",
                  "0_0_60px_rgba(255,165,0,0.15)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}




function SystemLine({
  label,
  highlight,
}: {
  label: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ x: 5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400 }}
      className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-300 cursor-default
        ${highlight
          ? "border-orange-400/50 text-orange-300 bg-orange-400/5"
          : "border-default-200 text-default-500 hover:border-default-300 hover:text-default-600"
        }`}
    >
      <span className="font-medium">{label}</span>
      <motion.span
        className={`text-xs px-2 py-1 rounded-full ${highlight
          ? "bg-orange-400/20 text-orange-300"
          : "bg-default-100 text-default-400"
          }`}
        animate={highlight ? { opacity: [1, 0.7, 1] } : {}}
        transition={
          highlight
            ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }
            : {}
        }
      >
        {highlight ? "Active" : "Available"}
      </motion.span>
    </motion.div>
  );
}