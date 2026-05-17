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

    if (!mounted) return <div className="w-24 h-10 rounded-full border border-orange-500/25 bg-orange-500/10" />; // Avoid hydration mismatch

    const activeTheme = (resolvedTheme || theme || "light") as "light" | "dark";
    const nextTheme = activeTheme === "light" ? "dark" : "light";

    return (
      <button
        onClick={() => setTheme(nextTheme)}
        aria-label="Toggle theme"
        className="h-10 px-3 rounded-full border border-orange-500/25 bg-orange-500/5 text-orange-400 hover:bg-orange-500/12 hover:border-orange-500/55 transition-all flex items-center gap-2 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]"
      >
        {activeTheme === "light" ? <FiMoon size={16} /> : <FiSun size={16} />}
        <span className="text-[10px] font-black uppercase tracking-[0.18em]">
          {activeTheme === "light" ? "Dark" : "Light"}
        </span>
      </button>
    );
};
