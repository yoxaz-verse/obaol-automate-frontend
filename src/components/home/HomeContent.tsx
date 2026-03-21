"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiShield, FiZap, FiGlobe, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/home/header";
import HeroSection from "@/components/home/herosection";
import CTASection from "@/components/home/ctasection";
import Footer from "@/components/home/footer";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";

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

export default function HomeContent() {
    return (
        <>
            <Header />
            <HeroSection />
            <section className="container mx-auto max-w-7xl px-4 md:px-6 mb-10">
                <IndiaFirstNote />
            </section>

            {/* ── FEATURE GRID ── */}
            <section className="relative py-16 md:py-24 bg-background overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-default-200 to-transparent opacity-50" />

                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="max-w-3xl mb-12 md:mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground">
                            Built for <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent italic">Serious Trade.</span>
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
                                icon: <FiShield size={22} />,
                                color: "text-blue-500"
                            },
                            {
                                title: "Unified Execution",
                                desc: "Integrated procurement, documentation, and logistics in one cohesive system. No more fragmented email chains.",
                                icon: <FiZap size={22} />,
                                color: "text-orange-500"
                            },
                            {
                                title: "Global Compliance",
                                desc: "Built to handle cross-border trade complexities, from domestic logistics to international customs standards.",
                                icon: <FiGlobe size={22} />,
                                color: "text-emerald-500"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-content1 border border-default-200 hover:border-orange-500/30 transition-all hover:shadow-2xl hover:shadow-orange-500/5"
                            >
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${feature.color.replace('text-', 'bg-')}/10 ${feature.color} flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 tracking-tight">{feature.title}</h3>
                                <p className="text-default-500 text-sm md:text-base leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── INTENT CARDS ── */}
            <section className="py-16 md:py-24 bg-default-50/50 border-y border-default-100">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                        {intentCards.map((card, i) => (
                            <motion.article
                                key={card.href}
                                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative group p-[1px] bg-gradient-to-br from-default-200 via-transparent to-default-200 rounded-[2rem] md:rounded-[3rem] overflow-hidden transition-all hover:from-orange-500/20"
                            >
                                <div className="relative p-8 md:p-12 rounded-[1.9rem] md:rounded-[2.8rem] bg-white dark:bg-[#0A0A0A] h-full flex flex-col justify-between items-start gap-8 md:gap-12">
                                    <div className="space-y-4 md:space-y-6">
                                        <h3 className="text-2xl md:text-3xl font-black tracking-tight">{card.title}</h3>
                                        <p className="text-base md:text-lg text-default-500 leading-relaxed font-medium">{card.description}</p>
                                    </div>

                                    <Link
                                        href={card.href}
                                        className="inline-flex items-center gap-3 md:gap-4 px-8 py-4 md:px-10 md:py-5 rounded-[2rem] bg-foreground text-background font-black text-base md:text-lg transition-all hover:scale-105 active:scale-95 group/btn"
                                    >
                                        {card.cta}
                                        <FiArrowRight size={20} className="md:size-6 group-hover/btn:translate-x-2 transition-transform" />
                                    </Link>

                                    {/* Background accent */}
                                    <div className="absolute top-0 right-0 p-6 md:p-8 text-foreground/[0.03] group-hover:text-orange-500/[0.05] transition-colors pointer-events-none">
                                        <FiGlobe size={150} className="md:size-[200px]" />
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── COVERAGE STRIP ── */}
            <section className="relative py-32 overflow-hidden bg-black text-white">
                <Image
                    src="/images/obaol_hero_premium.png"
                    alt="Map"
                    fill
                    className="object-cover opacity-10 grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

                <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
                    <div className="max-w-3xl space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                            Cross-border execution <br />
                            <span className="text-orange-500">without the friction.</span>
                        </h2>
                        <p className="text-xl text-white/50 leading-relaxed font-medium">
                            Coordinating verified sourcing, documentation, and logistics across <span className="text-white">India, GCC, Europe, and the United States.</span>
                        </p>
                        <div className="flex flex-wrap gap-10 pt-4">
                            {['INDIA', 'GCC', 'EUROPE', 'USA'].map(region => (
                                <div key={region} className="flex flex-col gap-2">
                                    <span className="text-orange-500 font-black text-2xl tracking-widest">{region}</span>
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
