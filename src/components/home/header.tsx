"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";

const NAV = [
  { href: "/about", label: "Platform" },
  { href: "/roles", label: "Roles" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/trade-directory", label: "Catalog" },
  { href: "/procurement", label: "Services" },
  { href: "/trust", label: "Trust" },
  { href: "/faq", label: "Resources" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, loading } = usePublicAuthStatus();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className={`flex items-center justify-between rounded-2xl px-4 md:px-6 border border-default-200/50 bg-background/85 backdrop-blur-xl transition-all duration-300 ${scrolled ? "h-14" : "h-16"}`}>
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

              <Link href={isAuthenticated ? "/dashboard" : "/auth?view=signin"} className="hidden sm:inline-flex min-h-10 items-center px-2 text-sm font-semibold text-foreground/70 hover:text-foreground">
                {!loading && isAuthenticated ? "Dashboard" : "Sign In"}
              </Link>
              <Link href={isAuthenticated ? "/dashboard" : "/auth"} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 md:px-4 md:py-2 md:text-sm">
                {!loading && isAuthenticated ? "Open workspace" : "Get Started"}
              </Link>

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg border border-foreground/10 bg-foreground/[0.04]"
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

      <div className={`fixed top-[72px] left-4 right-4 z-40 rounded-2xl border border-foreground/10 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-200 lg:hidden ${mobileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
        <nav className="flex flex-col p-4 gap-1">
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.06]"
            >
              <span>{link.label}</span>
            </Link>
          ))}

          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-foreground/10 pt-3">
            <Link href="/auth?view=signin" onClick={() => setMobileOpen(false)} className="rounded-xl border border-foreground/10 px-4 py-3 text-center text-sm font-semibold">Sign In</Link>
            <Link href="/auth" onClick={() => setMobileOpen(false)} className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white">Get Started</Link>
          </div>

          <div className="mt-3 pt-3 border-t border-foreground/10 flex justify-center">
            <ThemeSwitcher />
          </div>
        </nav>
      </div>

      <div onClick={() => setMobileOpen(false)} className={`fixed inset-0 z-30 lg:hidden transition-opacity duration-200 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} />
    </>
  );
}
