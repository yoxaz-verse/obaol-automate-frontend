"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

export default function DashboardBreadcrumb({
  parentLabel,
  parentPath,
  currentLabel,
}: {
  parentLabel: string;
  parentPath: string;
  currentLabel: string;
}) {
  const router = useRouter();
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs text-default-700">
      <button
        type="button"
        onClick={() => router.push(parentPath)}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 font-semibold transition-colors hover:bg-default-100 hover:text-obaol-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 focus-visible:ring-offset-2 dark:hover:text-obaol-300"
      >
        <FiArrowLeft aria-hidden="true" />
        {parentLabel}
      </button>
      <span className="text-default-600" aria-hidden="true">/</span>
      <span className="font-bold text-foreground" aria-current="page">{currentLabel}</span>
    </nav>
  );
}
