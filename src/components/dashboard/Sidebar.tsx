"use client";

import React, { useState, useEffect, useContext } from "react";
import {
  FiFileText,
  FiInbox,
  FiMessageCircle,
  FiSettings,
  FiUsers,
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { RiBuildingLine } from "react-icons/ri";
import { useRouter, usePathname } from "next/navigation";
import AuthContext from "@/context/AuthContext";
import { routeRoles } from "@/utils/roleHelpers";
import { sidebarOptions } from "@/utils/utils";
import Image from "next/image";
import { Button, Tooltip } from "@heroui/react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useContext(AuthContext);
  const [selectedOption, setSelectedOption] = useState<string>("dashboard");

  useEffect(() => {
    const pathSegments = pathname.split("/").filter(Boolean);
    let currentOption = "dashboard";

    if (pathSegments[0] === "dashboard") {
      currentOption = pathSegments[1] || "dashboard";
    } else {
      currentOption = pathSegments[0];
    }

    setSelectedOption(currentOption.toLowerCase());
  }, [pathname]);

  const filteredOptions = sidebarOptions.filter((option) => {
    const allowedRoles = routeRoles[option.link] || [];
    return user?.role ? allowedRoles.includes(user.role) : false;
  });

  const handleOptionClick = (optionLink: string, optionName: string) => {
    setSelectedOption(optionName.toLowerCase());
    router.push(optionLink);
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 bg-content1 border-r border-default-200 hidden md:flex flex-col ${isCollapsed ? "w-[80px]" : "w-[280px]"
        }`}
    >
      {/* Toggle Button */}
      <Button
        isIconOnly
        variant="flat"
        size="sm"
        className="absolute -right-3 top-20 bg-content1 border border-default-200 rounded-full z-50 hover:bg-default-100"
        onPress={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
      </Button>

      {/* Header / Logo */}
      <div className={`flex items-center px-4 py-8 overflow-hidden ${isCollapsed ? "justify-center" : "justify-start gap-4"}`}>
        <div className="min-w-[48px] flex justify-center transform transition-transform duration-300 hover:scale-110">
          <Image
            src={"/logo.png"}
            width={48}
            height={48}
            alt="Obaol"
            className="rounded-xl object-contain shadow-sm"
          />
        </div>
        {!isCollapsed && (
          <span className="font-black text-sm tracking-[0.3em] text-foreground/80 whitespace-nowrap uppercase select-none">
            SUPREME
          </span>
        )}
      </div>

      {/* Navigation Options */}
      <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto no-scrollbar">
        {filteredOptions.map((option, index) => {
          const isActive = selectedOption === option.name.toLowerCase() ||
            (option.name === "Dashboard" && selectedOption === "dashboard");

          const content = (
            <div
              key={index}
              onClick={() => handleOptionClick(option.link, option.name)}
              className={`group relative flex items-center px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive
                ? "bg-default-100/80 text-warning-500"
                : "text-default-500 hover:bg-default-100 hover:text-foreground"
                } ${isCollapsed ? "justify-center" : "gap-4"}`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-warning-500 rounded-r-full" />
              )}
              <div className={`text-xl flex-shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                {option.icon}
              </div>
              {!isCollapsed && (
                <span className={`font-bold whitespace-nowrap overflow-hidden text-ellipsis tracking-tight ${isActive ? "text-foreground" : ""}`}>
                  {option.name}
                </span>
              )}
            </div>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={index} content={option.name} placement="right" color="warning" closeDelay={0}>
                {content}
              </Tooltip>
            );
          }

          return content;
        })}
      </div>

      {/* Footer / User Info (Optional) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-default-100">
          <p className="text-[10px] text-default-400 text-center uppercase tracking-widest font-bold">
            &copy; 2026 Obaol Supreme
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
