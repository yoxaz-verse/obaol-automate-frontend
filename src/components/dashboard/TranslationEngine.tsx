"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LuLanguages } from "react-icons/lu";
import { usePathname } from "next/navigation";
import { isLanguageSupported, languages, normalizeLanguageCode } from "@/data/languages";
import { clearGoogtransCookie, clearLanguageCookies, getLanguageCookie, setLanguageCookies } from "@/utils/languageCookie";
import { showToastMessage } from "@/utils/utils";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    // @ts-ignore
    google: any;
  }
}

export const TranslationEngine = () => {
  const pathname = usePathname();
  const [isSwitching, setIsSwitching] = useState(false);
  const [targetLang, setTargetLang] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let isScriptLoading = false;
    let isScriptReady = false;
    let pendingLanguageToApply = "";
    let startupApplyTimeout: ReturnType<typeof setTimeout> | null = null;
    let applyRetryTimeout: ReturnType<typeof setTimeout> | null = null;
    let unavailableToastShown = false;
    let activeApplyRunId = 0;

    const APPLY_RETRY_MS = 180;
    const MAX_APPLY_ATTEMPTS = 40;

    const debugLog = (checkpoint: string, payload?: Record<string, unknown>) => {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug(`[TranslationEngine] ${checkpoint}`, payload || {});
      }
    };

    const readPreferredLanguage = () => normalizeLanguageCode(getLanguageCookie());

    const emitUnavailable = (reason: string) => {
      const preferred = readPreferredLanguage();
      setIsSwitching(false);
      debugLog("fallback", { reason, preferred });
      if (preferred !== "en" && !unavailableToastShown) {
        unavailableToastShown = true;
        showToastMessage({
          type: "warning",
          message: "Live translation is unavailable in this browser right now. Language preference is saved.",
          position: "top-right",
        });
      }
      window.dispatchEvent(new Event("translation-unavailable"));
    };

    const clearApplyRetryTimer = () => {
      if (applyRetryTimeout) {
        clearTimeout(applyRetryTimeout);
        applyRetryTimeout = null;
      }
    };

    const applyLanguageToWidget = (langCode: string): boolean => {
      const normalized = normalizeLanguageCode(langCode);
      if (!normalized || normalized === "en") return true;
      if (!isLanguageSupported(normalized)) return false;

      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (!select) return false;

      const hasLanguage = Array.from(select.options || []).some(
        (option) => String(option.value || "").toLowerCase() === normalized
      );
      if (!hasLanguage) {
        debugLog("language-not-in-widget", { langCode: normalized });
        return false;
      }

      select.value = normalized;
      select.dispatchEvent(new Event("change"));
      select.dispatchEvent(new Event("click"));
      return true;
    };

    const applyLanguageWithRetries = (langCode: string, maxAttempts = MAX_APPLY_ATTEMPTS): Promise<boolean> =>
      new Promise((resolve) => {
        const normalized = normalizeLanguageCode(langCode);
        if (!normalized || normalized === "en") {
          resolve(true);
          return;
        }

        const runId = ++activeApplyRunId;
        let attempts = 0;

        const attempt = () => {
          if (runId !== activeApplyRunId) {
            resolve(false);
            return;
          }

          attempts += 1;
          const applied = applyLanguageToWidget(normalized);
          debugLog("apply-retry", { langCode: normalized, attempts, applied });

          if (applied) {
            resolve(true);
            return;
          }

          if (attempts >= maxAttempts) {
            resolve(false);
            return;
          }

          clearApplyRetryTimer();
          applyRetryTimeout = setTimeout(attempt, APPLY_RETRY_MS);
        };

        attempt();
      });

    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: languages.map((l) => l.code).join(","),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
        isScriptReady = true;
        isScriptLoading = false;
        debugLog("widget-ready");

        if (pendingLanguageToApply) {
          const pending = pendingLanguageToApply;
          pendingLanguageToApply = "";
          applyLanguageWithRetries(pending).then((applied) => {
            debugLog("apply-pending-language", { langCode: pending, applied });
            if (!applied) {
              emitUnavailable("widget-missing-pending-language");
            } else {
              window.dispatchEvent(new Event("translation-engine-ready"));
            }
          });
        } else {
          window.dispatchEvent(new Event("translation-engine-ready"));
        }

        if (startupApplyTimeout) {
          clearTimeout(startupApplyTimeout);
          startupApplyTimeout = null;
        }
      }
    };

    const ensureTranslateScript = () => {
      if (isScriptReady || isScriptLoading) return;

      if (document.getElementById("google-translate-script")) {
        isScriptLoading = true;
        return;
      }

      isScriptLoading = true;
      debugLog("script-load-start");
      const addScript = document.createElement("script");
      addScript.id = "google-translate-script";
      addScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      addScript.async = true;
      addScript.onerror = () => {
        isScriptLoading = false;
        debugLog("script-load-error");
        window.dispatchEvent(new Event("translation-engine-error"));
        emitUnavailable("script-load-error");
      };
      document.body.appendChild(addScript);
    };

    const applySavedLanguagePreference = () => {
      const isDashboard = window.location.pathname.startsWith("/dashboard");
      if (!isDashboard) {
        clearGoogtransCookie();
        return;
      }

      const preferredLang = readPreferredLanguage();
      if (!preferredLang || preferredLang === "en") return;

      if (!isLanguageSupported(preferredLang)) {
        clearLanguageCookies();
        return;
      }

      setLanguageCookies(preferredLang);

      if (isScriptReady) {
        applyLanguageWithRetries(preferredLang).then((applied) => {
          debugLog("apply-saved-ready", { langCode: preferredLang, applied });
          if (!applied) {
            emitUnavailable("saved-apply-failed-after-ready");
          }
        });
      } else {
        pendingLanguageToApply = preferredLang;
        debugLog("apply-saved-pending", { langCode: preferredLang });
        ensureTranslateScript();
      }

      if (startupApplyTimeout) {
        clearTimeout(startupApplyTimeout);
      }
      startupApplyTimeout = setTimeout(() => {
        if (!pendingLanguageToApply) return;
        pendingLanguageToApply = "";
        clearApplyRetryTimer();
        emitUnavailable("startup-apply-timeout");
      }, 10_000);
    };

    const handleStart = (event: Event) => {
      const detail = (event as CustomEvent<{ name?: string }>).detail;
      setTargetLang(detail?.name || "Language");
      setIsSwitching(true);
    };

    const handleEnd = () => {
      setIsSwitching(false);
    };

    const handleInit = () => {
      ensureTranslateScript();
    };

    const handleReapply = () => {
      setTimeout(applySavedLanguagePreference, 0);
    };

    window.addEventListener("translation-start", handleStart);
    window.addEventListener("translation-end", handleEnd);
    window.addEventListener("translation-init", handleInit);
    window.addEventListener("translation-reapply", handleReapply);
    window.addEventListener("translation-unavailable", handleEnd);

    const style = document.createElement("style");
    style.innerHTML = `
      body {
        top: 0 !important;
        position: static !important;
      }
      iframe.skiptranslate,
      .goog-te-banner-frame {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    setTimeout(applySavedLanguagePreference, 0);

    return () => {
      activeApplyRunId += 1;
      clearApplyRetryTimer();
      if (startupApplyTimeout) {
        clearTimeout(startupApplyTimeout);
        startupApplyTimeout = null;
      }
      window.removeEventListener("translation-start", handleStart);
      window.removeEventListener("translation-end", handleEnd);
      window.removeEventListener("translation-init", handleInit);
      window.removeEventListener("translation-reapply", handleReapply);
      window.removeEventListener("translation-unavailable", handleEnd);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isDashboard = pathname.startsWith("/dashboard");
    if (!isDashboard) {
      // Force English outside dashboard
      clearGoogtransCookie();
      // If the widget is already initialized and set to something else, we might need a more aggressive reset,
      // but usually clearing the cookie and not triggering the apply logic is enough.
      return;
    }

    window.dispatchEvent(new Event("translation-reapply"));
  }, [pathname, mounted]);

  useEffect(() => {
    if (!isSwitching) return;
    const watchdog = setTimeout(() => {
      setIsSwitching(false);
      window.dispatchEvent(new Event("translation-end"));
    }, 8000);
    return () => clearTimeout(watchdog);
  }, [isSwitching]);

  const overlay = isSwitching ? (
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-background/80 backdrop-blur-xl">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-default-200 bg-content1 px-8 py-7 shadow-xl">
        <LuLanguages className="text-warning-500 h-12 w-12" />
        <p className="text-sm font-bold tracking-wide uppercase text-default-600">Applying language</p>
        <p className="text-lg font-semibold text-foreground">{targetLang || "Language"}</p>
      </div>
    </div>
  ) : null;

  if (!mounted) return <div id="google_translate_element" className="hidden" aria-hidden="true"></div>;

  return (
    <>
      <div id="google_translate_element" className="hidden" aria-hidden="true"></div>
      {overlay ? createPortal(overlay, document.body) : null}
    </>
  );
};

export default TranslationEngine;
