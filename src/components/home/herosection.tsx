"use client";

import Link from "next/link";
import { motion, useTransform, useMotionValue, useSpring, AnimatePresence, useReducedMotion } from "framer-motion";
import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";
import { FiArrowRight } from "react-icons/fi";

/* ================= ANIMATION VARIANTS ================= */
/* The hero wall is rendered from fixed stage slots to keep hydration deterministic. */

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

const HERO_SERVICES = [
  {
    id: "sourcing",
    message: "Find the right product and origin.",
  },
  {
    id: "documentation",
    message: "Plan documents and trade execution.",
  },
  {
    id: "procurement",
    message: "Get on-ground procurement assistance.",
  },
  {
    id: "quality",
    message: "Verify quality before shipment.",
  },
  {
    id: "packaging",
    message: "Prepare export-ready packaging.",
  },
  {
    id: "logistics",
    message: "Coordinate with inland logistics providers.",
  },
  {
    id: "warehouse",
    message: "Book and manage warehouse capacity.",
  },
  {
    id: "freight",
    message: "Move shipments with freight partners.",
  },
] as const;

const OBAOL_GOLD = "#CF983C";

type HeroStage = {
  id: string;
  sequence: number;
  label: string;
  src: string;
  objectPosition: string;
};

const HERO_STAGES = [
  {
    id: "discovery",
    sequence: 1,
    label: "Discovery",
    src: "/images/execution-flow/01-discovery.webp",
    objectPosition: "center 46%",
  },
  {
    id: "sampling",
    sequence: 2,
    label: "Sampling",
    src: "/images/execution-flow/02-sampling.webp",
    objectPosition: "center 48%",
  },
  {
    id: "coordination",
    sequence: 3,
    label: "Coordination",
    src: "/images/execution-flow/03-coordination.webp",
    objectPosition: "center 46%",
  },
  {
    id: "documentation",
    sequence: 4,
    label: "Documentation",
    src: "/images/execution-flow/04-documentation.webp",
    objectPosition: "center 48%",
  },
  {
    id: "inspection-visit",
    sequence: 5,
    label: "Inspection Visit",
    src: "/images/execution-flow/05-inspection-visit.webp",
    objectPosition: "center 48%",
  },
  {
    id: "quality-testing",
    sequence: 6,
    label: "Quality Testing",
    src: "/images/execution-flow/06-quality-testing.webp",
    objectPosition: "center 44%",
  },
  {
    id: "packaging",
    sequence: 7,
    label: "Packaging",
    src: "/images/execution-flow/07-packaging.webp",
    objectPosition: "center 48%",
  },
  {
    id: "procurement",
    sequence: 8,
    label: "Procurement",
    src: "/images/execution-flow/08-procurement.webp",
    objectPosition: "center 48%",
  },
  {
    id: "inland-transportation",
    sequence: 9,
    label: "Inland Transportation",
    src: "/images/execution-flow/09-inland-transportation.webp",
    objectPosition: "center 48%",
  },
  {
    id: "freight-forwarding",
    sequence: 10,
    label: "Freight Forwarding",
    src: "/images/hero-operations/freight.webp",
    objectPosition: "center 46%",
  },
] as const satisfies readonly HeroStage[];

type HeroStageId = (typeof HERO_STAGES)[number]["id"];

const HERO_STAGE_BY_ID = Object.fromEntries(
  HERO_STAGES.map((stage) => [stage.id, stage]),
) as Record<HeroStageId, (typeof HERO_STAGES)[number]>;

type CollageSlot = {
  id: string;
  stageId: HeroStageId;
  left: number;
  top: number;
  width: number;
  aspectRatio: number;
  rotation: number;
  zIndex: number;
  delay: number;
  entryX: number;
  entryY: number;
};

