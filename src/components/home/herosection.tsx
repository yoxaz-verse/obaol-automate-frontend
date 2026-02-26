"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import ParticleNetwork from "@/components/ui/particle-network";

/* ================= CONTAINER REVEAL ================= */

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  /* ===== Parallax Scroll ===== */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const upperLineY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -36]), {
    stiffness: 70,
    damping: 18,
    mass: 0.5,
  });
  const lowerLineY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 36]), {
    stiffness: 70,
    damping: 18,
    mass: 0.5,
  });
  const bgLayerY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 28]), {
    stiffness: 70,
    damping: 24,
    mass: 0.6,
  });
  const gridLayerY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 14]), {
    stiffness: 75,
    damping: 24,
    mass: 0.6,
  });
  const dockLayerY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 40]), {
    stiffness: 70,
    damping: 24,
    mass: 0.6,
  });
  const particleOpacity = useTransform(scrollYProgress, [0, 1], [0.9, 0.72]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100vh] md:min-h-[110vh] bg-background flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ================= AMBIENT BACKGROUNDS ================= */}

      {/* Ambient blobs — softer in light mode via lower opacity */}
      <motion.div style={{ y: bgLayerY }} className="absolute inset-0 pointer-events-none z-0">
        {/* Top-left: primary hue */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-300/16 dark:bg-primary-500/10 blur-[120px] rounded-full" />
        {/* Bottom-right: warm orange */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-300/14 dark:bg-orange-500/10 blur-[150px] rounded-full" />
        {/* Center subtle accent — barely visible in light */}
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[80%] h-[80%] bg-emerald-500/5 dark:bg-emerald-500/5 blur-[150px] rounded-full" />
        {/* Light mode: clean top gradient wash */}
        <div className="absolute inset-0 dark:hidden bg-gradient-to-b from-orange-50/80 via-amber-50/35 to-transparent" />
        <div className="absolute inset-0 dark:hidden bg-[radial-gradient(circle_at_50%_22%,rgba(251,146,60,0.13),transparent_52%)]" />
      </motion.div>

      {/* Particle Network */}
      <motion.div style={{ opacity: particleOpacity }} className="absolute inset-0 z-0 opacity-15 dark:opacity-35">
        <ParticleNetwork />
      </motion.div>

      {/* High-Tech Geometric Grid — theme-aware color */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.045] dark:opacity-[0.07] [mask-image:linear-gradient(to_bottom,black_20%,transparent_80%)]"
        style={{
          y: gridLayerY,
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "3rem 3rem",
        }}
      />

      {/* Subtle Dock Image overlay at the bottom */}
      <motion.div style={{ y: dockLayerY }} className="absolute bottom-0 w-full h-[60vh] pointer-events-none z-0">
        <Image
          src="/images/hero_dock.png"
          alt="Global commodity trading infrastructure"
          fill
          priority
          className="object-cover object-bottom opacity-10 dark:opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black_70%)]"
        />
      </motion.div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      {/* ================= CONTENT CONTAINER ================= */}
      <motion.div
        className="relative z-20 w-full max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center"
      >

        {/* Floating System Status Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 inline-flex items-center gap-3 px-5 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,165,0,0.12)]"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 shadow-[0_0_8px_rgba(255,165,0,0.7)]" />
          </span>
          <span className="text-xs font-bold text-orange-500 dark:text-orange-400 tracking-widest uppercase">System Protocol Active</span>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative max-w-5xl"
        >
          {/* 1️⃣ HEADLINE */}
          <motion.h1
            variants={itemVariants}
            className="relative text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[0.98] md:leading-[0.82] tracking-tight"
          >
            <motion.span style={{ y: upperLineY }} className="relative z-10 block text-foreground">
              The Operating System
            </motion.span>
            <span className="relative z-30 block text-foreground/55 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-normal leading-none mt-0 sm:mt-1 md:-mt-6 mb-0 sm:mb-1 md:-mb-6">
              for
            </span>
            <motion.span
              style={{ y: lowerLineY }}
              className="relative z-20 block mt-0 sm:mt-1 md:-mt-10"
            >
              {/* Orange gradient text — looks great in both modes */}
              <span className="relative inline-block bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-500 dark:from-orange-200 dark:via-orange-400 dark:to-yellow-500 bg-clip-text text-transparent [filter:drop-shadow(0_0_14px_rgba(251,146,60,0.4))]">
                Agro Commodity Trade.
              </span>
            </motion.span>
          </motion.h1>

          {/* 2️⃣ SUBTITLE */}
          <motion.p
            variants={itemVariants}
            className="mt-8 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-foreground/60 font-medium leading-relaxed"
          >
            <span className="text-foreground font-semibold">OBAOL Supreme</span>{" "}
            is an end-to-end trade execution environment. Discover verified partners, engage securely, and execute with absolute certainty.
          </motion.p>

          {/* 3️⃣ CLARIFICATION */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-sm md:text-base text-foreground/40 font-semibold tracking-widest uppercase"
          >
            Designed for Domestic &amp; Global Supply Chains
          </motion.p>

          {/* 4️⃣ CTA — Premium Glassmorphic Button */}
          <motion.div variants={itemVariants} className="mt-14 relative group inline-flex justify-center">
            {/* Soft bloom underneath — light + dark */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-5 bg-orange-500/30 blur-2xl rounded-full opacity-70 group-hover:opacity-100 group-hover:w-full transition-all duration-500" />

            <Link
              href="https://typebot.co/obaol-early-access"
              target="_blank"
              className={[
                "relative flex items-center justify-center gap-3 px-10 py-5 rounded-2xl overflow-hidden",
                "transition-all duration-300 group-hover:scale-[1.03]",
                /* Light mode: solid warm border, lighter glass bg */
                "bg-white/70 dark:bg-white/5",
                "border border-orange-400/40 dark:border-orange-500/20",
                "backdrop-blur-xl",
                "shadow-[0_2px_20px_-4px_rgba(251,146,60,0.25)] dark:shadow-[0_8px_32px_-8px_rgba(251,146,60,0.3)]",
                "group-hover:border-orange-500/60 dark:group-hover:border-orange-500/50",
                "group-hover:bg-white/90 dark:group-hover:bg-white/10",
                "group-hover:shadow-[0_4px_32px_-4px_rgba(251,146,60,0.5)] dark:group-hover:shadow-[0_12px_40px_-8px_rgba(251,146,60,0.6)]",
              ].join(" ")}
            >
              {/* Radial inner glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 [background:radial-gradient(ellipse_at_center,rgba(251,146,60,0.12)_0%,transparent_70%)]" />

              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-orange-100/30 dark:via-white/10 to-transparent transition-transform duration-700 ease-in-out skew-x-12" />

              <span className="relative z-10 text-foreground font-bold tracking-wide text-lg">
                Enter The Network
              </span>

              {/* Arrow */}
              <svg
                className="relative z-10 w-5 h-5 text-orange-500 transform group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
