"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CinematicIntro() {
  const [visible, setVisible] = useState(true);
  const [techTexts, setTechTexts] = useState<Array<{ id: number, text: string, top: string, left: string, delay: number }>>([]);

  useEffect(() => {
    const texts = [
      "DISCOVER PRODUCTS",
      "CREATE AN ENQUIRY",
      "VERIFY QUALITY",
      "COORDINATE LOGISTICS",
      "REQUEST A SAMPLE",
      "TRACK AN ORDER",
      "MANAGE DOCUMENTS",
      "COMPLETE EXECUTION",
    ];

    const generatedTexts = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      text: texts[Math.floor(Math.random() * texts.length)],
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      delay: Math.random() * 1.5,
    }));
    setTechTexts(generatedTexts);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(false);
      return;
    }

    const t = window.setTimeout(() => {
      setVisible(false);
    }, 2800); // 2.8 seconds total display

    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cinematic-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030813] overflow-hidden"
        >
          {/* Ambient Glowing Orbs */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.5 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-orange-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"
          />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.3 }}
            transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen"
          />

          {/* Random Tech Text Overlays */}
          {techTexts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: [0, 0.4, 0], filter: ["blur(4px)", "blur(0px)", "blur(4px)"] }}
              transition={{ duration: 1.5, delay: item.delay, times: [0, 0.2, 1] }}
              className="absolute text-[8px] md:text-[10px] font-mono text-orange-500/50 uppercase tracking-widest pointer-events-none whitespace-nowrap z-0"
              style={{ top: item.top, left: item.left }}
            >
              {item.text}
            </motion.div>
          ))}

          {/* Grid lines for execution theme */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <motion.p
              initial={{ opacity: 0, y: 10, letterSpacing: "0.1em" }}
              animate={{ opacity: 0.7, y: 0, letterSpacing: "0.3em" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              className="text-[10px] md:text-xs font-bold uppercase text-white/70 mb-4 tracking-widest"
            >
              Agro Execution System
            </motion.p>
            
            <div className="overflow-hidden py-2">
              <motion.p
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] pb-2"
              >
                OBAOL Supreme
              </motion.p>
            </div>
            
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "120px", opacity: 1 }}
              transition={{ duration: 1, ease: "easeInOut", delay: 1 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent mt-6"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
