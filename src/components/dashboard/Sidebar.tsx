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
        const allowedRoles = routeRoles[option.link] || [];
        return user?.role ? allowedRoles.includes(user.role) : false;
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
                "/dashboard/imports",
            ],
        },
        {
            label: "Execution",
            links: [
                "/dashboard/enquiries",
                "/dashboard/orders",
                "/dashboard/execution-enquiries",
                "/dashboard/documents",
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
                "/dashboard/companyProduct",
                "/dashboard/notifications",
                "/dashboard/approvals",
                "/dashboard/reports",
                "/dashboard/profile",
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
            className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out bg-content1/80 backdrop-blur-xl border-r border-default-200/50 hidden md:flex flex-col ${isCollapsed ? "w-[72px]" : "w-[240px]"
                }`}
        >
            {/* Toggle Button */}
            <Button
                isIconOnly
                variant="flat"
                size="sm"
                className="absolute -right-3 top-[72px] w-6 h-6 bg-content1 border border-default-200/50 rounded-full z-40 hover:bg-default-100 shadow-sm"
                onPress={() => {
                    play("toggle");
                    setIsCollapsed(!isCollapsed);
                }}
            >
                {isCollapsed ? <FiChevronRight size={12} className="text-default-500" /> : <FiChevronLeft size={12} className="text-default-500" />}
            </Button>

            {/* Header / Logo */}
            <div className={`flex items-center px-4 py-6 overflow-hidden mt-2 ${isCollapsed ? "justify-center" : "justify-start gap-4"}`}>
                <div className="flex-shrink-0 flex justify-center transform transition-transform duration-300 hover:scale-105">
                    <Image
                        src={"/logo.png"}
                        width={36}
                        height={36}
                        alt="Obaol"
                        className="rounded-lg object-contain shadow-sm"
                    />
                </div>
                {!isCollapsed && (
                    <span className="font-extrabold text-sm tracking-[0.25em] text-foreground/80 whitespace-nowrap uppercase select-none opacity-90">
                        SUPREME
                    </span>
                )}
            </div>

            {/* Navigation Options */}
            <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto no-scrollbar pb-6">
                {sidebarSections.map((section, index) => {
                    const sectionOptions = section.links
                        .map((link) => optionMap.get(link))
                        .filter(Boolean) as typeof filteredOptions;
                    if (sectionOptions.length === 0) return null;

                    return (
                        <div key={section.label || index} className="space-y-1.5">
                            {!isCollapsed && section.label && (
                                <div className="px-2 pt-1 text-[10px] uppercase tracking-[0.25em] text-default-400/80 font-semibold">
                                    {section.label}
                                </div>
                            )}
                            {sectionOptions.map((option, index) => {
                                const isDashboardLink = option.link === "/dashboard";
                                const isActive = isDashboardLink
                                    ? pathname === "/dashboard"
                                    : pathname === option.link || pathname.startsWith(`${option.link}/`);
                                const isPendingItem = pendingLink === option.link;
                                const hasDot = (dotMap[option.link] || 0) > 0 && !isActive;
                                const content = (
                                    <Link
                                        key={`${section.label}-${index}`}
                                        href={option.link}
                                        onClick={(e) => handleOptionClick(e, option.link)}
                                        aria-busy={isPendingItem}
                                        className={`group relative flex items-center px-3 py-2.5 cursor-pointer rounded-lg transition-all duration-200 ${isActive
                                            ? "bg-default-100/60 dark:bg-default-50/10 text-warning-600 dark:text-warning-400 font-semibold"
                                            : isPendingItem
                                                ? "bg-warning-500/5 text-warning-500/70"
                                                : "text-default-500 hover:bg-default-100/50 hover:text-foreground font-medium"
                                            } ${isCollapsed ? "justify-center" : "gap-3.5"}`}
                                    >
                                        {(isActive || isPendingItem) && (
                                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-warning-500 rounded-r-full transition-all ${isPendingItem ? "opacity-50 animate-pulse h-3" : "opacity-100"}`} />
                                        )}

                                        <div
                                            className={`flex-shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : isPendingItem ? "scale-100" : "group-hover:scale-110"
                                                }`}
                                        >
                                            {React.cloneElement(option.icon as React.ReactElement, { size: 18 })}
                                        </div>

                                        {!isCollapsed && (
                                            <span className="text-[13px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis leading-none flex-1 mt-0.5">
                                                {option.name}
                                            </span>
                                        )}

                                        {hasDot && (
                                            <span
                                                className={`ml-auto ${isCollapsed ? "absolute top-2 right-2" : ""} w-2 h-2 rounded-full bg-success-500`}
                                            />
                                        )}

                                        {isPendingItem && !isCollapsed && (
                                            <span className="flex-shrink-0 inline-flex items-center gap-[2px]">
                                                <span className="w-1 h-1 rounded-full bg-warning-500 animate-pulse" />
                                                <span className="w-1 h-1 rounded-full bg-warning-500 animate-pulse [animation-delay:150ms]" />
                                                <span className="w-1 h-1 rounded-full bg-warning-500 animate-pulse [animation-delay:300ms]" />
                                            </span>
                                        )}
                                    </Link>
                                );

                                if (isCollapsed) {
                                    return (
                                        <Tooltip key={`${section.label}-${index}`} content={option.name} placement="right" color="default" closeDelay={0} showArrow={true} classNames={{ content: "text-xs font-medium px-2 py-1" }}>
                                            {content}
                                        </Tooltip>
                                    );
                                }

                                return content;
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            {!isCollapsed && (
                <div className="p-4 border-t border-default-200/30">
                    <p className="text-[9px] text-default-400/80 text-center uppercase tracking-[0.2em] font-bold">
                        &copy; {new Date().getFullYear()} Obaol
                    </p>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
