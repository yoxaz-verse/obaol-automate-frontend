"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

export const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, resolvedTheme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-10 w-24 rounded-full border border-obaol-500/25 bg-obaol-500/10" />; // Avoid hydration mismatch

    const activeTheme = (resolvedTheme || theme || "light") as "light" | "dark";
    const nextTheme = activeTheme === "light" ? "dark" : "light";

    return (
      <button
        onClick={() => setTheme(nextTheme)}
        aria-label="Toggle theme"
        className="flex h-10 items-center gap-2 rounded-full border border-obaol-500/25 bg-obaol-500/5 px-3 text-obaol-700 transition-all hover:border-obaol-500/55 hover:bg-obaol-500/10 hover:shadow-[0_0_20px_rgba(207,152,60,0.22)] dark:text-obaol-300"
      >
        {activeTheme === "light" ? <FiMoon size={16} /> : <FiSun size={16} />}
        <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
          {activeTheme === "light" ? "Dark" : "Light"}
        </span>
      </button>
    );
};
