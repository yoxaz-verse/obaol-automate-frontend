"use client";

import Link from "next/link";
import RevealImage from "@/components/ui/RevealImage";
import { motion, useTransform, useMotionValue, useSpring, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";
import { FiArrowRight } from "react-icons/fi";
import { useAdaptiveMotion } from "@/hooks/useAdaptiveMotion";

/* ================= ANIMATION VARIANTS ================= */
/* The execution story shares one active stage across copy, image, and controls. */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};


const OBAOL_GOLD = "#CF983C";

type HeroStage = {
  id: string;
  sequence: number;
  label: string;
  message: string;
  src: string;
  objectPosition: string;
};

const HERO_STAGES = [
  {
    id: "discovery",
    sequence: 1,
    label: "Discovery",
    message: "Discover the right product and origin.",
    src: "/images/execution-flow/01-discovery.webp",
    objectPosition: "center 46%",
  },
  {
    id: "sampling",
    sequence: 2,
    label: "Sampling",
    message: "Review samples before committing to a trade.",
    src: "/images/execution-flow/02-sampling.webp",
    objectPosition: "center 48%",
  },
  {
    id: "coordination",
    sequence: 3,
    label: "Coordination",
    message: "Keep every trade partner aligned.",
    src: "/images/execution-flow/03-coordination.webp",
    objectPosition: "center 46%",
  },
  {
    id: "documentation",
    sequence: 4,
    label: "Documentation",
    message: "Prepare the documents that move trade forward.",
    src: "/images/execution-flow/04-documentation.webp",
    objectPosition: "center 48%",
  },
  {
    id: "inspection-visit",
    sequence: 5,
    label: "Inspection Visit",
    message: "Verify goods and operations on the ground.",
    src: "/images/execution-flow/05-inspection-visit.webp",
    objectPosition: "center 48%",
  },
  {
    id: "quality-testing",
    sequence: 6,
    label: "Quality Testing",
    message: "Test quality against your requirements.",
    src: "/images/execution-flow/06-quality-testing.webp",
    objectPosition: "center 44%",
  },
  {
    id: "packaging",
    sequence: 7,
    label: "Packaging",
    message: "Prepare goods for safe, compliant shipment.",
    src: "/images/execution-flow/07-packaging.webp",
    objectPosition: "center 48%",
  },
  {
    id: "procurement",
    sequence: 8,
    label: "Procurement",
    message: "Get on-ground procurement assistance.",
    src: "/images/execution-flow/08-procurement.webp",
    objectPosition: "center 48%",
  },
  {
    id: "inland-transportation",
    sequence: 9,
    label: "Inland Transportation",
    message: "Coordinate the journey from source to port.",
    src: "/images/execution-flow/09-inland-transportation.webp",
    objectPosition: "center 48%",
  },
  {
    id: "freight-forwarding",
    sequence: 10,
    label: "Freight Forwarding",
    message: "Move shipments with freight partners.",
    src: "/images/hero-operations/freight.webp",
    objectPosition: "center 46%",
  },
] as const satisfies readonly HeroStage[];


