"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { FaShieldHalved, FaTruckFront, FaEarthAsia, FaGlobe } from "react-icons/fa6";
import Link from "next/link";
import Header from "@/components/home/header";
import HeroSection from "@/components/home/herosection";
import ServiceShowcase from "@/components/home/ServiceShowcase";
import DealWalkthrough from "@/components/home/DealWalkthrough";
import CTASection from "@/components/home/ctasection";
import Footer from "@/components/home/footer";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";
import { homeTitleStyles } from "@/components/home/homeTitleStyles";
import PerspectiveGateway from "@/components/home/PerspectiveGateway";

const intentCards = [
    {
        title: "Why OBAOL",
        description: "Understand why OBAOL is needed, what problem it solves, and why execution structure matters in real commodity trade.",
        href: "/why-obaol",
        cta: "Read Why OBAOL",
    },
    {
        title: "How OBAOL Works",
        description: "See the complete step-by-step execution model. This page also includes procurement, verification, logistics, and settlement flow.",
        href: "/how-it-works",
        cta: "View How It Works",
    },
];

const panelFeatures = [
    {
        title: "Verified Ecosystem",
        desc: "Approval checks, role‑based access, and verified participants.",
    },
    {
        title: "Enquiry Hub",
        desc: "Manage enquiries and keep every function in sync.",
    },
    {
        title: "Execution Panels",
        desc: "Role‑based execution queues per function/person in real time.",
    },
    {
        title: "Commodity Catalog & Trade Listings",
        desc: "Commodity discovery and current trade listings in one connected view.",
    },
    {
        title: "Samples & Documents",
        desc: "Sample Requests and compliance documents stay tied to every order.",
    },
    {
        title: "Importer Service",
        desc: "Imports workflow covering customs, ports, and distribution steps.",
    },
    {
        title: "Warehouse Rent Management",
        desc: "Warehouse booking services with capacity planning and reservations.",
    },
    {
        title: "Orders & External Orders",
        desc: "Track internal and external orders with live status updates.",
    },
] as const;

export default function HomeContent() {
    const scrollToDealWalkthrough = () => {
        if (typeof window === "undefined") {
            return;
        }

        const target = document.getElementById("deal-walkthrough");
        if (!target) {
            return;
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
        });
    };

    return (
        <>
            <Header />
            <HeroSection />
            <PerspectiveGateway />
            <ServiceShowcase />
            <section className="relative py-12 md:py-16">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                            {panelFeatures.map((feature) => (
                                <button
                                    key={feature.title}
                                    type="button"
                                    onClick={scrollToDealWalkthrough}
                                    aria-label={`Go to deal walkthrough from ${feature.title}`}
                                    className="group relative p-6 md:p-7 rounded-[2rem] border border-default-200/60 bg-content1/30 backdrop-blur-md hover:border-obaol-500/45 hover:bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-obaol-500/10 active:scale-[0.99] cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                    <h3 className={`${homeTitleStyles.cardTitle} flex items-center gap-3`}>
                                        <div className="w-2 h-4 rounded-full bg-obaol-500/30 group-hover:bg-obaol-500 transition-colors duration-300" />
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed mt-3 ml-5 group-hover:text-foreground/80 transition-colors">{feature.desc}</p>
                                </button>
                            ))}
                        </div>

                    </div>

                    <DealWalkthrough />
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
            <section className="py-10 md:py-24 bg-default-50/50 border-y border-default-100">
                <div className="container mx-auto max-w-6xl xl:max-w-7xl px-6 sm:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        {intentCards.map((card, i) => (
                            <motion.article
                                key={card.href}
                                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative group p-[1px] bg-gradient-to-br from-default-200 via-transparent to-default-200 rounded-[1.5rem] md:rounded-[3rem] overflow-hidden transition-all hover:from-obaol-500/25"
                            >
                                <div className="relative p-6 md:p-12 rounded-[1.4rem] md:rounded-[2.8rem] bg-white dark:bg-[#0A0A0A] h-full flex flex-col justify-between items-start gap-6 md:gap-12">
                                    <div className="space-y-3 md:space-y-6">
                                        <h3 className={homeTitleStyles.cardTitleLarge}>{card.title}</h3>
                                        <p className="text-sm md:text-lg text-default-500 leading-relaxed font-medium">{card.description}</p>
                                    </div>

                                    <Link
                                        href={card.href}
                                        className="inline-flex items-center gap-2 md:gap-4 px-6 py-3 md:px-10 md:py-5 rounded-full border border-obaol-300/40 bg-obaol-500 text-obaol-950 font-bold text-sm md:text-lg shadow-[0_14px_34px_-20px_rgba(207,152,60,0.8)] transition-all hover:scale-105 hover:bg-obaol-400 active:scale-95 group/btn"
                                    >
                                        {card.cta}
                                        <FiArrowRight size={18} className="md:size-6 group-hover/btn:translate-x-2 transition-transform" />
                                    </Link>

                                    {/* Background accent */}
                                    <div className="absolute top-0 right-0 p-4 md:p-8 text-foreground/[0.03] group-hover:text-obaol-500/[0.07] transition-colors pointer-events-none">
                                        <FaGlobe size={100} className="md:size-[200px]" />
                                    </div>
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
