"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface AuthLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

const FloatingPixel = ({ delay }: { delay: number }) => (
    <motion.div
        className="absolute w-1 h-1 bg-warning-500/40 rounded-full"
        initial={{ y: "110vh", x: Math.random() * 100 + "vw", opacity: 0 }}
        animate={{
            y: "-10vh",
            opacity: [0, 1, 0],
        }}
        transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: delay,
            ease: "linear",
            repeatType: "loop",
        }}
    />
);



const TypewriterEffect = ({ words }: { words: string[] }) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    // Blinking cursor
    useEffect(() => {
        const timeout2 = setTimeout(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearTimeout(timeout2);
    }, [blink]);

    // Typing logic
    useEffect(() => {
        if (index === words.length) {
            setIndex(0); // Loop back
            return;
        }

        if (subIndex === words[index].length + 1 && !reverse) {
            setReverse(true);
            return;
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, Math.max(reverse ? 50 : subIndex === words[index].length ? 1500 : 100, Math.random() * 50)); // Random typing speed

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words]);

    return (
        <span>
            {`${words[index].substring(0, subIndex)}`}
            {blink ? "|" : " "}
        </span>
    );
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#050505] relative text-foreground font-sans selection:bg-warning-500/30">
            {/* Interactive Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Mouse Follower Gradient */}
                <motion.div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),_rgba(245,165,36,0.1)_0%,_transparent_40%)]"
                    style={{
                        //@ts-ignore
                        "--x": `${mousePosition.x * 100}%`,
                        "--y": `${mousePosition.y * 100}%`,
                    }}
                />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

                {/* Floating Particles */}
                {[...Array(30)].map((_, i) => (
                    <FloatingPixel key={i} delay={i * 0.2} />
                ))}
            </div>

            {/* Content Flex Wrapper */}
            <div className="relative z-10 w-full h-full flex flex-col lg:flex-row">

                {/* Left Side: Branding (Hidden on Mobile) */}
                <motion.div
                    className="hidden lg:flex w-5/12 flex-col justify-center px-12 xl:px-20 relative border-r border-white/5 bg-black/20 backdrop-blur-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="relative z-20">
                        <div className="w-auto h-16 relative mb-10 flex items-center">
                            <Image
                                src="/logo.png"
                                alt="Obaol"
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="w-auto h-full object-contain drop-shadow-[0_0_20px_rgba(245,165,36,0.3)]"
                                priority
                            />
                        </div>

                        <h1 className="text-5xl xl:text-6xl font-black tracking-tighter text-white mb-6 leading-[0.95]">
                            OBAOL <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning-400 to-amber-600 block h-[1.2em]">
                                <TypewriterEffect
                                    words={[
                                        "AUTOMATION",
                                        "LOGISTICS",
                                        "SUPPLY CHAIN",
                                        "INVENTORY",
                                        "AGRO-TRADE"
                                    ]}
                                />
                            </span>
                        </h1>

                        <p className="text-lg text-default-400 max-w-sm border-l-2 border-warning-500/50 pl-6 leading-relaxed">
                            Empowering your business with intelligent, automated solutions.
                        </p>
                    </div>

                    {/* Tech Decorators */}
                    <div className="absolute bottom-12 left-12 flex gap-6 text-[10px] font-mono text-default-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse" />
                            System_Online
                        </div>
                        <div>Secured_Connection_v3</div>
                    </div>
                </motion.div>

                {/* Right Side: Form Container (Scrollable) */}
                <div className="w-full lg:w-7/12 flex flex-col h-full bg-transparent overflow-y-auto custom-scrollbar">
                    <div className="flex-grow flex items-center justify-center p-6 py-12">
                        <motion.div
                            className="w-full max-w-[440px] relative"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {/* Mobile Logo */}
                            <div className="lg:hidden mb-8 flex justify-center">
                                <div className="relative w-12 h-12">
                                    <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                                </div>
                            </div>

                            {/* Glass Card */}
                            <div className="relative bg-[#0a0a0a]/60 border border-white/10 rounded-2xl p-8 lg:p-10 backdrop-blur-xl shadow-2xl overflow-hidden">
                                {/* Card Highlight */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-warning-500/50 to-transparent opacity-50" />

                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                        {title}
                                    </h2>
                                    <p className="text-default-400 text-sm">
                                        {subtitle}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {children}
                                </div>
                            </div>

                            <div className="mt-8 text-center text-[10px] text-default-600 font-mono tracking-widest uppercase opacity-40">
                                Obaol Automate &bull; Enterprise Access
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
