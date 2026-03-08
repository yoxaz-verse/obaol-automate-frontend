"use client";

import React from "react";
import Image from "next/image";
import { Spinner } from "@nextui-org/react";

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
  const sizeMap = {
    sm: { frame: "w-[56px] h-[56px]", logo: 34, spinner: "sm" as const },
    md: { frame: "w-[72px] h-[72px]", logo: 48, spinner: "md" as const },
    lg: { frame: "w-[88px] h-[88px]", logo: 60, spinner: "lg" as const },
  } as const;
  const currentSize = sizeMap[size];
  const compact = variant === "compact";
  const containerBase = fullScreen
    ? "fixed inset-0 z-[140] bg-background/92 backdrop-blur-[2px]"
    : `w-full ${compact ? "min-h-[140px]" : "min-h-[220px]"}`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${containerBase} flex items-center justify-center ${className}`}
    >
      <div
        className={`rounded-2xl border border-default-200/70 bg-content1/95 shadow-lg ${
          compact ? "px-5 py-4" : "px-7 py-6"
        }`}
      >
        <div className={`flex flex-col items-center ${compact ? "gap-2.5" : "gap-4"}`}>
          <div
            className={`relative ${currentSize.frame} rounded-2xl bg-content2 border border-default-200/80 shadow-sm flex items-center justify-center`}
          >
            <Image
              src="/logo.png"
              alt="OBAOL"
              width={currentSize.logo}
              height={currentSize.logo}
              className="rounded-md object-contain"
            />
          </div>
          <Spinner size={currentSize.spinner} color="warning" />
          <span className="sr-only">Loading</span>
          <p
            className={`${compact ? "text-[11px]" : "text-xs"} tracking-wide uppercase text-default-500 font-semibold text-center`}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
