"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { normalizeApiError } from "@/core/api/apiErrors";
import { showToastMessage } from "@/utils/utils";

type ApiMutationMessages<TData> = {
  success?: string | ((data: TData) => string);
  error?: string;
};

export const useApiMutation = <TData, TVariables = void>(options: UseMutationOptions<TData, unknown, TVariables>, messages: ApiMutationMessages<TData> = {}) => {
  const { onSuccess, onError, ...mutationOptions } = options;
  return useMutation<TData, unknown, TVariables>({
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      const message = typeof messages.success === "function" ? messages.success(data) : messages.success;
      if (message) showToastMessage({ type: "success", message, position: "top-right" });
      onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      showToastMessage({ type: "error", message: normalizeApiError(error, messages.error).message, position: "top-right" });
      onError?.(error, variables, onMutateResult, context);
    },
  });
};
