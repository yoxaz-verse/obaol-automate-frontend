"use client";

import React from "react";
import { Spinner } from "@nextui-org/react";

type InlineLoaderProps = {
  message?: string;
  className?: string;
};

export default function InlineLoader({
  message = "Loading",
  className = "",
}: InlineLoaderProps) {
  return (
    <div className={`flex items-center gap-2 text-default-500 ${className}`}>
      <Spinner size="sm" color="warning" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
