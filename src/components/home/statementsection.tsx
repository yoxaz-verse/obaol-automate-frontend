"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function StatementSection() {
    const sectionRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });

    // Parallax background glow
    const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
    const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.9]);
    const glowOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 0.15, 0.15, 0]);

    return (
        <section
            ref={sectionRef}
            className="relative py-32 md:py-48 lg:py-56 px-6 overflow-hidden bg-background"
        >
            {/* Animated ambient glow that follows scroll */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ y: glowY }}
            >
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-orange-400 blur-[200px]"
                    style={{ scale: glowScale, opacity: glowOpacity }}
                />
            </motion.div>

            {/* Secondary subtle glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-yellow-400/3 blur-[100px]" />
                <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-orange-500/3 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto text-center">
                {/* Line 1 — Strikes through with confidence */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.p
                        initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-default-400 tracking-tight"
                    >
                        Not a Marketplace.
                    </motion.p>
                </motion.div>

                {/* Divider — Expands from center with glow */}
                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto mt-10 mb-10 h-[2px] w-32 origin-center relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400 to-transparent blur-sm" />
                </motion.div>

                {/* Line 2 — Grand reveal with scale */}
                <motion.h2
                    initial={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(12px)" }}
                    whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
                >
                    A Complete{" "}
                    <span className="relative inline-block">
                        <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            Trading System.
                        </span>
                        {/* Underline glow accent */}
                        <motion.span
                            initial={{ scaleX: 0, opacity: 0 }}
                            whileInView={{ scaleX: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute -bottom-2 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-orange-400/80 via-yellow-400/60 to-transparent rounded-full"
                        />
                    </span>
                </motion.h2>

                {/* Subtle supporting text — fades in last */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 1.0, delay: 1.2, ease: "easeOut" }}
                    className="mt-10 text-sm md:text-base text-default-400 tracking-wide uppercase font-medium"
                >
                    Discovery → Verification → Execution → Settlement
                </motion.p>
            </div>
        </section>
    );
}
