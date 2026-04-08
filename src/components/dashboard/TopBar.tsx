"use client";

import { TopbarProps } from "@/data/interface-data";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
  Button,
  Divider
} from "@heroui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CiMenuBurger } from "react-icons/ci";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import AuthContext from "@/context/AuthContext";
import { routeRoles } from "@/utils/roleHelpers";
import { sidebarOptions } from "@/utils/utils";
import Image from "next/image";
import CurrencySelector from "./Catalog/currency-selector";
import { FiBell, FiSettings, FiVolume2, FiVolumeX, FiX, FiUser, FiGlobe, FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import NotificationPanel from "./NotificationPanel";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { notificationRoutes } from "@/core/api/apiRoutes";
import { AnimatePresence, motion } from "framer-motion";
import { useSoundEffect } from "@/context/SoundContext";

const TopBar = ({ username, role, isOnboardingLocked = false }: TopbarProps) => {
  const { logout } = useContext(AuthContext);
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const { soundEnabled, setSoundEnabled, play } = useSoundEffect();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const normalizedRole = String(role || "").toLowerCase();
  const displayRole = (normalizedRole === "operator" || normalizedRole === "team")
    ? "Operator"
    : (role?.charAt(0).toUpperCase() + role.slice(1));

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res: any = await getData(notificationRoutes.unreadCount);
      return Number(res?.data?.unreadCount || 0);
    },
    refetchInterval: 25000,
  });

  const unreadCount = Number(unreadData || 0);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!notificationRef.current) return;
      if (!notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [isNotificationOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Swipe-to-open / swipe-to-close gesture (ChatGPT-style)
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    const EDGE_ZONE = 40;     // px from left edge to trigger open
    const SWIPE_THRESHOLD = 60; // min horizontal distance to register swipe
    const ANGLE_LIMIT = 45;   // max vertical angle to be considered horizontal

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;

      // Only treat as horizontal swipe if angle is mostly horizontal
      if (Math.abs(dy) > Math.abs(dx) * Math.tan((ANGLE_LIMIT * Math.PI) / 180)) return;

      if (!isMobileMenuOpen && touchStartX <= EDGE_ZONE && dx > SWIPE_THRESHOLD) {
        // Swipe right from left edge → open
        setIsMobileMenuOpen(true);
      } else if (isMobileMenuOpen && dx < -SWIPE_THRESHOLD) {
        // Swipe left anywhere → close
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isMobileMenuOpen]);

  // Filter options based on the user's role
  const filteredOptions = sidebarOptions.filter((option) => {
    const allowedRoles = routeRoles[option.link] || [];
    return allowedRoles.includes(role);
  });
  const pathname = usePathname();
  const optionMap = new Map(filteredOptions.map((o) => [o.link, o]));
  const mobileSections = [
    { label: "", links: ["/dashboard"] },
    { label: "Product", links: ["/dashboard/product", "/dashboard/catalog", "/dashboard/marketplace", "/dashboard/imports"] },
    { label: "Execution", links: ["/dashboard/enquiries", "/dashboard/orders", "/dashboard/external-orders", "/dashboard/sample-requests", "/dashboard/execution-enquiries", "/dashboard/documents"] },
    { label: "News", links: ["/dashboard/news"] },
    { label: "Manage", links: ["/dashboard/inventory", "/dashboard/warehouses", "/dashboard/company", "/dashboard/notifications", "/dashboard/approvals", "/dashboard/reports", "/dashboard/profile"] },
    { label: "Operator", links: ["/dashboard/operator/hierarchy", "/dashboard/operator/team", "/dashboard/operator/earnings"] },
    { label: "Admin Tools", links: ["/dashboard/documentation-rules", "/dashboard/documentation-preview", "/dashboard/flow-rules", "/dashboard/users", "/dashboard/essentials", "/dashboard/geosphere"] },
  ];

  return (
    <div
      data-topbar
      className="relative z-50 flex text-foreground justify-between items-center px-6 py-3 my-2 mx-2 md:mx-4 rounded-2xl border border-default-200/50 bg-white/70 dark:bg-[#0B0F14]/80 backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-visible"
    >
      {/* Structural Accents */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-warning-500/20 to-transparent opacity-40 dark:opacity-50" />
      <div className="absolute -bottom-[1px] left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-default-200/50 dark:via-white/5 to-transparent" />

      {/* Left Section: Mission Telemetry & Identity */}
      <div className="flex items-center gap-6 divide-x divide-default-200/60 dark:divide-white/5">
        <div className="flex gap-1 md:gap-4 items-center">
          {/* Side Drawer - Mobile only */}
          <div className="md:hidden">
            <button
              aria-label="Open Menu"
              onClick={() => {
                if (isOnboardingLocked) return;
                setIsMobileMenuOpen(true);
              }}
              className={`group flex items-center justify-center w-10 h-10 rounded-xl bg-default-100/80 hover:bg-warning-500/10 hover:text-warning-500 transition-all active:scale-95 ${isOnboardingLocked ? "opacity-50 cursor-not-allowed hover:bg-default-100/80 hover:text-current" : ""}`}
            >
              <CiMenuBurger size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>

            {mounted && !isOnboardingLocked && createPortal(
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <div className="fixed inset-0 z-[999999]">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "-100%" }}
                      transition={{ type: "spring", damping: 30, stiffness: 300 }}
                      className="absolute top-0 left-0 bottom-0 w-[300px] bg-background border-r border-default-200 flex flex-col"
                    >
                      {/* Drawer content */}
                      <div className="p-8 border-b border-default-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Image src="/logo.png" width={28} height={28} alt="Logo" />
                          <div>
                            <p className="font-black text-xs tracking-widest uppercase">OBAOL</p>
                            <p className="text-[9px] font-bold text-warning-500 uppercase tracking-widest">Supreme</p>
                          </div>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
                          <FiX size={14} />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {mobileSections.map((sec) => (
                           <div key={sec.label}>
                             <p className="text-[10px] font-black text-default-400 uppercase tracking-[0.2em] mb-3 px-3">{sec.label}</p>
                             <div className="space-y-1">
                               {sec.links.map(l => optionMap.get(l)).filter(Boolean).map((opt: any) => (
                                 <button
                                   key={opt.name}
                                   onClick={() => { router.push(opt.link); setIsMobileMenuOpen(false); }}
                                   className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${pathname === opt.link ? "bg-warning-500/10 text-warning-600 font-bold" : "text-default-600 hover:bg-default-50"}`}
                                 >
                                   <span className="text-lg">{opt.icon}</span>
                                   <span className="text-sm">{opt.name}</span>
                                 </button>
                               ))}
                             </div>
                           </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
          </div>

          {/* Desktop Identity */}
          <div className="hidden md:flex flex-col gap-1 pr-8 border-r border-default-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-[11px] font-black text-foreground tracking-[0.25em] uppercase">{username?.split('@')[0]}</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-warning-600 dark:text-warning-500 uppercase tracking-[0.2em] italic opacity-80">{displayRole} CORE ONLINE</span>
            </div>
          </div>
        </div>

        {/* Telemetry Group: Global Synchronization */}
        <div className="hidden lg:flex items-center gap-12 pl-8 h-12">
           <div className="flex flex-col border-l-2 border-warning-500/20 pl-6 h-full justify-center">
              <span className="text-[13px] font-black text-foreground tracking-[0.15em] tabular-nums flex items-center gap-2">
                <span className="w-1 h-3 bg-warning-500/40 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.2)]" />
                {mounted ? (currentTime || "--:--:--") : "--:--:--"}
              </span>
              <span className="text-[9px] font-black text-warning-500/60 uppercase tracking-[0.4em] mt-1.5 italic">Local Terminal</span>
           </div>
           
           <div className="flex flex-col border-l border-default-200/60 dark:border-white/5 pl-8 h-full justify-center opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-[12px] font-bold text-default-600 dark:text-white/40 tracking-[0.15em] tabular-nums flex items-center gap-2">
                {mounted ? (new Date().toLocaleTimeString("en-GB", { timeZone: "UTC", hour12: false })) : "--:--:--"}
              </span>
              <span className="text-[9px] font-black text-default-500/50 uppercase tracking-[0.4em] mt-1.5 italic">UTC Control</span>
           </div>
        </div>
      </div>

      {/* Right Section: Command Bar */}
      <div className="flex items-center gap-4">
        {isOnboardingLocked ? (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl border border-warning-500/30 bg-warning-500/10">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-warning-600">Onboarding Locked</span>
            </div>
            <Button
              size="sm"
              variant="flat"
              color="danger"
              onPress={async () => { await logout(); router.push("/auth"); }}
              className="font-bold"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center bg-default-100/50 dark:bg-black/20 border border-default-200/50 dark:border-white/5 rounded-2xl p-1 gap-1 shadow-sm dark:shadow-none">
              <CurrencySelector />
              <div className="w-[1px] h-4 bg-default-300/50 dark:bg-white/10 mx-1" />
              
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-500 ${
                    unreadCount > 0 ? "bg-warning-500/15 text-warning-600" : "text-default-500 hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <FiBell size={18} className={unreadCount > 0 ? "animate-bounce" : ""} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger-500 rounded-full border-2 border-white dark:border-[#0B0F14]" />
                  )}
                </button>
                <AnimatePresence>
                  {isNotificationOpen && (
                    <div className="fixed right-6 top-[88px] z-[1000]">
                      <NotificationPanel onClose={() => setIsNotificationOpen(false)} />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Profile Command */}
            {/* Profile Command Center */}
            <Dropdown 
              {...({ placement: "bottom-end", className: "p-0" } as any)}
            >
              <DropdownTrigger>
                <button className="group flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-gradient-to-br from-warning-500/10 to-default-100 dark:to-white/5 border border-warning-500/20 hover:border-warning-500/40 transition-all outline-none">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-warning-500 to-amber-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-warning-500/20 group-hover:scale-105 transition-transform">
                    {username?.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start sr-only sm:not-sr-only">
                    <span className="text-[10px] font-black text-foreground uppercase tracking-wider leading-none mb-1">{username?.split('@')[0]}</span>
                    <span className="text-[8px] font-bold text-warning-600 dark:text-warning-500 uppercase tracking-widest leading-none opacity-80 italic">{displayRole}</span>
                  </div>
                </button>
              </DropdownTrigger>
              <DropdownMenu 
                {...({ 
                  "aria-label": "Tactical Profile Options", 
                  className: "w-80 p-2 bg-white/95 dark:bg-[#0B0F14]/95 backdrop-blur-2xl border border-black/5 dark:border-white/5 shadow-2xl rounded-[1.5rem]", 
                  itemClasses: { 
                    base: "rounded-xl py-3 px-4 transition-all duration-300",
                    title: "text-sm font-bold text-default-700 dark:text-default-200",
                    description: "text-[10px] text-default-400 font-medium"
                  } 
                } as any)}
              >
                <DropdownItem 
                  key="user-info" 
                  isReadOnly 
                  className="px-4 py-6 border-b border-default-100 dark:border-white/5 cursor-default mb-2"
                  textValue="User Profile Header"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warning-500 to-amber-600 flex items-center justify-center text-white text-lg font-black shadow-[0_8px_20px_rgba(245,165,36,0.3)]">
                      {username?.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-foreground uppercase tracking-wider">{username?.split('@')[0]}</span>
                      <span className="text-[9px] font-black text-warning-600 dark:text-warning-500 uppercase tracking-[0.2em] mt-1 italic">{displayRole}</span>
                    </div>
                  </div>
                </DropdownItem>

                <DropdownItem 
                  key="profile" 
                  startContent={<FiUser size={16} className="text-warning-500" />} 
                  onClick={() => router.push("/dashboard/profile")}
                  className="data-[hover=true]:bg-warning-500/10 data-[hover=true]:text-warning-600"
                  textValue="Account Master Control"
                >
                   <span className="font-bold tracking-tight">Management Portal</span>
                </DropdownItem>

                <DropdownItem key="lang" isReadOnly closeOnSelect={false} textValue="System Linguistics">
                   <div className="flex items-center justify-between gap-4 py-1">
                     <div className="flex items-center gap-2">
                       <FiGlobe size={16} className="text-primary-500" />
                       <span className="text-xs font-black uppercase tracking-widest dark:text-white/60">Node Language</span>
                     </div>
                     <LanguageSwitcher />
                   </div>
                </DropdownItem>

                <DropdownItem key="appearance" isReadOnly closeOnSelect={false} textValue="Visual Telemetry">
                   <div className="flex items-center justify-between gap-4 py-1">
                     <div className="flex items-center gap-2">
                       <FiSettings size={16} className="text-success-500" />
                       <span className="text-xs font-black uppercase tracking-widest dark:text-white/60">System Theme</span>
                     </div>
                     <ThemeSwitcher />
                   </div>
                </DropdownItem>

                <DropdownItem 
                   key="logout" 
                   className="mt-4 bg-danger-500/5 hover:bg-danger-500 text-danger-500 hover:text-white transition-all group" 
                   onClick={async () => { await logout(); router.push("/auth"); }}
                   textValue="Terminate Session"
                   startContent={<FiLogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />}
                >
                   <span className="font-black uppercase tracking-widest text-[11px]">Terminate Session</span>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </>
        )}
      </div>
    </div>

  );
};

export default TopBar;
