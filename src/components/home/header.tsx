"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import AuthContext from "@/context/AuthContext";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from "@nextui-org/react";

const PRIMARY_NAV = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/product", label: "Products" },
  { href: "/roles", label: "Roles" },
];

const MORE_NAV = [
  { href: "/why-obaol", label: "Why OBAOL" },
  { href: "/news", label: "News" },
  { href: "/faq", label: "FAQ" },
];

const MOBILE_NAV = [...PRIMARY_NAV, ...MORE_NAV];


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { isAuthenticated, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
          ? "py-2"
          : "py-3"
          }`}
      >
        {/* Glassmorphic pill container */}
        <div className={`mx-auto max-w-7xl px-4 transition-all duration-500`}>
          <div
            className={`flex items-center justify-between rounded-2xl px-4 md:px-6 transition-all duration-500 ${scrolled
              ? "h-14"
              : "h-15 md:h-16"
              } bg-background/80 backdrop-blur-2xl border border-default-200/50 shadow-sm`}
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
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500/80" />
              </span>
            </Link>

            {/* ── DESKTOP NAV ── */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {PRIMARY_NAV.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}

              {/* Resources Dropdown */}
              <Dropdown>
                <DropdownTrigger>
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/60 hover:text-foreground rounded-lg hover:bg-foreground/[0.06] transition-all duration-200 outline-none">
                    More
                    <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="More options"
                  className="w-48"
                  itemClasses={{
                    base: "rounded-xl gap-3",
                  }}
                >
                  {MORE_NAV.map((link) => (
                    <DropdownItem key={link.href} textValue={link.label}>
                      <Link href={link.href} className="flex w-full px-1 py-1 text-sm font-medium text-foreground/70 hover:text-foreground">
                        {link.label}
                      </Link>
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </nav>

            <div className="flex items-center gap-4">
              {/* Utility Group */}
              <div className="hidden lg:flex items-center gap-1.5 px-1.5 py-1 rounded-xl border border-foreground/10 bg-foreground/[0.03]">
                <ThemeSwitcher />
                <Link
                  href="/developer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/[0.08] transition-all"
                  aria-label="Developer Mode"
                  title="Developer Mode"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
                  </svg>
                </Link>
              </div>

              {/* Create Account Dropdown */}
              {!loading && !isAuthenticated && (
                <div className="hidden lg:block">
                  <Dropdown>
                    <DropdownTrigger>
                      <button className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-orange-500 uppercase tracking-wider hover:text-orange-600 transition-colors outline-none">
                        Join OBAOL
                        <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Registration options"
                      className="w-56"
                      itemClasses={{
                        base: "rounded-xl",
                      }}
                    >
                      <DropdownItem key="associate" textValue="Join as Associate">
                        <Link href="/auth/register" className="flex flex-col gap-0.5 px-1 py-1">
                          <span className="text-sm font-bold text-foreground">Join as Associate</span>
                          <span className="text-[11px] text-foreground/50">For companies & traders</span>
                        </Link>
                      </DropdownItem>
                      <DropdownItem key="operator" textValue="Join as Operator">
                        <Link href="/auth/operator/register" className="flex flex-col gap-0.5 px-1 py-1">
                          <span className="text-sm font-bold text-foreground">Join as Operator</span>
                          <span className="text-[11px] text-foreground/50">For platform managers</span>
                        </Link>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              )}


              {/* CTA */}
              <button
                onClick={() => {
                  if (loading) return;
                  setIsNavigating(true);
                  router.push(isAuthenticated ? "/dashboard" : "/auth");
                }}
                disabled={isNavigating || loading}
                className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold overflow-hidden transition-all duration-300
                  bg-orange-500 hover:bg-orange-600 text-white
                  shadow-none hover:scale-[1.03] active:scale-[0.97] disabled:opacity-80 disabled:scale-100"
              >
                {/* Shimmer */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 skew-x-12" />
                <span className="relative">
                  {isNavigating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Opening...
                    </span>
                  ) : (
                    !loading && isAuthenticated ? "Go to Dashboard" : "Sign In"
                  )}
                </span>
                {!isNavigating && (
                  <svg className="relative w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg border border-foreground/10 bg-foreground/[0.04] hover:bg-foreground/[0.08] transition-colors"
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
              {MOBILE_NAV.map((link) => (
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


              <Link
                href="/developer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.06] transition-all duration-200 group"
              >
                <span>Developer Mode</span>
                <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Mobile CTA + theme */}
              <div className="mt-3 pt-3 border-t border-foreground/10 flex flex-col gap-3 px-4">
                <button
                  onClick={() => {
                    if (loading) return;
                    setIsNavigating(true);
                    setMobileOpen(false);
                    router.push(isAuthenticated ? "/dashboard" : "/auth");
                  }}
                  disabled={isNavigating || loading}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-[0_0_20px_-4px_rgba(251,146,60,0.5)] hover:brightness-110 transition-all disabled:opacity-80"
                >
                  {isNavigating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Opening...
                    </span>
                  ) : (
                    !loading && isAuthenticated ? "Go to Dashboard" : "Sign In"
                  )}
                  {!isNavigating && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>

                {!loading && !isAuthenticated && (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center py-2 text-xs font-bold text-orange-500 uppercase tracking-tight"
                    >
                      Join as Associate
                    </Link>
                    <Link
                      href="/auth/operator/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center py-2 text-xs font-bold text-orange-500 uppercase tracking-tight"
                    >
                      Join as Operator
                    </Link>
                  </div>
                )}

                <div className="flex justify-center border-t border-foreground/5 pt-3">
                  <ThemeSwitcher />
                </div>
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
            className="fixed inset-0 z-30 lg:hidden"
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
    </Link>

  );
}
