"use client";

import React, { useContext, useState, useTransition } from "react";
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
  const [, startTransition] = useTransition();
  const [pendingLink, setPendingLink] = useState<string | null>(null);

  const filteredOptions = sidebarOptions.filter((option) => {
    const allowedRoles = routeRoles[option.link] || [];
    return user?.role ? allowedRoles.includes(user.role) : false;
  });

  const handleOptionClick = (optionLink: string) => {
    setPendingLink(optionLink);
    startTransition(() => {
      router.push(optionLink);
    });
  };

  // Reset pending link when pathname matches
  React.useEffect(() => {
    if (pathname === pendingLink) {
      setPendingLink(null);
    }
  }, [pathname, pendingLink]);

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
          const isDashboardLink = option.link === "/dashboard";
          const isActive = isDashboardLink
            ? pathname === "/dashboard"
            : pathname === option.link || pathname.startsWith(`${option.link}/`);

          const isPendingItem = pendingLink === option.link;

          const content = (
            <div
              key={index}
              onClick={() => handleOptionClick(option.link)}
              aria-busy={isPendingItem}
              className={`group relative flex items-center px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${isActive
                ? "bg-default-100/80 text-warning-500"
                : isPendingItem
                  ? "bg-warning-500/10 text-warning-500/70"
                  : "text-default-500 hover:bg-default-100 hover:text-foreground"
                } ${isCollapsed ? "justify-center" : "gap-4"}`}
            >
              {(isActive || isPendingItem) && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-warning-500 rounded-r-full ${isPendingItem ? "animate-pulse" : ""}`} />
              )}
              <div
                className={`text-xl flex-shrink-0 transition-all duration-200 ${isActive
                  ? "scale-110"
                  : isPendingItem
                    ? "scale-105 text-warning-500"
                    : "group-hover:scale-110"
                  }`}
              >
                {option.icon}
              </div>
              {!isCollapsed && (
                <span
                  className={`font-bold whitespace-nowrap overflow-hidden text-ellipsis tracking-tight ${isActive ? "text-foreground" : isPendingItem ? "text-foreground/70" : ""
                    }`}
                >
                  {option.name}
                  {isPendingItem && (
                    <span className="ml-2 inline-flex items-center gap-1 align-middle">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse [animation-delay:120ms]" />
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse [animation-delay:240ms]" />
                    </span>
                  )}
                </span>
              )}

              {isPendingItem && !isCollapsed && (
                <div className="pointer-events-none absolute bottom-1 left-4 right-4 h-[2px] overflow-hidden rounded-full bg-warning-500/15">
                  <div className="h-full w-1/2 rounded-full bg-warning-500 animate-[pulse_1s_ease-in-out_infinite]" />
                </div>
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
