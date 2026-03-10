const PROD_WEB_API_BASE = "https://api.obaol.com/api/v1/web";
const LOCAL_WEB_API_BASE = "http://localhost:5001/api/v1/web";

const trimSlashes = (value: string) => String(value || "").trim().replace(/\/+$/, "");
const isAbsoluteHttp = (value: string) => /^https?:\/\//i.test(value);

const normalizePathPrefix = (value: string) => {
  const v = String(value || "").trim();
  if (!v) return "/api/v1/web";
  return v.startsWith("/") ? v : `/${v}`;
};

const normalizeAbsoluteBase = (value: string) => {
  try {
    const parsed = new URL(value);
    const pathname = parsed.pathname.replace(/\/+$/, "");
    if (!pathname || pathname === "") {
      return `${parsed.origin}/api/v1/web`;
    }
    return `${parsed.origin}${pathname}`;
  } catch {
    return value;
  }
};

export function resolvePublicWebApiBase() {
  const apiBaseRaw = trimSlashes(process.env.NEXT_PUBLIC_API_BASE_URL || "");
  const apiUrlRaw = trimSlashes(process.env.NEXT_PUBLIC_API_URL || "");
  const obaolBaseRaw = trimSlashes(process.env.NEXT_PUBLIC_OBAOL_API_BASE_URL || "");

  if (isAbsoluteHttp(apiBaseRaw)) return normalizeAbsoluteBase(apiBaseRaw);
  if (isAbsoluteHttp(apiUrlRaw)) return normalizeAbsoluteBase(apiUrlRaw);

  const pathPrefix = normalizePathPrefix(apiBaseRaw || apiUrlRaw || "/api/v1/web");
  if (isAbsoluteHttp(obaolBaseRaw)) return `${obaolBaseRaw}${pathPrefix}`;

  return process.env.NODE_ENV === "production" ? PROD_WEB_API_BASE : LOCAL_WEB_API_BASE;
}

export function buildPublicWebApiUrl(path: string) {
  const base = resolvePublicWebApiBase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimSlashes(base)}${normalizedPath}`;
}
