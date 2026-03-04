"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

type BrandedLoaderProps = {
  message?: string;
  fullScreen?: boolean;
  className?: string;
  variant?: "default" | "compact";
  size?: "sm" | "md" | "lg";
};

export default function BrandedLoader({
  message = "Please wait...",
  fullScreen = false,
  className = "",
  variant = "default",
  size = "md",
}: BrandedLoaderProps) {
  const reducedMotion = useReducedMotion();
  const sizeMap = {
    sm: { frame: "w-[56px] h-[56px]", logo: 36 },
    md: { frame: "w-[74px] h-[74px]", logo: 54 },
    lg: { frame: "w-[88px] h-[88px]", logo: 64 },
  } as const;
  const currentSize = sizeMap[size];
  const compact = variant === "compact";

  return (
    <div
      className={`w-full ${fullScreen ? "min-h-screen" : compact ? "min-h-[120px]" : "min-h-[220px]"} flex items-center justify-center ${className}`}
    >
      <div className={`flex flex-col items-center ${compact ? "gap-2.5" : "gap-4"}`}>
        <div className="relative">
          {!reducedMotion && (
            <div className="absolute inset-[-10px] rounded-full border-2 border-warning-500/30 border-t-warning-500 animate-spin" />
          )}
          <motion.div
            animate={reducedMotion ? undefined : { opacity: [0.82, 1, 0.82] }}
            transition={reducedMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className={`relative ${currentSize.frame} rounded-2xl bg-content1/95 border border-default-200/80 shadow-sm flex items-center justify-center`}
          >
            <Image
              src="/logo.png"
              alt="OBAOL"
              width={currentSize.logo}
              height={currentSize.logo}
              className="rounded-md object-contain"
            />
          </motion.div>
        </div>
        <p
          className={`${compact ? "text-[11px]" : "text-xs"} tracking-wide uppercase text-default-500 font-semibold text-center`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
