"use client";

import React, { useState, useEffect, useMemo, Suspense, useContext, useRef } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Textarea,
  Checkbox,
  Chip,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import AuthLayout from "@/components/Auth/AuthLayout";
import AuthContext from "@/context/AuthContext";

const AutocompleteAny = Autocomplete as any;
import PhoneField from "@/components/form/PhoneField";
import { parsePhoneValue } from "@/utils/phone";
import { showToastMessage } from "@/utils/utils";
import { accountRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiLock, FiMapPin, FiGlobe, FiChevronRight, FiChevronLeft, FiCheck } from "react-icons/fi";

const EMPTY_LIST: any[] = [];
declare global {
  interface Window {
    google?: any;
  }
}
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

function OperatorRegisterForm({ mode = "auth" }: { mode?: "auth" | "onboarding" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useContext(AuthContext);
  const isOnboarding = mode === "onboarding";
  const [currentStep, setCurrentStep] = useState(1);
  const [completedStep, setCompletedStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingSuccess, setIsSubmittingSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    state: "",
    district: "",
  });
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "+91",
    phoneNational: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    address: "",
    state: "",
    district: "",
    languageKnown: [] as string[],
  });

  const draftLoadedRef = useRef(false);
  const DRAFT_KEY = "onboarding_draft_operator";

  useEffect(() => {
    if (!isOnboarding) return;
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) {
        draftLoadedRef.current = true;
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed?.form) setForm((prev) => ({ ...prev, ...parsed.form }));
      if (parsed?.currentStep) setCurrentStep(parsed.currentStep);
      if (parsed?.completedStep) setCompletedStep(parsed.completedStep);
    } catch {
      // ignore draft load errors
    } finally {
      draftLoadedRef.current = true;
    }
  }, [isOnboarding]);

  useEffect(() => {
    if (!isOnboarding) return;
    if (!draftLoadedRef.current) return;
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      const payload = {
        form,
        currentStep,
        completedStep,
        updatedAt: Date.now(),
      };
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
        window.dispatchEvent(
          new CustomEvent("onboardingDraftUpdated", {
            detail: { role: "operator", completedStep, currentStep },
          })
        );
      } catch {
        // ignore draft save errors
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [form, currentStep, completedStep, isOnboarding]);
  const referralParam = String(searchParams?.get("ref") || "").trim();

  useEffect(() => {
    if (!referralParam) return;
    setForm((prev) => (prev.referralCode ? prev : { ...prev, referralCode: referralParam.toUpperCase() }));
  }, [referralParam]);

  useEffect(() => {
    if (!isOnboarding || !user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }));
  }, [isOnboarding, user]);

  useEffect(() => {
    if (isOnboarding) return;
    const prefill = String(searchParams?.get("prefill") || "").trim();
    if (!prefill) return;
    setForm((prev) => (prev.email ? prev : { ...prev, email: prefill }));
  }, [isOnboarding, searchParams]);

  const { data: optionsResponse, isLoading: optionsLoading } = useQuery({
    queryKey: ["operator-register-options"],
    queryFn: async () => {
      try {
        const response = await getData(accountRoutes.operatorRegisterOptions);
        return response.data?.data || {};
      } catch (error) {
        console.error("Failed to fetch operator registration options:", error);
        throw error;
      }
    },
    retry: 1,
  });

  useEffect(() => {
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

  useEffect(() => {
    if (isOnboarding) return;
    if (!googleReady) return;
    if (!window?.google?.accounts?.id) return;
    const container = document.getElementById("google-register-operator");
    if (!container) return;
    const buttonWidth = Math.min(360, Math.max(240, container.clientWidth || 320));
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (resp: { credential?: string }) => {
        if (!resp?.credential) return;
        const payload = decodeJwt(resp.credential);
        setGoogleIdToken(resp.credential);
        setGoogleSignUp(true);
        setForm((prev) => ({
          ...prev,
          name: prev.name || payload?.name || "",
          email: prev.email || payload?.email || "",
        }));
      },
    });
    window.google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      width: buttonWidth,
      text: "continue_with",
      shape: "pill",
    });
  }, [googleReady, googleClientId]);

  const languages = Array.isArray(optionsResponse?.languages) ? optionsResponse.languages : EMPTY_LIST;
  const states = Array.isArray(optionsResponse?.states) ? optionsResponse.states : EMPTY_LIST;
  const districts = Array.isArray(optionsResponse?.districts) ? optionsResponse.districts : EMPTY_LIST;
  const filteredDistricts = useMemo(
    () => districts.filter((d: any) => String(d?.state) === String(form.state)),
    [districts, form.state]
  );

  const getStepErrors = (step: number) => {
    const nextErrors = {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      address: "",
      state: "",
      district: "",
    };
    if (step === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!form.name) nextErrors.name = "Full name is required.";
      if (!form.email) nextErrors.email = "Email address is required.";
      if (form.email && !emailRegex.test(form.email)) nextErrors.email = "Enter a valid email address.";
      if (!form.phone && !form.phoneNational) nextErrors.phone = "Phone number is required.";
    }
    if (step === 2 && requiresPassword) {
      if (!form.password) nextErrors.password = "Password is required.";
      if (!form.confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
      if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }
    return nextErrors;
  };

  const handleNext = () => {
    const stepErrors = getStepErrors(currentStep);
    const firstError = Object.values(stepErrors).find(Boolean) || "";
    setFieldErrors(stepErrors);
    if (!firstError) {
      setFormError("");
      setCompletedStep((prev) => Math.max(prev, currentStep));
      setCurrentStep(prev => prev + 1);
    } else {
      setFormError(firstError);
    }
  };

  const handleBack = () => {
    setFormError("");
    setFieldErrors({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      address: "",
      state: "",
      district: "",
    });
    setCurrentStep(prev => prev - 1);
  };

  const handleEmailVerify = async () => {
    if (isOnboarding) {
      setEmailCheckStatus("available");
      setEmailCheckMessage("Email linked to your account.");
      return;
    }
    if (!form.email.trim()) {
      setEmailCheckStatus("error");
      setEmailCheckMessage("Please enter an email first.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setEmailCheckStatus("error");
      setEmailCheckMessage("Invalid email format.");
      return;
    }
    setIsCheckingEmail(true);
    setEmailCheckStatus("idle");
    setEmailCheckMessage("");
    try {
      const apiRoot = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1/web";
      const res = await getData(`${apiRoot}/auth/email-status`, { email: form.email.trim() });
      if (res?.data?.exists) {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;
    setFormError("");

    if (!form.address || !form.state || !form.district) {
      setFieldErrors((prev) => ({
        ...prev,
        address: !form.address ? "Full address is required." : "",
        state: !form.state ? "State is required." : "",
        district: !form.district ? "District is required." : "",
      }));
      setFormError("Please complete all required location fields.");
      return;
    }
    if (!isOnboarding && googleSignUp && !googleIdToken) {
      setFormError("Google sign-up token missing. Please retry Google sign-up.");
      return;
    }

    setIsLoading(true);
    try {
      const phoneParsed = parsePhoneValue({
        raw: form.phone,
        countryCode: form.phoneCountryCode,
        national: form.phoneNational,
      });

      const payload = {
        name: form.name,
        email: form.email,
        phone: phoneParsed.e164 || form.phone,
        phoneCountryCode: phoneParsed.countryCode || form.phoneCountryCode,
        phoneNational: phoneParsed.national || form.phoneNational,
        password: requiresPassword ? form.password : undefined,
        referralCode: form.referralCode ? form.referralCode.trim() : undefined,
        address: form.address,
        state: form.state,
        district: form.district,
        languageKnown: form.languageKnown,
        workingHours: [],
        joiningDate: new Date().toISOString(),
      };

      const apiRoot = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1/web";
      if (isOnboarding) {
        await postData(`${apiRoot}/auth/onboarding`, { role: "Operator", ...payload });
      } else if (googleSignUp) {
        await postData(`${apiRoot}/auth/google`, {
          idToken: googleIdToken,
          role: "Operator",
          intent: "register",
          registerPayload: payload,
        });
      } else {
        await postData(accountRoutes.operatorRegister, payload);
      }
      setIsSubmittingSuccess(true);
      showToastMessage({
        type: "success",
        message: isOnboarding ? "Onboarding completed." : "Registration submitted for approval.",
        position: "top-right",
      });
      if (isOnboarding) {
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(DRAFT_KEY);
            window.dispatchEvent(
              new CustomEvent("onboardingDraftUpdated", {
                detail: { role: "operator", completedStep: 0, currentStep: 1 },
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
          router.push("/auth/operator/register/success");
        }, 1500);
      }
    } catch (error: any) {
      setIsLoading(false);
      const rawMessage = error?.response?.data?.message || error?.message || "Registration failed. Please try again.";
      const friendlyMessage = /registry|entity 'api'|not found in registry/i.test(String(rawMessage))
        ? "Service is still syncing. Please retry in a minute."
        : rawMessage;
      setFormError(friendlyMessage);
      showToastMessage({ type: "error", message: friendlyMessage, position: "top-right" });
    }
  };


  const stepLabels = ["Profile", "Security", "Operational"];

  return (
    <AuthLayout
      title={`${isOnboarding ? "Operator Onboarding" : "Operator Registration"}`}
      subtitle={stepLabels[currentStep - 1]}
      cardMaxWidthClass={isOnboarding ? "max-w-full" : "max-w-[560px]"}
      embedded={isOnboarding}
      leftPanel={{
        headline: "OBAOL",
        highlight: "OPERATOR PORTAL",
        description: "Designed for internal operators, mediators, and individuals entering digital agro-trading.",
        tags: [
          "Individuals",
          "Portfolio Managers",
          "Digital Traders",
          "Business Developers",
          "Internal Operations",
          "Retired Custom Brokers"
        ],
        footer: "Operator_Portal_v2",
        knowMoreLink: "/roles/operator"
      }}
    >
      <div className="mb-8">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-default-100 -translate-y-1/2 z-0" />
          <motion.div
            className="absolute top-1/2 left-0 h-[2px] bg-warning-500 -translate-y-1/2 z-0"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${s <= currentStep ? "bg-warning-500 text-white" : "bg-content2 text-default-400"
                }`}
            >
              {s < currentStep ? <FiCheck /> : s}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isOnboarding && (
          <div className="flex flex-col items-center gap-3">
            {googleClientId && !googleSignUp ? (
              <div id="google-register-operator" className="w-full" />
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
          </div>
        )}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                variant="bordered"
                value={form.name}
                onValueChange={(v) => {
                  setForm({ ...form, name: v });
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                isReadOnly={googleSignUp}
                startContent={<FiUser className="text-default-400" />}
                classNames={{ inputWrapper: "rounded-xl border-default-200" }}
                isRequired
                isInvalid={!!fieldErrors.name}
                errorMessage={fieldErrors.name}
              />
              <div className="flex flex-col gap-2">
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  variant="bordered"
                  value={form.email}
                  onValueChange={(v) => {
                    setForm({ ...form, email: v });
                    setEmailCheckStatus("idle");
                    setEmailCheckMessage("");
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  isReadOnly={googleSignUp}
                  startContent={<FiMail className="text-default-400" />}
                  classNames={{ inputWrapper: "rounded-xl border-default-200" }}
                  isRequired
                  isInvalid={!!fieldErrors.email}
                  errorMessage={fieldErrors.email}
                />
                {!isOnboarding && !googleSignUp && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-default-100 text-default-600 border border-default-200"
                      isLoading={isCheckingEmail}
                      onPress={handleEmailVerify}
                    >
                      Verify Email
                    </Button>
                    {emailCheckStatus !== "idle" && (
                      <span className={`text-xs font-semibold ${emailCheckStatus === "available"
                        ? "text-success-500"
                        : emailCheckStatus === "exists"
                          ? "text-danger-500"
                          : "text-warning-500"
                        }`}>
                        {emailCheckMessage}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-default-200 p-0.5 overflow-hidden">
                <PhoneField
                  name="phone"
                  label="Phone Number"
                  value={form.phone}
                  countryCodeValue={form.phoneCountryCode}
                  nationalValue={form.phoneNational}
                  onChange={(next) => {
                    setForm({
                      ...form,
                      phone: next.e164,
                      phoneCountryCode: next.countryCode,
                      phoneNational: next.national,
                    });
                    if (fieldErrors.phone) {
                      setFieldErrors((prev) => ({ ...prev, phone: "" }));
                    }
                  }}
                  isInvalid={!!fieldErrors.phone}
                  errorMessage={fieldErrors.phone}
                />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {requiresPassword && (
                <>
                  <Input
                    label="Password"
                    placeholder="Choose a strong password"
                    variant="bordered"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onValueChange={(v) => {
                      setForm({ ...form, password: v });
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    startContent={<FiLock className="text-default-400" />}
                    classNames={{ inputWrapper: "rounded-xl border-default-200" }}
                    isRequired
                    isInvalid={!!fieldErrors.password}
                    errorMessage={fieldErrors.password}
                    endContent={
                      <Button size="sm" variant="light" isIconOnly onPress={() => setShowPassword((prev) => !prev)}>
                        <FiGlobe className={showPassword ? "text-warning-500" : "text-default-400"} />
                      </Button>
                    }
                  />
                  <Input
                    label="Confirm Password"
                    placeholder="Verify your password"
                    variant="bordered"
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onValueChange={(v) => {
                      setForm({ ...form, confirmPassword: v });
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }
                    }}
                    startContent={<FiLock className="text-default-400" />}
                    classNames={{ inputWrapper: "rounded-xl border-default-200" }}
                    isRequired
                    isInvalid={!!fieldErrors.confirmPassword}
                    errorMessage={fieldErrors.confirmPassword}
                  />
                </>
              )}
              <Input
                label="Referral Code"
                placeholder="If any (Optional)"
                variant="bordered"
                value={form.referralCode}
                onValueChange={(v) => setForm({ ...form, referralCode: v.toUpperCase() })}
                classNames={{ inputWrapper: "rounded-xl border-default-200" }}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Textarea
                label="Full Address"
                placeholder="Detailed commercial or residential address"
                variant="bordered"
                value={form.address}
                onValueChange={(v) => {
                  setForm({ ...form, address: v });
                  if (fieldErrors.address) {
                    setFieldErrors((prev) => ({ ...prev, address: "" }));
                  }
                }}
                startContent={<FiMapPin className="text-default-400 mt-1" />}
                classNames={{ inputWrapper: "rounded-xl border-default-200" }}
                isRequired
                isInvalid={!!fieldErrors.address}
                errorMessage={fieldErrors.address}
              />

              <div className="grid grid-cols-2 gap-3">
                <AutocompleteAny
                  label="State"
                  variant="bordered"
                  selectedKey={form.state || null}
                  onSelectionChange={(key: any) => {
                    setForm({ ...form, state: String(key || ""), district: "" });
                    if (fieldErrors.state || fieldErrors.district) {
                      setFieldErrors((prev) => ({ ...prev, state: "", district: "" }));
                    }
                  }}
                  isLoading={optionsLoading}
                  defaultItems={states}
                  classNames={{ base: "rounded-xl" }}
                  isInvalid={!!fieldErrors.state}
                  errorMessage={fieldErrors.state}
                >
                  {(item: any) => (
                    <AutocompleteItem key={item._id} textValue={item.name}>
                      {item.name}
                    </AutocompleteItem>
                  )}
                </AutocompleteAny>
                <AutocompleteAny
                  label="District"
                  variant="bordered"
                  selectedKey={form.district || null}
                  onSelectionChange={(key: any) => {
                    setForm({ ...form, district: String(key || "") });
                    if (fieldErrors.district) {
                      setFieldErrors((prev) => ({ ...prev, district: "" }));
                    }
                  }}
                  isLoading={optionsLoading}
                  isDisabled={!form.state}
                  defaultItems={filteredDistricts}
                  isInvalid={!!fieldErrors.district}
                  errorMessage={fieldErrors.district}
                >
                  {(item: any) => (
                    <AutocompleteItem key={item._id} textValue={item.name}>
                      {item.name}
                    </AutocompleteItem>
                  )}
                </AutocompleteAny>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-warning-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400 italic">Linguistic Profile // Languages Known</label>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {languages.map((lang: any) => {
                    const selected = form.languageKnown.includes(lang._id);
                    return (
                      <motion.div
                        key={lang._id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                      >
                        <Chip
                          variant="flat"
                          className={`h-11 px-6 cursor-pointer transition-all duration-300 border-2 rounded-2xl
                            ${selected 
                              ? "bg-warning-500/20 border-warning-500 text-warning-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]" 
                              : "bg-white/[0.03] border-white/5 text-default-400 hover:border-white/20"
                            }`}
                          startContent={
                            <AnimatePresence mode="wait">
                              {selected && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className="mr-1"
                                >
                                  <FiCheck className="stroke-[3]" size={14} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          }
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              languageKnown: selected
                                ? prev.languageKnown.filter((id) => id !== lang._id)
                                : [...prev.languageKnown, lang._id],
                            }));
                          }}
                        >
                          <span className="text-[11px] font-black uppercase tracking-widest">{lang.name}</span>
                        </Chip>
                        
                        {selected && (
                          <motion.div 
                            layoutId={`glow-${lang._id}`}
                            className="absolute inset-0 bg-warning-500/10 blur-xl rounded-2xl -z-10" 
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {formError && (
          <div className="rounded-xl border border-danger-400/40 bg-danger-500/10 px-4 py-3 text-sm font-medium text-danger-500">
            {formError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-1/3">
            <Button
              type="button"
              variant="flat"
              onPress={handleBack}
              className="w-full h-12 rounded-xl font-bold bg-default-100/50 hover:bg-default-200/80 transition-all border border-default-200"
              isDisabled={currentStep === 1 || isLoading || isSubmittingSuccess}
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
              isLoading={isLoading || isSubmittingSuccess}
              onPress={() => (currentStep === 3 ? handleSubmit() : handleNext())}
              endContent={isSubmittingSuccess ? <FiCheck /> : currentStep === 3 ? <FiCheck /> : <FiChevronRight />}
            >
              {isSubmittingSuccess
                ? "Request Received"
                : currentStep === 3
                  ? (isLoading ? "Syncing Profile..." : "Submit for Approval")
                  : "Continue Onboarding"}
            </Button>
          </motion.div>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function OperatorOnboardingForm({ mode = "auth" }: { mode?: "auth" | "onboarding" }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><FiGlobe className="animate-spin text-warning-500 text-3xl" /></div>}>
      <OperatorRegisterForm mode={mode} />
    </Suspense>
  );
}
