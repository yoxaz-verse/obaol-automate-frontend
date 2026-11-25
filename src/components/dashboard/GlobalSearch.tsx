"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { Input, Listbox, ListboxItem, Kbd } from "@nextui-org/react";
import { LuSearch, LuArrowRight, LuLayers } from "react-icons/lu";
import { sidebarOptions } from "@/utils/utils";
import AuthContext from "@/context/AuthContext";
import { getDashboardSidebarSections, getRoleFilteredSidebarOptions, isComingSoonDashboardNavigation } from "@/utils/dashboardNav";
import { useSidebarGovernance } from "@/hooks/useSidebarGovernance";
import { useDashboardNavigation } from "@/context/DashboardNavigationContext";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { navigate, pendingPath, prefetch } = useDashboardNavigation();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useContext(AuthContext);
  const governance = useSidebarGovernance();
  const governedPages = governance.isAssociate ? governance.resolved : undefined;
  const capabilities = [...(user?.providedCapabilities || []), ...(user?.soughtCapabilities || [])];

  const roleFilteredOptions = getRoleFilteredSidebarOptions(
    sidebarOptions as any[],
    String(user?.role || ""),
    [...(user?.providedCapabilities || []), ...(user?.soughtCapabilities || [])],
    governedPages,
  );
  const accessibleOptions = String(user?.role || "").toLowerCase() === "associate"
    ? getDashboardSidebarSections(
      roleFilteredOptions as any[],
      String(user?.role || ""),
      capabilities,
      user?.providedCapabilities || [],
      user?.soughtCapabilities || [],
      governedPages,
    ).flatMap((section) => section.links.map((path) => roleFilteredOptions.find((option) => option.link === path)).filter(Boolean)) as typeof roleFilteredOptions
    : roleFilteredOptions;
  const filteredOptions = accessibleOptions.filter((option) =>
    option.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleQuickOpen = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      inputRef.current?.focus();
      setIsOpen(true);
    };
    window.addEventListener("keydown", handleQuickOpen);
    return () => window.removeEventListener("keydown", handleQuickOpen);
  }, []);

  const handleSelect = (link: string) => {
    navigate(link);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative z-50 w-full max-w-xl" ref={containerRef}>
      <Input
        ref={inputRef}
        value={query}
        onValueChange={(val) => {
          setQuery(val);
          setIsOpen(val.length > 0);
        }}
        placeholder="Search dashboard..."
        startContent={<LuSearch className="text-default-400 group-hover:text-primary transition-colors" size={16} />}
        endContent={
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground/[0.05] border border-foreground/10 text-[9px] font-black text-default-400  tracking-tighter">
            <span className="opacity-50">CMD</span>
            <span>K</span>
          </div>
        }
        variant="bordered"
        radius="full"
        className="w-full"
        classNames={{
          input: "text-sm font-medium outline-none",
          inputWrapper: "h-11 border db-border-strong bg-foreground/[0.02] hover:bg-foreground/[0.05] hover:border-obaol-500/45 group-data-[focus=true]:border-obaol-500/60 group-data-[focus=true]:ring-0 group-data-[focus=true]:shadow-none transition-all duration-300 shadow-none px-4",
        }}
      />

      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-3xl border db-border-strong bg-background/95 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
           {filteredOptions.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
               {filteredOptions.slice(0, 6).map((option) => (
                 <button
                   key={option.link}
                   onClick={() => handleSelect(option.link)}
                   onMouseEnter={() => prefetch(option.link)}
                   onFocus={() => prefetch(option.link)}
                   onTouchStart={() => prefetch(option.link)}
                   disabled={isComingSoonDashboardNavigation(option.link, user?.role, capabilities, governedPages)}
                   aria-label={isComingSoonDashboardNavigation(option.link, user?.role, capabilities, governedPages) ? `${option.name}, coming soon` : option.name}
                   aria-busy={pendingPath === option.link || undefined}
                   className="w-full flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-obaol-500/25 hover:bg-obaol-500/5 focus:border-obaol-500/35 focus:bg-obaol-500/5 group transition-all text-left outline-none ring-0 disabled:cursor-not-allowed disabled:opacity-55"
                 >
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-foreground group-hover:text-obaol-700 dark:group-hover:text-obaol-300 transition-colors">
                       {option.name}
                     </span>
                     <span className="mt-1 text-[10px] font-medium leading-none text-default-400">
                       Opens {option.name}
                     </span>
                   </div>
                   {isComingSoonDashboardNavigation(option.link, user?.role, capabilities, governedPages) ? (
                     <span className="rounded-full border border-obaol-500/25 bg-obaol-500/10 px-2 py-1 text-[8px] font-black  tracking-wider text-obaol-700 dark:text-obaol-300">Coming soon</span>
                   ) : (
                     <LuArrowRight size={14} className="text-default-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                   )}
                 </button>
               ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-foreground/[0.01] rounded-2xl border border-dashed border-foreground/5">
               <div className="mb-2 text-default-300 flex justify-center">
                 <LuLayers size={32} />
               </div>
               <p className="text-xs text-default-400 font-medium tracking-tight">
                 No destination found for <span className="text-foreground font-bold">&ldquo;{query}&rdquo;</span>
               </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
