import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export function MobileAppPage({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mobile-app-page min-h-[100dvh] w-full min-w-0 ${className}`} {...props} />;
}

export function MobileAppHeader({ title, subtitle, backHref, trailing }: { title: string; subtitle?: string; backHref?: string; trailing?: ReactNode }) {
  return <header className="mobile-app-header sticky top-0 z-40 -mx-3 flex min-h-14 items-center gap-3 border-b border-default-200/70 bg-background/90 px-3 py-2 backdrop-blur-xl safe-pt md:hidden">
    {backHref && <Link href={backHref} aria-label="Go back" className="touch-target grid shrink-0 place-items-center rounded-xl bg-default-100"><FiArrowLeft /></Link>}
    <div className="min-w-0 flex-1"><h1 className="truncate text-sm font-bold">{title}</h1>{subtitle && <p className="truncate text-[11px] text-default-500">{subtitle}</p>}</div>{trailing}
  </header>;
}

export function MobileStickyActions({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mobile-sticky-actions sticky bottom-0 z-30 -mx-3 mt-5 border-t border-default-200/70 bg-background/92 px-3 py-3 backdrop-blur-xl safe-pb md:static md:m-0 md:border-0 md:bg-transparent md:p-0 ${className}`}>{children}</div>;
}

export function MobileSheet({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`mobile-sheet max-h-[calc(100dvh-var(--safe-top)-.75rem)] overflow-y-auto overscroll-contain rounded-t-[1.75rem] bg-content1 safe-pb sm:rounded-3xl ${className}`}>{children}</section>;
}
