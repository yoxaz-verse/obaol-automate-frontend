"use client";

import React, { useEffect, useRef, useState } from "react";
import { LuLanguages } from "react-icons/lu";
import { languages } from "@/data/languages";
import {
    clearLanguageCookies,
    getLanguageCookie,
    setLanguageCookies,
} from "@/utils/languageCookie";
import { showToastMessage } from "@/utils/utils";

export const LanguageSwitcher = () => {
    const [currentLang, setCurrentLang] = useState("en");
    const [isSwitching, setIsSwitching] = useState(false);
    const [translationWarning, setTranslationWarning] = useState("");
    const translationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const switchRequestIdRef = useRef(0);
    const terminalSentForRequestRef = useRef<number | null>(null);
    const isSwitchingRef = useRef(false);

    const debugLog = (checkpoint: string, payload?: Record<string, unknown>) => {
        if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.debug(`[LanguageSwitcher] ${checkpoint}`, payload || {});
        }
    };

    useEffect(() => {
        isSwitchingRef.current = isSwitching;
    }, [isSwitching]);

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
        const handleUnavailable = () => {
            if (!isSwitchingRef.current) return;
            const warning =
                "Translation service blocked by browser privacy settings. Content will stay in English, API language preference is saved.";
            setTranslationWarning(warning);
            setIsSwitching(false);
            showToastMessage({
                type: "warning",
                message: warning,
                position: "top-right",
            });
            debugLog("fallback", { reason: "translation-unavailable-event" });
            window.dispatchEvent(new Event("translation-end"));
        };
        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("translation-unavailable", handleUnavailable);
        return () => {
            if (translationTimeoutRef.current) {
                clearTimeout(translationTimeoutRef.current);
                translationTimeoutRef.current = null;
            }
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("translation-unavailable", handleUnavailable);
        };
    }, []);

    const waitForTranslateWidget = async (maxAttempts = 8, intervalMs = 400) => {
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
            if (select) {
                debugLog("widget-found", { attempt });
                return select;
            }

            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }

        return null;
    };

    const changeLanguage = async (langCode: string) => {
        if (isSwitching || langCode === currentLang) return;

        const selectedLang = languages.find(l => l.code === langCode);
        const requestId = switchRequestIdRef.current + 1;
        switchRequestIdRef.current = requestId;
        terminalSentForRequestRef.current = null;
        setIsSwitching(true);
        setTranslationWarning("");

        const emitTerminal = (kind: "end" | "unavailable") => {
            if (terminalSentForRequestRef.current === requestId) return;
            terminalSentForRequestRef.current = requestId;
            setIsSwitching(false);

            if (translationTimeoutRef.current) {
                clearTimeout(translationTimeoutRef.current);
                translationTimeoutRef.current = null;
            }

            if (kind === "unavailable") {
                window.dispatchEvent(new Event("translation-unavailable"));
            } else {
                window.dispatchEvent(new Event("translation-end"));
            }

            debugLog("end", { kind, requestId, langCode });
        };

        debugLog("start", { requestId, langCode, langName: selectedLang?.name || "Language" });
        window.dispatchEvent(new CustomEvent("translation-start", {
            detail: { name: selectedLang?.name || "Language" }
        }));

        if (translationTimeoutRef.current) {
            clearTimeout(translationTimeoutRef.current);
        }
        translationTimeoutRef.current = setTimeout(() => {
            emitTerminal("unavailable");
        }, 8000);

        if (langCode === "en") {
            clearLanguageCookies();
            setCurrentLang("en");
            const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
            if (select) {
                select.value = "en";
                select.dispatchEvent(new Event("change"));
            }
            emitTerminal("end");
            return;
        }

        // Lazy-init translation script only when user explicitly chooses non-English.
        window.dispatchEvent(new Event("translation-init"));

        const cookiePersisted = setLanguageCookies(langCode);
        setCurrentLang(langCode);
        if (!cookiePersisted) {
            debugLog("fallback", { reason: "cookie-write-blocked", langCode });
        }

        const widget = await waitForTranslateWidget();
        if (!widget) {
            emitTerminal("unavailable");
            return;
        }

        widget.value = langCode;
        widget.dispatchEvent(new Event("change"));
        widget.dispatchEvent(new Event("click"));
        setTimeout(() => emitTerminal("end"), 1200);
    };

    return (
        <div className="flex items-center">
            <div className="relative group">
                <LuLanguages className="absolute left-3 top-1/2 -translate-y-1/2 text-warning-500 w-4 h-4 z-10 pointer-events-none" />
                <select
                    className="appearance-none w-[150px] bg-default-100 hover:bg-default-200 transition-colors cursor-pointer text-foreground font-bold text-[11px] uppercase tracking-wider h-10 pl-9 pr-8 rounded-xl outline-none border border-transparent focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20"
                    value={currentLang}
                    disabled={isSwitching}
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
            {translationWarning && (
                <span className="ml-2 hidden lg:inline text-[10px] text-warning-600 dark:text-warning-300 max-w-[240px] leading-tight">
                    {translationWarning}
                </span>
            )}
        </div>
    );
};
