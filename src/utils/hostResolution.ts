export type HostResolution =
  | { kind: "platform" }
  | { kind: "subdomain-brand"; slug: string }
  | { kind: "custom-domain-brand"; slug: string }
  | { kind: "fallback"; reason: "empty" | "invalid" };

const PLATFORM_HOSTS = new Set([
  "obaol.com",
  "www.obaol.com",
  "obaol-automate-frontend.vercel.app",
  "automate-frontend.infra.obaol.com",
]);

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const SAFE_SLUG = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

export const normalizeRequestHost = (value: string | null | undefined) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw.startsWith("[")) {
    const closingBracket = raw.indexOf("]");
    return closingBracket >= 0 ? raw.slice(0, closingBracket + 1) : raw;
  }
  return raw.split(":")[0];
};

export const resolveRequestHost = (value: string | null | undefined): HostResolution => {
  const hostname = normalizeRequestHost(value);
  if (!hostname) return { kind: "fallback", reason: "empty" };
  if (LOCAL_HOSTS.has(hostname) || hostname.endsWith(".local")) return { kind: "platform" };
  if (PLATFORM_HOSTS.has(hostname)) return { kind: "platform" };

  if (hostname.endsWith(".obaol.com")) {
    const slug = hostname.slice(0, -".obaol.com".length).split(".")[0];
    return SAFE_SLUG.test(slug) && slug !== "www"
      ? { kind: "subdomain-brand", slug }
      : { kind: "fallback", reason: "invalid" };
  }

  const validCustomDomain = hostname.length <= 253
    && hostname.includes(".")
    && hostname.split(".").every((part) => SAFE_SLUG.test(part));
  return validCustomDomain
    ? { kind: "custom-domain-brand", slug: hostname }
    : { kind: "fallback", reason: "invalid" };
};
