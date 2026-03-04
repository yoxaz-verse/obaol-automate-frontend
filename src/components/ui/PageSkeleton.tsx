"use client";

import React from "react";
import { Skeleton } from "@nextui-org/react";

type PageSkeletonProps = {
  sections?: number;
  className?: string;
};

export default function PageSkeleton({
  sections = 4,
  className = "",
}: PageSkeletonProps) {
  return (
    <div className={`w-full space-y-4 ${className}`}>
      <Skeleton className="h-10 w-1/3 rounded-xl bg-default-200/60 dark:bg-default-100/10" />
      {Array.from({ length: sections }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-20 w-full rounded-2xl bg-default-200/60 dark:bg-default-100/10"
        />
      ))}
    </div>
  );
}
