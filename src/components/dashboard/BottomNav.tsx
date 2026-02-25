"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { MdDashboard } from "react-icons/md";
import { AiOutlineProduct } from "react-icons/ai";
import { RiFileAddLine, RiUser2Fill } from "react-icons/ri";
import { LuWarehouse } from "react-icons/lu";

const BottomNav = () => {
    const router = useRouter();
    const pathname = usePathname();

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
            name: "Marketplace",
            icon: <LuWarehouse size={24} />,
            link: "/dashboard/marketplace",
        },
        {
            name: "Enquiries",
            icon: <RiFileAddLine size={24} />,
            link: "/dashboard/enquires",
        },
        {
            name: "Profile",
            icon: <RiUser2Fill size={24} />,
            link: "/dashboard/profile",
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-content1 border-t border-default-200 px-4 py-2 md:hidden">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.link;
                    return (
                        <button
                            key={item.name}
                            onClick={() => router.push(item.link)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${isActive ? "text-warning-500" : "text-default-500 hover:text-foreground"
                                }`}
                        >
                            <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
