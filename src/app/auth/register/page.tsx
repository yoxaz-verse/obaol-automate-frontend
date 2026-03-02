"use client";

import React, { useMemo, useState } from "react";
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
import { useRouter } from "next/navigation";
import axios from "axios";
import { showToastMessage } from "@/utils/utils";
import AuthLayout from "@/components/Auth/AuthLayout";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import PhoneField from "@/components/form/PhoneField";
import { parsePhoneValue } from "@/utils/phone";

type StepKey = 1 | 2 | 3 | 4;
const EMPTY_LIST: any[] = [];
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepKey>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    designation: "",
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
    companySubFunctionIds: [] as string[],
    companyFunctionIds: [] as string[],
    contactPreference: "phone",
    contactNotes: "",
    associateAddress: "",
    associateGeoType: "INDIAN",
    associateCountry: "",
    associateState: "",
    associateDistrict: "",
    associateDivision: "",
    associatePincodeEntry: "",
  });

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
        designations: [],
        states: [],
        districts: [],
        divisions: [],
        pincodeEntries: [],
        countries: [],
        companyFunctions: [],
        companySubFunctions: [],
      };
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
                designations: Array.isArray(payload?.designations) ? payload.designations : [],
                states: Array.isArray(payload?.states) ? payload.states : [],
                districts: Array.isArray(payload?.districts) ? payload.districts : [],
                divisions: Array.isArray(payload?.divisions) ? payload.divisions : [],
                pincodeEntries: Array.isArray(payload?.pincodeEntries) ? payload.pincodeEntries : [],
                countries: Array.isArray(payload?.countries) ? payload.countries : [],
                companyFunctions: Array.isArray(payload?.companyFunctions) ? payload.companyFunctions : [],
                companySubFunctions: Array.isArray(payload?.companySubFunctions) ? payload.companySubFunctions : [],
              };

              if (!output.existingCompanies.length || !output.designations.length || !output.countries.length) {
                const [companiesRes, designationsRes, countriesRes] = await Promise.allSettled([
                  axios.get(`${routeRoot}/register/companies`, { timeout: 8000, withCredentials: false }),
                  axios.get(`${routeRoot}/register/designations`, { timeout: 8000, withCredentials: false }),
                  axios.get(`${routeRoot}/register/countries`, { timeout: 8000, withCredentials: false }),
                ]);

                if (companiesRes.status === "fulfilled") {
                  const companiesPayload = companiesRes.value?.data?.data || companiesRes.value?.data?.data?.data || [];
                  if (Array.isArray(companiesPayload)) {
                    output.existingCompanies = companiesPayload;
                  }
                }

                if (designationsRes.status === "fulfilled") {
                  const designationsPayload = designationsRes.value?.data?.data || designationsRes.value?.data?.data?.data || [];
                  if (Array.isArray(designationsPayload)) {
                    output.designations = designationsPayload;
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
                  designations: output.designations.length,
                  existingCompanies: output.existingCompanies.length,
                  companyTypes: output.companyTypes.length,
                  countries: output.countries.length,
                },
                lastError: "",
              });
              if (output.existingCompanies.length || output.designations.length || output.companyTypes.length) {
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
            designations: Array.isArray(fallbackOutput.designations) ? fallbackOutput.designations.length : 0,
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

  const companyTypes = Array.isArray(registerOptions?.companyTypes) ? registerOptions.companyTypes : EMPTY_LIST;
  const existingCompanies = Array.isArray(registerOptions?.existingCompanies) ? registerOptions.existingCompanies : EMPTY_LIST;
  const designationOptions = Array.isArray(registerOptions?.designations) ? registerOptions.designations : EMPTY_LIST;
  const states = Array.isArray(registerOptions?.states) ? registerOptions.states : EMPTY_LIST;
  const districts = Array.isArray(registerOptions?.districts) ? registerOptions.districts : EMPTY_LIST;
  const divisions = Array.isArray(registerOptions?.divisions) ? registerOptions.divisions : EMPTY_LIST;
  const pincodeEntries = Array.isArray(registerOptions?.pincodeEntries) ? registerOptions.pincodeEntries : EMPTY_LIST;
  const countries = Array.isArray(registerOptions?.countries) ? registerOptions.countries : EMPTY_LIST;
  const companyFunctions = Array.isArray(registerOptions?.companyFunctions) ? registerOptions.companyFunctions : EMPTY_LIST;
  const companySubFunctions = Array.isArray(registerOptions?.companySubFunctions) ? registerOptions.companySubFunctions : EMPTY_LIST;
  const selectedDesignationLabel =
    designationOptions.find((item: any) => String(item?._id) === String(formData.designation))?.name || "Not selected";
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
  const selectedCountryName =
    countries.find((c: any) => String(c?._id || "") === String(formData.companyCountry || ""))?.name ||
    formData.companyCountry ||
    "";
  const selectedStateName = states.find((s: any) => String(s?._id || "") === String(formData.companyState || ""))?.name || "";
  const selectedDistrictName = districts.find((d: any) => String(d?._id || "") === String(formData.companyDistrict || ""))?.name || "";
  const selectedDivisionName = divisions.find((d: any) => String(d?._id || "") === String(formData.companyDivision || ""))?.name || "";
  const filteredDistricts = useMemo(
    () => districts.filter((item: any) => String(item?.state || "") === String(formData.companyState || "")),
    [districts, formData.companyState]
  );
  const filteredDivisions = useMemo(
    () => divisions.filter((item: any) => String(item?.district || "") === String(formData.companyDistrict || "")),
    [divisions, formData.companyDistrict]
  );
  const filteredPincodes = useMemo(
    () => pincodeEntries.filter((item: any) => String(item?.division || "") === String(formData.companyDivision || "")),
    [pincodeEntries, formData.companyDivision]
  );
  const groupedCompanyFunctions = useMemo(() => {
    return companyFunctions.map((fn: any) => ({
      ...fn,
      subFunctions: companySubFunctions.filter(
        (sub: any) => String(sub?.functionId || "") === String(fn?._id || "")
      ),
    }));
  }, [companyFunctions, companySubFunctions]);
  const selectedSubFunctionLabels = useMemo(() => {
    const selected = new Set(formData.companySubFunctionIds || []);
    return companySubFunctions
      .filter((sub: any) => selected.has(String(sub?._id || "")))
      .map((sub: any) => sub?.name || "")
      .filter(Boolean);
  }, [companySubFunctions, formData.companySubFunctionIds]);

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
  const hasDesignationOptions = designationOptions.length > 0;
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
      if (passwordStrength.length > 0) stepErrors.password = `Requirements: ${passwordStrength.join(", ")}`;
      if (!formData.confirmPassword.trim()) stepErrors.confirmPassword = "Please confirm password";
      if (formData.password !== formData.confirmPassword) stepErrors.confirmPassword = "Passwords do not match";
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
          if (!formData.companyDivision) stepErrors.companyDivision = "Division is required";
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
          stepErrors.companyFunctionIds = "Select at least 1 function.";
        }
        if (Array.isArray(formData.companyFunctionIds) && formData.companyFunctionIds.length > 10) {
          stepErrors.companyFunctionIds = "You can select up to 10 functions.";
        }
      }
    }

    if (step === 4) {
      if (!formData.contactPreference) stepErrors.contactPreference = "Select how admin should contact you";
    }

    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(4, prev + 1) as StepKey);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1) as StepKey);
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      showToastMessage({ type: "error", message: "Please complete required fields.", position: "top-right" });
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
        designation: formData.designation.trim(),
        password: formData.password,
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
          subFunctionIds: (() => {
            const selectedFnIds = new Set(formData.companyFunctionIds || []);
            return groupedCompanyFunctions
              .filter((fn: any) => selectedFnIds.has(String(fn?._id || "")))
              .flatMap((fn: any) => (Array.isArray(fn.subFunctions) ? fn.subFunctions : []).map((s: any) => String(s?._id || "")))
              .filter(Boolean);
          })(),
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

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1/web"}/auth/register`,
        payload
      );

      if (response.data?.success) {
        showToastMessage({
          type: "success",
          message: response.data?.message || "Registration submitted for review.",
          position: "top-right",
        });
        router.push("/auth/login?role=Associate");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Registration failed.";
      setErrors((prev) => ({ ...prev, general: errorMessage }));
      showToastMessage({ type: "error", message: errorMessage, position: "top-right" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={`Associate Registration • Step ${currentStep}/4`}
      subtitle={stepTitle}
      cardMaxWidthClass="max-w-[620px]"
      leftPanel={{
        headline: "Become an",
        highlight: "OBAOL ASSOCIATE",
        description: "Associates power verified agro commodity trade with structured execution, transparent roles, and trusted delivery.",
        points: [
          "Access verified buyer-supplier opportunities across the network.",
          "Work through structured enquiry, responsibility, and order workflows.",
          "Get manual onboarding support from OBAOL team before activation.",
        ],
        footer: "Associate_Onboarding",
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
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1">
                <div className={`h-1.5 rounded-full ${step <= currentStep ? "bg-warning-500" : "bg-default-200"}`} />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Chip size="sm" color={currentStep === 1 ? "warning" : "default"} variant="flat">Profile</Chip>
            <Chip size="sm" color={currentStep === 2 ? "warning" : "default"} variant="flat">Company</Chip>
            <Chip size="sm" color={currentStep === 3 ? "warning" : "default"} variant="flat">Capabilities</Chip>
            <Chip size="sm" color={currentStep === 4 ? "warning" : "default"} variant="flat">Submit</Chip>
            {!hasDesignationOptions && (
              <Chip size="sm" color="warning" variant="flat">Designation List Unavailable</Chip>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 items-start">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="register-step-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-warning-200/40 bg-gradient-to-br from-warning-50/30 to-transparent dark:from-warning-900/10 p-4"
                >
                  <Input
                    type="text"
                    label="Full Name"
                    labelPlacement="outside"
                    placeholder="John Doe"
                    value={formData.name}
                    onValueChange={(v) => setField("name", v)}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                    startContent={<IoPerson className="text-default-400" />}
                  />
                  <Input
                    type="email"
                    label="Email Address"
                    labelPlacement="outside"
                    placeholder="name@company.com"
                    value={formData.email}
                    onValueChange={(v) => setField("email", v)}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                    startContent={<IoMail className="text-default-400" />}
                  />
                  <div className="md:col-span-2">
                    <PhoneField
                      name="phone"
                      label="Phone Number"
                      value={formData.phone}
                      countryCodeValue={formData.phoneCountryCode}
                      nationalValue={formData.phoneNational}
                      onChange={(next) => {
                        setField("phone", next.e164);
                        setField("phoneCountryCode", next.countryCode);
                        setField("phoneNational", next.national);
                      }}
                    />
                    {errors.phone ? <p className="text-danger text-xs mt-1">{errors.phone}</p> : null}
                  </div>
                  <div className="md:col-span-2">
                    <PhoneField
                      name="phoneSecondary"
                      label="Secondary Phone Number"
                      value={formData.phoneSecondary}
                      countryCodeValue={formData.phoneSecondaryCountryCode}
                      nationalValue={formData.phoneSecondaryNational}
                      onChange={(next) => {
                        setField("phoneSecondary", next.e164);
                        setField("phoneSecondaryCountryCode", next.countryCode);
                        setField("phoneSecondaryNational", next.national);
                      }}
                    />
                    {errors.phoneSecondary ? <p className="text-danger text-xs mt-1">{errors.phoneSecondary}</p> : null}
                  </div>
                  <Select
                    label="Designation (Optional)"
                    labelPlacement="outside"
                    placeholder={designationOptions.length ? "Select designation" : "No designations available"}
                    selectedKeys={formData.designation ? [formData.designation] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys as Set<string>)[0] || "";
                      setField("designation", selected);
                    }}
                  >
                    {designationOptions.map((item: any) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type={showPassword ? "text" : "password"}
                      label="Password"
                      labelPlacement="outside"
                      placeholder="Create a secure password"
                      value={formData.password}
                      onValueChange={(v) => setField("password", v)}
                      isInvalid={!!errors.password}
                      errorMessage={errors.password}
                      startContent={<IoLockClosed className="text-default-400" />}
                      endContent={
                        <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
                          {showPassword ? <IoEyeOff className="text-default-400" /> : <IoEye className="text-default-400" />}
                        </button>
                      }
                    />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      label="Confirm Password"
                      labelPlacement="outside"
                      placeholder="Repeat your password"
                      value={formData.confirmPassword}
                      onValueChange={(v) => setField("confirmPassword", v)}
                      isInvalid={!!errors.confirmPassword}
                      errorMessage={errors.confirmPassword}
                      startContent={<IoLockClosed className="text-default-400" />}
                      endContent={
                        <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)}>
                          {showConfirmPassword ? <IoEyeOff className="text-default-400" /> : <IoEye className="text-default-400" />}
                        </button>
                      }
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="register-step-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 rounded-2xl border border-primary-200/30 bg-gradient-to-br from-primary-50/20 to-transparent dark:from-primary-900/10 p-4"
                >
                  <RadioGroup
                    label="Are you representing a company?"
                    orientation="horizontal"
                    value={formData.hasCompany}
                    onValueChange={(v) => setField("hasCompany", v)}
                  >
                    <Radio value="yes">Yes</Radio>
                    <Radio value="no">No (Individual for now)</Radio>
                  </RadioGroup>

                  {isCompanyFlow ? (
                    <>
                      <RadioGroup
                        label="Is your company already on OBAOL?"
                        orientation="horizontal"
                        value={formData.companyMode}
                        onValueChange={(v) => setField("companyMode", v)}
                      >
                        <Radio value="existing">Yes, select existing</Radio>
                        <Radio value="new">No, add new company</Radio>
                      </RadioGroup>

                      {formData.companyMode === "existing" && (
                        <div className="space-y-3">
                          <Autocomplete
                            label="Select Existing Company"
                            labelPlacement="outside"
                            defaultItems={existingCompanies}
                            selectedKey={formData.associateCompanyId || null}
                            onSelectionChange={(key) => setField("associateCompanyId", String(key || ""))}
                            placeholder={existingCompanies.length ? "Search your company" : "No existing companies found"}
                            isInvalid={!!errors.associateCompanyId}
                            errorMessage={errors.associateCompanyId}
                            isDisabled={!hasExistingCompanyOptions}
                          >
                            {(item: any) => (
                              <AutocompleteItem key={item._id} textValue={item.name}>
                                {item.name}
                              </AutocompleteItem>
                            )}
                          </Autocomplete>
                          <div className="rounded-xl border border-default-200/70 bg-default-50/40 dark:bg-default-100/5 p-3">
                            <div className="text-xs uppercase tracking-wide text-default-500 mb-2">Company Functions (Read Only)</div>
                            {selectedExistingCompanyInterests.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {selectedExistingCompanyInterests.map((interest: string) => (
                                  <Chip key={interest} size="sm" color="primary" variant="flat">
                                    {interest.replace(/_/g, " ")}
                                  </Chip>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-default-500">No functions configured yet for this company.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {isNewCompany && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Company Name"
                            labelPlacement="outside"
                            value={formData.companyName}
                            onValueChange={(v) => setField("companyName", v)}
                            isInvalid={!!errors.companyName}
                            errorMessage={errors.companyName}
                          />
                          <Input
                            label="Company Email"
                            labelPlacement="outside"
                            value={formData.companyEmail}
                            onValueChange={(v) => setField("companyEmail", v)}
                            isInvalid={!!errors.companyEmail}
                            errorMessage={errors.companyEmail}
                          />
                          <div className="md:col-span-2">
                            <PhoneField
                              name="companyPhone"
                              label="Company Phone"
                              value={formData.companyPhone}
                              countryCodeValue={formData.companyPhoneCountryCode}
                              nationalValue={formData.companyPhoneNational}
                              onChange={(next) => {
                                setField("companyPhone", next.e164);
                                setField("companyPhoneCountryCode", next.countryCode);
                                setField("companyPhoneNational", next.national);
                              }}
                            />
                            {errors.companyPhone ? <p className="text-danger text-xs mt-1">{errors.companyPhone}</p> : null}
                          </div>
                          <div className="md:col-span-2">
                            <PhoneField
                              name="companyPhoneSecondary"
                              label="Company Secondary Phone (Optional)"
                              value={formData.companyPhoneSecondary}
                              countryCodeValue={formData.companyPhoneSecondaryCountryCode}
                              nationalValue={formData.companyPhoneSecondaryNational}
                              onChange={(next) => {
                                setField("companyPhoneSecondary", next.e164);
                                setField("companyPhoneSecondaryCountryCode", next.countryCode);
                                setField("companyPhoneSecondaryNational", next.national);
                              }}
                            />
                          </div>
                          <Select
                            label="Company Type"
                            labelPlacement="outside"
                            selectedKeys={formData.companyType ? [formData.companyType] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys as Set<string>)[0] || "";
                              setField("companyType", selected);
                            }}
                            isInvalid={!!errors.companyType}
                            errorMessage={errors.companyType}
                            isDisabled={!hasCompanyTypeOptions}
                          >
                            {companyTypes.map((item: any) => (
                              <SelectItem key={item._id} value={item._id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </Select>
                          <RadioGroup
                            label="Company Geography"
                            orientation="horizontal"
                            value={formData.companyGeoType}
                            onValueChange={(v) => setCompanyGeoType(v as "INDIAN" | "INTERNATIONAL")}
                            className="md:col-span-2"
                          >
                            <Radio value="INDIAN">Indian Company</Radio>
                            <Radio value="INTERNATIONAL">International Company</Radio>
                          </RadioGroup>
                          <Textarea
                            label="Full Company Address"
                            labelPlacement="outside"
                            value={formData.companyAddress}
                            onValueChange={(v) => setField("companyAddress", v)}
                            isInvalid={!!errors.companyAddress}
                            errorMessage={errors.companyAddress}
                            className="md:col-span-2"
                          />
                          {formData.companyGeoType === "INTERNATIONAL" ? (
                            <>
                              <Input
                                label="Country Name"
                                labelPlacement="outside"
                                value={formData.companyCountry}
                                onValueChange={(v) => setField("companyCountry", v)}
                                isInvalid={!!errors.companyCountry}
                                errorMessage={errors.companyCountry}
                                placeholder="Type country name (e.g., United Arab Emirates)"
                              />
                              <Input
                                label="Legal Number"
                                labelPlacement="outside"
                                value={formData.companyLegalNumber}
                                onValueChange={(v) => setField("companyLegalNumber", v)}
                                isInvalid={!!errors.companyLegalNumber}
                                errorMessage={errors.companyLegalNumber}
                              />
                              <Textarea
                                label="Legal Information"
                                labelPlacement="outside"
                                value={formData.companyLegalInformation}
                                onValueChange={(v) => setField("companyLegalInformation", v)}
                                isInvalid={!!errors.companyLegalInformation}
                                errorMessage={errors.companyLegalInformation}
                                className="md:col-span-2"
                                placeholder="Mention legal framework followed and registration details."
                              />
                            </>
                          ) : (
                            <>
                              <Input
                                label="GST Number"
                                labelPlacement="outside"
                                value={formData.companyGstin}
                                onValueChange={(v) => setField("companyGstin", v.toUpperCase())}
                                isInvalid={!!errors.companyGstin}
                                errorMessage={errors.companyGstin}
                                className="md:col-span-2"
                              />
                              <Select
                                label="State"
                                labelPlacement="outside"
                                selectedKeys={formData.companyState ? [formData.companyState] : []}
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(keys as Set<string>)[0] || "";
                                  setCompanyLocationField("companyState", selected);
                                }}
                                isInvalid={!!errors.companyState}
                                errorMessage={errors.companyState}
                              >
                                {states.map((item: any) => (
                                  <SelectItem key={item._id} value={item._id}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </Select>
                              <Select
                                label="District"
                                labelPlacement="outside"
                                selectedKeys={formData.companyDistrict ? [formData.companyDistrict] : []}
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(keys as Set<string>)[0] || "";
                                  setCompanyLocationField("companyDistrict", selected);
                                }}
                                isInvalid={!!errors.companyDistrict}
                                errorMessage={errors.companyDistrict}
                                isDisabled={!formData.companyState}
                              >
                                {filteredDistricts.map((item: any) => (
                                  <SelectItem key={item._id} value={item._id}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </Select>
                              <Select
                                label="Division"
                                labelPlacement="outside"
                                selectedKeys={formData.companyDivision ? [formData.companyDivision] : []}
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(keys as Set<string>)[0] || "";
                                  setCompanyLocationField("companyDivision", selected);
                                }}
                                isInvalid={!!errors.companyDivision}
                                errorMessage={errors.companyDivision}
                                isDisabled={!formData.companyDistrict}
                              >
                                {filteredDivisions.map((item: any) => (
                                  <SelectItem key={item._id} value={item._id}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </Select>
                              <Select
                                label="Pincode (Optional)"
                                labelPlacement="outside"
                                selectedKeys={formData.companyPincodeEntry ? [formData.companyPincodeEntry] : []}
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(keys as Set<string>)[0] || "";
                                  setCompanyLocationField("companyPincodeEntry", selected);
                                }}
                                isDisabled={!formData.companyDivision}
                              >
                                {filteredPincodes.map((item: any) => (
                                  <SelectItem key={item._id} value={item._id}>
                                    {item.pincode} - {item.officename}
                                  </SelectItem>
                                ))}
                              </Select>
                              {formData.companyState && filteredDistricts.length === 0 ? (
                                <p className="md:col-span-2 text-xs text-default-500">No districts found for the selected state.</p>
                              ) : null}
                              {formData.companyDistrict && filteredDivisions.length === 0 ? (
                                <p className="md:col-span-2 text-xs text-default-500">No divisions found for the selected district.</p>
                              ) : null}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <RadioGroup
                        label="Your Geography"
                        orientation="horizontal"
                        value={formData.associateGeoType}
                        onValueChange={(v) => setAssociateGeoType(v as "INDIAN" | "INTERNATIONAL")}
                        className="md:col-span-2"
                      >
                        <Radio value="INDIAN">India</Radio>
                        <Radio value="INTERNATIONAL">Outside India</Radio>
                      </RadioGroup>
                      <Textarea
                        label="Full Address"
                        labelPlacement="outside"
                        value={formData.associateAddress}
                        onValueChange={(v) => setField("associateAddress", v)}
                        isInvalid={!!errors.associateAddress}
                        errorMessage={errors.associateAddress}
                        className="md:col-span-2"
                      />
                      {formData.associateGeoType === "INTERNATIONAL" ? (
                        <Input
                          label="Country Name"
                          labelPlacement="outside"
                          value={formData.associateCountry}
                          onValueChange={(v) => setField("associateCountry", v)}
                          isInvalid={!!errors.associateCountry}
                          errorMessage={errors.associateCountry}
                          placeholder="Type country name"
                          className="md:col-span-2"
                        />
                      ) : (
                        <>
                          <Select
                            label="State"
                            labelPlacement="outside"
                            selectedKeys={formData.associateState ? [formData.associateState] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys as Set<string>)[0] || "";
                              setAssociateLocationField("associateState", selected);
                            }}
                            isInvalid={!!errors.associateState}
                            errorMessage={errors.associateState}
                          >
                            {states.map((item: any) => (
                              <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                            ))}
                          </Select>
                          <Select
                            label="District"
                            labelPlacement="outside"
                            selectedKeys={formData.associateDistrict ? [formData.associateDistrict] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys as Set<string>)[0] || "";
                              setAssociateLocationField("associateDistrict", selected);
                            }}
                            isInvalid={!!errors.associateDistrict}
                            errorMessage={errors.associateDistrict}
                            isDisabled={!formData.associateState}
                          >
                            {districts.filter((d: any) => d.state === formData.associateState).map((item: any) => (
                              <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                            ))}
                          </Select>
                          <Select
                            label="Division"
                            labelPlacement="outside"
                            selectedKeys={formData.associateDivision ? [formData.associateDivision] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys as Set<string>)[0] || "";
                              setAssociateLocationField("associateDivision", selected);
                            }}
                            isInvalid={!!errors.associateDivision}
                            errorMessage={errors.associateDivision}
                            isDisabled={!formData.associateDistrict}
                          >
                            {divisions.filter((d: any) => d.district === formData.associateDistrict).map((item: any) => (
                              <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                            ))}
                          </Select>
                          <Select
                            label="Pincode (Optional)"
                            labelPlacement="outside"
                            selectedKeys={formData.associatePincodeEntry ? [formData.associatePincodeEntry] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys as Set<string>)[0] || "";
                              setAssociateLocationField("associatePincodeEntry", selected);
                            }}
                            isDisabled={!formData.associateDivision}
                          >
                            {pincodeEntries.filter((p: any) => p.division === formData.associateDivision).map((item: any) => (
                              <SelectItem key={item._id} value={item._id}>{item.pincode} - {item.officename}</SelectItem>
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 rounded-2xl border border-success-200/30 bg-gradient-to-br from-success-50/20 to-transparent dark:from-success-900/10 p-4"
                >
                  <div className="rounded-xl border border-primary-300/80 bg-primary-50 p-3 text-sm text-primary-900 dark:border-primary-300/70 dark:bg-primary-900/50 dark:text-primary-50">
                    Select your company&apos;s capabilities. Choose <strong>1 to 10</strong> functions that best describe what your company does.
                  </div>
                  {isNewCompany ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {groupedCompanyFunctions.map((fn: any) => {
                          const fnId = String(fn?._id || "");
                          const isSelected = formData.companyFunctionIds.includes(fnId);
                          const isDisabled = !isSelected && formData.companyFunctionIds.length >= 10;
                          return (
                            <button
                              key={fnId}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                setFormData((prev) => {
                                  const current = Array.isArray(prev.companyFunctionIds) ? prev.companyFunctionIds : [];
                                  if (isSelected) {
                                    return { ...prev, companyFunctionIds: current.filter((id) => id !== fnId) };
                                  }
                                  if (current.length >= 10) return prev;
                                  return { ...prev, companyFunctionIds: [...current, fnId] };
                                });
                                if (errors.companyFunctionIds) {
                                  setErrors((prev) => ({ ...prev, companyFunctionIds: "" }));
                                }
                              }}
                              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all duration-150 ${isSelected
                                ? "border-warning-500 bg-warning-50 dark:bg-warning-900/20 shadow-sm"
                                : isDisabled
                                  ? "border-default-200 bg-default-50/50 dark:bg-default-100/5 opacity-40 cursor-not-allowed"
                                  : "border-default-200 bg-default-50/50 dark:bg-default-100/5 hover:border-warning-300 hover:bg-warning-50/30 dark:hover:bg-warning-900/10 cursor-pointer"
                                }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className={`text-sm font-semibold ${isSelected ? "text-warning-700 dark:text-warning-400" : "text-foreground"
                                    }`}>
                                    {fn?.name || "Function"}
                                  </p>
                                  {fn?.description ? (
                                    <p className="text-xs text-default-500 mt-0.5 line-clamp-1">{fn.description}</p>
                                  ) : (
                                    <p className="text-xs text-default-400 mt-0.5">
                                      {Array.isArray(fn?.subFunctions) ? fn.subFunctions.length : 0} sub-functions
                                    </p>
                                  )}
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected
                                  ? "border-warning-500 bg-warning-500"
                                  : "border-default-300"
                                  }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between text-xs text-default-500">
                        <span>
                          {formData.companyFunctionIds.length} / 10 selected
                        </span>
                        {formData.companyFunctionIds.length >= 10 && (
                          <span className="text-warning-600 font-semibold">Maximum reached</span>
                        )}
                      </div>

                      {errors.companyFunctionIds ? (
                        <p className="text-danger text-xs">{errors.companyFunctionIds}</p>
                      ) : null}
                    </>
                  ) : (
                    <div className="rounded-xl border border-default-200 bg-default-50/40 dark:bg-default-100/5 p-3 text-sm text-default-600 dark:text-default-300">
                      Capability selection is required only when adding a new company.
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="register-step-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 rounded-2xl border border-success-200/30 bg-gradient-to-br from-success-50/20 to-transparent dark:from-success-900/10 p-4"
                >
                  <RadioGroup
                    label="How should admin contact you for verification?"
                    orientation="horizontal"
                    value={formData.contactPreference}
                    onValueChange={(v) => setField("contactPreference", v)}
                  >
                    <Radio value="phone">Phone</Radio>
                    <Radio value="email">Email</Radio>
                  </RadioGroup>

                  <Textarea
                    label="Additional Note (Optional)"
                    labelPlacement="outside"
                    placeholder="Share anything useful for verification call."
                    value={formData.contactNotes}
                    onValueChange={(v) => setField("contactNotes", v)}
                  />
                  <div className="rounded-xl border border-warning-200 bg-warning-50/40 dark:bg-warning-900/15 p-4 text-sm text-warning-800 dark:text-warning-200 leading-relaxed font-medium text-center">
                    As we only deal with registered and authenticated users, your details have been forwarded for verification. Our team will contact you soon and will reach out to you when your account is validated.
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

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="flat"
              className="w-full sm:w-auto"
              isDisabled={currentStep === 1 || isLoading}
              onPress={handleBack}
            >
              Back
            </Button>
            {currentStep < 4 ? (
              <Button
                type="button"
                color="warning"
                className="w-full sm:flex-1 font-semibold"
                onPress={handleNext}
              >
                Continue
              </Button>
            ) : (
              <Button
                color="warning"
                className="w-full sm:flex-1 font-bold"
                type="button"
                isLoading={isLoading}
                onPress={handleSubmit}
              >
                {isLoading ? "Submitting..." : "Submit Registration"}
              </Button>
            )}
          </div>

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
        </form>
      )}

      {optionsError && (
        <div className="mt-4 rounded-xl border border-danger-200 bg-danger-50/40 dark:bg-danger-900/15 p-3 text-xs text-danger-700 dark:text-danger-300 flex items-center justify-between gap-3">
          <span>Could not load company/designation options. Please retry.</span>
          <Button size="sm" color="danger" variant="flat" onPress={() => refetchOptions()}>
            Retry
          </Button>
        </div>
      )}

    </AuthLayout>
  );
}
