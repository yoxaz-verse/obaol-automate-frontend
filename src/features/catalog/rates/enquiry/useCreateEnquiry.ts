"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AuthContext from "@/context/AuthContext";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { apiRoutesByRole } from "@/utils/tableValues";
import { normalizeApiError } from "@/core/api/apiErrors";
import { detectOffPlatformDisclosure } from "@/utils/offPlatformDisclosure";
import { showToastMessage } from "@/utils/utils";
import { adaptMutationRecord, adaptRows, asRecord } from "../adapters";
import {
  EMPTY_ENQUIRY_FORM, buildEnquiryPayload, buyerContacts, companyNames,
  normalizeObjectId, resolveProductId, resolveProductVariantId, resolveSellerId,
  type BuyerOption, type EnquiryFormState, type EnquiryRate, type IncotermOption,
} from "./domain";

export const useCreateEnquiry = (rate: EnquiryRate, explicitVariantId: string) => {
  const { user } = useContext(AuthContext);
  const client = useQueryClient();
  const [form, setForm] = useState<EnquiryFormState>(EMPTY_ENQUIRY_FORM);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const role = String(user?.role || "").toLowerCase();
  const representsBuyer = ["admin", "operator", "team"].includes(role);
  const update = <K extends keyof EnquiryFormState>(key: K, value: EnquiryFormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  const profileQuery = useQuery({
    queryKey: ["associate-me", user?.id],
    queryFn: () => getData(`${apiRoutesByRole.associate}/${user?.id}`),
    enabled: Boolean(user?.id),
  });
  const buyersQuery = useQuery({
    queryKey: ["enquiry-buyer-options"],
    queryFn: () => getData(apiRoutes.enquiry.buyerOptions, { limit: 500 }),
    enabled: representsBuyer,
  });
  const incotermsQuery = useQuery({ queryKey: ["incoterms"], queryFn: () => getData(apiRoutes.incoterm.getAll) });

  const profile = adaptRows<BuyerOption>(profileQuery.data)[0] ?? asRecord(adaptMutationRecord(profileQuery.data)) as BuyerOption;
  const buyers = adaptRows<BuyerOption>(buyersQuery.data).filter((buyer) => !buyer.isDeleted);
  const incoterms = adaptRows<IncotermOption>(incotermsQuery.data);
  const representedBuyer = representsBuyer ? buyers.find((buyer) => buyer._id === form.buyerAssociateId) ?? null : profile;
  const fallbackCompany = asRecord(user).companyApproval;
  const fallbackCompanyName = typeof fallbackCompany === "object" && fallbackCompany !== null
    ? String((fallbackCompany as { companyName?: unknown }).companyName || "") : "";
  const disclosure = useMemo(() => detectOffPlatformDisclosure(form.specification, {
    companyNames: companyNames(representedBuyer, fallbackCompanyName),
  }), [form.specification, representedBuyer, fallbackCompanyName]);

  useEffect(() => {
    const contacts = buyerContacts(profile);
    setForm((current) => ({
      ...current,
      name: current.name || contacts.name || String(asRecord(user).name || asRecord(user).fullName || ""),
      phoneNumber: current.phoneNumber || contacts.phoneNumber || String(asRecord(user).phone || asRecord(user).phoneNumber || ""),
    }));
  }, [profile, user]);

  const selectBuyer = (buyerId: string) => {
    const buyer = buyers.find((option) => option._id === buyerId);
    const contacts = buyerContacts(buyer);
    setForm((current) => ({ ...current, buyerAssociateId: buyerId, name: contacts.name, phoneNumber: contacts.phoneNumber }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      let productId = resolveProductId(rate);
      const variantId = resolveProductVariantId(rate, explicitVariantId);
      if (!productId && variantId) {
        const response = await getData(`${apiRoutesByRole.productVariant}/${variantId}`);
        const variant = adaptMutationRecord(response);
        productId = normalizeObjectId(asRecord(variant.product)._id || variant.product);
      }
      const buyerId = representsBuyer ? normalizeObjectId(form.buyerAssociateId) : normalizeObjectId(profile._id || user?.id);
      const profileContacts = buyerContacts(profile);
      const payload = buildEnquiryPayload({ rate, form, productId, buyerId, sellerId: resolveSellerId(rate), userId: user?.id, role, profileName: profileContacts.name, profilePhone: profileContacts.phoneNumber });
      return postData(apiRoutesByRole.enquiry, payload);
    },
    onSuccess: (response) => {
      const id = normalizeObjectId(adaptMutationRecord(response)._id);
      setCreatedId(id || null);
      setSuccess(true);
      void client.invalidateQueries();
    },
    onError: (error: unknown) => {
      const normalized = normalizeApiError(error, "Something went wrong. Please try again.");
      const conflict = normalized.status === 409 || normalized.code === "LISTING_NOT_ENQUIRY_ELIGIBLE";
      if (conflict) void client.invalidateQueries({ queryKey: ["variantRate"] });
      showToastMessage({ type: "error", message: conflict
        ? "This product is no longer available for enquiry. Please refresh the marketplace."
        : normalized.message });
    },
  });

  const submit = () => {
    if (disclosure) return showToastMessage({ type: "error", message: disclosure.message });
    if (representsBuyer && !normalizeObjectId(form.buyerAssociateId)) return showToastMessage({ type: "error", message: "Please select a valid buyer associate." });
    if (!resolveSellerId(rate)) return showToastMessage({ type: "error", message: "Invalid seller mapping for this listing. Please refresh trade listing data." });
    mutation.mutate();
  };

  return {
    form, update, selectBuyer, buyers, incoterms, representsBuyer, disclosure,
    buyerOptionsLoading: buyersQuery.isLoading, loading: mutation.isPending,
    createdId, success, submit,
    queryError: profileQuery.error || buyersQuery.error || incotermsQuery.error,
    retry: () => Promise.all([profileQuery.refetch(), buyersQuery.refetch(), incotermsQuery.refetch()]),
  };
};
