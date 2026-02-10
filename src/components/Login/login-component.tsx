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
      <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          value={email}
          className="w-full"
          type="text"
          variant="flat"
          label="Email"
          isInvalid={!isInvalidEmail}
          isRequired={true}
          color={!isInvalidEmail ? "danger" : "success"}
          placeholder="Enter your email"
          onValueChange={setEmail}
        />
        <Input
          value={password}
          className="w-full pb-1"
          label="Password"
          placeholder="Enter your Password"
          id="password"
          required
          endContent={
            isVisible ? (
              <IoEye onClick={toggleVisibility} className="cursor-pointer text-default-400" />
            ) : (
              <IoEyeOff
                onClick={toggleVisibility}
                className="cursor-pointer text-default-400"
              />
            )
          }
          type={isVisible ? "text" : "password"}
          onValueChange={setPassword}
        />
        <div className="flex justify-between w-full px-1">
          <p
            onClick={() => router.push("/auth/register")}
            className="text-xs text-warning hover:text-warning-600 cursor-pointer transition-colors"
          >
            Create account
          </p>
          <p
            onClick={() => router.push(`/auth/forgot-password?role=${role}`)}
            className="text-xs text-warning hover:text-warning-600 cursor-pointer transition-colors"
          >
            Forgot password?
          </p>
        </div>

        {errorMessage && (
          <p className="text-danger text-sm text-center">{errorMessage}</p>
        )}

        <Spacer y={2} />
        <Button
          className="w-full font-bold"
          variant="ghost"
          color="warning"
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          size="lg"
        >
          {isLoading ? "Loading..." : "Login"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginComponent;
