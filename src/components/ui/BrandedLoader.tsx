"use client";

import React from "react";
import Image from "next/image";

type BrandedLoaderProps = {
  message?: string;
  fullScreen?: boolean;
  className?: string;
};

export default function BrandedLoader({
  message = "Please wait...",
  fullScreen = false,
  className = "",
}: BrandedLoaderProps) {
  return (
    <div
      className={`w-full ${fullScreen ? "min-h-screen" : "min-h-[220px]"} flex items-center justify-center ${className}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-[-10px] rounded-full border-2 border-warning-500/30 border-t-warning-500 animate-spin" />
          <div className="relative w-[74px] h-[74px] rounded-2xl bg-content1/90 border border-default-200 shadow-sm flex items-center justify-center">
            <Image src="/logo.png" alt="OBAOL" width={54} height={54} className="rounded-md object-contain" />
          </div>
        </div>
        <p className="text-xs tracking-wide uppercase text-default-500 font-semibold">{message}</p>
      </div>
    </div>
  );
}

