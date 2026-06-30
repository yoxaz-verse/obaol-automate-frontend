"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, cloneElement, type ReactElement, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";
import {
  FiShield,
  FiTarget,
  FiZap,
  FiArrowRight,
  FiShoppingBag,
  FiTruck,
  FiCheckCircle,
  FiUser,
  FiBox,
  FiArchive,
  FiBriefcase,
  FiCpu,
  FiLayers,
  FiAperture,
  FiNavigation,
} from "react-icons/fi";
import {
  FaWarehouse,
  FaShip,
  FaBoxOpen,
  FaUserTie,
  FaTruckFast,
  FaClipboardCheck,
  FaEarthAsia,
  FaStore
} from "react-icons/fa6";
import { GiWheat } from "react-icons/gi";

type RoleModuleId =
  | "procurement"
  | "logistics"
  | "verification"
  | "buyer"
  | "warehouse"
  | "packaging"
  | "supplier"
  | "freight";

type RoleKey =
  | "SOURCE"
  | "CARGO"
  | "SECURE"
  | "DEMAND"
  | "STOCK"
  | "PACK"
  | "SUPPLY"
  | "FORWARD";

/* ================= ANIMATION VARIANTS ================= */

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

const floatingCardVariants = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: [0, -10, 0],
    transition: {
      opacity: { duration: 0.8, delay: 0.8 + i * 0.2 },
      scale: { duration: 0.8, delay: 0.8 + i * 0.2 },
      y: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
        delay: i * 0.5
      }
    }
  })
};

const DESKTOP_ROLE_CONNECTOR_ANCHORS = [
  { id: "procurement", side: "left" as const, ringOffsetY: -34 },
  { id: "logistics", side: "left" as const, ringOffsetY: -12 },
  { id: "verification", side: "left" as const, ringOffsetY: 12 },
  { id: "buyer", side: "left" as const, ringOffsetY: 34 },
  { id: "warehouse", side: "right" as const, ringOffsetY: -34 },
  { id: "packaging", side: "right" as const, ringOffsetY: -12 },
  { id: "supplier", side: "right" as const, ringOffsetY: 12 },
  { id: "freight", side: "right" as const, ringOffsetY: 34 },
];

const COMPACT_ROLE_CONNECTOR_ANCHORS = [
  { id: "procurement", side: "left" as const, ringOffsetY: -30 },
  { id: "warehouse", side: "right" as const, ringOffsetY: -18 },
  { id: "logistics", side: "left" as const, ringOffsetY: -6 },
  { id: "packaging", side: "right" as const, ringOffsetY: 6 },
  { id: "verification", side: "left" as const, ringOffsetY: 18 },
  { id: "supplier", side: "right" as const, ringOffsetY: 30 },
  { id: "buyer", side: "left" as const, ringOffsetY: 42 },
  { id: "freight", side: "right" as const, ringOffsetY: 54 },
];

const ROLE_CONTENT: Record<
  RoleModuleId,
  { roleKey: RoleKey; benefitText: string; color: string }
> = {
  procurement: {
    roleKey: "SOURCE",
    benefitText: "Procurement assistance for any trade that needs it.",
    color: "#f97316",
  },
  logistics: {
    roleKey: "CARGO",
    benefitText: "Logistics providers can take the shipment execution.",
    color: "#3b82f6",
  },
  verification: {
    roleKey: "SECURE",
    benefitText: "Verification steps happen across the trade.",
    color: "#10b981",
  },
  buyer: {
    roleKey: "DEMAND",
    benefitText: "Buyer enquiries and orders are transparent step-by-step.",
    color: "#a855f7",
  },
  warehouse: {
    roleKey: "STOCK",
    benefitText: "Book warehouse capacity or list your warehouse.",
    color: "#f97316",
  },
  packaging: {
    roleKey: "PACK",
    benefitText: "Packaging enquiries flow through the execution panel.",
    color: "#ec4899",
  },
  supplier: {
    roleKey: "SUPPLY",
    benefitText: "Suppliers list products and stand out in the market.",
    color: "#3b82f6",
  },
  freight: {
    roleKey: "FORWARD",
    benefitText: "Bid the freight forwarding part of execution.",
    color: "#84cc16",
  },
};

