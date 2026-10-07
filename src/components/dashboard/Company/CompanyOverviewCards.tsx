"use client";

import { Progress } from "@nextui-org/react";
import { LuCheck } from "react-icons/lu";
import type { ReactNode } from "react";

export function CompanyMetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-content1 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-obaol-500/10 text-obaol-600">{icon}</div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-xs text-default-500">{label}</p>
    </div>
  );
}

export function CompanyProfileReadiness({
  percentage,
  checks,
}: {
  percentage: number;
  checks: Array<{ label: string; complete: boolean }>;
}) {
  return (
    <div className="rounded-2xl border border-default-200 bg-content1 p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div><h2 className="text-lg font-bold">Profile readiness</h2><p className="text-sm text-default-500">Complete the company profile for stronger marketplace trust.</p></div>
        <span className="text-xl font-black text-obaol-600">{percentage}%</span>
      </div>
      <Progress value={percentage} color="warning" aria-label="Company profile completeness" />
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {checks.map((item) => (
          <div key={item.label} className="flex items-center gap-2 rounded-xl bg-default-100/60 px-3 py-2 text-xs">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${item.complete ? "bg-success-500 text-white" : "bg-default-200 text-default-500"}`}><LuCheck size={12} /></span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
