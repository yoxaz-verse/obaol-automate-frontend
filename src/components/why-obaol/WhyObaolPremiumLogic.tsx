"use client";

import { motion } from "framer-motion";
import {
    FiShield,
    FiZap,
    FiActivity,
    FiTrendingUp,
    FiCheckCircle,
    FiXCircle,
    FiAlertTriangle,
    FiUsers,
    FiTarget,
    FiLock
} from "react-icons/fi";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

export default function WhyObaolPremiumLogic() {
    return (
        <div className="space-y-32 py-20 pb-40">
            {/* SECTION 1: THE EXECUTION LAYER DIFFERENCE */}
            <section className="container mx-auto max-w-6xl px-4">
                <motion.div {...fadeIn} className="max-w-4xl space-y-8 mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500 font-bold uppercase tracking-widest text-[10px]">
                        The Real Bottleneck
                    </div>
                    <h2 className="text-4xl md:text-7xl font-black text-foreground tracking-tight leading-[0.95]">
                        Visibility does not <br /> guarantee completion. <br />
                        <span className="text-orange-500 italic">Execution discipline does.</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-foreground/60 leading-relaxed font-medium max-w-3xl">
                        In commodity trade, buyers and sellers are everywhere. The problem isn’t finding them — it’s surviving the execution process until the trade is finalized.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="p-10 rounded-[3rem] bg-content1 border border-default-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-6xl font-black text-foreground/[0.03]">B2B</div>
                        <h3 className="text-xl font-bold text-foreground/40 mb-10 uppercase tracking-widest">Traditional Listing Platforms</h3>
                        <ul className="space-y-6">
                            {[
                                "Focused on lead generation only",
                                "Once contact is made, responsibility ends",
                                "No filter for buyer or seller readiness",
                                "No support during the 'Messy Middle' of trade",
                                "Zero accountability for deal completion"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-foreground/30 line-through font-bold text-lg leading-tight uppercase tracking-tight">
                                    <FiXCircle className="text-red-500/30 shrink-0" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-10 rounded-[3rem] bg-orange-500 text-white relative overflow-hidden group shadow-2xl shadow-orange-500/20 border border-orange-400">
                        <div className="absolute top-0 right-0 p-8 text-6xl font-black text-white/10 italic">OOS</div>
                        <h3 className="text-xl font-bold text-white/60 mb-10 uppercase tracking-widest">OBAOL Execution Layer</h3>
                        <ul className="space-y-6">
                            {[
                                "Begins after trade intent is established",
                                "Verifies counterparty seriousness & readiness",
                                "Coordinates ground execution & logistics",
                                "Protects reputation by filtering failures",
                                "Linked entirely to successful trade completion"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-white font-bold text-lg leading-tight uppercase tracking-tight">
                                    <FiCheckCircle className="text-white shrink-0" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* SECTION 2: THE 4 PILLARS FOR SERIOUS TRADERS */}
            <section className="bg-default-50/50 dark:bg-black/20 py-32 border-y border-default-100/50">
                <div className="container mx-auto max-w-6xl px-4">
                    <motion.div {...fadeIn} className="text-left md:text-center mb-24 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">Why Serious Traders Involve OBAOL.</h2>
                        <p className="text-xl text-foreground/50 max-w-2xl mx-auto font-medium leading-relaxed italic">
                            Because as trade volume and complexity increase, informal execution fails.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Reduce Risk",
                                icon: <FiAlertTriangle />,
                                desc: "Identify non-serious participants and price-checkers before they waste your time and capital."
                            },
                            {
                                title: "Prevent Breakdowns",
                                icon: <FiZap />,
                                desc: "Stay aligned during document exchange and on-ground execution where 90% of deals stall."
                            },
                            {
                                title: "Scale With Control",
                                icon: <FiTrendingUp />,
                                desc: "Move from individual relationship-based trading to institutional systemic-based trading."
                            },
                            {
                                title: "Protect Identity",
                                icon: <FiLock />,
                                desc: "Ensuring your market reputation remains protected by only engaging in high-probability trades."
                            }
                        ].map((pillar, i) => (
                            <motion.div
                                key={i}
                                {...fadeIn}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-[2.5rem] bg-background border border-default-100 hover:border-orange-500/30 transition-all duration-300 flex flex-col items-start gap-4 shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 text-2xl font-bold">
                                    {pillar.icon}
                                </div>
                                <h4 className="text-xl font-black text-foreground tracking-tight leading-none mt-4">{pillar.title}</h4>
                                <p className="text-foreground/50 text-sm font-medium leading-relaxed">{pillar.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3: SYSTEM LEVEL SHIFT */}
            <section className="container mx-auto max-w-6xl px-4">
                <div className="p-12 md:p-24 rounded-[5rem] bg-foreground text-background dark:bg-neutral-900 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-orange-500/5 blur-[150px] rounded-full pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">A System-Level <br /> <span className="text-orange-500 italic underline decoration-orange-500/30 underline-offset-8">Shift</span>.</h2>
                                <p className="text-white/50 text-xl font-medium leading-relaxed pr-8">
                                    OBAOL is not another platform to manage. It is a **transaction discipline** applied as an institutional layer to your existing trade.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {["Predictable Outcomes", "Assessed Risk", "Success-Linked", "Closure-Focused"].map((badge, i) => (
                                    <div key={i} className="px-6 py-4 rounded-3xl bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-widest text-center shadow-inner">
                                        {badge}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8 p-10 md:p-14 rounded-[4rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl">
                            <h3 className="text-2xl font-black text-white mb-6">Selective Participation</h3>
                            <p className="text-white/60 text-lg leading-relaxed font-medium mb-10">
                                We don&apos;t create activity. We create <span className="text-white underline decoration-orange-500 decoration-2">completed transactions</span>. OBAOL only engages where:
                            </p>
                            <div className="space-y-6">
                                {[
                                    { title: "Genuine Intent", label: "Trade intent is fully verified upfront." },
                                    { title: "Measurable Value", label: "Our involvement accelerates the closure path." },
                                    { title: "Success-Linked", label: "Our team stays accountable until trade settlement." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 group-hover:scale-150 transition-transform" />
                                        <div>
                                            <div className="font-bold text-white uppercase text-xs tracking-widest mb-1">{item.title}</div>
                                            <div className="text-white/40 text-sm leading-relaxed font-medium">{item.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: ACCESSIBILITY WITHOUT DILUTION */}
            <section className="container mx-auto max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">Standards <br /> <span className="text-orange-500 italic">Within Reach</span>.</h2>
                    <p className="text-xl text-foreground/50 font-medium leading-relaxed">
                        Traditionally, agro trade was a closed industry held together by informal trust. OBAOL opens it up by systemizing that trust, allowing serious new entrants to avoid the failures that usually stop them.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="p-8 rounded-[2rem] bg-content1 border border-default-200 text-center flex-1">
                            <FiUsers className="mx-auto mb-4 text-orange-500 text-3xl" />
                            <div className="text-sm font-black text-foreground uppercase tracking-widest">Open Assets</div>
                        </div>
                        <div className="p-8 rounded-[2rem] bg-orange-500 text-white text-center flex-1">
                            <FiTarget className="mx-auto mb-4 text-white text-3xl" />
                            <div className="text-sm font-black text-white uppercase tracking-widest">System Trust</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { title: "New Entrants", desc: "Allows serious newcomers to enter responsibly without informal shortcuts." },
                        { title: "First-Time Operators", desc: "Prevention of the common operational mistakes that destroy reputation." },
                        { title: "Systemic Discipline", desc: "Institutional standards made available for distributed execution." }
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-[2.5rem] bg-content1 border border-default-200 group hover:bg-orange-500 hover:text-white transition-all duration-700">
                            <div className="text-lg font-black tracking-tight mb-2 uppercase">{item.title}</div>
                            <div className="text-foreground/40 text-sm font-medium leading-relaxed group-hover:text-white/80 transition-colors">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 5: FINAL QUOTE */}
            <section className="container mx-auto max-w-5xl px-4 text-center">
                <motion.div
                    {...fadeIn}
                    className="relative inline-block"
                >
                    <div className="absolute -inset-4 bg-orange-500/5 blur-3xl rounded-full" />
                    <p className="relative text-3xl md:text-5xl font-black text-foreground tracking-tight leading-[1.1] max-w-4xl mx-auto">
                        &quot;Commodity trade does not fail due to lack of opportunity — it fails due to <span className="text-orange-500 italic underline decoration-orange-500/30 underline-offset-8">lack of structured execution</span>.&quot;
                    </p>
                </motion.div>
            </section>
        </div>
    );
}
