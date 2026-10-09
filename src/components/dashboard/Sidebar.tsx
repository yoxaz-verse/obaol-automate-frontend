"use client";

import React, { useContext, useState, useTransition } from "react";
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useRouter, usePathname } from "next/navigation";
import AuthContext from "@/context/AuthContext";
import { sidebarOptions } from "@/utils/utils";
import { getDashboardSidebarSections, getRoleFilteredSidebarOptions, isComingSoonDashboardNavigation } from "@/utils/dashboardNav";
import { isDashboardRouteActive } from "@/utils/dashboardAccess";
import Image from "next/image";
import { Button, Tooltip } from "@nextui-org/react";
import { useSoundEffect } from "@/context/SoundContext";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { notificationRoutes, supportChatRoutes } from "@/core/api/apiRoutes";

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isOnboardingLocked?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, isOnboardingLocked = false }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useContext(AuthContext);
    const [, startTransition] = useTransition();
    const [pendingLink, setPendingLink] = useState<string | null>(null);
    const [openAdminGroup, setOpenAdminGroup] = useState<string | null>(null);

    const filteredOptions = getRoleFilteredSidebarOptions(
        sidebarOptions as any[],
        String(user?.role || ""),
        [...(user?.providedCapabilities || []), ...(user?.soughtCapabilities || [])]
    );
    const optionMap = new Map(filteredOptions.map((option) => [option.link, option]));
    const sidebarSections = getDashboardSidebarSections(
        filteredOptions as any[],
        String(user?.role || ""),
        [...(user?.providedCapabilities || []), ...(user?.soughtCapabilities || [])]
    );
    const activeAdminGroup = sidebarSections
        .find((section) => section.label === "Operations/Admin")
        ?.groups?.find((group) => group.links.some((link) => pathname === link || pathname.startsWith(`${link}/`)));

    const { play } = useSoundEffect();

    const { data: unreadSummaryData } = useQuery({
        queryKey: ["notifications", "unread-summary"],
        queryFn: async () => {
            const res: any = await getData(notificationRoutes.unreadSummary);
            return res?.data?.data || {};
        },
        enabled: Boolean(user?.id),
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
    const unreadSummary = unreadSummaryData || {};
    const { data: supportAvailability } = useQuery({
        queryKey: ["support", "availability", "sidebar"],
        queryFn: async () => (await getData(supportChatRoutes.availability, {}, { cacheMode: "bypass" }))?.data?.data || {},
        enabled: Boolean(user?.id),
        refetchInterval: 10 * 1000,
        staleTime: 5 * 1000,
    });
    const isSupportStaff = ["admin", "customersupport", "customer-support"].includes(String(user?.role || "").toLowerCase());
    const dotMap: Record<string, number> = {
        "/dashboard/notifications": Number(unreadSummary.notifications || 0),
        "/dashboard/approvals": Number(unreadSummary.approvals || 0),
        "/dashboard/enquiries": Number(unreadSummary.enquiries || 0),
        "/dashboard/orders": Number(unreadSummary.orders || 0),
        "/dashboard/inventory": Number(unreadSummary.inventory || 0),
        "/dashboard/execution-enquiries": Number(unreadSummary.execution || 0) + Number(unreadSummary.bidding || 0),
        "/dashboard/customer-support": isSupportStaff ? Number(supportAvailability?.waitingCount || 0) : Number(unreadSummary.support || 0),
    };

    const handleOptionClick = (e: React.MouseEvent, optionLink: string) => {
        e.preventDefault();
        if (isOnboardingLocked) return;
        if (isComingSoonDashboardNavigation(optionLink, user?.role)) return;
        if (pathname === optionLink) return;

        play("nav");
        setPendingLink(optionLink);
        startTransition(() => {
            router.push(optionLink);
        });
    };

    // Reset pending link when pathname matches
    React.useEffect(() => {
        if (pathname === pendingLink || pathname.startsWith(pendingLink + "/")) {
            setPendingLink(null);
        }
    }, [pathname, pendingLink]);

    const activeAdminGroupLabel = activeAdminGroup?.label;
    React.useEffect(() => {
        if (activeAdminGroupLabel) setOpenAdminGroup(activeAdminGroupLabel);
    }, [activeAdminGroupLabel]);

    const renderOption = (opt: (typeof filteredOptions)[number], nested = false) => {
        const isComingSoon = isComingSoonDashboardNavigation(opt.link, user?.role);
        const isActive = !isComingSoon && isDashboardRouteActive(pathname, opt.link);
        const badgeCount = Number(dotMap[opt.link] || 0);
        const isDisabled = isOnboardingLocked || isComingSoon;
        const showSupportOnline = opt.link === "/dashboard/customer-support" && Boolean(supportAvailability?.online);

        return (
            <button
                key={opt.name}
                onClick={(e) => handleOptionClick(e, opt.link)}
                disabled={isDisabled}
                title={isCollapsed && isComingSoon ? `${opt.name} — Coming soon` : undefined}
                className={`w-full group relative flex items-center h-10 rounded-xl transition-all duration-300 ${
                    isActive
                    ? "bg-obaol-500/10 text-obaol-700 dark:text-obaol-200 font-bold shadow-sm"
                    : "text-default-500 hover:text-foreground hover:db-inset"
                } ${isCollapsed ? "justify-center" : `${nested ? "pl-6 pr-3" : "px-3"} gap-3`} ${isDisabled ? "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-default-500" : ""}`}
                aria-disabled={isDisabled}
                aria-current={isActive ? "page" : undefined}
                aria-label={isComingSoon ? `${opt.name}, coming soon` : opt.name}
            >
                {isActive && (
                    <div className="absolute left-0 w-[2.5px] h-5 bg-obaol-500 rounded-r-full shadow-[0_0_10px_rgba(207,152,60,0.6)]" />
                )}
                <div className={`text-[18px] transition-all duration-500 ${isActive ? "text-obaol-700 dark:text-obaol-300 scale-110" : !isDisabled ? "group-hover:scale-110 group-hover:text-obaol-500" : ""}`}>
                    {opt.icon}
                </div>
                {!isCollapsed && (
                    <span className="text-[11px] tracking-[0.15em] uppercase font-black tabular-nums truncate">
                        {opt.name}
                    </span>
                )}
                {!isCollapsed && isComingSoon && (
                    <span className="ml-auto shrink-0 rounded-full border border-obaol-500/25 bg-obaol-500/10 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-obaol-700 dark:text-obaol-300">
                        Coming soon
                    </span>
                )}
                {!isCollapsed && !isComingSoon && badgeCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-danger-500 text-white text-[9px] font-black tracking-widest">
                        {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                )}
                {!isCollapsed && !isComingSoon && badgeCount === 0 && showSupportOnline && (
                    <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Customer support online" />
                )}
                {isCollapsed && !isComingSoon && badgeCount > 0 && (
                    <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-danger-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                )}
                {isCollapsed && !isComingSoon && badgeCount === 0 && showSupportOnline && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                )}
                {isCollapsed && isComingSoon && (
                    <span aria-hidden="true" className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-obaol-500" />
                )}
                {isCollapsed && isActive && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-obaol-500 shadow-[0_0_8px_rgba(207,152,60,0.6)]" />
                )}
            </button>
        );
    };

    return (
        <div
            data-sidebar
            aria-label="Workspace navigation"
            className={`fixed left-0 top-0 h-full min-h-0 z-50 transition-all duration-500 ease-in-out db-shell border-r db-border-subtle hidden md:flex flex-col backdrop-blur-[22px] ${isCollapsed ? "w-[84px]" : "w-[280px]"}`}
        >
            {/* Structural Accents */}
            <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-obaol-500/10 to-transparent opacity-30" />
            
            {/* Toggle System */}
            <button
                type="button"
                aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
                onClick={() => { play("toggle"); setIsCollapsed(!isCollapsed); }}
                className="absolute -right-4 top-[84px] w-8 h-8 rounded-xl db-panel border db-border-strong flex items-center justify-center text-default-400 hover:text-obaol-700 dark:hover:text-obaol-300 hover:border-obaol-500/50 transition-all shadow-lg z-50 group"
            >
                {isCollapsed ? <FiChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" /> : <FiChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />}
            </button>

            {/* Console Header */}
            <div
                className={`relative px-6 py-10 flex cursor-pointer group ${isCollapsed ? "justify-center" : "gap-4 items-center"} ${isOnboardingLocked ? "cursor-not-allowed opacity-70" : ""}`}
                onClick={() => {
                    if (isOnboardingLocked) return;
                    router.push("/dashboard");
                }}
            >
                <div className="relative group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 bg-obaol-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-default-100 to-transparent dark:from-white/10 dark:to-transparent border border-default-200 dark:border-white/10 flex items-center justify-center shadow-sm overflow-hidden">
                       <Image src="/logo.png" width={28} height={28} alt="Obaol" className="object-contain" />
                       <div className="absolute bottom-0 left-0 w-full h-[2px] bg-obaol-500 opacity-50 shadow-[0_-4px_10px_rgba(207,152,60,0.5)]" />
                    </div>
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="font-black text-lg tracking-[0.25em] text-foreground leading-none">OBAOL</span>
                        <span className="mt-2 text-[8px] font-bold uppercase tracking-[0.3em] text-obaol-700 dark:text-obaol-300/70">Trade workspace</span>
                    </div>
                )}
            </div>

            {/* Navigation Array */}
            <div className="flex-1 min-h-0 px-4 space-y-6 overflow-y-auto overscroll-contain no-scrollbar pb-10">
                {isOnboardingLocked && !isCollapsed && (
                    <div className="mx-2 mb-2 rounded-xl border border-obaol-500/20 bg-obaol-500/10 px-3 py-2">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-obaol-700 dark:text-obaol-300">
                            Complete onboarding to unlock navigation
                        </p>
                    </div>
                )}
                {sidebarSections.map((section, idx) => {
                    const sectionOptions = section.links.map(l => optionMap.get(l)).filter(Boolean) as typeof filteredOptions;
                    if (sectionOptions.length === 0) return null;

                    return (
                        <div key={section.label || idx} className="space-y-2">
                            {!isCollapsed && section.label && (
                                <div className="px-3 flex items-center gap-3">
                                    <span className="text-[10px] font-semibold text-default-500 uppercase tracking-[0.12em]">{section.label}</span>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-default-200 dark:from-white/5 to-transparent" />
                                </div>
                            )}
                            <div className="space-y-0.5">
                                {!isCollapsed && section.groups ? section.groups.map((group) => {
                                    const isOpen = openAdminGroup === group.label;
                                    const hasActiveLink = group.links.some((link) => isDashboardRouteActive(pathname, link));
                                    return (
                                        <div key={group.label} className="space-y-0.5">
                                            <button
                                                type="button"
                                                aria-expanded={isOpen}
                                                onClick={() => setOpenAdminGroup(isOpen ? null : group.label)}
                                                className={`w-full h-9 px-3 flex items-center justify-between rounded-xl text-[9px] font-black uppercase tracking-[0.18em] transition-colors ${hasActiveLink ? "text-obaol-700 dark:text-obaol-300" : "text-default-400 hover:text-foreground hover:db-inset"}`}
                                            >
                                                <span className="truncate">{group.label}</span>
                                                <FiChevronDown size={13} className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                                            </button>
                                            {isOpen && (
                                                <div className="space-y-0.5 border-l border-default-200/70 dark:border-white/10 ml-3 pl-1">
                                                    {group.links.map((link) => optionMap.get(link)).filter(Boolean).map((opt) => renderOption(opt!, true))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }) : sectionOptions.map((opt) => renderOption(opt))}
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default Sidebar;