const DESKTOP_COLLAGE_SLOTS: CollageSlot[] = [
  { id: "discovery-slot", stageId: "discovery", left: 0, top: 3, width: 23, aspectRatio: 1.08, rotation: -2, zIndex: 3, delay: 0.04, entryX: -28, entryY: -18 },
  { id: "sampling-slot", stageId: "sampling", left: 25.5, top: 0, width: 21.5, aspectRatio: 1.04, rotation: 2, zIndex: 3, delay: 0.09, entryX: -12, entryY: -24 },
  { id: "coordination-slot", stageId: "coordination", left: 49.5, top: 4, width: 21.5, aspectRatio: 1.08, rotation: -2, zIndex: 3, delay: 0.14, entryX: 12, entryY: -22 },
  { id: "documentation-slot", stageId: "documentation", left: 73.5, top: 1, width: 25, aspectRatio: 1.28, rotation: 2, zIndex: 3, delay: 0.19, entryX: 28, entryY: -18 },
  { id: "inspection-slot", stageId: "inspection-visit", left: 70, top: 35, width: 28.5, aspectRatio: 1.4, rotation: 2, zIndex: 3, delay: 0.24, entryX: 28, entryY: 0 },
  { id: "testing-slot", stageId: "quality-testing", left: 35.5, top: 33, width: 29, aspectRatio: 1.4, rotation: -2, zIndex: 4, delay: 0.29, entryX: 0, entryY: 16 },
  { id: "packaging-slot", stageId: "packaging", left: 0, top: 35, width: 29, aspectRatio: 1.4, rotation: 2, zIndex: 3, delay: 0.34, entryX: -28, entryY: 0 },
  { id: "procurement-slot", stageId: "procurement", left: 0, top: 70, width: 29, aspectRatio: 1.45, rotation: -2, zIndex: 3, delay: 0.39, entryX: -28, entryY: 20 },
  { id: "transport-slot", stageId: "inland-transportation", left: 35.5, top: 68, width: 29, aspectRatio: 1.45, rotation: 2, zIndex: 3, delay: 0.44, entryX: 0, entryY: 24 },
  { id: "freight-slot", stageId: "freight-forwarding", left: 70, top: 70, width: 28.5, aspectRatio: 1.45, rotation: -2, zIndex: 3, delay: 0.49, entryX: 28, entryY: 20 },
];

const FLOW_CONNECTOR_PATHS = [
  { from: "discovery", to: "sampling", start: [23.3, 17], d: "M 23.3 17 C 24 17, 24.5 16, 25.1 15.5" },
  { from: "sampling", to: "coordination", start: [47.3, 15], d: "M 47.3 15 C 48 15, 48.6 16.5, 49.2 17" },
  { from: "coordination", to: "documentation", start: [71.3, 17], d: "M 71.3 17 C 72 17, 72.6 15.5, 73.2 15" },
  { from: "documentation", to: "inspection-visit", start: [86, 28.8], d: "M 86 28.8 C 87.5 30.5, 86 32.5, 85 34.5" },
  { from: "inspection-visit", to: "quality-testing", start: [69.6, 49], d: "M 69.6 49 C 68 49, 66.5 48, 64.9 48" },
  { from: "quality-testing", to: "packaging", start: [35.1, 48], d: "M 35.1 48 C 33.5 48, 31.5 49, 29.4 49" },
  { from: "packaging", to: "procurement", start: [14.5, 64.4], d: "M 14.5 64.4 C 13.5 66, 14.5 68, 14.5 69.5" },
  { from: "procurement", to: "inland-transportation", start: [29.4, 83.5], d: "M 29.4 83.5 C 31.5 83.5, 33.5 82, 35.1 82" },
  { from: "inland-transportation", to: "freight-forwarding", start: [64.9, 82], d: "M 64.9 82 C 66.5 82, 68 83.5, 69.6 83.5" },
] as const;

function DesktopFlowConnectors({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <marker id="flow-arrowhead" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 5 2.5 L 0 5 Z" fill={OBAOL_GOLD} fillOpacity="0.72" />
        </marker>
      </defs>
      {FLOW_CONNECTOR_PATHS.map((connector, index) => (
        <Fragment key={`${connector.from}-${connector.to}`}>
          <motion.circle
            cx={connector.start[0]}
            cy={connector.start[1]}
            r="0.48"
            fill={OBAOL_GOLD}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 0.72, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, delay: 0.28 + index * 0.09 }}
          />
          <motion.path
            data-flow-connector="desktop"
            data-from={connector.from}
            data-to={connector.to}
            d={connector.d}
            fill="none"
            stroke={OBAOL_GOLD}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="2.2 3.2"
            vectorEffect="non-scaling-stroke"
            markerEnd="url(#flow-arrowhead)"
            initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.62 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.48, delay: 0.32 + index * 0.09, ease: "easeOut" }}
          />
        </Fragment>
      ))}
    </svg>
  );
}

