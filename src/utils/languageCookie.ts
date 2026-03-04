"use client";

import Cookies from "js-cookie";

const LANGUAGE_COOKIE = "language";
const GOOGLE_TRANSLATE_COOKIE = "googtrans";
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
  const value = Cookies.get(LANGUAGE_COOKIE);
  return value || DEFAULT_LANGUAGE;
};

export const setLanguageCookies = (langCode: string): boolean => {
  const normalized = String(langCode || DEFAULT_LANGUAGE).toLowerCase();
  const googtransValue = `/en/${normalized}`;
  const options = getCookieOptions();

  Cookies.set(LANGUAGE_COOKIE, normalized, options);
  Cookies.set(GOOGLE_TRANSLATE_COOKIE, googtransValue, options);
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

export const clearLanguageCookies = () => {
  const scopes = getCleanupScopes();

  scopes.forEach((scope) => {
    Cookies.remove(LANGUAGE_COOKIE, scope);
    Cookies.remove(GOOGLE_TRANSLATE_COOKIE, scope);
  });

  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug("[LanguageCookie] cleared", {
      scopes: scopes.map((s) => s.domain || "(host-only)"),
    });
  }
};
