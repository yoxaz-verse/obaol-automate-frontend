"use client";
import LoginComponent from "@/components/Login/login-component";
import OTPVerificationComponent from "@/components/Login/otp-verification";
import { useContext } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import AuthContext from "@/context/AuthContext";

export default function Verification() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  if (!user) {
    router.push("/auth");
  }
  return (
    <>
      <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col overflow-hidden">
        {/* <LoginComponent role="Associate" /> */}
        {/* <LoginComponent role="Admin" /> */}
        <OTPVerificationComponent user={user}/>
      </div>
    </>
  );
}
