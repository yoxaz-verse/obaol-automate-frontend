"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

interface AuthLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    topContent?: React.ReactNode;
    cardMaxWidthClass?: string;
    embedded?: boolean;
    leftPanel?: {
        headline: string;
        highlight?: string;
        description?: string;
        points?: string[];
        tags?: string[];
        footer?: string;
        knowMoreLink?: string;
    };
    roleIdentity?: {
        roleKey: "associate" | "operator";
        panelLabel: string;
        motifClassName: string;
        highlightClassName: string;
        audienceLabels?: string[];
    };
}

const FloatingPixel = ({ delay }: { delay: number }) => {
    const [mounted, setMounted] = useState(false);
    const [config, setConfig] = useState({ x: "0vw", duration: 15 });

    useEffect(() => {
        setMounted(true);
        setConfig({
            x: Math.random() * 100 + "vw",
            duration: 15 + Math.random() * 10,
        });
    }, []);

    if (!mounted) return null;

    return (
        <motion.div
            className="absolute h-1 w-1 rounded-full bg-obaol-500/30"
            initial={{ y: "110vh", x: config.x, opacity: 0 }}
            animate={{
                y: "-10vh",
                opacity: [0, 1, 0],
            }}
            transition={{
                duration: config.duration,
                repeat: Infinity,
                delay: delay,
                ease: "linear",
                repeatType: "loop",
            }}
        />
    );
};

