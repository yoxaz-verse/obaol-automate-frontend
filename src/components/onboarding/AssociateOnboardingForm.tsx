"use client";

import React, { useMemo, useState, useContext, useEffect, useRef } from "react";
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
import { IoEye, IoEyeOff, IoLockClosed, IoMail, IoPerson } from "react-icons/io5";
import { FiCheck, FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { showToastMessage } from "@/utils/utils";
import AuthLayout from "@/components/Auth/AuthLayout";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import PhoneField from "@/components/form/PhoneField";
import { parsePhoneValue } from "@/utils/phone";
import { useSoundEffect } from "@/context/SoundContext";
import AuthContext from "@/context/AuthContext";

type StepKey = 1 | 2 | 3 | 4;
const EMPTY_LIST: any[] = [];
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const MAIN_CATEGORY_SLUGS = new Set([
  "sourcing",
  "packaging",
  "testing",
  "warehouse-storage",
  "finance-risk",
  "importing-distribution",
  "freight-forwarding",
  "inland-logistics",
]);
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
  const searchParams = useSearchParams();
  const AutocompleteAny = Autocomplete as any;
  const { user, refreshUser } = useContext(AuthContext);
  const isOnboarding = mode === "onboarding";
  const [currentStep, setCurrentStep] = useState<StepKey>(1);
  const [completedStep, setCompletedStep] = useState<number>(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [googleSignUp, setGoogleSignUp] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const authMethod = String(searchParams?.get("auth") || "").toLowerCase();
  const isGoogleOnboarding = isOnboarding && authMethod === "google";
  const requiresPassword = isOnboarding ? !isGoogleOnboarding : !googleSignUp;
  const [emailCheckStatus, setEmailCheckStatus] = useState<"idle" | "available" | "exists" | "error">("idle");
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const [optionsDebug, setOptionsDebug] = useState<{
    resolvedEndpoint: string;
    counts: { designations: number; existingCompanies: number; companyTypes: number; countries: number };
    lastError: string;
  }>({
    resolvedEndpoint: "",
    counts: { designations: 0, existingCompanies: 0, companyTypes: 0, countries: 0 },
    lastError: "",
  });

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
    companyLegalNumber: "",
    companyLegalInformation: "",
    companyGeoType: "INDIAN",
    companyCountry: "",
    companyType: "",
    companyState: "",
    companyDistrict: "",
    companyDivision: "",
    companyPincodeEntry: "",
    companyFunctionIds: [] as string[],
    companyFunctionPriorities: [] as string[],
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

  const draftLoadedRef = useRef(false);
  const DRAFT_KEY = `onboarding_draft_associate_${user?.id || "anonymous"}`;

  useEffect(() => {
    if (!isOnboarding) return;
    if (typeof window === "undefined") return;
    if (!user?.id) return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) {
        draftLoadedRef.current = true;
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed?.formData) setFormData((prev) => ({ ...prev, ...parsed.formData }));
      if (parsed?.currentStep) setCurrentStep(parsed.currentStep);
      if (parsed?.completedStep) setCompletedStep(parsed.completedStep);
    } catch {
      // ignore draft load errors
    } finally {
      draftLoadedRef.current = true;
    }
  }, [isOnboarding, user?.id]);

  useEffect(() => {
    if (!isOnboarding) return;
    if (!draftLoadedRef.current) return;
    if (typeof window === "undefined") return;
    if (!user?.id) return;
    const timer = setTimeout(() => {
      const payload = {
        formData,
        currentStep,
        completedStep,
        updatedAt: Date.now(),
      };
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
        window.dispatchEvent(
          new CustomEvent("onboardingDraftUpdated", {
            detail: { role: "associate", completedStep, currentStep },
          })
        );
      } catch {
        // ignore draft save errors
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData, currentStep, completedStep, isOnboarding, user?.id]);

  React.useEffect(() => {
    if (!isOnboarding || !user) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }));
  }, [isOnboarding, user]);

  React.useEffect(() => {
    if (isOnboarding) return;
    const prefill = String(searchParams?.get("prefill") || "").trim();
    if (!prefill) return;
    setFormData((prev) => (prev.email ? prev : { ...prev, email: prefill }));
  }, [isOnboarding, searchParams]);

  const { data: registerOptions, isLoading: optionsLoading, isError: optionsError, refetch: refetchOptions } = useQuery({
    queryKey: ["register-options"],
    queryFn: async () => {
      const envBaseRaw = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const envBase = String(envBaseRaw).trim().replace(/\/+$/, "");
      const normalizedEnvRoot = envBase
        .replace(/\/auth$/i, "")
        .replace(/\/login$/i, "")
        .replace(/\/auth\/.*$/i, "")
        .replace(/\/login\/.*$/i, "");

      const baseCandidates = Array.from(new Set([
        normalizedEnvRoot,
        envBase,
        "/api/v1/web",
        "http://localhost:5001/api/v1/web",
        "http://localhost:5000/api/v1/web",
      ].filter(Boolean)));

      let lastError: any = null;
      let fallbackOutput: any = {
        existingCompanies: [],
        companyTypes: [],
        states: [],
        districts: [],
        divisions: [],
        pincodeEntries: [],
        countries: [],
        companyFunctions: [],
        companySubFunctions: [],
      };

      const apiRoot = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1/web";
      const normalizedApiRoot = String(apiRoot).trim().replace(/\/+$/, "");
      for (const base of baseCandidates) {
        try {
          const routeRoots = Array.from(new Set([
            `${base}/auth`,
            `${base}/login`,
          ]));

          for (const routeRoot of routeRoots) {
            try {
              const res = await axios.get(`${routeRoot}/register/options`, {
                timeout: 8000,
                withCredentials: false,
              });
              const payload = res.data?.data || res.data?.data?.data || {};
              const output: any = {
                existingCompanies: Array.isArray(payload?.existingCompanies) ? payload.existingCompanies : [],
                companyTypes: Array.isArray(payload?.companyTypes) ? payload.companyTypes : [],
                states: Array.isArray(payload?.states) ? payload.states : [],
                districts: Array.isArray(payload?.districts) ? payload.districts : [],
                divisions: Array.isArray(payload?.divisions) ? payload.divisions : [],
                pincodeEntries: Array.isArray(payload?.pincodeEntries) ? payload.pincodeEntries : [],
                countries: Array.isArray(payload?.countries) ? payload.countries : [],
                companyFunctions: Array.isArray(payload?.companyFunctions) ? payload.companyFunctions : [],
                companySubFunctions: Array.isArray(payload?.companySubFunctions) ? payload.companySubFunctions : [],
              };

              if (!output.existingCompanies.length || !output.countries.length) {
                const [companiesRes, countriesRes] = await Promise.allSettled([
                  axios.get(`${routeRoot}/register/companies`, { timeout: 8000, withCredentials: false }),
                  axios.get(`${routeRoot}/register/countries`, { timeout: 8000, withCredentials: false }),
                ]);

                if (companiesRes.status === "fulfilled") {
                  const companiesPayload = companiesRes.value?.data?.data || companiesRes.value?.data?.data?.data || [];
                  if (Array.isArray(companiesPayload)) {
                    output.existingCompanies = companiesPayload;
                  }
                }

                if (countriesRes.status === "fulfilled") {
                  const countriesPayload = countriesRes.value?.data?.data || countriesRes.value?.data?.data?.data || [];
                  if (Array.isArray(countriesPayload)) {
                    output.countries = countriesPayload;
                  }
                }
              }

              fallbackOutput = output;
              setOptionsDebug({
                resolvedEndpoint: `${routeRoot}/register/options`,
                counts: {
                  designations: 0,
                  existingCompanies: output.existingCompanies.length,
                  companyTypes: output.companyTypes.length,
                  countries: output.countries.length,
                },
                lastError: "",
              });
              if (output.existingCompanies.length || output.companyTypes.length) {
                return output;
              }
            } catch (nestedErr) {
              lastError = nestedErr;
            }
          }
        } catch (err) {
          lastError = err;
        }
      }
      if (fallbackOutput) {
        setOptionsDebug((prev) => ({
          ...prev,
          counts: {
            designations: 0,
            existingCompanies: Array.isArray(fallbackOutput.existingCompanies) ? fallbackOutput.existingCompanies.length : 0,
            companyTypes: Array.isArray(fallbackOutput.companyTypes) ? fallbackOutput.companyTypes.length : 0,
            countries: Array.isArray(fallbackOutput.countries) ? fallbackOutput.countries.length : 0,
          },
          lastError: lastError?.message || "No options endpoint returned data.",
        }));
        return fallbackOutput;
      }
      throw lastError || new Error("Unable to load registration options");
    },
    retry: 1,
  });

  React.useEffect(() => {
    if (isOnboarding) return;
    if (!googleClientId || typeof window === "undefined") return;
    if (document.getElementById("google-gsi-script")) {
      setGoogleReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [googleClientId]);

  React.useEffect(() => {
    if (isOnboarding) return;
    if (!googleReady) return;
    if (!(window as any)?.google?.accounts?.id) return;
    const container = document.getElementById("google-register-associate");
    if (!container) return;
    const buttonWidth = Math.min(360, Math.max(240, container.clientWidth || 320));
    (window as any).google.accounts.id.initialize({
      client_id: googleClientId,
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
    (window as any).google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      width: buttonWidth,
      text: "continue_with",
      shape: "pill",
    });
  }, [googleReady, googleClientId]);

  const companyTypes = Array.isArray(registerOptions?.companyTypes) ? registerOptions.companyTypes : EMPTY_LIST;
  const existingCompanies = Array.isArray(registerOptions?.existingCompanies) ? registerOptions.existingCompanies : EMPTY_LIST;
  const states = Array.isArray(registerOptions?.states) ? registerOptions.states : EMPTY_LIST;
  const districts = Array.isArray(registerOptions?.districts) ? registerOptions.districts : EMPTY_LIST;
  const divisions = Array.isArray(registerOptions?.divisions) ? registerOptions.divisions : EMPTY_LIST;
  const pincodeEntries = Array.isArray(registerOptions?.pincodeEntries) ? registerOptions.pincodeEntries : EMPTY_LIST;
  const countries = Array.isArray(registerOptions?.countries) ? registerOptions.countries : EMPTY_LIST;
  const { play } = useSoundEffect();
  const companyFunctions = Array.isArray(registerOptions?.companyFunctions) ? registerOptions.companyFunctions : EMPTY_LIST;
  const companySubFunctions = Array.isArray(registerOptions?.companySubFunctions) ? registerOptions.companySubFunctions : EMPTY_LIST;

  const [dynamicPincodes, setDynamicPincodes] = useState<any[]>([]);
  const [isPincodesLoading, setIsPincodesLoading] = useState(false);

  const fetchPincodes = async (divisionId: string) => {
    if (!divisionId) {
      setDynamicPincodes([]);
      return;
    }
    setIsPincodesLoading(true);
    try {
      const apiRoot = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1/web";
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
  }, [formData.associateDivision]);
  const selectedCompanyLabel =
    existingCompanies.find((item: any) => String(item?._id) === String(formData.associateCompanyId))?.name || "Not selected";
  const selectedCompanyTypeLabel =
    companyTypes.find((item: any) => String(item?._id) === String(formData.companyType))?.name || "Not selected";
  const selectedExistingCompany = existingCompanies.find(
    (item: any) => String(item?._id) === String(formData.associateCompanyId)
  );
  const selectedExistingCompanyInterests = Array.isArray(selectedExistingCompany?.serviceCapabilities)
    ? selectedExistingCompany.serviceCapabilities
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

  const normalizeName = (value: any) => String(value || "").trim().toLowerCase();
  const getDistrictStateId = (item: any) =>
    String(
      item?.state ||
        item?.stateId ||
        item?.state_id ||
        item?.state?._id ||
        item?.state?.id ||
        ""
    );
  const getDistrictStateName = (item: any) =>
    normalizeName(item?.stateName || item?.state_name || item?.state?.name || "");
  const getDivisionDistrictId = (item: any) =>
    String(
      item?.district ||
        item?.districtId ||
        item?.district_id ||
        item?.district?._id ||
        item?.district?.id ||
        ""
    );
  const getDivisionDistrictName = (item: any) =>
    normalizeName(item?.districtName || item?.district_name || item?.district?.name || "");

  const filteredCompanyDistricts = useMemo(() => {
    const stateId = String(formData.companyState || "");
    const stateName = normalizeName(selectedCompanyStateName);
    return districts.filter((item: any) => {
      const matchId = stateId && getDistrictStateId(item) === stateId;
      const matchName = stateName && getDistrictStateName(item) === stateName;
      return matchId || matchName;
    });
  }, [districts, formData.companyState, selectedCompanyStateName]);

  const filteredCompanyDivisions = useMemo(() => {
    const districtId = String(formData.companyDistrict || "");
    const districtName = normalizeName(selectedCompanyDistrictName);
    return divisions.filter((item: any) => {
      const matchId = districtId && getDivisionDistrictId(item) === districtId;
      const matchName = districtName && getDivisionDistrictName(item) === districtName;
      return matchId || matchName;
    });
  }, [divisions, formData.companyDistrict, selectedCompanyDistrictName]);

  const filteredAssociateDistricts = useMemo(() => {
    const stateId = String(formData.associateState || "");
    const stateName = normalizeName(selectedAssociateStateName);
    return districts.filter((item: any) => {
      const matchId = stateId && getDistrictStateId(item) === stateId;
      const matchName = stateName && getDistrictStateName(item) === stateName;
      return matchId || matchName;
    });
  }, [districts, formData.associateState, selectedAssociateStateName]);

  const filteredAssociateDivisions = useMemo(() => {
    const districtId = String(formData.associateDistrict || "");
    const districtName = normalizeName(selectedAssociateDistrictName);
    return divisions.filter((item: any) => {
      const matchId = districtId && getDivisionDistrictId(item) === districtId;
      const matchName = districtName && getDivisionDistrictName(item) === districtName;
      return matchId || matchName;
    });
  }, [divisions, formData.associateDistrict, selectedAssociateDistrictName]);

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

  const updateCompanyFunctionSelection = (functionId: string) => {
    setFormData((prev) => {
      const currentIds = Array.isArray(prev.companyFunctionIds) ? prev.companyFunctionIds : [];
      const currentPriorities = Array.isArray(prev.companyFunctionPriorities) ? prev.companyFunctionPriorities : [];
    const isSelected = currentIds.includes(functionId);
      let nextIds = currentIds;
      if (isSelected) {
        nextIds = currentIds.filter((id) => id !== functionId);
      } else if (currentIds.length < 6) {
        nextIds = [...currentIds, functionId];
      }

      let nextPriorities = currentPriorities.filter((id) => nextIds.includes(id));
      if (!isSelected && nextPriorities.length < 3 && nextIds.includes(functionId)) {
        nextPriorities = [...nextPriorities, functionId];
      }

      return { ...prev, companyFunctionIds: nextIds, companyFunctionPriorities: nextPriorities };
    });
    if (errors.companyFunctionIds) setErrors((prev) => ({ ...prev, companyFunctionIds: "" }));
  };

  const moveCompanyFunctionPriority = (functionId: string, direction: "up" | "down") => {
    setFormData((prev) => {
      const current = Array.isArray(prev.companyFunctionPriorities) ? [...prev.companyFunctionPriorities] : [];
      const index = current.indexOf(functionId);
      if (index === -1) return prev;
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= current.length) return prev;
      const next = [...current];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return { ...prev, companyFunctionPriorities: next };
    });
  };

  const validatePassword = (password: string) => {
    const missing: string[] = [];
    if (password.length < 8) missing.push("8+ chars");
    if (!/[A-Z]/.test(password)) missing.push("1 uppercase");
    if (!/[0-9]/.test(password)) missing.push("1 number");
    return missing;
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
  const isCompanyFlow = formData.hasCompany === "yes";
  const isNewCompany = isCompanyFlow && formData.companyMode === "new";
  const hasExistingCompanyOptions = existingCompanies.length > 0;
  const hasCompanyTypeOptions = companyTypes.length > 0;

  const stepTitle = useMemo(() => {
    if (currentStep === 1) return "Associate Profile";
    if (currentStep === 2) return "Company Setup";
    if (currentStep === 3) return "Select Company Capabilities";
    return "Verification & Submit";
  }, [currentStep]);

  const validateStep = (step: StepKey) => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) stepErrors.name = "Name is required";
      if (!formData.email.trim()) stepErrors.email = "Email is required";
      if (formData.email && !emailRegex.test(formData.email)) stepErrors.email = "Invalid email format";
      if (!parsePhoneValue({ raw: formData.phone, countryCode: formData.phoneCountryCode, national: formData.phoneNational }).e164) {
        stepErrors.phone = "Phone is required";
      }
      if (
        (formData.phoneSecondary || formData.phoneSecondaryNational) &&
        !parsePhoneValue({
          raw: formData.phoneSecondary,
          countryCode: formData.phoneSecondaryCountryCode,
          national: formData.phoneSecondaryNational,
          fallbackCountryCode: formData.phoneCountryCode,
        }).e164
      ) {
        stepErrors.phoneSecondary = "Enter a valid secondary phone number";
      }
      if (requiresPassword) {
        if (passwordStrength.length > 0) stepErrors.password = `Requirements: ${passwordStrength.join(", ")}`;
        if (!formData.confirmPassword.trim()) stepErrors.confirmPassword = "Please confirm password";
        if (formData.password !== formData.confirmPassword) stepErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (step === 2) {
      if (isCompanyFlow && formData.companyMode === "existing" && !hasExistingCompanyOptions) {
        stepErrors.associateCompanyId = "Existing company list unavailable. Retry loading options.";
      }
      if (isNewCompany && !hasCompanyTypeOptions) {
        stepErrors.companyType = "Company types unavailable. Retry loading options.";
      }
      if (isCompanyFlow && formData.companyMode === "existing" && !formData.associateCompanyId) {
        stepErrors.associateCompanyId = "Please select an existing company";
      }
      if (isNewCompany) {
        if (!formData.companyName.trim()) stepErrors.companyName = "Company name is required";
        if (!formData.companyEmail.trim()) stepErrors.companyEmail = "Company email is required";
        if (formData.companyEmail && !emailRegex.test(formData.companyEmail)) stepErrors.companyEmail = "Invalid company email";
        if (!parsePhoneValue({ raw: formData.companyPhone, countryCode: formData.companyPhoneCountryCode, national: formData.companyPhoneNational }).e164) {
          stepErrors.companyPhone = "Company phone is required";
        }
        if (!formData.companyAddress.trim()) stepErrors.companyAddress = "Company address is required";
        if (!formData.companyType) stepErrors.companyType = "Company type is required";
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
        if (!Array.isArray(formData.companyFunctionIds) || formData.companyFunctionIds.length < 1) {
          stepErrors.companyFunctionIds = "Select at least 1 main category.";
        }
        if (Array.isArray(formData.companyFunctionIds) && formData.companyFunctionIds.length > 6) {
          stepErrors.companyFunctionIds = "You can select up to 6 main categories.";
        }
      }
    }

    if (step === 4) {
      if (!formData.contactPreference) stepErrors.contactPreference = "Select how admin should contact you";
    }

    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
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
        const apiRoot = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1/web";
        const res = await axios.get(`${apiRoot}/auth/email-status`, {
          params: { email: formData.email.trim() },
        });
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
    if (isOnboarding) {
      setEmailCheckStatus("available");
      setEmailCheckMessage("Email linked to your account.");
      return;
    }
    if (!formData.email.trim()) {
      setEmailCheckStatus("error");
      setEmailCheckMessage("Please enter an email first.");
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setEmailCheckStatus("error");
      setEmailCheckMessage("Invalid email format.");
      return;
    }
    setIsCheckingEmail(true);
    setEmailCheckStatus("idle");
    setEmailCheckMessage("");
    try {
      const apiRoot = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1/web";
      const res = await axios.get(`${apiRoot}/auth/email-status`, {
        params: { email: formData.email.trim() },
      });
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
    if (isLoading || isSubmittingSuccess) return;
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      showToastMessage({ type: "error", message: "Please complete required fields.", position: "top-right" });
      return;
    }
    if (!isOnboarding && googleSignUp && !googleIdToken) {
      showToastMessage({ type: "error", message: "Google sign-up token missing. Please retry Google sign-up.", position: "top-right" });
      return;
    }

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
        hasCompany: isCompanyFlow,
        companyMode: isCompanyFlow ? formData.companyMode : null,
        associateCompanyId: isCompanyFlow && formData.companyMode === "existing" ? formData.associateCompanyId : null,
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
          legalRegistrationNumber: formData.companyGeoType === "INTERNATIONAL"
            ? formData.companyLegalNumber.trim()
            : undefined,
          legalComplianceInfo: formData.companyGeoType === "INTERNATIONAL"
            ? formData.companyLegalInformation.trim()
            : undefined,
          functionIds: Array.from(
            new Set((formData.companyFunctionIds || []).map((id) => String(id || "").trim()).filter(Boolean))
          ),
          functionPriorities: Array.from(
            new Set((formData.companyFunctionPriorities || []).map((id) => String(id || "").trim()).filter(Boolean))
          ).slice(0, 3),
          phone: normalizedCompanyPhone.e164,
          phoneCountryCode: normalizedCompanyPhone.countryCode,
          phoneNational: normalizedCompanyPhone.national,
          phoneSecondary: normalizedCompanySecondary.e164 || normalizedCompanyPhone.e164,
          phoneSecondaryCountryCode: normalizedCompanySecondary.countryCode || normalizedCompanyPhone.countryCode,
          phoneSecondaryNational: normalizedCompanySecondary.national || normalizedCompanyPhone.national,
          companyType: formData.companyType,
          address: formData.companyAddress.trim(),
          geoType: formData.companyGeoType,
          country: formData.companyGeoType === "INTERNATIONAL" ? formData.companyCountry : null,
          state: formData.companyState,
          district: formData.companyDistrict,
          division: formData.companyDivision,
          pincodeEntry: formData.companyPincodeEntry || null,
        };
      }

      const apiRoot = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1/web";
      const response = isOnboarding
        ? await axios.post(`${apiRoot}/auth/onboarding`, { role: "Associate", ...payload })
        : googleSignUp
          ? await axios.post(`${apiRoot}/auth/google`, {
            idToken: googleIdToken,
            role: "Associate",
            intent: "register",
            registerPayload: payload,
          })
          : await axios.post(`${apiRoot}/auth/register`, payload);

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
          router.push("/dashboard");
        } else {
          setTimeout(() => {
            router.push("/auth/register/success");
          }, 1500);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error?.response?.data?.message || "Registration failed.";
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
      leftPanel={{
        headline: "OBAOL",
        highlight: "ASSOCIATE NETWORK",
        description: "Empowering manufacturers, traders, and logistics providers with a unified platform for global agro-trade automation.",
        tags: [
          "Manufacturers",
          "Traders",
          "Logistics Providers",
          "Exporters & Importers",
          "Freight Forwarders",
          "Warehouse Managers",
          "Company Registration Mandatory"
        ],
        footer: "Associate_Hub_Online",
        knowMoreLink: "/roles/associate"
      }}
    >
      {optionsLoading ? (
        <div className="py-8 flex items-center justify-center">
          <Spinner color="warning" />
        </div>
      ) : (
        <form
          className="w-full flex flex-col gap-5"
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
                <div id="google-register-associate" className="w-full" />
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
                      <p className="text-[12px] font-bold text-foreground opacity-70 leading-none">GOOGLE PROTOCOL ACTIVE</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-500/20 border border-success-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                    <span className="text-[9px] font-black text-success-600 uppercase tracking-widest">Linked</span>
                  </div>
                </motion.div>
              ) : (
                <p className="text-xs text-warning-500">Google sign-up is not configured.</p>
              )}
            </>
          )}
          <div className="mb-10">
            <div className="flex items-center justify-between relative px-2 mb-6">
              <div className="absolute top-1/2 left-0 w-full h-[2.5px] bg-default-100/50 -translate-y-1/2 z-0 rounded-full" />
              <motion.div
                className="absolute top-1/2 left-0 h-[2.5px] bg-warning-500 -translate-y-1/2 z-0 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shadow-sm border-2 ${s < currentStep
                    ? "bg-warning-500 border-warning-500 text-white"
                    : s === currentStep
                      ? "bg-background border-warning-500 text-warning-500 scale-110 shadow-warning-500/20"
                      : "bg-background border-default-200 text-default-400"
                    }`}
                >
                  {s < currentStep ? <FiCheck className="text-sm stroke-[3]" /> : s}
                </div>
              ))}
            </div>
            <div className="flex justify-between px-1">
              {["Profile", "Company", "Capability", "Verify"].map((label, idx) => (
                <span
                  key={label}
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${idx + 1 <= currentStep ? "text-warning-500" : "text-default-400"
                    }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

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
                    <div className="rounded-xl border border-default-200 p-0.5 overflow-hidden transition-all hover:border-warning-500/50">
                      <PhoneField
                        name="phone"
                        label="Primary Phone Number"
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
                    <div className="rounded-xl border border-default-200 p-0.5 overflow-hidden transition-all hover:border-warning-500/50">
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
                      <Input
                        type={showPassword ? "text" : "password"}
                        label="Password"
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
                          <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="focus:outline-none p-2">
                            {showPassword ? <IoEyeOff className="text-default-400" /> : <IoEye className="text-default-400" />}
                          </button>
                        }
                      />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        label="Confirm Password"
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
                          <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="focus:outline-none p-2">
                            {showConfirmPassword ? <IoEyeOff className="text-default-400" /> : <IoEye className="text-default-400" />}
                          </button>
                        }
                      />
                    </div>
                  )}

                  <div className="md:col-span-2 pt-4">
                    <div className="p-4 rounded-2xl bg-warning-500/5 border border-dashed border-warning-500/30 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-warning-500 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-warning-600">Operator Referral (Optional)</span>
                      </div>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit Referral Code"
                        variant="flat"
                        value={formData.referralCode}
                        onValueChange={(v) => setField("referralCode", v.toUpperCase())}
                        maxLength={6}
                        classNames={{
                          input: "font-black tracking-[0.2em] text-center",
                          inputWrapper: "bg-background/80 h-12 border-none shadow-inner"
                        }}
                      />
                      <p className="text-[9px] font-bold text-default-400 uppercase tracking-tighter italic opacity-70">
                        Enter a valid operator code to automatically link your profile for faster verification.
                      </p>
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
                    <RadioGroup
                      label={<span className="text-xs font-black uppercase tracking-widest text-default-400">Representation</span>}
                      orientation="horizontal"
                      value={formData.hasCompany}
                      onValueChange={(v) => setField("hasCompany", v)}
                      classNames={{ wrapper: "gap-6" }}
                    >
                      <Radio value="yes" classNames={{ label: "text-sm font-bold" }}>Yes, I have a company</Radio>
                      <Radio value="no" classNames={{ label: "text-sm font-bold" }}>No, as Individual</Radio>
                    </RadioGroup>
                  </div>

                  {isCompanyFlow ? (
                    <>
                      <div className="p-5 rounded-[2rem] bg-orange-500/5 border border-orange-500/10">
                        <RadioGroup
                          label={<span className="text-xs font-black uppercase tracking-widest text-orange-500">Record Status</span>}
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
                            labelPlacement="outside"
                            variant="bordered"
                            defaultItems={existingCompanies}
                            selectedKey={formData.associateCompanyId || null}
                            onSelectionChange={(key: any) => setField("associateCompanyId", String(key || ""))}
                            placeholder={existingCompanies.length ? "Search by name..." : "No companies found"}
                            isInvalid={!!errors.associateCompanyId}
                            errorMessage={errors.associateCompanyId}
                            isDisabled={!hasExistingCompanyOptions}
                            classNames={{ base: "rounded-xl", inputWrapper: "h-12 border-default-200" }}
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
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Enter legal name"
                            value={formData.companyName}
                            onValueChange={(v) => setField("companyName", v)}
                            isInvalid={!!errors.companyName}
                            errorMessage={errors.companyName}
                            classNames={{ inputWrapper: "h-12 border-default-200" }}
                          />
                          <Input
                            label="Corporate Email"
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="corp@company.com"
                            value={formData.companyEmail}
                            onValueChange={(v) => setField("companyEmail", v)}
                            isInvalid={!!errors.companyEmail}
                            errorMessage={errors.companyEmail}
                            classNames={{ inputWrapper: "h-12 border-default-200" }}
                          />
                          <div className="md:col-span-2">
                            <div className="rounded-xl border border-default-200 p-0.5 overflow-hidden transition-all hover:border-warning-500/50">
                              <PhoneField
                                name="companyPhone"
                                label="Company Contact"
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
                          <Select
                            label="Type of Entity"
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Select type"
                            selectedKeys={formData.companyType ? [formData.companyType] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys as Set<string>)[0] || "";
                              setField("companyType", selected);
                            }}
                            isInvalid={!!errors.companyType}
                            errorMessage={errors.companyType}
                            isDisabled={!hasCompanyTypeOptions}
                            classNames={{ trigger: "h-12 border-default-200" }}
                          >
                            {companyTypes.map((item: any) => (
                              <SelectItem key={item._id} value={item._id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </Select>
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
                              <Input
                                label="Country"
                                labelPlacement="outside"
                                variant="bordered"
                                value={formData.companyCountry}
                                onValueChange={(v) => setField("companyCountry", v)}
                                isInvalid={!!errors.companyCountry}
                                errorMessage={errors.companyCountry}
                                placeholder="e.g. UAE, Singapore"
                                classNames={{ inputWrapper: "h-12 border-default-200" }}
                              />
                              <Input
                                label="Tax/Legal ID"
                                labelPlacement="outside"
                                variant="bordered"
                                value={formData.companyLegalNumber}
                                onValueChange={(v) => setField("companyLegalNumber", v)}
                                isInvalid={!!errors.companyLegalNumber}
                                errorMessage={errors.companyLegalNumber}
                                classNames={{ inputWrapper: "h-12 border-default-200" }}
                              />
                            </>
                          ) : (
                            <>
                              <Input
                                label="GSTIN Number"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="15-digit GSTIN"
                                value={formData.companyGstin}
                                onValueChange={(v) => setField("companyGstin", v.toUpperCase())}
                                isInvalid={!!errors.companyGstin}
                                errorMessage={errors.companyGstin}
                                className="md:col-span-2"
                                classNames={{ inputWrapper: "h-12 border-default-200" }}
                              />
                              <Select
                                label="State"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Select"
                                selectedKeys={formData.companyState ? [formData.companyState] : []}
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(keys as Set<string>)[0] || "";
                                  setCompanyLocationField("companyState", selected);
                                }}
                                isInvalid={!!errors.companyState}
                                errorMessage={errors.companyState}
                                classNames={{ trigger: "h-12 border-default-200" }}
                              >
                                {states.map((item: any) => (
                                  <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                                ))}
                              </Select>
                              <Select
                                label="District"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Select"
                                selectedKeys={formData.companyDistrict ? [formData.companyDistrict] : []}
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(keys as Set<string>)[0] || "";
                                  setCompanyLocationField("companyDistrict", selected);
                                }}
                                isInvalid={!!errors.companyDistrict}
                                errorMessage={errors.companyDistrict}
                                isDisabled={!formData.companyState}
                                classNames={{ trigger: "h-12 border-default-200" }}
                              >
                                {filteredCompanyDistricts.map((item: any) => (
                                  <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                                ))}
                              </Select>
                              <Select
                                label="Division"
                                labelPlacement="outside"
                                variant="bordered"
                                placeholder="Select"
                                selectedKeys={formData.companyDivision ? [formData.companyDivision] : []}
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(keys as Set<string>)[0] || "";
                                  setCompanyLocationField("companyDivision", selected);
                                }}
                                isInvalid={!!errors.companyDivision}
                                errorMessage={errors.companyDivision}
                                isDisabled={!formData.companyDistrict}
                                classNames={{ trigger: "h-12 border-default-200" }}
                              >
                                {filteredCompanyDivisions.map((item: any) => (
                                  <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                                ))}
                              </Select>
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
                  <div className="p-4 rounded-2xl bg-warning-500/5 border border-warning-500/10 text-xs font-black uppercase tracking-widest text-warning-500 text-center">
                    Select 1 to 6 main categories
                    <p className="mt-2 text-[10px] font-semibold tracking-wide text-default-500 normal-case">
                      Your choices customize the platform you see after onboarding. Pick up to 3 priorities.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-default-200/60 bg-content2/40 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-default-400">How This Affects Your Dashboard</p>
                    <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-default-500 font-semibold">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-warning-500" />
                        Shows tools and workflows based on your selected categories.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-warning-500" />
                        Your top priorities appear first on the dashboard.
                      </li>
                    </ul>
                  </div>

                  {isNewCompany && (
                    <div className="rounded-2xl border border-default-200/60 bg-content2/30 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-default-400">Priority Order (1–3)</p>
                      {formData.companyFunctionPriorities.length ? (
                        <div className="mt-3 space-y-2">
                          {formData.companyFunctionPriorities.map((id, index) => (
                            <div key={`${id}-${index}`} className="flex items-center justify-between rounded-xl border border-default-200 bg-content1/40 px-3 py-2">
                              <div className="flex items-center gap-3">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-warning-500 text-black text-[10px] font-black">
                                  {index + 1}
                                </span>
                                <span className="text-xs font-bold text-foreground/80">
                                  {companyFunctionNameById.get(id) || "Selected category"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveCompanyFunctionPriority(id, "up")}
                                  disabled={index === 0}
                                  className="h-7 w-7 rounded-full border border-default-200 text-default-500 hover:text-warning-500 hover:border-warning-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                  <FiChevronUp className="mx-auto text-sm" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveCompanyFunctionPriority(id, "down")}
                                  disabled={index === formData.companyFunctionPriorities.length - 1}
                                  className="h-7 w-7 rounded-full border border-default-200 text-default-500 hover:text-warning-500 hover:border-warning-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                  <FiChevronDown className="mx-auto text-sm" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-default-400">
                          Select categories below to set your top priorities.
                        </p>
                      )}
                    </div>
                  )}

                  {isNewCompany ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {groupedCompanyFunctions.length === 0 && (
                        <div className="py-12 text-center bg-content2/20 rounded-[2rem] border-2 border-dashed border-default-200">
                          <p className="text-sm text-default-300 font-bold">No capabilities available yet</p>
                          <p className="text-xs text-default-400 mt-2">
                            Select a company type or company profile to load capabilities.
                          </p>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold bg-warning-500/10 text-warning-600 hover:bg-warning-500/20 transition"
                          >
                            Back to Company Step
                          </button>
                        </div>
                      )}
                      {groupedCompanyFunctions.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {groupedCompanyFunctions.map((fn: any) => {
                            const fnId = String(fn?._id || "");
                            const isSelected = formData.companyFunctionIds.includes(fnId);
    const isDisabled = !isSelected && formData.companyFunctionIds.length >= 6;
                            const priorityIndex = formData.companyFunctionPriorities.indexOf(fnId);
                            return (
                              <button
                                key={fnId}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => updateCompanyFunctionSelection(fnId)}
                                className={`w-full text-left rounded-xl border p-3 transition-all duration-300 ${isSelected
                                  ? "border-warning-500 bg-warning-500/10 shadow-lg shadow-warning-500/5 ring-1 ring-warning-500/20"
                                  : isDisabled
                                    ? "border-default-100 bg-default-50/30 opacity-40 cursor-not-allowed"
                                    : "border-default-200 bg-content2/20 hover:border-warning-500/50 hover:bg-content2/40"
                                  }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "border-warning-500 bg-warning-500" : "border-default-300"}`}>
                                      {isSelected && <FiCheck className="text-[10px] text-white stroke-[4]" />}
                                    </div>
                                    <p className={`text-xs font-bold ${isSelected ? "text-warning-600" : "text-foreground/70"}`}>{fn?.name}</p>
                                  </div>
                                  {priorityIndex > -1 && (
                                    <span className="inline-flex items-center gap-2">
                                      <span className="rounded-full bg-warning-500/20 text-warning-600 text-[9px] font-black uppercase tracking-widest px-2 py-1">
                                        Priority {priorityIndex + 1}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {errors.companyFunctionIds && (
                        <p className="text-xs text-danger-500 font-semibold mt-2 text-center">
                          {errors.companyFunctionIds}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-[2rem] border-2 border-dashed border-default-200 bg-content2/20 p-6">
                      <p className="text-sm text-default-300 font-bold text-center">Capabilities linked to your company profile</p>
                      {existingCompanyCapabilityLabels.length ? (
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                          {existingCompanyCapabilityLabels.map((label, idx) => (
                            <span
                              key={`${label}-${idx}`}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-warning-500/10 text-warning-600 border border-warning-500/20"
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
                            className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold bg-warning-500/10 text-warning-600 hover:bg-warning-500/20 transition"
                          >
                            Back to Company Step
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
                  <div className="p-6 rounded-[2.5rem] bg-warning-500/5 border border-warning-500/20 text-sm text-warning-600 leading-relaxed font-bold text-center italic shadow-inner">
                    &quot;Authorized access only. Your details will be reviewed within 24-48 hours. A verification call may be initiated to finalize onboarding.&quot;
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {!optionsLoading && currentStep === 2 && formData.companyMode === "existing" && existingCompanies.length === 0 && (
            <div className="rounded-xl border border-danger-200 bg-danger-50/40 dark:bg-danger-900/15 p-3 text-xs text-danger-700 dark:text-danger-300">
              No existing companies are available right now. Choose the new company option.
            </div>
          )}
          {!optionsLoading && currentStep === 2 && isNewCompany && !hasCompanyTypeOptions && (
            <div className="rounded-xl border border-danger-200 bg-danger-50/40 dark:bg-danger-900/15 p-3 text-xs text-danger-700 dark:text-danger-300">
              Company type list is unavailable. Retry loading options before submitting.
            </div>
          )}

          {errors.general && (
            <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger text-sm text-center">
              {errors.general}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-8">
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
                className={`w-full h-12 rounded-xl font-black shadow-xl transition-all duration-500
                  ${isSubmittingSuccess
                    ? "bg-gradient-to-r from-success-500 to-green-600 shadow-success-500/20"
                    : "bg-gradient-to-r from-warning-500 to-amber-600 shadow-warning-500/20 hover:shadow-warning-500/40"
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
                className="text-warning hover:text-warning-400 font-semibold transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </form>
      )
      }

      {
        optionsError && (
          <div className="mt-4 rounded-xl border border-danger-200 bg-danger-50/40 dark:bg-danger-900/15 p-3 text-xs text-danger-700 dark:text-danger-300 flex items-center justify-between gap-3">
            <span>Could not load company/designation options. Please retry.</span>
            <Button size="sm" color="danger" variant="flat" onPress={() => refetchOptions()}>
              Retry
            </Button>
          </div>
        )
      }

    </AuthLayout >
  );
}
