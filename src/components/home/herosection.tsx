"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

/* ================= CONTAINER (UNCHANGED) ================= */

const containerVariants = {
  hidden: {
    opacity: 0,
    clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
  },
  visible: {
    opacity: 1,
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
    transition: {
      clipPath: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      },
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

/* ================= ITEM (LAYOUT RHYTHM) ================= */

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* ================= TEXT (SIMPLE FADE ONLY) ================= */

const textReveal = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

/* ================= GLITCH (UNCHANGED) ================= */

const glitchVariants = {
  glitch: {
    opacity: [1, 0.85, 1],
    x: [0, -2, 2, 0],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      repeatDelay: 4,
      ease: "easeInOut",
    },
  },
};

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <motion.section
      ref={heroRef}
      style={{ opacity, scale, y }}
      className="relative min-h-screen flex items-center justify-center pt-24 md:pt-32 pb-16 px-6 md:px-12 overflow-hidden bg-black"
    >
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/images/hero_dock.png"
          alt="Global commodity trading infrastructure"
          fill
          priority
          className="object-cover object-center opacity-25"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-[0.02]"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, rgba(255,165,0,0.1), transparent)",
            }}
          />
        </motion.div>
      </div>

      {/* ================= GRID ================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>

      {/* ================= CONTENT ================= */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 max-w-6xl text-center"
      >
        {/* Headline */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight text-white">
            <motion.span variants={textReveal} className="block">
              A{" "}
              <span
                className="inline-block"
                style={{
                  WebkitTextStroke: "2px rgba(255,255,255,0.95)",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Digital
              </span>{" "}
              Infrastructure
            </motion.span>

            <motion.span
              variants={textReveal}
              className="block mt-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
            >
              <span className="text-gray-400 text-[0.65em] mr-2">for</span>
              Global Commodity Trading
            </motion.span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mt-12 max-w-4xl mx-auto text-xl md:text-2xl text-gray-300"
        >
          <motion.span
            variants={glitchVariants}
            animate="glitch"
            className="text-orange-400 font-semibold mr-2"
          >
            OBAOL
          </motion.span>
          Supreme is an end-to-end trading system built for{" "}
          <span className="text-white">physical commodity trade</span>.
        </motion.p>

        {/* Emphasis */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-base md:text-lg text-white"
        >
          <span className="text-orange-400">
            This is not financial trading.
          </span>{" "}
          This is real-world trade execution.
        </motion.p>

        {/* CTA */}
        <motion.div variants={itemVariants} className="mt-14">
          <Link
            href="https://typebot.co/obaol-early-access"
            target="_blank"
            className="inline-block px-10 py-5 rounded-xl bg-white text-black font-semibold text-lg shadow-lg shadow-orange-400/20 hover:shadow-xl hover:shadow-orange-400/30 transition-all"
          >
            Apply for Early Access
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
