"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";
import { useSoundEffect } from "@/context/SoundContext";

const NAV = [
  { href: "/about", label: "Platform" },
  { href: "/roles", label: "Roles" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/trade-directory", label: "Catalog" },
  { href: "/procurement", label: "Services" },
  { href: "/faq", label: "Resources" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, loading } = usePublicAuthStatus();
  const { soundEnabled, setSoundEnabled } = useSoundEffect();

  useEffect(() => {
    let frame = 0;
    let lastState = window.scrollY > 20;
    setScrolled(lastState);

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const nextState = window.scrollY > 20;
        if (nextState !== lastState) {
          lastState = nextState;
          setScrolled(nextState);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] safe-pt transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className={`flex items-center justify-between rounded-2xl px-4 md:px-6 border border-default-200/50 bg-background/92 shadow-[0_12px_34px_-28px_rgba(0,0,0,0.55)] backdrop-blur-sm transition-all duration-300 ${scrolled ? "h-14" : "h-16"}`}>
            <Link href="/" className="relative flex items-center gap-2.5 group flex-shrink-0">
              <Image
                src="/logo.png"
                alt="OBAOL"
                width={95}
                height={28}
                priority
                className="object-contain rounded-md transition-opacity duration-300 group-hover:opacity-80"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-1.5">
              {NAV.map((link) => (
                <Link key={link.href} href={link.href} className="px-3 py-2 text-sm font-medium text-foreground/65 hover:text-foreground rounded-lg hover:bg-foreground/[0.06] transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden xl:flex items-center gap-1.5 px-1.5 py-1 rounded-xl border border-foreground/10 bg-foreground/[0.03]">
                <ThemeSwitcher />
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="hidden sm:inline-flex touch-target items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.03] text-foreground/60 transition-all hover:border-obaol-300/40 hover:bg-obaol-500/10 hover:text-obaol-600 dark:hover:text-obaol-300"
              >
                {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
              </button>

              <Link href={isAuthenticated ? "/dashboard" : "/auth?view=signin"} className="hidden sm:inline-flex min-h-10 items-center px-2 text-sm font-semibold text-foreground/70 hover:text-foreground">
                {!loading && isAuthenticated ? "Dashboard" : "Sign In"}
              </Link>
              <Link href={isAuthenticated ? "/dashboard" : "/auth"} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-obaol-300/40 bg-obaol-500 px-3 py-1.5 text-xs font-bold text-obaol-950 shadow-[0_10px_28px_-14px_rgba(207,152,60,0.75)] transition-all hover:-translate-y-0.5 hover:bg-obaol-400 md:px-4 md:py-2 md:text-sm">
                {!loading && isAuthenticated ? "Open workspace" : "Get Started"}
              </Link>

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden touch-target flex flex-col justify-center items-center gap-1.5 rounded-lg border border-foreground/10 bg-foreground/[0.04]"
                aria-label="Toggle menu"
              >
                <span className={`w-4 h-px bg-foreground transition-all duration-300 ${mobileOpen ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`w-4 h-px bg-foreground transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`w-4 h-px bg-foreground transition-all duration-300 ${mobileOpen ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`fixed left-4 right-4 top-[calc(72px+var(--safe-top))] z-40 max-h-[calc(100dvh-6rem-var(--safe-top)-var(--safe-bottom))] rounded-2xl border border-foreground/10 bg-background/97 shadow-2xl overflow-hidden transition-all duration-200 lg:hidden ${mobileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
        <nav className="flex max-h-[inherit] flex-col overflow-y-auto scroll-touch p-4 pb-[calc(1rem+var(--safe-bottom))] gap-1">
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex min-h-11 items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.06]"
            >
              <span>{link.label}</span>
            </Link>
          ))}

          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-foreground/10 pt-3">
            <Link href="/auth?view=signin" onClick={() => setMobileOpen(false)} className="min-h-11 rounded-xl border border-foreground/10 px-4 py-3 text-center text-sm font-semibold">Sign In</Link>
            <Link href="/auth" onClick={() => setMobileOpen(false)} className="min-h-11 rounded-xl border border-obaol-300/40 bg-obaol-500 px-4 py-3 text-center text-sm font-bold text-obaol-950">Get Started</Link>
          </div>

          <div className="mt-3 pt-3 border-t border-foreground/10 flex justify-center">
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.04] text-foreground/60 transition-colors hover:text-foreground"
              >
                {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      <div onClick={() => setMobileOpen(false)} className={`fixed inset-0 z-30 lg:hidden transition-opacity duration-200 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} />
    </>
  );
}
