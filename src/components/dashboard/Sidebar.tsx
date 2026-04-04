"use client";

import React, { useContext, useState, useTransition } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useRouter, usePathname } from "next/navigation";
import AuthContext from "@/context/AuthContext";
import { routeRoles } from "@/utils/roleHelpers";
import { sidebarOptions } from "@/utils/utils";
import Image from "next/image";
import { Button, Tooltip } from "@heroui/react";
import { useSoundEffect } from "@/context/SoundContext";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { notificationRoutes } from "@/core/api/apiRoutes";

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useContext(AuthContext);
    const [, startTransition] = useTransition();
    const [pendingLink, setPendingLink] = useState<string | null>(null);

    const filteredOptions = sidebarOptions.filter((option) => {
        const allowedRoles = (routeRoles[option.link] || []).map((role) => String(role).toLowerCase());
        const userRole = String(user?.role || "").toLowerCase();
        if (!userRole) return false;
        if (userRole === "admin" && option.link === "/dashboard/company") return false;
        return allowedRoles.includes(userRole);
    });
    const optionMap = new Map(filteredOptions.map((option) => [option.link, option]));
    const sidebarSections = [
        {
            label: "",
            links: ["/dashboard"],
        },
        {
            label: "Product",
            links: [
                "/dashboard/product",
                "/dashboard/catalog",
                "/dashboard/marketplace",
            ],
        },
        {
            label: "Execution",
            links: [
                "/dashboard/enquiries",
                "/dashboard/sample-requests",
                "/dashboard/orders",
                "/dashboard/documents",
            ],
        },
        {
            label: "Services",
            links: [
               "/dashboard/imports",
               "/dashboard/external-orders",
               "/dashboard/execution-enquiries",
               "/dashboard/warehouse-rent",
            ],
        },
        {
            label: "News",
            links: ["/dashboard/news"],
        },
        {
            label: "Manage",
            links: [
                "/dashboard/inventory",
                "/dashboard/warehouses",
                "/dashboard/company",
                "/dashboard/companies",
                "/dashboard/notifications",
                "/dashboard/approvals",
                "/dashboard/reports",
                "/dashboard/profile",
            ],
        },
        {
            label: "Payments",
            links: [
                "/dashboard/payments",
            ],
        },
        {
            label: "Operator",
            links: [
                "/dashboard/operator/hierarchy",
                "/dashboard/operator/team",
                "/dashboard/operator/earnings",
            ],
        },
        {
            label: "Admin Tools",
            links: [
                "/dashboard/documentation-rules",
                "/dashboard/documentation-preview",
                "/dashboard/flow-rules",
                "/dashboard/operators/overview",
                "/dashboard/users",
                "/dashboard/essentials",
                "/dashboard/geosphere",
            ],
        },
    ];

    const { play } = useSoundEffect();

    const { data: unreadSummaryData } = useQuery({
        queryKey: ["notifications", "unread-summary"],
        queryFn: async () => {
            const res: any = await getData(notificationRoutes.unreadSummary);
            return res?.data?.data || {};
        },
        refetchInterval: 25000,
    });
    const unreadSummary = unreadSummaryData || {};
    const dotMap: Record<string, number> = {
        "/dashboard/notifications": Number(unreadSummary.notifications || 0),
        "/dashboard/approvals": Number(unreadSummary.approvals || 0),
        "/dashboard/enquiries": Number(unreadSummary.enquiries || 0),
        "/dashboard/orders": Number(unreadSummary.orders || 0),
        "/dashboard/execution-enquiries": Number(unreadSummary.execution || 0),
    };

    const handleOptionClick = (e: React.MouseEvent, optionLink: string) => {
        e.preventDefault();
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

    return (
        <div
            data-sidebar
            className={`fixed left-0 top-0 h-full z-50 transition-all duration-500 ease-in-out bg-content1/90 dark:bg-[#0B0F14] border-r border-default-200/50 dark:border-white/5 hidden md:flex flex-col ${isCollapsed ? "w-[84px]" : "w-[280px]"}`}
        >
            {/* Structural Accents */}
            <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-warning-500/10 to-transparent opacity-30" />
            
            {/* Toggle System */}
            <button
                onClick={() => { play("toggle"); setIsCollapsed(!isCollapsed); }}
                className="absolute -right-4 top-[84px] w-8 h-8 rounded-xl bg-background dark:bg-[#1A1F26] border border-default-200 dark:border-white/10 flex items-center justify-center text-default-400 hover:text-warning-600 hover:border-warning-500/50 transition-all shadow-lg z-50 group dark:shadow-black/40"
            >
                {isCollapsed ? <FiChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" /> : <FiChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />}
            </button>

            {/* Console Header */}
            <div className={`relative px-6 py-10 flex cursor-pointer group ${isCollapsed ? "justify-center" : "gap-4 items-center"}`} onClick={() => router.push("/dashboard")}>
                <div className="relative group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 bg-warning-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-default-100 to-transparent dark:from-white/10 dark:to-transparent border border-default-200 dark:border-white/10 flex items-center justify-center shadow-sm overflow-hidden">
                       <Image src="/logo.png" width={28} height={28} alt="Obaol" className="object-contain" />
                       <div className="absolute bottom-0 left-0 w-full h-[2px] bg-warning-500 opacity-50 shadow-[0_-4px_10px_rgba(245,165,36,0.5)]" />
                    </div>
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="font-black text-lg tracking-[0.25em] text-foreground leading-none">OBAOL</span>
                        <span className="text-[8px] font-black text-warning-600 dark:text-warning-500/60 tracking-[0.4em] uppercase mt-2">Supreme Execution</span>
                    </div>
                )}
            </div>

            {/* Navigation Array */}
            <div className="flex-1 px-4 space-y-6 overflow-y-auto no-scrollbar pb-10">
                {sidebarSections.map((section, idx) => {
                    const sectionOptions = section.links.map(l => optionMap.get(l)).filter(Boolean) as typeof filteredOptions;
                    if (sectionOptions.length === 0) return null;

                    return (
                        <div key={section.label || idx} className="space-y-2">
                            {!isCollapsed && section.label && (
                                <div className="px-3 flex items-center gap-3">
                                    <span className="text-[8px] font-black text-default-400 uppercase tracking-[0.3em] italic">{section.label}</span>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-default-200 dark:from-white/5 to-transparent" />
                                </div>
                            )}
                            <div className="space-y-0.5">
                                {sectionOptions.map((opt) => {
                                    const isDash = opt.link === "/dashboard";
                                    const isActive = isDash ? pathname === "/dashboard" : pathname.startsWith(opt.link);

                                    return (
                                        <button
                                            key={opt.name}
                                            onClick={(e) => handleOptionClick(e, opt.link)}
                                            className={`w-full group relative flex items-center h-10 rounded-xl transition-all duration-300 ${
                                                isActive 
                                                ? "bg-warning-500/10 text-warning-700 dark:text-white font-bold shadow-sm" 
                                                : "text-default-500 hover:text-foreground hover:bg-default-100"
                                            } ${isCollapsed ? "justify-center" : "px-3 gap-3"}`}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 w-[2.5px] h-5 bg-warning-500 rounded-r-full shadow-[0_0_10px_rgba(245,165,36,0.6)]" />
                                            )}
                                            <div className={`text-[18px] transition-all duration-500 ${isActive ? "text-warning-600 dark:text-warning-500 scale-110" : "group-hover:scale-110 group-hover:text-warning-500"}`}>
                                                {opt.icon}
                                            </div>
                                            {!isCollapsed && (
                                                <span className="text-[11px] tracking-[0.15em] uppercase font-black tabular-nums truncate">
                                                    {opt.name}
                                                </span>
                                            )}
                                            {isCollapsed && isActive && (
                                               <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-warning-500 shadow-[0_0_8px_rgba(245,165,36,0.6)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* System Identity Footer */}
            <div className="px-6 py-8 border-t border-default-200">
                {!isCollapsed ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[8px] font-black text-default-400 uppercase tracking-widest leading-none">Global Status</span>
                           <div className="flex gap-1">
                              <div className="w-1 h-3 bg-success-500/40 rounded-full" />
                              <div className="w-1 h-3 bg-success-500/40 rounded-full" />
                              <div className="w-1 h-3 bg-success-500 animate-pulse rounded-full" />
                           </div>
                        </div>
                        <p className="text-[9px] text-default-400 font-bold uppercase tracking-[0.2em] italic opacity-60">
                             &copy; {new Date().getFullYear()} OBAOL ARMS &bull; V4.2
                        </p>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-1 h-8 bg-gradient-to-b from-transparent via-warning-500/20 to-transparent rounded-full" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
