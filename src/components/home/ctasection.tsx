"use client";

import React, { useContext } from "react";
import Link from "next/link";
import AuthContext from "@/context/AuthContext";

export default function CTASection() {
    const { isAuthenticated, loading } = useContext(AuthContext);

    return (
        <section className="py-24 px-6 border-t border-default-200 text-center">
            <h2 className="text-3xl font-semibold">
                Trade Faster. Trade Smarter. Trade Securely.
            </h2>

            <div className="mt-8 flex justify-center gap-4">
                <Link
                    href={!loading && isAuthenticated ? "/dashboard" : "/auth"}
                    className="px-6 py-3 rounded-md bg-warning text-warning-foreground font-medium hover:opacity-90 transition-opacity"
                >
                    {!loading && isAuthenticated ? "Go to Dashboard" : "Sign In"}
                </Link>
            </div>
        </section>
    );
}