function EditorialCollageTile({
  slot,
  stage,
  prefersReducedMotion,
  sizes,
}: {
  slot: CollageSlot;
  stage: HeroStage;
  prefersReducedMotion: boolean | null;
  sizes: string;
}) {
  const staticState = {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: slot.rotation,
  };

  return (
    <motion.div
      aria-hidden="true"
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.82, y: 24, rotate: slot.rotation - 3 }}
      animate={prefersReducedMotion ? staticState : {
        opacity: 1,
        scale: 1,
        y: 0,
        rotate: slot.rotation,
      }}
      transition={prefersReducedMotion ? { duration: 0 } : {
        opacity: { duration: 0.75, delay: slot.delay },
        scale: { duration: 0.85, delay: slot.delay, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.75, delay: slot.delay, ease: [0.22, 1, 0.36, 1] },
        rotate: { duration: 0.85, delay: slot.delay, ease: [0.22, 1, 0.36, 1] },
      }}
      className="absolute overflow-hidden rounded-[1.15rem] border border-white/20 bg-black shadow-[0_22px_42px_-24px_rgba(0,0,0,0.85)] sm:rounded-[1.45rem]"
      style={{
        left: `${slot.left}%`,
        top: `${slot.top}%`,
        width: `${slot.width}%`,
        aspectRatio: slot.aspectRatio,
        zIndex: slot.zIndex,
      }}
    >
      <Image src={stage.src} alt="" fill sizes={sizes} className="object-cover" style={{ objectPosition: stage.objectPosition }} />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-white/10" />
      <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-2 py-1 backdrop-blur-md sm:inset-x-auto sm:left-2 sm:bottom-2 sm:px-2.5">
        <span className="font-mono text-[7px] font-bold text-obaol-300 sm:text-[8px]">{String(stage.sequence).padStart(2, "0")}</span>
        <span className="truncate text-[7px] font-bold uppercase tracking-[0.12em] text-white/90 sm:text-[8px]">{stage.label}</span>
      </div>
    </motion.div>
  );
}

function MobileExecutionFlowCard({
  stage,
  prefersReducedMotion,
  animateIn = true,
}: {
  stage: HeroStage;
  prefersReducedMotion: boolean | null;
  animateIn?: boolean;
}) {
  return (
    <motion.figure
      initial={prefersReducedMotion || !animateIn ? false : { opacity: 0, y: 18 }}
      whileInView={animateIn ? { opacity: 1, y: 0 } : undefined}
      animate={!animateIn ? { opacity: 1, y: 0 } : undefined}
      viewport={animateIn ? { once: true, amount: 0.35 } : undefined}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.55, delay: animateIn ? Math.min(stage.sequence * 0.035, 0.28) : 0 }}
      className="relative aspect-[4/3] w-[78vw] max-w-[320px] shrink-0 snap-center overflow-hidden rounded-[1.35rem] border border-white/20 bg-black shadow-[0_22px_42px_-24px_rgba(0,0,0,0.85)]"
    >
      <Image src={stage.src} alt="" fill sizes="78vw" className="object-cover" style={{ objectPosition: stage.objectPosition }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-white/10" />
      <figcaption className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/75 px-3 py-2 backdrop-blur-md">
        <span className="font-mono text-[10px] font-bold text-obaol-300">{String(stage.sequence).padStart(2, "0")}</span>
        <span className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-white/95">{stage.label}</span>
      </figcaption>
    </motion.figure>
  );
}

