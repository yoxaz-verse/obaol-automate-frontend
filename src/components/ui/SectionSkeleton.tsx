"use client";

import React from "react";
import { Skeleton } from "@nextui-org/react";

type SectionSkeletonProps = {
  rows?: number;
  className?: string;
};

export default function SectionSkeleton({
  rows = 3,
  className = "",
}: SectionSkeletonProps) {
  return (
    <div className={`w-full space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-10 w-full rounded-xl bg-default-200/60 dark:bg-default-100/10"
        />
      ))}
    </div>
  );
}
