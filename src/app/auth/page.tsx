"use client";
import LoginComponent from "@/components/Login/login-component";
import Title from "@/components/titles";

export default function SuperadminLoginPage() {
  return (
    <>
      <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col overflow-hidden">
        {/* 🔹 Title strip */}
        <div className="w-full absolute top-0 bg-orange-500 py-3 shadow-md">
          <h1 className="text-center text-white text-2xl md:text-4xl font-bold tracking-wide uppercase">
            Associates
          </h1>
        </div>

        <LoginComponent role="Associate" />
        {/* <LoginComponent role="Admin" /> */}
      </div>
    </>
  );
}
