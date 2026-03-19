"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ParticleNetwork from "@/components/ui/particle-network";
import { useContext } from "react";
import AuthContext from "@/context/AuthContext";

/* ================= CONTAINER REVEAL ================= */

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { isAuthenticated, loading } = useContext(AuthContext);
  const [showDesktopVisuals, setShowDesktopVisuals] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setShowDesktopVisuals(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  /* ===== Parallax Scroll ===== */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
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
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-300/14 dark:bg-orange-500/10 blur-[150px] rounded-full" />
        {/* Center subtle accent — barely visible in light */}
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[80%] h-[80%] bg-emerald-500/5 dark:bg-emerald-500/5 blur-[150px] rounded-full" />
        {/* Light mode: clean top gradient wash */}
        <div className="absolute inset-0 dark:hidden bg-gradient-to-b from-orange-50/80 via-orange-50/35 to-transparent" />
        <div className="absolute inset-0 dark:hidden bg-[radial-gradient(circle_at_50%_22%,rgba(251,146,60,0.13),transparent_52%)]" />
      </motion.div>

      {/* Particle Network */}
      {showDesktopVisuals ? (
        <motion.div style={{ opacity: particleOpacity }} className="absolute inset-0 z-0 opacity-15 dark:opacity-35">
          <ParticleNetwork />
        </motion.div>
      ) : null}

      {/* Subtle Realistic Glint Animation Styles */}
      <style jsx global>{`
        @keyframes subtle-glint {
          0% { background-position: -200% center; }
          45%, 100% { background-position: 200% center; }
        }
        .animate-subtle-glint {
          background-size: 200% auto;
          animation: subtle-glint 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

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
      {showDesktopVisuals ? (
        <motion.div style={{ y: dockLayerY }} className="absolute bottom-0 w-full h-[60vh] pointer-events-none z-0">
          <Image
            src="/images/hero_dock.png"
            alt="Global commodity trading infrastructure"
            fill
            priority
            className="object-cover object-bottom opacity-10 dark:opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black_70%)]"
          />
        </motion.div>
      ) : null}

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
          className="mb-8 inline-flex items-center gap-3 px-5 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-md shadow-none"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500/80" />
          </span>
          <span className="text-xs font-bold text-orange-500 dark:text-orange-400 tracking-tight uppercase">System Protocol Active</span>
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
            className="relative text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] md:leading-[1.05] tracking-tight"
          >
            <motion.span className="relative z-10 block text-foreground">
              The Operating System
            </motion.span>
            <span className="relative z-30 block text-foreground/55 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-normal leading-none mt-2 mb-2">
              for
            </span>
            <motion.span
              className="relative z-20 block"
            >
              {/* Ultra-Narrow Subtle Shine Headline */}
              <span className="relative inline-block pb-5 bg-[linear-gradient(110deg,#f97316_49%,#fed7aa_50%,#f97316_51%)] dark:bg-[linear-gradient(110deg,#f97316_49%,#ffedd5_50%,#f97316_51%)] bg-clip-text text-transparent animate-subtle-glint">
                Agro Commodity Trade.
              </span>
            </motion.span>
          </motion.h1>

          {/* 2️⃣ SUBTITLE */}
          <motion.p
            variants={itemVariants}
            className="mt-12 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-foreground/60 font-medium leading-relaxed"
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
          <motion.div variants={itemVariants} className="mt-14 flex flex-col items-center gap-6 relative group">
            <button
              onClick={() => {
                if (loading) return;
                setIsNavigating(true);
                router.push(isAuthenticated ? "/dashboard" : "/auth");
              }}
              disabled={isNavigating || loading}
              className={[
                "relative flex items-center justify-center gap-3 px-10 py-4 rounded-2xl overflow-hidden",
                "transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]",
                "bg-orange-500 hover:bg-orange-600 text-white",
                "shadow-none hover:shadow-[0_0_28px_-4px_rgba(249,115,22,0.5)]",
                "disabled:opacity-80 disabled:scale-100"
              ].join(" ")}
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out skew-x-12" />

              <span className="relative z-10 font-bold tracking-wide text-lg">
                {isNavigating ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Opening Experience...
                  </span>
                ) : (
                  !loading && isAuthenticated ? "Go to Dashboard" : "Sign In to Access"
                )}
              </span>

              {/* Arrow */}
              {!isNavigating && (
                <svg
                  className="relative z-10 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>

            {/* Premium Create Account Prompt */}
            {!loading && !isAuthenticated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-2 text-sm"
              >
                <span className="text-foreground/40 font-medium">New to OBAOL?</span>
                <div className="flex items-center flex-wrap justify-center gap-2">
                  <Link
                    href="/auth/register"
                    className="group/link relative py-1 px-2 text-orange-500 font-bold tracking-tight uppercase overflow-hidden"
                  >
                    <span className="relative z-10">Join as Associate</span>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500/20 group-hover/link:h-full transition-all duration-300 rounded-sm" />
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover/link:w-full transition-all duration-300" />
                  </Link>
                  <span className="text-foreground/30 font-medium text-xs">OR</span>
                  <Link
                    href="/auth/operator/register"
                    className="group/link relative py-1 px-2 text-orange-500 font-bold tracking-tight uppercase overflow-hidden"
                  >
                    <span className="relative z-10">Join as Operator</span>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500/20 group-hover/link:h-full transition-all duration-300 rounded-sm" />
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover/link:w-full transition-all duration-300" />
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
