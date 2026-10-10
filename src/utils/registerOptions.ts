import axios from "axios";

const DEFAULT_API_ROOT = "/api/v1/web";
export const REGISTER_OPTIONS_TIMEOUT_MS = 30000;
export const COMPANY_FUNCTION_TAXONOMY_VERSION = 3;
export const COMPANY_FUNCTION_TAXONOMY_COUNT = 11;

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
  designations: any[];
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
  companyFunctionTaxonomy?: {
    version: number;
    expectedCount: number;
    returnedCount: number;
  };
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
  const taxonomy = meta.companyFunctionTaxonomy && typeof meta.companyFunctionTaxonomy === "object"
    ? meta.companyFunctionTaxonomy as Record<string, unknown>
    : null;

  return {
    partial: Boolean(meta.partial) || failedKeys.length > 0,
    failedKeys,
    ...(error ? { error } : {}),
    ...(taxonomy ? {
      companyFunctionTaxonomy: {
        version: Number(taxonomy.version || 0),
        expectedCount: Number(taxonomy.expectedCount || 0),
        returnedCount: Number(taxonomy.returnedCount || 0),
      },
    } : {}),
  };
};

export function parseRegisterOptionsResponse(responseBody: any): Omit<RegisterOptionsResult, "resolvedEndpoint"> {
  const envelope = responseBody && typeof responseBody === "object" ? responseBody : {};
  const firstData = envelope.data && typeof envelope.data === "object" ? envelope.data : {};
  const nestedData = firstData.data && typeof firstData.data === "object" ? firstData.data : null;
  const payload = nestedData || firstData;
  const meta = normalizeMeta(envelope.meta || firstData.meta);

  return {
    designations: normalizeArray(payload?.designations),
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
  const taxonomy = parsed.meta.companyFunctionTaxonomy;
  if (
    !taxonomy ||
    taxonomy.version !== COMPANY_FUNCTION_TAXONOMY_VERSION ||
    taxonomy.expectedCount !== COMPANY_FUNCTION_TAXONOMY_COUNT ||
    taxonomy.returnedCount !== COMPANY_FUNCTION_TAXONOMY_COUNT ||
    parsed.companyFunctions.length !== COMPANY_FUNCTION_TAXONOMY_COUNT
  ) {
    throw new Error("The company capability list is being updated. Please retry shortly.");
  }

  return {
    resolvedEndpoint: endpoint,
    ...parsed,
  };
}
