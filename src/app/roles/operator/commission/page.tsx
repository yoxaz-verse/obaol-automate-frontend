"use client";

import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";
import {
    FiArrowLeft,
    FiClock,
    FiPieChart,
    FiTarget,
    FiShield,
    FiCheckCircle,
    FiInfo,
    FiTrendingUp,
    FiUsers,
    FiBriefcase,
    FiXCircle
} from "react-icons/fi";

export default function OperatorCommissionDocsPage() {
    const { formatRate } = useCurrency();
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <section className="min-h-screen bg-background selection:bg-orange-500/30">
            <Header />

            <ThemedContentWrapper>
                <div className="container mx-auto max-w-5xl px-4 pt-24 md:pt-32 pb-16 md:pb-24">
                    {/* --- HEADER --- */}
                    <motion.div {...fadeIn} className="mb-16">
                        <Link
                            href="/roles/operator"
                            className="inline-flex items-center gap-2 text-sm font-bold text-orange-500/80 hover:text-orange-500 transition-all group px-4 py-2 rounded-full border border-orange-500/10 bg-orange-500/5 backdrop-blur-sm mb-8"
                        >
                            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            Back to Operator Role
                        </Link>

                        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight mb-6">
                            Commission <span className="text-orange-500">Structure</span>
                        </h1>
                        <p className="text-xl text-foreground/50 max-w-3xl leading-relaxed font-medium">
                            A transparent reward system designed to encourage supplier activation,
                            trade execution, and long-term relationship building.
                        </p>
                    </motion.div>

                    {/* --- SECTION 1: THE POOL --- */}
                    <motion.section {...fadeIn} className="mb-12 md:mb-20">
                        <div className="p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-content1 border border-default-200 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

                            <div className="flex flex-col md:flex-row gap-12 items-start">
                                <div className="w-full md:w-1/3">
                                    <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6 font-bold">
                                        <FiPieChart size={32} />
                                    </div>
                                    <h2 className="text-3xl font-black text-foreground mb-4">Commission Pool</h2>
                                    <div className="text-5xl font-black text-orange-500 mb-2">30%</div>
                                    <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest text-balance">
                                        Of Company Net Profit per trade
                                    </p>
                                </div>

                                <div className="w-full md:w-2/3 space-y-6">
                                    <p className="text-lg text-foreground/70 leading-relaxed">
                                        At OBAOL, every completed trade generates a commission pool equal to <span className="text-foreground font-bold">30% of the company’s net profit</span>. This pool is then distributed among contributors involved in the trade.
                                    </p>
                                    <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex gap-4 items-start">
                                        <FiInfo className="text-orange-500 shrink-0 mt-1" />
                                        <p className="text-sm text-foreground/60 leading-relaxed italic">
                                            Important: Commission is calculated only after the trade is fully executed and profit is confirmed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* --- SECTION 2: RELEASE CONDITIONS --- */}
                    <motion.section {...fadeIn} className="mb-12 md:mb-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-default-50 border border-default-100">
                            <h3 className="text-2xl font-black text-foreground mb-8 flex items-center gap-3">
                                <FiCheckCircle className="text-green-500" /> Release Conditions
                            </h3>
                            <div className="space-y-4">
                                {[
                                    "Product has been loaded or dispatched",
                                    "Payment is verified",
                                    "Trade profit is finalized"
                                ].map((cond, i) => (
                                    <div key={i} className="flex items-center gap-4 text-foreground/80 font-bold p-3 rounded-xl bg-background border border-default-100">
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        {cond}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-red-500/[0.02] border border-red-500/10">
                            <h3 className="text-2xl font-black text-foreground mb-8 flex items-center gap-3 text-red-500/80">
                                <FiXCircle className="text-red-500" /> No Payouts For:
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-foreground/40 font-bold italic line-through">
                                {["POs", "Inquiries", "Negotiations", "Partial Trans."].map((item, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-red-500/5 bg-red-500/[0.01]">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    {/* --- SECTION 3: DISTRIBUTION --- */}
                    <motion.section {...fadeIn} className="mb-12 md:mb-20 text-left md:text-center">
                        <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-8 md:mb-12">Pool Distribution</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Deal Closer",
                                    share: "40%",
                                    desc: "Person who successfully finalizes the trade from inquiry to completion.",
                                    icon: <FiTarget />,
                                    color: "bg-orange-500"
                                },
                                {
                                    title: "Portfolio Owner",
                                    share: "30%",
                                    desc: "Registered manager of the supplier who executed the trade.",
                                    icon: <FiUsers />,
                                    color: "bg-indigo-500"
                                },
                                {
                                    title: "Leadership",
                                    share: "30%",
                                    desc: "Distributed among mentorship and management layers (L1, L2, L3+).",
                                    icon: <FiTrendingUp />,
                                    color: "bg-amber-500"
                                }
                            ].map((cat, i) => (
                                <div key={i} className="flex flex-col p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-content1 border border-default-200 group hover:border-orange-500/30 transition-all text-left">
                                    <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center text-white ${cat.color} shadow-lg`}>
                                        {cat.icon}
                                    </div>
                                    <div className="text-4xl font-black text-foreground mb-2 tracking-tighter">{cat.share}</div>
                                    <h4 className="text-xl font-bold text-foreground mb-4">{cat.title}</h4>
                                    <p className="text-foreground/50 text-sm leading-relaxed font-medium">{cat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* --- SECTION 4: PORTFOLIO OWNERSHIP --- */}
                    <motion.section {...fadeIn} className="mb-12 md:mb-20 space-y-8 md:space-y-12">
                        <div className="p-6 md:p-14 rounded-[2rem] md:rounded-[3rem] border border-orange-500/20 bg-orange-500/[0.02] relative overflow-hidden">
                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6">Supplier Portfolio Ownership</h2>
                                    <p className="text-lg text-foreground/60 leading-relaxed mb-8 font-medium">
                                        Each operator is assigned a group of supplier associates on the platform. Your success is tied to their activation and performance.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            "Onboarding Suppliers",
                                            "Activating Companies",
                                            "Listing Products",
                                            "Maintaining Relationships",
                                            "Ensuring Responsiveness",
                                            "Driving Participation"
                                        ].map((task, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm font-bold text-foreground group">
                                                <FiCheckCircle className="text-orange-500 shrink-0" />
                                                {task}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-8 rounded-[2rem] bg-background border border-default-200">
                                    <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-6">Strategy Bonus</h4>
                                    <p className="text-foreground/80 font-bold text-lg mb-6 leading-relaxed">
                                        If the Supplier Portfolio Owner also closes the deal, they receive both shares.
                                    </p>
                                    <div className="flex gap-4 items-center">
                                        <div className="flex-1 p-4 rounded-xl bg-orange-500/10 text-orange-500 text-center font-black">40% Closer</div>
                                        <span className="text-xl font-bold">+</span>
                                        <div className="flex-1 p-4 rounded-xl bg-indigo-500/10 text-indigo-500 text-center font-black">30% Owner</div>
                                        <span className="text-xl font-bold">=</span>
                                        <div className="flex-1 p-4 rounded-xl bg-orange-500 text-white text-center font-black shadow-lg">70% Total</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* --- SECTION 5: LEADERSHIP LAYERS --- */}
                    <motion.section {...fadeIn} className="mb-12 md:mb-20 space-y-8 md:space-y-12 text-left">
                        <div className="md:text-center space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Leadership Layer Rewards</h2>
                            <p className="text-lg md:text-xl text-foreground/50 max-w-3xl mx-auto font-medium leading-relaxed">
                                OBAOL rewards mentorship and leadership through a structured hierarchy based on the <span className="text-foreground">Supplier Portfolio Ownership</span> chain.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Fixed Layers */}
                            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-default-200 bg-content1 relative group">
                                    <div className="absolute top-0 right-0 p-6 md:p-8 text-5xl md:text-6xl font-black text-foreground/[0.03]">L1</div>
                                    <h4 className="text-xl font-black text-foreground mb-4">Direct Leadership</h4>
                                    <div className="text-5xl font-black text-orange-500 mb-4">12%</div>
                                    <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Pool Allocation</p>
                                    <p className="mt-6 text-foreground/60 font-medium text-sm">Reward for the direct mentor or reporting manager of the Portfolio Owner.</p>
                                </div>
                                <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-default-200 bg-content1 relative group">
                                    <div className="absolute top-0 right-0 p-6 md:p-8 text-5xl md:text-6xl font-black text-foreground/[0.03]">L2</div>
                                    <h4 className="text-xl font-black text-foreground mb-4">Senior Mentorship</h4>
                                    <div className="text-5xl font-black text-indigo-500 mb-4">8%</div>
                                    <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Pool Allocation</p>
                                    <p className="mt-6 text-foreground/60 font-medium text-sm">Reward for the senior mentor or team leader in the operational chain.</p>
                                </div>
                            </div>

                            {/* Flexible L3+ Layer */}
                            <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-amber-500/20 bg-amber-500/[0.02] relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 md:p-8 text-5xl md:text-6xl font-black text-amber-500/[0.1]">L3+</div>
                                <h4 className="text-xl font-black text-foreground mb-4">Extended Layers</h4>
                                <div className="text-5xl font-black text-amber-500 mb-4">10%</div>
                                <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mb-8">Shared Pool</p>
                                <div className="space-y-4 pt-6 border-t border-amber-500/10">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-foreground/60">Distribution Strategy</span>
                                        <span className="text-amber-600">Equally Shared</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-foreground/60">Per Layer Cap</span>
                                        <span className="text-amber-600">Max 5%</span>
                                    </div>
                                </div>
                                <p className="mt-8 text-xs text-amber-600/60 leading-relaxed font-bold italic">
                                    Distributed among all active leadership layers beyond L2.
                                </p>
                            </div>
                        </div>

                        {/* Leadership Eligibility Note */}
                        <div className="p-6 md:p-8 rounded-[2rem] md:rounded-3xl bg-foreground text-background dark:bg-neutral-900 border border-white/10 shadow-2xl">
                            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                                    <FiShield size={24} />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xl font-black tracking-tight leading-none text-white">The Supremacy Rule</h4>
                                    <p className="text-white/60 text-base leading-relaxed max-w-4xl font-medium">
                                        Leadership rewards always follow the <span className="text-orange-500 font-bold underline underline-offset-4 decoration-orange-500/30">Supplier Ownership Chain</span>, not the Deal Closer’s chain. This ensures management is incentivized to maintain high-quality supplier relationships.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* --- SECTION 6: CALCULATION EXAMPLE --- */}
                    <motion.section {...fadeIn} className="mb-12 md:mb-20 text-left">
                        <div className="p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] bg-content1 border border-default-200">
                            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-8 md:mb-12">Calculation Example</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                                <div className="space-y-8">
                                    <div className="p-6 rounded-2xl bg-default-100 border border-default-200">
                                        <div className="text-sm font-bold text-default-400 uppercase tracking-widest mb-2">Trade Net Profit</div>
                                        <div className="text-4xl font-black text-foreground tracking-tighter">{formatRate(100000)}</div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex-1 p-6 rounded-2xl bg-orange-500 shadow-xl shadow-orange-500/20 text-white">
                                            <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Commission Pool (30%)</div>
                                            <div className="text-3xl font-black">{formatRate(30000)}</div>
                                        </div>
                                    </div>

                                    <ul className="space-y-4 text-foreground font-bold">
                                        <li className="flex justify-between p-4 rounded-xl border border-default-100">
                                            <span className="text-foreground/50">Deal Closer (40%)</span>
                                            <span>{formatRate(12000)}</span>
                                        </li>
                                        <li className="flex justify-between p-4 rounded-xl border border-default-100">
                                            <span className="text-foreground/50">Portfolio Owner (30%)</span>
                                            <span>{formatRate(9000)}</span>
                                        </li>
                                        <li className="flex justify-between p-4 rounded-xl border border-default-100 italic text-orange-500">
                                            <span className="opacity-70">Leadership Share (30%)</span>
                                            <span>{formatRate(9000)}</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex flex-col h-full bg-orange-500/[0.03] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-orange-500/10">
                                    <h4 className="text-2xl font-black text-foreground mb-8">The Philosophy</h4>
                                    <p className="text-lg text-foreground/70 leading-relaxed font-medium mb-10 italic">
                                        &quot;Every successful trade represents the combined effort of relationships, execution, and leadership.&quot;
                                    </p>

                                    <div className="space-y-8 mt-auto">
                                        {[
                                            { title: "Execution", text: "Reward those who close the final trade." },
                                            { title: "Ownership", text: "Encourage strong supplier portfolio growth." },
                                            { title: "Leadership", text: "Recognize mentors who fuel team performance." }
                                        ].map((phi, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="w-1 h-auto bg-orange-500 rounded-full" />
                                                <div>
                                                    <div className="font-black text-foreground uppercase tracking-widest text-xs mb-1">{phi.title}</div>
                                                    <div className="text-sm text-foreground/60 leading-relaxed font-medium">{phi.text}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* --- FINAL PRINCIPLES --- */}
                    <motion.section {...fadeIn} className="text-left md:text-center py-12 md:py-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500 font-bold uppercase tracking-widest text-[10px] mb-12">
                            Long-Term Vision
                        </div>
                        <p className="text-2xl md:text-4xl font-black text-foreground tracking-tight leading-none mb-4">
                            Treat Suppliers as Long-Term Assets.
                        </p>
                        <p className="text-lg text-foreground/50 font-medium max-w-4xl mx-auto leading-relaxed">
                            The structure encourages sustainable growth. The more suppliers you activate and maintain, the more trading activity is generated—creating sustained value for both the platform and the operational team.
                        </p>
                    </motion.section>
                </div>
            </ThemedContentWrapper>

            <Footer />
        </section>
    );
}
