"use client";

import React, { useEffect, useRef, useState } from "react";
import { LuLanguages } from "react-icons/lu";
import { languages, normalizeLanguageCode } from "@/data/languages";
import { clearLanguageCookies, getLanguageCookie, setLanguageCookies } from "@/utils/languageCookie";
import { showToastMessage } from "@/utils/utils";

export const LanguageSwitcher = () => {
  const [currentLang, setCurrentLang] = useState("en");
  const [isSwitching, setIsSwitching] = useState(false);
  const warningShownRef = useRef(false);
  const isSwitchingRef = useRef(false);
  const reloadTriggeredRef = useRef(false);
  const translationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const syncFromPreference = () => {
      const preferred = normalizeLanguageCode(getLanguageCookie());
      setCurrentLang(preferred);
    };

    const handleUnavailable = () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
        translationTimeoutRef.current = null;
      }
      setIsSwitching(false);

      const preferred = normalizeLanguageCode(getLanguageCookie());
      if (preferred !== "en" && !warningShownRef.current) {
        warningShownRef.current = true;
        showToastMessage({
          type: "warning",
          message: "Live translation is unavailable in this browser right now. Language preference is saved.",
          position: "top-right",
        });
      }
      debugLog("fallback", { reason: "translation-unavailable-event", preferred });
      window.dispatchEvent(new Event("translation-end"));
    };

    syncFromPreference();
    window.addEventListener("translation-unavailable", handleUnavailable);
    document.addEventListener("visibilitychange", syncFromPreference);

    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
        translationTimeoutRef.current = null;
      }
      window.removeEventListener("translation-unavailable", handleUnavailable);
      document.removeEventListener("visibilitychange", syncFromPreference);
    };
  }, []);

  const changeLanguage = (nextCode: string) => {
    const normalized = normalizeLanguageCode(nextCode);
    if (isSwitchingRef.current || reloadTriggeredRef.current) return;
    if (normalized === currentLang) return;

    warningShownRef.current = false;
    setIsSwitching(true);
    setCurrentLang(normalized);

    const selectedLang = languages.find((lang) => lang.code === normalized);
    window.dispatchEvent(
      new CustomEvent("translation-start", {
        detail: { name: selectedLang?.name || "Language" },
      })
    );

    if (normalized === "en") {
      clearLanguageCookies();
    } else {
      setLanguageCookies(normalized);
    }

    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }
    translationTimeoutRef.current = setTimeout(() => {
      setIsSwitching(false);
      window.dispatchEvent(new Event("translation-end"));
    }, 2500);

    reloadTriggeredRef.current = true;
    debugLog("reload", { language: normalized });
    setTimeout(() => {
      window.location.reload();
    }, 120);
  };

  return (
    <div className="flex items-center">
      <div className="relative group">
        <LuLanguages className="absolute left-3 top-1/2 -translate-y-1/2 text-warning-500 w-4 h-4 z-10 pointer-events-none" />
        <select
          className="appearance-none w-[150px] bg-default-100 hover:bg-default-200 transition-colors cursor-pointer text-foreground font-bold text-[11px] uppercase tracking-wider h-10 pl-9 pr-8 rounded-xl outline-none border border-transparent focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20"
          value={currentLang}
          disabled={isSwitching}
          onChange={(e) => changeLanguage(String(e.target.value || "en"))}
          aria-label="Select Language"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code} className="text-base font-medium text-foreground bg-content1 py-2">
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

