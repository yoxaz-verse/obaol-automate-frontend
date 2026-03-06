import { getDeveloperToken } from "@/utils/developerSession";

const PROD_DEV_API_BASE = "https://api.obaol.com";
const LOCAL_DEV_API_BASE = "http://localhost:5002";

const isLocalHost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

const safeParseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const normalizeBase = (value: string) => String(value || "").trim().replace(/\/+$/, "");

export function getResolvedDeveloperApiBase(): string {
  const configuredRaw = normalizeBase(process.env.NEXT_PUBLIC_OBAOL_API_BASE_URL || "");
  const configuredUrl = configuredRaw ? safeParseUrl(configuredRaw) : null;

  const currentHost = typeof window !== "undefined" ? window.location.hostname : "";
  const runningOnLocalFrontend = currentHost ? isLocalHost(currentHost) : false;

  if (configuredUrl) {
    const configuredLocal = isLocalHost(configuredUrl.hostname);
    if (configuredLocal && !runningOnLocalFrontend) {
      return PROD_DEV_API_BASE;
    }
    return configuredUrl.origin;
  }

  if (runningOnLocalFrontend) {
    return LOCAL_DEV_API_BASE;
  }

  return PROD_DEV_API_BASE;
}

function requireDevApiBase() {
  const base = getResolvedDeveloperApiBase();
  const parsed = safeParseUrl(base);
  if (!parsed) {
    throw new Error(
      "Developer API base is invalid. Set NEXT_PUBLIC_OBAOL_API_BASE_URL to a valid API origin (e.g. https://api.obaol.com)."
    );
  }
  return parsed.origin.replace(/\/+$/, "");
}

async function parseJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || "Request failed");
  }
  return body;
}

async function devFetch(path: string, init?: RequestInit) {
  const base = requireDevApiBase();
  const url = `${base}${path}`;
  try {
    const response = await fetch(url, init);
    return await parseJson(response);
  } catch (error: any) {
    const message = String(error?.message || "");
    if (message.toLowerCase().includes("failed to fetch") || message.toLowerCase().includes("networkerror")) {
      throw new Error(`Developer API unreachable. Check API base URL, HTTPS, and CORS. (${base})`);
    }
    throw error;
  }
}

export async function devAuthGoogle(idToken: string) {
  return devFetch("/v1/dev-auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

export async function devGetMe() {
  const token = getDeveloperToken();
  return devFetch("/v1/dev-auth/me", {
    headers: { Authorization: `Bearer ${token || ""}` },
  });
}

export async function devGetKeyPresets() {
  const token = getDeveloperToken();
  return devFetch("/v1/dev-keys/presets", {
    headers: { Authorization: `Bearer ${token || ""}` },
  });
}

export async function devListKeys() {
  const token = getDeveloperToken();
  return devFetch("/v1/dev-keys", {
    headers: { Authorization: `Bearer ${token || ""}` },
  });
}

export async function devCreateKey(payload: {
  label: string;
  permissionPreset?: string;
  rate_limit?: number;
}) {
  const token = getDeveloperToken();
  return devFetch("/v1/dev-keys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function devUpdateKey(
  keyId: string,
  payload: { label?: string; permissionPreset?: string; rate_limit?: number }
) {
  const token = getDeveloperToken();
  return devFetch(`/v1/dev-keys/${keyId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function devRevokeKey(keyId: string) {
  const token = getDeveloperToken();
  return devFetch(`/v1/dev-keys/${keyId}/revoke`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token || ""}` },
  });
}

export async function devUsageOverview() {
  const token = getDeveloperToken();
  return devFetch("/v1/dev-usage/overview", {
    headers: { Authorization: `Bearer ${token || ""}` },
  });
}

export async function devKeyUsage(keyId: string) {
  const token = getDeveloperToken();
  return devFetch(`/v1/dev-keys/${keyId}/usage`, {
    headers: { Authorization: `Bearer ${token || ""}` },
  });
}

export async function devListMcpConnectors() {
  const token = getDeveloperToken();
  return devFetch("/v1/dev-mcp/connectors", {
    headers: { Authorization: `Bearer ${token || ""}` },
  });
}

export async function devCreateMcpConnector(payload: {
  apiKeyId: string;
  label?: string;
  expiresInDays?: number;
}) {
  const token = getDeveloperToken();
  return devFetch("/v1/dev-mcp/connectors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function devRevokeMcpConnector(connectorId: string) {
  const token = getDeveloperToken();
  return devFetch(`/v1/dev-mcp/connectors/${connectorId}/revoke`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token || ""}` },
  });
}

export async function devValidateMcpConnector(payload: { connectorId?: string }) {
  const token = getDeveloperToken();
  return devFetch("/v1/dev-mcp/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(payload || {}),
  });
}
