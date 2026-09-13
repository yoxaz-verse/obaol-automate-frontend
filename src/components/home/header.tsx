"use client";

import Link from "next/link";
import Image from "next/image";
import { PublicContainer, PublicLinkButton } from "@/components/public/PublicUI";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FiVolume2, FiVolumeX, FiChevronDown, FiGrid, FiUsers, FiShoppingBag, FiBookOpen, FiShield, FiMenu, FiX } from "react-icons/fi";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";
import { useSoundEffect } from "@/context/SoundContext";
import { primaryPublicLinks, publicNavigation } from "@/data/publicNavigation";

const groupIcons = { platform: FiGrid, roles: FiUsers, trade: FiShoppingBag, resources: FiBookOpen, trust: FiShield };

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const desktopTrigger = useRef<HTMLButtonElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { isAuthenticated, loading } = usePublicAuthStatus();
  const { soundEnabled, setSoundEnabled } = useSoundEffect();
  const signedIn = !loading && isAuthenticated;

  const closeMenu = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) (desktop ? desktopTrigger : mobileTrigger).current?.focus();
  };

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
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => { setDesktop(media.matches); setOpen(false); };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        (desktop ? desktopTrigger : mobileTrigger).current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, desktop]);

  useEffect(() => {
    if (!open || desktop) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open, desktop]);

  const soundButton = (
    <button type="button" role="switch" aria-checked={soundEnabled}
      aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
      onClick={() => setSoundEnabled(!soundEnabled)}
      className="touch-target inline-flex items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.03] text-foreground/60 hover:bg-obaol-500/10 hover:text-obaol-600 dark:hover:text-obaol-300">
      {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
    </button>
  );

  return (
    <>
      {open && !desktop && <div aria-hidden="true" onClick={() => closeMenu(true)} className="fixed inset-0 z-[99] bg-black/30 lg:hidden" />}
      <header ref={headerRef} onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }} className={`fixed top-0 left-0 right-0 z-[100] safe-pt transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}>
        <PublicContainer className="relative">
          <div className={`public-header-shell flex items-center justify-between gap-3 rounded-2xl px-4 md:px-6 border border-default-200/50 bg-background/95 shadow-[0_12px_34px_-28px_rgba(0,0,0,0.55)] backdrop-blur-sm transition-all duration-300 ${scrolled ? "h-14" : "h-16"}`}>
            <Link href="/" aria-label="OBAOL home" onClick={() => closeMenu()} className="relative flex-shrink-0">
              <Image src="/logo.png" alt="OBAOL" width={95} height={28} priority className="object-contain rounded-md" />
            </Link>
            <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1">
              {primaryPublicLinks.map((link) => (
                <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}
                  onClick={() => closeMenu()} className="px-3 py-2 text-sm font-medium text-foreground/65 hover:text-foreground rounded-lg hover:bg-foreground/[0.06] aria-[current=page]:text-obaol-600 dark:aria-[current=page]:text-obaol-300">
                  {link.label}
                </Link>
              ))}
              <button ref={desktopTrigger} type="button" aria-expanded={open} aria-controls="public-page-directory"
                onClick={() => setOpen((value) => !value)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-foreground/75 hover:bg-obaol-500/10 aria-expanded:bg-obaol-500/10">
                More <FiChevronDown aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            </nav>
            <div className="flex shrink-0 items-center gap-2 xl:gap-3">
              <div className="hidden xl:block"><ThemeSwitcher /></div>
              <div className="hidden sm:flex">{soundButton}</div>
              <Link href={signedIn ? "/dashboard" : "/auth?view=signin"} className="hidden sm:inline-flex min-h-11 items-center px-2 text-sm font-semibold text-foreground/70 hover:text-foreground">
                {signedIn ? "Dashboard" : "Sign In"}
              </Link>
              <PublicLinkButton href={signedIn ? "/dashboard" : "/auth"}>
                {signedIn ? "Open workspace" : "Get Started"}
              </PublicLinkButton>
              <button ref={mobileTrigger} type="button" onClick={() => setOpen((value) => !value)}
                className="lg:hidden touch-target inline-flex items-center justify-center rounded-lg border border-foreground/10 bg-foreground/[0.04]"
                aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="public-page-directory">
                {open ? <FiX aria-hidden="true" size={20} /> : <FiMenu aria-hidden="true" size={20} />}
              </button>
            </div>
          </div>
          {open && (
            <div id="public-page-directory" className="absolute left-4 right-4 top-full mt-2 max-h-[calc(100dvh-7rem-var(--safe-top)-var(--safe-bottom))] overflow-y-auto overscroll-contain rounded-2xl border border-obaol-500/20 bg-[#FCFAF6] p-4 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.55)] dark:bg-[#090806] lg:p-6">
              <nav aria-label="All public pages" className="columns-1 gap-6 lg:columns-3">
                {publicNavigation.map((group) => {
                  const Icon = groupIcons[group.icon];
                  return (
                    <section key={group.label} aria-label={group.label} className="mb-5 break-inside-avoid">
                      <h2 className="mb-2 flex items-center gap-2 border-b border-foreground/10 px-3 pb-2 text-xs font-bold uppercase tracking-widest text-obaol-700 dark:text-obaol-300">
                        <Icon aria-hidden="true" size={16} />{group.label}
                      </h2>
                      <ul>
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <Link href={link.href} prefetch={false} aria-current={pathname === link.href ? "page" : undefined}
                              onClick={() => closeMenu(true)}
                              className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-foreground/75 hover:bg-obaol-500/10 hover:text-foreground aria-[current=page]:bg-obaol-500/10 aria-[current=page]:font-semibold aria-[current=page]:text-obaol-700 dark:aria-[current=page]:text-obaol-300">
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </nav>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 border-t border-foreground/10 pt-4 lg:hidden">
                <Link href={signedIn ? "/dashboard" : "/auth?view=signin"} onClick={() => closeMenu(true)} className="min-h-11 rounded-xl border border-foreground/10 px-4 py-3 text-sm font-semibold">{signedIn ? "Dashboard" : "Sign In"}</Link>
                <Link href={signedIn ? "/dashboard" : "/auth"} onClick={() => closeMenu(true)} className="min-h-11 rounded-xl bg-obaol-500 px-4 py-3 text-sm font-bold text-obaol-950">{signedIn ? "Open workspace" : "Get Started"}</Link>
                {soundButton}
              </div>
              <div className="mt-4 flex justify-center border-t border-foreground/10 pt-4 xl:hidden"><ThemeSwitcher /></div>
            </div>
          )}
        </PublicContainer>
      </header>
    </>
  );
}