const HOVER_TIMING = {
  blend: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  textSwap: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  cardUiClass: "duration-700",
};

const FLOW_TIMING = {
  activeDuration: 2.4,
  idleDuration: 4.2,
};

const COMPACT_HUB_TOP = "12%";
const COMPACT_ROW_OFFSET = {
  left: "mr-7 sm:mr-10",
  right: "ml-7 sm:ml-10",
};

/* ================= HELPER COMPONENTS ================= */

const EcosystemChip = ({
  icon,
  label,
  benefit,
  color,
  custom,
  variants,
  onHover,
  reverse = false
}: {
  icon: ReactNode;
  label: string;
  benefit: string;
  color: string;
  custom: number;
  variants: any;
  onHover: (active: boolean) => void;
  reverse?: boolean;
}) => {
  return (
    <motion.div
      custom={custom}
      variants={variants}
      initial="initial"
      animate="animate"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`group relative flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-content1/40 backdrop-blur-xl border border-default-200 shadow-xl transition-all duration-500 hover:scale-110 hover:bg-content1/60 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(234,88,12,0.3)] cursor-help ${reverse ? "flex-row-reverse" : ""}`}
    >
      <div className={`${color} transition-transform group-hover:scale-125 duration-500`}>
        {icon}
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
        {label}
      </span>

    </motion.div>
  );
};

