"use client";

import React, { useEffect, useRef, useState } from "react";
import { LuLanguages, LuCheck } from "react-icons/lu";
import { languages, normalizeLanguageCode } from "@/data/languages";
import { clearLanguageCookies, getLanguageCookie, setLanguageCookies } from "@/utils/languageCookie";
import { showToastMessage } from "@/utils/utils";
import { useSoundEffect } from "@/context/SoundContext";

export const LanguageSwitcher = () => {
  const [currentLang, setCurrentLang] = useState("en");
  const [pendingLang, setPendingLang] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const { play } = useSoundEffect();
  const warningShownRef = useRef(false);
  const isSwitchingRef = useRef(false);
  const reloadTriggeredRef = useRef(false);
  const translationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (translationTimeoutRef.current) clearTimeout(translationTimeoutRef.current);
      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
      window.removeEventListener("translation-unavailable", handleUnavailable);
      document.removeEventListener("visibilitychange", syncFromPreference);
    };
  }, []);

  // Cancel pending selection after 8 seconds of inaction
  useEffect(() => {
    if (pendingLang) {
      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = setTimeout(() => setPendingLang(null), 8000);
    }
    return () => {
      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
    };
  }, [pendingLang]);

  const applyLanguage = (nextCode: string) => {
    const normalized = normalizeLanguageCode(nextCode);
    if (isSwitchingRef.current || reloadTriggeredRef.current) return;
    if (normalized === currentLang) { setPendingLang(null); return; }

    warningShownRef.current = false;
    setIsSwitching(true);
    setCurrentLang(normalized);
    setPendingLang(null);
    play("language");

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

    if (translationTimeoutRef.current) clearTimeout(translationTimeoutRef.current);
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

  const handleSelectChange = (nextCode: string) => {
    const normalized = normalizeLanguageCode(nextCode);
    if (normalized === currentLang) return;
    // Stage it — require confirm click
    setPendingLang(normalized);
  };

  const pendingLabel = pendingLang
    ? languages.find((l) => l.code === pendingLang)?.name
    : null;

  return (
    // notranslate + translate="no" stops ALL translation engines from touching this element
    <div className="flex items-center gap-2 notranslate" translate="no">
      <div className="relative group notranslate" translate="no">
        <LuLanguages className="absolute left-3 top-1/2 -translate-y-1/2 text-warning-500 w-4 h-4 z-10 pointer-events-none" />
        <select
          className={`notranslate appearance-none ${pendingLang ? 'w-[125px]' : 'w-[140px]'} bg-default-100 hover:bg-default-200 transition-all cursor-pointer text-foreground font-bold text-[10px] uppercase tracking-wider h-9 pl-9 pr-6 rounded-xl outline-none border border-transparent focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20`}
          value={pendingLang ?? currentLang}
          disabled={isSwitching}
          onChange={(e) => handleSelectChange(String(e.target.value || "en"))}
          aria-label="Select Language"
          translate="no"
        >
          {languages.map((lang) => (
            <option
              key={lang.code}
              value={lang.code}
              className="notranslate text-base font-medium text-foreground bg-content1 py-2"
              translate="no"
            >
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-default-400 group-hover:text-default-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Confirm button — only shows when a pending change is staged */}
      {pendingLang && (
        <button
          onClick={() => applyLanguage(pendingLang)}
          className="notranslate flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl bg-warning-500/10 hover:bg-warning-500/20 border border-warning-500/20 active:scale-95 transition-all text-warning-600 dark:text-warning-400 font-bold text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-right-2 duration-200"
          title={`Apply ${pendingLabel}`}
          translate="no"
        >
          <LuCheck size={14} className="stroke-[2.5px]" />
          <span className="notranslate" translate="no">Apply</span>
        </button>
      )}
    </div>
  );
};

