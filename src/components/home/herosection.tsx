"use client";

import Link from "next/link";
import { motion, useTransform, useMotionValue, useSpring, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";
import { FiArrowRight } from "react-icons/fi";

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

const HERO_SERVICES = [
  {
    id: "sourcing",
    message: "Find the right product and origin.",
    color: "#a78bfa",
  },
  {
    id: "documentation",
    message: "Plan documents and trade execution.",
    color: "#60a5fa",
  },
  {
    id: "procurement",
    message: "Get on-ground procurement assistance.",
    color: "#fb923c",
  },
  {
    id: "quality",
    message: "Verify quality before shipment.",
    color: "#34d399",
  },
  {
    id: "packaging",
    message: "Prepare export-ready packaging.",
    color: "#fb7185",
  },
  {
    id: "logistics",
    message: "Coordinate with inland logistics providers.",
    color: "#38bdf8",
  },
  {
    id: "warehouse",
    message: "Book and manage warehouse capacity.",
    color: "#f59e0b",
  },
  {
    id: "freight",
    message: "Move shipments with freight partners.",
    color: "#84cc16",
  },
] as const;

type CollageTile = {
  id: string;
  image?: string;
  frame?: true;
  left: number;
  top: number;
  width: number;
  aspectRatio: number;
  rotation: number;
  zIndex: number;
  delay: number;
  drift: number;
  duration: number;
  matte?: true;
  objectPosition?: string;
};

const DESKTOP_COLLAGE_TILES: CollageTile[] = [
  { id: "field", image: "/images/hero-collage/sourcing.webp", left: 43, top: 0, width: 16, aspectRatio: 1.05, rotation: -2, zIndex: 1, delay: 0.05, drift: 7, duration: 8.4, objectPosition: "center 45%" },
  { id: "documentation", image: "/images/hero-collage/documentation.webp", left: 24, top: 10, width: 22, aspectRatio: 1.02, rotation: -7, zIndex: 3, delay: 0.12, drift: 10, duration: 9.2, matte: true, objectPosition: "center 52%" },
  { id: "quality", image: "/images/hero-collage/quality.webp", left: 61, top: 11, width: 20, aspectRatio: 1, rotation: 6, zIndex: 3, delay: 0.19, drift: 8, duration: 8.7, objectPosition: "center 44%" },
  { id: "frame-top", frame: true, left: 82, top: 23, width: 11, aspectRatio: 1, rotation: 11, zIndex: 2, delay: 0.26, drift: 6, duration: 9.8 },
  { id: "sourcing", image: "/images/services/sourcing-india.webp", left: 8, top: 31, width: 22, aspectRatio: 0.88, rotation: -8, zIndex: 4, delay: 0.31, drift: 9, duration: 8.9, objectPosition: "center 42%" },
  { id: "procurement", image: "/images/hero-collage/procurement.webp", left: 35, top: 25, width: 31, aspectRatio: 0.82, rotation: -1, zIndex: 6, delay: 0.08, drift: 12, duration: 10.2, matte: true, objectPosition: "34% center" },
  { id: "packaging", image: "/images/hero-collage/packaging.webp", left: 70, top: 33, width: 21, aspectRatio: 0.9, rotation: 7, zIndex: 4, delay: 0.36, drift: 9, duration: 9.5, objectPosition: "center 48%" },
  { id: "frame-left", frame: true, left: 0, top: 51, width: 12, aspectRatio: 1, rotation: -12, zIndex: 2, delay: 0.42, drift: 6, duration: 10.4 },
  { id: "lab-documentary", image: "/images/services/quality-india.webp", left: 17, top: 63, width: 18, aspectRatio: 1, rotation: -5, zIndex: 3, delay: 0.47, drift: 8, duration: 9.7, matte: true, objectPosition: "center 45%" },
  { id: "warehouse", image: "/images/hero-collage/warehouse.webp", left: 38, top: 74, width: 21, aspectRatio: 1.35, rotation: 3, zIndex: 3, delay: 0.52, drift: 7, duration: 8.8, objectPosition: "center 44%" },
  { id: "logistics", image: "/images/hero-collage/logistics.webp", left: 60, top: 67, width: 22, aspectRatio: 1.14, rotation: -4, zIndex: 4, delay: 0.57, drift: 10, duration: 10.6, objectPosition: "center 43%" },
  { id: "freight", image: "/images/hero-collage/freight.webp", left: 81, top: 51, width: 19, aspectRatio: 0.9, rotation: 9, zIndex: 3, delay: 0.62, drift: 8, duration: 9.4, objectPosition: "center 42%" },
  { id: "port-documentary", image: "/images/services/logistics-india.webp", left: 83, top: 79, width: 15, aspectRatio: 1.2, rotation: 5, zIndex: 2, delay: 0.67, drift: 6, duration: 10.8, objectPosition: "center 55%" },
];

const MOBILE_COLLAGE_TILES: CollageTile[] = [
  { id: "mobile-sourcing", image: "/images/hero-collage/sourcing.webp", left: 2, top: 4, width: 29, aspectRatio: 1, rotation: -8, zIndex: 3, delay: 0.12, drift: 6, duration: 8.8, objectPosition: "center 45%" },
  { id: "mobile-procurement", image: "/images/hero-collage/procurement.webp", left: 29, top: 13, width: 43, aspectRatio: 0.88, rotation: -1, zIndex: 5, delay: 0.05, drift: 8, duration: 9.8, matte: true, objectPosition: "34% center" },
  { id: "mobile-frame", frame: true, left: 76, top: 5, width: 20, aspectRatio: 1, rotation: 9, zIndex: 2, delay: 0.2, drift: 5, duration: 10.2 },
  { id: "mobile-logistics", image: "/images/hero-collage/logistics.webp", left: 5, top: 58, width: 31, aspectRatio: 1.05, rotation: 5, zIndex: 3, delay: 0.28, drift: 7, duration: 9.4, objectPosition: "center 43%" },
  { id: "mobile-freight", image: "/images/hero-collage/freight.webp", left: 67, top: 55, width: 30, aspectRatio: 0.94, rotation: 8, zIndex: 3, delay: 0.34, drift: 6, duration: 10.5, objectPosition: "center 42%" },
];

function EditorialCollageTile({
  tile,
  prefersReducedMotion,
  sizes,
}: {
  tile: CollageTile;
  prefersReducedMotion: boolean | null;
  sizes: string;
}) {
  const staticState = {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: tile.rotation,
  };

  return (
    <motion.div
      aria-hidden="true"
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.82, y: 24, rotate: tile.rotation - 3 }}
      animate={prefersReducedMotion ? staticState : {
        opacity: 1,
        scale: 1,
        y: [0, -tile.drift, 0],
        rotate: [tile.rotation, tile.rotation + 1.2, tile.rotation],
      }}
      transition={prefersReducedMotion ? { duration: 0 } : {
        opacity: { duration: 0.75, delay: tile.delay },
        scale: { duration: 0.85, delay: tile.delay, ease: [0.22, 1, 0.36, 1] },
        y: { duration: tile.duration, delay: tile.delay, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: tile.duration * 1.35, delay: tile.delay, repeat: Infinity, ease: "easeInOut" },
      }}
      className={`absolute overflow-hidden rounded-[1.15rem] border shadow-[0_24px_50px_-24px_rgba(0,0,0,0.8)] sm:rounded-[1.6rem] ${
        tile.frame
          ? "border-white/75 bg-[linear-gradient(145deg,#fffaf0_0%,#e8ded0_100%)] shadow-[0_22px_45px_-22px_rgba(255,247,229,0.55)]"
          : tile.matte
            ? "border-white/80 bg-[#f4eee4] p-1.5 sm:p-2"
            : "border-white/20 bg-black"
      }`}
      style={{
        left: `${tile.left}%`,
        top: `${tile.top}%`,
        width: `${tile.width}%`,
        aspectRatio: tile.aspectRatio,
        zIndex: tile.zIndex,
      }}
    >
      {tile.frame ? (
        <div className="relative h-full w-full overflow-hidden">
          <div className="absolute -right-[28%] -top-[28%] h-[70%] w-[70%] rounded-full border border-orange-400/35" />
          <div className="absolute left-[18%] top-[18%] h-2.5 w-2.5 rotate-45 bg-orange-500 shadow-[0_0_16px_rgba(249,115,22,0.45)] sm:h-3 sm:w-3" />
          <div className="absolute bottom-[20%] left-[18%] right-[18%] space-y-1.5">
            <div className="h-px w-full bg-stone-700/25" />
            <div className="h-px w-2/3 bg-stone-700/18" />
          </div>
        </div>
      ) : (
        <div className="relative h-full w-full overflow-hidden rounded-[0.85rem] sm:rounded-[1.15rem]">
          <Image
            src={tile.image!}
            alt=""
            fill
            sizes={sizes}
            className="object-cover"
            style={{ objectPosition: tile.objectPosition ?? "center" }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10" />
        </div>
      )}
    </motion.div>
  );
}

