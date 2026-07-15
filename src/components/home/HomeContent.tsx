"use client";

import { motion } from "framer-motion";
import { FiArrowRight, FiCompass, FiGitBranch } from "react-icons/fi";
import { FaShieldHalved, FaTruckFront, FaEarthAsia } from "react-icons/fa6";
import Link from "next/link";
import Header from "@/components/home/header";
import HeroSection from "@/components/home/herosection";
import DeferredServiceShowcase from "@/components/home/DeferredServiceShowcase";
import CTASection from "@/components/home/ctasection";
import Footer from "@/components/home/footer";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";
import { homeTitleStyles } from "@/components/home/homeTitleStyles";
import PerspectiveGateway from "@/components/home/PerspectiveGateway";
import UnifiedExecutionWorkspace from "@/components/home/UnifiedExecutionWorkspace";

const intentCards = [
    {
        title: "Why OBAOL",
        description: "Understand why OBAOL is needed, what problem it solves, and why execution structure matters in real commodity trade.",
        href: "/why-obaol",
        cta: "Read Why OBAOL",
        eyebrow: "The OBAOL rationale",
        number: "01",
    },
    {
        title: "How OBAOL Works",
        description: "See the complete step-by-step execution model. This page also includes procurement, verification, logistics, and settlement flow.",
        href: "/how-it-works",
        cta: "View How It Works",
        eyebrow: "The execution model",
        number: "02",
    },
];

