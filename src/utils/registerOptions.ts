import axios from "axios";

const DEFAULT_API_ROOT = "/api/v1/web";
const REQUEST_TIMEOUT_MS = 8000;

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
  companyTypes: any[];
  states: any[];
  districts: any[];
  divisions: any[];
  pincodeEntries: any[];
  countries: any[];
  companyFunctions: any[];
  companySubFunctions: any[];
};

export async function fetchRegisterOptions(): Promise<RegisterOptionsPayload & { resolvedEndpoint: string }> {
  const apiRoot = resolveApiRoot();
  const endpoint = `${apiRoot}/auth/register/options`;
  const response = await axios.get(endpoint, {
    timeout: REQUEST_TIMEOUT_MS,
    withCredentials: false,
  });

  const payload = response.data?.data || response.data?.data?.data || {};

  return {
    resolvedEndpoint: endpoint,
    existingCompanies: normalizeArray(payload?.existingCompanies),
    companyTypes: normalizeArray(payload?.companyTypes),
    states: normalizeArray(payload?.states),
    districts: normalizeArray(payload?.districts),
    divisions: normalizeArray(payload?.divisions),
    pincodeEntries: normalizeArray(payload?.pincodeEntries),
    countries: normalizeArray(payload?.countries),
    companyFunctions: normalizeArray(payload?.companyFunctions),
    companySubFunctions: normalizeArray(payload?.companySubFunctions),
  };
}
