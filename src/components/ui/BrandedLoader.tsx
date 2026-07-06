"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { LuScan, LuTruck, LuShieldCheck, LuNetwork } from "react-icons/lu";

type BrandedLoaderProps = {
  fullScreen?: boolean;
  className?: string;
  variant?: "default" | "compact";
  size?: "sm" | "md" | "lg";
  message?: string;
};

type MissionStage = {
    title: string;
    icon: React.ElementType;
    status: string;
};

const MISSION_STAGES: MissionStage[] = [
    { title: "INITIALIZING PROTOCOL",   icon: LuScan,        status: "AGRO SOURCE VALIDATED" },
    { title: "LOGISTICS SYNC",          icon: LuTruck,       status: "FLEET ORCHESTRATION ACTIVE" },
    { title: "FINALIZING ECOSYSTEM",    icon: LuShieldCheck, status: "MISSION PARAMETERS LOCKED" },
];

const INTERVAL_MS = 2400;

export default function BrandedLoader({
  fullScreen = false,
  className = "",
  variant = "default",
  size = "md",
  message = "INITIALIZING SYSTEM",
}: BrandedLoaderProps) {
  const sizeMap = {
    sm: { frame: "w-[120px] h-[120px]", logo: 32, iconSize: 18 },
    md: { frame: "w-[180px] h-[180px]", logo: 48, iconSize: 24 },
    lg: { frame: "w-[240px] h-[240px]", logo: 64, iconSize: 32 },
  } as const;

  const currentSize = sizeMap[size];
  const compact = variant === "compact";

  // Stage cycling with a simple CSS-opacity crossfade (no AnimatePresence)
  const [stage, setStage] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTextVisible(false);
      setTimeout(() => {
        setStage((prev) => (prev + 1) % MISSION_STAGES.length);
        setTextVisible(true);
      }, 300);
    }, INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const active = MISSION_STAGES[stage];
  const ActiveIcon = active.icon;

  const containerBase = fullScreen
    ? "fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center overflow-hidden"
    : `w-full flex flex-col items-center justify-center ${compact ? "py-8" : "py-24"} bg-transparent`;

  return (
    <div role="status" aria-live="polite" className={`${containerBase} ${className}`}>

      {/* ── Background Layer (fullscreen only) ── */}
      {fullScreen && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Radial centre glow */}
          <div className="absolute left-1/2 top-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(207,152,60,0.08)_0%,transparent_60%)]" />
          {/* Moving scanline */}
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 h-[22vh] bg-gradient-to-b from-transparent via-obaol-500/[0.05] to-transparent"
          />
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-12 opacity-[0.025]">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-obaol-500" />
            ))}
          </div>
        </div>
      )}

      {/* ── Core Content ── */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-sm">

        {/* Icon Frame */}
        <div className={`relative ${currentSize.frame} flex items-center justify-center mb-10`}>

          {/* Rotating dashed ring */}
          <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 100">
            <motion.circle
              cx="50" cy="50" r="48" fill="none"
              stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 5"
              className="text-obaol-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Corner brackets */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-3 top-3 h-5 w-5 rounded-tl-xl border-l-2 border-t-2 border-obaol-500/40" />
            <div className="absolute right-3 top-3 h-5 w-5 rounded-tr-xl border-r-2 border-t-2 border-obaol-500/40" />
            <div className="absolute bottom-3 left-3 h-5 w-5 rounded-bl-xl border-b-2 border-l-2 border-obaol-500/40" />
            <div className="absolute bottom-3 right-3 h-5 w-5 rounded-br-xl border-b-2 border-r-2 border-obaol-500/40" />
          </div>

          {/* Logo pulse */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="relative z-10 rounded-3xl border border-default-200 bg-background p-6 shadow-[0_0_40px_rgba(207,152,60,0.12)]"
          >
            <Image
              src="/logo.png"
              alt="OBAOL"
              width={currentSize.logo}
              height={currentSize.logo}
              className="rounded-lg object-contain opacity-90"
            />

            {/* Stage badge — always rendered, icon swaps with CSS transition */}
            <div
              className="absolute -right-5 -top-5 flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-background bg-obaol-500 shadow-[0_0_20px_rgba(207,152,60,0.52)]"
              style={{ transition: "opacity 0.3s", opacity: textVisible ? 1 : 0 }}
            >
              <ActiveIcon size={currentSize.iconSize} className="text-black" />
            </div>
          </motion.div>
        </div>

        {/* ── Status text (stable, no AnimatePresence) ── */}
        <div
          className="flex flex-col items-center text-center gap-2 px-8 w-full"
          style={{ opacity: textVisible ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          <p className="text-[10px] font-bold uppercase leading-none tracking-[0.45em] text-obaol-700 dark:text-obaol-300">
            {active.title}
          </p>
          <h3 className="text-base font-black text-foreground uppercase tracking-tight leading-snug mt-1 min-h-[1.4em]">
            {active.status}
          </h3>
          <div className="flex items-center gap-2 mt-3 text-[9px] font-bold text-default-400 tracking-[0.3em] uppercase">
            <LuNetwork className="shrink-0 text-obaol-500/60" size={12} />
            {message}
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="w-full flex gap-1.5 mt-8 px-8">
          {MISSION_STAGES.map((_, i) => (
            <div key={i} className="flex-1 h-[2px] rounded-full bg-default-100 relative overflow-hidden">
              {i < stage && (
                <div className="absolute inset-0 rounded-full bg-obaol-500/40" />
              )}
              {i === stage && (
                <motion.div
                  key={stage}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
                  className="absolute inset-0 rounded-full bg-obaol-500"
                />
              )}
            </div>
          ))}
        </div>

        <span className="mt-6 text-[8px] font-black text-default-400/50 uppercase tracking-[0.4em] italic">
          OBAOL MISSION CONTROL // STATUS NORMAL
        </span>
      </div>
    </div>
  );
}
