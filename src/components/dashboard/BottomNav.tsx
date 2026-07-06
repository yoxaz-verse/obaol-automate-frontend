"use client";

import React, { useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MdDashboard } from "react-icons/md";
import { AiOutlineProduct } from "react-icons/ai";
import { RiFileAddLine, RiUser2Fill } from "react-icons/ri";
import { LuWarehouse } from "react-icons/lu";
import { FiShoppingBag } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { getAccessibleDashboardRoutes } from "@/utils/dashboardAccess";

const BottomNav = ({ isOnboardingLocked = false }: { isOnboardingLocked?: boolean }) => {
    const pathname = usePathname();
    const { user } = useContext(AuthContext);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const scrollContainer = document.querySelector<HTMLElement>("[data-dashboard-scroll]");
        if (!scrollContainer) return;
        let lastScrollY = scrollContainer.scrollTop;
        const deltaThreshold = 8;
        const topSafeThreshold = 24;

        const handleScroll = () => {
            const currentScrollY = scrollContainer.scrollTop;
            const delta = currentScrollY - lastScrollY;

            if (currentScrollY <= topSafeThreshold) {
                setIsVisible(true);
                lastScrollY = currentScrollY;
                return;
            }

            if (delta > deltaThreshold) {
                setIsVisible(false);
            } else if (delta < -deltaThreshold) {
                setIsVisible(true);
            }

            lastScrollY = currentScrollY;
        };

        scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
        return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        {
            name: "Dashboard",
            icon: <MdDashboard size={24} />,
            link: "/dashboard",
        },
        {
            name: "Products",
            icon: <AiOutlineProduct size={24} />,
            link: "/dashboard/product",
        },
        {
            name: "Trade Listings",
            icon: <LuWarehouse size={24} />,
            link: "/dashboard/marketplace",
        },
        {
            name: "Enquiries",
            icon: <RiFileAddLine size={24} />,
            link: "/dashboard/enquiries",
        },
        {
            name: "Orders",
            icon: <FiShoppingBag size={24} />,
            link: "/dashboard/orders",
        },
        {
            name: "Profile",
            icon: <RiUser2Fill size={24} />,
            link: "/dashboard/profile",
        },
    ];

    const mobileRoutes = getAccessibleDashboardRoutes({
        role: user?.role,
        tradeMode: user?.tradeMode,
        companyInterests: user?.companyInterests || [],
    })
        .filter((route) => route.mobilePriority)
        .sort((a, b) => Number(a.mobilePriority) - Number(b.mobilePriority))
        .slice(0, 5);
    const allowedMobileLinks = new Set(mobileRoutes.map((route) => route.path));
    const filteredNavItems = navItems.filter((item) => allowedMobileLinks.has(item.link));

    return (
        <div
            data-bottomnav
            className={`fixed bottom-3 left-4 right-4 z-[100] h-16 db-shell backdrop-blur-2xl border db-border-subtle rounded-2xl md:hidden overflow-hidden transition-all duration-300 ease-out ${
                isVisible ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-[calc(100%+1.5rem)] opacity-0 pointer-events-none"
            }`}
            style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-obaol-500/20 to-transparent" />
            <div className="flex justify-around items-center h-full px-2 max-w-lg mx-auto">
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.link;
                    const isDisabled = isOnboardingLocked;
                    return (
                        isDisabled ? (
                            <div
                                key={item.name}
                                className={`relative flex flex-col items-center justify-center min-w-[64px] h-full transition-all duration-300 opacity-40 cursor-not-allowed ${
                                    isActive ? "text-obaol-700 dark:text-obaol-300" : "text-default-400"
                                }`}
                                aria-disabled="true"
                            >
                                {isActive && (
                                    <div className="absolute -top-[1px] w-8 h-[2px] bg-obaol-500 rounded-full shadow-[0_2px_10px_rgba(207,152,60,0.5)]" />
                                )}
                                <div className={`transition-all duration-500 ${isActive ? "scale-110 -translate-y-1 mb-1" : "opacity-70"}`}>
                                    {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${isActive ? "opacity-100 -translate-y-0.5" : "opacity-0 translate-y-1 h-0"}`}>
                                    {item.name.slice(0, 8)}
                                </span>
                            </div>
                        ) : (
                            <Link
                                key={item.name}
                                href={item.link}
                                className={`relative flex flex-col items-center justify-center min-w-[64px] h-full transition-all duration-300 ${
                                    isActive ? "text-obaol-700 dark:text-obaol-300" : "text-default-400 group-hover:text-foreground"
                                }`}
                            >
                            {isActive && (
                                <div className="absolute -top-[1px] w-8 h-[2px] bg-obaol-500 rounded-full shadow-[0_2px_10px_rgba(207,152,60,0.5)]" />
                            )}
                            <div className={`transition-all duration-500 ${isActive ? "scale-110 -translate-y-1 mb-1" : "opacity-70"}`}>
                                {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${isActive ? "opacity-100 -translate-y-0.5" : "opacity-0 translate-y-1 h-0"}`}>
                                {item.name.slice(0, 8)}
                            </span>
                            </Link>
                        )
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
