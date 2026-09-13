// src/core/api/apiHandler.ts

import instance from "@/core/api/axiosInstance";
import type { RequestParams } from "./types";

type GetDataOptions = {
  cacheMode?: "default" | "bypass";
};

// GET request to the API
export const getData = async (
  url: string,
  params: RequestParams = {},
  options: GetDataOptions = {}
) => {
  try {
    const startedAt = Date.now();
    const useBypassCache = options.cacheMode === "bypass";
    const response = await instance.get(url, {
      params,
      headers: useBypassCache
        ? {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        }
        : undefined,
    });
    if (process.env.NODE_ENV !== "production") {
      const elapsedMs = Date.now() - startedAt;
      console.debug(`[api][get] ${url} completed in ${elapsedMs}ms`);
    }
    return response;
  } catch (error) {
    console.error("Error in getData:", error);
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
