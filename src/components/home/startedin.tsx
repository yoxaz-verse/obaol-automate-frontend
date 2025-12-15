"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";




export default function StartedIn() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /**
   * SCROLL → SPACE MAPPING
   * This is the core of the effect you want
   */
// SLOW, SOFT, CINEMATIC FADE
const opacity = useTransform(
  scrollYProgress,
  [0, 0.25, 0.75, 1],
  [0, 1, 1, 0]
);

// COMING FROM BACK → GOING BACK
const y = useTransform(
  scrollYProgress,
  [0, 0.25, 0.75, 1],
  [200, 0, 0, -200]
);

// DEPTH FEEL
const scale = useTransform(
  scrollYProgress,
  [0, 0.25, 0.75, 1],
  [0.94, 1, 1, 0.94]
);



  return (

       <motion.section 
       
       ref={sectionRef}
       style={{
         opacity,
         y,
         scale,
         willChange: "transform, opacity",
       }}           className="relative py-28 px-6 border-t border-gray-800 bg-black overflow-hidden">

        {/* Background Effects */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-400/20 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-green-500/20 to-transparent blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold leading-snug">
              <motion.span
                className="text-orange-400"
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Started{" "}
              </motion.span>
              in Indian
              <motion.span
                className="text-green-500"
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {" "}
                Market
              </motion.span>
              .
              <br />
              Designed for Domestic and Global Trade.
            </h2>

            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              OBAOL is built to simplify and automate both domestic and
              international commodity trading using the same structured system.
            </p>
          </motion.div>

          {/* Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-10"
          >
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-xl border border-gray-800/50 bg-neutral-950/50 hover:border-gray-700 transition-all"
            >
              <p className="text-gray-300 leading-relaxed">
                We started by building and testing the system in India — not
                because it is limited to one geography, but because India
                represents one of the most complex trading environments.
              </p>

              <p className="mt-4 text-gray-400 leading-relaxed">
                Domestic trading in India involves fragmented supply chains,
                diverse raw material sources, varying quality standards, and
                multiple logistics layers — all operating simultaneously.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 rounded-xl border border-gray-800/50 bg-neutral-950/50 hover:border-gray-700 transition-all"
            >
              <p className="text-gray-300 leading-relaxed">
                This diversity of raw material supply, combined with both
                domestic distribution and export flows, makes India an ideal
                environment to validate real trade execution.
              </p>

              <p className="mt-4 text-gray-400 leading-relaxed">
                By structuring and automating trade in such conditions, OBAOL
                enables the same system to be applied confidently across
                regions, markets, and trade routes.
              </p>
            </motion.div>
          </motion.div>

          {/* Subtle Emphasis */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16"
          >
            <motion.div
              className="h-px w-full bg-gradient-to-r from-orange-400/30 via-gray-700 to-green-500/30"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            <p className="mt-6 text-sm text-gray-400 max-w-3xl leading-relaxed">
              A system that can handle domestic complexity and raw material
              diversity is inherently capable of supporting global trade
              execution.
            </p>
          </motion.div>
        </div>


      </motion.section>
  );
}



function TimeCompare({
    title,
    traditionalSteps,
    obaolSteps,
    highlight,
    note,
  }: {
    title: string;
    traditionalSteps: { label: string; time: string }[];
    obaolSteps: { label: string; time: string }[];
    highlight?: boolean;
    note?: string;
  }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: "-100px" }}
        className="group"
      >
        <motion.h3
          className="text-xl md:text-2xl font-semibold text-white mb-8"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {title}
        </motion.h3>
  
        <div className="grid md:grid-cols-2 gap-6">
          {/* Traditional */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-6 rounded-xl border border-gray-800 bg-neutral-950 hover:border-gray-700 transition-all duration-300"
          >
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">
              Traditional Method
            </span>
            <ul className="mt-4 space-y-3">
              {traditionalSteps.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex justify-between items-center text-sm text-gray-300 py-2 border-b border-gray-900 last:border-0"
                >
                  <span>{s.label}</span>
                  <span className="text-gray-500 font-medium">{s.time}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
  
          {/* OBAOL */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`p-6 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 border transition-all relative overflow-hidden group/obaol
            ${
              highlight
                ? "border-orange-400 shadow-[0_0_30px_rgba(255,165,0,0.3)]"
                : "border-gray-700 hover:border-orange-400/50"
            }`}
          >
            {/* Glow effect */}
            {highlight && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/10 to-orange-400/0 opacity-0 group-hover/obaol:opacity-100 transition-opacity duration-500"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}
  
            <span className="text-xs uppercase tracking-wide font-medium relative z-10">
              With
              <span className="text-orange-400"> OBAOL</span>
            </span>
            <ul className="mt-4 space-y-3 relative z-10">
              {obaolSteps.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex justify-between items-center text-sm text-gray-200 py-2 border-b border-gray-800 last:border-0"
                >
                  <span>{s.label}</span>
                  <span className="font-semibold text-orange-400">{s.time}</span>
                </motion.li>
              ))}
            </ul>
  
            {note && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-4 text-xs text-gray-400 italic relative z-10"
              >
                {note}
              </motion.p>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }
  
  function TotalTimeCard({
    title,
    time,
    note,
    highlight,
  }: {
    title: string;
    time: string;
    note: string;
    highlight?: boolean;
  }) {
    return (
      <motion.div
        whileHover={{ scale: 1.03, y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`relative p-8 rounded-xl border overflow-hidden ${
          highlight
            ? "border-orange-400/50 bg-gradient-to-br from-neutral-900 to-black shadow-[0_0_40px_rgba(255,165,0,0.2)]"
            : "border-gray-800 bg-black hover:border-gray-700"
        }`}
      >
        {highlight && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/5 to-orange-400/0"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
        <div className="relative z-10">
          <h4 className="text-lg font-semibold">{title}</h4>
          <motion.p
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className={`mt-4 text-4xl md:text-5xl font-bold ${
              highlight ? "text-orange-400" : "text-white"
            }`}
          >
            {time}
          </motion.p>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed">{note}</p>
        </div>
      </motion.div>
    );
  }
  