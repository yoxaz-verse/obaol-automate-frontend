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
      className="relative py-28 px-6 min-h-[720px]
                 border-t border-default-200 bg-background overflow-hidden"
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

      {/* Ambient gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-1/2 h-full
                        bg-gradient-to-l from-orange-400/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full
                        bg-gradient-to-r from-green-500/10 to-transparent blur-3xl" />
      </div>

      {/* CONTENT (ANIMATED ONLY) */}
      <motion.div
        style={{ opacity, y }}
        className="relative z-10 max-w-6xl mx-auto"
      >
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold leading-snug">
            <span className="text-orange-400">Started</span> in the{" "}
            <span className="text-green-500">Indian Market</span>.
            <br />
            Designed for Domestic and Global Trade.
          </h2>

          <p className="mt-6 text-lg text-default-600 leading-relaxed">
            OBAOL simplifies and automates both domestic and international
            commodity trading using a single, structured operating system.
          </p>
        </motion.div>

        {/* Explanation blocks */}
        <div className="grid md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-xl border border-default-200
                       bg-content1 backdrop-blur"
          >
            <p className="text-default-600 leading-relaxed">
              We began by building and validating the system in India — not
              because it is geographically limited, but because India represents
              one of the most complex commodity trading environments.
            </p>

            <p className="mt-4 text-default-500 leading-relaxed">
              Fragmented supply chains, diverse raw material sources, varying
              quality standards, and multi-layer logistics operate simultaneously.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-xl border border-orange-400/40
                       bg-content1 backdrop-blur
                       shadow-[0_0_40px_rgba(255,165,0,0.08)]"
          >
            <p className="text-default-600 leading-relaxed">
              Validating execution under these conditions ensures the same
              system can operate reliably across global trade routes.
            </p>

            <p className="mt-4 text-default-500 leading-relaxed">
              A platform capable of handling domestic complexity is inherently
              prepared for international trade execution.
            </p>
          </motion.div>
        </div>

        {/* Closing */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <div className="h-px w-full bg-gradient-to-r
                          from-orange-400/30 via-gray-700 to-green-500/30" />
          <p className="mt-6 text-sm text-default-500 max-w-3xl leading-relaxed">
            A system proven in a high-complexity domestic market is structurally
            ready to support global commodity trade execution.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
