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
            className="absolute w-1 h-1 bg-warning-500/30 rounded-full"
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

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, topContent, cardMaxWidthClass = "max-w-[460px]", embedded = false, leftPanel }) => {
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
                            <h2 className="text-3xl font-black italic tracking-tighter text-foreground mb-2 uppercase">
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
        <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#04070f] dark:text-foreground relative font-sans selection:bg-warning-500/30">
            {/* Mission Control Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,165,36,0.08)_0%,_transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_50%,_rgba(245,165,36,0.03)_0%,_transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:10px_10px]" />
                
                {[...Array(20)].map((_, i) => (
                    <FloatingPixel key={i} delay={i * 0.5} />
                ))}

                {/* Ambient Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-warning-500/10 rounded-full blur-[150px] opacity-20" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[150px] opacity-20" />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col lg:flex-row">
                {/* Left Side: Tactical Branding */}
                <motion.div
                    className="hidden lg:flex w-5/12 flex-col justify-between p-12 xl:p-16 relative border-r border-slate-200 bg-white/70 backdrop-blur-2xl overflow-hidden dark:border-white/5 dark:bg-white/[0.01]"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Background Scanline */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />

                    <div className="relative z-20">
                        <div className="flex items-center gap-4 mb-12 group cursor-pointer">
                            <div className="w-12 h-12 relative flex items-center justify-center bg-warning-500/10 rounded-xl border border-warning-500/30 group-hover:scale-110 transition-transform duration-500">
                                <Image src="/logo.png" alt="OBAOL" width={32} height={32} className="object-contain" />
                                <div className="absolute inset-0 bg-warning-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black italic tracking-tighter leading-none">OBAOL <span className="text-warning-500">SUPREME</span></span>
                                <span className="text-[9px] font-black tracking-[0.4em] text-slate-500 dark:text-default-400">GO-TO PLATFORM FOR AGRO TRADE ECOSYSTEM</span>
                            </div>
                        </div>

                        {leftPanel ? (
                            <div className="space-y-10">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    <h1 className="text-4xl xl:text-6xl font-black tracking-tighter text-slate-900 dark:text-foreground mb-3 leading-[0.9] uppercase italic">
                                        {leftPanel.headline} <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning-500 to-amber-600">
                                            {leftPanel.highlight || "CORE_NETWORK"}
                                        </span>
                                    </h1>
                                </motion.div>

                                <motion.div
                                    className="max-w-md space-y-6"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                    <p className="text-base xl:text-lg text-slate-600 dark:text-foreground/60 pl-5 border-l-2 border-warning-500/40 leading-relaxed font-medium italic">
                                        {leftPanel.description}
                                    </p>

                                    {!!leftPanel.points?.length && (
                                        <div className="grid gap-2 pt-3">
                                            {leftPanel.points.map((point, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-foreground/40 uppercase tracking-widest group/point">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-warning-500/20 group-hover:bg-warning-500 transition-colors" />
                                                    {point}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!!leftPanel.tags?.length && (
                                        <div className="pt-1 space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-default-400">
                                                Who Can Access
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {leftPanel.tags.map((tag, idx) => (
                                                    <span
                                                        key={`${tag}-${idx}`}
                                                        className="px-2.5 py-0.5 rounded-full border border-slate-200 bg-white/80 text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-foreground/70"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                                        {leftPanel.knowMoreLink && (
                                            <Link
                                                href={leftPanel.knowMoreLink}
                                                className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-warning-500/10 hover:text-warning-600 hover:border-warning-500/30 transition-all group shadow-sm justify-center dark:bg-white/[0.03] dark:border-white/10 dark:hover:text-warning-500 dark:hover:border-warning-500/20"
                                            >
                                                Access Specifications
                                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <h1 className="text-5xl xl:text-7xl font-black tracking-tighter text-slate-900 dark:text-foreground mb-4 leading-[0.85] uppercase italic">
                                    OBAOL <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning-500 to-amber-600 min-h-[1.2em] block leading-tight">
                                        <TypewriterEffect words={["AUTOMATION", "LOGISTICS", "CHAIN_CORE", "INVENTORY", "TRADE_FLOW"]} />
                                    </span>
                                </h1>
                                <p className="text-xl text-slate-600 dark:text-foreground/60 pl-6 border-l-2 border-warning-500/40 leading-relaxed font-medium italic max-w-sm">
                                    Executing the future of Global Agro-Trade via autonomous protocol synchronization.
                                </p>
                            </div>
                        )}
                    </div>

                    
                </motion.div>

                {/* Right Side: Operative Terminal */}
                <div className="w-full lg:w-7/12 flex flex-col h-full bg-transparent overflow-y-auto custom-scrollbar relative">
                    <div className="flex-grow flex items-center justify-center p-6 lg:p-12 xl:p-20 relative z-10">
                        <motion.div
                            className={`w-full ${cardMaxWidthClass} relative`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Card Decoration */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-warning-500/[0.03] blur-[120px] rounded-full -z-10" />

                            {/* Mobile Identity */}
                            <div className="lg:hidden mb-12 flex flex-col items-center">
                                <div className="w-16 h-16 relative bg-warning-500/10 rounded-2xl border border-warning-500/30 mb-6 flex items-center justify-center shadow-xl shadow-warning-500/10">
                                    <Image src="/logo.png" alt="OBAOL" width={40} height={40} className="object-contain" />
                                </div>
                                <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-foreground uppercase">
                                    OBAOL <span className="text-warning-500">Supreme</span>
                                </h2>
                                <p className="text-[9px] font-black tracking-[0.5em] text-slate-500 dark:text-default-400 mt-2 uppercase">Go-To Agro Trade Platform</p>
                            </div>

                            <div className="relative group">
                                <motion.div
                                    className="relative bg-white/85 dark:bg-[#0B0F14]/80 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-[3rem] p-8 lg:p-14 shadow-xl dark:shadow-2xl overflow-hidden shadow-slate-200/40 dark:shadow-black/40"
                                    whileHover={{ boxShadow: "0 40px 120px -20px rgba(15, 23, 42, 0.08)" }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    {/* Glass Accents */}
                                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-warning-500/10 blur-[80px] rounded-full -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                    <div className="mb-12 relative">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 rounded-full bg-warning-500 animate-pulse shadow-[0_0_10px_rgba(245,165,36,0.5)]" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-warning-600/70 dark:text-warning-500/60">Secure Access</span>
                                        </div>
                                        <h2 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-slate-900 dark:text-foreground uppercase leading-none">
                                            {title}
                                        </h2>
                                        {subtitle && (
                                            <p className="text-slate-500 dark:text-default-400 text-xs font-bold uppercase tracking-[0.2em] mt-4 opacity-60">
                                                {subtitle}
                                            </p>
                                        )}
                                    </div>

                                    {children}
                                </motion.div>

                                {/* Terminal Footer Decor */}
                                <div className="mt-8 flex items-center justify-center gap-6 opacity-40 dark:opacity-20">
                                    <div className="h-px flex-grow bg-gradient-to-r from-transparent to-divider" />
                                    <div className="text-[8px] font-black uppercase tracking-[0.6em] text-slate-500 dark:text-default-400 whitespace-nowrap">
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
