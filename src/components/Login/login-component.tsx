"use client";

import React, { useContext, useEffect, useState } from "react";
import { showToastMessage, useEmailValidation } from "../../utils/utils";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Checkbox,
  Input,
  Spacer,
} from "@nextui-org/react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useRouter } from "next/navigation";
import AuthContext from "@/context/AuthContext";

const LoginComponent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Add password state
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State to store error messages
  const isInvalidEmail = useEmailValidation(email);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    "ActivityManager",
    "ProjectManager",
    "Admin",
    "Customer",
    "Worker",
  ];
  const [role, setRole] = useState("Customer");
  const router = useRouter();
  const { isAuthenticated, loading, login } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard"); // Redirect authenticated users away from login page
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); // Clear previous error messages

    if (!email || !password) {
      setIsLoading(false);
      setErrorMessage("Email and password are required.");
      return;
    }

    const data = {
      email: email,
      password: password,
      role: role, // Include the selected role
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

      // Redirect handled by useEffect when isAuthenticated updates
    } catch (error: any) {
      setIsLoading(false);
      console.error("Login error:", error);

      // Extract error message from API response
      const apiErrorMessage =
        error.response?.data?.message ||
        "Invalid email or password. Please try again.";

      setErrorMessage(apiErrorMessage); // Set error message state

      showToastMessage({
        type: "error",
        message: apiErrorMessage,
        position: "top-right",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="py-10 lg:py-20 flex flex-col justify-evenly items-center rounded-3xl px-12 lg:px-24"
        style={{ border: "1px solid #788BA5" }}
      >
        <div>
          <h3 className="text-xl lg:text-2xl py-2 font-bold text-center">
            Login with your work email
          </h3>
          <h3 className="text-sm py-2 text-[#788BA5]">
            Use your work email to log in to your team workspace.
          </h3>
        </div>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            value={email}
            type="text"
            variant="underlined"
            isInvalid={!isInvalidEmail}
            isRequired={true}
            color={!isInvalidEmail ? "danger" : "success"}
            placeholder="Email"
            onValueChange={setEmail}
          />
          <Input
            value={password}
            variant="underlined"
            placeholder="Password"
            className="pb-3"
            id="password"
            required
            endContent={
              isVisible ? (
                <IoEye onClick={toggleVisibility} className="cursor-pointer" />
              ) : (
                <IoEyeOff
                  onClick={toggleVisibility}
                  className="cursor-pointer"
                />
              )
            }
            type={isVisible ? "text" : "password"}
            onValueChange={setPassword}
          />

          <Autocomplete
            label="Select your role"
            defaultSelectedKey={role}
            variant="underlined"
            onSelectionChange={(e: any) => setRole(e)}
            className="max-w-full bg-[#F6F8FB]"
          >
            {roles.map((role: any) => (
              <AutocompleteItem
                className="bg-[#F6F8FB]"
                key={role}
                value={role}
              >
                {role}
              </AutocompleteItem>
            ))}
          </Autocomplete>

          <div className="flex justify-between items-center">
            <Checkbox
              color="default"
              className="text-[#788BA5]"
              isSelected={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              size="sm"
            >
              Remember me
            </Checkbox>
            <div className="text-center mt-2 text-xs text-[#788BA5]">
              {/* Forgot Password Link Placeholder */}
            </div>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
          )}

          <Spacer y={4} />
          <Button
            className="text-white w-full flex justify-center rounded bg-[#117DF9] py-2"
            color="primary"
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Loading..." : "Login"}
          </Button>
        </form>
      </div>
    </>
  );
};

export default LoginComponent;
