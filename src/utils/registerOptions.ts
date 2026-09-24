import axios from "axios";

const DEFAULT_API_ROOT = "/api/v1/web";
export const REGISTER_OPTIONS_TIMEOUT_MS = 30000;

const normalizeApiRoot = (value: string) =>
  String(value || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/auth$/i, "")
    .replace(/\/login$/i, "")
    .replace(/\/auth\/.*$/i, "")
    .replace(/\/login\/.*$/i, "");

export const resolveApiRoot = () => {
  const envApi = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const normalized = normalizeApiRoot(envApi);
  return normalized || DEFAULT_API_ROOT;
};

const normalizeArray = <T>(value: unknown): T[] => (Array.isArray(value) ? value : []);

export type RegisterOptionsPayload = {
  existingCompanies: any[];
  designations: any[];
  companyTypes: any[];
  states: any[];
  districts: any[];
  divisions: any[];
  pincodeEntries: any[];
  countries: any[];
  companyFunctions: any[];
  companySubFunctions: any[];
};

export type RegisterOptionsMeta = {
  partial: boolean;
  failedKeys: string[];
  error?: string;
};

export type RegisterOptionsResult = RegisterOptionsPayload & {
  resolvedEndpoint: string;
  meta: RegisterOptionsMeta;
};

const normalizeMeta = (value: unknown): RegisterOptionsMeta => {
  const meta = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const failedKeys = normalizeArray<unknown>(meta.failedKeys)
    .map((key) => String(key || "").trim())
    .filter(Boolean);
  const error = typeof meta.error === "string" && meta.error.trim() ? meta.error.trim() : undefined;

  return {
    partial: Boolean(meta.partial) || failedKeys.length > 0,
    failedKeys,
    ...(error ? { error } : {}),
  };
};

export function parseRegisterOptionsResponse(responseBody: any): Omit<RegisterOptionsResult, "resolvedEndpoint"> {
  const envelope = responseBody && typeof responseBody === "object" ? responseBody : {};
  const firstData = envelope.data && typeof envelope.data === "object" ? envelope.data : {};
  const nestedData = firstData.data && typeof firstData.data === "object" ? firstData.data : null;
  const payload = nestedData || firstData;
  const meta = normalizeMeta(envelope.meta || firstData.meta);

  return {
    existingCompanies: normalizeArray(payload?.existingCompanies),
    designations: normalizeArray(payload?.designations),
    companyTypes: normalizeArray(payload?.companyTypes),
    states: normalizeArray(payload?.states),
    districts: normalizeArray(payload?.districts),
    divisions: normalizeArray(payload?.divisions),
    pincodeEntries: normalizeArray(payload?.pincodeEntries),
    countries: normalizeArray(payload?.countries),
    companyFunctions: normalizeArray(payload?.companyFunctions),
    companySubFunctions: normalizeArray(payload?.companySubFunctions),
    meta,
  };
}

export async function fetchRegisterOptions(): Promise<RegisterOptionsResult> {
  const apiRoot = resolveApiRoot();
  const endpoint = `${apiRoot}/auth/register/options`;
  const response = await axios.get(endpoint, {
    timeout: REGISTER_OPTIONS_TIMEOUT_MS,
    withCredentials: false,
  });

  const parsed = parseRegisterOptionsResponse(response.data);

  return {
    resolvedEndpoint: endpoint,
    ...parsed,
  };
}
