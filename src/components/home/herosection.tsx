"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AuthContext from "@/context/AuthContext";
import {
  FiShield,
  FiGlobe,
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
} from "react-icons/fi";

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
  icon: React.ReactNode;
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

      {/* BENEFIT TOOLTIP */}
      <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap px-4 py-2 rounded-xl bg-orange-600 text-white text-[10px] font-bold shadow-2xl z-50 ${reverse ? "right-full mr-6" : "left-full ml-6"}`}>
        <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-600 rotate-45 ${reverse ? "-right-1" : "-left-1"}`} />
        {benefit}
      </div>
    </motion.div>
  );
};

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { isAuthenticated, loading } = useContext(AuthContext);
  const [showDesktopVisuals, setShowDesktopVisuals] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [isAgroActive, setIsAgroActive] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

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
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setShowDesktopVisuals(media.matches);
    update();
    media.addEventListener("change", update);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      media.removeEventListener("change", update);
    };
  }, [mouseX, mouseY]);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background"
    >
      {/* ================= BACKGROUND ================= */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 z-0 select-none pointer-events-none"
      >
        <Image
          src="/images/obaol_hero_premium.png"
          alt="Premium Trade Map"
          fill
          priority
          className="object-cover opacity-5 dark:opacity-20 grayscale saturate-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10" />
      </motion.div>

      {/* ECO-GHOST BACKGROUND TEXT */}
      <AnimatePresence>
        {hoveredRole && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none select-none"
          >
            <span className="text-[15vw] font-black uppercase tracking-[0.2em] text-foreground/[0.03] dark:text-foreground/[0.04]">
              {hoveredRole}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Overlay */}
      <motion.div
        animate={{
          opacity: (isSystemActive || isAgroActive || !!hoveredRole) ? 0.25 : 0.08,
          stroke: isAgroActive ? "#10b981" : (isSystemActive ? "#ea580c" : "currentColor")
        }}
        className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"
        style={{
          backgroundImage: `linear-gradient(to right, ${isAgroActive ? "#10b981" : (isSystemActive ? "#ea580c" : "currentColor")} 1px, transparent 1px), linear-gradient(to bottom, ${isAgroActive ? "#10b981" : (isSystemActive ? "#ea580c" : "currentColor")} 1px, transparent 1px)`,
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
              <span>Core_Status: Active</span>
              <span>Nodes_In_Sync: 8/8</span>
              <span>Execution_Engine: v2.0.4-Stable</span>
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
              <span className="text-emerald-500/60 font-black">Trade_Intelligence_Active</span>
              <span>Global_Routes: 4,821 Active</span>
              <span>Market_Volatility: 0.12% Low</span>
              <span>Aggregate_Volume: 2.4M MT</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
              <FiGlobe size={400} className="text-emerald-500" />
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
      {showDesktopVisuals ? (
        <div className="absolute inset-0 z-20 pointer-events-auto overflow-hidden">
          {/* LEFT NODES */}
          <div className="absolute top-[18%] left-[12%]">
            <EcosystemChip icon={<FiShoppingBag size={15} />} label="Procurement" benefit="Sourcing coverage with OBAOL" color="text-orange-500" custom={0} variants={floatingCardVariants} onHover={(active) => setHoveredRole(active ? "SOURCE" : null)} />
          </div>
          <div className="absolute top-[42%] left-[8%]">
            <EcosystemChip icon={<FiTruck size={15} />} label="Logistics" benefit="Global transit with OBAOL" color="text-blue-500" custom={1} variants={floatingCardVariants} onHover={(active) => setHoveredRole(active ? "CARGO" : null)} />
          </div>
          <div className="absolute top-[68%] left-[14%]">
            <EcosystemChip icon={<FiCheckCircle size={15} />} label="Verification" benefit="Trade security with OBAOL" color="text-emerald-500" custom={2} variants={floatingCardVariants} onHover={(active) => setHoveredRole(active ? "SECURE" : null)} />
          </div>
          <div className="absolute top-[88%] left-[10%]">
            <EcosystemChip icon={<FiUser size={15} />} label="Buyer" benefit="Secure better deals with OBAOL" color="text-purple-500" custom={3} variants={floatingCardVariants} onHover={(active) => setHoveredRole(active ? "DEMAND" : null)} />
          </div>

          {/* RIGHT NODES */}
          <div className="absolute top-[12%] right-[14%]">
            <EcosystemChip icon={<FiBox size={15} />} label="Warehouse" benefit="Optimized storage with OBAOL" color="text-orange-500" custom={4} variants={floatingCardVariants} onHover={(active) => setHoveredRole(active ? "STOCK" : null)} reverse />
          </div>
          <div className="absolute top-[38%] right-[10%]">
            <EcosystemChip icon={<FiArchive size={15} />} label="Packaging" benefit="Standardized quality with OBAOL" color="text-pink-500" custom={5} variants={floatingCardVariants} onHover={(active) => setHoveredRole(active ? "PACK" : null)} reverse />
          </div>
          <div className="absolute top-[62%] right-[16%]">
            <EcosystemChip icon={<FiLayers size={15} />} label="Supplier" benefit="Part of the OBAOL grid" color="text-blue-500" custom={6} variants={floatingCardVariants} onHover={(active) => setHoveredRole(active ? "SUPPLY" : null)} reverse />
          </div>
          <div className="absolute top-[84%] right-[12%]">
            <EcosystemChip icon={<FiAperture size={15} />} label="Processor" benefit="Maximize output with OBAOL" color="text-emerald-500" custom={7} variants={floatingCardVariants} onHover={(active) => setHoveredRole(active ? "FINISH" : null)} reverse />
          </div>
        </div>
      ) : (
        /* MOBILE ECOSYSTEM PREVIEW (Tiny floating icons) */
        <div className="absolute inset-0 z-20 pointer-events-none opacity-20">
          <div className="absolute top-[15%] left-[10%]"><FiShoppingBag size={14} className="text-orange-500" /></div>
          <div className="absolute top-[25%] right-[12%]"><FiBox size={14} className="text-orange-500" /></div>
          <div className="absolute top-[75%] left-[15%]"><FiTruck size={14} className="text-blue-500" /></div>
          <div className="absolute top-[85%] right-[8%]"><FiLayers size={14} className="text-blue-500" /></div>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-30 container mx-auto px-6 sm:px-12 py-12 md:py-20 flex flex-col items-center text-center w-full"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-4xl lg:max-w-5xl"
        >
          <div className="space-y-4">
            <motion.p
              variants={itemVariants}
              className="text-[8px] sm:text-xs font-black uppercase tracking-[0.5em] text-orange-500 mb-6 md:mb-8"
            >
              The Go-To Platform for Agro Trade
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="w-fit mx-auto text-3xl sm:text-5xl md:text-7xl lg:text-[clamp(4.2rem,8vw,7rem)] font-black tracking-tighter leading-[0.95] text-foreground cursor-pointer select-none group px-4"
              onMouseEnter={() => setIsSystemActive(true)}
              onMouseLeave={() => setIsSystemActive(false)}
            >
              The Operating <br />
              <span className="italic bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent animate-subtle-glint group-hover:drop-shadow-[0_0_20px_rgba(234,88,12,0.5)] transition-all">
                System
              </span>
            </motion.h1>

            <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 py-2 md:py-4 opacity-30">
              <div className="h-[1px] w-6 md:w-16 bg-foreground" />
              <span className="text-sm md:text-xl font-medium italic">for</span>
              <div className="h-[1px] w-6 md:w-16 bg-foreground" />
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="w-fit mx-auto text-2xl sm:text-4xl md:text-6xl lg:text-[clamp(3.2rem,6vw,5.2rem)] font-black tracking-tighter text-foreground leading-none cursor-pointer select-none group px-4"
              onMouseEnter={() => setIsAgroActive(true)}
              onMouseLeave={() => setIsAgroActive(false)}
            >
              <span className="group-hover:text-emerald-500 transition-colors duration-500">Agro Commodity.</span>
            </motion.h2>
          </div>

          <motion.div
            variants={itemVariants}
            className="mt-8 md:mt-12 max-w-2xl mx-auto space-y-8 md:space-y-12"
          >
            <p className="text-sm sm:text-lg md:text-xl text-foreground/60 font-medium leading-relaxed px-4">
              A professional-grade execution platform connecting every participant
              across the agro-grid. <span className="text-foreground font-bold">Designed to reduce friction.</span>
            </p>

            <div className="flex flex-col items-center gap-8 md:gap-10">
              <button
                onMouseEnter={() => setIsSystemActive(true)}
                onMouseLeave={() => setIsSystemActive(false)}
                onClick={() => {
                  if (loading) return;
                  setIsNavigating(true);
                  router.push(isAuthenticated ? "/dashboard" : "/auth");
                }}
                className="group relative px-6 py-3.5 md:px-10 md:py-5 rounded-[2.5rem] bg-orange-600 hover:bg-orange-700 text-white font-black text-base md:text-xl shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 md:gap-4 border border-orange-400/20"
              >
                {isNavigating ? "Establishing..." : (isAuthenticated ? "Access Workspace" : "Sign In to Access")}
                <FiArrowRight size={20} className="md:size-[24px] group-hover:translate-x-2 transition-transform" />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {!loading && !isAuthenticated && (
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
                  <Link href="/auth/register" className="text-[9px] sm:text-[11px] font-black text-foreground/50 hover:text-orange-500 uppercase tracking-widest transition-colors flex items-center gap-2">
                    Join as Associate
                  </Link>
                  <Link href="/auth/operator/register" className="text-[9px] sm:text-[11px] font-black text-foreground/50 hover:text-orange-500 uppercase tracking-widest transition-colors flex items-center gap-2">
                    Join as Operator
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
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
