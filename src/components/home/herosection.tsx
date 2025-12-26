"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

/* ================= CONTAINER REVEAL (UNCHANGED) ================= */

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
        duration: 1.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
};

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  /* ===== Lag-safe scroll fade ===== */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "start+=200 start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen bg-black overflow-hidden"
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
      </div>

      {/* ================= SCROLL OPACITY ================= */}
      <motion.div
        style={{ opacity }}
        className="relative min-h-screen flex items-center justify-center pt-24 md:pt-32 pb-16 px-6 md:px-12"
      >
        {/* ================= CINEMATIC CONTAINER ================= */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 max-w-6xl text-center"
        >
          {/* 1️⃣ HEADLINE — slow, authoritative */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.4,
              delay: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight text-white"
          >
            Agro Trade{" "}
            <span
              className="inline-block"
              style={{
                WebkitTextStroke: "2px rgba(255,255,255,0.95)",
                WebkitTextFillColor: "transparent",
              }}
            >
               Execution
            </span>{" "}
             Platform
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              <span className="text-gray-400 text-[0.65em] mr-2">for</span>
              Commodity Trading            </span>
          </motion.h1>

          {/* 2️⃣ BRAND / MQ — measured pause */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.2,
              delay: 1.8,
              ease: "easeOut",
            }}
            className="mt-14 max-w-4xl mx-auto text-xl md:text-2xl text-gray-300"
          >
            <span className="text-orange-400 font-semibold">
              OBAOL Supreme
            </span>{" "}
            is an agro trade execution platform that combines technology with on-ground services to complete{" "}
            <span className="text-white">real agricultural commodity trades.</span>.
          </motion.p>

          {/* 3️⃣ CLARIFICATION — calm assurance */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.1,
              delay: 2.9,
              ease: "easeOut",
            }}
            className="mt-8 text-base md:text-lg text-white"
          >
            <span className="text-orange-400">
              This is not financial trading.
            </span>{" "}
            This is real-world trade execution.
          </motion.p>

          {/* 4️⃣ CTA — arrives last, no rush */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.2,
              delay: 4.1,
              ease: "easeOut",
            }}
            className="mt-16"
          >
            <Link
              href="https://typebot.co/obaol-early-access"
              target="_blank"
              className="inline-block px-10 py-5 rounded-xl bg-white text-black font-semibold text-lg shadow-lg shadow-orange-400/20 hover:shadow-xl hover:shadow-orange-400/30 transition-all"
            >
              Apply for Early Access
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
