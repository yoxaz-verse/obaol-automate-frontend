"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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

function OperatorRegisterForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingSuccess, setIsSubmittingSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [googleSignUp, setGoogleSignUp] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
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
  const searchParams = useSearchParams();
  const referralParam = String(searchParams?.get("ref") || "").trim();

  useEffect(() => {
    if (!referralParam) return;
    setForm((prev) => (prev.referralCode ? prev : { ...prev, referralCode: referralParam.toUpperCase() }));
  }, [referralParam]);

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

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!form.name || !form.email || !form.phone) return false;
    }
    if (step === 2) {
      if (!googleSignUp) {
        if (!form.password || !form.confirmPassword) return false;
        if (form.password !== form.confirmPassword) return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setFormError("");
      setCurrentStep(prev => prev + 1);
    } else {
      setFormError("Please fill all required fields correctly.");
    }
  };

  const handleBack = () => {
    setFormError("");
    setCurrentStep(prev => prev - 1);
  };

  const handleEmailVerify = async () => {
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
      setFormError("Please complete all required location fields.");
      return;
    }
    if (googleSignUp && !googleIdToken) {
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
        password: form.password,
        referralCode: form.referralCode ? form.referralCode.trim() : undefined,
        address: form.address,
        state: form.state,
        district: form.district,
        languageKnown: form.languageKnown,
        workingHours: [],
        joiningDate: new Date().toISOString(),
      };

      if (googleSignUp) {
        const apiRoot = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1/web";
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
        message: "Registration submitted for approval.",
        position: "top-right",
      });
      setTimeout(() => {
        router.push("/auth/operator/register/success");
      }, 1500);
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error?.response?.data?.message || "Registration failed. Please try again.";
      setFormError(errorMessage);
      showToastMessage({ type: "error", message: errorMessage, position: "top-right" });
    }
  };

  const stepLabels = ["Profile", "Security", "Operational"];

  return (
    <AuthLayout
      title="Operator Onboarding"
      subtitle={stepLabels[currentStep - 1]}
      cardMaxWidthClass="max-w-[560px]"
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
        <div className="flex flex-col items-center gap-3">
          {googleClientId ? (
            <div id="google-register-operator" className="w-full" />
          ) : (
            <p className="text-xs text-warning-500">Google sign-up is not configured.</p>
          )}
          {googleSignUp && (
            <p className="text-xs text-success-500 font-semibold">
              Google sign-up active. Complete the form to finish registration.
            </p>
          )}
        </div>
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
                onValueChange={(v) => setForm({ ...form, name: v })}
                isReadOnly={googleSignUp}
                startContent={<FiUser className="text-default-400" />}
                classNames={{ inputWrapper: "rounded-xl border-default-200" }}
                isRequired
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
                  }}
                  isReadOnly={googleSignUp}
                  startContent={<FiMail className="text-default-400" />}
                  classNames={{ inputWrapper: "rounded-xl border-default-200" }}
                  isRequired
                />
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
              </div>
              <div className="rounded-xl border border-default-200 p-0.5 overflow-hidden">
                <PhoneField
                  name="phone"
                  label="Phone Number"
                  value={form.phone}
                  countryCodeValue={form.phoneCountryCode}
                  nationalValue={form.phoneNational}
                  onChange={(next) =>
                    setForm({
                      ...form,
                      phone: next.e164,
                      phoneCountryCode: next.countryCode,
                      phoneNational: next.national,
                    })
                  }
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
              {!googleSignUp && (
                <>
                  <Input
                    label="Password"
                    placeholder="Choose a strong password"
                    variant="bordered"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onValueChange={(v) => setForm({ ...form, password: v })}
                    startContent={<FiLock className="text-default-400" />}
                    classNames={{ inputWrapper: "rounded-xl border-default-200" }}
                    isRequired
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
                    onValueChange={(v) => setForm({ ...form, confirmPassword: v })}
                    startContent={<FiLock className="text-default-400" />}
                    classNames={{ inputWrapper: "rounded-xl border-default-200" }}
                    isRequired
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
                onValueChange={(v) => setForm({ ...form, address: v })}
                startContent={<FiMapPin className="text-default-400 mt-1" />}
                classNames={{ inputWrapper: "rounded-xl border-default-200" }}
                isRequired
              />

              <div className="grid grid-cols-2 gap-3">
                <AutocompleteAny
                  label="State"
                  variant="bordered"
                  selectedKey={form.state || null}
                  onSelectionChange={(key: any) =>
                    setForm({ ...form, state: String(key || ""), district: "" })
                  }
                  isLoading={optionsLoading}
                  defaultItems={states}
                  classNames={{ base: "rounded-xl" }}
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
                  onSelectionChange={(key: any) =>
                    setForm({ ...form, district: String(key || "") })
                  }
                  isLoading={optionsLoading}
                  isDisabled={!form.state}
                  defaultItems={filteredDistricts}
                >
                  {(item: any) => (
                    <AutocompleteItem key={item._id} textValue={item.name}>
                      {item.name}
                    </AutocompleteItem>
                  )}
                </AutocompleteAny>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-default-400">Languages Known</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang: any) => {
                    const selected = form.languageKnown.includes(lang._id);
                    return (
                      <Chip
                        key={lang._id}
                        variant={selected ? "solid" : "bordered"}
                        color={selected ? "warning" : "default"}
                        className="cursor-pointer transition-all border-default-200"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            languageKnown: selected
                              ? prev.languageKnown.filter((id) => id !== lang._id)
                              : [...prev.languageKnown, lang._id],
                          }));
                        }}
                      >
                        {lang.name}
                      </Chip>
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

export default function OperatorRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><FiGlobe className="animate-spin text-warning-500 text-3xl" /></div>}>
      <OperatorRegisterForm />
    </Suspense>
  );
}
