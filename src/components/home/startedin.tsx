"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export default function StartedIn() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.85, 1],
    [0, 1, 1, 0]
  );

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-48 px-6 min-h-[720px] bg-background border-t border-white/5 overflow-hidden"
    >
      {/* RIGHT-SIDE IMAGE LAYER */}
      <div
        className="absolute top-0 right-0 h-full w-[45%]
                   hidden md:block pointer-events-none z-0"
      >
        <Image
          src="/images/india_map.png"
          alt="India commodity trade network"
          fill
          priority={false}
          sizes="(min-width: 768px) 45vw"
          className="object-contain object-right opacity-25"
        />

        {/* Fade into content */}
        <div className="absolute inset-y-0 left-0 w-32
                        bg-gradient-to-r from-background to-transparent" />
      </div>

      {/* Ambient Deep Space Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-500/5 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/4" />
      </div>

      {/* CONTENT (ANIMATED ONLY) */}
      <motion.div
        style={{ opacity, y }}
        className="relative z-10 max-w-6xl mx-auto"
      >
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mb-20 md:mb-24"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-foreground">
            <span className="text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.3)]">Started</span> in the{" "}
            <span className="text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">Indian Market</span>.<br />
            Designed for Domestic & Global Trade.
          </h2>

          <p className="mt-8 text-lg md:text-xl text-default-500 leading-relaxed max-w-2xl">
            OBAOL simplifies and automates both domestic and international
            commodity trading using a single, structured operating system.
          </p>
        </motion.div>

        {/* Explanation blocks */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 md:p-10 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500"
          >
            <p className="text-base md:text-lg text-default-400 leading-relaxed">
              We began by building and validating the system in India — not
              because it is geographically limited, but because India represents
              one of the <span className="text-foreground font-semibold">most complex commodity trading environments</span>.
            </p>

            <p className="mt-6 text-sm md:text-base text-default-500 leading-relaxed">
              Fragmented supply chains, diverse raw material sources, varying
              quality standards, and multi-layer logistics operate simultaneously.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 md:p-10 rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent backdrop-blur-2xl shadow-[0_0_50px_rgba(251,146,60,0.1)] hover:border-orange-500/40 hover:shadow-[0_0_60px_rgba(251,146,60,0.15)] transition-all duration-500"
          >
            <p className="text-base md:text-lg text-foreground font-medium leading-relaxed">
              Validating execution under these conditions ensures the same
              system can operate reliably across global trade routes.
            </p>

            <p className="mt-6 text-sm md:text-base text-default-400 leading-relaxed">
              A platform capable of handling domestic complexity is inherently
              prepared for international trade execution.
            </p>
          </motion.div>
        </div>

        {/* Closing */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 md:mt-24 relative"
        >
          <div className="h-px w-full bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-green-500/0" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-48 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50 blur-[2px]" />
          <p className="mt-8 text-sm md:text-base font-medium text-default-400 max-w-3xl leading-relaxed text-center sm:text-left">
            A system proven in a high-complexity domestic market is structurally
            ready to support global commodity trade execution.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