const TypewriterEffect = ({ words }: { words: string[] }) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    useEffect(() => {
        const timeout2 = setTimeout(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearTimeout(timeout2);
    }, [blink]);

    useEffect(() => {
        if (index === words.length) {
            setIndex(0);
            return;
        }
        if (subIndex === words[index].length + 1 && !reverse) {
            setReverse(true);
            return;
        }
        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }
        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, Math.max(reverse ? 50 : subIndex === words[index].length ? 2000 : 100, Math.random() * 50));
        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words]);

    return (
        <span translate="no">
            {`${words[index].substring(0, subIndex)}`}
            {blink ? "|" : " "}
        </span>
    );
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, topContent, cardMaxWidthClass = "max-w-[460px]", embedded = false, leftPanel, roleIdentity }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (embedded) {
        return (
            <div className="w-full text-foreground">
                {topContent && <div className="mb-4">{topContent}</div>}
                <div className={`w-full ${cardMaxWidthClass} mx-auto`}>
                    <div className="rounded-[2.5rem] border border-divider bg-content1/80 p-8 shadow-2xl backdrop-blur-3xl">
                        <div className="mb-8 items-center flex flex-col text-center">
                            <h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-foreground/50 text-[10px] uppercase font-black tracking-[0.3em]">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <div className="space-y-4">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-obaol-50/45 text-slate-900 selection:bg-obaol-500/30 dark:bg-[#090806] dark:text-foreground">
            {/* Branded background layer */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(207,152,60,0.08)_0%,_transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_50%,_rgba(207,152,60,0.03)_0%,_transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:10px_10px]" />
                
                {[...Array(20)].map((_, i) => (
                    <FloatingPixel key={i} delay={i * 0.5} />
                ))}

                {/* Ambient Glows */}
                <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-obaol-500/10 opacity-30 blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[150px] opacity-20" />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col lg:flex-row">
                {/* Left Side: Tactical Branding */}
                <motion.div
                className="relative hidden w-5/12 flex-col items-center justify-center overflow-hidden border-r border-obaol-200/70 bg-white/70 p-8 backdrop-blur-2xl dark:border-obaol-500/10 dark:bg-white/[0.01] lg:flex xl:p-10"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                >
                    {/* Background Scanline */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />

                    <div className="relative z-20 w-full max-w-xl mx-auto">
                        <Link href="/" className="flex items-center gap-4 mb-8 group cursor-pointer justify-center lg:justify-start">
                            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-obaol-500/30 bg-obaol-500/10 transition-transform duration-500 group-hover:scale-110">
                                <Image src="/logo.png" alt="OBAOL" width={32} height={32} className="object-contain" />
                                <div className="absolute inset-0 bg-obaol-500/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold leading-none tracking-tight">OBAOL <span className="bg-gradient-to-r from-obaol-700 to-obaol-500 bg-clip-text text-transparent dark:from-obaol-200">SUPREME</span></span>
                                <span className="text-[9px] font-black tracking-[0.3em] text-slate-500 dark:text-default-400">AGRO TRADE EXECUTION PLATFORM</span>
                            </div>
                        </Link>

                        {leftPanel ? (
                            <div className="space-y-7 text-center lg:text-left">
                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: 0.1 }}
                                >
                                    {roleIdentity && (
                                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                                            <span className="h-2 w-2 rounded-full bg-obaol-500" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 dark:text-foreground/70">
                                                {roleIdentity.panelLabel}
                                            </span>
                                        </div>
                                    )}
                                    <p className="mb-2 text-4xl font-bold leading-[0.96] tracking-tight text-slate-900 dark:text-foreground xl:text-5xl">
                                        {leftPanel.headline} <br />
                                        <span className={`bg-clip-text text-transparent ${roleIdentity?.highlightClassName || "bg-gradient-to-r from-obaol-200 via-obaol-400 to-obaol-600"}`}>
                                            {leftPanel.highlight || "TRADE WORKSPACE"}
                                        </span>
                                    </p>
                                </motion.div>

                                <motion.div
                                    className="max-w-lg mx-auto lg:mx-0 space-y-5"
                                    initial={{ opacity: 0, x: -14 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.45, delay: 0.2 }}
                                >
                                    <p className="border-l-2 border-obaol-500/40 pl-4 text-base font-medium leading-relaxed text-slate-600 dark:text-foreground/60 xl:text-lg">
                                        {leftPanel.description}
                                    </p>

                                    {!!leftPanel.points?.length && (
                                        <div className="grid gap-2 pt-3">
                                            {leftPanel.points.map((point, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-foreground/40 uppercase tracking-widest group/point">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-obaol-500/20 transition-colors group-hover:bg-obaol-500" />
                                                    {point}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!!roleIdentity?.audienceLabels?.length && (
                                        <div className="pt-1 space-y-2.5">
                                            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-default-400">
                                                Primary Users
                                            </p>
                                            <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start">
                                                {roleIdentity.audienceLabels.map((tag, idx) => (
                                                    <span
                                                        key={`${tag}-${idx}`}
                                                        className="px-2.5 py-0.5 rounded-full border border-slate-200 bg-white/80 text-[9px] font-bold uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-foreground/70"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 justify-center lg:justify-start">
                                        {leftPanel.knowMoreLink && (
                                            <Link
                                                href={leftPanel.knowMoreLink}
                                                className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-obaol-200 bg-white px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.18em] shadow-sm transition-all hover:border-obaol-500/30 hover:bg-obaol-500/10 hover:text-obaol-700 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-obaol-500/20 dark:hover:text-obaol-300"
                                            >
                                                Learn about this role
                                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <p className="mb-4 text-5xl font-bold uppercase leading-[0.9] tracking-tight text-slate-900 dark:text-foreground xl:text-7xl">
                                    OBAOL <br />
                                    <span className="block min-h-[1.2em] bg-gradient-to-r from-obaol-200 via-obaol-400 to-obaol-600 bg-clip-text leading-tight text-transparent">
                                        <TypewriterEffect words={["BUYING", "SELLING", "LOGISTICS", "INVENTORY", "TRADE EXECUTION"]} />
                                    </span>
                                </p>
                                <p className="max-w-sm border-l-2 border-obaol-500/40 pl-6 text-xl font-medium leading-relaxed text-slate-600 dark:text-foreground/60">
                                    Bring product discovery, verification, logistics, documents, and orders into one guided workflow.
                                </p>
                            </div>
                        )}
                    </div>

                    
                </motion.div>

                {/* Right side: account form */}
                <div className="w-full lg:w-7/12 flex flex-col h-full bg-transparent overflow-y-auto custom-scrollbar relative">
                    <div className="flex-grow flex items-center justify-center p-4 lg:p-8 xl:p-10 relative z-10">
                        <motion.div
                            className={`w-full ${cardMaxWidthClass} relative`}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
                        >
                            {/* Card Decoration */}
                            <div className="absolute left-1/2 top-0 -z-10 h-[120%] w-[120%] -translate-x-1/2 rounded-full bg-obaol-500/[0.04] blur-[120px]" />
                            {roleIdentity && (
                                <div className={`absolute inset-4 rounded-[2.3rem] border border-white/5 -z-10 pointer-events-none ${roleIdentity.motifClassName}`} />
                            )}

                            {/* Mobile Identity */}
                            <Link href="/" className="lg:hidden mb-3 flex flex-col items-center group cursor-pointer">
                                <div className="relative mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-obaol-500/30 bg-obaol-500/10 shadow-xl shadow-obaol-500/10 transition-transform group-hover:scale-110">
                                    <Image src="/logo.png" alt="OBAOL" width={40} height={40} className="object-contain" />
                                </div>
                                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-foreground">
                                    OBAOL <span className="text-obaol-700 dark:text-obaol-300">Supreme</span>
                                </h2>
                                <p className="text-[8px] font-black tracking-[0.35em] text-slate-500 dark:text-default-400 mt-1 uppercase">Go-To Agro Trade Platform</p>
                            </Link>

                            <div className="relative group">
                                <motion.div
                                    className="relative overflow-hidden rounded-[2.2rem] border border-obaol-200/60 bg-white/85 p-5 shadow-xl shadow-obaol-900/5 backdrop-blur-3xl dark:border-obaol-500/10 dark:bg-[#0E0D0A]/85 dark:shadow-2xl dark:shadow-black/40 lg:rounded-[2.5rem] lg:p-7"
                                    whileHover={{ boxShadow: "0 40px 120px -20px rgba(15, 23, 42, 0.08)" }}
                                    transition={{ duration: 0.45, ease: "easeOut" }}
                                >
                                    {/* Glass Accents */}
                                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    <div className="absolute right-0 top-0 -mr-20 -mt-20 h-40 w-40 rounded-full bg-obaol-500/10 opacity-0 blur-[80px] transition-opacity duration-1000 group-hover:opacity-100" />

                                    <div className="mb-4 relative">
                                        <h1 className="text-2xl font-bold leading-none tracking-tight text-slate-900 dark:text-foreground lg:text-3xl">
                                            {title}
                                        </h1>
                                        {subtitle && (
                                            <p className="text-slate-500 dark:text-default-400 text-[10px] font-bold uppercase tracking-[0.18em] mt-2 opacity-60">
                                                {subtitle}
                                            </p>
                                        )}
                                    </div>

                                    {children}
                                </motion.div>

                                {/* Account security note */}
                                <div className="mt-4 flex items-center justify-center gap-3 opacity-35 dark:opacity-20">
                                    <div className="h-px flex-grow bg-gradient-to-r from-transparent to-divider" />
                                    <div className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-default-400 whitespace-nowrap">
                                        Secure Connection
                                    </div>
                                    <div className="h-px flex-grow bg-gradient-to-l from-transparent to-divider" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
