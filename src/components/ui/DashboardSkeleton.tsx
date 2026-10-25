"use client";

import { Skeleton } from "@nextui-org/react";

export function DashboardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div role="status" aria-busy="true" aria-label="Loading content" className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="min-h-[22rem] rounded-[2.5rem] border db-border-subtle db-panel p-8">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-5 w-2/3 rounded-lg db-inset" />
            <Skeleton className="h-6 w-16 rounded-full db-inset" />
          </div>
          <Skeleton className="mt-5 h-4 w-1/2 rounded-lg db-inset" />
          <Skeleton className="mt-14 h-8 w-1/3 rounded-lg db-inset" />
          <Skeleton className="mt-4 h-4 w-full rounded-lg db-inset" />
          <div className="mt-16 flex gap-3 border-t db-border-subtle pt-5">
            <Skeleton className="h-11 flex-1 rounded-xl db-inset" />
            <Skeleton className="h-11 w-24 rounded-xl db-inset" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading content…</span>
    </div>
  );
}
