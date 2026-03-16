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
import { CiMenuBurger } from "react-icons/ci";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthContext from "@/context/AuthContext";
import { routeRoles } from "@/utils/roleHelpers";
import { sidebarOptions } from "@/utils/utils";
import Image from "next/image";
import CurrencySelector from "./Catalog/currency-selector";
import { FiBell, FiSettings, FiVolume2, FiVolumeX } from "react-icons/fi";
import NotificationPanel from "./NotificationPanel";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { notificationRoutes } from "@/core/api/apiRoutes";
import { AnimatePresence } from "framer-motion";
import { useSoundEffect } from "@/context/SoundContext";

const TopBar = ({ username, role }: TopbarProps) => {
  const { logout } = useContext(AuthContext);
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const { soundEnabled, setSoundEnabled, play } = useSoundEffect();
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

  // Filter options based on the user's role
  const filteredOptions = sidebarOptions.filter((option) => {
    const allowedRoles = routeRoles[option.link] || [];
    return allowedRoles.includes(role);
  });

  return (
    <div
      data-topbar
      className="relative z-50 flex text-foreground justify-between items-center px-4 py-2 my-2 mx-2 md:px-6 md:py-2.5 md:my-3 md:mx-4 rounded-2xl border border-default-300/70 dark:border-default-800/70 bg-gradient-to-r from-content1/98 via-content1/90 to-content1/98 backdrop-blur-xl shadow-lg transition-all duration-300"
    >
      {/* Left Section: Navigation & Identity */}
      <div className="flex gap-3 md:gap-4 items-center min-w-0">
        {/* Hamburger - Mobile only */}
        <div className="md:hidden">
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light" aria-label="Menu" className="min-w-10">
                <CiMenuBurger size={22} className="text-default-700" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              {...({
                "aria-label": "Sidebar Options",
                className: "text-foreground w-[240px]",
                itemClasses: { base: "py-2" },
              } as any)}
            >
              {filteredOptions.map((option) => (
                <DropdownItem
                  key={option.name}
                  textValue={option.name}
                  onPress={() => {
                    play("nav");
                    setTimeout(() => router.push(option.link), 50);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-warning-500 text-lg"> {option.icon}</span>
                    <span className="font-medium text-[13px]">{option.name}</span>
                  </div>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Identity - Hidden on mobile, visible on desktop */}
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

      {/* Brand / Logo (Visible on mobile, replaces Identity) */}
      <div className="md:hidden absolute left-1/2 -translate-x-1/2">
        <Image
          src={"/logo.png"}
          width={32}
          height={32}
          alt="Obaol"
          className="object-contain rounded-lg shadow-sm"
        />
      </div>

      {/* Right Section: Utilities & User Profile */}
      <div className="flex items-center gap-2 md:gap-3 pr-1">
        <CurrencySelector />
        <div className="relative" ref={notificationRef}>
          <Button
            isIconOnly
            variant="light"
            aria-label="Notifications"
            className="relative text-default-700 dark:text-default-100"
            onPress={() => setIsNotificationOpen((prev) => !prev)}
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-danger text-white text-[10px] leading-5 font-bold text-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
          <AnimatePresence>
            {isNotificationOpen && (
              <div className="fixed right-3 md:right-8 top-[76px] md:top-[92px] z-[100000]">
                <NotificationPanel onClose={() => setIsNotificationOpen(false)} />
              </div>
            )}
          </AnimatePresence>
        </div>

        <Dropdown {...({ placement: "bottom-end" } as any)}>
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
