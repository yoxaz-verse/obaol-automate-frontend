"use client";

import React, { useMemo, useState, useContext, useEffect, useRef, useCallback } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  RadioGroup,
  Radio,
  Textarea,
  Chip,
  Spinner,
} from "@nextui-org/react";
import { IoArchive, IoArrowDownCircleOutline, IoArrowUpCircleOutline, IoBoat, IoBusiness, IoCall, IoCar, IoCart, IoCash, IoEarth, IoEye, IoEyeOff, IoFlask, IoHome, IoLocation, IoLockClosed, IoMail, IoPerson, IoSearch, IoStorefront } from "react-icons/io5";
import { LuBadgeCheck, LuPackageSearch, LuSearchCheck } from "react-icons/lu";
import { FiCheck, FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { showToastMessage } from "@/utils/utils";
import AuthLayout from "@/components/Auth/AuthLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import PhoneField from "@/components/form/PhoneField";
import { parsePhoneValue } from "@/utils/phone";
import { useSoundEffect } from "@/context/SoundContext";
import AuthContext from "@/context/AuthContext";
import { getData, postData } from "@/core/api/apiHandler";
import { clearGoogleButton, loadGoogleGsi, renderGoogleButton } from "@/utils/googleGsi";
import { useOnboardingDraftPersistence } from "@/hooks/useOnboardingDraftPersistence";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { COMPANY_FUNCTION_TAXONOMY_VERSION, fetchRegisterOptions, resolveApiRoot } from "@/utils/registerOptions";
import { reconcileCompanyFunctionPriorities } from "@/utils/companyFunctionPriorities";
import { getCompanyFunctionPerspectiveDescription } from "@/utils/companyFunctionDescriptions";
import {
  ASSOCIATE_PASSWORD_REQUIREMENTS,
  getMissingAssociatePasswordRequirements,
  isRepeatedDigitPhone,
} from "@/utils/associateOnboardingValidation";
import { OnboardingProgress, ReferralCodeField } from "@/components/onboarding/OnboardingUI";

type StepKey = 1 | 2 | 3 | 4;
const EMPTY_LIST: any[] = [];
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const IEC_REGEX = /^[A-Z0-9]{10}$/;
const CIN_REGEX = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
const MAIN_CATEGORY_SLUGS = new Set([
  "buyer",
  "seller",
  "sourcing",
  "packaging",
  "testing",
  "warehouse-storage",
  "finance-risk",
  "importing-to-india",
  "exporting-from-india",
  "freight-forwarding",
  "inland-logistics",
]);
const normalizeOnboardingError = (error: any) => {
  const status = Number(error?.response?.status || 0);
  const raw = String(error?.response?.data?.message || error?.message || "Registration failed.");
  if (status === 401) return "Your onboarding session expired. Please sign in again and continue onboarding.";
  if (status === 429) return raw || "Too many attempts. Please wait and try again.";
  if (/verify your email|verified email|otp/i.test(raw)) return raw;
  if (/network error|err_network/i.test(raw)) return "Connection failed. Please check your internet and retry.";
  if (/duplicate key|already registered/i.test(raw)) return "This email or company is already registered. Please sign in or use another email.";
  return raw;
};
// Global window extension handled by explicit casting to avoid declaration conflicts
const decodeJwt = (token: string): any => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export default function AssociateOnboardingForm({ mode = "auth" }: { mode?: "auth" | "onboarding" }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const AutocompleteAny = Autocomplete as any;
  const { user, refreshUser } = useContext(AuthContext);
  const isOnboarding = mode === "onboarding";
  const DRAFT_KEY = `onboarding_draft_associate_${user?.id || "anonymous"}`;
  const [currentStep, setCurrentStep] = useState<StepKey>(1);
  const [completedStep, setCompletedStep] = useState<number>(0);
  const [legacyDraftNeedsRoleSwap, setLegacyDraftNeedsRoleSwap] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAcceptedLegalTerms, setHasAcceptedLegalTerms] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submitInFlightRef = useRef(false);
  const [googleSignUp, setGoogleSignUp] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const [googleRenderError, setGoogleRenderError] = useState("");
  const authMethod = String(searchParams?.get("auth") || "").toLowerCase();
  const isGoogleOnboarding = isOnboarding && authMethod === "google";
  const requiresPassword = isOnboarding ? !isGoogleOnboarding : !googleSignUp;
  const [emailCheckStatus, setEmailCheckStatus] = useState<"idle" | "available" | "exists" | "error">("idle");
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "+91",
    phoneNational: "",
    phoneSecondary: "",
    phoneSecondaryCountryCode: "+91",
    phoneSecondaryNational: "",
    password: "",
    confirmPassword: "",
    hasCompany: "yes",
    companyMode: "existing",
    associateCompanyId: "",
    associateCompanyName: "",
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyPhoneCountryCode: "+91",
    companyPhoneNational: "",
    companyPhoneSecondary: "",
    companyPhoneSecondaryCountryCode: "+91",
    companyPhoneSecondaryNational: "",
    companyAddress: "",
    companyGstin: "",
    companyIecCode: "",
    companyCin: "",
    companyLegalNumber: "",
    companyLegalInformation: "",
    companyGeoType: "INDIAN",
    companyCountry: "",
    companyState: "",
    companyDistrict: "",
    companyDivision: "",
    companyPincodeEntry: "",
    providedFunctionIds: [] as string[],
    soughtFunctionIds: [] as string[],
    providedFunctionPriorities: [] as string[],
    soughtFunctionPriorities: [] as string[],
    contactPreference: "phone",
    contactNotes: "",
    associateAddress: "",
    associateGeoType: "INDIAN",
    associateCountry: "",
    associateState: "",
    associateDistrict: "",
    associateDivision: "",
    associatePincodeEntry: "",
    referralCode: "",
  });

  const hydrateDraft = useCallback((parsed: any) => {
    if (Number(parsed?.draftVersion || 1) < COMPANY_FUNCTION_TAXONOMY_VERSION) {
      setLegacyDraftNeedsRoleSwap(true);
    }
    if (parsed?.formData) setFormData((prev) => {
      const hydrated = { ...prev, ...parsed.formData };
      hydrated.providedFunctionPriorities = reconcileCompanyFunctionPriorities(
        hydrated.providedFunctionIds,
        hydrated.providedFunctionPriorities
      );
      hydrated.soughtFunctionPriorities = reconcileCompanyFunctionPriorities(
        hydrated.soughtFunctionIds,
        hydrated.soughtFunctionPriorities
      );
      return hydrated;
    });
    if (parsed?.currentStep) setCurrentStep(parsed.currentStep);
    if (parsed?.completedStep) setCompletedStep(parsed.completedStep);
  }, []);

  const debouncedEmail = useDebouncedValue(formData.email, 350);
  const [companySearch, setCompanySearch] = useState("");
  const [isCompanySearchOpen, setIsCompanySearchOpen] = useState(false);
  const debouncedCompanySearch = useDebouncedValue(companySearch.trim(), 300);
  const normalizedCompanySearch = companySearch.trim();
  const canShowCompanySearchResults =
    normalizedCompanySearch.length >= 3 && debouncedCompanySearch === normalizedCompanySearch;
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const [optionsDebug, setOptionsDebug] = useState<{
    resolvedEndpoint: string;
    counts: { designations: number; countries: number };
    lastError: string;
  }>({
    resolvedEndpoint: "",
    counts: { designations: 0, countries: 0 },
    lastError: "",
  });

  useOnboardingDraftPersistence({
    enabled: isOnboarding,
    userId: user?.id,
    roleKey: "associate",
    formData,
    currentStep,
    completedStep,
    onLoad: hydrateDraft,
    draftVersion: COMPANY_FUNCTION_TAXONOMY_VERSION,
  });

  React.useEffect(() => {
    if (!isOnboarding || !user) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }));
  }, [isOnboarding, user]);

  React.useEffect(() => {
    const prefill = String(searchParams?.get("prefill") || "").trim();
    const intent = String(searchParams?.get("intent") || "").toUpperCase();
    setFormData((prev) => ({
      ...prev,
      email: prev.email || (isOnboarding ? "" : prefill),
    }));
  }, [isOnboarding, searchParams]);

  const { data: registerOptions, isLoading: optionsLoading, isError: optionsError, refetch: refetchOptions } = useQuery({
    queryKey: ["register-options", COMPANY_FUNCTION_TAXONOMY_VERSION],
    queryFn: async () => {
      const output = await fetchRegisterOptions();
      setOptionsDebug({
        resolvedEndpoint: output.resolvedEndpoint,
        counts: {
          designations: output.designations.length,
          countries: output.countries.length,
        },
        lastError: "",
      });
      return output;
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const companySearchQuery = useQuery({
    queryKey: ["register-company-search", debouncedCompanySearch],
    queryFn: async () => {
      const apiRoot = resolveApiRoot();
      const response = await axios.get(`${apiRoot}/auth/register/companies`, {
        params: { q: debouncedCompanySearch },
        timeout: 15000,
      });
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: debouncedCompanySearch.length >= 3,
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (normalizedCompanySearch.length < 3) setIsCompanySearchOpen(false);
  }, [normalizedCompanySearch]);

  useEffect(() => {
    if (!isOnboarding || currentStep !== 1) return;
    queryClient.prefetchQuery({
      queryKey: ["register-options", COMPANY_FUNCTION_TAXONOMY_VERSION],
      queryFn: fetchRegisterOptions,
      staleTime: 15 * 60 * 1000,
    });
  }, [currentStep, isOnboarding, queryClient]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const start = performance.now();
    return () => {
      const elapsed = Math.round(performance.now() - start);
      console.info(`[perf][AssociateOnboardingForm] step=${currentStep} transition=${elapsed}ms`);
    };
  }, [currentStep]);

  React.useEffect(() => {
    if (isOnboarding) return;
    if (!googleClientId || typeof window === "undefined") return;
    loadGoogleGsi()
      .then(() => setGoogleReady(true))
      .catch(() => setGoogleRenderError("Google sign-up is temporarily unavailable."));
  }, [googleClientId, isOnboarding]);

  React.useEffect(() => {
    if (isOnboarding) return;
    if (!googleReady) return;
    let mounted = true;
    const containerId = "google-register-associate";

    const doRender = async () => {
      try {
        await renderGoogleButton({
          containerId,
          clientId: googleClientId,
          width: 360,
          maxRetries: 7,
          retryDelayMs: 120,
          callback: (resp: { credential?: string }) => {
            if (!resp?.credential) return;
            const payload = decodeJwt(resp.credential);
            setGoogleIdToken(resp.credential);
            setGoogleSignUp(true);
            setFormData((prev) => ({
              ...prev,
              name: prev.name || payload?.name || "",
              email: prev.email || payload?.email || "",
            }));
          },
        });
        if (mounted) setGoogleRenderError("");
      } catch {
        if (mounted) setGoogleRenderError("Google sign-up failed to load. Please reload it.");
      }
    };

    doRender();
    const onVisibility = () => {
      if (document.visibilityState === "visible") doRender();
    };
    const onPageShow = () => doRender();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      clearGoogleButton(containerId);
    };
  }, [googleReady, googleClientId, isOnboarding]);

  const handleGoogleReload = async () => {
    const containerId = "google-register-associate";
    clearGoogleButton(containerId);
    try {
      await renderGoogleButton({
        containerId,
        clientId: googleClientId,
        width: 360,
        maxRetries: 8,
        retryDelayMs: 140,
        callback: (resp: { credential?: string }) => {
          if (!resp?.credential) return;
          const payload = decodeJwt(resp.credential);
          setGoogleIdToken(resp.credential);
          setGoogleSignUp(true);
          setFormData((prev) => ({
            ...prev,
            name: prev.name || payload?.name || "",
            email: prev.email || payload?.email || "",
          }));
        },
      });
      setGoogleRenderError("");
    } catch {
      setGoogleRenderError("Google sign-up failed to load. Please try again.");
    }
  };

  const existingCompanies = Array.isArray(companySearchQuery.data) ? companySearchQuery.data : EMPTY_LIST;
  const companyOptions = useMemo(() => {
    if (!formData.associateCompanyId || existingCompanies.some((item: any) => String(item?._id) === formData.associateCompanyId)) {
      return existingCompanies;
    }
    return [{ _id: formData.associateCompanyId, name: formData.associateCompanyName || "Selected company" }, ...existingCompanies];
  }, [existingCompanies, formData.associateCompanyId, formData.associateCompanyName]);
  useEffect(() => {
    if (!companySearch && formData.associateCompanyId && formData.associateCompanyName) {
      setCompanySearch(formData.associateCompanyName);
    }
  }, [companySearch, formData.associateCompanyId, formData.associateCompanyName]);
  const states = Array.isArray(registerOptions?.states) ? registerOptions.states : EMPTY_LIST;
  const districts = Array.isArray(registerOptions?.districts) ? registerOptions.districts : EMPTY_LIST;
  const divisions = Array.isArray(registerOptions?.divisions) ? registerOptions.divisions : EMPTY_LIST;
  const pincodeEntries = Array.isArray(registerOptions?.pincodeEntries) ? registerOptions.pincodeEntries : EMPTY_LIST;
  const countries = Array.isArray(registerOptions?.countries) ? registerOptions.countries : EMPTY_LIST;
  const { play } = useSoundEffect();
  const companyFunctions = Array.isArray(registerOptions?.companyFunctions) ? registerOptions.companyFunctions : EMPTY_LIST;
  const companySubFunctions = Array.isArray(registerOptions?.companySubFunctions) ? registerOptions.companySubFunctions : EMPTY_LIST;
  const failedOptionKeys = Array.isArray(registerOptions?.meta?.failedKeys) ? registerOptions.meta.failedKeys : EMPTY_LIST;
  const failedOptionLabels = failedOptionKeys.map((key: string) => ({
    designations: "designation",
    states: "state",
    districts: "district",
    divisions: "division",
    countries: "country",
    companyFunctions: "company capability",
    companySubFunctions: "company sub-capability",
  }[key] || key));
  const partialOptionsError = registerOptions?.meta?.partial
    ? `Could not load ${failedOptionLabels.length > 0 ? failedOptionLabels.join(", ") : "some registration"} options. Please retry.`
    : "";

  const [dynamicPincodes, setDynamicPincodes] = useState<any[]>([]);
  const [isPincodesLoading, setIsPincodesLoading] = useState(false);

  const fetchPincodes = async (divisionId: string) => {
    if (!divisionId) {
      setDynamicPincodes([]);
      return;
    }
    setIsPincodesLoading(true);
    try {
      const apiRoot = resolveApiRoot();
      const res = await axios.get(`${apiRoot}/auth/register/pincodes?divisionId=${divisionId}`);
      setDynamicPincodes(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch pincodes:", err);
    } finally {
      setIsPincodesLoading(false);
    }
  };

  React.useEffect(() => {
    if (formData.companyDivision) {
      fetchPincodes(formData.companyDivision);
    } else {
      setDynamicPincodes([]);
    }
  }, [formData.companyDivision]);

  React.useEffect(() => {
    if (formData.associateDivision) {
      fetchPincodes(formData.associateDivision);
    } else if (!formData.companyDivision) {
      setDynamicPincodes([]);
    }
  }, [formData.associateDivision, formData.companyDivision]);
  const selectedCompanyLabel =
    companyOptions.find((item: any) => String(item?._id) === String(formData.associateCompanyId))?.name || formData.associateCompanyName || "Not selected";
  const selectedExistingCompany = companyOptions.find(
    (item: any) => String(item?._id) === String(formData.associateCompanyId)
  );
  const selectedExistingCompanyInterests = Array.isArray(selectedExistingCompany?.providedCapabilities)
    ? selectedExistingCompany.providedCapabilities
    : [];
  const existingCompanyCapabilityLabels = selectedExistingCompanyInterests.map((cap: any) => {
    const token = String(cap || "").trim();
    const matchedById = companyFunctions.find((fn: any) => String(fn?._id || "") === token);
    if (matchedById?.name) return matchedById.name;
    const normalized = token.replace(/[\s-]+/g, "_").toUpperCase();
    const matchedBySlug = companyFunctions.find(
      (fn: any) => String(fn?.slug || "").replace(/[\s-]+/g, "_").toUpperCase() === normalized
    );
    return matchedBySlug?.name || token;
  }).filter(Boolean);
  const selectedCountryName =
    countries.find((c: any) => String(c?._id || "") === String(formData.companyCountry || ""))?.name ||
    formData.companyCountry ||
    "";
  const selectedCompanyStateName =
    states.find((s: any) => String(s?._id || "") === String(formData.companyState || ""))?.name || "";
  const selectedCompanyDistrictName =
    districts.find((d: any) => String(d?._id || "") === String(formData.companyDistrict || ""))?.name || "";
  const selectedCompanyDivisionName =
    divisions.find((d: any) => String(d?._id || "") === String(formData.companyDivision || ""))?.name || "";
  const selectedAssociateStateName =
    states.find((s: any) => String(s?._id || "") === String(formData.associateState || ""))?.name || "";
  const selectedAssociateDistrictName =
    districts.find((d: any) => String(d?._id || "") === String(formData.associateDistrict || ""))?.name || "";

  const normalizeName = useCallback((value: any) => String(value || "").trim().toLowerCase(), []);
  const getDistrictStateId = useCallback((item: any) =>
    String(
      item?.state ||
        item?.stateId ||
        item?.state_id ||
        item?.state?._id ||
        item?.state?.id ||
        ""
    ), []);
  const getDistrictStateName = useCallback((item: any) =>
    normalizeName(item?.stateName || item?.state_name || item?.state?.name || ""), [normalizeName]);
  const getDivisionDistrictId = useCallback((item: any) =>
    String(
      item?.district ||
        item?.districtId ||
        item?.district_id ||
        item?.district?._id ||
        item?.district?.id ||
        ""
    ), []);
  const getDivisionDistrictName = useCallback((item: any) =>
    normalizeName(item?.districtName || item?.district_name || item?.district?.name || ""), [normalizeName]);

  const filteredCompanyDistricts = useMemo(() => {
    const stateId = String(formData.companyState || "");
    const stateName = normalizeName(selectedCompanyStateName);
    return districts.filter((item: any) => {
      const matchId = stateId && getDistrictStateId(item) === stateId;
      const matchName = stateName && getDistrictStateName(item) === stateName;
      return matchId || matchName;
    });
  }, [districts, formData.companyState, getDistrictStateId, getDistrictStateName, normalizeName, selectedCompanyStateName]);

  const filteredCompanyDivisions = useMemo(() => {
    const districtId = String(formData.companyDistrict || "");
    const districtName = normalizeName(selectedCompanyDistrictName);
    return divisions.filter((item: any) => {
      const matchId = districtId && getDivisionDistrictId(item) === districtId;
      const matchName = districtName && getDivisionDistrictName(item) === districtName;
      return matchId || matchName;
    });
  }, [divisions, formData.companyDistrict, getDivisionDistrictId, getDivisionDistrictName, normalizeName, selectedCompanyDistrictName]);

  const filteredAssociateDistricts = useMemo(() => {
    const stateId = String(formData.associateState || "");
    const stateName = normalizeName(selectedAssociateStateName);
    return districts.filter((item: any) => {
      const matchId = stateId && getDistrictStateId(item) === stateId;
      const matchName = stateName && getDistrictStateName(item) === stateName;
      return matchId || matchName;
    });
  }, [districts, formData.associateState, getDistrictStateId, getDistrictStateName, normalizeName, selectedAssociateStateName]);

  const filteredAssociateDivisions = useMemo(() => {
    const districtId = String(formData.associateDistrict || "");
    const districtName = normalizeName(selectedAssociateDistrictName);
    return divisions.filter((item: any) => {
      const matchId = districtId && getDivisionDistrictId(item) === districtId;
      const matchName = districtName && getDivisionDistrictName(item) === districtName;
      return matchId || matchName;
    });
  }, [divisions, formData.associateDistrict, getDivisionDistrictId, getDivisionDistrictName, normalizeName, selectedAssociateDistrictName]);

  const filteredPincodes = dynamicPincodes;
  const groupedCompanyFunctions = useMemo(() => {
    const seen = new Map<string, any>();
    companyFunctions.forEach((fn: any) => {
      const slug = String(fn?.slug || "").trim();
      if (MAIN_CATEGORY_SLUGS.size && !MAIN_CATEGORY_SLUGS.has(slug)) return;
      const key = slug || String(fn?._id || fn?.name || "");
      if (!key || seen.has(key)) return;
      seen.set(key, fn);
    });
    return Array.from(seen.values()).sort((a: any, b: any) => {
      const orderA = Number(a?.orderIndex || 0);
      const orderB = Number(b?.orderIndex || 0);
      if (orderA !== orderB) return orderA - orderB;
      return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
  }, [companyFunctions]);
  const companyFunctionNameById = useMemo(() => {
    const map = new Map<string, string>();
    groupedCompanyFunctions.forEach((fn: any) => {
      const id = String(fn?._id || "");
      if (id) map.set(id, String(fn?.name || ""));
    });
    return map;
  }, [groupedCompanyFunctions]);

  useEffect(() => {
    if (!legacyDraftNeedsRoleSwap || !groupedCompanyFunctions.length) return;
    const buyerId = String(groupedCompanyFunctions.find((fn: any) => fn?.slug === "buyer")?._id || "");
    const sellerId = String(groupedCompanyFunctions.find((fn: any) => fn?.slug === "seller")?._id || "");
    if (!buyerId || !sellerId) return;
    const swapSoughtRoleId = (id: string) => id === buyerId ? sellerId : id === sellerId ? buyerId : id;
    setFormData((prev) => {
      const soughtFunctionIds = Array.from(new Set(prev.soughtFunctionIds.map(swapSoughtRoleId)));
      const soughtFunctionPriorities = reconcileCompanyFunctionPriorities(
        soughtFunctionIds,
        prev.soughtFunctionPriorities.map(swapSoughtRoleId)
      );
      return { ...prev, soughtFunctionIds, soughtFunctionPriorities };
    });
    setLegacyDraftNeedsRoleSwap(false);
  }, [groupedCompanyFunctions, legacyDraftNeedsRoleSwap]);

  useEffect(() => {
    const intent = String(searchParams?.get("intent") || "").toUpperCase();
    if (!["BUY", "SELL", "BOTH"].includes(intent) || !groupedCompanyFunctions.length) return;
    const suggestedSlugs = intent === "BUY" ? ["buyer"] : intent === "SELL" ? ["seller"] : ["buyer", "seller"];
    const suggestedIds = groupedCompanyFunctions
      .filter((fn: any) => suggestedSlugs.includes(String(fn?.slug || "")))
      .map((fn: any) => String(fn?._id || ""))
      .filter(Boolean);
    if (!suggestedIds.length) return;
    setFormData((prev) => prev.providedFunctionIds.length
      ? prev
      : {
          ...prev,
          providedFunctionIds: suggestedIds,
          providedFunctionPriorities: reconcileCompanyFunctionPriorities(suggestedIds, []),
        });
  }, [groupedCompanyFunctions, searchParams]);

  const updateCompanyFunctionSelection = (kind: "provided" | "sought", functionId: string) => {
    setFormData((prev) => {
      const idsKey = kind === "provided" ? "providedFunctionIds" : "soughtFunctionIds";
      const prioritiesKey = kind === "provided" ? "providedFunctionPriorities" : "soughtFunctionPriorities";
      const currentIds = prev[idsKey];
      const currentPriorities = prev[prioritiesKey];
      const isSelected = currentIds.includes(functionId);
      let nextIds = currentIds;
      if (isSelected) {
        nextIds = currentIds.filter((id) => id !== functionId);
      } else if (currentIds.length < 6) {
        nextIds = [...currentIds, functionId];
      }

      const nextPriorities = reconcileCompanyFunctionPriorities(nextIds, currentPriorities);

      return { ...prev, [idsKey]: nextIds, [prioritiesKey]: nextPriorities };
    });
    const errorKey = kind === "provided" ? "providedFunctionIds" : "soughtFunctionIds";
    if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: "" }));
  };

  const moveCompanyFunctionPriority = (kind: "provided" | "sought", functionId: string, direction: "up" | "down") => {
    setFormData((prev) => {
      const prioritiesKey = kind === "provided" ? "providedFunctionPriorities" : "soughtFunctionPriorities";
      const current = [...prev[prioritiesKey]];
      const index = current.indexOf(functionId);
      if (index === -1) return prev;
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= current.length) return prev;
      const next = [...current];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return { ...prev, [prioritiesKey]: next };
    });
  };

  const capabilityIcon = (slug: string) => {
    const icons: Record<string, React.ReactNode> = {
      buyer: <IoCart />,
      seller: <IoStorefront />,
      sourcing: <IoSearch />,
      packaging: <IoArchive />,
      testing: <IoFlask />,
      "warehouse-storage": <IoHome />,
      "finance-risk": <IoCash />,
      "importing-to-india": <IoArrowDownCircleOutline />,
      "exporting-from-india": <IoArrowUpCircleOutline />,
      "freight-forwarding": <IoBoat />,
      "inland-logistics": <IoCar />,
    };
    return icons[slug] || <LuBadgeCheck />;
  };

  const renderCapabilitySection = (kind: "provided" | "sought") => {
    const ids = kind === "provided" ? formData.providedFunctionIds : formData.soughtFunctionIds;
    const priorities = kind === "provided" ? formData.providedFunctionPriorities : formData.soughtFunctionPriorities;
    const error = errors[kind === "provided" ? "providedFunctionIds" : "soughtFunctionIds"];
    const title = kind === "provided" ? "What your company provides" : "What your company is seeking";
    const SectionIcon = kind === "provided" ? LuBadgeCheck : LuPackageSearch;
    return (
      <section className="onboarding-section-card">
        <div className="mb-3 flex items-center gap-2 text-obaol-600">
          <SectionIcon aria-hidden className="text-lg" />
          <h4 className="text-base font-bold tracking-tight">
            {title}<span aria-hidden="true" className="ml-0.5 text-danger">*</span>
          </h4>
          <span className="ml-auto text-xs font-semibold text-default-500">{ids.length}/6 selected</span>
        </div>
        <p className="mb-4 text-sm leading-6 text-default-600">
          {kind === "provided"
            ? "Choose the activities, products, or services your company offers or performs."
            : "Choose the products, services, or partnerships your company wants to find."}
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {groupedCompanyFunctions.map((fn: any) => {
            const fnId = String(fn?._id || "");
            const selected = ids.includes(fnId);
            const disabled = !selected && ids.length >= 6;
            const priorityIndex = priorities.indexOf(fnId);
            return (
              <button key={`${kind}-${fnId}`} type="button" disabled={disabled}
                aria-pressed={selected} onClick={() => updateCompanyFunctionSelection(kind, fnId)}
                className={`flex min-h-[76px] touch-manipulation items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${selected ? "border-primary-500 bg-primary-500/10 text-primary-700" : "border-default-200 bg-white hover:border-primary-500/50 dark:bg-content1"} ${disabled ? "cursor-not-allowed opacity-40" : ""}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${selected ? "bg-obaol-500 text-white" : "bg-default-100 text-default-500"}`}>{capabilityIcon(String(fn?.slug || ""))}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold leading-5">{fn?.name}</span>
                  <span className="mt-0.5 block line-clamp-2 text-xs font-normal leading-[1.125rem] text-default-500">
                    {getCompanyFunctionPerspectiveDescription(fn?.slug, kind, fn?.description)}
                  </span>
                </span>
                {priorityIndex > -1 && <span className="rounded-full bg-obaol-500/15 px-2 py-1 text-xs font-bold">P{priorityIndex + 1}</span>}
              </button>
            );
          })}
        </div>
        {error && <p className="mt-2 text-xs font-semibold text-danger-500">{error}</p>}
        <div className="mt-4">
          <p className="text-sm font-bold text-foreground">Top priorities</p>
          <p className="mt-1 text-xs leading-5 text-default-500">Your first three selections become priorities automatically. Reorder them if needed.</p>
          {priorities.length ? <div className="mt-2 space-y-2">{priorities.map((id, index) => {
            return (
            <div key={`${kind}-priority-${id}`} className="flex items-center justify-between gap-2 rounded-lg border border-default-200 bg-content1/60 px-3 py-2">
              <span className="min-w-0 flex-1 text-xs font-bold"><b className="mr-2 text-primary-600">P{index + 1}</b>{companyFunctionNameById.get(id)}</span>
              <span className="flex gap-1">
                <button type="button" aria-label={`Move ${companyFunctionNameById.get(id)} up`} onClick={() => moveCompanyFunctionPriority(kind, id, "up")} disabled={index === 0} className="rounded-md p-1 focus-visible:ring-2 focus-visible:ring-obaol-500 disabled:opacity-30"><FiChevronUp /></button>
                <button type="button" aria-label={`Move ${companyFunctionNameById.get(id)} down`} onClick={() => moveCompanyFunctionPriority(kind, id, "down")} disabled={index === priorities.length - 1} className="rounded-md p-1 focus-visible:ring-2 focus-visible:ring-obaol-500 disabled:opacity-30"><FiChevronDown /></button>
              </span>
            </div>
          )})}</div> : <p className="mt-2 text-xs text-default-400">Select a capability above to create your priority order.</p>}
        </div>
      </section>
    );
  };

  const validatePassword = (password: string) => {
    return getMissingAssociatePasswordRequirements(password);
  };

  const passwordStrength = validatePassword(formData.password);

  const setField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  const setCompanyLocationField = (field: "companyState" | "companyDistrict" | "companyDivision" | "companyPincodeEntry", value: string) => {
    setFormData((prev) => {
      if (field === "companyState") {
        return {
          ...prev,
          companyState: value,
          companyDistrict: "",
          companyDivision: "",
          companyPincodeEntry: "",
        };
      }
      if (field === "companyDistrict") {
        return {
          ...prev,
          companyDistrict: value,
          companyDivision: "",
          companyPincodeEntry: "",
        };
      }
      if (field === "companyDivision") {
        return {
          ...prev,
          companyDivision: value,
          companyPincodeEntry: "",
        };
      }
      return {
        ...prev,
        companyPincodeEntry: value,
      };
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  const setCompanyGeoType = (value: "INDIAN" | "INTERNATIONAL") => {
    setFormData((prev) => ({
      ...prev,
      companyGeoType: value,
      companyCountry: value === "INTERNATIONAL" ? prev.companyCountry : "",
      companyLegalNumber: value === "INTERNATIONAL" ? prev.companyLegalNumber : "",
      companyLegalInformation: value === "INTERNATIONAL" ? prev.companyLegalInformation : "",
      companyState: value === "INDIAN" ? prev.companyState : "",
      companyDistrict: value === "INDIAN" ? prev.companyDistrict : "",
      companyDivision: value === "INDIAN" ? prev.companyDivision : "",
      companyPincodeEntry: value === "INDIAN" ? prev.companyPincodeEntry : "",
      companyGstin: value === "INDIAN" ? prev.companyGstin : "",
      companyIecCode: value === "INDIAN" ? prev.companyIecCode : "",
      companyCin: value === "INDIAN" ? prev.companyCin : "",
    }));
    setErrors((prev) => ({
      ...prev,
      companyCountry: "",
      companyLegalNumber: "",
      companyLegalInformation: "",
      companyState: "",
      companyDistrict: "",
      companyDivision: "",
      companyPincodeEntry: "",
      companyGstin: "",
      companyIecCode: "",
      companyCin: "",
    }));
  };

  const setAssociateLocationField = (field: "associateState" | "associateDistrict" | "associateDivision" | "associatePincodeEntry", value: string) => {
    setFormData((prev) => {
      if (field === "associateState") return { ...prev, associateState: value, associateDistrict: "", associateDivision: "", associatePincodeEntry: "" };
      if (field === "associateDistrict") return { ...prev, associateDistrict: value, associateDivision: "", associatePincodeEntry: "" };
      if (field === "associateDivision") return { ...prev, associateDivision: value, associatePincodeEntry: "" };
      return { ...prev, associatePincodeEntry: value };
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const setAssociateGeoType = (value: "INDIAN" | "INTERNATIONAL") => {
    setFormData((prev) => ({ ...prev, associateGeoType: value, associateCountry: value === "INTERNATIONAL" ? prev.associateCountry : "", associateState: value === "INDIAN" ? prev.associateState : "", associateDistrict: value === "INDIAN" ? prev.associateDistrict : "", associateDivision: value === "INDIAN" ? prev.associateDivision : "", associatePincodeEntry: value === "INDIAN" ? prev.associatePincodeEntry : "" }));
    setErrors((prev) => ({ ...prev, associateCountry: "", associateState: "", associateDistrict: "", associateDivision: "", associatePincodeEntry: "" }));
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Associates always represent a registered company. Individual participation uses the Operator flow.
  const isCompanyFlow = true;
  const isNewCompany = isCompanyFlow && formData.companyMode === "new";

  const stepTitle = useMemo(() => {
    if (currentStep === 1) return "Associate Profile";
    if (currentStep === 2) return "Company Setup";
    if (currentStep === 3) return "Select Company Capabilities";
    return "Verification & Submit";
  }, [currentStep]);

  const getStepErrors = (step: StepKey) => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) stepErrors.name = "Name is required";
      if (!formData.email.trim()) stepErrors.email = "Email is required";
      if (formData.email && !emailRegex.test(formData.email)) stepErrors.email = "Invalid email format";
      const primaryPhone = parsePhoneValue({ raw: formData.phone, countryCode: formData.phoneCountryCode, national: formData.phoneNational });
      if (!primaryPhone.e164) {
        stepErrors.phone = "Phone is required";
      } else if (isRepeatedDigitPhone(primaryPhone.national)) {
        stepErrors.phone = "Enter a valid phone number; repeated digits are not allowed.";
      }
      const hasSecondaryPhone = Boolean(formData.phoneSecondary || formData.phoneSecondaryNational);
      const secondaryPhone = parsePhoneValue({
          raw: formData.phoneSecondary,
          countryCode: formData.phoneSecondaryCountryCode,
          national: formData.phoneSecondaryNational,
          fallbackCountryCode: formData.phoneCountryCode,
        });
      if (hasSecondaryPhone && !secondaryPhone.e164) {
        stepErrors.phoneSecondary = "Enter a valid secondary phone number";
      } else if (hasSecondaryPhone && isRepeatedDigitPhone(secondaryPhone.national)) {
        stepErrors.phoneSecondary = "Enter a valid phone number; repeated digits are not allowed.";
      }
      if (requiresPassword) {
        if (passwordStrength.length > 0) stepErrors.password = `Missing: ${passwordStrength.join(", ")}`;
        if (!formData.confirmPassword.trim()) stepErrors.confirmPassword = "Please confirm password";
        else if (formData.password !== formData.confirmPassword) stepErrors.confirmPassword = "Passwords do not match";
      }
      if (!hasAcceptedLegalTerms) {
        stepErrors.legalConsent = "You must agree to the Terms & Conditions and Privacy Policy to continue.";
      }
    }

    if (step === 2) {
      if (isCompanyFlow && formData.companyMode === "existing" && !formData.associateCompanyId) {
        stepErrors.associateCompanyId = "Please select an existing company";
      }
      if (isNewCompany) {
        if (!formData.companyName.trim()) stepErrors.companyName = "Company name is required";
        if (!formData.companyEmail.trim()) stepErrors.companyEmail = "Company email is required";
        if (formData.companyEmail && !emailRegex.test(formData.companyEmail)) stepErrors.companyEmail = "Invalid company email";
        const companyPrimaryPhone = parsePhoneValue({ raw: formData.companyPhone, countryCode: formData.companyPhoneCountryCode, national: formData.companyPhoneNational });
        if (!companyPrimaryPhone.e164) {
          stepErrors.companyPhone = "Company phone is required";
        } else if (isRepeatedDigitPhone(companyPrimaryPhone.national)) {
          stepErrors.companyPhone = "Enter a valid phone number; repeated digits are not allowed.";
        }
        const hasCompanySecondaryPhone = Boolean(formData.companyPhoneSecondary || formData.companyPhoneSecondaryNational);
        const companySecondaryPhone = parsePhoneValue({
          raw: formData.companyPhoneSecondary,
          countryCode: formData.companyPhoneSecondaryCountryCode,
          national: formData.companyPhoneSecondaryNational,
          fallbackCountryCode: formData.companyPhoneCountryCode,
        });
        if (hasCompanySecondaryPhone && isRepeatedDigitPhone(companySecondaryPhone.national)) {
          stepErrors.companyPhoneSecondary = "Enter a valid phone number; repeated digits are not allowed.";
        }
        if (!formData.companyAddress.trim()) stepErrors.companyAddress = "Company address is required";
        if (formData.companyGeoType === "INTERNATIONAL") {
          if (!formData.companyCountry) stepErrors.companyCountry = "Country is required";
          if (!formData.companyLegalNumber.trim()) stepErrors.companyLegalNumber = "Legal number is required";
          if (!formData.companyLegalInformation.trim()) stepErrors.companyLegalInformation = "Legal information is required";
        } else {
          if (formData.companyGstin.trim()) {
            const normalizedGstin = formData.companyGstin.trim().toUpperCase();
            if (!GST_REGEX.test(normalizedGstin)) {
              stepErrors.companyGstin = "Enter a valid GST number";
            }
          }
          if (formData.companyIecCode.trim()) {
            const normalizedIecCode = formData.companyIecCode.trim().toUpperCase();
            if (!IEC_REGEX.test(normalizedIecCode)) {
              stepErrors.companyIecCode = "Enter a valid 10-character IEC code";
            }
          }
          if (formData.companyCin.trim()) {
            const normalizedCin = formData.companyCin.trim().toUpperCase();
            if (!CIN_REGEX.test(normalizedCin)) {
              stepErrors.companyCin = "Enter a valid 21-character CIN";
            }
          }
          if (!formData.companyState) stepErrors.companyState = "State is required";
          if (!formData.companyDistrict) stepErrors.companyDistrict = "District is required";
          if (filteredCompanyDivisions.length > 0 && !formData.companyDivision) {
            stepErrors.companyDivision = "Division is required";
          }
        }
      } else if (!isCompanyFlow) {
        if (!formData.associateAddress.trim()) stepErrors.associateAddress = "Address is required";
        if (formData.associateGeoType === "INTERNATIONAL") {
          if (!formData.associateCountry) stepErrors.associateCountry = "Country is required";
        } else {
          if (!formData.associateState) stepErrors.associateState = "State is required";
          if (!formData.associateDistrict) stepErrors.associateDistrict = "District is required";
          if (!formData.associateDivision) stepErrors.associateDivision = "Division is required";
        }
      }
    }

    if (step === 3) {
      if (isNewCompany) {
        if (formData.providedFunctionIds.length < 1) {
          stepErrors.providedFunctionIds = "Select at least 1 capability your company provides.";
        }
        if (formData.soughtFunctionIds.length < 1) {
          stepErrors.soughtFunctionIds = "Select at least 1 capability your company is seeking.";
        }
        if (formData.providedFunctionIds.length > 6 || formData.soughtFunctionIds.length > 6) {
          stepErrors.providedFunctionIds = "You can select up to 6 capabilities in each section.";
        }
      }
    }

    if (step === 4) {
      if (!formData.contactPreference) stepErrors.contactPreference = "Select how admin should contact you";
    }

    return stepErrors;
  };

  const validateStep = (step: StepKey) => {
    const stepErrors = getStepErrors(step);
    setErrors((prev) => ({ ...prev, general: "", ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const moveToInvalidStep = (step: StepKey) => {
    setCurrentStep(step);
    window.requestAnimationFrame(() => {
      formRef.current?.focus({ preventScroll: true });
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      showToastMessage({ type: "error", message: "Please complete all required fields in this step.", position: "top-right" });
      return;
    }
    setCompletedStep((prev) => Math.max(prev, currentStep));

    if (currentStep === 1 && !googleSignUp && !isOnboarding) {
      setIsLoading(true);
      try {
        const res = await getData("/auth/email-status", { email: formData.email.trim() });
        if (res.data?.exists) {
          setErrors((prev) => ({ ...prev, email: "Email already registered. Sign in instead." }));
          showToastMessage({ type: "warning", message: "Email already exists.", position: "top-right" });
          setIsLoading(false);
          return;
        }
      } catch (error: any) {
        // Silently continue or show non-blocking error
      } finally {
        setIsLoading(false);
      }
    }

    if (currentStep === 2 && isCompanyFlow && formData.companyMode === "existing") {
      setCurrentStep(4);
      return;
    }

    setCurrentStep((prev) => Math.min(4, prev + 1) as StepKey);
  };

  const handleBack = () => {
    if (currentStep === 4 && isCompanyFlow && formData.companyMode === "existing") {
      setCurrentStep(2);
      return;
    }
    setCurrentStep((prev) => Math.max(1, prev - 1) as StepKey);
  };

  const [isSubmittingSuccess, setIsSubmittingSuccess] = useState(false);

  const handleEmailVerify = async () => {
    const email = String(debouncedEmail || "").trim();
    if (isOnboarding) {
      setEmailCheckStatus("available");
      setEmailCheckMessage("Email linked to your account.");
      return;
    }
    if (!email) {
      setEmailCheckStatus("error");
      setEmailCheckMessage("Please enter an email first.");
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailCheckStatus("error");
      setEmailCheckMessage("Invalid email format.");
      return;
    }
    setIsCheckingEmail(true);
    setEmailCheckStatus("idle");
    setEmailCheckMessage("");
    try {
      const res = await getData("/auth/email-status", { email });
      if (res.data?.exists) {
        setEmailCheckStatus("exists");
        setEmailCheckMessage("This email is already registered — please sign in.");
      } else {
        setEmailCheckStatus("available");
        setEmailCheckMessage("Email available.");
      }
    } catch (error: any) {
      setEmailCheckStatus("error");
      setEmailCheckMessage(error?.response?.data?.message || "Unable to verify email.");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async () => {
    if (submitInFlightRef.current || isLoading || isSubmittingSuccess) return;

    const validationResults = ([1, 2, 3, 4] as StepKey[]).map((step) => ({
      step,
      errors: getStepErrors(step),
    }));
    const firstInvalid = validationResults.find(({ errors: stepErrors }) => Object.keys(stepErrors).length > 0);
    if (firstInvalid) {
      const allErrors = Object.assign({}, ...validationResults.map(({ errors: stepErrors }) => stepErrors));
      const message = `Please complete the highlighted fields in step ${firstInvalid.step}.`;
      setErrors({ ...allErrors, general: message });
      moveToInvalidStep(firstInvalid.step);
      showToastMessage({ type: "error", message, position: "top-right" });
      return;
    }
    if (!isOnboarding && googleSignUp && !googleIdToken) {
      showToastMessage({ type: "error", message: "Google sign-up token missing. Please retry Google sign-up.", position: "top-right" });
      return;
    }

    submitInFlightRef.current = true;
    setErrors((prev) => ({ ...prev, general: "" }));
    setIsLoading(true);
    try {
      const normalizedPhone = parsePhoneValue({
        raw: formData.phone,
        countryCode: formData.phoneCountryCode,
        national: formData.phoneNational,
      });
      const normalizedSecondaryPhone = parsePhoneValue({
        raw: formData.phoneSecondary,
        countryCode: formData.phoneSecondaryCountryCode || normalizedPhone.countryCode,
        national: formData.phoneSecondaryNational,
        fallbackCountryCode: normalizedPhone.countryCode,
      });
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: normalizedPhone.e164,
        phoneCountryCode: normalizedPhone.countryCode,
        phoneNational: normalizedPhone.national,
        phoneSecondary: normalizedSecondaryPhone.e164 || normalizedPhone.e164,
        phoneSecondaryCountryCode: normalizedSecondaryPhone.countryCode || normalizedPhone.countryCode,
        phoneSecondaryNational: normalizedSecondaryPhone.national || normalizedPhone.national,
        associateInterests: [],
        designation: "",
        password: requiresPassword ? formData.password : undefined,
        hasCompany: true,
        companyMode: formData.companyMode,
        associateCompanyId: formData.companyMode === "existing" ? formData.associateCompanyId : null,
        contactPreference: formData.contactPreference,
        contactNotes: formData.contactNotes.trim(),
        associateAddress: !isCompanyFlow ? formData.associateAddress.trim() : undefined,
        associateGeoType: !isCompanyFlow ? formData.associateGeoType : undefined,
        associateCountry: !isCompanyFlow && formData.associateGeoType === "INTERNATIONAL" ? formData.associateCountry : undefined,
        associateState: !isCompanyFlow && formData.associateGeoType === "INDIAN" ? formData.associateState : undefined,
        associateDistrict: !isCompanyFlow && formData.associateGeoType === "INDIAN" ? formData.associateDistrict : undefined,
        associateDivision: !isCompanyFlow && formData.associateGeoType === "INDIAN" ? formData.associateDivision : undefined,
        associatePincodeEntry: !isCompanyFlow && formData.associateGeoType === "INDIAN" ? (formData.associatePincodeEntry || undefined) : undefined,
        referralCode: formData.referralCode.trim() || undefined,
      };

      if (isNewCompany) {
        const normalizedCompanyPhone = parsePhoneValue({
          raw: formData.companyPhone,
          countryCode: formData.companyPhoneCountryCode,
          national: formData.companyPhoneNational,
        });
        const normalizedCompanySecondary = parsePhoneValue({
          raw: formData.companyPhoneSecondary,
          countryCode: formData.companyPhoneSecondaryCountryCode || normalizedCompanyPhone.countryCode,
          national: formData.companyPhoneSecondaryNational,
          fallbackCountryCode: normalizedCompanyPhone.countryCode,
        });
        payload.company = {
          name: formData.companyName.trim(),
          email: formData.companyEmail.trim(),
          gstin: formData.companyGeoType === "INDIAN" && formData.companyGstin.trim()
            ? formData.companyGstin.trim().toUpperCase()
            : undefined,
          iecCode: formData.companyGeoType === "INDIAN" && formData.companyIecCode.trim()
            ? formData.companyIecCode.trim().toUpperCase()
            : undefined,
          cin: formData.companyGeoType === "INDIAN" && formData.companyCin.trim()
            ? formData.companyCin.trim().toUpperCase()
            : undefined,
          legalRegistrationNumber: formData.companyGeoType === "INTERNATIONAL"
            ? formData.companyLegalNumber.trim()
            : undefined,
          legalComplianceInfo: formData.companyGeoType === "INTERNATIONAL"
            ? formData.companyLegalInformation.trim()
            : undefined,
          providedFunctionIds: Array.from(
            new Set((formData.providedFunctionIds || []).map((id) => String(id || "").trim()).filter(Boolean))
          ),
          soughtFunctionIds: Array.from(
            new Set((formData.soughtFunctionIds || []).map((id) => String(id || "").trim()).filter(Boolean))
          ),
          providedFunctionPriorities: Array.from(
            new Set((formData.providedFunctionPriorities || []).map((id) => String(id || "").trim()).filter(Boolean))
          ).slice(0, 3),
          soughtFunctionPriorities: Array.from(
            new Set((formData.soughtFunctionPriorities || []).map((id) => String(id || "").trim()).filter(Boolean))
          ).slice(0, 3),
          phone: normalizedCompanyPhone.e164,
          phoneCountryCode: normalizedCompanyPhone.countryCode,
          phoneNational: normalizedCompanyPhone.national,
          phoneSecondary: normalizedCompanySecondary.e164 || normalizedCompanyPhone.e164,
          phoneSecondaryCountryCode: normalizedCompanySecondary.countryCode || normalizedCompanyPhone.countryCode,
          phoneSecondaryNational: normalizedCompanySecondary.national || normalizedCompanyPhone.national,
          address: formData.companyAddress.trim(),
          geoType: formData.companyGeoType,
          country: formData.companyGeoType === "INTERNATIONAL" ? formData.companyCountry : null,
          state: formData.companyState,
          district: formData.companyDistrict,
          division: formData.companyDivision,
          pincodeEntry: formData.companyPincodeEntry || null,
        };
      }

      const response = isOnboarding
        ? await postData("/auth/onboarding", { role: "Associate", ...payload })
        : googleSignUp
          ? await postData("/auth/google", {
            idToken: googleIdToken,
            role: "Associate",
            intent: "register",
            registerPayload: payload,
          })
          : await postData("/auth/register", payload);

      if (response.data?.success) {
        setIsSubmittingSuccess(true);
        showToastMessage({
          type: "success",
          message: isOnboarding ? "Onboarding completed." : (response.data?.message || "Registration submitted for review."),
          position: "top-right",
        });
        play("success");
        if (isOnboarding) {
          if (typeof window !== "undefined") {
            try {
              window.localStorage.removeItem(DRAFT_KEY);
              window.dispatchEvent(
                new CustomEvent("onboardingDraftUpdated", {
                  detail: { role: "associate", completedStep: 0, currentStep: 1 },
                })
              );
            } catch {
              // ignore draft cleanup errors
            }
          }
          await refreshUser();
          router.replace("/dashboard/pending-approval");
        } else {
          setTimeout(() => {
            router.replace("/auth/register/success");
          }, 1500);
        }
      } else {
        const errorMessage = String(response.data?.message || "Submission was not accepted. Please review your details and try again.");
        submitInFlightRef.current = false;
        setIsLoading(false);
        setErrors((prev) => ({ ...prev, general: errorMessage }));
        showToastMessage({ type: "error", message: errorMessage, position: "top-right" });
        play("danger");
      }
    } catch (error: any) {
      submitInFlightRef.current = false;
      setIsLoading(false);
      const errorMessage = normalizeOnboardingError(error);
      setErrors((prev) => ({ ...prev, general: errorMessage }));
      showToastMessage({ type: "error", message: errorMessage, position: "top-right" });
      play("danger");
    }
  };

  return (
    <AuthLayout
      title={`${isOnboarding ? "Associate Onboarding" : "Associate Registration"} • Step ${currentStep}/4`}
      subtitle={stepTitle}
      cardMaxWidthClass={isOnboarding ? "max-w-full" : "max-w-[620px]"}
      embedded={isOnboarding}
      onboarding
      leftPanel={{
        headline: "Set up your company for",
        highlight: "BUILD A CLEARER COMPANY PROFILE",
        description: "This guided setup helps us verify your business, align it to the right trade capabilities, and prepare the dashboard around the way you actually operate.",
        guidanceSections: [
          {
            title: "Why this process matters",
            body: "Verified identity, contact, and company details reduce approval back-and-forth and help us keep trade access controlled."
          },
          {
            title: "What this helps us prepare",
            body: "Your company mode, location, and capability choices tell OBAOL which workflows, documents, and execution roles to unlock first."
          },
          {
            title: "After approval you can",
            body: "Enter the dashboard with a cleaner profile, role-aware navigation, and the right starting point for buying, selling, or trade services."
          }
        ],
        points: [
          "Company verification",
          "Capability alignment",
          "Faster review readiness",
          "Dashboard unlock"
        ],
        tags: [
          "Buyers",
          "Sellers",
          "Service Partners",
          "Exporters",
          "Warehouses",
          "Logistics"
        ],
        footer: "Progress saved automatically",
        knowMoreLink: "/roles/associate"
      }}
    >
      {optionsLoading ? (
        <div className="py-8 flex items-center justify-center">
          <Spinner color="warning" />
        </div>
      ) : (
        <form
          ref={formRef}
          tabIndex={-1}
          className="onboarding-form associate-onboarding-form w-full flex flex-col gap-5"
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const target = e.target as HTMLElement | null;
            const tag = String(target?.tagName || "").toLowerCase();
            if (tag === "textarea") return;
            // Prevent implicit Enter submit/reload on all non-textarea controls.
            e.preventDefault();
          }}
        >
          {!isOnboarding && (
            <>
              {googleClientId && !googleSignUp ? (
                <div className="w-full flex flex-col items-center">
                  <div id="google-register-associate" className="w-full" />
                  {!!googleRenderError && (
                    <div className="mt-3 flex flex-col items-center gap-2">
                      <p className="text-[10px] font-semibold text-danger-500 text-center">{googleRenderError}</p>
                      <Button
                        size="sm"
                        radius="lg"
                        variant="flat"
                        className="text-[10px] font-black uppercase tracking-widest"
                        onPress={handleGoogleReload}
                      >
                        Reload Google sign-in
                      </Button>
                    </div>
                  )}
                </div>
              ) : googleClientId && googleSignUp ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-success-500/10 border border-success-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-success-500 flex items-center justify-center text-white shadow-lg shadow-success-500/40">
                      <FiCheck size={20} className="stroke-[3]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-success-600 dark:text-success-400 uppercase tracking-[0.2em] leading-none mb-1">Identity Verified</span>
                      <p className="text-[12px] font-bold text-foreground opacity-70 leading-none">Google account connected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-500/20 border border-success-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                    <span className="text-[9px] font-black text-success-600 uppercase tracking-widest">Linked</span>
                  </div>
                </motion.div>
              ) : (
                <p className="text-xs text-obaol-500">Google sign-up is not configured.</p>
              )}
            </>
          )}
          <OnboardingProgress currentStep={currentStep} labels={["Profile", "Company", "Capabilities", "Review"]} />

          <div className="grid grid-cols-1 gap-4 items-start">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="register-step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <Input
                    type="text"
                    label="Full Name"
                    isRequired
                    labelPlacement="outside"
                    placeholder="John Doe"
                    variant="bordered"
                    value={formData.name}
                    onValueChange={(v) => setField("name", v)}
                    isReadOnly={googleSignUp}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                    startContent={<IoPerson className="text-default-400" />}
                    classNames={{ inputWrapper: "rounded-xl border-default-200 h-12" }}
                  />
                  <div className="flex flex-col gap-2">
                    <Input
                      type="email"
                      label="Email Address"
                      isRequired
                      labelPlacement="outside"
                      placeholder="name@company.com"
                      variant="bordered"
                      value={formData.email}
                      onValueChange={(v) => {
                        setField("email", v);
                        setEmailCheckStatus("idle");
                        setEmailCheckMessage("");
                      }}
                      isReadOnly={googleSignUp}
                      isInvalid={!!errors.email}
                      errorMessage={errors.email}
                      startContent={<IoMail className="text-default-400" />}
                      classNames={{ inputWrapper: "rounded-xl border-default-200 h-12" }}
                    />
                    {errors.email && (
                      <span className="text-xs font-semibold text-danger-500 pl-1">
                        {errors.email}
                      </span>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <div data-invalid={Boolean(errors.phone)} className={`associate-control-shell rounded-xl border p-0.5 overflow-hidden transition-all ${errors.phone ? "border-danger" : "border-default-200"}`}>
                      <PhoneField
                        name="phone"
                        label="Primary Phone Number"
                        isRequired
                        value={formData.phone}
                        countryCodeValue={formData.phoneCountryCode}
                        nationalValue={formData.phoneNational}
                        onChange={(next) => {
                          setField("phone", next.e164);
                          setField("phoneCountryCode", next.countryCode);
                          setField("phoneNational", next.national);
                        }}
                      />
                    </div>
                    {errors.phone ? <p className="text-danger text-[11px] mt-1 font-medium pl-2">{errors.phone}</p> : null}
                  </div>
                  <div className="md:col-span-2">
                    <div data-invalid={Boolean(errors.phoneSecondary)} className={`associate-control-shell rounded-xl border p-0.5 overflow-hidden transition-all ${errors.phoneSecondary ? "border-danger" : "border-default-200"}`}>
                      <PhoneField
                        name="phoneSecondary"
                        label="Secondary Phone (Optional)"
                        value={formData.phoneSecondary}
                        countryCodeValue={formData.phoneSecondaryCountryCode}
                        nationalValue={formData.phoneSecondaryNational}
                        onChange={(next) => {
                          setField("phoneSecondary", next.e164);
                          setField("phoneSecondaryCountryCode", next.countryCode);
                          setField("phoneSecondaryNational", next.national);
                        }}
                      />
                    </div>
                    {errors.phoneSecondary ? <p className="text-danger text-[11px] mt-1 font-medium pl-2">{errors.phoneSecondary}</p> : null}
                  </div>
                  {requiresPassword && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <Input
                          type={showPassword ? "text" : "password"}
                          label="Password"
                          isRequired
                          labelPlacement="outside"
                          placeholder="Create a secure password"
                          variant="bordered"
                          value={formData.password}
                          onValueChange={(v) => setField("password", v)}
                          isInvalid={!!errors.password}
                          errorMessage={errors.password}
                          startContent={<IoLockClosed className="text-default-400" />}
                          classNames={{ inputWrapper: "rounded-xl border-default-200 h-12" }}
                          endContent={
                            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((prev) => !prev)} className="focus:outline-none p-2">
                              {showPassword ? <IoEyeOff className="text-default-400" /> : <IoEye className="text-default-400" />}
                            </button>
                          }
                        />
                        <ul aria-label="Password requirements" className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                          {ASSOCIATE_PASSWORD_REQUIREMENTS.map((requirement) => {
                            const isMet = requirement.test(formData.password);
                            return (
                              <li key={requirement.key} className={`flex items-center gap-1.5 text-[11px] font-semibold ${isMet ? "text-success-600" : "text-default-500"}`}>
                                <FiCheck aria-hidden className={isMet ? "opacity-100" : "opacity-30"} />
                                {requirement.label}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        label="Confirm Password"
                        isRequired
                        labelPlacement="outside"
                        placeholder="Repeat your password"
                        variant="bordered"
                        value={formData.confirmPassword}
                        onValueChange={(v) => setField("confirmPassword", v)}
                        isInvalid={!!errors.confirmPassword}
                        errorMessage={errors.confirmPassword}
                        startContent={<IoLockClosed className="text-default-400" />}
                        classNames={{ inputWrapper: "rounded-xl border-default-200 h-12" }}
                        endContent={
                          <button type="button" aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"} onClick={() => setShowConfirmPassword((prev) => !prev)} className="focus:outline-none p-2">
                            {showConfirmPassword ? <IoEyeOff className="text-default-400" /> : <IoEye className="text-default-400" />}
                          </button>
                        }
                      />
                    </div>
                  )}

                  <div className="md:col-span-2 pt-2">
                    <ReferralCodeField value={formData.referralCode} onChange={(value) => setField("referralCode", value)} label="Operator referral code" />
                  </div>

                  <div className="md:col-span-2">
                    <div className={`rounded-xl border p-4 transition-colors ${errors.legalConsent ? "border-danger-500 bg-danger-500/5" : "border-default-200 bg-content1/40"}`}>
                      <Checkbox
                        isSelected={hasAcceptedLegalTerms}
                        isRequired
                        onValueChange={(isSelected) => {
                          setHasAcceptedLegalTerms(isSelected);
                          if (isSelected && errors.legalConsent) {
                            setErrors((prev) => ({ ...prev, legalConsent: "" }));
                          }
                        }}
                        isInvalid={Boolean(errors.legalConsent)}
                        aria-describedby={errors.legalConsent ? "associate-legal-consent-error" : undefined}
                        classNames={{ label: "text-sm leading-6 text-foreground/80" }}
                      >
                        I agree to the{" "}
                        <Link
                          href="/terms-and-conditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="font-semibold text-obaol-600 underline underline-offset-2"
                        >
                          Terms &amp; Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="font-semibold text-obaol-600 underline underline-offset-2"
                        >
                          Privacy Policy
                        </Link><span aria-hidden="true" className="ml-0.5 text-danger">*</span>
                      </Checkbox>
                      {errors.legalConsent ? (
                        <p id="associate-legal-consent-error" className="mt-2 pl-7 text-xs font-semibold text-danger-500">
                          {errors.legalConsent}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="register-step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-6"
                >
                  <div className="p-5 rounded-[2rem] bg-content2/40 border border-default-200">
                    <p className="text-xs font-black uppercase tracking-widest text-default-400">Company required</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/70">
                      Associate accounts represent registered businesses. Select a company already on OBAOL or register a new company below. Individuals should register as Operators.
                    </p>
                  </div>

                  {isCompanyFlow ? (
                    <>
                      <div className="p-5 rounded-[2rem] bg-obaol-500/5 border border-obaol-500/20">
                        <RadioGroup
                          label={<span className="text-xs font-black uppercase tracking-widest text-obaol-600">Record Status</span>}
                          orientation="horizontal"
                          value={formData.companyMode}
                          onValueChange={(v) => setField("companyMode", v)}
                          classNames={{ wrapper: "gap-6" }}
                        >
                          <Radio value="existing" classNames={{ label: "text-sm font-bold" }}>Existing on OBAOL</Radio>
                          <Radio value="new" classNames={{ label: "text-sm font-bold" }}>Register New Company</Radio>
                        </RadioGroup>
                      </div>

                      {formData.companyMode === "existing" && (
                        <div className="space-y-4">
                          <AutocompleteAny
                            label="Find Company"
                            isRequired
                            labelPlacement="outside"
                            variant="bordered"
                            items={companyOptions}
                            inputValue={companySearch}
                            onInputChange={(value: string) => {
                              setCompanySearch(value);
                              setIsCompanySearchOpen(value.trim().length >= 3);
                            }}
                            isOpen={isCompanySearchOpen && canShowCompanySearchResults}
                            onOpenChange={(open: boolean) => {
                              setIsCompanySearchOpen(open && normalizedCompanySearch.length >= 3);
                            }}
                            selectedKey={formData.associateCompanyId || null}
                            onSelectionChange={(key: any) => {
                              const id = String(key || "");
                              const match = companyOptions.find((item: any) => String(item?._id) === id);
                              setFormData((prev) => ({ ...prev, associateCompanyId: id, associateCompanyName: String(match?.name || "") }));
                              setIsCompanySearchOpen(false);
                              if (errors.associateCompanyId) setErrors((prev) => ({ ...prev, associateCompanyId: "" }));
                            }}
                            placeholder="Type at least 3 letters to search"
                            startContent={<IoSearch className="text-default-400" />}
                            isLoading={companySearchQuery.isFetching}
                            isInvalid={!!errors.associateCompanyId}
                            errorMessage={errors.associateCompanyId}
                            emptyContent={companySearchQuery.isError ? "Company search failed. Please retry." : "No companies found."}
                            description={companySearch.trim().length < 3 ? "Enter 3 or more characters; the full company directory is never shown." : companySearchQuery.isError ? "Company search failed. Please retry." : undefined}
                            classNames={{ base: "rounded-xl", inputWrapper: "h-12 border-default-200 data-[focus=true]:border-obaol-500 data-[focus=true]:ring-2 data-[focus=true]:ring-obaol-500/20" }}
                          >
                            {(item: any) => (
                              <AutocompleteItem key={item._id} textValue={item.name}>
                                {item.name}
                              </AutocompleteItem>
                            )}
                          </AutocompleteAny>
                        </div>
                      )}

                      {isNewCompany && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Legal Company Name"
                            isRequired
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Enter legal name"
                            value={formData.companyName}
                            onValueChange={(v) => setField("companyName", v)}
                            isInvalid={!!errors.companyName}
                            errorMessage={errors.companyName}
                            startContent={<IoBusiness className="text-default-400" />}
                            classNames={{ inputWrapper: "h-12 border-default-200 group-data-[focus=true]:border-obaol-500 group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-obaol-500/20" }}
                          />
                          <Input
                            label="Corporate Email"
                            isRequired
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="corp@company.com"
                            value={formData.companyEmail}
                            onValueChange={(v) => setField("companyEmail", v)}
                            isInvalid={!!errors.companyEmail}
                            errorMessage={errors.companyEmail}
                            startContent={<IoMail className="text-default-400" />}
                            classNames={{ inputWrapper: "h-12 border-default-200" }}
                          />
                          <div className="md:col-span-2">
                            <div data-invalid={Boolean(errors.companyPhone)} className={`associate-control-shell rounded-xl border p-0.5 overflow-hidden transition-all ${errors.companyPhone ? "border-danger" : "border-default-200"}`}>
                              <PhoneField
                                name="companyPhone"
                                label="Company Contact"
                                isRequired
                                value={formData.companyPhone}
                                countryCodeValue={formData.companyPhoneCountryCode}
                                nationalValue={formData.companyPhoneNational}
                                onChange={(next) => {
                                  setField("companyPhone", next.e164);
                                  setField("companyPhoneCountryCode", next.countryCode);
                                  setField("companyPhoneNational", next.national);
                                }}
                              />
                            </div>
                            {errors.companyPhone ? <p className="text-danger text-[11px] mt-1 font-medium pl-2">{errors.companyPhone}</p> : null}
                          </div>
                          <div className="p-4 rounded-2xl bg-content2/30 border border-default-200 md:col-span-2">
                            <RadioGroup
                              label={<span className="text-[10px] font-black uppercase tracking-widest text-default-400">Jurisdiction</span>}
                              orientation="horizontal"
                              value={formData.companyGeoType}
                              onValueChange={(v) => setCompanyGeoType(v as "INDIAN" | "INTERNATIONAL")}
                              classNames={{ wrapper: "gap-8" }}
                            >
                              <Radio value="INDIAN" classNames={{ label: "text-sm font-bold" }}>Indian Hub</Radio>
                              <Radio value="INTERNATIONAL" classNames={{ label: "text-sm font-bold" }}>International</Radio>
                            </RadioGroup>
                          </div>

                          <Textarea
                            label="Registered Office Address"
                            isRequired
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Complete physical address"
                            value={formData.companyAddress}
                            onValueChange={(v) => setField("companyAddress", v)}
                            isInvalid={!!errors.companyAddress}
                            errorMessage={errors.companyAddress}
                            className="md:col-span-2"
                            classNames={{ inputWrapper: "border-default-200" }}
                          />

                          {formData.companyGeoType === "INTERNATIONAL" ? (
                            <>
                              <AutocompleteAny
                                label="Country"
                                isRequired
                                labelPlacement="outside"
                                variant="bordered"
                                defaultItems={countries}
                                selectedKey={formData.companyCountry || null}
                                onSelectionChange={(key: any) => setField("companyCountry", String(key || ""))}
                                isInvalid={!!errors.companyCountry}
                                errorMessage={errors.companyCountry}
                                placeholder="Search country..."
                                startContent={<IoEarth className="text-default-400" />}
                                classNames={{ inputWrapper: "h-12 border-default-200 data-[focus=true]:border-obaol-500" }}
                              >
                                {(item: any) => <AutocompleteItem key={item._id} textValue={item.name}>{item.name}</AutocompleteItem>}
                              </AutocompleteAny>
                              <Input
                                label="Tax/Legal ID"
                                isRequired
                                labelPlacement="outside"
                                variant="bordered"
                                value={formData.companyLegalNumber}
                                onValueChange={(v) => setField("companyLegalNumber", v)}
                                isInvalid={!!errors.companyLegalNumber}
                                errorMessage={errors.companyLegalNumber}
                                classNames={{ inputWrapper: "h-12 border-default-200" }}
                              />
                              <Textarea
                                label="Legal Information"
                                isRequired
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Provide registration or legal entity details"
                                value={formData.companyLegalInformation}
                                onValueChange={(v) => setField("companyLegalInformation", v)}
                                isInvalid={!!errors.companyLegalInformation}
                                errorMessage={errors.companyLegalInformation}
                                className="md:col-span-2"
                                classNames={{ inputWrapper: "border-default-200" }}
                              />
                            </>
                          ) : (
                            <>
                              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-default-200 bg-content2/20 p-4">
                                <div className="md:col-span-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-default-500">Company Verification</p>
                                  <p className="mt-1 text-xs text-default-500">These details will be used to verify your company.</p>
                                </div>
                                <Input
                                  label="GSTIN Number (Optional)"
                                  labelPlacement="outside"
                                  variant="bordered"
                                  placeholder="15-character GSTIN"
                                  value={formData.companyGstin}
                                  onValueChange={(v) => setField("companyGstin", v.toUpperCase())}
                                  maxLength={15}
                                  isInvalid={!!errors.companyGstin}
                                  errorMessage={errors.companyGstin}
                                  classNames={{ inputWrapper: "h-12 border-default-200" }}
                                />
                                <Input
                                  label="IEC Code (Optional)"
                                  labelPlacement="outside"
                                  variant="bordered"
                                  placeholder="10-character IEC"
                                  value={formData.companyIecCode}
                                  onValueChange={(v) => setField("companyIecCode", v.toUpperCase())}
                                  maxLength={10}
                                  isInvalid={!!errors.companyIecCode}
                                  errorMessage={errors.companyIecCode}
                                  classNames={{ inputWrapper: "h-12 border-default-200" }}
                                />
                                <Input
                                  label="CIN (Optional)"
                                  labelPlacement="outside"
                                  variant="bordered"
                                  placeholder="21-character CIN"
                                  value={formData.companyCin}
                                  onValueChange={(v) => setField("companyCin", v.toUpperCase())}
                                  maxLength={21}
                                  isInvalid={!!errors.companyCin}
                                  errorMessage={errors.companyCin}
                                  className="md:col-span-2"
                                  classNames={{ inputWrapper: "h-12 border-default-200" }}
                                />
                              </div>
                              <AutocompleteAny
                                label="State"
                                isRequired
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Search state..."
                                defaultItems={states}
                                selectedKey={formData.companyState || null}
                                onSelectionChange={(key: any) => setCompanyLocationField("companyState", String(key || ""))}
                                startContent={<IoSearch className="text-default-400" />}
                                isInvalid={!!errors.companyState}
                                errorMessage={errors.companyState}
                                classNames={{ inputWrapper: "h-12 border-default-200 data-[focus=true]:border-obaol-500" }}
                              >
                                {states.map((item: any) => (
                                  <AutocompleteItem key={item._id} textValue={item.name}>{item.name}</AutocompleteItem>
                                ))}
                              </AutocompleteAny>
                              <AutocompleteAny
                                label="District"
                                isRequired
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Search district..."
                                defaultItems={filteredCompanyDistricts}
                                selectedKey={formData.companyDistrict || null}
                                onSelectionChange={(key: any) => setCompanyLocationField("companyDistrict", String(key || ""))}
                                startContent={<IoSearch className="text-default-400" />}
                                isInvalid={!!errors.companyDistrict}
                                errorMessage={errors.companyDistrict}
                                isDisabled={!formData.companyState}
                                classNames={{ inputWrapper: "h-12 border-default-200 data-[focus=true]:border-obaol-500" }}
                              >
                                {filteredCompanyDistricts.map((item: any) => (
                                  <AutocompleteItem key={item._id} textValue={item.name}>{item.name}</AutocompleteItem>
                                ))}
                              </AutocompleteAny>
                              <AutocompleteAny
                                label="Division"
                                isRequired={filteredCompanyDivisions.length > 0}
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Search division..."
                                defaultItems={filteredCompanyDivisions}
                                selectedKey={formData.companyDivision || null}
                                onSelectionChange={(key: any) => setCompanyLocationField("companyDivision", String(key || ""))}
                                startContent={<IoSearch className="text-default-400" />}
                                isInvalid={!!errors.companyDivision}
                                errorMessage={errors.companyDivision}
                                isDisabled={!formData.companyDistrict}
                                classNames={{ inputWrapper: "h-12 border-default-200 data-[focus=true]:border-obaol-500" }}
                              >
                                {filteredCompanyDivisions.map((item: any) => (
                                  <AutocompleteItem key={item._id} textValue={item.name}>{item.name}</AutocompleteItem>
                                ))}
                              </AutocompleteAny>
                              <AutocompleteAny
                                label="Pincode (Optional)"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Search pincode..."
                                defaultItems={filteredPincodes}
                                selectedKey={formData.companyPincodeEntry || null}
                                onSelectionChange={(key: any) => setCompanyLocationField("companyPincodeEntry", String(key || ""))}
                                isDisabled={!formData.companyDivision}
                                isLoading={isPincodesLoading}
                                startContent={<IoLocation className="text-default-400" />}
                                classNames={{ inputWrapper: "h-12 border-default-200 data-[focus=true]:border-obaol-500" }}
                              >
                                {(item: any) => <AutocompleteItem key={item._id} textValue={String(item.pincode || item.name || item.code || "")}>{item.pincode || item.name || item.code}</AutocompleteItem>}
                              </AutocompleteAny>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-content2/30 border border-default-200 md:col-span-2">
                        <RadioGroup
                          label={<span className="text-[10px] font-black uppercase tracking-widest text-default-400">Geography</span>}
                          orientation="horizontal"
                          value={formData.associateGeoType}
                          onValueChange={(v) => setAssociateGeoType(v as "INDIAN" | "INTERNATIONAL")}
                          classNames={{ wrapper: "gap-8" }}
                        >
                          <Radio value="INDIAN" classNames={{ label: "text-sm font-bold" }}>India</Radio>
                          <Radio value="INTERNATIONAL" classNames={{ label: "text-sm font-bold" }}>International</Radio>
                        </RadioGroup>
                      </div>
                      <Textarea
                        label="Home Address"
                        isRequired
                        labelPlacement="outside"
                        variant="bordered"
                        placeholder="Residential or office address"
                        value={formData.associateAddress}
                        onValueChange={(v) => setField("associateAddress", v)}
                        isInvalid={!!errors.associateAddress}
                        errorMessage={errors.associateAddress}
                        className="md:col-span-2"
                        classNames={{ inputWrapper: "border-default-200" }}
                      />
                      {formData.associateGeoType === "INDIAN" ? (
                        <>
                          <Select
                            label="State"
                            isRequired
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Select"
                            selectedKeys={formData.associateState ? [formData.associateState] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys as Set<string>)[0] || "";
                              setAssociateLocationField("associateState", selected);
                            }}
                            isInvalid={!!errors.associateState}
                            errorMessage={errors.associateState}
                            classNames={{ trigger: "h-12 border-default-200" }}
                          >
                            {states.map((item: any) => (
                              <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                            ))}
                          </Select>
                          <Select
                            label="District"
                            isRequired
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Select"
                            selectedKeys={formData.associateDistrict ? [formData.associateDistrict] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys as Set<string>)[0] || "";
                              setAssociateLocationField("associateDistrict", selected);
                            }}
                            isInvalid={!!errors.associateDistrict}
                            errorMessage={errors.associateDistrict}
                            isDisabled={!formData.associateState}
                            classNames={{ trigger: "h-12 border-default-200" }}
                          >
                            {filteredAssociateDistricts.map((item: any) => (
                              <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                            ))}
                          </Select>
                          <Select
                            label="Division"
                            isRequired
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Select"
                            selectedKeys={formData.associateDivision ? [formData.associateDivision] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys as Set<string>)[0] || "";
                              setAssociateLocationField("associateDivision", selected);
                            }}
                            isInvalid={!!errors.associateDivision}
                            errorMessage={errors.associateDivision}
                            isDisabled={!formData.associateDistrict}
                            classNames={{ trigger: "h-12 border-default-200" }}
                          >
                            {filteredAssociateDivisions.map((item: any) => (
                              <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                            ))}
                          </Select>
                        </>
                      ) : (
                        <>
                          <Select
                            label="Country"
                            isRequired
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Select"
                            selectedKeys={formData.associateCountry ? [formData.associateCountry] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys as Set<string>)[0] || "";
                              setField("associateCountry", selected);
                            }}
                            isInvalid={!!errors.associateCountry}
                            errorMessage={errors.associateCountry}
                            classNames={{ trigger: "h-12 border-default-200" }}
                          >
                            {countries.map((item: any) => (
                              <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                            ))}
                          </Select>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="register-step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-6"
                >
                  <div className="onboarding-intro-card">
                    <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                      Select 1 to 6 main categories
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-default-500">
                      Your choices customize the platform you see after onboarding. Pick up to 3 priorities.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-primary-500/20 bg-primary-500/5 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary-600">Build a clearer company profile</p>
                    <p className="mt-2 text-xs leading-5 text-default-600">
                      Tell partners what your company provides and what it is seeking. We use these choices to improve discovery, matching, and dashboard personalization.
                    </p>
                    <ul className="mt-3 grid grid-cols-1 gap-3 text-xs font-semibold text-default-500 md:grid-cols-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
                        <span><b>Provides</b> means the activities, products, or services your company offers.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
                        <span><b>Seeking</b> means what your company wants to buy, use, or partner on.</span>
                      </li>
                    </ul>
                    <p className="mt-3 text-xs leading-5 text-default-500">
                      If you are an agri-tech company, choose the real work you perform instead of a broad “Agri-tech” label. You can update these choices later in Settings → <Link href="/dashboard/company" className="font-bold text-primary-600 underline underline-offset-2">My Company</Link>.
                    </p>
                  </div>


                  {isNewCompany ? (
                    <div className="space-y-4">
                      {groupedCompanyFunctions.length === 0 && (
                        <div className="py-12 text-center bg-content2/20 rounded-[2rem] border-2 border-dashed border-default-200">
                          <p className="text-sm text-default-300 font-bold">No capabilities available yet</p>
                          <p className="text-xs text-default-400 mt-2">
                            Reload the page or try again to load company capabilities.
                          </p>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold bg-obaol-500/10 text-obaol-600 hover:bg-obaol-500/20 transition"
                          >
                            Back to Company Step
                          </button>
                        </div>
                      )}
                      {groupedCompanyFunctions.length > 0 && renderCapabilitySection("provided")}
                    </div>
                  ) : (
                    <div className="rounded-[2rem] border-2 border-dashed border-default-200 bg-content2/20 p-6">
                      <p className="text-sm text-default-300 font-bold text-center">Capabilities linked to your company profile</p>
                      {existingCompanyCapabilityLabels.length ? (
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                          {existingCompanyCapabilityLabels.map((label, idx) => (
                            <span
                              key={`${label}-${idx}`}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-obaol-500/10 text-obaol-600 border border-obaol-500/20"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 text-center">
                          <p className="text-xs text-default-400">
                            No capabilities are configured for this company yet.
                          </p>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold bg-obaol-500/10 text-obaol-600 hover:bg-obaol-500/20 transition"
                          >
                            Back to Company Step
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {isNewCompany && renderCapabilitySection("sought")}
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="register-step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-6"
                >
                  <div className="p-5 rounded-[2.5rem] bg-success-500/5 border border-success-500/10">
                    <RadioGroup
                      label={<span className="text-[10px] font-black uppercase tracking-widest text-success-500">Contact Preference</span>}
                      orientation="horizontal"
                      value={formData.contactPreference}
                      onValueChange={(v) => setField("contactPreference", v)}
                      classNames={{ wrapper: "gap-8" }}
                    >
                      <Radio value="phone" classNames={{ label: "text-sm font-bold" }}>Phone</Radio>
                      <Radio value="email" classNames={{ label: "text-sm font-bold" }}>Email</Radio>
                    </RadioGroup>
                  </div>

                  <Textarea
                    label="Verification Notes"
                    labelPlacement="outside"
                    variant="bordered"
                    placeholder="Provide any additional context for our verification team..."
                    value={formData.contactNotes}
                    onValueChange={(v) => setField("contactNotes", v)}
                    classNames={{ inputWrapper: "border-default-200" }}
                  />
                  <div className="p-6 rounded-[2.5rem] bg-obaol-500/5 border border-obaol-500/20 text-sm text-obaol-600 leading-relaxed font-bold text-center italic shadow-inner">
                    &quot;Authorized access only. Your details will be reviewed within 24-48 hours. A verification call may be initiated to finalize onboarding.&quot;
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>


          {errors.general && (
            <div role="alert" aria-live="assertive" className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger text-sm text-center">
              {errors.general}
            </div>
          )}

          <div data-onboarding-actions className="mobile-sticky-actions flex flex-col-reverse sm:flex-row gap-3 pt-3 sm:pt-8">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-1/3">
              <Button
                type="button"
                variant="flat"
                className="w-full h-12 rounded-xl font-bold bg-default-100/50 hover:bg-default-200/80 transition-all border border-default-200"
                isDisabled={currentStep === 1 || isLoading || isSubmittingSuccess}
                onPress={handleBack}
                startContent={<FiChevronLeft />}
              >
                Back
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                color="warning"
                className={`w-full h-12 rounded-xl font-black shadow-none transition-all duration-500
                  ${isSubmittingSuccess
                    ? "bg-gradient-to-r from-success-500 to-green-600"
                    : "bg-gradient-to-r from-obaol-500 to-amber-600 hover:shadow-none"
                  }`}
                onPress={() => (currentStep === 4 ? handleSubmit() : handleNext())}
                isLoading={isLoading || isSubmittingSuccess}
                endContent={isSubmittingSuccess ? <FiCheck /> : currentStep === 4 ? <FiCheck /> : <FiChevronRight />}
              >
                {isSubmittingSuccess
                  ? "Submission Received"
                  : currentStep === 4
                    ? (isLoading ? "Verifying Details..." : "Submit for Approval")
                    : "Continue Onboarding"}
              </Button>
            </motion.div>
          </div>

          {!isOnboarding && (
            <div className="text-center mt-2 text-sm text-default-500">
              Already registered?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/login?role=Associate")}
                className="text-warning hover:text-obaol-400 font-semibold transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </form>
      )
      }

      {
        (optionsError || partialOptionsError) && (
          <div className="mt-4 rounded-xl border border-danger-200 bg-danger-50/40 dark:bg-danger-900/15 p-3 text-xs text-danger-700 dark:text-danger-300 flex items-center justify-between gap-3">
            <span>{partialOptionsError || "Could not load registration options. Please retry."}</span>
            <Button size="sm" color="danger" variant="flat" onPress={() => refetchOptions()}>
              Retry
            </Button>
          </div>
        )
      }

    </AuthLayout >
  );
}
