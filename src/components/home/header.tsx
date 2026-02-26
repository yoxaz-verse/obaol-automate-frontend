"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/why-obaol", label: "Why OBAOL" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/product", label: "Products" },
  { href: "/faq", label: "FAQ" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? "py-2"
            : "py-3"
          }`}
      >
        {/* Glassmorphic pill container */}
        <div className={`mx-auto max-w-7xl px-4 transition-all duration-500`}>
          <div
            className={`flex items-center justify-between rounded-2xl px-4 md:px-6 transition-all duration-500 ${scrolled
                ? "h-14 bg-background/72 backdrop-blur-2xl border border-foreground/15 shadow-[0_10px_32px_-10px_rgba(0,0,0,0.35)]"
                : "h-15 md:h-16 bg-background/68 backdrop-blur-2xl border border-foreground/15 shadow-[0_10px_28px_-12px_rgba(0,0,0,0.32)]"
              }`}
          >
            {/* ── LOGO ── */}
            <Link href="/" className="relative flex items-center gap-2.5 group flex-shrink-0">
              <Image
                src="/logo.png"
                alt="OBAOL"
                width={100}
                height={30}
                priority
                className="object-contain rounded-md transition-opacity duration-300 group-hover:opacity-80"
              />
              {/* Live status dot */}
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
            </Link>

            {/* ── DESKTOP NAV ── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* ── ACTIONS ── */}
            <div className="flex items-center gap-3">
              {/* Theme switcher */}
              <div className="hidden sm:block">
                <ThemeSwitcher />
              </div>

              {/* CTA */}
              <Link
                href="https://typebot.co/obaol-early-access"
                target="_blank"
                className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold overflow-hidden transition-all duration-300
                  bg-orange-500 hover:bg-orange-500 text-white
                  shadow-[0_0_20px_-4px_rgba(251,146,60,0.6)] hover:shadow-[0_0_28px_-2px_rgba(251,146,60,0.8)]
                  hover:scale-[1.03] active:scale-[0.97]"
              >
                {/* Shimmer */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 skew-x-12" />
                <span className="relative">Early Access</span>
                <svg className="relative w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg border border-foreground/10 bg-foreground/[0.04] hover:bg-foreground/[0.08] transition-colors"
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

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-[72px] left-4 right-4 z-40 rounded-2xl border border-foreground/10 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.06] transition-all duration-200 group"
                >
                  <span>{link.label}</span>
                  <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}

              {/* Mobile CTA + theme */}
              <div className="mt-3 pt-3 border-t border-foreground/10 flex items-center gap-3">
                <Link
                  href="https://typebot.co/obaol-early-access"
                  target="_blank"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-[0_0_20px_-4px_rgba(251,146,60,0.5)] hover:brightness-110 transition-all"
                >
                  Get Early Access
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <ThemeSwitcher />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative px-3 py-2 text-sm font-medium text-foreground/60 hover:text-foreground rounded-lg hover:bg-foreground/[0.06] transition-all duration-200 group"
    >
      {children}
      {/* Animated underline dot */}
      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200" />
    </Link>
  );
}
