"use client";

import React, { useContext, useEffect, useState } from "react";
import { showToastMessage, useEmailValidation } from "../../utils/utils";
import {
  Button,
  Input,
  Spacer,
} from "@nextui-org/react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useRouter } from "next/navigation";
import AuthContext from "@/context/AuthContext";
import Image from "next/image";
import AuthLayout from "../Auth/AuthLayout";

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

  const router = useRouter();
  const { isAuthenticated, loading, login } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

      const apiErrorMessage =
        error.response?.data?.message ||
        "Invalid email or password. Please try again.";

      setErrorMessage(apiErrorMessage);

      showToastMessage({
        type: "error",
        message: apiErrorMessage,
        position: "top-right",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col bg-background">
        <Image
          src={"/logo.png"}
          width={300}
          height={300}
          alt="Obaol"
          className="w-max rounded-md"
        />
      </div>
    );
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
          <p
            onClick={() => router.push("/auth/register")}
            className="text-sm text-primary hover:underline cursor-pointer transition-all"
          >
            Create account
          </p>
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
          isLoading={isLoading}
          size="lg"
          radius="lg"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginComponent;
