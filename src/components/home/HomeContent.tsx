"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiShield, FiZap, FiGlobe, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
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
            <section className="relative py-12 md:py-16">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="flex flex-col gap-10 md:gap-16">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start">
                            <div className="lg:col-span-5 space-y-5 md:space-y-6">
                                <p className="inline-flex items-center gap-2 rounded-full border border-warning-500/20 bg-warning-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-warning-500 shadow-sm">
                                    Industry Workspace
                                </p>
                                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground italic">
                                    What This Panel Does
                                </h2>
                                <p className="text-base md:text-xl text-foreground/80 font-medium leading-relaxed">
                                    OBAOL is a commodity execution platform — the operating system for agro trade workflows, not a marketplace.
                                </p>
                            </div>
                            <div className="lg:col-span-7 space-y-4 lg:pt-14">
                                <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed">
                                    Build products, run enquiries, move orders, and manage documents with execution panels for each function. Importer Service and Warehouse Rent Management are built in, so logistics and storage stay connected end‑to‑end.
                                </p>
                                <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed">
                                    All of this runs in one execution workspace. Built for India-first operations, supporting global trade from India to international markets seamlessly.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                            {[
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
                                    title: "Product & Marketplace",
                                    desc: "My Product, Global Catalog, and Marketplace discovery in one view.",
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
                                    desc: "Warehouse Space rentals with capacity planning and reservations.",
                                },
                                {
                                    title: "Orders & External Orders",
                                    desc: "Track internal and external orders with live status updates.",
                                },
                            ].map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group relative p-6 md:p-7 rounded-[2rem] border border-default-200/60 bg-content1/30 backdrop-blur-md hover:border-warning-500/40 hover:bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-default-200 dark:hover:shadow-none cursor-default"
                                >
                                    <h3 className="text-lg md:text-xl font-black tracking-tight text-foreground flex items-center gap-3">
                                        <div className="w-2 h-4 rounded-full bg-warning-500/30 group-hover:bg-warning-500 transition-colors duration-300" />
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed mt-3 ml-5 group-hover:text-foreground/80 transition-colors">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-20 rounded-[3rem] border border-warning-500/20 bg-gradient-to-b from-content1/60 to-background/40 backdrop-blur-3xl px-6 py-10 md:px-14 md:py-14 shadow-lg shadow-default-200/50 dark:shadow-none relative overflow-hidden group/panel border-b-warning-500/40">
                        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-warning-500/5 blur-[120px] pointer-events-none group-hover/panel:bg-warning-500/10 transition-colors duration-1000" />
                        <div className="max-w-3xl space-y-4 relative z-10">
                            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning-500/10 border border-warning-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-warning-500 shadow-sm">
                                Deal Walkthrough
                            </p>
                            <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground italic">
                                Example: Black Pepper export from India to GCC
                            </h3>
                            <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed max-w-xl">
                                A real‑world flow managed end‑to‑end inside the panel — from the first enquiry to final settlement.
                            </p>
                        </div>

                        {/* Interactive Tracker Visualization */}
                        <div className="my-10 relative z-10 p-6 md:p-8 rounded-[2.5rem] bg-background/60 shadow-inner border border-default-200/50 overflow-hidden group">
                           <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent via-warning-500/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-success-500 animate-[pulse_2s_infinite] shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                                        <span className="text-sm md:text-base font-black uppercase tracking-widest text-foreground">Live Order Tracking</span>
                                    </div>
                                    <span className="text-xs md:text-sm text-foreground/60 font-medium">Track your massive scale global trades, just like you track on Zomato or Uber.</span>
                                </div>
                                <div className="flex flex-row items-center gap-2 px-4 py-2 bg-success-500/10 dark:bg-success-500/20 text-success-600 dark:text-success-400 rounded-full border border-success-500/20 shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest pt-px">Inland Transport / Step 7</span>
                                </div>
                           </div>

                           {/* Progress Bar */}
                           <div className="relative mb-2 mt-8 md:mt-12">
                                {/* Track - perfectly mathematically centered behind the nodes */}
                                <div className="absolute top-0 left-[15px] md:left-[30px] right-[15px] md:right-[30px] h-[14px] md:h-[24px] flex items-center">
                                     <div className="w-full h-1 md:h-1.5 bg-default-200/60 rounded-full overflow-hidden relative">
                                         <motion.div 
                                             initial={{ width: 0 }}
                                             whileInView={{ width: "75%" }}
                                             viewport={{ once: true }}
                                             transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                                             className="h-full bg-warning-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                         />
                                     </div>
                                </div>

                                {/* Nodes & Labels */}
                                <div className="relative z-10 flex justify-between items-start w-full">
                                     {["Enquired", "Docs", "Confirmed", "Tested", "Procured", "Packed", "Transport", "BL Issued", "Delivered"].map((milestone, idx) => (
                                         <div key={milestone} className="flex flex-col items-center gap-2 md:gap-3 w-[30px] md:w-[60px]">
                                             <div className={`w-[14px] h-[14px] md:w-[24px] md:h-[24px] shrink-0 rounded-full border-[3px] md:border-4 flex items-center justify-center bg-background transition-colors duration-500 delay-[${idx * 150}ms]
                                                ${idx < 6 ? 'border-warning-500' : idx === 6 ? 'border-warning-500 relative' : 'border-default-200'}
                                             `}>
                                                 {idx < 6 && <div className="w-1.5 h-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-warning-500" />}
                                                 {idx === 6 && (
                                                     <>
                                                         <div className="w-1.5 h-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-warning-500 absolute animate-[ping_1.5s_infinite_ease-out]" />
                                                         <div className="w-1.5 h-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-warning-500 relative z-10" />
                                                     </>
                                                 )}
                                             </div>
                                             <span className={`text-[6.5px] md:text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-center leading-[1.2] ${idx <= 6 ? 'text-foreground' : 'text-foreground/40'}`}>
                                                 {milestone}
                                             </span>
                                         </div>
                                     ))}
                                </div>
                           </div>
                        </div>

                        <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 relative z-10">
                            {[
                                { title: "Enquiry", desc: "Marketplace enquiry generated and assigned to verified participants." },
                                { title: "Documentation", desc: "Compliance certificates and initial product documentation verified." },
                                { title: "Order Confirmed", desc: "Negotiation finalized and formal order securely logged into the panel." },
                                { title: "Tested", desc: "Comprehensive quality testing and laboratory analysis successfully completed." },
                                { title: "Procured", desc: "Goods actively procured from verified suppliers and safely consolidated." },
                                { title: "Packed", desc: "Final packaging updates, weighing, and grading criteria logged." },
                                { title: "Inland Transport", desc: "Inland logistics coordinated and warehouse holding space reserved." },
                                { title: "BL Issued", desc: "Customs properly cleared and Bill of Lading (BL) successfully issued." },
                                { title: "Delivered", desc: "Final delivery verified, cargo securely handed over, and settlement closed." },
                            ].map((step, idx) => (
                                <motion.div
                                    key={step.title}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative flex items-center gap-4 rounded-[2rem] border border-default-200/50 bg-content1/50 px-5 py-5 md:px-6 md:py-6 group hover:-translate-y-0.5 hover:bg-background hover:border-warning-500/40 transition-all duration-300 hover:shadow-md hover:shadow-default-200 dark:hover:shadow-[0_10px_30px_rgba(245,158,11,0.05)] overflow-hidden cursor-default"
                                >
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-warning-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warning-500/10 border border-warning-500/20 text-warning-500 group-hover:bg-warning-500 group-hover:border-warning-500 group-hover:text-white dark:group-hover:text-black transition-all duration-300">
                                        <span className="text-lg font-black leading-none">{String(idx + 1).padStart(2, '0')}</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5 pr-2">
                                        <h4 className="text-sm md:text-base font-black text-foreground tracking-tight">{step.title}</h4>
                                        <p className="text-xs md:text-sm text-foreground/60 font-medium leading-relaxed group-hover:text-foreground/80 transition-colors">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
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
            <section className="py-10 md:py-24 bg-default-50/50 border-y border-default-100">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        {intentCards.map((card, i) => (
                            <motion.article
                                key={card.href}
                                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative group p-[1px] bg-gradient-to-br from-default-200 via-transparent to-default-200 rounded-[1.5rem] md:rounded-[3rem] overflow-hidden transition-all hover:from-orange-500/20"
                            >
                                <div className="relative p-6 md:p-12 rounded-[1.4rem] md:rounded-[2.8rem] bg-white dark:bg-[#0A0A0A] h-full flex flex-col justify-between items-start gap-6 md:gap-12">
                                    <div className="space-y-3 md:space-y-6">
                                        <h3 className="text-xl md:text-3xl font-black tracking-tight">{card.title}</h3>
                                        <p className="text-sm md:text-lg text-default-500 leading-relaxed font-medium">{card.description}</p>
                                    </div>

                                    <Link
                                        href={card.href}
                                        className="inline-flex items-center gap-2 md:gap-4 px-6 py-3 md:px-10 md:py-5 rounded-full bg-foreground text-background font-black text-sm md:text-lg transition-all hover:scale-105 active:scale-95 group/btn"
                                    >
                                        {card.cta}
                                        <FiArrowRight size={18} className="md:size-6 group-hover/btn:translate-x-2 transition-transform" />
                                    </Link>

                                    {/* Background accent */}
                                    <div className="absolute top-0 right-0 p-4 md:p-8 text-foreground/[0.03] group-hover:text-orange-500/[0.05] transition-colors pointer-events-none">
                                        <FiGlobe size={100} className="md:size-[200px]" />
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

                <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
                    <div className="max-w-3xl space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                            India-first execution <br />
                            <span className="text-orange-500">from India to anywhere.</span>
                        </h2>
                        <p className="text-xl text-white/50 leading-relaxed font-medium">
                            Operations are currently India‑based. We support exports from India to global markets.
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
