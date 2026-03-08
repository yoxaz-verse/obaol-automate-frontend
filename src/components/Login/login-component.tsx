"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { showToastMessage, useEmailValidation } from "../../utils/utils";
import {
  Button,
  Input,
} from "@nextui-org/react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useRouter } from "next/navigation";
import AuthContext from "@/context/AuthContext";
import AuthLayout from "../Auth/AuthLayout";
import CompanyInterestsModal from "./company-interests-modal";
import BrandedLoader from "@/components/ui/BrandedLoader";

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
  const [isRoutingToRegister, setIsRoutingToRegister] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [interestsSetupDone, setInterestsSetupDone] = useState(false);
  const registerRouteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const { isAuthenticated, loading, login, user } = useContext(AuthContext);

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
      const roleLower = String(user?.role || "").toLowerCase();
      const requiresInterestsSetup =
        roleLower === "associate" &&
        user?.associateCompanyId &&
        user?.companyInterestsConfigured === false &&
        !interestsSetupDone;
      if (requiresInterestsSetup) {
        setShowInterestsModal(true);
        return;
      }
      setShowInterestsModal(false);
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router, user, interestsSetupDone]);

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
    };

    try {
      await login(data);

      if (rememberMe) {
        localStorage.setItem(
          "rememberMeTime",
          JSON.stringify(new Date().getTime() + 10 * 24 * 60 * 60 * 1000)
        );
      }

      showToastMessage({
        type: "success",
        message: "Login Successful",
        position: "top-right",
      });
    } catch (error: any) {
      setIsLoading(false);

      const apiErrorMessage = error?.code === "SESSION_COOKIE_BLOCKED"
        ? "Session cookie was blocked by browser privacy settings. Allow cookies for obaol.com/api.obaol.com and retry."
        : (error.response?.data?.message ||
          "Invalid email or password. Please try again.");

      setErrorMessage(apiErrorMessage);

      showToastMessage({
        type: "error",
        message: apiErrorMessage,
        position: "top-right",
      });
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
    router.push("/auth/register");
  };

  if (loading) {
    return <BrandedLoader fullScreen message="Preparing sign in" variant="compact" />;
  }

  return (
    <AuthLayout title={role} subtitle="Login">
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
          onValueChange={setEmail}
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
                <IoEye className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <IoEyeOff className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
          type={isVisible ? "text" : "password"}
          onValueChange={setPassword}
          classNames={{
            inputWrapper: "bg-default-100 data-[hover=true]:bg-default-200 group-data-[focus=true]:bg-default-100",
          }}
        />

        <div className="flex justify-between items-center w-full px-1">
          <button
            type="button"
            onClick={handleCreateAccount}
            disabled={isLoading || isRoutingToRegister}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-md px-1 py-0.5"
          >
            {isRoutingToRegister ? "Opening registration..." : "Create account"}
            {isRoutingToRegister ? (
              <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-hidden="true" />
            ) : null}
          </button>
          <p
            onClick={() => router.push(`/auth/forgot-password?role=${role}`)}
            className="text-sm text-default-500 hover:text-foreground cursor-pointer transition-colors"
          >
            Forgot password?
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-danger-50 text-danger text-sm text-center border border-danger-200">
            {errorMessage}
          </div>
        )}

        <Button
          className="w-full font-bold shadow-lg shadow-warning/20"
          color="warning"
          type="submit"
          isLoading={isLoading || isRoutingToRegister}
          isDisabled={isRoutingToRegister}
          size="lg"
          radius="lg"
        >
          {isRoutingToRegister ? "Opening registration..." : isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <CompanyInterestsModal
        open={showInterestsModal}
        associateCompanyId={user?.associateCompanyId}
        onSaved={() => {
          setShowInterestsModal(false);
          setInterestsSetupDone(true);
          router.push("/dashboard");
        }}
      />
    </AuthLayout>
  );
};

export default LoginComponent;
