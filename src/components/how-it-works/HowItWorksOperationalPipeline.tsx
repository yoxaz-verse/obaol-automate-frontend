"use client";

import { motion } from "framer-motion";
import {
    FiTarget,
    FiSearch,
    FiFilter,
    FiShield,
    FiActivity,
    FiFlag,
    FiXCircle,
    FiCheckCircle,
    FiTrendingUp,
    FiKey
} from "react-icons/fi";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

export default function HowItWorksOperationalPipeline() {
    const steps = [
        {
            id: "01",
            title: "Trade Context & Intent",
            desc: "Every engagement starts with understanding the trade context — specifications, volume, and timeline. If intent isn't genuine, execution fails.",
            points: ["Commodity Specs", "Volume & Timeline", "Domestic/Export Flow"],
            icon: <FiTarget />
        },
        {
            id: "02",
            title: "Opportunity Identification",
            desc: "OBAOL actively identifies relevant trades. This isn't random discovery; it's context-matched and execution-feasible identification.",
            points: ["Context-Matched", "Volume-Aligned", "Execution-Feasible"],
            icon: <FiSearch />
        },
        {
            id: "03",
            title: "Seriousness & Readiness Filtering",
            desc: "Before execution begins, seriousness is filtered to protect time, capital, and reputation. This is where we remove the 'Noise'.",
            points: ["Remove Price Checkers", "Filter Time-Wasters", "Protect Reputation"],
            icon: <FiFilter />,
            highlight: true
        },
        {
            id: "04",
            title: "Counterparty Verification",
            desc: "A core OBAOL responsibility. Not just a one-time check, but contextual validation of stock, capacity, and trade readiness.",
            points: ["Identity Validation", "Stock Confirmation", "On-Ground Checks"],
            icon: <FiShield />
        },
        {
            id: "05",
            title: "Execution Coordination",
            desc: "Support during negotiation, documentation, and on-ground coordination. This is where most trades collapse without structure.",
            points: ["Timeline Monitoring", "Doc Alignment", "Issue Escalation"],
            icon: <FiActivity />
        },
        {
            id: "06",
            title: "Trade Completion",
            desc: "Our responsibility remains until the trade successfully closes. We don't exit at agreement; we exit at completion.",
            points: ["Execution Concluded", "Commitments Honoured", "No Unresolved Gaps"],
            icon: <FiFlag />
        }
    ];

    return (
        <div className="space-y-32 py-20">
            {/* SECTION 1: THE OPERATIONAL PIPELINE */}
            <section className="container mx-auto max-w-6xl px-4">
                <motion.div {...fadeIn} className="max-w-4xl space-y-8 mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500 font-bold uppercase tracking-widest text-[10px]">
                        Execution Discipline
                    </div>
                    <h2 className="text-4xl md:text-7xl font-black text-foreground tracking-tight leading-[0.95]">
                        The OBAOL <br />
                        <span className="text-orange-500 italic">Operational Pipeline.</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-foreground/60 leading-relaxed font-medium max-w-3xl">
                        A disciplined, 6-step flow designed to move trades from initial intent to confirmed settlement without the common failures of traditional trade.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.id}
                            {...fadeIn}
                            transition={{ delay: i * 0.1 }}
                            className={`p-10 rounded-[3rem] border transition-all duration-500 group relative flex flex-col h-full
                ${step.highlight
                                    ? "bg-orange-500/[0.03] border-orange-500/30 shadow-2xl shadow-orange-500/5 scale-105 z-10"
                                    : "bg-content1 border-default-200 hover:border-orange-500/20"}`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-8 font-bold transition-all duration-500
                ${step.highlight ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white"}`}>
                                {step.icon}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 mb-2">Phase {step.id}</div>
                            <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight leading-tight">{step.title}</h3>
                            <p className="text-foreground/50 text-sm leading-relaxed font-medium mb-8 flex-grow">{step.desc}</p>

                            <div className="space-y-4 pt-6 border-t border-default-100">
                                {step.points.map((pt, j) => (
                                    <div key={j} className="flex items-center gap-3 text-xs font-bold text-foreground/80 uppercase tracking-tight">
                                        <div className={`w-1.5 h-1.5 rounded-full ${step.highlight ? "bg-orange-500" : "bg-default-300"}`} />
                                        {pt}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* SECTION 2: NOISE FILTERING (SPECIFIC USER REQUEST) */}
            <section className="container mx-auto max-w-6xl px-4">
                <div className="p-12 md:p-24 rounded-[5rem] bg-foreground text-background dark:bg-neutral-900 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">Protecting Trade <br /> <span className="text-orange-500 italic">Integrity</span>.</h2>
                                <p className="text-white/50 text-xl font-medium leading-relaxed max-w-md italic">
                                    Most execution failures start with the wrong counterparty. Filtering noise early protects time, capital, and reputation.
                                </p>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 space-y-8">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-2">We Remove Friction From:</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {["Price Checkers", "Information Extractors", "Non-Ready Participants", "Time-Wasters"].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 text-white/40 line-through font-bold text-base">
                                            <FiXCircle className="text-red-500/50" /> {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <h4 className="text-2xl font-black text-white leading-tight">By filtering early, <br />OBAOL protects:</h4>
                            <div className="grid grid-cols-1 gap-6">
                                {[
                                    { label: "Execution Time", desc: "No weeks spent on non-converging discussions.", icon: <FiTrendingUp /> },
                                    { label: "Working Capital", desc: "Prevention of funds stuck in non-viable trades.", icon: <FiActivity /> },
                                    { label: "Market Reputation", desc: "Associated only with serious, verified counterparties.", icon: <FiKey /> }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 p-8 rounded-[2rem] bg-orange-500/10 border border-orange-500/20 group hover:bg-orange-500 hover:border-orange-500 transition-all duration-500">
                                        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:bg-white group-hover:text-orange-500 transition-colors">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="font-black text-white text-xl tracking-tight leading-none group-hover:text-white transition-colors">{item.label}</div>
                                            <div className="text-white/40 text-sm mt-2 font-medium leading-relaxed group-hover:text-white/80 transition-colors">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: IMPACT FOR OPERATORS */}
            <section className="container mx-auto max-w-6xl px-4">
                <div className="text-center mb-24 space-y-4">
                    <h2 className="text-3xl md:text-6xl font-black text-foreground tracking-tight">Systemic Support.</h2>
                    <p className="text-xl text-foreground/50 font-medium">How this structure levels the playing field for all operators.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <motion.div {...fadeIn} className="p-12 rounded-[4rem] bg-content1 border border-default-200 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 text-6xl font-black text-foreground/[0.02]">PRO</div>
                        <h4 className="text-2xl font-black text-foreground mb-6">For Established Operators</h4>
                        <div className="space-y-5">
                            {[
                                "Reduced execution risk on large volumes",
                                "Centralized control as operations scale",
                                "Verification offloaded to systemic layers",
                                "Protection of long-standing relationships"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 text-foreground/60 font-bold text-lg leading-tight uppercase tracking-tight">
                                    <FiCheckCircle className="text-orange-500 shrink-0" /> {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="p-12 rounded-[4rem] bg-content1 border border-default-200 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 text-6xl font-black text-foreground/[0.02]">NEW</div>
                        <h4 className="text-2xl font-black text-foreground mb-6">For Serious New Entrants</h4>
                        <div className="space-y-5">
                            {[
                                "Exposure to real trade execution flow",
                                "Prevention of costly operational mistakes",
                                "Immediate adoption of institutional discipline",
                                "Clear path to successful trade completion"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 text-foreground/60 font-bold text-lg leading-tight uppercase tracking-tight">
                                    <FiCheckCircle className="text-orange-500 shrink-0" /> {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 4: SELECTIVE ENGAGEMENT */}
            <section className="container mx-auto max-w-5xl px-4">
                <div className="p-12 md:p-20 rounded-[4rem] bg-orange-500 text-white shadow-2xl relative overflow-hidden text-center space-y-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Selective Engagement.</h2>
                        <p className="max-w-2xl mx-auto text-white/80 text-lg font-bold leading-relaxed italic">
                            &quot;OBAOL brings structure to a relationship-driven industry so that more trades complete, not just start.&quot;
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            {["Genuine Intent Only", "Measurable Value Added", "Success-Linked Involvement", "Operational Accountability"].map((badge, i) => (
                                <div key={i} className="px-6 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest">
                                    {badge}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
