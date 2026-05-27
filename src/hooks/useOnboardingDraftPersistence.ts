"use client";

import { useEffect, useRef } from "react";

type DraftPayload<T> = {
  formData: T;
  currentStep: number;
  completedStep: number;
  updatedAt: number;
};

type UseOnboardingDraftPersistenceParams<T> = {
  enabled: boolean;
  userId?: string;
  roleKey: string;
  formData: T;
  currentStep: number;
  completedStep: number;
  onLoad: (payload: Partial<DraftPayload<T>>) => void;
  debounceMs?: number;
};

export function useOnboardingDraftPersistence<T>({
  enabled,
  userId,
  roleKey,
  formData,
  currentStep,
  completedStep,
  onLoad,
  debounceMs = 400,
}: UseOnboardingDraftPersistenceParams<T>) {
  const loadedRef = useRef(false);
  const draftKey = `onboarding_draft_${roleKey}_${userId || "anonymous"}`;

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (!userId) return;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) {
        loadedRef.current = true;
        return;
      }
      const parsed = JSON.parse(raw);
      onLoad(parsed || {});
    } catch {
      // ignore draft load errors
    } finally {
      loadedRef.current = true;
    }
  }, [enabled, draftKey, onLoad, userId]);

  useEffect(() => {
    if (!enabled || !loadedRef.current) return;
    if (typeof window === "undefined") return;
    if (!userId) return;

    const timer = setTimeout(() => {
      const payload: DraftPayload<T> = {
        formData,
        currentStep,
        completedStep,
        updatedAt: Date.now(),
      };

      try {
        window.localStorage.setItem(draftKey, JSON.stringify(payload));
        window.dispatchEvent(
          new CustomEvent("onboardingDraftUpdated", {
            detail: { role: roleKey, completedStep, currentStep },
          })
        );
      } catch {
        // ignore draft save errors
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [enabled, userId, draftKey, formData, currentStep, completedStep, roleKey, debounceMs]);
}
