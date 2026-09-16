"use client";

import Link from "next/link";
import RevealImage from "@/components/ui/RevealImage";
import { motion, useTransform, useMotionValue, useSpring, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState, type CSSProperties } from "react";
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

const DESKTOP_COLLAGE_SLOTS = [
  { left: 0, top: 3, width: 23, aspectRatio: 1.08, rotation: -2 },
  { left: 25.5, top: 0, width: 21.5, aspectRatio: 1.04, rotation: 2 },
  { left: 49.5, top: 4, width: 21.5, aspectRatio: 1.08, rotation: -2 },
  { left: 73.5, top: 1, width: 25, aspectRatio: 1.28, rotation: 2 },
  { left: 70, top: 35, width: 28.5, aspectRatio: 1.4, rotation: 2 },
  { left: 35.5, top: 33, width: 29, aspectRatio: 1.4, rotation: -2 },
  { left: 0, top: 35, width: 29, aspectRatio: 1.4, rotation: 2 },
  { left: 0, top: 70, width: 29, aspectRatio: 1.45, rotation: -2 },
  { left: 35.5, top: 68, width: 29, aspectRatio: 1.45, rotation: 2 },
  { left: 70, top: 70, width: 28.5, aspectRatio: 1.45, rotation: -2 },
] as const;

const FLOW_CONNECTOR_PATHS = [
  "M 23.3 17 C 24 17, 24.5 16, 25.1 15.5",
  "M 47.3 15 C 48 15, 48.6 16.5, 49.2 17",
  "M 71.3 17 C 72 17, 72.6 15.5, 73.2 15",
  "M 86 28.8 C 87.5 30.5, 86 32.5, 85 34.5",
  "M 69.6 49 C 68 49, 66.5 48, 64.9 48",
  "M 35.1 48 C 33.5 48, 31.5 49, 29.4 49",
  "M 14.5 64.4 C 13.5 66, 14.5 68, 14.5 69.5",
  "M 29.4 83.5 C 31.5 83.5, 33.5 82, 35.1 82",
  "M 64.9 82 C 66.5 82, 68 83.5, 69.6 83.5",
] as const;


const HERO_ROTATION_INTERVAL = 1800;

