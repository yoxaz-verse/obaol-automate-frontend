"use client";

import React from "react";
import Link from "next/link";
import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";

export default function CTASection() {
    const { isAuthenticated, loading } = usePublicAuthStatus();

    return (
        <section className="relative overflow-hidden border-t border-obaol-500/15 px-6 py-24 text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(207,152,60,0.14),transparent_48%)]" />
            <h2 className="relative text-3xl font-bold tracking-[-0.025em]">
                Trade Faster. Trade Smarter. Trade Securely.
            </h2>

            <div className="relative mt-8 flex justify-center gap-4">
                <Link
                    href={!loading && isAuthenticated ? "/dashboard" : "/auth"}
                    className="rounded-xl border border-obaol-300/40 bg-obaol-500 px-6 py-3 font-bold text-obaol-950 shadow-[0_14px_34px_-18px_rgba(207,152,60,0.8)] transition-all hover:-translate-y-0.5 hover:bg-obaol-400"
                >
                    {!loading && isAuthenticated ? "Go to Dashboard" : "Sign In"}
                </Link>
            </div>
        </section>
    );
}
