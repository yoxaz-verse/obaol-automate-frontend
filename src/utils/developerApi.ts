import { getDeveloperToken } from "@/utils/developerSession";

const DEV_API_BASE = process.env.NEXT_PUBLIC_OBAOL_API_BASE_URL;

function requireDevApiBase() {
  if (!DEV_API_BASE) {
    throw new Error(
      "Developer API base is not configured. Set NEXT_PUBLIC_OBAOL_API_BASE_URL to your obaol-api origin (e.g. http://localhost:5002)."
    );
  }
  return DEV_API_BASE;
}

async function parseJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || "Request failed");
  }
  return body;
}

export async function devAuthGoogle(idToken: string) {
  const response = await fetch(`${requireDevApiBase()}/v1/dev-auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  return parseJson(response);
}

export async function devGetMe() {
  const token = getDeveloperToken();
  const response = await fetch(`${requireDevApiBase()}/v1/dev-auth/me`, {
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  });

  return parseJson(response);
}

export async function devGetKeyPresets() {
  const token = getDeveloperToken();
  const response = await fetch(`${requireDevApiBase()}/v1/dev-keys/presets`, {
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  });

  return parseJson(response);
}

export async function devListKeys() {
  const token = getDeveloperToken();
  const response = await fetch(`${requireDevApiBase()}/v1/dev-keys`, {
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  });

  return parseJson(response);
}

export async function devCreateKey(payload: {
  label: string;
  permissionPreset?: string;
  rate_limit?: number;
}) {
  const token = getDeveloperToken();
  const response = await fetch(`${requireDevApiBase()}/v1/dev-keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(payload),
  });

  return parseJson(response);
}

export async function devUpdateKey(
  keyId: string,
  payload: { label?: string; permissionPreset?: string; rate_limit?: number }
) {
  const token = getDeveloperToken();
  const response = await fetch(`${requireDevApiBase()}/v1/dev-keys/${keyId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(payload),
  });

  return parseJson(response);
}

export async function devRevokeKey(keyId: string) {
  const token = getDeveloperToken();
  const response = await fetch(`${requireDevApiBase()}/v1/dev-keys/${keyId}/revoke`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  });

  return parseJson(response);
}

export async function devUsageOverview() {
  const token = getDeveloperToken();
  const response = await fetch(`${requireDevApiBase()}/v1/dev-usage/overview`, {
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  });

  return parseJson(response);
}

export async function devKeyUsage(keyId: string) {
  const token = getDeveloperToken();
  const response = await fetch(`${requireDevApiBase()}/v1/dev-keys/${keyId}/usage`, {
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  });

  return parseJson(response);
}
