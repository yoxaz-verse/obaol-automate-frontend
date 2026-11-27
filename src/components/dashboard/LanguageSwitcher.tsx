"use client";

import React, { useEffect, useRef, useState } from "react";
import { LuLanguages, LuCheck } from "react-icons/lu";
import { languages, normalizeLanguageCode } from "@/data/languages";
import { clearLanguageCookies, getLanguageCookie, setLanguageCookies } from "@/utils/languageCookie";
import { showToastMessage } from "@/utils/utils";
import { useSoundEffect } from "@/context/SoundContext";
import AppSelect from "@/components/ui/AppSelect";
import { SelectItem } from "@nextui-org/react";

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
        <AppSelect
          aria-label="Select Language"
          selectedKeys={new Set([pendingLang ?? currentLang])}
          isDisabled={isSwitching}
          onSelectionChange={(keys) => handleSelectChange(String(Array.from(keys as Set<string>)[0] || "en"))}
          className={`notranslate ${pendingLang ? "w-[100px]" : "w-[145px]"}`}
          startContent={<LuLanguages className="text-obaol-500 w-3.5 h-3.5 shrink-0" />}
          classNames={{
            trigger: "!min-h-9 h-9 bg-default-100/90 dark:bg-default-50/10 border border-default-200/60 dark:border-white/10 hover:border-obaol-500/40 px-2.5",
            value: "text-xs font-semibold text-foreground",
            innerWrapper: "gap-1.5",
          }}
          renderValue={(items) => {
            const code = (items[0]?.key as string) || pendingLang || currentLang || "en";
            const selected = languages.find((l) => l.code === code) || languages[0];
            return (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground truncate notranslate" translate="no">
                <span className="text-xs leading-none">{selected.flag}</span>
                <span className="truncate">{selected.name}</span>
              </span>
            );
          }}
        >
          {languages.map((lang) => (
            <SelectItem
              key={lang.code}
              textValue={`${lang.flag} ${lang.name}`}
              className="notranslate text-xs font-medium text-foreground bg-content1 py-2"
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </AppSelect>
      </div>

      {/* Confirm button — only shows when a pending change is staged */}
      {pendingLang && (
        <button
          onClick={() => applyLanguage(pendingLang)}
          className="notranslate flex h-9 items-center justify-center gap-1 rounded-xl border border-obaol-500/25 bg-obaol-500/10 px-2.5 text-[11px] font-semibold text-obaol-700 outline-none ring-0 transition-all hover:border-obaol-500/45 hover:bg-obaol-500/20 active:scale-95 dark:text-obaol-300 animate-in fade-in slide-in-from-right-2 duration-200"
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
