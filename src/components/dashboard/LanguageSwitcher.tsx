"use client";

import React, { useEffect, useState } from "react";
import { LuLanguages, LuChevronDown, LuCheck } from "react-icons/lu";
import { languages } from "@/data/languages";
import {
    clearLanguageCookies,
    getLanguageCookie,
    setLanguageCookies,
} from "@/utils/languageCookie";

export const LanguageSwitcher = () => {
    const [currentLang, setCurrentLang] = useState("en");

    useEffect(() => {
        const syncFromCookie = () => {
            const lang = getLanguageCookie();
            if (languages.some((l) => l.code === lang)) {
                setCurrentLang(lang);
            } else {
                setCurrentLang("en");
            }
        };

        syncFromCookie();
        const handleVisibility = () => {
            if (!document.hidden) syncFromCookie();
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, []);

    const changeLanguage = (langCode: string) => {
        const selectedLang = languages.find(l => l.code === langCode);

        // Dispatch start event for the overlay
        window.dispatchEvent(new CustomEvent("translation-start", {
            detail: { name: selectedLang?.name || "Language" }
        }));

        if (langCode === "en") {
            clearLanguageCookies();
            setCurrentLang("en");
            window.dispatchEvent(new Event("translation-end"));
            window.location.reload();
            return;
        }

        setLanguageCookies(langCode);
        setCurrentLang(langCode);

        // Trigger Google Translate manually for non-English
        const triggerGoogle = (attempts = 0) => {
            const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
            if (select) {
                select.value = langCode;
                select.dispatchEvent(new Event("change"));
                select.dispatchEvent(new Event("click"));
                // Hide overlay after a short delay to let translation apply
                setTimeout(() => {
                    window.dispatchEvent(new Event("translation-end"));
                }, 2000);
            } else if (attempts < 10) {
                setTimeout(() => triggerGoogle(attempts + 1), 500);
            } else {
                window.location.reload();
            }
        };

        triggerGoogle();
    };

    const currentLangName = languages.find((l) => l.code === currentLang)?.name || "Language";

    return (
        <div className="flex items-center">
            <div className="relative group">
                <LuLanguages className="absolute left-3 top-1/2 -translate-y-1/2 text-warning-500 w-4 h-4 z-10 pointer-events-none" />
                <select
                    className="appearance-none w-[150px] bg-default-100 hover:bg-default-200 transition-colors cursor-pointer text-foreground font-bold text-[11px] uppercase tracking-wider h-10 pl-9 pr-8 rounded-xl outline-none border border-transparent focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20"
                    value={currentLang}
                    onChange={(e: any) => changeLanguage(e.target.value)}
                    aria-label="Select Language"
                >
                    {languages.map((lang) => (
                        <option
                            key={lang.code}
                            value={lang.code}
                            className="text-base font-medium text-foreground bg-content1 py-2"
                        >
                            {lang.flag} {lang.name}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-default-400 group-hover:text-default-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
