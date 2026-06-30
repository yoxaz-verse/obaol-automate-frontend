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
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-default-500">
      <button
        type="button"
        onClick={() => router.push(parentPath)}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 font-semibold hover:bg-default-100 hover:text-foreground"
      >
        <FiArrowLeft aria-hidden="true" />
        {parentLabel}
      </button>
      <span aria-hidden="true">/</span>
      <span className="font-medium text-foreground" aria-current="page">{currentLabel}</span>
    </nav>
  );
}
