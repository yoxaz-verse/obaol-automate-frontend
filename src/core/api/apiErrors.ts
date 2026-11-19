export type ApiFieldErrors = Record<string, string>;

export type NormalizedApiError = {
  code?: string;
  message: string;
  fieldErrors: ApiFieldErrors;
  status?: number;
  isNetworkError: boolean;
  isRetryable: boolean;
  requestId?: string;
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
    response?: { status?: number; headers?: Record<string, unknown>; data?: { code?: unknown; message?: unknown; error?: unknown; errors?: unknown; requestId?: unknown } };
  } | null;
  const response = candidate?.response;
  const data = response?.data;
  const status = response?.status;
  const candidateCode = readMessage(candidate?.code).toUpperCase();
  const isTimeout = candidateCode === "ECONNABORTED" || candidateCode === "ETIMEDOUT";
  const isNetworkError = !response && (candidateCode === "ERR_NETWORK" || readMessage(candidate?.message).toLowerCase() === "network error");
  const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
  const serviceUnavailable = status === 502 || status === 503 || status === 504;
  const infrastructureMessage = isOffline
    ? "This device is offline. Reconnect to the internet and retry the approval."
    : isTimeout
      ? "The approval service took too long to respond. No decision was recorded; please retry."
      : isNetworkError
        ? "The approval service could not be reached. No decision was recorded; please retry shortly."
        : serviceUnavailable
          ? "The approval service is temporarily unavailable. No decision was recorded; please retry shortly."
          : "";
  const message = readMessage(data?.message)
    || readMessage(data?.error)
    || infrastructureMessage
    || readMessage(candidate?.message)
    || fallback;

  const requestId = readMessage(data?.requestId) || readMessage(response?.headers?.["x-request-id"]);
  return {
    code: readMessage(data?.code) || undefined,
    message,
    fieldErrors: normalizeFieldErrors(data?.errors),
    status,
    isNetworkError,
    isRetryable: isNetworkError || isTimeout || serviceUnavailable,
    requestId: requestId || undefined,
  };
};
