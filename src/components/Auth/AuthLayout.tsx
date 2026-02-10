"use client";

import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

/**
 * Shared layout component for authentication pages (Login, Register)
 * Uses theme variables exclusively - no hard-coded colors
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <div className="py-4 z-50 lg:py-8 flex flex-col justify-evenly items-center border border-default-200 rounded-xl px-8 lg:px-16 max-w-md w-full bg-content1 shadow-lg">
                {/* Banner Image */}
                <Image
                    src={"/Auth Page Banner.png"}
                    width={200}
                    height={300}
                    alt="Obaol"
                    className="w-full rounded-md"
                    priority
                />

                {/* Header Section */}
                <div className="flex flex-col w-full items-center overflow-hidden">
                    <div className="w-full flex justify-between items-center">
                        <h3 className="text-xl lg:text-2xl py-2 font-bold text-foreground">
                            <span className="text-warning">
                                {title}
                            </span>
                            {subtitle && (
                                <>
                                    {" "}
                                    <span className="text-default-500">{subtitle}</span>
                                </>
                            )}
                        </h3>
                        <Image
                            src={"/logo.png"}
                            width={75}
                            height={75}
                            alt="Obaol"
                            className="w-[75px] h-auto rounded-md"
                        />
                    </div>
                    <div className="bg-warning h-[2px] w-full mt-2" />
                </div>

                {/* Content */}
                <div className="w-full mt-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