function MobileFlowConnector({ from, to, prefersReducedMotion }: { from: string; to: string; prefersReducedMotion: boolean | null }) {
  return (
    <motion.svg
      aria-hidden="true"
      data-flow-connector="mobile"
      data-from={from}
      data-to={to}
      className="h-8 w-9 shrink-0 self-center overflow-visible"
      viewBox="0 0 36 24"
      initial={prefersReducedMotion ? false : { opacity: 0, scaleX: 0.5 }}
      whileInView={{ opacity: 0.72, scaleX: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
    >
      <circle cx="3" cy="12" r="2" fill={OBAOL_GOLD} />
      <path d="M 6 12 H 29" fill="none" stroke={OBAOL_GOLD} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2.5 3.5" />
      <path d="M 27 8 L 33 12 L 27 16" fill="none" stroke={OBAOL_GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

function MobileExecutionFlowSequence({
  includeLoopConnector,
  ariaHidden,
  animateIn,
  prefersReducedMotion,
}: {
  includeLoopConnector: boolean;
  ariaHidden?: boolean;
  animateIn: boolean;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <div className="flex shrink-0 gap-4 pr-4" aria-hidden={ariaHidden}>
      {HERO_STAGES.map((stage, index) => {
        const nextStage = HERO_STAGES[(index + 1) % HERO_STAGES.length];
        const showConnector = includeLoopConnector || index < HERO_STAGES.length - 1;

        return (
          <Fragment key={`${ariaHidden ? "clone" : "primary"}-${stage.id}`}>
            <MobileExecutionFlowCard
              stage={stage}
              prefersReducedMotion={prefersReducedMotion}
              animateIn={animateIn}
            />
            {showConnector && (
              <MobileFlowConnector
                from={stage.id}
                to={nextStage.id}
                prefersReducedMotion={prefersReducedMotion}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

function MobileExecutionFlowTrack({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  if (prefersReducedMotion) {
    return (
      <div
        role="region"
        aria-label="Ten-stage OBAOL execution flow. Scroll horizontally to review every stage."
        tabIndex={0}
        className="scrollbar-hide -mx-6 flex w-[calc(100%+3rem)] snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-5 pt-2 outline-none focus-visible:ring-2 focus-visible:ring-obaol-400/70 sm:-mx-12 sm:w-[calc(100%+6rem)] sm:px-12 lg:hidden"
      >
        <MobileExecutionFlowSequence includeLoopConnector={false} animateIn prefersReducedMotion={prefersReducedMotion} />
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Ten-stage OBAOL execution flow moving automatically from discovery through freight forwarding."
      className="-mx-6 w-[calc(100%+3rem)] overflow-hidden px-6 pb-5 pt-2 [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)] sm:-mx-12 sm:w-[calc(100%+6rem)] sm:px-12 lg:hidden"
    >
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 72, ease: "linear", repeat: Infinity }}
      >
        <MobileExecutionFlowSequence includeLoopConnector animateIn={false} prefersReducedMotion={prefersReducedMotion} />
        <MobileExecutionFlowSequence includeLoopConnector ariaHidden animateIn={false} prefersReducedMotion={prefersReducedMotion} />
      </motion.div>
    </div>
  );
}

const HOVER_TIMING = {
  textSwap: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

const HERO_ROTATION_INTERVAL = 3500;

export default function HeroSection() {
  const router = useRouter();
  const { isAuthenticated, loading } = usePublicAuthStatus();
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [isAgroActive, setIsAgroActive] = useState(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const activeService = HERO_SERVICES[activeServiceIndex];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 30;
      const moveY = (clientY - window.innerHeight / 2) / 30;
      mouseX.set(moveX);
      mouseY.set(moveY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    const mobileMedia = window.matchMedia("(max-width: 1023px)");

    const update = () => {
      setIsMobile(mobileMedia.matches);
    };

    update();
    mobileMedia.addEventListener("change", update);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      mobileMedia.removeEventListener("change", update);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timeoutId = window.setTimeout(() => {
      setActiveServiceIndex((current) => (current + 1) % HERO_SERVICES.length);
    }, HERO_ROTATION_INTERVAL);

    return () => window.clearTimeout(timeoutId);
  }, [activeServiceIndex, prefersReducedMotion]);

  return (
    <section
      data-natural-scroll-hero="true"
      className="relative min-h-[85vh] bg-background pt-20"
    >
      {/* ================= BACKGROUND ================= */}
      <motion.div
        className="absolute inset-0 z-0 select-none pointer-events-none"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80 z-10" />
        <div className="obaol-hero-ambient absolute inset-0" />
      </motion.div>

      {/* Grid Overlay */}
      <motion.div
        initial={{ opacity: 0.08 }}
        animate={{
          opacity: (isSystemActive || isAgroActive) ? 0.25 : 0.08,
        }}
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-1000 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"
        style={{
          backgroundImage: `linear-gradient(to right, ${OBAOL_GOLD} 1px, transparent 1px), linear-gradient(to bottom, ${OBAOL_GOLD} 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem"
        }}
      />

      {/* ================= SYSTEM / AGRO HUD OVERLAY ================= */}
      <AnimatePresence>
        {isSystemActive && (
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

        {isAgroActive && (
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
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            d="M 12% 15% Q 30% 35% 45% 45% T 88% 85%"
            stroke={OBAOL_GOLD} strokeWidth={isAgroActive ? "1" : "0.5"} fill="none" strokeDasharray="4 4"
          />
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 4, delay: 1, repeat: Infinity, repeatType: "reverse" }}
            d="M 88% 15% Q 70% 35% 55% 50% T 12% 85%"
            stroke={OBAOL_GOLD} strokeWidth={isAgroActive ? "1" : "0.5"} fill="none" strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* ================= ECOSYSTEM NODES ================= */}
      {/* Removed absolute positioned nodes to consolidate them in the main content flow */}

      {/* ================= MAIN CONTENT ================= */}
      <motion.div
        className="relative z-30 container mx-auto flex w-full flex-col items-start px-6 py-12 text-left sm:px-12 md:py-16 lg:py-8"
      >
        <motion.div
          initial={isMobile ? false : "hidden"}
          animate="visible"
          variants={containerVariants}
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
                  initial={isMobile ? false : "hidden"}
                  animate="visible"
                  variants={itemVariants}
                  className="inline-block w-max max-w-none overflow-visible pr-8 pb-1 text-4xl sm:text-5xl md:text-6xl lg:text-[clamp(3rem,5vw,4.5rem)] font-bold tracking-[-0.03em] leading-[1.08] text-slate-950 dark:text-[#F5F1E8] cursor-pointer select-none"
                  onMouseEnter={() => setIsSystemActive(true)}
                  onMouseLeave={() => setIsSystemActive(false)}
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
                  initial={isMobile ? false : "hidden"}
                  animate="visible"
                  variants={itemVariants}
                  className="w-full py-1"
                  onMouseEnter={() => setIsAgroActive(true)}
                  onMouseLeave={() => setIsAgroActive(false)}
                >
                  <h2 className={`text-2xl sm:text-4xl md:text-5xl lg:text-[clamp(1.5rem,3.5vw,3rem)] font-bold tracking-[-0.02em] leading-[1.1] text-foreground transition-all duration-500 ${isAgroActive ? "text-obaol-700 dark:text-obaol-300 lg:scale-[1.02] origin-left" : ""}`}>
                    B2B Agro Trade.
                  </h2>

                  <div className="relative mt-3 min-h-[48px] sm:min-h-[52px] md:min-h-[58px] overflow-hidden" aria-atomic="true">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p
                        key={activeService.id}
                        initial={prefersReducedMotion ? false : { y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { y: -10, opacity: 0 }}
                        transition={prefersReducedMotion ? { duration: 0 } : HOVER_TIMING.textSwap}
                        className="absolute inset-x-0 top-0 max-w-xl text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-snug text-obaol-700 dark:text-obaol-300"
                      >
                        {activeService.message}
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
                      onMouseEnter={() => setIsSystemActive(true)}
                      onMouseLeave={() => setIsSystemActive(false)}
                      onClick={() => {
                        setIsNavigating(true);
                        router.push(!loading && isAuthenticated ? "/dashboard" : "/auth");
                      }}
                      className="group relative flex items-center gap-2.5 rounded-[2rem] border border-obaol-300/45 bg-obaol-500 px-6 py-3 text-base font-bold text-obaol-950 shadow-[0_20px_42px_-14px_rgba(207,152,60,0.65)] transition-all hover:scale-105 hover:bg-obaol-400 active:scale-95 md:gap-3 md:px-9 md:py-4 md:text-xl"
                    >
                      {isNavigating ? "Opening..." : (isAuthenticated ? "Open workspace" : "Get started")}
                      <FiArrowRight size={20} className="md:size-6 group-hover:translate-x-2 transition-transform" />
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
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

              {/* Natural-flow execution story */}
              <motion.div
                variants={itemVariants}
                className="relative mt-10 w-full sm:mt-14 lg:mt-0 lg:pb-20"
              >
                <div
                  data-hero-panel="execution-flow"
                  role="img"
                  aria-label="OBAOL execution flow: discovery, sampling, coordination, documentation, inspection visit, quality testing, packaging, procurement, inland transportation, and freight forwarding"
                  className="relative hidden aspect-[7/5] w-full max-w-[880px] lg:block"
                >
                  <DesktopFlowConnectors prefersReducedMotion={prefersReducedMotion} />
                  {DESKTOP_COLLAGE_SLOTS.map((slot) => {
                    const stage = HERO_STAGE_BY_ID[slot.stageId];
                    return (
                      <EditorialCollageTile
                        key={slot.id}
                        slot={slot}
                        stage={stage}
                        prefersReducedMotion={prefersReducedMotion}
                        sizes="(max-width: 1279px) 14vw, 11vw"
                      />
                    );
                  })}
                </div>

                <MobileExecutionFlowTrack prefersReducedMotion={prefersReducedMotion} />

              </motion.div>
          </div>

          <div
            aria-hidden="true"
            data-process-to-laptop-arrow="true"
            className="pointer-events-none relative z-20 mx-auto mt-2 flex h-24 w-full max-w-[760px] items-center justify-center text-obaol-600/70 dark:text-obaol-300/70 lg:mt-0 lg:h-32 lg:max-w-[980px]"
          >
            <svg className="h-full w-full overflow-visible" viewBox="0 0 760 140" fill="none">
              <defs>
                <marker id="process-to-laptop-arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M 0 0 L 10 5 L 0 10 Z" fill="currentColor" fillOpacity="0.8" />
                </marker>
              </defs>
              <path
                d="M 126 18 C 230 72 308 54 380 96 C 452 54 530 72 634 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray="7 10"
                opacity="0.42"
              />
              <path
                d="M 380 24 C 380 52 380 78 380 118"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="8 9"
                markerEnd="url(#process-to-laptop-arrowhead)"
              />
            </svg>
          </div>

          <figure
            data-hero-panel="unified-system"
            className="relative -mx-6 mt-0 w-[calc(100%+3rem)] max-w-none overflow-hidden sm:-mx-12 sm:w-[calc(100%+6rem)] lg:mx-auto lg:max-h-[620px] lg:w-full lg:max-w-[1120px] lg:-mb-24 xl:-mb-32 xl:max-w-[1240px]"
          >
            <figcaption className="relative z-30 mb-2 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-obaol-700/80 dark:text-obaol-300/80 sm:text-xs lg:mb-0 lg:-translate-y-1">
              All execution stages, tracked in one OBAOL workspace.
            </figcaption>
            <div className="pointer-events-none absolute left-1/2 top-[30%] z-10 h-28 w-2/3 -translate-x-1/2 rounded-full bg-obaol-500/18 blur-3xl" />
            <div className="relative z-20 -mx-10 aspect-square w-[calc(100%+5rem)] sm:-mx-14 sm:w-[calc(100%+7rem)] lg:mx-0 lg:w-full lg:-mb-[18%]">
              <Image
                src="/images/order-execution-laptop.png"
                alt="OBAOL laptop workspace showing all agro trade execution stages tracked in one platform."
                fill
                sizes="(max-width: 1023px) calc(100vw + 7rem), 1120px"
                className="object-contain opacity-90 drop-shadow-[0_34px_60px_rgba(0,0,0,0.55)]"
              />
            </div>
          </figure>
        </motion.div>
      </motion.div>

      {/* Dynamic Cursor Light Overlay */}
      <motion.div
        className="absolute inset-0 z-40 pointer-events-none"
        style={{
          background: useTransform(
            [smoothMouseX, smoothMouseY],
            ([x, y]) => `radial-gradient(600px circle at calc(50% + ${x}px) calc(50% + ${y}px), rgba(207,152,60,0.07), transparent 45%)`
          )
        }}
      />
    </section>
  );
}
