"use client";

import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { showToastMessage, useEmailValidation } from "../../utils/utils";
import {
  Button,
  Input,
} from "@nextui-org/react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { FiAlertCircle, FiArrowRight, FiBriefcase, FiCheck, FiInfo, FiKey, FiUsers } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import AuthContext from "@/context/AuthContext";
import AuthLayout from "../Auth/AuthLayout";
import BrandedLoader from "@/components/ui/BrandedLoader";
import { useSoundEffect } from "@/context/SoundContext";
import { postData } from "@/core/api/apiHandler";
import { baseUrl } from "@/core/api/axiosInstance";
import { clearGoogleButton, loadGoogleGsi, renderGoogleButton } from "@/utils/googleGsi";
import { browserSupportsWebAuthn, startAuthentication } from "@simplewebauthn/browser";


interface ILoginProps {
  role: string;
  mode?: "login" | "signup";
}

type LoginCooldownState = {
  lockedUntil: number;
  retryAfterSeconds: number;
  failedAttempts: number;
  maxAttempts: number;
};

const LoginComponent = ({ role, mode = "login" }: ILoginProps) => {
  const BLOCKED_ACCOUNT_COPY = "This account is banned/blocked from OBAOL backend. Access is disabled.";
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFoundEmail, setNotFoundEmail] = useState("");
  const [showNotFoundCta, setShowNotFoundCta] = useState(false);
  const isInvalidEmail = useEmailValidation(email);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpAttempted, setOtpAttempted] = useState(false);
  const [hasOnboardingSession, setHasOnboardingSession] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState(Date.now());
  const [passwordCooldown, setPasswordCooldown] = useState<LoginCooldownState | null>(null);
  const [passkeySupport, setPasskeySupport] = useState<"checking" | "supported" | "unsupported">("checking");
  const [passkeyLoginStatus, setPasskeyLoginStatus] = useState<"idle" | "loading">("idle");

  const normalizeSignupError = (message: string) => {
    const raw = String(message || "");
    const lower = raw.toLowerCase();
    if (lower.includes("banned/blocked from obaol backend") || lower.includes("blocked from obaol backend") || lower.includes("status\":\"blocked\"") || lower.includes("status: blocked")) {
      return BLOCKED_ACCOUNT_COPY;
    }
    if (lower.includes("blocked") || lower.includes("banned")) {
      return BLOCKED_ACCOUNT_COPY;
    }
    if (lower.includes("invalid email") || lower.includes("invalid email address")) {
      return "Invalid email address.";
    }
    if (lower.includes("status code 400") && lower.includes("email")) {
      return "Invalid email address.";
    }
    if (lower.includes("session cookie") || lower.includes("cookie blocked")) {
      return "Session cookie blocked. Allow cookies for the API domain and retry.";
    }
    return raw || "Unable to send OTP. Please try again.";
  };
  const [signupMethod, setSignupMethod] = useState<"email" | "google">("email");
  const [loginStatus, setLoginStatus] = useState<"idle" | "success" | "error">("idle");
  const registerRouteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { play } = useSoundEffect();
  const roleLower = String(role || "").toLowerCase();
  const authMode = mode;

  const inputClasses = {
    label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-400 mb-2 ml-1",
    inputWrapper: "bg-content1 dark:bg-white/[0.03] border-divider hover:border-obaol-500/50 transition-all h-12 rounded-2xl shadow-sm",
    input: "font-medium text-sm text-foreground placeholder:text-default-300",
    base: "mb-2"
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading, login, loginWithGoogle, user, refreshUser } = useContext(AuthContext);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleRenderError, setGoogleRenderError] = useState("");
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    return () => {
      if (registerRouteTimeoutRef.current) {
        clearTimeout(registerRouteTimeoutRef.current);
        registerRouteTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (authMode !== "login") return;
    const prefill = String(searchParams?.get("prefill") || "").trim();
    if (!prefill) return;
    setEmail((prev) => (prev ? prev : prefill));
  }, [authMode, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined" || authMode !== "login") return;
    const checkPasskeySupport = async () => {
      if (!("PublicKeyCredential" in window) || !navigator.credentials) {
        setPasskeySupport("unsupported");
        return;
      }
      try {
        setPasskeySupport(browserSupportsWebAuthn() ? "supported" : "unsupported");
      } catch {
        setPasskeySupport("unsupported");
      }
    };
    checkPasskeySupport();
  }, [authMode]);

  useEffect(() => {
    if (!otpSent || otpVerified) return;
    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent, otpVerified]);

  useEffect(() => {
    if (!passwordCooldown) return;
    const timer = setInterval(() => {
      const nextNow = Date.now();
      setNowTs(nextNow);
      if (passwordCooldown.lockedUntil <= nextNow) {
        setPasswordCooldown(null);
        setErrorMessage("");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [passwordCooldown]);

  const handleGoogleCredential = useCallback(async (resp: { credential?: string }) => {
    try {
      if (!resp?.credential) throw new Error("Google credential not returned.");
      setIsLoading(true);
      const roleValue = roleLower === "team" ? "Operator" : roleLower === "operator" ? "Operator" : "Associate";
      if (authMode === "signup") {
        setSignupMethod("google");
        setErrorMessage("");
        await postData("/auth/google", {
          idToken: resp.credential,
          role: roleValue,
          intent: "register",
        });
        const refreshed = await refreshUser();
        if (!refreshed) {
          throw new Error("Session cookie blocked. Allow cookies for the API domain and retry.");
        }
        setLoginStatus("success");
        setIsRedirecting(true);
        const tradeIntent = String(searchParams?.get("intent") || "").toUpperCase();
        const onboardingQuery = new URLSearchParams({ auth: "google" });
        if (["BUY", "SELL", "BOTH", "SERVICE"].includes(tradeIntent)) onboardingQuery.set("intent", tradeIntent);
        router.push(`/dashboard/onboarding?${onboardingQuery.toString()}`);
      } else {
        await loginWithGoogle({
          idToken: resp.credential,
          role: roleValue,
          rememberMe,
        });
        setLoginStatus("success");
        setIsRedirecting(true);
      }
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message || error?.message || "Google login failed.";
      const status = error?.response?.status ? ` (HTTP ${error.response.status})` : "";
      const isNetwork = error?.message === "Network Error" || error?.code === "ERR_NETWORK";
      const networkHint = isNetwork
        ? `Google signup failed: Network error contacting ${baseUrl}/auth/google. Ensure backend is running and CORS/cookies allow ${baseUrl}.`
        : null;
      const message =
        authMode === "signup"
          ? networkHint || `Google signup failed: ${rawMessage}${status}`
          : rawMessage;
      setErrorMessage(message);
      setLoginStatus("error");
      showToastMessage({ type: "error", message, position: "top-right" });
    } finally {
      setIsLoading(false);
    }
  }, [authMode, loginWithGoogle, rememberMe, refreshUser, roleLower, router, searchParams]);

  useEffect(() => {
    if (authMode === "signup") {
      return;
    }
    if (!loading && isAuthenticated) {
      if (passkeySupport === "checking") {
        setIsRedirecting(true);
        return;
      }
      const authRoleLower = String(user?.role || "").toLowerCase();
      const registrationStatus = String(user?.registrationStatus || "APPROVED").toUpperCase();
      const isOperatorFamily = authRoleLower === "operator" || authRoleLower === "team";
      const isAssociate = authRoleLower === "associate";
      const profileComplete = Boolean(user?.name && user?.email && user?.phone);
      const hasAssociateCompany = Boolean(user?.associateCompanyId);
      const canBypassAssociateOnboarding = isAssociate && profileComplete && hasAssociateCompany;
      const requiresOnboarding = (isOperatorFamily && user?.onboardingComplete === false)
        || (isAssociate && user?.onboardingComplete === false && !canBypassAssociateOnboarding);
      const isPendingApproval = ["associate", "operator", "team"].includes(authRoleLower)
        && user?.onboardingComplete === true
        && registrationStatus !== "APPROVED";
      const targetRoute = requiresOnboarding
        ? "/dashboard/onboarding"
        : isPendingApproval
          ? "/dashboard/pending-approval"
          : "/dashboard";
      if (authRoleLower === "associate" && user?.associateCompanyId && user?.companyInterestsConfigured === false) {
        showToastMessage({
          type: "warning",
          message: "Company interests are not configured. Update them from My Company for execution matching.",
          position: "top-right",
        });
      }
      setIsRedirecting(true);
      router.push(targetRoute);
    }
  }, [authMode, isAuthenticated, loading, router, user]);

  useEffect(() => {
    if (roleLower !== "associate" && roleLower !== "operator" && roleLower !== "team") return;
    if (!googleClientId || typeof window === "undefined") return;
    loadGoogleGsi()
      .then(() => setGoogleReady(true))
      .catch(() => setGoogleRenderError("Google sign-in is temporarily unavailable."));
  }, [roleLower, googleClientId]);

  useEffect(() => {
    if (!googleReady) return;
    if (roleLower !== "associate" && roleLower !== "operator" && roleLower !== "team") return;
    const containerId = authMode === "signup" ? `google-signup-${roleLower}` : `google-login-${roleLower}`;

    let mounted = true;
    const doRender = async () => {
      try {
        await renderGoogleButton({
          containerId,
          clientId: googleClientId,
          width: 340,
          maxRetries: 7,
          retryDelayMs: 120,
          callback: handleGoogleCredential,
        });
        if (mounted) setGoogleRenderError("");
      } catch {
        if (mounted) setGoogleRenderError("Google sign-in failed to load. Please reload it.");
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
  }, [googleReady, role, googleClientId, authMode, roleLower, handleGoogleCredential]);

  const handleGoogleReload = async () => {
    const containerId = authMode === "signup" ? `google-signup-${roleLower}` : `google-login-${roleLower}`;
    clearGoogleButton(containerId);
    try {
      await renderGoogleButton({
        containerId,
        clientId: googleClientId,
        width: 340,
        maxRetries: 8,
        retryDelayMs: 140,
        callback: handleGoogleCredential,
      });
      setGoogleRenderError("");
    } catch {
      setGoogleRenderError("Google sign-in failed to load. Please try again.");
    }
  };

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    if (passwordCooldown && passwordCooldown.lockedUntil > Date.now()) {
      setErrorMessage(`Too many incorrect password attempts. Try again in ${formatCountdown(passwordCooldown.lockedUntil - Date.now())}.`);
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    if (authMode === "signup") {
      setIsLoading(false);
      return;
    }

    if (!email || !password) {
      setIsLoading(false);
      setErrorMessage("Email and password are required.");
      return;
    }

    const data = {
      email: email,
      password: password,
      role: role,
      rememberMe: rememberMe,
    };

    try {
      await login(data);

      if (rememberMe) {
        localStorage.setItem(
          "rememberMeTime",
          JSON.stringify(new Date().getTime() + 10 * 24 * 60 * 60 * 1000)
        );
      }

      play("success");
      setLoginStatus("success");
      setIsRedirecting(true);
      showToastMessage({
        type: "success",
        message: "Login Successful",
        position: "top-right",
      });
    } catch (error: any) {
      setIsLoading(false);
      setLoginStatus("error");
      console.error("Login Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code
      });

      const backendData = error?.response?.data;
      if (backendData?.code === "LOGIN_COOLDOWN") {
        const lockedAt = Date.parse(String(backendData.lockedUntil || ""));
        const retryAfterSeconds = Number(backendData.retryAfterSeconds || 120);
        const lockedUntil = Number.isFinite(lockedAt)
          ? lockedAt
          : Date.now() + retryAfterSeconds * 1000;
        setPasswordCooldown({
          lockedUntil,
          retryAfterSeconds,
          failedAttempts: Number(backendData.failedAttempts || 5),
          maxAttempts: Number(backendData.maxAttempts || 5),
        });
        const message = `Too many incorrect password attempts. Try again in ${formatCountdown(lockedUntil - Date.now())}.`;
        setErrorMessage(message);
        showToastMessage({ type: "error", message, position: "top-right" });
        play("danger");
        return;
      }

      const rawMessage = String(backendData?.message || error?.message || "").toLowerCase();
      const isNotFound = rawMessage.includes("not found")
        || rawMessage.includes("not registered")
        || rawMessage.includes("no account")
        || rawMessage.includes("does not exist")
        || Number(error?.response?.status) === 404;

      if (isNotFound) {
        setErrorMessage("Account not found. Create a new account.");
        setNotFoundEmail(email.trim());
        setShowNotFoundCta(true);
        return;
      }

      const apiErrorMessage = error?.code === "SESSION_COOKIE_BLOCKED"
        ? "Session cookie was blocked by browser privacy settings. Lower your shields for obaol.com and retry."
        : error.message === "Network Error" || error.code === "ERR_NETWORK"
          ? "Connection refused. Please check your internet or retry later."
          : (backendData?.status === "blocked" || backendData?.status === "rejected" || backendData?.isRejected || String(backendData?.message).toLowerCase().includes("rejected") || String(backendData?.message).toLowerCase().includes("blocked"))
            ? BLOCKED_ACCOUNT_COPY
            : (backendData?.message || "Invalid credentials. Please verify your email/password.");

      setErrorMessage(apiErrorMessage);

      showToastMessage({
        type: "error",
        message: apiErrorMessage,
        position: "top-right",
      });
      play("danger");
    }
  };

  const handleCreateAccount = () => {
    if (isLoading) return;
    const target = roleLower === "operator" || roleLower === "team"
      ? "/auth/operator/register"
      : "/auth/register";
    const intent = String(searchParams?.get("intent") || "").toUpperCase();
    router.push(intent && target === "/auth/register" ? `${target}?intent=${encodeURIComponent(intent)}` : target);
  };

  const handlePasskeyLogin = async () => {
    if (passkeyLoginStatus === "loading" || isLoading) return;
    if (!email.trim()) {
      setErrorMessage("Enter your email before passkey sign-in.");
      return;
    }
    if (passkeySupport !== "supported") {
      setErrorMessage("Passkeys are not available on this browser.");
      return;
    }
    setPasskeyLoginStatus("loading");
    setErrorMessage("");
    try {
      const optionsResponse = await postData("/auth/passkeys/authentication/options", {
        email: email.trim(),
        role,
      });
      const credential = await startAuthentication({ optionsJSON: optionsResponse.data.options });
      await postData("/auth/passkeys/authentication/verify", {
        email: email.trim(),
        role,
        response: credential,
        rememberMe,
      });
      const refreshed = await refreshUser();
      if (!refreshed) throw new Error("Session cookie blocked. Allow cookies for obaol.com/api.obaol.com and retry.");
      setLoginStatus("success");
      setIsRedirecting(true);
      play("success");
      showToastMessage({ type: "success", message: "Passkey sign-in successful", position: "top-right" });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Passkey sign-in failed.";
      setErrorMessage(message);
      setLoginStatus("error");
      showToastMessage({ type: "error", message, position: "top-right" });
      play("danger");
    } finally {
      setPasskeyLoginStatus("idle");
    }
  };

  const handleSendOtp = async () => {
    setOtpAttempted(true);
    if (!email.trim()) {
      setErrorMessage("Please enter your email first.");
      return;
    }
    if (!isInvalidEmail) {
      setErrorMessage("Please enter a valid email.");
      return;
    }
    setIsSendingOtp(true);
    try {
      setErrorMessage("");
      if (!hasOnboardingSession) {
        try {
          const payload = {
            email: email.trim(),
            role: roleLower === "operator" || roleLower === "team" ? "Operator" : "Associate",
          };
          await postData("/auth/onboarding/start", payload);
          const refreshed = await refreshUser();
          if (!refreshed) {
            throw new Error("Session cookie was blocked. Allow cookies for the API domain and retry.");
          }
          setHasOnboardingSession(true);
        } catch (startError: any) {
          const status = Number(startError?.response?.status || 0);
          if (status === 409) {
            const existingRole = String(startError?.response?.data?.role || "").toLowerCase();
            const target = existingRole === "operator"
              ? "/auth/operator"
              : existingRole === "associate"
                ? "/auth/associate"
                : "/auth?view=signin";
            const separator = target.includes("?") ? "&" : "?";
            router.push(`${target}${separator}prefill=${encodeURIComponent(email.trim())}`);
            return;
          } else {
            throw startError;
          }
        }
      }
      await postData("/verification/send-otp", { method: "email", email: email.trim() }, {});
      showToastMessage({ type: "success", message: "OTP sent to your email.", position: "top-right" });
      setOtpSent(true);
      setOtp("");
      setOtpVerified(false);
      const now = Date.now();
      setOtpExpiresAt(now + 3 * 60 * 1000);
      setResendAvailableAt(now + 2 * 60 * 1000);
    } catch (err: any) {
      const rawMessage = err?.response?.data?.message || err?.message || "Failed to send OTP.";
      const message = normalizeSignupError(rawMessage);
      setErrorMessage(message);
      showToastMessage({ type: "error", message, position: "top-right" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (isSendingOtp) return;
    await handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setErrorMessage("Enter the 6-digit OTP.");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await postData("/verification/verify-otp", { code: otp, method: "email", email: email.trim() }, {});
      setOtpVerified(true);
      showToastMessage({ type: "success", message: "Email verified.", position: "top-right" });
    } catch (err: any) {
      const rawMessage = err?.response?.data?.message || err?.message || "OTP verification failed.";
      const message = normalizeSignupError(rawMessage);
      setErrorMessage(message);
      showToastMessage({ type: "error", message, position: "top-right" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleCreateAccountInline = async () => {
    if (isCreatingAccount || isLoading) return;
    const targetEmail = (notFoundEmail || email).trim();
    if (!targetEmail) {
      setErrorMessage("Please enter a valid email to create your account.");
      return;
    }
    if (!otpVerified) {
      setErrorMessage("Please verify your email with OTP before continuing.");
      return;
    }
    setIsCreatingAccount(true);
    try {
      const refreshed = await refreshUser();
      if (!refreshed) {
        throw new Error("Session cookie blocked. Allow cookies for the API domain and retry.");
      }
      setIsRedirecting(true);
      router.push("/dashboard/onboarding?auth=email");
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Could not create account. Please try again.";
      setErrorMessage(message);
      showToastMessage({ type: "error", message, position: "top-right" });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const roleContent: Record<string, any> = {
    admin: {
      headline: "OBAOL",
      highlight: "ADMINISTRATION",
      description: "Centralized control for entire supply chain operations and system management.",
      points: [
        "User & Role Management",
        "System Health Monitoring",
        "Global Configuration",
        "Security & Audit Logs"
      ],
      footer: "Admin_Console_v3.2"
    },
    associate: {
      headline: "OBAOL",
      highlight: "ASSOCIATE ACCOUNT",
      description: "For companies and business accounts using OBAOL.",
      tags: [
        "Buyer",
        "Seller",
        "Supplier",
        "Importer",
        "Exporter",
        "Logistics",
        "Warehouse",
        "Lab",
        "Company Required"
      ],
      footer: "Business account",
      knowMoreLink: "/roles/associate"
    },
    operator: {
      headline: "OBAOL",
      highlight: "OPERATOR ACCESS",
      description: "For OBAOL-approved people who operate or coordinate business execution.",
      tags: [
        "OBAOL Approved",
        "Execution Coordinator",
        "Operator Workspace",
        "Not a Company Account"
      ],
      footer: "Operator access",
      knowMoreLink: "/roles/operator"
    },
    "project manager": {
      headline: "OBAOL",
      highlight: "PROJECT OPERATIONS",
      description: "Oversee project lifecycles, resource allocation, and timeline management in real-time.",
      points: [
        "Real-time Resource Tracking",
        "Milestone & Deadline Monitor",
        "Budget & Cost Analytics",
        "Cross-team Sync"
      ],
      footer: "Project_Manager_Console"
    },
    "activity manager": {
      headline: "OBAOL",
      highlight: "FIELD ACTIVITY",
      description: "Manage field operations, warehouse logistics, and coordination activities seamlessly.",
      points: [
        "Logistics & Transit Tracking",
        "Warehouse Activity Logs",
        "Field Agent Coordination",
        "Quality Verification"
      ],
      footer: "Field_Ops_Manager"
    },
    worker: {
      headline: "OBAOL",
      highlight: "FIELD MOBILE",
      description: "Simplified interface for logging work progress and receiving on-site instructions.",
      points: [
        "Instant Task Assignments",
        "Simple Work Progress Logging",
        "Safety & Notification Alerts",
        "Site Check-in/Check-out"
      ],
      footer: "Field_Worker_Service"
    }
  };

  const roleKey = roleLower === "operator" || roleLower === "team" ? "operator" : roleLower;
  const currentRoleContent = roleContent[roleKey] || null;
  const roleIdentity = (roleKey === "operator" || roleKey === "associate")
    ? (roleKey === "operator"
      ? {
      roleKey: "operator" as const,
      panelLabel: "Operator Access",
      motifClassName: "bg-[linear-gradient(to_bottom,rgba(16,185,129,0.22),rgba(2,6,23,0.6))]",
      highlightClassName: "bg-gradient-to-r from-emerald-400 to-cyan-500",
      audienceLabels: ["OBAOL-approved people", "Execution coordinators", "Operator workspace"],
      infoStripTitle: "Operator",
      infoStripMessage: "For OBAOL-approved people, not companies.",
      infoStripIcon: FiBriefcase,
      switchLabel: "Company or business? Use Associate",
      switchSubLabel: "Wrong account type?",
    }
      : {
      roleKey: "associate" as const,
      panelLabel: "Associate Account",
      motifClassName: "bg-[linear-gradient(to_bottom,rgba(207,152,60,0.2),rgba(9,8,6,0.7))]",
      highlightClassName: "bg-gradient-to-r from-obaol-200 via-obaol-400 to-obaol-600",
      audienceLabels: ["Companies", "Buyers", "Sellers", "Suppliers", "Exporters", "Logistics"],
      infoStripTitle: "Associate",
      infoStripMessage: "For companies and business accounts.",
      infoStripIcon: FiUsers,
      switchLabel: "Operator access only",
      switchSubLabel: "OBAOL-approved?",
    })
    : null;

  if (isRedirecting) {
    return <BrandedLoader fullScreen message="Signing you in" variant="compact" />;
  }

  const joinCta = roleKey === "operator"
    ? {
      title: "OBAOL-approved operator?",
      description: "Create an operator account only if this role applies to you.",
    }
    : {
      title: "New business account?",
      description: "Create an Associate account for your company.",
    };

  const canSendOtp = !!email.trim() && isInvalidEmail;
  const otpExpiryRemaining = Math.max(0, (otpExpiresAt || 0) - nowTs);
  const resendRemaining = Math.max(0, (resendAvailableAt || 0) - nowTs);
  const passwordCooldownRemaining = Math.max(0, (passwordCooldown?.lockedUntil || 0) - nowTs);
  const isPasswordCooldownActive = authMode === "login" && passwordCooldownRemaining > 0;
  const isPreparingSession = authMode === "login" && loading;

  return (
    <AuthLayout
      title={authMode === "signup" ? `${role} — Create Account` : role}
      subtitle={authMode === "signup" ? "Create Account" : "Login"}
      cardMaxWidthClass={authMode === "signup" && roleKey === "operator" ? "max-w-[560px]" : undefined}
      leftPanel={currentRoleContent}
      roleIdentity={roleIdentity || undefined}
      topContent={
        !isAuthenticated && authMode !== "signup" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group/banner relative flex cursor-pointer flex-col items-start justify-between gap-4 overflow-hidden rounded-xl border border-obaol-500/10 bg-obaol-500/5 p-4 transition-all duration-300 hover:bg-obaol-500/10 sm:flex-row sm:items-center"
            onClick={handleCreateAccount}
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-obaol-700 dark:text-obaol-300">{joinCta.title}</span>
              <span className="text-sm font-medium text-foreground/80 leading-snug">{joinCta.description}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-obaol-700 transition-transform duration-300 group-hover/banner:translate-x-1 dark:text-obaol-300">
              <>
                Join Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            </div>
            {/* Ambient shine */}
            <div className="absolute inset-0 -translate-x-full group-hover/banner:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out skew-x-12" />
          </motion.div>
        )
      }
    >
      <form
        className="w-full flex flex-col gap-4"
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (authMode === "signup" && e.key === "Enter") {
            e.preventDefault();
          }
        }}
      >
        {roleIdentity && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center shrink-0">
              <roleIdentity.infoStripIcon className="text-xs text-foreground/75" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-foreground/50">
                {roleIdentity.infoStripTitle}
              </p>
              <p className="text-[11px] font-semibold text-foreground/75 leading-tight">
                {isPreparingSession ? "Preparing sign in..." : roleIdentity.infoStripMessage}
              </p>
            </div>
          </div>
        )}

        {authMode === "signup" && roleKey === "operator" && (
          <div className="rounded-xl border border-obaol-500/20 bg-obaol-500/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obaol-700 dark:text-obaol-300">
                Registering a company?
              </p>
              <Link
                href="/auth/register"
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-obaol-500 px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.12em] text-obaol-950 transition hover:bg-obaol-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-obaol-400"
              >
                Register as Associate
              </Link>
            </div>
            <p className="mt-3 max-w-[58ch] text-xs font-semibold leading-5 text-foreground/70">
              Buyers, sellers, suppliers, importers, exporters, warehouses, labs, and logistics businesses should create an Associate company account. Operator accounts are for independent people coordinating trades.
            </p>
          </div>
        )}


        {/* Highlighted Error Message for Signup/Login */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`p-4 rounded-2xl border flex flex-col gap-3 shadow-xl relative overflow-hidden group mb-2 ${
              errorMessage.toLowerCase().includes("already exist")
                ? "bg-warning-500/10 border-warning-500/20 text-warning-700 dark:text-warning-400"
                : "bg-danger-500/10 border-danger-500/20 text-danger-700 dark:text-danger-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                errorMessage.toLowerCase().includes("already exist") ? "bg-warning-500/20" : "bg-danger-500/20"
              }`}>
                <FiAlertCircle className="text-lg" />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                   {errorMessage.toLowerCase().includes("already exist") ? "Notice" : "Error"}
                </span>
                <p className="text-sm font-bold leading-relaxed">
                  {errorMessage.replace(/sign in\.?$/i, "")}
                </p>
                {isPasswordCooldownActive && (
                  <p className="text-xs font-semibold leading-relaxed opacity-80">
                    Password sign-in is cooling down for {formatCountdown(passwordCooldownRemaining)}. Google sign-in is still available.
                  </p>
                )}
              </div>
            </div>

            {errorMessage.toLowerCase().includes("already exist") && (
              <div className="flex items-center gap-3 pl-11">
                <Button
                  size="sm"
                  radius="lg"
                  className="bg-warning-500 text-black font-black uppercase text-[10px] tracking-widest px-6 h-8"
                  onPress={() => {
                    const authRole = roleLower === "team" || roleLower === "operator" ? "operator" : "associate";
                    const target = authRole === "operator" ? "/auth/operator" : "/auth/associate";
                    router.push(target);
                  }}
                >
                  Sign In Now
                </Button>
              </div>
            )}
            
            {showNotFoundCta && authMode === "login" && (
              <div className="flex items-center gap-3 pl-11">
                <Button
                  size="sm"
                  radius="lg"
                  className="bg-warning-500 text-black font-black uppercase text-[10px] tracking-widest px-6 h-8"
                  onPress={handleCreateAccount}
                >
                  Create account
                </Button>
              </div>
            )}

            {/* Ambient Background Pulse */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full opacity-10 -mr-16 -mt-16 animate-pulse ${
               errorMessage.toLowerCase().includes("already exist") ? "bg-warning-500" : "bg-danger-500"
            }`} />
          </motion.div>
        )}

        <Input
          value={email}
          className="w-full"
          type="email"
          autoComplete="username webauthn"
          variant="bordered"
          label="Email Address"
          labelPlacement="outside"
          isDisabled={isPreparingSession || (authMode === "signup" && otpSent)}
          isInvalid={authMode === "signup"
            ? (otpAttempted && (!email.trim() || !isInvalidEmail))
            : (!isInvalidEmail && email.length > 0)}
          errorMessage={authMode === "signup"
            ? (otpAttempted && !email.trim()
              ? "Email is required"
              : otpAttempted && !isInvalidEmail
                ? "Enter a valid email address"
                : "")
            : (!isInvalidEmail && email.length > 0 ? "Enter a valid email address" : "")}
          isRequired
          placeholder="name@example.com"
          onValueChange={(val) => {
            setEmail(val);
            setNotFoundEmail("");
            setShowNotFoundCta(false);
            setHasOnboardingSession(false);
            setOtpSent(false);
            setOtpVerified(false);
            setOtp("");
            setPasswordCooldown(null);
            if (errorMessage) setErrorMessage("");
            if (loginStatus !== "idle") setLoginStatus("idle");
          }}
          classNames={inputClasses}
        />

        {authMode === "login" && (
          <Input
            value={password}
            className="w-full"
            label="Password"
            labelPlacement="outside"
            placeholder="Enter your password"
            variant="bordered"
            isRequired
            isDisabled={isPreparingSession || isPasswordCooldownActive}
            isInvalid={false}
            errorMessage={""}
            endContent={
              <button className="p-1 transition-colors hover:text-obaol-700 focus:outline-none dark:hover:text-obaol-300" type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <IoEye className="text-xl opacity-60 pointer-events-none" />
                ) : (
                  <IoEyeOff className="text-xl opacity-60 pointer-events-none" />
                )}
              </button>
            }
            type={isVisible ? "text" : "password"}
            autoComplete="current-password"
            onValueChange={(val) => {
              setPassword(val);
              if (loginStatus !== "idle") setLoginStatus("idle");
            }}
            classNames={inputClasses}
          />
        )}

        {authMode === "login" && (
          <div className="flex w-full flex-wrap items-center justify-between gap-3 px-2">
            <label className="group inline-flex cursor-pointer items-center gap-3 rounded-xl py-1 pr-2">
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isPreparingSession}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 items-center justify-center rounded-md border border-white/15 bg-white/[0.03] text-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 group-hover:border-obaol-400/60 group-hover:bg-obaol-500/10 peer-checked:border-obaol-400 peer-checked:bg-gradient-to-br peer-checked:from-obaol-300 peer-checked:to-obaol-600 peer-checked:text-obaol-950 peer-focus-visible:ring-2 peer-focus-visible:ring-obaol-400/70 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background dark:border-white/20 dark:bg-white/[0.04]"
                >
                  <FiCheck className="h-3.5 w-3.5 stroke-[3.5]" />
                </span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400 transition-colors group-hover:text-foreground">
                Remember me
              </span>
            </label>
            <button
              type="button"
              disabled={isPreparingSession}
              onClick={() => router.push(`/auth/forgot-password?role=${roleLower === 'operator' || roleLower === 'team' ? 'Operator' : 'Associate'}`)}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-obaol-700 underline decoration-obaol-500/20 underline-offset-4 transition-all hover:scale-105 hover:text-obaol-600 disabled:pointer-events-none disabled:opacity-50 dark:text-obaol-300 dark:hover:text-obaol-200"
            >
              Forgot password?
            </button>
          </div>
        )}



        {authMode === "login" && (
          <motion.div
            className="mt-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              className={`h-14 w-full rounded-2xl font-bold uppercase tracking-[0.2em] shadow-xl transition-all duration-500 ${
                loginStatus === "success" 
                  ? "bg-success-500 shadow-success-500/10" 
                  : loginStatus === "error"
                    ? "bg-danger-500 shadow-danger-500/10"
                    : "bg-gradient-to-r from-obaol-400 to-obaol-600 text-obaol-950 shadow-obaol-500/10"
              }`}
              color="warning"
              size="lg"
              radius="lg"
              isLoading={isLoading || isPreparingSession}
              isDisabled={isPreparingSession || isPasswordCooldownActive}
            >
              {loginStatus === "success"
                ? "Signed In"
                : isPasswordCooldownActive
                  ? `Retry in ${formatCountdown(passwordCooldownRemaining)}`
                : loginStatus === "error"
                  ? "Sign In"
                  : isLoading
                    ? "Signing in..."
                    : isPreparingSession
                      ? "Preparing..."
                    : "Sign In"}
            </Button>
          </motion.div>
        )}

        {authMode === "login" && (
          <Button
            type="button"
            variant="flat"
            radius="lg"
            className="h-12 w-full rounded-2xl border border-obaol-500/20 bg-obaol-500/10 text-xs font-black uppercase tracking-[0.16em] text-obaol-700 dark:text-obaol-300"
            startContent={<FiKey />}
            isLoading={passkeyLoginStatus === "loading"}
            isDisabled={passkeySupport !== "supported" || isPreparingSession || passkeyLoginStatus === "loading"}
            onPress={handlePasskeyLogin}
          >
            Sign in with passkey
          </Button>
        )}

        {authMode === "signup" && (
          <div className="w-full flex flex-col gap-5">
            {!otpSent ? (
              <>
                <Button
                  className="h-12 w-full rounded-2xl bg-obaol-500 font-bold uppercase tracking-[0.2em] text-obaol-950 shadow-xl shadow-obaol-500/20 transition-all hover:scale-[1.02] hover:bg-obaol-400 active:scale-[0.98]"
                  color="warning"
                  size="md"
                  radius="lg"
                  isLoading={isSendingOtp}
                  isDisabled={!canSendOtp}
                  onPress={handleSendOtp}
                >
                  {"Send OTP"}
                </Button>
                {!canSendOtp && (
                  <p className="text-[10px] font-semibold text-foreground/50 text-center">
                    Enter a valid email to continue.
                  </p>
                )}
              </>
            ) : (
              <>
                <Input
                  value={otp}
                  className="w-full"
                  type="text"
                  variant="bordered"
                  label="Email OTP"
                  labelPlacement="outside"
                  isRequired
                  placeholder="000 000"
                  onValueChange={(val) => {
                    const clean = val.replace(/\D/g, "").slice(0, 6);
                    setOtp(clean);
                  }}
                  classNames={inputClasses}
                />
                <div className="flex flex-col items-center gap-1 text-[11px] font-semibold text-foreground/60">
                  <span>Code expires in {formatCountdown(otpExpiryRemaining)}</span>
                  {resendRemaining <= 0 && (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-obaol-700 transition-colors hover:text-obaol-600 dark:text-obaol-300 dark:hover:text-obaol-200"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                <div className="w-full flex flex-col gap-4">
                  {!otpVerified ? (
                    <Button
                      className="h-12 w-full rounded-2xl bg-obaol-500 font-bold uppercase tracking-[0.2em] text-obaol-950 shadow-xl shadow-obaol-500/20 transition-all hover:scale-[1.02] hover:bg-obaol-400 active:scale-[0.98]"
                      color="warning"
                      size="lg"
                      radius="lg"
                      isLoading={isVerifyingOtp}
                      onPress={handleVerifyOtp}
                    >
                      Verify OTP
                    </Button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-3 py-4 rounded-xl bg-success-500/10 border border-success-500/20 text-success-600 dark:text-success-400 font-black uppercase text-[11px] tracking-[0.2em] shadow-inner"
                    >
                      <div className="w-5 h-5 rounded-full bg-success-500 text-white flex items-center justify-center shadow-lg shadow-success-500/40">
                        <FiCheck size={12} strokeWidth={4} />
                      </div>
                      OTP Verified
                    </motion.div>
                  )}

                  {otpVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full"
                    >
                      <Button
                        className="w-full font-bold h-12 bg-gradient-to-r from-success-500 to-green-600 shadow-xl shadow-success-500/20"
                        color="success"
                        size="lg"
                        radius="lg"
                        isLoading={isCreatingAccount}
                        onPress={handleCreateAccountInline}
                      >
                        Continue to Onboarding
                      </Button>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {(roleLower === "associate" || roleLower === "operator" || roleLower === "team") && authMode === "login" && (
          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="relative flex items-center w-full px-1">
              <div className="flex-grow border-t border-default-200/50 dark:border-default-100/10 h-[1px]"></div>
              <span className="mx-3 flex-shrink-0 text-[8px] font-bold uppercase tracking-[0.2em] text-foreground/30">Or continue with</span>
              <div className="flex-grow border-t border-default-200/50 dark:border-default-100/10 h-[1px]"></div>
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <div className="rounded-[1.5rem] bg-gradient-to-b from-default-100/40 to-transparent border border-default-200/50 p-2.5 shadow-soft group/google min-h-[74px] flex items-center justify-center">
                {googleClientId ? (
                  <div className="w-full min-h-[54px] flex flex-col items-center justify-center p-1 transition-all duration-500 group-hover/google:drop-shadow-[0_0_15px_rgba(207,152,60,0.12)]">
                    {!googleReady && !googleRenderError && (
                      <div className="h-11 w-full max-w-[340px] animate-pulse rounded-full border border-default-200 bg-default-100/70 dark:border-white/10 dark:bg-white/[0.04]" />
                    )}
                    <div id={`google-login-${roleLower}`} className="w-full min-h-11 flex justify-center scale-[0.98]" />
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
                ) : (
                  <p className="text-[10px] text-danger-500/70 font-bold uppercase tracking-widest text-center py-2">Google sign-in unavailable</p>
                )}
              </div>
            </div>
          </div>
        )}



        {(roleLower === "associate" || roleLower === "operator" || roleLower === "team") && authMode === "signup" && (
          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="relative flex items-center w-full px-1">
              <div className="flex-grow border-t border-default-200/50 dark:border-default-100/10 h-[1px]"></div>
              <span className="mx-3 flex-shrink-0 text-[8px] font-bold uppercase tracking-[0.2em] text-foreground/30">Sign up with</span>
              <div className="flex-grow border-t border-default-200/50 dark:border-default-100/10 h-[1px]"></div>
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <div className="rounded-[1.5rem] bg-gradient-to-b from-default-100/40 to-transparent border border-default-200/50 p-2.5 shadow-soft group/google min-h-[74px] flex items-center justify-center">
                {googleClientId ? (
                  <div className="w-full min-h-[54px] flex flex-col items-center justify-center p-1 transition-all duration-500 group-hover/google:drop-shadow-[0_0_15px_rgba(207,152,60,0.12)]">
                    {!googleReady && !googleRenderError && (
                      <div className="h-11 w-full max-w-[340px] animate-pulse rounded-full border border-default-200 bg-default-100/70 dark:border-white/10 dark:bg-white/[0.04]" />
                    )}
                    <div id={`google-signup-${roleLower}`} className="w-full min-h-11 flex justify-center scale-[0.98]" />
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
                ) : (
                  <p className="text-[10px] text-danger-500/70 font-bold uppercase tracking-widest text-center py-2">Google sign-in unavailable</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-1.5 flex items-center justify-center">
          {authMode === "login" ? (
            <button
              type="button"
              onClick={handleCreateAccount}
              className="text-xs font-semibold text-foreground/50 transition-colors hover:text-obaol-700 dark:hover:text-obaol-300"
            >
              New here? Create account
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const target = roleLower === "operator" || roleLower === "team" ? "/auth/operator" : "/auth/associate";
                router.push(target);
              }}
              className="text-xs font-semibold text-foreground/50 transition-colors hover:text-obaol-700 dark:hover:text-obaol-300"
            >
              Already have an account? Sign in
            </button>
          )}
        </div>

        <div className="mt-3 pt-1 w-full">
          <div className="relative flex items-center mb-3">
            <div className="flex-grow border-t border-divider h-px"></div>
            <span className="mx-3 flex-shrink-0 text-[8px] font-bold uppercase tracking-[0.25em] text-default-400 opacity-60">Switch Role</span>
            <div className="flex-grow border-t border-divider h-px"></div>
          </div>

          <div className="space-y-2">
            {role === "Associate" ? (
              <button
                type="button"
                onClick={() => router.push("/auth/operator")}
                className="group/btn flex h-11 w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground shadow-sm transition-all duration-500 hover:border-obaol-500/20 hover:bg-white/[0.06]"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="opacity-40 text-[7px] tracking-[0.25em]">{roleIdentity?.switchSubLabel || "Switch Role"}</span>
                  <span>{roleIdentity?.switchLabel || "Sign in as Operator"}</span>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-obaol-500/10 transition-all duration-500 group-hover/btn:bg-obaol-500">
                  <FiArrowRight className="text-xs group-hover/btn:text-black transition-colors" />
                </div>
              </button>
            ) : (role === "Operator" || role === "team") ? (
              <button
                type="button"
                onClick={() => router.push("/auth/associate")}
                className="group/btn flex h-11 w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground shadow-sm transition-all duration-500 hover:border-obaol-500/20 hover:bg-white/[0.06]"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="opacity-40 text-[7px] tracking-[0.25em]">{roleIdentity?.switchSubLabel || "Switch Role"}</span>
                  <span>{roleIdentity?.switchLabel || "Sign in as Associate"}</span>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-obaol-500/10 transition-all duration-500 group-hover/btn:bg-obaol-500">
                  <FiArrowRight className="text-xs group-hover/btn:text-black transition-colors" />
                </div>
              </button>
            ) : null}

            <div className="mt-3 flex justify-center w-full">
              <button
                type="button"
                onClick={() => router.push("/roles")}
                className="group flex flex-col items-center gap-2"
              >
                <span className="text-[9px] font-bold uppercase leading-none tracking-[0.24em] text-default-400 transition-colors group-hover:text-obaol-700 dark:group-hover:text-obaol-300">
                  View all roles
                </span>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-divider to-transparent transition-all group-hover:via-obaol-500" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginComponent;
