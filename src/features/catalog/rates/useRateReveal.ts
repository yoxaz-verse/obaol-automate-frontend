"use client";

import { useEffect, useState } from "react";
import { postData } from "@/core/api/apiHandler";
import { variantRateRoutes } from "@/core/api/apiRoutes";
import { normalizeApiError } from "@/core/api/apiErrors";
import { showToastMessage } from "@/utils/utils";
import { adaptMutationRecord } from "./adapters";

const REVEALED_KEY = "obaol:revealed-rates";
const SESSION_KEY = "obaol:rate-reveal-session";

const revealSessionId = () => {
  let identifier = sessionStorage.getItem(SESSION_KEY);
  if (!identifier) {
    identifier = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, identifier);
  }
  return identifier;
};

export const useRateReveal = (enabled: boolean) => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [revealingId, setRevealingId] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(REVEALED_KEY) || "{}");
      setPrices(stored && typeof stored === "object" && !Array.isArray(stored) ? stored as Record<string, number> : {});
    } catch { setPrices({}); }
  }, [enabled]);

  const reveal = async (rateId: string) => {
    if (!rateId || revealingId) return;
    setRevealingId(rateId);
    try {
      const response = await postData(variantRateRoutes.reveal(rateId), { sessionId: revealSessionId() });
      const record = adaptMutationRecord(response);
      const finalPrice = Number(record.finalPrice);
      if (!Number.isFinite(finalPrice)) throw new Error("The rate could not be loaded.");
      setPrices((current) => {
        const next = { ...current, [rateId]: finalPrice };
        sessionStorage.setItem(REVEALED_KEY, JSON.stringify(next));
        return next;
      });
    } catch (error: unknown) {
      showToastMessage({ type: "error", message: normalizeApiError(error, "Unable to reveal this rate.").message });
    } finally { setRevealingId(null); }
  };
  return { prices, revealingId, reveal };
};