const HOVER_TIMING = {
  textSwap: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

const HERO_ROTATION_INTERVAL = 3500;

export default function HeroSection() {
  const router = useRouter();
  const { isAuthenticated, loading } = usePublicAuthStatus();
  const adaptiveMotion = useAdaptiveMotion();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const shouldReduceMotion = prefersReducedMotion || adaptiveMotion.shouldReduceMotion;
  const allowDecorativeMotion = adaptiveMotion.allowDecorativeMotion;
  const allowPointerEffects = adaptiveMotion.allowPointerEffects;
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [isAgroActive, setIsAgroActive] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isStageControlActive, setIsStageControlActive] = useState(false);
  const activeStage = HERO_STAGES[activeStageIndex];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const cursorGlow = useTransform(
    [smoothMouseX, smoothMouseY],
    ([x, y]) => `radial-gradient(600px circle at calc(50% + ${x}px) calc(50% + ${y}px), rgba(207,152,60,0.07), transparent 45%)`
  );

  useEffect(() => {
    if (!allowPointerEffects) {
      mouseX.set(0);
      mouseY.set(0);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 30;
      const moveY = (clientY - window.innerHeight / 2) / 30;
      mouseX.set(moveX);
      mouseY.set(moveY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [allowPointerEffects, mouseX, mouseY]);

  useEffect(() => {
    if (shouldReduceMotion || isStageControlActive) return;

    const timeoutId = window.setTimeout(() => {
      setActiveStageIndex((current) => (current + 1) % HERO_STAGES.length);
    }, HERO_ROTATION_INTERVAL);

    return () => window.clearTimeout(timeoutId);
  }, [activeStageIndex, isStageControlActive, shouldReduceMotion]);

  const activateSystem = () => {
    if (allowDecorativeMotion) setIsSystemActive(true);
  };
  const deactivateSystem = () => setIsSystemActive(false);
  const activateAgro = () => {
    if (allowDecorativeMotion) setIsAgroActive(true);
  };
  const deactivateAgro = () => setIsAgroActive(false);

  return (
    <section
      data-natural-scroll-hero="true"
      className="relative min-h-[85vh] bg-background pt-20"
    >
      {/* ================= BACKGROUND ================= */}
      <motion.div
        className="absolute inset-0 z-0 select-none pointer-events-none"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.2, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80 z-10" />
        <div className="obaol-hero-ambient absolute inset-0 public-decoration" />
      </motion.div>

      {/* Grid Overlay */}
      <motion.div
        initial={{ opacity: 0.08 }}
        animate={{
          opacity: allowDecorativeMotion && (isSystemActive || isAgroActive) ? 0.2 : 0.08,
        }}
        className="public-decoration absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"
        style={{
          backgroundImage: `linear-gradient(to right, ${OBAOL_GOLD} 1px, transparent 1px), linear-gradient(to bottom, ${OBAOL_GOLD} 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem"
        }}
      />

      {/* ================= SYSTEM / AGRO HUD OVERLAY ================= */}
      <AnimatePresence>
        {allowDecorativeMotion && isSystemActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-12 pointer-events-none overflow-hidden"
          >
            <div className="absolute inset-0 flex justify-around opacity-10">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: "-100%" }}
                  animate={{ y: "100%" }}
                  transition={{ duration: 15 + i * 2, repeat: Infinity, ease: "linear" }}
                  className="text-[10px] font-mono leading-none break-all w-2"
                >
                  {Array(100).fill(0).map(() => Math.round(Math.random())).join("")}
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ top: "-10%" }}
              animate={{ top: "110%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[1px] bg-obaol-500/50 shadow-[0_0_15px_rgba(207,152,60,0.7)] z-20"
            />
            <div className="absolute top-10 right-10 flex flex-col items-end gap-1 font-mono text-[9px] text-obaol-500/45 uppercase tracking-tighter">
              <span>Plan the requirement</span>
              <span>Verify each milestone</span>
              <span>Coordinate execution</span>
            </div>
          </motion.div>
        )}

        {allowDecorativeMotion && isAgroActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-12 pointer-events-none overflow-hidden"
          >
            <div className="absolute top-10 left-10 flex flex-col items-start gap-1 font-mono text-[9px] text-obaol-500/45 uppercase tracking-tighter">
              <span className="text-obaol-400/70 font-bold">Trade workflow</span>
              <span>Discover products</span>
              <span>Create an enquiry</span>
              <span>Track the order</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
              {/* Globe logo removed as per request */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= NETWORK CONNECTIONS ================= */}
      <div className="absolute inset-0 z-15 pointer-events-none opacity-[0.05] dark:opacity-[0.1]">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <motion.path
            initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={allowDecorativeMotion ? { duration: 3, repeat: Infinity, repeatType: "reverse" } : { duration: 0 }}
            d="M 12% 15% Q 30% 35% 45% 45% T 88% 85%"
            stroke={OBAOL_GOLD} strokeWidth={isAgroActive ? "1" : "0.5"} fill="none" strokeDasharray="4 4"
          />
          <motion.path
            initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={allowDecorativeMotion ? { duration: 4, delay: 1, repeat: Infinity, repeatType: "reverse" } : { duration: 0 }}
            d="M 88% 15% Q 70% 35% 55% 50% T 12% 85%"
            stroke={OBAOL_GOLD} strokeWidth={isAgroActive ? "1" : "0.5"} fill="none" strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* ================= ECOSYSTEM NODES ================= */}
      {/* Removed absolute positioned nodes to consolidate them in the main content flow */}

      {/* ================= MAIN CONTENT ================= */}
      <motion.div
        className="public-layout-container relative z-30 container mx-auto flex w-full flex-col items-start px-6 py-12 text-left sm:px-12 md:py-16 lg:py-8"
      >
        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          variants={shouldReduceMotion ? undefined : containerVariants}
          className="w-full max-w-6xl xl:max-w-7xl"
        >
          <div className="w-full gap-8 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-4 xl:gap-6">
              <div
                data-sticky-copy="true"
                className="w-full space-y-6 lg:sticky lg:top-28 lg:self-start lg:space-y-5 lg:pr-3"
              >
                <motion.p
                  variants={itemVariants}
                  className="mb-2 text-[8px] font-bold uppercase tracking-[0.45em] text-obaol-700 dark:text-obaol-300 sm:text-xs"
                >
                  The Agro Execution System for Agro Trade
                </motion.p>

                <motion.h1
                  initial={shouldReduceMotion ? false : "hidden"}
                  animate="visible"
                  variants={shouldReduceMotion ? undefined : itemVariants}
                  className="inline-block w-max max-w-none overflow-visible pr-8 pb-1 text-4xl sm:text-5xl md:text-6xl lg:text-[clamp(3rem,5vw,4.5rem)] font-bold tracking-[-0.03em] leading-[1.08] text-slate-950 dark:text-[#F5F1E8] cursor-pointer select-none"
                  onMouseEnter={activateSystem}
                  onMouseLeave={deactivateSystem}
                >
                  The Execution <br />
                  <span className="inline-block bg-gradient-to-r from-obaol-700 via-obaol-600 to-obaol-500 bg-clip-text pr-[0.12em] text-transparent dark:from-obaol-200 dark:via-obaol-400 dark:to-obaol-500">
                    Ecosystem
                  </span>
                </motion.h1>

                <motion.div variants={itemVariants} className="flex items-center gap-3 opacity-30">
                  <span className="text-xs md:text-lg font-medium italic">for</span>
                  <div className="h-[1px] w-20 md:w-28 bg-foreground" />
                </motion.div>

                <motion.div
                  initial={shouldReduceMotion ? false : "hidden"}
                  animate="visible"
                  variants={shouldReduceMotion ? undefined : itemVariants}
                  className="w-full py-1"
                  onMouseEnter={activateAgro}
                  onMouseLeave={deactivateAgro}
                >
                  <h2 className={`text-2xl sm:text-4xl md:text-5xl lg:text-[clamp(1.5rem,3.5vw,3rem)] font-bold tracking-[-0.02em] leading-[1.1] text-foreground transition-all duration-500 ${isAgroActive ? "text-obaol-700 dark:text-obaol-300 lg:scale-[1.02] origin-left" : ""}`}>
                    B2B Agro Trade.
                  </h2>

                  <div className="relative mt-3 min-h-[48px] sm:min-h-[52px] md:min-h-[58px] overflow-hidden" aria-atomic="true">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p
                        key={activeStage.id}
                        initial={shouldReduceMotion ? false : { y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { y: -10, opacity: 0 }}
                        transition={shouldReduceMotion ? { duration: 0 } : HOVER_TIMING.textSwap}
                        className="absolute inset-x-0 top-0 max-w-xl text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-snug text-obaol-700 dark:text-obaol-300"
                      >
                        {activeStage.message}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="pt-2 md:pt-5 max-w-3xl space-y-6 md:space-y-8"
                >
                  <p className="text-base sm:text-lg md:text-xl text-foreground/70 font-medium leading-relaxed">
                    Plan procurement, manage logistics, run verification, and move orders in one agro execution system.
                    <span className="text-foreground font-bold"> Built for real B2B agro trade operations.</span>
                  </p>

                  <div className="flex flex-col items-start gap-8 md:gap-10">
                    <button
                      onMouseEnter={activateSystem}
                      onMouseLeave={deactivateSystem}
                      onClick={() => {
                        setIsNavigating(true);
                        router.push(!loading && isAuthenticated ? "/dashboard" : "/auth");
                      }}
                      className="public-button public-button--primary group relative"
                    >
                      {isNavigating ? "Opening..." : (isAuthenticated ? "Open workspace" : "Get started")}
                      <FiArrowRight size={20} className="md:size-6 group-hover:translate-x-2 transition-transform" />
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm opacity-0 group-hover:opacity-100 transition-opacity public-decoration" />
                    </button>

                    {!loading && !isAuthenticated && (
                      <div className="flex flex-wrap items-center gap-6 md:gap-10">
                        <Link href="/auth/register?intent=BUY" className="text-[10px] sm:text-[12px] font-bold text-foreground/50 hover:text-obaol-700 dark:hover:text-obaol-300 uppercase tracking-[0.2em] transition-colors flex items-center gap-2">
                          Start buying
                        </Link>
                        <Link href="/auth/register?intent=SELL" className="text-[10px] sm:text-[12px] font-bold text-foreground/50 hover:text-obaol-700 dark:hover:text-obaol-300 uppercase tracking-[0.2em] transition-colors flex items-center gap-2">
                          Start selling
                        </Link>
                        <Link href="/auth/operator/register" className="text-[10px] sm:text-[12px] font-bold text-foreground/50 hover:text-obaol-700 dark:hover:text-obaol-300 uppercase tracking-[0.2em] transition-colors flex items-center gap-2">
                          Work in operations
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* One image, with the full execution path always readable. */}
              <motion.div
                variants={itemVariants}
                className="relative mt-10 w-full sm:mt-14 lg:mt-0 lg:pb-20"
              >
                <div
                  data-hero-panel="execution-flow"
                  className="grid w-full gap-5 rounded-[1.75rem] border border-obaol-200/60 bg-white/85 p-4 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-slate-950/75 sm:p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-4"
                >
                  <figure className="relative min-h-[300px] overflow-hidden rounded-[1.35rem] bg-slate-900 sm:min-h-[380px] lg:min-h-[470px]">
                    <RevealImage
                      key={activeStage.id}
                      src={activeStage.src}
                      alt={`Step ${activeStage.sequence}: ${activeStage.label} in the OBAOL agro trade execution flow`}
                      fill
                      sizes="(max-width: 1023px) 90vw, 36vw"
                      className="object-cover"
                      style={{ objectPosition: activeStage.objectPosition }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <figcaption className="absolute inset-x-5 bottom-5 text-white">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-obaol-200">Step {activeStage.sequence} of {HERO_STAGES.length}</span>
                      <span className="mt-1 block text-2xl font-bold sm:text-3xl">{activeStage.label}</span>
                    </figcaption>
                  </figure>
                  <div
                    aria-label="Choose an execution stage"
                    onMouseEnter={() => setIsStageControlActive(true)}
                    onMouseLeave={() => setIsStageControlActive(false)}
                    onFocusCapture={() => setIsStageControlActive(true)}
                    onBlurCapture={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setIsStageControlActive(false);
                      }
                    }}
                    className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-1"
                  >
                    {HERO_STAGES.map((stage, index) => (
                      <button
                        key={stage.id}
                        type="button"
                        aria-current={index === activeStageIndex ? "step" : undefined}
                        aria-label={`Step ${stage.sequence}: ${stage.label}`}
                        onClick={() => setActiveStageIndex(index)}
                        className={`flex min-h-10 w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 sm:px-3 lg:min-h-0 ${index === activeStageIndex
                          ? "border-obaol-500 bg-obaol-100 text-slate-950 shadow-sm dark:bg-obaol-500/20 dark:text-white"
                          : "border-slate-200 bg-white/75 text-slate-700 hover:border-obaol-400 hover:bg-obaol-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"}`}
                      >
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-obaol-700 dark:text-obaol-300">Step {stage.sequence}</span>
                        <span className="text-xs font-semibold leading-tight sm:text-sm">{stage.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
          </div>

        </motion.div>
      </motion.div>

      {/* Dynamic Cursor Light Overlay */}
      {allowPointerEffects && (
        <motion.div
          className="absolute inset-0 z-40 pointer-events-none"
          style={{ background: cursorGlow }}
        />
      )}
    </section>
  );
}
