"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { Input, Listbox, ListboxItem, Kbd } from "@nextui-org/react";
import { LuSearch, LuArrowRight, LuLayers } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { sidebarOptions } from "@/utils/utils";
import AuthContext from "@/context/AuthContext";
import { getDashboardSidebarSections, getRoleFilteredSidebarOptions, isComingSoonDashboardNavigation } from "@/utils/dashboardNav";
import { useSidebarGovernance } from "@/hooks/useSidebarGovernance";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
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
    router.push(link);
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
        placeholder="Quick Navigator..."
        startContent={<LuSearch className="text-default-400 group-hover:text-primary transition-colors" size={16} />}
        endContent={
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground/[0.05] border border-foreground/10 text-[9px] font-black text-default-400 uppercase tracking-tighter">
            <span className="opacity-50">CMD</span>
            <span>K</span>
          </div>
        }
        variant="bordered"
        radius="full"
        className="w-full"
        classNames={{
          input: "text-sm font-medium",
          inputWrapper: "h-11 border-foreground/5 bg-foreground/[0.02] hover:bg-foreground/[0.05] hover:border-foreground/10 transition-all duration-300 shadow-none px-4",
        }}
      />

      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-3xl border border-divider/50 bg-background/95 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
           {filteredOptions.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
               {filteredOptions.slice(0, 6).map((option) => (
                 <button
                   key={option.link}
                   onClick={() => handleSelect(option.link)}
                   disabled={isComingSoonDashboardNavigation(option.link, user?.role, capabilities, governedPages)}
                   aria-label={isComingSoonDashboardNavigation(option.link, user?.role, capabilities, governedPages) ? `${option.name}, coming soon` : option.name}
                   className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 group transition-all text-left outline-none focus:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-55"
                 >
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                       {option.name}
                     </span>
                     <span className="text-[10px] text-default-400 font-medium uppercase tracking-widest leading-none mt-1">
                       Redirection: {option.link.replace("/dashboard/", "").replace("-", " ")}
                     </span>
                   </div>
                   {isComingSoonDashboardNavigation(option.link, user?.role, capabilities, governedPages) ? (
                     <span className="rounded-full border border-obaol-500/25 bg-obaol-500/10 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-obaol-700 dark:text-obaol-300">Coming soon</span>
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