function StageIllustration({ stageId }: { stageId: string }) {
  switch (stageId) {
    case "discovery":
      return (
        <svg className="w-10 h-10 sm:w-14 sm:h-14 text-obaol-600 dark:text-obaol-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="28" cy="28" r="16" strokeDasharray="3 3" />
          <circle cx="28" cy="28" r="8" />
          <line x1="39" y1="39" x2="54" y2="54" strokeWidth="3.5" />
          <circle cx="28" cy="28" r="2" fill="currentColor" />
          <path d="M46 14h6m-3-3v6" />
        </svg>
      );
    case "sampling":
      return (
        <svg className="w-10 h-10 sm:w-14 sm:h-14 text-obaol-600 dark:text-obaol-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M26 10h12m-6 0v10l14 26A4 4 0 0 1 42 52H22a4 4 0 0 1-3.5-6L32 20V10" />
          <path d="M22 38h20" strokeDasharray="2 2" />
          <circle cx="28" cy="44" r="2" fill="currentColor" />
          <circle cx="36" cy="42" r="1.5" fill="currentColor" />
        </svg>
      );
    case "coordination":
      return (
        <svg className="w-10 h-10 sm:w-14 sm:h-14 text-obaol-600 dark:text-obaol-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="16" r="7" />
          <circle cx="16" cy="46" r="7" />
          <circle cx="48" cy="46" r="7" />
          <path d="M26 21l-5 18m17-18l5 18m-17 4h18" strokeDasharray="3 3" />
          <circle cx="32" cy="33" r="3" fill="currentColor" />
        </svg>
      );
    case "documentation":
      return (
        <svg className="w-10 h-10 sm:w-14 sm:h-14 text-obaol-600 dark:text-obaol-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 10h20l12 12v32a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" />
          <path d="M38 10v12h12" />
          <line x1="22" y1="28" x2="34" y2="28" />
          <line x1="22" y1="36" x2="42" y2="36" />
          <line x1="22" y1="44" x2="38" y2="44" />
          <path d="M40 46l2 2 4-4" strokeWidth="2.5" />
        </svg>
      );
    case "inspection-visit":
      return (
        <svg className="w-10 h-10 sm:w-14 sm:h-14 text-obaol-600 dark:text-obaol-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 10c-9 0-16 7-16 16 0 12 16 26 16 26s16-14 16-26c0-9-7-16-16-16z" />
          <circle cx="32" cy="26" r="6" />
          <path d="M29 26l2 2 4-4" strokeWidth="2" />
          <path d="M12 54h40" strokeDasharray="3 3" />
        </svg>
      );
    case "quality-testing":
      return (
        <svg className="w-10 h-10 sm:w-14 sm:h-14 text-obaol-600 dark:text-obaol-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 10L14 18v16c0 13 8 23 18 26 10-3 18-13 18-26V18L32 10z" />
          <path d="M24 32l6 6 10-10" strokeWidth="2.5" />
          <circle cx="46" cy="18" r="2" fill="currentColor" />
        </svg>
      );
    case "packaging":
      return (
        <svg className="w-10 h-10 sm:w-14 sm:h-14 text-obaol-600 dark:text-obaol-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 10L12 20v24l20 10 20-10V20L32 10z" />
          <path d="M12 20l20 10 20-10" />
          <line x1="32" y1="30" x2="32" y2="54" />
          <path d="M22 15l20 10" strokeDasharray="2 2" />
        </svg>
      );
    case "procurement":
      return (
        <svg className="w-10 h-10 sm:w-14 sm:h-14 text-obaol-600 dark:text-obaol-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 20h32l-4 28H20L16 20z" />
          <path d="M24 20v-6a8 8 0 0 1 16 0v6" />
          <circle cx="32" cy="34" r="5" />
          <path d="M32 31v6m-3-3h6" />
        </svg>
      );
    case "inland-transportation":
      return (
        <svg className="w-10 h-10 sm:w-14 sm:h-14 text-obaol-600 dark:text-obaol-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 24h28v20H10z" />
          <path d="M38 30h10l6 7v7H38V30z" />
          <circle cx="20" cy="46" r="4" fill="currentColor" fillOpacity="0.2" />
          <circle cx="44" cy="46" r="4" fill="currentColor" fillOpacity="0.2" />
          <line x1="10" y1="52" x2="54" y2="52" strokeDasharray="3 3" />
        </svg>
      );
    case "freight-forwarding":
      return (
        <svg className="w-10 h-10 sm:w-14 sm:h-14 text-obaol-600 dark:text-obaol-400" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 34l8-14h24l8 14H12z" />
          <path d="M8 34h48l-6 12H14L8 34z" />
          <rect x="22" y="14" width="6" height="6" />
          <rect x="30" y="14" width="6" height="6" />
          <rect x="38" y="14" width="6" height="6" />
          <path d="M6 50c8 0 10-2 16-2s8 2 16 2 8-2 16-2" strokeDasharray="3 3" />
        </svg>
      );
    default:
      return null;
  }
}