const HOVER_TIMING = {
  textSwap: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

const HERO_ROTATION_INTERVAL = 3500;

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
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
  const collageX = useTransform(smoothMouseX, [-30, 30], [-6, 6]);
  const collageY = useTransform(smoothMouseY, [-30, 30], [-4, 4]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 30;
      const moveY = (clientY - window.innerHeight / 2) / 30;
      mouseX.set(moveX);
      mouseY.set(moveY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    const mobileMedia = window.matchMedia("(max-width: 768px)");

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

      {/* Grid Overlay */}
      <motion.div
        initial={{ opacity: 0.08 }}
        animate={{
          opacity: (isSystemActive || isAgroActive) ? 0.25 : 0.08,
        }}
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-1000 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"
        style={{
          backgroundImage: `linear-gradient(to right, ${isAgroActive ? "#10b981" : (isSystemActive ? "#ea580c" : activeService.color)} 1px, transparent 1px), linear-gradient(to bottom, ${isAgroActive ? "#10b981" : (isSystemActive ? "#ea580c" : activeService.color)} 1px, transparent 1px)`,
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

                <motion.div
                  initial={isMobile ? false : "hidden"}
                  animate="visible"
                  variants={itemVariants}
                  className="w-full py-1"
                  onMouseEnter={() => setIsAgroActive(true)}
                  onMouseLeave={() => setIsAgroActive(false)}
                >
                  <h2 className={`text-2xl sm:text-4xl md:text-5xl lg:text-[clamp(1.5rem,3.5vw,3rem)] font-black tracking-[-0.02em] leading-[1.1] text-foreground transition-all duration-500 ${isAgroActive ? "text-emerald-500 lg:scale-[1.02] origin-left" : ""}`}>
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
                        className="absolute inset-x-0 top-0 max-w-xl text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-snug text-foreground/75"
                        style={{ color: activeService.color }}
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

              {/* Editorial platform collage */}
              <motion.div
                variants={itemVariants}
                className="relative mt-10 w-full sm:mt-14 lg:mt-0 lg:translate-x-8 xl:translate-x-14"
              >
                <motion.div
                  role="img"
                  aria-label="A collage showing OBAOL coordinating agricultural sourcing, procurement, quality, packaging, logistics, warehousing, and global freight"
                  className="relative mx-auto hidden aspect-[6/5] w-full max-w-[680px] sm:block"
                  style={prefersReducedMotion ? undefined : { x: collageX, y: collageY }}
                >
                  {DESKTOP_COLLAGE_TILES.map((tile) => (
                    <EditorialCollageTile
                      key={tile.id}
                      tile={tile}
                      prefersReducedMotion={prefersReducedMotion}
                      sizes="(max-width: 1023px) 20vw, 11vw"
                    />
                  ))}
                </motion.div>

                <div
                  role="img"
                  aria-label="A collage showing OBAOL agricultural procurement and logistics operations"
                  className="relative mx-auto h-[290px] w-full max-w-[360px] sm:hidden"
                >
                  {MOBILE_COLLAGE_TILES.map((tile) => (
                    <EditorialCollageTile
                      key={tile.id}
                      tile={tile}
                      prefersReducedMotion={prefersReducedMotion}
                      sizes="34vw"
                    />
                  ))}
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
