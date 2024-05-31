"use client";
import { postData } from "@/core/api/apiHandler";
import { accountRoutes } from "@/core/api/apiRoutes";
import { adminLogin } from "@/data/interface-data";
import { showToastMessage, useEmailValidation } from "@/utils/utils";
import { Button, Checkbox, Divider, Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import UnderDevelopment from "../hashed/under-development";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/core/routes";

const LoginComponent = ({ url }: adminLogin) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [remberMe, setRemberMe] = useState(false);
  const isInvalidEmail = useEmailValidation(email);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const loginAdmin = useMutation({
    mutationFn: (data: any) => {
      return postData(url, {}, data);
    },
    onSuccess: (data) => {
      // Cookies.set("currentUserToken", data.data.data.token);
      // Cookies.set("SuperAdmin",data.data.data.admin.isSuperAdmin)
      localStorage.setItem("currentUserToken", data.data.token)
      if (remberMe) {
        // set time to 10days
        localStorage.setItem("rememberMeTime", JSON.stringify(new Date().getTime() + 10 * 24 * 60 * 60 * 1000))

      }
      showToastMessage({
        type: "success",
        message: "Login Successful",
        position: "top-right",
      });

      // redirect();
      router.push(ROUTES.DASHBOARD);
      setIsLoading(false);
    },
    onError: (error: any) => {
      setIsLoading(false);

      showToastMessage({ type: 'error', message: error.response.data.message, position: 'top-right' })
    },
  });
  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const data = {
      email: email,
      password: e.currentTarget.password.value,
    };
    if (email && e.currentTarget.password.value) {
      loginAdmin.mutate(data);
    }
  };
  return (
    <div
      className="py-20 flex flex-col justify-evenly items-center rounded-3xl px-24"
      style={{ border: "1px solid #788BA5" }}
    >
      <div>
        <div className="text-2xl py-2 font-bold text-center">
          Login with your work email
        </div>
        <div className="text-sm py-2 text-[#788BA5]">
          Use your work email to log in to your team workspace.
        </div>
      </div>
      <form className="w-11/12" onSubmit={handleSubmit}>
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
          variant="underlined"
          placeholder="Password"
          className="pb-3"
          id="password"
          required
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <IoEye className="text-xs text-default-400 pointer-events-none" />
              ) : (
                <IoEyeOff className="text-xs text-default-400 pointer-events-none" />
              )}
            </button>
          }
          type={isVisible ? "text" : "password"}
        />
        <div className="flex justify-between items-center">
          <Checkbox color="default" className="text-[#788BA5]"
            checked={remberMe}
            onChange={() => setRemberMe(!remberMe)}
            size="sm">
            Remember me
          </Checkbox>
          <div className="text-center mt-2 text-xs text-[#788BA5]">
            <UnderDevelopment>
              Forgot Password?
            </UnderDevelopment>
          </div>
        </div>
        <Button
          className="text-white w-full mt-4 flex justify-center rounded bg-[#117DF9] py-2"
          color="primary"
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
        >
          {isLoading ? 'Loading...' : 'Login'}
        </Button>
      </form>
      <div className="flex justify-evenly w-11/12 items-center py-3">
        <Divider className="my-4 w-1/3" orientation="horizontal" />
        <div className="flex w-1/3 text-sm justify-center items-center font-medium">
          or log in with
        </div>
        <Divider className="my-4 w-1/3" orientation="horizontal" />
      </div>
      <div className="flex w-11/12 justify-center items-center">
        <UnderDevelopment>
          <Image
            src="/microsoft.png"
            width={30}
            height={30}
            alt="login with microsoft"
            className="cursor-pointer"
          />
        </UnderDevelopment>
      </div>
    </div>
  );
};

export default LoginComponent;
