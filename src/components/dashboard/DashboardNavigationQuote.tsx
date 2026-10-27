"use client";

import { useState } from "react";

export const DASHBOARD_NAVIGATION_QUOTES = [
  "Good trade begins with good information.",
  "Patience finds the opportunity that hurry overlooks.",
  "Strong partnerships move more than products.",
  "Every market rewards those who listen first.",
  "Clear terms build lasting trade.",
  "The best decisions balance speed with certainty.",
  "Trust is the first currency of every trade.",
  "Preparation turns opportunity into progress.",
] as const;

export function selectDashboardNavigationQuote(randomValue = Math.random()) {
  const safeRandomValue = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 1 - Number.EPSILON)
    : 0;
  const quoteIndex = Math.floor(safeRandomValue * DASHBOARD_NAVIGATION_QUOTES.length);

  return DASHBOARD_NAVIGATION_QUOTES[quoteIndex];
}

export default function DashboardNavigationQuote() {
  const [quote] = useState(() => selectDashboardNavigationQuote());

  return (
    <div className="w-[min(22rem,calc(100vw-3rem))] rounded-2xl border db-border-strong db-panel px-5 py-4 text-center shadow-lg">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-obaol-500/30 border-t-obaol-500"
          aria-hidden="true"
        />
        <span>Opening page…</span>
      </div>
      <p className="mt-3 text-balance text-sm italic leading-relaxed text-default-500 dark:text-default-400">
        <span aria-hidden="true">“</span>
        {quote}
        <span aria-hidden="true">”</span>
      </p>
    </div>
  );
}
