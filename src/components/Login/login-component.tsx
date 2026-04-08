"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { showToastMessage, useEmailValidation } from "../../utils/utils";
import {
  Button,
  Input,
} from "@nextui-org/react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { FiAlertCircle, FiArrowRight, FiCheck } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import AuthContext from "@/context/AuthContext";
import AuthLayout from "../Auth/AuthLayout";
import BrandedLoader from "@/components/ui/BrandedLoader";
import { useSoundEffect } from "@/context/SoundContext";
import { postData } from "@/core/api/apiHandler";
import { baseUrl } from "@/core/api/axiosInstance";


interface ILoginProps {
  role: string;
  mode?: "login" | "signup";
}

const LoginComponent = ({ role, mode = "login" }: ILoginProps) => {
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
  const [existingAccountFlow, setExistingAccountFlow] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState(Date.now());

  const normalizeSignupError = (message: string) => {
    const raw = String(message || "");
    const lower = raw.toLowerCase();
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
    inputWrapper: "bg-content1 dark:bg-white/[0.03] border-divider hover:border-warning-500/50 transition-all h-12 rounded-2xl shadow-sm",
    input: "font-medium text-sm text-foreground placeholder:text-default-300",
    base: "mb-2"
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading, login, loginWithGoogle, user, refreshUser } = useContext(AuthContext);
  const [googleReady, setGoogleReady] = useState(false);
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
    if (!otpSent || otpVerified) return;
    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent, otpVerified]);

  useEffect(() => {
    if (authMode === "signup") {
      return;
    }
    if (!loading && isAuthenticated) {
      setIsRedirecting(true);
      const authRoleLower = String(user?.role || "").toLowerCase();
      const requiresOnboarding = ["associate", "operator", "team"].includes(authRoleLower)
        && user?.onboardingComplete === false;
      if (authRoleLower === "associate" && user?.associateCompanyId && user?.companyInterestsConfigured === false) {
        showToastMessage({
          type: "warning",
          message: "Company interests are not configured. Update them from My Company for execution matching.",
          position: "top-right",
        });
      }
      router.push(requiresOnboarding ? "/dashboard/onboarding" : "/dashboard");
    }
  }, [authMode, isAuthenticated, loading, router, user]);

  useEffect(() => {
    if (roleLower !== "associate" && roleLower !== "operator" && roleLower !== "team") return;
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
  }, [role, googleClientId]);

  useEffect(() => {
    if (!googleReady) return;
    if (roleLower !== "associate" && roleLower !== "operator" && roleLower !== "team") return;
    if (!window?.google?.accounts?.id) return;
    const containerId = authMode === "signup" ? `google-signup-${roleLower}` : `google-login-${roleLower}`;
    const container = document.getElementById(containerId);
    if (!container) return;
    const buttonWidth = Math.min(400, Math.max(280, container.clientWidth || 320));
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (resp: { credential?: string }) => {
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
            router.push("/dashboard/onboarding?auth=google");
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
      },
    });
    window.google.accounts.id.renderButton(container, {
      theme: "filled_black",
      size: "medium",
      width: Math.min(340, buttonWidth),
      text: "continue_with",
      shape: "pill",
    });
  }, [googleReady, role, googleClientId, loginWithGoogle, rememberMe, authMode, roleLower]);

  if (isRedirecting) {
    return <BrandedLoader fullScreen message="Signing you in" variant="compact" />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
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
          : (backendData?.status === "rejected" || backendData?.isRejected || String(backendData?.message).toLowerCase().includes("rejected"))
            ? "Your account verification has been rejected by the administrator. Contact support for more details."
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
    router.push(target);
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
      let useExistingFlow = existingAccountFlow;
      if (!useExistingFlow && !hasOnboardingSession) {
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
            setExistingAccountFlow(true);
            setErrorMessage("Verify ownership to continue. We'll send a code if this email exists.");
            useExistingFlow = true;
          } else {
            throw startError;
          }
        }
      }
      if (useExistingFlow) {
        await postData("/verification/send-otp-existing", { method: "email", email: email.trim() }, {});
        showToastMessage({
          type: "success",
          message: "If an account exists for this email, an OTP has been sent.",
          position: "top-right",
        });
      } else {
        await postData("/verification/send-otp", { method: "email", email: email.trim() }, {});
        showToastMessage({ type: "success", message: "OTP sent to your email.", position: "top-right" });
      }
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
      if (existingAccountFlow) {
        const verifyRes = await postData("/verification/verify-otp-existing", { code: otp, method: "email", email: email.trim() }, {});
        const nextRoute = String(verifyRes?.data?.next || "");
        showToastMessage({ type: "success", message: "OTP verified.", position: "top-right" });
        if (nextRoute) {
          router.push(nextRoute);
          return;
        }
        const target = roleLower === "operator" || roleLower === "team" ? "/auth/operator" : "/auth";
        router.push(`${target}?prefill=${encodeURIComponent(email.trim())}`);
        return;
      }
      await postData("/verification/verify-otp", { code: otp, method: "email", email: email.trim() }, {});
      setOtpVerified(true);
      showToastMessage({ type: "success", message: "Email verified.", position: "top-right" });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "OTP verification failed.";
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
    },
    operator: {
      headline: "OBAOL",
      highlight: "OPERATOR PORTAL",
      description: "Your go-to platform for the agro trade ecosystem. Manage enquiries, orders, and operations in one place.",
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

  if (loading) {
    return <BrandedLoader fullScreen message="Preparing sign in" variant="compact" />;
  }

  const joinCta = roleKey === "operator"
    ? {
      title: "New Operator?",
      description: "Create an operator account to access the portal",
    }
    : {
      title: "New Associate?",
      description: "Create an account to start trading",
    };

  const canSendOtp = !!email.trim() && isInvalidEmail;
  const otpExpiryRemaining = Math.max(0, (otpExpiresAt || 0) - nowTs);
  const resendRemaining = Math.max(0, (resendAvailableAt || 0) - nowTs);
  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <AuthLayout
      title={authMode === "signup" ? `${role} — Create Account` : role}
      subtitle={authMode === "signup" ? "Create Account" : "Login"}
      leftPanel={currentRoleContent}
      topContent={
        !isAuthenticated && authMode !== "signup" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group/banner relative overflow-hidden rounded-xl border border-warning-500/10 bg-warning-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-warning-500/10 transition-all duration-300"
            onClick={handleCreateAccount}
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold text-warning-600 dark:text-warning-400 uppercase tracking-widest">{joinCta.title}</span>
              <span className="text-sm font-medium text-foreground/80 leading-snug">{joinCta.description}</span>
            </div>
            <div className="flex items-center gap-2 text-warning-500 font-bold text-sm group-hover/banner:translate-x-1 transition-transform duration-300">
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
        className="w-full flex flex-col gap-6"
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (authMode === "signup" && e.key === "Enter") {
            e.preventDefault();
          }
        }}
      >
        {authMode === "signup" && (
          <div className="w-full flex flex-col gap-5">
            {(roleLower === "associate" || roleLower === "operator" || roleLower === "team") && (
              <div className="w-full flex flex-col gap-4">
                <div className="relative flex items-center w-full px-4">
                  <div className="flex-grow border-t border-default-200/50 dark:border-default-100/10 h-[1px]"></div>
                  <span className="flex-shrink-0 mx-6 text-foreground/30 text-[9px] uppercase tracking-[0.3em] font-black italic">Signup via Google</span>
                  <div className="flex-grow border-t border-default-200/50 dark:border-default-100/10 h-[1px]"></div>
                </div>
                <div className="w-full flex flex-col gap-3">
                <div className="w-full flex flex-col gap-6">
                  <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-default-100/40 to-transparent border border-default-200/50 shadow-soft group/google">
                    <div className="flex items-center justify-center p-3 gap-3 border-b border-default-100/50 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse ring-4 ring-success-500/20 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50">Sign in with Google</span>
                    </div>
                    {googleClientId ? (
                      <div className="p-2 overflow-hidden transition-all duration-500 group-hover/google:drop-shadow-[0_0_15px_rgba(245,165,36,0.15)]">
                        <div id={`google-signup-${roleLower}`} className="w-full flex justify-center scale-[0.98]" />
                      </div>
                    ) : (
                      <p className="text-[10px] text-danger-500/70 font-black uppercase tracking-[0.4em] text-center py-4 italic">Google_Engine_Offline</p>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-center text-foreground/30 uppercase tracking-[0.2em] px-4 leading-relaxed italic opacity-60">
                    Propagate verification via Google OAuth 2.0 protocol.
                  </p>
                </div>
                </div>
              </div>
            )}
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
                    const target = authRole === "operator" ? "/auth/operator" : "/auth";
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
          variant="bordered"
          label="Email Address"
          labelPlacement="outside"
          isDisabled={authMode === "signup" && otpSent}
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
            setExistingAccountFlow(false);
            setOtpSent(false);
            setOtpVerified(false);
            setOtp("");
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
            isInvalid={false}
            errorMessage={""}
            endContent={
              <button className="focus:outline-none p-1 hover:text-warning-500 transition-colors" type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <IoEye className="text-xl opacity-60 pointer-events-none" />
                ) : (
                  <IoEyeOff className="text-xl opacity-60 pointer-events-none" />
                )}
              </button>
            }
            type={isVisible ? "text" : "password"}
            onValueChange={(val) => {
              setPassword(val);
              if (loginStatus !== "idle") setLoginStatus("idle");
            }}
            classNames={inputClasses}
          />
        )}

        {authMode === "login" && (
          <div className="flex justify-between items-center w-full px-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-divider bg-content2 text-warning-500 focus:ring-warning-500/20 transition-all cursor-pointer"
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400 group-hover:text-foreground transition-colors">
                Remember me
              </span>
            </label>
            <button
              type="button"
              onClick={() => router.push(`/auth/forgot-password?role=${roleLower === 'operator' || roleLower === 'team' ? 'Operator' : 'Associate'}`)}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-warning-500 hover:text-warning-400 hover:scale-105 transition-all italic underline decoration-warning-500/20 underline-offset-4"
            >
              Forgot password?
            </button>
          </div>
        )}



        {authMode === "login" && (
          <motion.div
            className="mt-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              className={`w-full font-black uppercase italic tracking-[0.2em] h-14 rounded-2xl shadow-xl transition-all duration-500 ${
                loginStatus === "success" 
                  ? "bg-success-500 shadow-success-500/10" 
                  : loginStatus === "error"
                    ? "bg-danger-500 shadow-danger-500/10"
                    : "bg-gradient-to-r from-warning-500 to-amber-600 shadow-warning-500/10"
              }`}
              color="warning"
              size="lg"
              radius="lg"
              isLoading={isLoading}
            >
              {loginStatus === "success"
                ? "Signed In"
                : loginStatus === "error"
                  ? "Sign In"
                  : isLoading
                    ? "Signing in..."
                    : "Sign In"}
            </Button>
          </motion.div>
        )}

        {authMode === "signup" && (
          <div className="w-full flex flex-col gap-5">
            {!otpSent ? (
              <>
                <Button
                  className="w-full font-black uppercase italic tracking-[0.2em] h-12 rounded-2xl bg-warning-500 shadow-xl shadow-warning-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
                {errorMessage && authMode === "signup" && (
                  <div className="rounded-lg border border-danger-500/40 bg-danger-500/15 px-3 py-2 text-[11px] font-semibold text-danger-400 text-center shadow-[0_0_18px_rgba(244,63,94,0.18)]">
                    {errorMessage}
                  </div>
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
                      className="text-warning-500 hover:text-warning-400 transition-colors"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                <div className="w-full flex flex-col gap-4">
                  {!otpVerified ? (
                    <Button
                      className="w-full font-black uppercase italic tracking-[0.2em] h-12 rounded-2xl bg-warning-500 shadow-xl shadow-warning-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
          <div className="mt-8 flex flex-col items-center gap-5">
            <div className="relative flex items-center w-full px-4">
              <div className="flex-grow border-t border-default-200/50 dark:border-default-100/10 h-[1px]"></div>
              <span className="flex-shrink-0 mx-6 text-foreground/30 text-[9px] uppercase tracking-[0.3em] font-black italic">Or continue with</span>
              <div className="flex-grow border-t border-default-200/50 dark:border-default-100/10 h-[1px]"></div>
            </div>

            <div className="w-full flex flex-col gap-4">
              <div className="p-1 px-1.5 rounded-[2rem] bg-gradient-to-b from-default-100/40 to-transparent border border-default-200/50 shadow-inner group/google">
                <div className="flex items-center justify-center p-3 gap-3 border-b border-default-100/50 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse ring-4 ring-success-500/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Sign in with Google</span>
                </div>
                {googleClientId ? (
                  <div className="p-1.5 overflow-hidden transition-all duration-500 group-hover/google:drop-shadow-[0_0_15px_rgba(245,165,36,0.1)]">
                    <div id={`google-login-${roleLower}`} className="w-full flex justify-center scale-[1.02]" />
                  </div>
                ) : (
                  <p className="text-[10px] text-danger-500/70 font-bold uppercase tracking-widest text-center py-2">Google sign-in unavailable</p>
                )}
              </div>
              <p className="text-[9px] font-bold text-center text-foreground/30 uppercase tracking-[0.15em] px-4 leading-relaxed">
                Use Google to sign in quickly and securely.
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center">
          {authMode === "login" ? (
            <button
              type="button"
              onClick={handleCreateAccount}
              className="text-xs text-foreground/50 hover:text-warning-500 font-semibold transition-colors"
            >
              New here? Create account
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const target = roleLower === "operator" || roleLower === "team" ? "/auth/operator" : "/auth";
                router.push(target);
              }}
              className="text-xs text-foreground/50 hover:text-warning-500 font-semibold transition-colors"
            >
              Already have an account? Sign in
            </button>
          )}
        </div>

        <div className="mt-8 pt-4 w-full">
          <div className="relative flex items-center mb-10">
            <div className="flex-grow border-t border-divider h-px"></div>
            <span className="flex-shrink-0 mx-6 text-default-400 text-[9px] font-black uppercase tracking-[0.4em] italic opacity-60">Switch Role</span>
            <div className="flex-grow border-t border-divider h-px"></div>
          </div>

          <div className="space-y-4">
            {role === "Associate" ? (
              <button
                type="button"
                onClick={() => router.push("/auth/operator")}
                className="w-full flex items-center justify-between px-6 h-14 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-warning-500/20 text-foreground font-black uppercase text-[11px] tracking-widest transition-all duration-500 group/btn shadow-sm"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="opacity-40 text-[8px] tracking-[0.6em]">Switch Role</span>
                  <span>Sign in as Operator</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-warning-500/10 flex items-center justify-center group-hover/btn:bg-warning-500 transition-all duration-500">
                  <FiArrowRight className="text-sm group-hover/btn:text-black transition-colors" />
                </div>
              </button>
            ) : (role === "Operator" || role === "team") ? (
              <button
                type="button"
                onClick={() => router.push("/auth")}
                className="w-full flex items-center justify-between px-6 h-14 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-warning-500/20 text-foreground font-black uppercase text-[11px] tracking-widest transition-all duration-500 group/btn shadow-sm"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="opacity-40 text-[8px] tracking-[0.6em]">Switch Role</span>
                  <span>Sign in as Associate</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-warning-500/10 flex items-center justify-center group-hover/btn:bg-warning-500 transition-all duration-500">
                  <FiArrowRight className="text-sm group-hover/btn:text-black transition-colors" />
                </div>
              </button>
            ) : null}

            <div className="mt-10 flex justify-center w-full">
              <button
                type="button"
                onClick={() => router.push("/roles")}
                className="group flex flex-col items-center gap-2"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-default-400 group-hover:text-warning-500 transition-colors italic leading-none">
                  View all roles
                </span>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-divider to-transparent group-hover:via-warning-500 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginComponent;
