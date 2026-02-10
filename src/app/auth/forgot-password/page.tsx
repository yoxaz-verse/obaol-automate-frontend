"use client";

import React, { Suspense } from "react";
import ForgotPasswordComponent from "@/components/Login/forgot-password";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function ForgotPasswordContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get("role") || "Customer";

    return (
        <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col overflow-hidden bg-[#0a0a0a]">
            {/* Background elements for "amazing" UI */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="z-10 w-full flex flex-col items-center">
                <Image
                    src={"/logo.png"}
                    width={150}
                    height={150}
                    alt="Obaol"
                    className="mb-8 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                />
                <ForgotPasswordComponent role={role} />
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>}>
            <ForgotPasswordContent />
        </Suspense>
    );
}
