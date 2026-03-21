"use client";

import React from "react";
import ParticleNetwork from "@/components/ui/particle-network";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutSection() {
    return (
        <section className="relative py-32 px-6 bg-background border-t border-white/5 overflow-hidden" id="about">
            {/* Ambient Deep Space Gradients */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/4" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full translate-y-1/4 translate-x-1/4" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">
                {/* TEXT CONTENT */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-sm font-bold tracking-widest uppercase text-default-500 mb-4 block">
                        Our Vision
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight mb-8">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-400 drop-shadow-sm">
                            Who We Are
                        </span>
                    </h2>

                    <div className="space-y-6">
                        <p className="text-default-500 text-lg md:text-xl leading-relaxed">
                            OBAOL is founded on the principle that <span className="text-foreground font-medium">transparency and execution</span> are the lifeblood of commodities trading.
                            We are not just a platform; we are a dedicated team of trade operating specialists committed to fixing the broken agro-commodity supply chain.
                        </p>
                        <p className="text-default-500 text-base md:text-lg leading-relaxed">
                            Our mission is to eliminate the noise of non-performers and provide a secure, verified environment where real buyers and suppliers can transact with confidence.
                        </p>
                    </div>

                    <div className="mt-12 p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <h3 className="text-xs uppercase tracking-widest text-default-600 font-bold mb-4">Leadership</h3>
                        <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
                            Jacob Alwin
                        </p>
                        <p className="text-sm md:text-base text-orange-400 font-medium tracking-wide">
                            CEO — OBAOL Supreme <br className="md:hidden" />
                            <span className="hidden md:inline text-default-600 mx-2">|</span>
                            Founder — Yoxaz Verse
                        </p>
                    </div>
                </motion.div>

                {/* IMAGE / VISUAL */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: 30 }}
                    whileInView={{ opacity: 1, scale: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative h-[400px] md:h-[600px] w-full rounded-3xl overflow-hidden bg-black/5 border border-default-200/50 flex items-center justify-center shadow-none backdrop-blur-3xl group"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 via-transparent to-indigo-500/10 opacity-30 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none mix-blend-screen z-0" />



                    {/* Glowing Arcane Aura Behind Subject */}
                    <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-orange-500/30 blur-[100px] rounded-full z-0 group-hover:bg-orange-500/60 transition-colors duration-1000" />

                    {/* The Person (Holographic/Arcane Blend) */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        <div
                            className="absolute inset-0"
                            style={{
                                WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 15%, black 100%)',
                                maskImage: 'linear-gradient(to top, transparent 0%, black 15%, black 100%)'
                            }}
                        >
                            <Image
                                src="/images/Jacob-Alwin-Obaol.png"
                                alt="Jacob Alwin, CEO OBAOL Supreme"
                                fill
                                className="object-cover object-[50%_20%] grayscale opacity-80 contrast-125 brightness-110 drop-shadow-[0_0_30px_rgba(245,165,36,0.3)] mix-blend-luminosity group-hover:mix-blend-normal group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 ease-out group-hover:scale-[1.05]"
                                priority
                            />
                        </div>
                    </div>

                    {/* Inner glowing border */}
                    <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none z-20" />
                </motion.div>
            </div>
        </section>
    );
}
