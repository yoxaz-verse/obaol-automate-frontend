"use client";

import Cookies from "js-cookie";
import { normalizeLanguageCode } from "@/data/languages";

const LANGUAGE_COOKIE = "language";
const GOOGLE_TRANSLATE_COOKIE = "googtrans";
const LANGUAGE_STORAGE_KEY = "obaol_language";
const DEFAULT_LANGUAGE = "en";

const ONE_YEAR_DAYS = 365;

const isLocalHost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1";

const resolveCanonicalDomain = (hostname: string): string | undefined => {
  if (!hostname || isLocalHost(hostname)) return undefined;

  if (hostname === "obaol.com" || hostname === "www.obaol.com" || hostname.endsWith(".obaol.com")) {
    return ".obaol.com";
  }

  return undefined;
};

const getCookieOptions = () => {
  if (typeof window === "undefined") {
    return { path: "/", sameSite: "Lax" as const };
  }

  const hostname = window.location.hostname;
  const domain = resolveCanonicalDomain(hostname);

  return {
    path: "/",
    sameSite: "Lax" as const,
    secure: window.location.protocol === "https:",
    domain,
    expires: ONE_YEAR_DAYS,
  };
};

const getCleanupScopes = () => {
  if (typeof window === "undefined") return [{ path: "/" as const }];

  const hostname = window.location.hostname;
  const canonical = resolveCanonicalDomain(hostname);
  const scopes: Array<{ path: "/"; domain?: string }> = [
    { path: "/" },
    { path: "/", domain: hostname },
  ];

  if (canonical) {
    scopes.push({ path: "/", domain: canonical });
    scopes.push({ path: "/", domain: canonical.replace(/^\./, "") });
  }

  return scopes;
};

export const getLanguageCookie = (): string => {
  const cookieValue = Cookies.get(LANGUAGE_COOKIE);
  if (cookieValue) {
    const normalizedCookie = normalizeLanguageCode(String(cookieValue));
    if (normalizedCookie !== String(cookieValue).toLowerCase()) {
      clearLanguageCookies();
      return DEFAULT_LANGUAGE;
    }
    return normalizedCookie;
  }

  if (typeof window !== "undefined") {
    try {
      const storedValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedValue) {
        const normalizedStored = normalizeLanguageCode(String(storedValue));
        if (normalizedStored !== String(storedValue).toLowerCase()) {
          window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
          return DEFAULT_LANGUAGE;
        }
        return normalizedStored;
      }
    } catch {
      // Ignore storage read issues.
    }
  }

  return DEFAULT_LANGUAGE;
};

export const setLanguageCookies = (langCode: string): boolean => {
  const normalized = normalizeLanguageCode(String(langCode || DEFAULT_LANGUAGE));
  const googtransValue = `/en/${normalized}`;
  const options = getCookieOptions();

  // Clear any stale google translate cookies across domains before setting new one
  clearGoogtransCookie();
  Cookies.set(LANGUAGE_COOKIE, normalized, options);
  Cookies.set(GOOGLE_TRANSLATE_COOKIE, googtransValue, options);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    } catch {
      // Ignore storage write issues.
    }
  }
  const persisted = Cookies.get(LANGUAGE_COOKIE) === normalized;

  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug("[LanguageCookie] set", {
      lang: normalized,
      domain: options.domain || "(host-only)",
      persisted,
    });
  }

  return persisted;
};

export const setGoogtransCookie = (langCode: string) => {
  const normalized = normalizeLanguageCode(langCode);
  const googtransValue = `/en/${normalized}`;
  const options = getCookieOptions();
  clearGoogtransCookie();
  Cookies.set(GOOGLE_TRANSLATE_COOKIE, googtransValue, options);
};

export const clearGoogtransCookie = () => {
  const scopes = getCleanupScopes();
  scopes.forEach((scope) => {
    Cookies.remove(GOOGLE_TRANSLATE_COOKIE, scope);
  });
};

export const clearLanguageCookies = () => {
  const scopes = getCleanupScopes();

  scopes.forEach((scope) => {
    Cookies.remove(LANGUAGE_COOKIE, scope);
    Cookies.remove(GOOGLE_TRANSLATE_COOKIE, scope);
  });
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    } catch {
      // Ignore storage delete issues.
    }
  }

  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug("[LanguageCookie] cleared", {
      scopes: scopes.map((s) => s.domain || "(host-only)"),
    });
  }
};
