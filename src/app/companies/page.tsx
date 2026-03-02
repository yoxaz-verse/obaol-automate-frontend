"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "@nextui-org/react";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import { getData } from "@/core/api/apiHandler";
import { associateCompanyRoutes } from "@/core/api/apiRoutes";

const toRows = (res: any): any[] => {
    const raw = res?.data?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(res?.data)) return res.data;
    return [];
};

// Simple initials avatar colour based on name
const PALETTE = [
    "bg-warning-500/10 text-warning-600",
    "bg-success-500/10 text-success-600",
    "bg-secondary-500/10 text-secondary-600",
    "bg-primary-500/10 text-primary-600",
    "bg-danger-500/10 text-danger-600",
];
const colourFor = (name: string) =>
    PALETTE[name.charCodeAt(0) % PALETTE.length];

const initials = (name: string) =>
    name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

export default function CompaniesPage() {
    const [search, setSearch] = useState("");

    const { data: res, isLoading } = useQuery({
        queryKey: ["public-companies"],
        queryFn: () =>
            getData(associateCompanyRoutes.getAll, {
                limit: 1000,
                fields: "name", // only ask for name — no contact data
            }),
    });

    const companies: string[] = useMemo(() => {
        const rows = toRows(res);
        // only keep the name string — discard everything else
        return rows
            .map((r: any) => (typeof r.name === "string" ? r.name.trim() : ""))
            .filter(Boolean);
    }, [res]);

    const filtered = useMemo(
        () =>
            search.trim()
                ? companies.filter((n) =>
                    n.toLowerCase().includes(search.toLowerCase())
                )
                : companies,
        [companies, search]
    );

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            {/* ── Hero ── */}
            <section className="relative overflow-hidden py-20 px-6 text-center">
                {/* ambient glow */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-[600px] h-[600px] rounded-full bg-warning-500/5 blur-[120px]" />
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-[11px] font-black uppercase tracking-[0.25em] text-warning-500 mb-4"
                >
                    Our Network
                </motion.p>
                <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4"
                >
                    Partner Companies
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-default-400 max-w-lg mx-auto text-base leading-relaxed mb-10"
                >
                    Trusted businesses powering the OBAOL trade network.
                </motion.p>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="max-w-md mx-auto"
                >
                    <Input
                        placeholder="Search companies…"
                        value={search}
                        onValueChange={setSearch}
                        variant="bordered"
                        radius="full"
                        classNames={{
                            input: "text-sm",
                            inputWrapper:
                                "border-foreground/10 hover:border-warning-500/40 focus-within:border-warning-500/60 bg-foreground/[0.02]",
                        }}
                    />
                </motion.div>
            </section>

            {/* ── Grid ── */}
            <section className="flex-1 max-w-6xl mx-auto w-full px-6 pb-20">
                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-warning-500"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                />
                            ))}
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 text-default-400">
                        <p className="text-lg font-semibold">No companies found</p>
                        {search && (
                            <p className="text-sm mt-1">
                                Try a different search term.
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-default-400 mb-6">
                            {filtered.length} {filtered.length === 1 ? "company" : "companies"}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map((name, i) => (
                                <motion.div
                                    key={name + i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}
                                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-foreground/[0.07] bg-foreground/[0.01] hover:border-warning-500/20 hover:bg-warning-500/[0.02] transition-all"
                                >
                                    {/* Initials avatar */}
                                    <div
                                        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black ${colourFor(name)}`}
                                    >
                                        {initials(name)}
                                    </div>
                                    <span className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                                        {name}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </section>

            <Footer />
        </div>
    );
}
