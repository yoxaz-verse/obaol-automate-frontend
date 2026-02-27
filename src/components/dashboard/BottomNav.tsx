"use client";

import React, { useContext } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MdDashboard } from "react-icons/md";
import { AiOutlineProduct } from "react-icons/ai";
import { RiFileAddLine, RiUser2Fill } from "react-icons/ri";
import { LuWarehouse } from "react-icons/lu";
import { FiShoppingBag } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { routeRoles } from "@/utils/roleHelpers";

const BottomNav = () => {
    const pathname = usePathname();
    const { user } = useContext(AuthContext);

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

    const filteredNavItems = navItems.filter((item) => {
        const allowedRoles = routeRoles[item.link] || [];
        return user?.role ? allowedRoles.includes(user.role) : false;
    });

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-content1 border-t border-default-200 px-4 py-2 md:hidden">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.link;
                    return (
                        <Link
                            key={item.name}
                            href={item.link}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${isActive ? "text-warning-500" : "text-default-500 hover:text-foreground"
                                }`}
                        >
                            <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
