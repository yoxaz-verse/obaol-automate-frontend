"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { showToastMessage, useEmailValidation } from "../../utils/utils";
import {
  Button,
  Input,
} from "@nextui-org/react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AuthContext from "@/context/AuthContext";
import AuthLayout from "../Auth/AuthLayout";
import BrandedLoader from "@/components/ui/BrandedLoader";
import { useSoundEffect } from "@/context/SoundContext";


interface ILoginProps {
  role: string;
}

const LoginComponent = ({ role }: ILoginProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isInvalidEmail = useEmailValidation(email);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<"idle" | "success" | "error">("idle");
  const [isRoutingToRegister, setIsRoutingToRegister] = useState(false);
  const registerRouteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { play } = useSoundEffect();
  const roleLower = String(role || "").toLowerCase();

  const router = useRouter();
  const { isAuthenticated, loading, login, loginWithGoogle, user } = useContext(AuthContext);
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
    if (!loading && isAuthenticated) {
      const authRoleLower = String(user?.role || "").toLowerCase();
      if (authRoleLower === "associate" && user?.associateCompanyId && user?.companyInterestsConfigured === false) {
        showToastMessage({
          type: "warning",
          message: "Company interests are not configured. Update them from My Company for execution matching.",
          position: "top-right",
        });
      }
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router, user]);

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
    const container = document.getElementById(`google-login-${roleLower}`);
    if (!container) return;
    const buttonWidth = Math.min(400, Math.max(280, container.clientWidth || 320));
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (resp: { credential?: string }) => {
        try {
          if (!resp?.credential) throw new Error("Google credential not returned.");
          setIsLoading(true);
          await loginWithGoogle({
            idToken: resp.credential,
            role: roleLower === "team" ? "Operator" : roleLower === "operator" ? "Operator" : "Associate",
            rememberMe,
          });
          setLoginStatus("success");
        } catch (error: any) {
          const message = error?.response?.data?.message || error?.message || "Google login failed.";
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
      size: "large",
      width: buttonWidth,
      text: "continue_with",
      shape: "pill",
    });
  }, [googleReady, role, googleClientId, loginWithGoogle, rememberMe]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isRoutingToRegister) return;
    setIsLoading(true);
    setErrorMessage("");

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
    if (isLoading || isRoutingToRegister) return;
    setIsRoutingToRegister(true);
    if (registerRouteTimeoutRef.current) {
      clearTimeout(registerRouteTimeoutRef.current);
    }
    registerRouteTimeoutRef.current = setTimeout(() => {
      setIsRoutingToRegister(false);
      registerRouteTimeoutRef.current = null;
    }, 6000);
    if (roleLower === "operator" || roleLower === "team") {
      router.push("/auth/operator/register");
      return;
    }
    router.push("/auth/register");
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

  return (
    <AuthLayout
      title={role}
      subtitle="Login"
      leftPanel={currentRoleContent}
      topContent={
        !isAuthenticated && (
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
              {isRoutingToRegister ? (
                <span className="w-4 h-4 rounded-full border-2 border-warning-500 border-t-transparent animate-spin" />
              ) : (
                <>
                  Join Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </div>
            {/* Ambient shine */}
            <div className="absolute inset-0 -translate-x-full group-hover/banner:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out skew-x-12" />
          </motion.div>
        )
      }
    >
      <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
        <Input
          value={email}
          className="w-full"
          type="email"
          variant="bordered"
          label="Email Address"
          labelPlacement="outside"
          isInvalid={!isInvalidEmail && email.length > 0}
          errorMessage={!isInvalidEmail && email.length > 0 ? "Please enter a valid email" : ""}
          isRequired
          placeholder="name@example.com"
          onValueChange={(val) => {
            setEmail(val);
            if (loginStatus !== "idle") setLoginStatus("idle");
          }}
          classNames={{
            inputWrapper: "bg-default-100 data-[hover=true]:bg-default-200 group-data-[focus=true]:bg-default-100",
          }}
        />

        <Input
          value={password}
          className="w-full"
          label="Password"
          labelPlacement="outside"
          placeholder="Enter your password"
          variant="bordered"
          isRequired
          endContent={
            <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
              {isVisible ? (
                <IoEye className="text-2xl text-foreground/40 pointer-events-none" />
              ) : (
                <IoEyeOff className="text-2xl text-foreground/40 pointer-events-none" />
              )}
            </button>
          }
          type={isVisible ? "text" : "password"}
          onValueChange={(val) => {
            setPassword(val);
            if (loginStatus !== "idle") setLoginStatus("idle");
          }}
          classNames={{
            inputWrapper: "bg-default-100 data-[hover=true]:bg-default-200 group-data-[focus=true]:bg-default-100",
          }}
        />

        <div className="flex justify-between items-center w-full px-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer appearance-none w-5 h-5 rounded border-2 border-default-300 checked:border-warning-500 checked:bg-warning-500 transition-all cursor-pointer"
              />
              <svg
                className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5 top-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={4}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-foreground/50 group-hover:text-foreground transition-colors font-medium">Remember me</span>
          </label>
          <p
            onClick={() => router.push(`/auth/forgot-password?role=${role}`)}
            className="text-sm text-foreground/50 hover:text-foreground cursor-pointer transition-colors font-medium"
          >
            Forgot password?
          </p>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 flex items-center gap-3 text-danger-600 dark:text-danger-400 text-sm font-semibold shadow-sm overflow-hidden relative group"
          >
            <div className="shrink-0 w-8 h-8 rounded-full bg-danger-500/20 flex items-center justify-center">
              <FiAlertCircle className="text-lg" />
            </div>
            <div className="flex-1 leading-relaxed">
              {errorMessage}
            </div>
            {/* Ambient pulse */}
            <div className="absolute inset-0 bg-danger-500/5 animate-pulse pointer-events-none" />
          </motion.div>
        )}

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full"
        >
          <Button
            className={`w-full font-bold shadow-xl transition-all duration-500 h-12 border-none
              ${loginStatus === "success"
                ? "bg-gradient-to-r from-success-500 to-green-600 shadow-success/20"
                : loginStatus === "error"
                  ? "bg-gradient-to-r from-danger-500 to-red-600 shadow-danger/20"
                  : "bg-gradient-to-r from-warning-500 to-amber-600 shadow-warning/20"
              }`}
            color={loginStatus === "success" ? "success" : loginStatus === "error" ? "danger" : "warning"}
            type="submit"
            isLoading={isLoading || isRoutingToRegister}
            isDisabled={isRoutingToRegister}
            size="lg"
            radius="lg"
          >
            {isRoutingToRegister
              ? "Opening registration..."
              : loginStatus === "success"
                ? "Access Granted"
                : loginStatus === "error"
                  ? "Check Credentials"
                  : isLoading
                    ? "Verifying..."
                    : "Sign In"}
          </Button>
        </motion.div>

        {(roleLower === "associate" || roleLower === "operator" || roleLower === "team") && (
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="relative flex items-center w-full">
              <div className="flex-grow border-t border-default-200/60 dark:border-default-100/10"></div>
              <span className="flex-shrink-0 mx-4 text-foreground/40 text-[10px] uppercase tracking-widest font-bold">Or</span>
              <div className="flex-grow border-t border-default-200/60 dark:border-default-100/10"></div>
            </div>
            {googleClientId ? (
              <div id={`google-login-${roleLower}`} className="w-full" />
            ) : (
              <p className="text-xs text-warning-500">Google login is not configured.</p>
            )}
          </div>
        )}

        <div className="mt-4 pt-2 w-full">
          <div className="relative flex items-center mb-5">
            <div className="flex-grow border-t border-default-200/60 dark:border-default-100/10"></div>
            <span className="flex-shrink-0 mx-4 text-foreground/40 text-[10px] uppercase tracking-widest font-bold">Role Switching</span>
            <div className="flex-grow border-t border-default-200/60 dark:border-default-100/10"></div>
          </div>

          {role === "Associate" ? (
            <button
              type="button"
              onClick={() => router.push("/auth/operator")}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-default-100/50 hover:bg-default-200/80 dark:bg-default-50/5 dark:hover:bg-default-100/20 text-foreground font-semibold transition-all duration-300 border border-default-200 cursor-pointer shadow-sm group/btn"
            >
              <span>Sign in as Operator</span>
              <svg className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          ) : role === "Operator" || role === "team" ? (
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-default-100/50 hover:bg-default-200/80 dark:bg-default-50/5 dark:hover:bg-default-100/20 text-foreground font-semibold transition-all duration-300 border border-default-200 cursor-pointer shadow-sm group/btn"
            >
              <span>Sign in as Associate</span>
              <svg className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          ) : null}

          <div className="mt-6 flex justify-center w-full">
            <button
              type="button"
              onClick={() => router.push("/roles")}
              className="text-xs text-foreground/50 hover:text-orange-500 font-medium transition-colors flex items-center gap-1"
            >
              Know more about platform roles <FiArrowRight size={12} />
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginComponent;