function ExecutionStageCard({
  stage,
  active,
  reducedMotion,
  onSelect,
  className,
  style,
  sizes,
}: {
  stage: HeroStage;
  active: boolean;
  reducedMotion: boolean;
  onSelect: () => void;
  className: string;
  style?: CSSProperties;
  sizes: string;
}) {
  return (
    <button
      type="button"
      data-execution-stage={stage.id}
      aria-current={active ? "step" : undefined}
      aria-label={`Step ${stage.sequence}: ${stage.label}`}
      onClick={onSelect}
      className={`group isolate overflow-hidden rounded-[1.15rem] border text-left shadow-[0_18px_35px_-25px_rgba(0,0,0,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 sm:rounded-[1.4rem] ${reducedMotion ? "" : "transition-[border-color,box-shadow] duration-300"} ${active
        ? "border-obaol-400 bg-slate-950 text-white shadow-[0_22px_42px_-24px_rgba(0,0,0,0.8)]"
        : "border-obaol-300/75 bg-gradient-to-br from-obaol-50 via-white to-amber-50 text-slate-900 hover:border-obaol-500 dark:border-obaol-400/30 dark:from-slate-900 dark:via-slate-950 dark:to-amber-950/30 dark:text-white"} ${className}`}
      style={style}
    >
      {active ? (
        <>
          <RevealImage
            src={stage.src}
            alt={`Step ${stage.sequence}: ${stage.label} in the OBAOL agro trade execution flow`}
            fill
            sizes={sizes}
            className="object-cover"
            style={{ objectPosition: stage.objectPosition }}
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-2 pt-0 pb-6 opacity-35 transition-all duration-300 group-hover:scale-110 group-hover:opacity-75 dark:opacity-45 pointer-events-none">
          <StageIllustration stageId={stage.id} />
        </div>
      )}
      <span className={`relative z-10 flex h-full flex-col justify-end p-3 sm:p-4 ${active ? "text-white" : ""}`}>
        <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${active ? "text-obaol-200" : "text-obaol-700 dark:text-obaol-300"}`}>Step {stage.sequence}</span>
        <span className="mt-1 text-sm font-bold leading-tight sm:text-base lg:text-[clamp(0.75rem,1vw,1rem)]">{stage.label}</span>
      </span>
    </button>
  );
}

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
                    <p className="absolute inset-x-0 top-0 max-w-xl text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-snug text-obaol-700 dark:text-obaol-300">
                      {activeStage.message}
                    </p>
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

              {/* The original execution path stays in place; only one stage reveals its photo. */}
              <motion.div
                variants={itemVariants}
                className="relative mt-10 w-full sm:mt-14 lg:mt-0 lg:pb-20"
              >
                <div
                  data-hero-panel="execution-flow"
                  aria-label="OBAOL's ten-stage execution flow"
                  onMouseEnter={() => setIsStageControlActive(true)}
                  onMouseLeave={() => setIsStageControlActive(false)}
                  onFocusCapture={() => setIsStageControlActive(true)}
                  onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setIsStageControlActive(false);
                    }
                  }}
                  className="relative w-full"
                >
                  <div className="relative hidden aspect-[7/5] w-full max-w-[880px] xl:block">
                    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <marker id="execution-flow-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                          <path d="M 0 0 L 5 2.5 L 0 5 Z" fill={OBAOL_GOLD} />
                        </marker>
                      </defs>
                      {FLOW_CONNECTOR_PATHS.map((path, index) => (
                        <path key={path} d={path} fill="none" stroke={OBAOL_GOLD} strokeOpacity="0.65" strokeWidth="1.4" strokeDasharray="2.2 3.2" vectorEffect="non-scaling-stroke" markerEnd="url(#execution-flow-arrow)" data-flow-connector={index} />
                      ))}
                    </svg>
                    {HERO_STAGES.map((stage, index) => {
                      const slot = DESKTOP_COLLAGE_SLOTS[index];
                      return (
                        <ExecutionStageCard
                          key={stage.id}
                          stage={stage}
                          active={index === activeStageIndex}
                          reducedMotion={shouldReduceMotion}
                          onSelect={() => setActiveStageIndex(index)}
                          className="absolute"
                          sizes="(max-width: 1279px) 14vw, 11vw"
                          style={{
                            left: `${slot.left}%`,
                            top: `${slot.top}%`,
                            width: `${slot.width}%`,
                            aspectRatio: slot.aspectRatio,
                            transform: `rotate(${slot.rotation}deg)`,
                            zIndex: index === activeStageIndex ? 4 : 2,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="relative grid grid-cols-2 gap-4 pb-4 xl:hidden">
                    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 25 10 H 75 V 30 H 25 V 50 H 75 V 70 H 25 V 90 H 75" fill="none" stroke={OBAOL_GOLD} strokeOpacity="0.65" strokeWidth="1.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                    </svg>
                    {HERO_STAGES.map((stage, index) => {
                      const row = Math.floor(index / 2);
                      const column = row % 2 === 0 ? index % 2 + 1 : 2 - index % 2;
                      return (
                        <ExecutionStageCard
                          key={stage.id}
                          stage={stage}
                          active={index === activeStageIndex}
                          reducedMotion={shouldReduceMotion}
                          onSelect={() => setActiveStageIndex(index)}
                          className="relative min-h-32 sm:min-h-40"
                          sizes="(max-width: 639px) 44vw, 40vw"
                          style={{ gridRow: row + 1, gridColumn: column }}
                        />
                      );
                    })}
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
