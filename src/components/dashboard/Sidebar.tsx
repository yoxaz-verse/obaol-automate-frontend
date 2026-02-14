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
      <div className={`flex items-center px-4 py-8 overflow-hidden ${isCollapsed ? "justify-center" : "justify-start gap-3"}`}>
        <div className="min-w-[40px] flex justify-center">
          <Image
            src={"/logo.png"}
            width={40}
            height={40}
            alt="Obaol"
            className="rounded-lg object-contain"
          />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-xl tracking-tight text-foreground whitespace-nowrap">
            OBAOL <span className="text-warning-500 text-xs align-top">SUPREME</span>
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
              className={`group flex items-center px-3 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive
                  ? "bg-warning-500 text-warning-foreground shadow-lg shadow-warning-500/20"
                  : "text-default-500 hover:bg-default-100 hover:text-foreground"
                } ${isCollapsed ? "justify-center" : "gap-4"}`}
            >
              <div className={`text-xl flex-shrink-0 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`}>
                {option.icon}
              </div>
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
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