export default function HomeContent() {
    return (
        <>
            <Header />
            <HeroSection />
            <PerspectiveGateway />
            <DeferredServiceShowcase />
            <section id="capability-explorer" className="relative scroll-mt-28 py-12 md:scroll-mt-36 md:py-16">
                <div className="container mx-auto max-w-6xl xl:max-w-7xl px-6 sm:px-12">
                    <div className="flex flex-col gap-10 md:gap-16">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start">
                            <div className="lg:col-span-5 space-y-5 md:space-y-6">
                                <p className={homeTitleStyles.sectionKicker}>
                                    Industry Workspace
                                </p>
                                <h2 className={homeTitleStyles.sectionTitle}>
                                    What We Do
                                </h2>
                                <p className="text-base md:text-xl text-foreground/80 font-medium leading-relaxed">
                                    OBAOL is an agro trade execution platform. Its Commodity Catalog and Trade Listings help participants discover commodity coverage before enquiries, verification, logistics, and orders move through one connected workflow.
                                </p>
                            </div>
                            <div className="lg:col-span-7 space-y-4 lg:pt-14">
                                <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed">
                                    Build products, run enquiries, move orders, and manage documents with execution panels for each function. Importer Service and Warehouse Rent Management are built in, so logistics and storage stay connected end‑to‑end.
                                </p>
                                <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed">
                                    All of this runs in one agro execution system. Built for India-first operations, supporting global trade from India to international markets seamlessly.
                                </p>
                            </div>
                        </div>

                        <UnifiedExecutionWorkspace />

                    </div>

                </div>
            </section>
            <section className="container mx-auto max-w-6xl xl:max-w-7xl px-6 sm:px-12 mb-10">
                <IndiaFirstNote />
            </section>

            {/* ── FEATURE GRID ── */}
            <section className="relative py-16 md:py-24 bg-background overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-default-200 to-transparent opacity-50" />

                <div className="container mx-auto max-w-6xl xl:max-w-7xl px-6 sm:px-12">
                    <div className="max-w-3xl mb-12 md:mb-16 space-y-4">
                        <h2 className={homeTitleStyles.sectionTitle}>
                            Built for <span className={homeTitleStyles.sectionTitleAccent}>Serious Trade.</span>
                        </h2>
                        <p className="text-base md:text-xl text-default-500 font-medium leading-relaxed">
                            OBAOL moves trades from conversation to closure with verified counterparties and execution support across every milestone.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            {
                                title: "Verified Network",
                                desc: "Every supplier, buyer, and operator undergoes a rigorous multi-stage verification process to ensure trade reputability.",
                                icon: <FaShieldHalved size={22} />,
                                color: "text-blue-500"
                            },
                            {
                                title: "Unified Execution",
                                desc: "Integrated procurement, documentation, and logistics in one cohesive system. No more fragmented email chains.",
                                icon: <FaTruckFront size={22} />,
                                color: "text-obaol-700 dark:text-obaol-300"
                            },
                            {
                                title: "Global Compliance",
                                desc: "Built to handle cross-border trade complexities, from domestic logistics to international customs standards.",
                                icon: <FaEarthAsia size={22} />,
                                color: "text-emerald-500"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-content1 border border-default-200 hover:border-obaol-500/30 transition-all hover:shadow-2xl hover:shadow-obaol-500/5"
                            >
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${feature.color.replace('text-', 'bg-')}/10 ${feature.color} flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                    {feature.icon}
                                </div>
                                <h3 className={`${homeTitleStyles.cardTitle} mb-3 md:mb-4`}>{feature.title}</h3>
                                <p className="text-default-500 text-sm md:text-base leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── INTENT CARDS ── */}
            <section className="relative py-14 md:py-28 bg-default-50/50 border-y border-default-100 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
                <div className="absolute left-1/2 top-0 h-40 w-[44rem] -translate-x-1/2 rounded-full bg-obaol-500/10 blur-[100px] pointer-events-none" />
                <div className="container mx-auto max-w-6xl xl:max-w-7xl px-6 sm:px-12">
                    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {intentCards.map((card, i) => (
                            <motion.article
                                key={card.href}
                                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative group rounded-[1.75rem] md:rounded-[2.5rem] border border-default-200/80 bg-content1/90 overflow-hidden shadow-[0_24px_80px_-48px_rgba(0,0,0,0.65)] transition-all duration-500 hover:-translate-y-1 hover:border-obaol-400/50 hover:shadow-[0_28px_90px_-45px_rgba(207,152,60,0.42)]"
                            >
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-obaol-300/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative h-full p-7 md:p-10 lg:p-12 flex flex-col">
                                    <div className="mb-10 flex items-center justify-between">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-obaol-400/20 bg-obaol-500/[0.07] px-3 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-[0.16em] text-obaol-700 dark:text-obaol-300">
                                            <span className="h-1.5 w-1.5 rounded-full bg-obaol-400 shadow-[0_0_10px_rgba(207,152,60,0.9)]" />
                                            {card.eyebrow}
                                        </span>
                                        <span className="font-mono text-xs font-bold tracking-[0.2em] text-default-400">{card.number} / 02</span>
                                    </div>

                                    <div className="relative mb-10 h-36 overflow-hidden rounded-[1.5rem] border border-default-200/60 bg-default-50/70 dark:bg-black/30" aria-hidden="true">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(207,152,60,0.12),transparent_65%)]" />
                                        {i === 0 ? (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="absolute h-28 w-28 rounded-full border border-dashed border-obaol-400/30 transition-transform duration-[1200ms] group-hover:rotate-45" />
                                                <div className="absolute h-20 w-20 rounded-full border border-obaol-400/20" />
                                                {["top-4 left-1/2 -translate-x-1/2", "bottom-4 left-8", "bottom-4 right-8"].map((position) => (
                                                    <span key={position} className={`absolute ${position} h-2.5 w-2.5 rounded-full border-2 border-content1 bg-obaol-400 shadow-[0_0_18px_rgba(207,152,60,0.65)]`} />
                                                ))}
                                                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-obaol-400/30 bg-content1 text-obaol-500 shadow-xl shadow-obaol-500/10 transition-transform duration-500 group-hover:scale-110">
                                                    <FiCompass size={25} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center px-8">
                                                <div className="relative flex w-full max-w-xs items-center justify-between">
                                                    <div className="absolute left-4 right-4 top-4 h-px -translate-y-1/2 bg-gradient-to-r from-obaol-400/20 via-obaol-400/80 to-obaol-400/20" />
                                                    {["Plan", "Verify", "Move", "Settle"].map((step, stepIndex) => (
                                                        <div key={step} className="relative flex flex-col items-center gap-2">
                                                            <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-black transition-all duration-500 ${stepIndex === 1 ? "border-obaol-400 bg-obaol-400 text-obaol-950 shadow-[0_0_22px_rgba(207,152,60,0.35)] group-hover:scale-110" : "border-default-300 bg-content1 text-default-500"}`}>
                                                                {stepIndex + 1}
                                                            </span>
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-default-400">{step}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <FiGitBranch className="absolute right-4 top-4 text-obaol-400/30" size={18} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-9 flex-1 space-y-3 md:space-y-5">
                                        <h3 className={homeTitleStyles.cardTitleLarge}>{card.title}</h3>
                                        <p className="max-w-xl text-sm md:text-base text-default-500 leading-relaxed font-medium">{card.description}</p>
                                    </div>

                                    <Link
                                        href={card.href}
                                        className="group/btn inline-flex w-full items-center justify-between rounded-2xl border border-default-200 bg-default-50/80 px-5 py-4 text-sm md:text-base font-black text-foreground transition-all duration-300 hover:border-obaol-400/40 hover:bg-obaol-500 hover:text-obaol-950"
                                    >
                                        <span>{card.cta}</span>
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-obaol-500 text-obaol-950 transition-all group-hover/btn:bg-obaol-950 group-hover/btn:text-obaol-200">
                                            <FiArrowRight size={18} className="transition-transform group-hover/btn:translate-x-0.5" />
                                        </span>
                                    </Link>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── COVERAGE STRIP ── */}
            <section className="relative py-32 overflow-hidden bg-black text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

                <div className="container mx-auto max-w-6xl xl:max-w-7xl px-6 sm:px-12 relative z-10">
                    <div className="max-w-3xl space-y-8">
                        <h2 className={`${homeTitleStyles.sectionTitle} leading-tight md:text-6xl`}>
                            <span className="text-white">India-first execution</span> <br />
                            <span className="bg-gradient-to-r from-obaol-200 via-obaol-400 to-obaol-500 bg-clip-text text-transparent">from India to anywhere.</span>
                        </h2>
                        <p className="text-xl text-white/50 leading-relaxed font-medium">
                            Operations are currently India‑based. We support exports from India to global markets.
                        </p>
                        <div className="flex flex-wrap gap-10 pt-4">
                            {['INDIA', 'GCC', 'EUROPE', 'USA'].map(region => (
                                <div key={region} className="flex flex-col gap-2">
                                    <span className="text-obaol-300 font-bold text-2xl tracking-widest">{region}</span>
                                    <div className="w-full h-px bg-white/10" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <CTASection />
            <Footer />
        </>
    );
}
