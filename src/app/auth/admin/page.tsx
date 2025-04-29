"use client";
import LoginComponent from "@/components/Login/login-component";
import "react-toastify/dist/ReactToastify.css";

export default function SuperadminLoginPage() {
  return (
    <>
      <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col overflow-hidden">
        <LoginComponent role="Admin" />
      </div>
    </>
  );
}
