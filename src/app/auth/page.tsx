"use client";
import LoginComponent from "@/components/Login/login-component";
import Title from "@/components/titles";
import Image from "next/image";

export default function SuperadminLoginPage() {
  return (
    <>
      <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col overflow-hidden">
        {/* 🔹 Title strip */}
        <div className="w-full absolute top-0 flex justify-center py-3 shadow-md"></div>
     
        <LoginComponent role="Associate" />
        {/* <LoginComponent role="Admin" /> */}
      </div>
    </>
  );
}
