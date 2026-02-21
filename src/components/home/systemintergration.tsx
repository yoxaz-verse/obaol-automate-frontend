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
      }}
      className="relative py-32 md:py-48 px-6 border-t border-white/5 bg-background overflow-hidden"
    >
      {/* Deep Space Grid & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none" >
        <div className="absolute top-1/2 left-0 w-full h-[500px] bg-gradient-to-r from-orange-400/10 via-orange-400/5 to-transparent blur-[120px] -translate-y-1/2" />
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-screen"
          style={{
            backgroundImage: `
                linear-gradient(to right, #ffffff 1px, transparent 1px),
                linear-gradient(to bottom, #ffffff 1px, transparent 1px)
              `,
            backgroundSize: "40px 40px",
            maskImage: "linear-gradient(to right, black 20%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to right, black 20%, transparent 80%)"
          }}
        />
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

            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground">
              Built as Trading Infrastructure,<br />
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm">
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
              className="p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl relative overflow-hidden shadow-2xl"
            >
              {/* Internal grid glow */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/30 blur-[60px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 blur-[60px]" />
              </div>

              <div className="space-y-4 text-sm text-default-600 relative z-10">
                <SystemLine label="Live Rates API" highlight />
                <SystemLine label="MCP Integration" />
                <SystemLine label="Automation Layer / Workflows" />
                <SystemLine label="Secure Connectivity" />
                <SystemLine label="Enterprise Webhooks" />
              </div>

              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none"
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Subtle Glow */}
            <motion.div
              className="absolute inset-0 rounded-3xl border border-orange-500/30 shadow-[0_0_80px_rgba(251,146,60,0.1)] pointer-events-none"
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
      className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-300 backdrop-blur-sm cursor-default
        ${highlight
          ? "border-orange-500/40 text-orange-400 bg-orange-500/10 shadow-[0_0_20px_rgba(251,146,60,0.1)]"
          : "border-white/5 text-default-400 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 hover:text-default-300"
        }`}
    >
      <span className="font-medium">{label}</span>
      <motion.span
        className={`text-xs px-3 py-1.5 font-bold tracking-widest uppercase rounded-lg ${highlight
          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
          : "bg-white/5 text-default-500 border border-transparent"
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