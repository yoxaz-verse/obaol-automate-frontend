export type ApiFieldErrors = Record<string, string>;

export type NormalizedApiError = {
  message: string;
  fieldErrors: ApiFieldErrors;
  status?: number;
  isNetworkError: boolean;
};

const readMessage = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : "";

const normalizeFieldErrors = (value: unknown): ApiFieldErrors => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([field, detail]) => {
    const message = readMessage(detail)
      || (Array.isArray(detail) ? detail.map(readMessage).filter(Boolean).join(" ") : "")
      || (detail && typeof detail === "object" ? readMessage((detail as { message?: unknown }).message) : "");
    return message ? [[field, message]] : [];
  }));
};

export const normalizeApiError = (error: unknown, fallback = "Something went wrong. Please try again."): NormalizedApiError => {
  const candidate = error as {
    code?: string;
    message?: unknown;
    response?: { status?: number; data?: { message?: unknown; error?: unknown; errors?: unknown } };
  } | null;
  const response = candidate?.response;
  const data = response?.data;
  const isNetworkError = !response && (candidate?.code === "ERR_NETWORK" || readMessage(candidate?.message).toLowerCase() === "network error");
  const message = readMessage(data?.message)
    || readMessage(data?.error)
    || (isNetworkError ? "Could not reach the server. Check your connection and try again." : "")
    || readMessage(candidate?.message)
    || fallback;

  return {
    message,
    fieldErrors: normalizeFieldErrors(data?.errors),
    status: response?.status,
    isNetworkError,
  };
};