const RoleCard = ({
  icon,
  label,
  color,
  custom,
  onHover,
  isActive,
  align = "left",
  anchorId,
  compact = false,
}: {
  icon: ReactNode;
  label: string;
  color: string;
  custom: number;
  onHover: (active: boolean) => void;
  isActive?: boolean;
  align?: "left" | "right";
  anchorId: string;
  compact?: boolean;
}) => {
  const anchorSide = align === "right" ? "right" : "left";
  return (
    <motion.div
      custom={custom}
      variants={itemVariants}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] backdrop-blur-md border transition-all ${HOVER_TIMING.cardUiClass} cursor-pointer w-full ${compact ? "max-w-[240px]" : "max-w-[180px]"} ${align === "right" ? "flex-row-reverse text-right" : ""} ${isActive ? "border-white/40 bg-white/[0.12] shadow-[0_0_25px_rgba(255,255,255,0.12)]" : "border-white/10 hover:border-white/30 hover:bg-white/[0.08] hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]"}`}
    >
      <div className={`w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center ${color} transition-all group-hover:scale-110 ${HOVER_TIMING.cardUiClass} group-hover:bg-white/10`}>
        {cloneElement(icon as ReactElement, { size: 16 })}
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-foreground truncate">
          {label}
        </span>
      </div>
      
      {isActive && (
        <motion.div
          layoutId="active-glow-node"
          className="absolute inset-0 rounded-2xl bg-orange-500/[0.02] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={HOVER_TIMING.blend}
        />
      )}
      <span
        data-role-anchor={anchorId}
        data-anchor-side={anchorSide}
        className={`absolute top-1/2 -translate-y-1/2 w-1 h-1 pointer-events-none ${anchorSide === "right" ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"}`}
      />
    </motion.div>
  );
};

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isAuthenticated, loading } = usePublicAuthStatus();
  const [showDesktopVisuals, setShowDesktopVisuals] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [isAgroActive, setIsAgroActive] = useState(false);
  const [activeRoleKey, setActiveRoleKey] = useState<RoleKey | null>(null);
  const [activeConnectorId, setActiveConnectorId] = useState<RoleModuleId | null>(null);
  const [connectorPaths, setConnectorPaths] = useState<Array<{ id: string; d: string }>>([]);
  const [networkSize, setNetworkSize] = useState({ width: 600, height: 600 });
  const [viewportWidth, setViewportWidth] = useState(1440);

  // DYNAMIC STATE FOR HEADLINE SYNC
  const [dynamicText, setDynamicText] = useState<{ text: string, isHeadline: boolean }>({ text: "B2B Agro Trade.", isHeadline: true });
  const [gridColor, setGridColor] = useState("currentColor");
  const activeRoleRef = useRef<RoleModuleId | null>(null);

  const handleRoleHover = (moduleId: RoleModuleId, active: boolean) => {
    if (active) {
      activeRoleRef.current = moduleId;
      setActiveConnectorId(moduleId);
      setActiveRoleKey(ROLE_CONTENT[moduleId].roleKey);
      setDynamicText({ text: ROLE_CONTENT[moduleId].benefitText, isHeadline: false });
      setGridColor(ROLE_CONTENT[moduleId].color);
      return;
    }

    // Avoid stale mouseleave resets when quickly moving between cards.
    if (activeRoleRef.current === moduleId) {
      activeRoleRef.current = null;
      setActiveConnectorId(null);
      setActiveRoleKey(null);
      setDynamicText({ text: "B2B Agro Trade.", isHeadline: true });
      setGridColor("currentColor");
    }
  };

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
    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    const mobileMedia = window.matchMedia("(max-width: 768px)");

    const update = () => {
      setShowDesktopVisuals(desktopMedia.matches);
      setIsMobile(mobileMedia.matches);
    };

    update();
    desktopMedia.addEventListener("change", update);
    mobileMedia.addEventListener("change", update);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      desktopMedia.removeEventListener("change", update);
      mobileMedia.removeEventListener("change", update);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const hubLayout = {
    width: 600,
    height: 600,
    centerX: 332,
    centerY: 300,
    coreRadius: 48,
  };
  const isCompactNetwork = viewportWidth < 1024;
  const activeConnectorAnchors = isCompactNetwork
    ? COMPACT_ROLE_CONNECTOR_ANCHORS
    : DESKTOP_ROLE_CONNECTOR_ANCHORS;

  useEffect(() => {
    let rafId = 0;
    const updateConnectorPaths = () => {
      if (!networkRef.current || !hubRef.current) return;

      const containerRect = networkRef.current.getBoundingClientRect();
      const hubRect = hubRef.current.getBoundingClientRect();
      setNetworkSize({ width: containerRect.width, height: containerRect.height });
      const centerX = hubRect.left - containerRect.left + (hubRect.width / 2);
      const centerY = hubRect.top - containerRect.top + (hubRect.height / 2);
      const radius = hubRect.width / 2;

      const nextPaths = activeConnectorAnchors.map((anchor) => {
        const marker = networkRef.current?.querySelector(`[data-role-anchor="${anchor.id}"]`) as HTMLElement | null;
        if (!marker) return { id: anchor.id, d: "" };

        const markerRect = marker.getBoundingClientRect();
        const startX = markerRect.left - containerRect.left + (markerRect.width / 2);
        const startY = markerRect.top - containerRect.top + (markerRect.height / 2);

        const endY = centerY + anchor.ringOffsetY;
        const safeYOffset = Math.min(Math.abs(anchor.ringOffsetY), radius - 1);
        const endXOffset = Math.sqrt(Math.max((radius * radius) - (safeYOffset * safeYOffset), 0));
        const endX = anchor.side === "left" ? centerX - endXOffset : centerX + endXOffset;
        const horizontalSpan = Math.abs(endX - startX);
        const tensionCap = viewportWidth < 640 ? 48 : viewportWidth < 1024 ? 66 : 120;
        const tension = Math.min(Math.max(horizontalSpan * (isCompactNetwork ? 0.28 : 0.36), isCompactNetwork ? 28 : 42), tensionCap);
        const startCtrlX = anchor.side === "left" ? startX + tension : startX - tension;
        const endCtrlX = anchor.side === "left" ? endX - Math.min(tension * 0.5, 52) : endX + Math.min(tension * 0.5, 52);
        const d = `M ${startX} ${startY} C ${startCtrlX} ${startY}, ${endCtrlX} ${endY}, ${endX} ${endY}`;
        return { id: anchor.id, d };
      }).filter((path) => path.d);

      setConnectorPaths(nextPaths);
    };

    const scheduleRecompute = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateConnectorPaths);
    };

    scheduleRecompute();
    window.addEventListener("resize", scheduleRecompute);
    const resizeObserver = new ResizeObserver(scheduleRecompute);
    if (networkRef.current) resizeObserver.observe(networkRef.current);
    if (hubRef.current) resizeObserver.observe(hubRef.current);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", scheduleRecompute);
      resizeObserver.disconnect();
    };
  }, [viewportWidth, activeConnectorAnchors, isCompactNetwork]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[85vh] lg:h-[800px] flex flex-col items-center justify-center overflow-hidden bg-background pt-20"
    >
      {/* ================= BACKGROUND ================= */}
      <motion.div
        className="absolute inset-0 z-0 select-none pointer-events-none"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80 z-10" />
      </motion.div>

      {/* ECO-GHOST BACKGROUND TEXT */}
      <AnimatePresence>
        {activeRoleKey && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none select-none"
          >
            <span className="text-[15vw] font-black uppercase tracking-[0.2em] text-foreground/[0.03] dark:text-foreground/[0.04]">
              {activeRoleKey}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Overlay */}
      <motion.div
        initial={{ opacity: 0.08 }}
        animate={{
          opacity: (isSystemActive || isAgroActive || !!activeRoleKey) ? 0.25 : 0.08,
        }}
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-1000 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"
        style={{
          backgroundImage: `linear-gradient(to right, ${isAgroActive ? "#10b981" : (isSystemActive ? "#ea580c" : gridColor)} 1px, transparent 1px), linear-gradient(to bottom, ${isAgroActive ? "#10b981" : (isSystemActive ? "#ea580c" : gridColor)} 1px, transparent 1px)`,
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
              className="absolute left-0 right-0 h-[1px] bg-orange-500/50 shadow-[0_0_15px_rgba(234,88,12,0.8)] z-20"
            />
            <div className="absolute top-10 right-10 flex flex-col items-end gap-1 font-mono text-[9px] text-orange-500/40 uppercase tracking-tighter">
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
            <div className="absolute top-10 left-10 flex flex-col items-start gap-1 font-mono text-[9px] text-emerald-500/40 uppercase tracking-tighter">
              <span className="text-emerald-500/60 font-black">Trade workflow</span>
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
            stroke={isAgroActive ? "#10b981" : "currentColor"} strokeWidth={isAgroActive ? "1" : "0.5"} fill="none" strokeDasharray="4 4"
          />
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 4, delay: 1, repeat: Infinity, repeatType: "reverse" }}
            d="M 88% 15% Q 70% 35% 55% 50% T 12% 85%"
            stroke={isAgroActive ? "#10b981" : "currentColor"} strokeWidth={isAgroActive ? "1" : "0.5"} fill="none" strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* ================= ECOSYSTEM NODES ================= */}
      {/* Removed absolute positioned nodes to consolidate them in the main content flow */}

      {/* ================= MAIN CONTENT ================= */}
      <motion.div
        className="relative z-30 container mx-auto px-6 sm:px-12 py-12 md:py-20 flex flex-col items-start text-left w-full"
      >
        <motion.div
          initial={isMobile ? false : "hidden"}
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-6xl xl:max-w-7xl"
        >
          <div className="space-y-4 lg:space-y-5">
            <motion.p
              variants={itemVariants}
              className="text-[8px] sm:text-xs font-black uppercase tracking-[0.45em] text-orange-500 mb-2"
            >
              The Agro Execution System for Agro Trade
            </motion.p>

            <div className="w-full lg:grid lg:grid-cols-2 lg:items-center gap-8 lg:gap-10 xl:gap-12">
              <div className="w-full space-y-6 lg:space-y-7 lg:pr-3">
                <motion.h1
                  initial={isMobile ? false : "hidden"}
                  animate="visible"
                  variants={itemVariants}
                  className="inline-block w-max max-w-none overflow-visible pr-8 pb-1 text-4xl sm:text-5xl md:text-6xl lg:text-[clamp(3rem,5vw,4.5rem)] font-black tracking-[-0.04em] leading-[1.08] text-foreground cursor-pointer select-none group"
                  onMouseEnter={() => setIsSystemActive(true)}
                  onMouseLeave={() => setIsSystemActive(false)}
                >
                  The Execution <br />
                  <span className={`inline-block pr-[0.12em] italic bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent ${!isMobile ? "animate-subtle-glint" : ""} group-hover:drop-shadow-[0_0_20px_rgba(234,88,12,0.5)] transition-all`}>
                    Ecosystem
                  </span>
                </motion.h1>

                <motion.div variants={itemVariants} className="flex items-center gap-3 opacity-30">
                  <span className="text-xs md:text-lg font-medium italic">for</span>
                  <div className="h-[1px] w-20 md:w-28 bg-foreground" />
                </motion.div>

                <motion.h2
                  initial={isMobile ? false : "hidden"}
                  animate="visible"
                  variants={itemVariants}
                  className="w-full relative flex flex-col items-start justify-center text-2xl sm:text-4xl md:text-5xl lg:text-[clamp(1.5rem,3.5vw,3rem)] font-black tracking-[-0.02em] text-foreground leading-[1.1] cursor-pointer select-none group min-h-[68px] md:min-h-[92px] overflow-visible py-1"
                  onMouseEnter={() => setIsAgroActive(true)}
                  onMouseLeave={() => setIsAgroActive(false)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={dynamicText.text}
                      initial={isMobile ? false : { y: 12, opacity: 0, filter: "blur(8px)" }}
                      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                      exit={{ y: -12, opacity: 0, filter: "blur(8px)" }}
                      transition={HOVER_TIMING.textSwap}
                      className="absolute inset-0 flex flex-col items-start justify-center pointer-events-none"
                    >
                      <span className={`transition-all duration-700 ease-out text-left w-full ${isAgroActive
                        ? "text-emerald-500 scale-105"
                        : (dynamicText.isHeadline
                          ? "text-foreground"
                          : `text-foreground/80 italic font-semibold ${!isMobile ? "animate-typewriter" : ""} text-base sm:text-lg md:text-xl lg:text-2xl leading-snug max-w-2xl`)
                        }`}>
                        {dynamicText.text}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </motion.h2>

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
                      className="group relative px-6 py-3 md:px-9 md:py-4 rounded-[2rem] bg-orange-600 hover:bg-orange-700 text-white font-black text-base md:text-xl shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 md:gap-3 border border-orange-400/20"
                    >
                      {isNavigating ? "Opening..." : (isAuthenticated ? "Open workspace" : "Get started")}
                      <FiArrowRight size={20} className="md:size-6 group-hover:translate-x-2 transition-transform" />
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {!loading && !isAuthenticated && (
                      <div className="flex flex-wrap items-center gap-6 md:gap-10">
                        <Link href="/auth/register?intent=BUY" className="text-[10px] sm:text-[12px] font-black text-foreground/50 hover:text-orange-500 uppercase tracking-[0.2em] transition-colors flex items-center gap-2">
                          Start buying
                        </Link>
                        <Link href="/auth/register?intent=SELL" className="text-[10px] sm:text-[12px] font-black text-foreground/50 hover:text-orange-500 uppercase tracking-[0.2em] transition-colors flex items-center gap-2">
                          Start selling
                        </Link>
                        <Link href="/auth/operator/register" className="text-[10px] sm:text-[12px] font-black text-foreground/50 hover:text-orange-500 uppercase tracking-[0.2em] transition-colors flex items-center gap-2">
                          Work in operations
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Consolidated Ecosystem Nodes Hub - Final High Fidelity Design */}
              <motion.div 
                variants={itemVariants}
                className="w-full relative mt-3 lg:mt-0 group/network min-h-[560px] sm:min-h-[620px] lg:min-h-[500px] flex items-start lg:items-center justify-center lg:translate-x-5 xl:translate-x-8"
                ref={networkRef}
              >
                {/* CENTRAL HUB ENGINE */}
                <div
                  className="absolute z-20"
                  style={{
                    left: isCompactNetwork ? "50%" : `${(hubLayout.centerX / hubLayout.width) * 100}%`,
                    top: isCompactNetwork ? COMPACT_HUB_TOP : `${(hubLayout.centerY / hubLayout.height) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  ref={hubRef}
                >
                  <div className="relative w-[84px] h-[84px] sm:w-[100px] sm:h-[100px] lg:w-24 lg:h-24">
                    {/* Core Hub */}
                    <motion.div 
                      className="relative w-full h-full rounded-full bg-background border-2 border-orange-500/80 flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.3)] z-10 overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/30 to-transparent" />
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black tracking-[0.3em] text-orange-500 leading-none">OBAOL</span>
                        <div className="w-8 h-[1.5px] bg-orange-500 my-1.5 shadow-[0_0_12px_rgba(234,88,12,1)]" />
                        <span className="text-[7px] font-bold text-foreground/70 dark:text-white/65 tracking-[0.25em] leading-none">ENGINE</span>
                      </div>
                    </motion.div>
                    
                  </div>
                </div>

                {/* Connection Lines (Bezier S-Curves) */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-100">
                  <svg className="w-full h-full" viewBox={`0 0 ${networkSize.width} ${networkSize.height}`} preserveAspectRatio="none">
                    <defs>
                      <filter id="hub-glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="hub-flow-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {connectorPaths.map((path, i) => (
                      <motion.g key={path.id}>
                        {(() => {
                          const isActivePath = activeConnectorId === path.id;
                          const connectorColor = isAgroActive ? "#10b981" : isSystemActive ? "#ea580c" : "#f97316";
                          const activeLineOpacity = isActivePath ? 1 : 0;
                          return (
                            <>
                              <motion.path
                                d={path.d}
                                stroke={connectorColor}
                                animate={{
                                  strokeWidth: isCompactNetwork ? (isActivePath ? 3.3 : 2.4) : (isActivePath ? 4.2 : 3.2),
                                  strokeOpacity: isCompactNetwork ? (isActivePath ? 0.2 : 0.14) : (isActivePath ? 0.26 : 0.18),
                                  opacity: activeLineOpacity,
                                }}
                                fill="none"
                                strokeLinecap="round"
                                filter="url(#hub-glow)"
                                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                              />
                              <motion.path
                                d={path.d}
                                stroke={connectorColor}
                                animate={{
                                  strokeWidth: isCompactNetwork ? (isActivePath ? 1.95 : 1.45) : (isActivePath ? 2.35 : 1.85),
                                  strokeOpacity: isCompactNetwork ? (isActivePath ? 0.72 : 0.46) : (isActivePath ? 0.88 : 0.58),
                                  opacity: activeLineOpacity,
                                }}
                                fill="none"
                                strokeLinecap="round"
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              />
                              <motion.path
                                d={path.d}
                                stroke={connectorColor}
                                animate={{
                                  strokeDashoffset: isActivePath ? [-300, 0] : [-220, 0],
                                  opacity: isCompactNetwork
                                    ? (isActivePath ? [0.34, 0.62, 0.34] : [0.1, 0.26, 0.1])
                                    : (isActivePath ? [0.45, 0.9, 0.45] : [0.14, 0.4, 0.14]),
                                  strokeWidth: isCompactNetwork ? (isActivePath ? 2.75 : 1.95) : (isActivePath ? 3.45 : 2.35),
                                  strokeOpacity: isCompactNetwork ? (isActivePath ? 0.72 : 0.48) : (isActivePath ? 0.9 : 0.62),
                                }}
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={isActivePath ? "18 126" : "12 138"}
                                filter="url(#hub-flow-glow)"
                                transition={{
                                  duration: isActivePath ? FLOW_TIMING.activeDuration : FLOW_TIMING.idleDuration,
                                  repeat: Infinity,
                                  ease: "linear",
                                  delay: i * 0.16,
                                }}
                                style={{ opacity: activeLineOpacity }}
                              />
                            </>
                          );
                        })()}
                      </motion.g>
                    ))}
                  </svg>
                </div>

                {/* ROLE MODULES GRID */}
                {!isCompactNetwork && (
                <div className="relative z-30 w-full grid grid-cols-2 gap-x-14 sm:gap-x-24 md:gap-x-36 lg:gap-x-56 gap-y-7 sm:gap-y-9 lg:gap-y-12">
                  {/* LEFT COLUMN */}
                  <div className="space-y-10 lg:space-y-12 flex flex-col items-start">
                    <RoleCard icon={<GiWheat size={18} />} label="Procurement" color="text-orange-500" custom={0} onHover={(active) => handleRoleHover("procurement", active)} isActive={activeRoleKey === ROLE_CONTENT.procurement.roleKey} align="right" anchorId="procurement" />
                    <RoleCard icon={<FaTruckFast size={18} />} label="Logistics" color="text-blue-500" custom={2} onHover={(active) => handleRoleHover("logistics", active)} isActive={activeRoleKey === ROLE_CONTENT.logistics.roleKey} align="right" anchorId="logistics" />
                    <RoleCard icon={<FaClipboardCheck size={18} />} label="Verification" color="text-emerald-500" custom={4} onHover={(active) => handleRoleHover("verification", active)} isActive={activeRoleKey === ROLE_CONTENT.verification.roleKey} align="right" anchorId="verification" />
                    <RoleCard icon={<FaUserTie size={18} />} label="Buyer" color="text-purple-500" custom={6} onHover={(active) => handleRoleHover("buyer", active)} isActive={activeRoleKey === ROLE_CONTENT.buyer.roleKey} align="right" anchorId="buyer" />
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-10 lg:space-y-12 flex flex-col items-end">
                    <RoleCard icon={<FaWarehouse size={18} />} label="Warehouse" color="text-orange-500" custom={1} onHover={(active) => handleRoleHover("warehouse", active)} isActive={activeRoleKey === ROLE_CONTENT.warehouse.roleKey} anchorId="warehouse" />
                    <RoleCard icon={<FaBoxOpen size={18} />} label="Packaging" color="text-pink-500" custom={3} onHover={(active) => handleRoleHover("packaging", active)} isActive={activeRoleKey === ROLE_CONTENT.packaging.roleKey} anchorId="packaging" />
                    <RoleCard icon={<FaStore size={18} />} label="Supplier" color="text-blue-500" custom={5} onHover={(active) => handleRoleHover("supplier", active)} isActive={activeRoleKey === ROLE_CONTENT.supplier.roleKey} anchorId="supplier" />
                    <RoleCard icon={<FaShip size={18} />} label="Freight" color="text-lime-500" custom={7} onHover={(active) => handleRoleHover("freight", active)} isActive={activeRoleKey === ROLE_CONTENT.freight.roleKey} anchorId="freight" />
                  </div>
                </div>
                )}

                {isCompactNetwork && (
                  <div className="relative z-30 w-full pt-[170px] sm:pt-[190px] flex flex-col items-center gap-4 sm:gap-5">
                    <div className={`w-full flex justify-center ${COMPACT_ROW_OFFSET.right}`}>
                      <RoleCard icon={<GiWheat size={18} />} label="Procurement" color="text-orange-500" custom={0} onHover={(active) => handleRoleHover("procurement", active)} isActive={activeRoleKey === ROLE_CONTENT.procurement.roleKey} align="right" anchorId="procurement" compact />
                    </div>
                    <div className={`w-full flex justify-center ${COMPACT_ROW_OFFSET.left}`}>
                      <RoleCard icon={<FaWarehouse size={18} />} label="Warehouse" color="text-orange-500" custom={1} onHover={(active) => handleRoleHover("warehouse", active)} isActive={activeRoleKey === ROLE_CONTENT.warehouse.roleKey} align="left" anchorId="warehouse" compact />
                    </div>
                    <div className={`w-full flex justify-center ${COMPACT_ROW_OFFSET.right}`}>
                      <RoleCard icon={<FaTruckFast size={18} />} label="Logistics" color="text-blue-500" custom={2} onHover={(active) => handleRoleHover("logistics", active)} isActive={activeRoleKey === ROLE_CONTENT.logistics.roleKey} align="right" anchorId="logistics" compact />
                    </div>
                    <div className={`w-full flex justify-center ${COMPACT_ROW_OFFSET.left}`}>
                      <RoleCard icon={<FaBoxOpen size={18} />} label="Packaging" color="text-pink-500" custom={3} onHover={(active) => handleRoleHover("packaging", active)} isActive={activeRoleKey === ROLE_CONTENT.packaging.roleKey} align="left" anchorId="packaging" compact />
                    </div>
                    <div className={`w-full flex justify-center ${COMPACT_ROW_OFFSET.right}`}>
                      <RoleCard icon={<FaClipboardCheck size={18} />} label="Verification" color="text-emerald-500" custom={4} onHover={(active) => handleRoleHover("verification", active)} isActive={activeRoleKey === ROLE_CONTENT.verification.roleKey} align="right" anchorId="verification" compact />
                    </div>
                    <div className={`w-full flex justify-center ${COMPACT_ROW_OFFSET.left}`}>
                      <RoleCard icon={<FaStore size={18} />} label="Supplier" color="text-blue-500" custom={5} onHover={(active) => handleRoleHover("supplier", active)} isActive={activeRoleKey === ROLE_CONTENT.supplier.roleKey} align="left" anchorId="supplier" compact />
                    </div>
                    <div className={`w-full flex justify-center ${COMPACT_ROW_OFFSET.right}`}>
                      <RoleCard icon={<FaUserTie size={18} />} label="Buyer" color="text-purple-500" custom={6} onHover={(active) => handleRoleHover("buyer", active)} isActive={activeRoleKey === ROLE_CONTENT.buyer.roleKey} align="right" anchorId="buyer" compact />
                    </div>
                    <div className={`w-full flex justify-center ${COMPACT_ROW_OFFSET.left}`}>
                      <RoleCard icon={<FaShip size={18} />} label="Freight" color="text-lime-500" custom={7} onHover={(active) => handleRoleHover("freight", active)} isActive={activeRoleKey === ROLE_CONTENT.freight.roleKey} align="left" anchorId="freight" compact />
                    </div>
                  </div>
                )}

                {/* HUD HUD Technical Details Overlay */}
                <div className="absolute top-0 right-0 p-4 border-r border-t border-white/5 rounded-tr-3xl pointer-events-none opacity-20">
                  <div className="text-[7px] font-mono flex flex-col gap-1 tracking-tighter">
                    <span>DISCOVER PRODUCTS</span>
                    <span>VERIFY MILESTONES</span>
                    <span>TRACK EXECUTION</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Dynamic Cursor Light Overlay */}
      <motion.div
        className="absolute inset-0 z-40 pointer-events-none"
        style={{
          background: useTransform(
            [smoothMouseX, smoothMouseY],
            ([x, y]) => `radial-gradient(600px circle at calc(50% + ${x}px) calc(50% + ${y}px), ${isAgroActive ? "rgba(16,185,129,0.06)" : "rgba(249,115,22,0.06)"}, transparent 45%)`
          )
        }}
      />
    </section>
  );
}
