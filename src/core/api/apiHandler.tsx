// src/core/api/apiHandler.ts

import instance from "@/core/api/axiosInstance";
import type { RequestParams } from "./types";

type GetDataOptions = {
  cacheMode?: "default" | "bypass";
  signal?: AbortSignal;
  timeoutMs?: number;
};

const recordApiTiming = (url: string, startedAt: number, status: number, requestId?: string) => {
  if (typeof window === "undefined" || typeof performance === "undefined") return;
  const duration = performance.now() - startedAt;
  window.dispatchEvent(new CustomEvent("obaol:api-timing", {
    detail: {
      // Deliberately exclude query parameters and response data from telemetry.
      route: String(url).split("?")[0],
      duration,
      status,
      requestId: requestId || undefined,
    },
  }));
};

// GET request to the API
export const getData = async (
  url: string,
  params: RequestParams = {},
  options: GetDataOptions = {}
) => {
  const startedAt = typeof performance === "undefined" ? Date.now() : performance.now();
  try {
    const useBypassCache = options.cacheMode === "bypass";
    const response = await instance.get(url, {
      params,
      signal: options.signal,
      timeout: options.timeoutMs,
      headers: useBypassCache
        ? {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        }
        : undefined,
    });
    const requestId = String(response.headers?.["x-request-id"] || "");
    recordApiTiming(url, startedAt, response.status, requestId);
    if (process.env.NODE_ENV !== "production") {
      const elapsedMs = (typeof performance === "undefined" ? Date.now() : performance.now()) - startedAt;
      console.debug(`[api][get] ${url} completed in ${elapsedMs}ms`);
    }
    return response;
  } catch (error: any) {
    recordApiTiming(url, startedAt, Number(error?.response?.status || 0), String(error?.response?.headers?.["x-request-id"] || ""));
    // Callers (typically query boundaries) own presentation and telemetry. Logging
    // here duplicates handled failures and produces console noise during redirects.
    throw error;
  }
};

// POST request to the API
export const postData = async (url: string, data: unknown, params: RequestParams = {}) => {

  try {
    const headers = {
      Accept: "application/json",
      // "Content-Type" is managed by Axios instance or specific functions
    };

    return await instance.post(url, data, { params, headers });
  } catch (error) {
    console.error("Error in postData:", error);
    throw error;
  }
};

// Define and export postMultipart
export const postMultipart = async (
  url: string,
  data: FormData,
  params: RequestParams = {}
) => {
  try {
    const headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };

    return await instance.post(url, data, { params, headers });
  } catch (error) {
    console.error("Error in postMultipart:", error);
    throw error;
  }
};

// PUT request to the API
export const putData = async (url: string, data: unknown, params: RequestParams = {}) => {
  try {
    const headers = {
      Accept: "application/json",
    };

    return await instance.put(url, data, { params, headers });
  } catch (error) {
    console.error("Error in putData:", error);
    throw error;
  }
};

// PATCH request to the API
export const patchData = async (url: string, data: unknown, params: RequestParams = {}) => {
  try {
    const headers = {
      Accept: "application/json",
    };

    return await instance.patch(url, data, { params, headers });
  } catch (error) {
    console.error("Error in patchData:", error);
    throw error;
  }
};

// DELETE request to the API
export const deleteData = async (url: string, params: RequestParams = {}) => {
  try {
    return await instance.delete(url, { params });
  } catch (error) {
    console.error("Error in deleteData:", error);
    throw error;
  }
};

// DELETE request with a request body
export const deleteDataBody = async (
  url: string,
  params: RequestParams = {},
  data: unknown
) => {
  try {
    return await instance.request({
      method: "DELETE",
      url,
      params,
      data,
    });
  } catch (error) {
    console.error("Error in deleteDataBody:", error);
    throw error;
  }
};
