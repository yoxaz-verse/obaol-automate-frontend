"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AuthContext from "@/context/AuthContext";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { normalizeApiError } from "@/core/api/apiErrors";
import { showToastMessage } from "@/utils/utils";
import { adaptRows } from "../adapters";
import {
  EMPTY_SAMPLE_FORM,
  buildSampleRequestPayload,
  calculateSampleCooldown,
  filterDistricts,
  toSampleDraft,
  validateSampleRequest,
  type LocationOption,
  type PincodeOption,
  type RecentSampleRequest,
  type SampleFormState,
  type SampleRate,
} from "./domain";

export const useSampleRequest = (rate: SampleRate, open: boolean) => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SampleFormState>(EMPTY_SAMPLE_FORM);
  const [debouncedPincode, setDebouncedPincode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const role = String(user?.role || "").toLowerCase();
  const includeBuyer = role === "admin" || role === "operator";
  const buyerId = includeBuyer ? form.buyerAssociateId : String(user?.id || "");
  const rateId = String(rate._id || "");

  const update = <K extends keyof SampleFormState>(key: K, value: SampleFormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedPincode(form.pincodeSearch), 300);
    return () => window.clearTimeout(timer);
  }, [form.pincodeSearch]);

  useEffect(() => {
    if (open) { setSuccess(false); setConfirming(false); update("buyerAssociateId", ""); update("buyerAssociateName", ""); }
  }, [open]);

  const statesQuery = useQuery({ queryKey: ["sample-request-states"], queryFn: () => getData(apiRoutes.state.getAll, { page: 1, limit: 500 }), enabled: open });
  const districtsQuery = useQuery({
    queryKey: ["sample-request-districts", form.state],
    queryFn: () => getData(apiRoutes.district.getAll, { page: 1, limit: 500, state: form.state }),
    enabled: open && Boolean(form.state),
  });
  const divisionsQuery = useQuery({
    queryKey: ["request-divisions", form.district],
    queryFn: () => getData(apiRoutes.division.getAll, { district: form.district, limit: 300 }),
    enabled: open && Boolean(form.district),
  });
  const pincodesQuery = useQuery({
    queryKey: ["request-pincodes", form.division, debouncedPincode],
    queryFn: () => getData(apiRoutes.pincodeEntry.getAll, {
      division: form.division,
      ...(debouncedPincode ? { search: debouncedPincode } : {}),
      limit: 100,
    }),
    enabled: open && Boolean(form.division),
  });
  const cooldownKey = ["sample-requests", "cooldown", rateId, buyerId] as const;
  const cooldownQuery = useQuery({
    queryKey: cooldownKey,
    queryFn: () => getData(apiRoutes.sampleRequest.list, { page: 1, limit: 1, variantRateId: rateId, ...(buyerId ? { buyerAssociateId: buyerId } : {}) }),
    enabled: open && Boolean(rateId) && Boolean(buyerId),
  });

  const states = adaptRows<LocationOption>(statesQuery.data);
  const districts = filterDistricts(adaptRows<LocationOption>(districtsQuery.data), form.state);
  const divisions = adaptRows<LocationOption>(divisionsQuery.data);
  const pincodes = adaptRows<PincodeOption>(pincodesQuery.data);
  const latest = adaptRows<RecentSampleRequest>(cooldownQuery.data)[0] ?? null;
  const cooldown = useMemo(() => calculateSampleCooldown(latest), [latest]);

  const review = () => {
    if (cooldown.active) return showToastMessage({ type: "error", message: cooldown.label });
    const error = validateSampleRequest(toSampleDraft(rateId, form, includeBuyer));
    if (error) return showToastMessage({ type: "error", message: error });
    setConfirming(true);
  };

  const submit = async () => {
    setSubmitting(true);
    showToastMessage({ type: "info", message: "Authorizing sample dispatch protocol..." });
    try {
      await postData(apiRoutes.sampleRequest.create, buildSampleRequestPayload(toSampleDraft(rateId, form, includeBuyer)));
      showToastMessage({ type: "success", message: "Sample request sent to supplier." });
      setSuccess(true); setConfirming(false); setForm(EMPTY_SAMPLE_FORM);
      await queryClient.invalidateQueries({ queryKey: [...cooldownKey] });
    } catch (error: unknown) {
      const normalized = normalizeApiError(error, "Unable to request sample.");
      showToastMessage({ type: "error", message: normalized.message });
      if (normalized.status === 409) await queryClient.invalidateQueries({ queryKey: [...cooldownKey] });
    } finally { setSubmitting(false); }
  };

  const resetAfterState = (state: string) => setForm((current) => ({ ...current, state, district: "", division: "", pincode: "", pincodeSearch: "" }));
  const resetAfterDistrict = (district: string) => setForm((current) => ({ ...current, district, division: "", pincode: "", pincodeSearch: "" }));
  const resetAfterDivision = (division: string) => setForm((current) => ({ ...current, division, pincode: "", pincodeSearch: "" }));

  return {
    form, update, role, includeBuyer, states, districts, divisions, pincodes, cooldown,
    confirming, setConfirming, success, submitting, review, submit,
    resetAfterState, resetAfterDistrict, resetAfterDivision,
    divisionsLoading: divisionsQuery.isLoading, pincodesLoading: pincodesQuery.isLoading,
    queryError: statesQuery.error || districtsQuery.error || divisionsQuery.error || pincodesQuery.error,
    retry: () => Promise.all([statesQuery.refetch(), districtsQuery.refetch(), divisionsQuery.refetch(), pincodesQuery.refetch()]),
  };
};
