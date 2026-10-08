"use client";

import React, { useContext } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiMoreHorizontal } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { sidebarOptions } from "@/utils/utils";
import { getDashboardBottomNavigation } from "@/utils/dashboardNav";
import { isDashboardRouteActive } from "@/utils/dashboardAccess";

const BottomNav = ({ isOnboardingLocked = false }: { isOnboardingLocked?: boolean }) => {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);
  const optionsByPath = new Map(sidebarOptions.map((option) => [option.link, option]));
  const routes = getDashboardBottomNavigation({
    role: user?.role,
    capabilities: [...(user?.providedCapabilities || []), ...(user?.soughtCapabilities || [])],
  });

  const openMore = () => {
    if (isOnboardingLocked) return;
    window.dispatchEvent(new Event("obaol:open-navigation"));
  };

  return (
    <nav
      data-bottomnav
      aria-label="Primary workspace navigation"
      className="fixed bottom-3 left-3 right-3 z-[100] h-[4.5rem] db-shell backdrop-blur-2xl border db-border-subtle rounded-2xl md:hidden overflow-hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-obaol-500/20 to-transparent" />
      <div className="grid h-full grid-cols-5 px-1 max-w-lg mx-auto">
        {routes.map((route) => {
          if (!route) return null;
          const option = optionsByPath.get(route.path);
          if (!option) return null;
          const isActive = isDashboardRouteActive(pathname, route.path);
          return (
            <Link
              key={route.path}
              href={route.path}
              aria-current={isActive ? "page" : undefined}
              aria-label={route.label}
              className={`relative min-w-0 min-h-11 flex flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors ${
                isActive ? "text-obaol-700 dark:text-obaol-300" : "text-default-500 hover:text-foreground"
              }`}
            >
              {isActive && <span aria-hidden="true" className="absolute top-0 w-8 h-0.5 rounded-full bg-obaol-500" />}
              <span aria-hidden="true" className={isActive ? "scale-110" : "opacity-80"}>{React.cloneElement(option.icon as React.ReactElement, { size: 19 })}</span>
              <span className="w-full truncate text-center text-[10px] font-bold leading-none">{route.label === "Dashboard" ? "Home" : route.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={openMore}
          disabled={isOnboardingLocked}
          aria-label="More workspace navigation"
          className="min-w-0 min-h-11 flex flex-col items-center justify-center gap-1 rounded-xl px-1 text-default-500 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiMoreHorizontal aria-hidden="true" size={20} />
          <span className="text-[10px] font-bold leading-none">More</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
