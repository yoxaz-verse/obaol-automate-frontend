"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
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
      staggerChildren: 0.2, // Stagger the text reveals
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" }
  }
};

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  /* ===== Parallax Scroll ===== */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const yOffset = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100vh] md:min-h-[110vh] bg-background flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ================= AMBIENT BACKGROUNDS ================= */}

      {/* Deep Space Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-500/10 blur-[150px] rounded-full" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[80%] h-[80%] bg-emerald-500/5 blur-[150px] rounded-full" />
      </div>

      {/* Particle Network (The Magic Layer) */}
      <div className="absolute inset-0 z-0 opacity-40">
        <ParticleNetwork />
      </div>

      {/* High-Tech Geometric Grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none [mask-image:linear-gradient(to_bottom,black_20%,transparent_80%)]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px),
                              linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '3rem 3rem'
        }}
      />

      {/* Subtle Dock Image overlay at the bottom */}
      <div className="absolute bottom-0 w-full h-[60vh] pointer-events-none z-0">
        <Image
          src="/images/hero_dock.png"
          alt="Global commodity trading infrastructure"
          fill
          priority
          className="object-cover object-bottom opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black_70%)]"
        />
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      {/* ================= CONTENT CONTAINER ================= */}
      <motion.div
        style={{ y: yOffset }}
        className="relative z-20 w-full max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center"
      >

        {/* Floating System Status Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 inline-flex items-center gap-3 px-5 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-md shadow-[0_0_30px_rgba(255,165,0,0.15)]"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 shadow-[0_0_10px_rgba(255,165,0,0.8)]"></span>
          </span>
          <span className="text-xs font-bold text-orange-400 tracking-widest uppercase">System Protocol Active</span>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative max-w-5xl"
        >
          {/* 1️⃣ HEADLINE — Luminous and sharp */}
          <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight">
            <span className="text-foreground">The Operating System for</span>
            <br />
            <span className="relative inline-block mt-2">
              {/* Sharper, tighter backlight glow */}
              <span className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-yellow-500 blur-md opacity-40 animate-pulse mix-blend-screen"></span>
              {/* Foreground Gradient with tight, intense drop shadow */}
              <span className="relative inline-block bg-gradient-to-br from-white via-orange-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,165,0,0.8)]">
                Agro Commodity Trade.
              </span>
            </span>
          </motion.h1>

          {/* 2️⃣ BRAND / MQ — Refined explanation */}
          <motion.p variants={itemVariants} className="mt-8 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-default-400 font-medium leading-relaxed">
            <span className="text-foreground">OBAOL Supreme</span> is an end-to-end trade execution environment. Discover verified partners, engage securely, and execute with absolute certainty.
          </motion.p>

          {/* 3️⃣ CLARIFICATION — Calm assurance */}
          <motion.p variants={itemVariants} className="mt-6 text-sm md:text-base text-default-500 font-medium tracking-wide">
            DESIGNED FOR DOMESTIC & GLOBAL SUPPLY CHAINS
          </motion.p>

          {/* 4️⃣ CTA — Premium Glassmorphic Button */}
          <motion.div variants={itemVariants} className="mt-14 relative group inline-block">
            {/* Tighter, more intense background glow for the button */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-[2rem] blur-md opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>

            {/* Outer soft ambient flare on hover */}
            <div className="absolute -inset-2 bg-orange-500/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-500"></div>

            <Link
              href="https://typebot.co/obaol-early-access"
              target="_blank"
              className="relative flex items-center justify-center px-10 py-5 rounded-[2rem] bg-black/60 backdrop-blur-2xl border border-white/10 overflow-hidden transition-all duration-300 group-hover:scale-[1.02] group-hover:border-orange-500/50 group-hover:bg-black/80 shadow-[0_4px_24px_-8px_rgba(255,165,0,0.5)] group-hover:shadow-[0_8px_32px_-8px_rgba(255,165,0,0.8)]"
            >
              {/* Internal Sheen animation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Shimmer sweep effect */}
              <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent -rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

              <span className="relative z-10 text-foreground font-bold tracking-wide text-lg">
                Enter The Network
              </span>

              {/* Arrow Icon */}
              <svg className="relative z-10 ml-3 w-5 h-5 text-orange-400 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
