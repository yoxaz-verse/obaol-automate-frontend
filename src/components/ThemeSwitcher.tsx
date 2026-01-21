"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { FiMoon, FiSun } from "react-icons/fi";

export const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-10 h-10" />; // Avoid hydration mismatch

    return (
        <Button
            isIconOnly
            variant="light"
            radius="full"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
        >
            {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
        </Button>
    );
};
