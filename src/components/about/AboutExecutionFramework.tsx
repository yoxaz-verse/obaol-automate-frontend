"use client";

import { motion } from "framer-motion";
import {
    FiCheckCircle,
    FiXCircle,
    FiZap,
    FiUsers,
    FiTarget,
    FiShield,
    FiTrendingUp,
    FiSearch,
    FiFilter,
    FiActivity,
    FiLayers
} from "react-icons/fi";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

export default function AboutExecutionFramework() {
    return (
        <div className="space-y-32 py-20 pb-40">
            {/* 1. THE EXECUTION GAP SECTION */}
            <section className="relative overflow-hidden pt-10">
                <div className="container mx-auto max-w-6xl px-4">
                    <motion.div {...fadeIn} className="max-w-4xl space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500 font-bold uppercase tracking-widest text-[10px]">
                            System Core Philosophy
                        </div>
                        <h2 className="text-4xl md:text-7xl font-black text-foreground tracking-tight leading-[0.95]">
                            Technology alone does not close deals. <br />
                            <span className="text-orange-500 italic">Systems that protect execution do.</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-foreground/60 leading-relaxed font-medium max-w-3xl">
                            OBAOL is not a marketplace. We operate at the **execution layer of trade** — where 90% of commodity deals fail due to fragmentation and lack of trust.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
                        <motion.div
                            {...fadeIn}
                            transition={{ delay: 0.2 }}
                            className="p-10 rounded-[3rem] bg-red-500/[0.02] border border-red-500/10 group"
                        >
                            <h3 className="text-xl font-bold text-red-500/80 mb-8 uppercase tracking-widest flex items-center gap-3">
                                <FiXCircle size={20} /> Why Trades Collapse
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    { title: "Fragile Execution", desc: "Negotiations stall after terms are agreed due to lack of coordination." },
                                    { title: "Counterparty Misrepresentation", desc: "Unverified actors providing false availability or inflated demand." },
                                    { title: "Price Manipulation", desc: "Fake activity used just to extract market information." },
                                    { title: "Process Friction", desc: "Breakdown during documentation, logistics, and on-ground execution." }
                                ].map((item, i) => (
                                    <li key={i} className="group/item">
                                        <div className="text-foreground/80 font-bold text-lg mb-1">{item.title}</div>
                                        <div className="text-foreground/40 text-sm leading-relaxed">{item.desc}</div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            {...fadeIn}
                            transition={{ delay: 0.3 }}
                            className="p-10 rounded-[3rem] bg-orange-500/[0.03] border border-orange-500/20 shadow-2xl shadow-orange-500/5"
                        >
                            <h3 className="text-xl font-bold text-orange-500 mb-8 uppercase tracking-widest flex items-center gap-3">
                                <FiShield size={20} /> The OBAOL Solution
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    { title: "Structured Workflows", desc: "Rigid, system-enforced steps that ensure every deal has a documented trail." },
                                    { title: "Intent Filtering", desc: "Focusing only on serious counterparties who have skin in the game." },
                                    { title: "Execution Accountability", desc: "Dedicated support that remains active until the final settlement." },
                                    { title: "Global Adaptability", desc: "Tested in high-complexity markets to work across any trade corridor." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                        <div>
                                            <div className="text-foreground font-bold text-lg mb-1">{item.title}</div>
                                            <div className="text-foreground/50 text-sm leading-relaxed">{item.desc}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. THE 5-STEP WORKFLOW */}
            <section className="bg-default-50/50 dark:bg-black/20 py-32 border-y border-default-100/50">
                <div className="container mx-auto max-w-6xl px-4">
                    <motion.div {...fadeIn} className="text-left md:text-center mb-24 space-y-4">
                        <h2 className="text-3xl md:text-6xl font-black text-foreground tracking-tight">How OBAOL Works.</h2>
                        <p className="text-xl text-foreground/50 max-w-2xl mx-auto font-medium leading-relaxed italic underline decoration-orange-500/20 underline-offset-8 decoration-2 whitespace-nowrap">
                            From identification to confirmed settlement.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                        {/* Connection Line */}
                        <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-orange-500/0 via-orange-500/30 to-orange-500/0 z-0" />

                        {[
                            { icon: <FiSearch />, label: "Opportunity Identification", desc: "Targeted, intent-driven sourcing." },
                            { icon: <FiFilter />, label: "Seriousness & Intent Filtering", desc: "Ready, assigned, and aligned." },
                            { icon: <FiShield />, label: "Counterparty Verification", desc: "Credibility and trade readiness." },
                            { icon: <FiActivity />, label: "Execution Coordination", desc: "Documentation and on-ground audit." },
                            { icon: <FiZap />, label: "Trade Completion", desc: "Confirmed settlement confirmation." }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                {...fadeIn}
                                transition={{ delay: i * 0.1 }}
                                className="relative z-10 p-6 flex flex-col items-start md:items-center text-left md:text-center bg-background md:bg-transparent border border-default-100 md:border-none rounded-[2rem]"
                            >
                                <div className="w-14 h-14 rounded-full bg-background border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-xl mb-6">
                                    {step.icon}
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-orange-500/50 mb-2">Step 0{i + 1}</div>
                                <h4 className="text-lg font-black text-foreground leading-tight mb-2">{step.label}</h4>
                                <p className="text-xs text-foreground/40 font-medium leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. TARGET GROUPS SECTION (MATCHES SCREENSHOT) */}
            <section className="container mx-auto max-w-6xl px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
                    <motion.div {...fadeIn} className="flex flex-col p-12 rounded-[4.5rem] bg-orange-500 text-white relative overflow-hidden group shadow-2xl shadow-orange-500/20">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="relative z-10 space-y-8 h-full">
                            <div className="w-16 h-16 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold group-hover:scale-110 group-hover:bg-white group-hover:text-orange-600 transition-all duration-500">
                                <FiTrendingUp size={32} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl md:text-5xl font-black text-white leading-none">Established <br /> Trade Operators</h3>
                                <p className="text-white/80 leading-relaxed font-bold text-lg max-w-md">For existing traders who understand that execution is the bottleneck to scaling.</p>
                            </div>
                            <ul className="space-y-5 pt-8 border-t border-white/20 flex-grow">
                                {[
                                    "Traders handling regular volumes",
                                    "Exporters looking to scale operations",
                                    "Procurement teams managing supply risk",
                                    "Professional operators seeking structured execution"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-base font-bold text-white uppercase tracking-tight">
                                        <div className="w-2 h-2 rounded-full bg-white shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-8 text-white/50 text-[10px] uppercase font-black tracking-[0.5em]">Active Execution Discipline</div>
                        </div>
                    </motion.div>

                    <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="flex flex-col p-12 rounded-[4.5rem] bg-content1 border border-default-200 relative overflow-hidden group shadow-sm">
                        <div className="relative z-10 space-y-8 h-full">
                            <div className="w-16 h-16 rounded-[2rem] bg-default-50 flex items-center justify-center text-default-400 font-bold group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                                <FiUsers size={32} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl md:text-5xl font-black text-foreground leading-none">Serious <br /> New Entrants</h3>
                                <p className="text-foreground/50 leading-relaxed font-bold text-lg max-w-md">For professionals who want to enter agro trade with systemized trust, not shortcuts.</p>
                            </div>
                            <ul className="space-y-5 pt-8 border-t border-default-100 flex-grow">
                                {[
                                    "First-time exporters and manufacturers",
                                    "Businesses entering agro trade professionally",
                                    "Operators who value structure over shortcuts",
                                    "Professionals with no capital but high intent"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-base font-bold text-foreground/70 uppercase tracking-tight">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-8 text-foreground/20 text-[10px] uppercase font-black tracking-[0.5em]">No Informal Shortcuts</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 4. WHAT OBAOL IS NOT */}
            <section className="container mx-auto max-w-6xl px-4">
                <div className="p-12 md:p-20 rounded-[4rem] bg-foreground text-background dark:bg-neutral-900 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-red-500/15 transition-all duration-1000" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/10 text-red-500 font-bold uppercase tracking-widest text-[10px]">
                                Strict Boundaries
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">What OBAOL <br /> <span className="text-red-500 italic underline decoration-red-500/30">Is Not</span>.</h2>
                            <p className="text-white/50 text-xl font-medium leading-relaxed italic pr-8">
                                To maintain the integrity of our execution system, we define clear boundaries of what OBAOL will never be.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { title: "Marketplace", icon: <FiXCircle /> },
                                { title: "Listing Website", icon: <FiXCircle /> },
                                { title: "Lead-Selling Platform", icon: <FiXCircle /> },
                                { title: "Broker or Trader", icon: <FiXCircle /> },
                                { title: "Informal Mediator", icon: <FiXCircle /> },
                                { title: "Speculation Tool", icon: <FiXCircle /> }
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center gap-4 text-white hover:bg-white/[0.05] transition-all">
                                    <div className="text-red-500">{item.icon}</div>
                                    <span className="font-black text-base uppercase tracking-tight">{item.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. CLOSING QUOTE */}
            <section className="container mx-auto max-w-5xl px-4 text-center">
                <motion.div
                    {...fadeIn}
                    className="relative inline-block"
                >
                    <div className="absolute -inset-4 bg-orange-500/5 blur-3xl rounded-full" />
                    <p className="relative text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight max-w-4xl mx-auto italic">
                        &quot;We are not informilising the industry. <br />
                        We are <span className="text-orange-500 underline decoration-orange-500/30 underline-offset-8">systemising it</span>.&quot;
                    </p>
                </motion.div>
            </section>
        </div>
    );
}
