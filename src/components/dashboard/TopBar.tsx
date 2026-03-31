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
import { FiBell, FiSettings, FiVolume2, FiVolumeX, FiX } from "react-icons/fi";
import NotificationPanel from "./NotificationPanel";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { notificationRoutes } from "@/core/api/apiRoutes";
import { AnimatePresence, motion } from "framer-motion";
import { useSoundEffect } from "@/context/SoundContext";

const TopBar = ({ username, role }: TopbarProps) => {
  const { logout } = useContext(AuthContext);
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const { soundEnabled, setSoundEnabled, play } = useSoundEffect();

  useEffect(() => {
    setMounted(true);
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
    { label: "Manage", links: ["/dashboard/inventory", "/dashboard/warehouses", "/dashboard/company", "/dashboard/companyProduct", "/dashboard/notifications", "/dashboard/approvals", "/dashboard/reports", "/dashboard/profile"] },
    { label: "Operator", links: ["/dashboard/operator/hierarchy", "/dashboard/operator/team", "/dashboard/operator/earnings"] },
    { label: "Admin Tools", links: ["/dashboard/documentation-rules", "/dashboard/documentation-preview", "/dashboard/flow-rules", "/dashboard/users", "/dashboard/essentials", "/dashboard/geosphere"] },
  ];

  return (
    <div
      data-topbar
      className="relative z-50 flex text-foreground justify-between items-center px-4 py-2 my-2 mx-2 md:px-6 md:py-2.5 md:my-3 md:mx-4 rounded-2xl border border-default-300/20 dark:border-default-800/15 bg-gradient-to-r from-content1/98 via-content1/90 to-content1/98 backdrop-blur-xl shadow-sm dark:shadow-lg transition-all duration-300"
    >
      {/* Left Section: Navigation & Identity */}
      <div className="flex gap-1 md:gap-4 items-center min-w-0">
        {/* Side Drawer - Mobile only */}
        <div className="md:hidden">
          <button
            aria-label="Open Menu"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-default-600 hover:bg-default-100 active:scale-95 transition-all"
          >
            <CiMenuBurger size={20} />
          </button>

          {mounted && createPortal(
            <AnimatePresence>
              {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[999999]">
                  {/* Frosted Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute inset-0 bg-black/55 backdrop-blur-[6px] z-[0]"
                  />

                  {/* Side Sheet */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 32, stiffness: 320, mass: 0.7 }}
                    className="absolute top-0 left-0 bottom-0 w-[290px] max-w-[88vw] flex flex-col z-[1] bg-white dark:bg-[#0d0d0d] shadow-[4px_0_48px_rgba(0,0,0,0.3)]"
                  >
                    {/* ── Drawer Header ── */}
                    <div className="relative flex-shrink-0 px-5 pt-10 pb-4 overflow-hidden">
                      {/* Warm ambient glow */}
                      <div className="absolute -top-8 -left-8 w-48 h-48 bg-warning-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-default-200 dark:via-white/8 to-transparent" />

                      {/* Logo + Brand */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-warning-400/30 blur-md" />
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-warning-400/20 to-warning-600/10 border border-warning-400/25 flex items-center justify-center">
                              <Image src="/logo.png" width={22} height={22} alt="Obaol" className="object-contain" />
                            </div>
                          </div>
                          <div>
                            <p className="font-black text-[13px] tracking-[0.3em] text-foreground uppercase leading-none">OBAOL</p>
                            <p className="text-[9px] font-black text-warning-500 uppercase tracking-[0.25em] leading-none mt-1.5">SUPREME</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-default-400 hover:text-foreground hover:bg-default-100 dark:hover:bg-white/8 transition-all active:scale-90"
                        >
                          <FiX size={15} />
                        </button>
                      </div>
                    </div>

                    {/* ── Nav Items ── */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3">
                      <div className="flex flex-col gap-5">
                        {mobileSections.map((section, si) => {
                          const sectionItems = section.links
                            .map((link) => optionMap.get(link))
                            .filter(Boolean) as typeof filteredOptions;
                          if (sectionItems.length === 0) return null;
                          return (
                            <div key={section.label || si}>
                              {section.label && (
                                <div className="flex items-center gap-2 px-2 mb-2">
                                  <span className="text-[8px] font-black uppercase tracking-[0.32em] text-default-400">{section.label}</span>
                                  <div className="flex-1 h-[1px] bg-gradient-to-r from-default-200/80 dark:from-white/8 to-transparent" />
                                </div>
                              )}
                              <div className="space-y-0.5">
                                {sectionItems.map((option) => {
                                  const isDashboard = option.link === "/dashboard";
                                  const isActive = isDashboard
                                    ? pathname === "/dashboard"
                                    : pathname === option.link || pathname.startsWith(`${option.link}/`);
                                  return (
                                    <button
                                      key={option.name}
                                      onClick={() => {
                                        play("nav");
                                        setIsMobileMenuOpen(false);
                                        setTimeout(() => router.push(option.link), 50);
                                      }}
                                      className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 text-left group ${isActive
                                        ? "bg-warning-500/8 dark:bg-warning-500/6"
                                        : "hover:bg-default-100/60 dark:hover:bg-white/4 active:bg-default-100 dark:active:bg-white/8"
                                        }`}
                                    >
                                      {isActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-warning-500 rounded-r-full" />
                                      )}
                                      <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-[17px] transition-all duration-200 ${isActive
                                        ? "bg-warning-500/12 text-warning-500"
                                        : "text-default-400 group-hover:text-warning-500 group-hover:bg-warning-500/8"
                                        }`}>
                                        {option.icon}
                                      </span>
                                      <span className={`text-[13px] font-semibold tracking-[-0.01em] transition-colors flex-1 ${isActive
                                        ? "text-warning-600 dark:text-warning-400"
                                        : "text-foreground/75 dark:text-default-300 group-hover:text-foreground"
                                        }`}>
                                        {option.name}
                                      </span>
                                      {isActive && (
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-warning-500" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>



                    {/* ── Currency Selector (Mobile) ── */}
                    <div className="flex-shrink-0 px-4 py-3 border-t border-default-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">Currency</span>
                      <CurrencySelector isMobile={true} />
                    </div>

                    {/* ── Drawer Footer — User Identity ── */}
                    <div className="flex-shrink-0 px-4 py-4 border-t border-default-100 dark:border-white/5">
                      <div className="flex items-center gap-3 px-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-warning-400 to-warning-600 flex items-center justify-center text-white text-[10px] font-black shadow-md flex-shrink-0">
                          {username?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-bold text-foreground truncate leading-tight">{username}</p>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-default-400 leading-none mt-0.5">{displayRole}</p>
                        </div>
                        <span className="flex-shrink-0 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-wide border bg-warning-500/8 border-warning-400/20 text-warning-600 dark:text-warning-400">
                          {role}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </div>

        {/* Mobile Brand inline */}
        <div className="md:hidden flex items-center gap-2">
          <Image src="/logo.png" width={26} height={26} alt="Obaol" className="object-contain rounded-lg" />
          <span className="font-black text-[10px] tracking-[0.28em] text-foreground/70 uppercase select-none">SUPREME</span>
        </div>

        {/* Identity - Desktop only */}
        <div className="hidden md:flex flex-col min-w-0 pr-4">
          <h1 className="text-[15px] font-bold text-foreground tracking-tight truncate">
            {displayRole} Panel
          </h1>
          <p className="text-[10px] text-default-500 font-medium truncate uppercase tracking-widest leading-none mt-0.5">
            {new Date().getHours() < 12
              ? "Good Morning"
              : new Date().getHours() < 18
                ? "Good Afternoon"
                : "Good Evening"}
          </p>
        </div>
      </div>

      {/* Right Section: Utilities & User Profile */}
      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Currency - hide on very small screens, show on sm+ */}
        <div className="hidden sm:block">
          <CurrencySelector />
        </div>

        {/* Notification bell */}
        <div className="relative" ref={notificationRef}>
          <button
            aria-label="Notifications"
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 ${unreadCount > 0
              ? "bg-warning-500/15 text-warning-600 shadow-[0_0_12px_rgba(234,179,8,0.4)]"
              : "text-default-500 hover:bg-default-100 dark:hover:bg-white/5"
              }`}
          >
            <FiBell size={18} className={unreadCount > 0 ? "scale-110" : ""} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 rounded-full flex items-center justify-center text-white text-[8px] font-black border-2 border-white dark:border-black">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {isNotificationOpen && (
              <div className="fixed right-3 md:right-8 top-[68px] md:top-[92px] z-[100000]">
                <NotificationPanel onClose={() => setIsNotificationOpen(false)} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar / User dropdown */}
        <Dropdown
          {...({ placement: "bottom-end" } as any)}
          classNames={{ content: "border border-default-300 dark:border-default-700 bg-content1 shadow-2xl dark:shadow-black" }}
        >
          <DropdownTrigger>
            <User
              as="button"
              avatarProps={{
                isBordered: true,
                color: "warning",
                size: "sm",
                src: ""
              }}
              className="transition-transform"
              name={username}
              description={<span className="text-default-500 font-medium capitalize hidden md:block">{role}</span>}
              classNames={{
                name: "text-foreground font-bold hidden md:block leading-tight",
                description: "text-default-500"
              }}
            />
          </DropdownTrigger>
          <DropdownMenu
            {...({
              "aria-label": "User Actions",
              variant: "flat",
              className: "text-foreground min-w-[290px]",
              itemClasses: { base: "rounded-lg data-[hover=true]:bg-default-100" },
            } as any)}
          >
            <DropdownItem key="profile" className="h-14 gap-2 ">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold text-warning-500">{username}</p>
            </DropdownItem>
            <DropdownItem
              key="dashboard"
              onClick={() => router.push("/dashboard/profile")}
            >
              My Profile
            </DropdownItem>
            <DropdownItem key="prefs-header" isReadOnly textValue="Preferences">
              <div className="flex items-center gap-2 text-default-500 text-xs font-semibold uppercase tracking-wide">
                <FiSettings size={13} />
                Preferences
              </div>
            </DropdownItem>
            <DropdownItem key="prefs-divider" isReadOnly className="p-0 h-auto" textValue="Divider">
              <Divider />
            </DropdownItem>
            <DropdownItem key="language-control" closeOnSelect={false} textValue="Language control">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-default-600">Language</span>
                <LanguageSwitcher />
              </div>
            </DropdownItem>
            <DropdownItem key="theme-control" closeOnSelect={false} textValue="Theme control">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-default-600">Theme</span>
                <ThemeSwitcher />
              </div>
            </DropdownItem>
            <DropdownItem key="sound-control" closeOnSelect={false} textValue="Sound control">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-default-600">Sounds</span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${soundEnabled
                    ? "bg-warning-500/15 text-warning-600"
                    : "bg-default-100 text-default-400"
                    }`}
                >
                  {soundEnabled ? <FiVolume2 size={13} /> : <FiVolumeX size={13} />}
                  {soundEnabled ? "On" : "Off"}
                </button>
              </div>
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              onClick={async () => {
                await logout();
                router.push("/auth");
              }}
            >
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default TopBar;
