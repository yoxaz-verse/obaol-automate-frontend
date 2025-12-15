"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";


const containerVariants = {
    hidden: { 
      opacity: 0,
      clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
    },
    visible: {
      opacity: 1,
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      transition: {
        clipPath: {
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
        },
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };
  
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
    },
    visible: {
      opacity: 1,
      y: 0,
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      transition: {
        opacity: {
          duration: 0.6,
          delay: 0.2,
        },
        y: {
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        },
        clipPath: {
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    },
  };
  
  const textReveal = {
    hidden: { 
      opacity: 0, 
      y: 40, 
      filter: "blur(10px)",
      clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      
      transition: {
        opacity: {
          duration: 0.8,
          delay: 0.6,
        },
        y: {
          duration: 1,
          ease: [0.22, 1, 0.36, 1],
        },
        filter: {
          duration: 0.8,
          delay: 0.2,
        },
        clipPath: {
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.1,
        },
      },
    },
  };
  
  const glitchVariants = {
    normal: {
      opacity: 1,
      x: 0,
      filter: "hue-rotate(0deg)",
    },
    glitch: {
      opacity: [1, 0.8, 1, 0.9, 1],
      x: [0, -2, 2, -1, 0],
      filter: [
        "hue-rotate(0deg)",
        "hue-rotate(90deg)",
        "hue-rotate(0deg)",
        "hue-rotate(-90deg)",
        "hue-rotate(0deg)",
      ],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut",
      },
    },
  };
  
export default function HeroSection() {
  
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
      target: heroRef,
      offset: ["start start", "end start"],
    });
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
    const y = useTransform(scrollYProgress, [0, 1], [0, 50]);
  
    return (
    <motion.section
    ref={heroRef}
    style={{ opacity, scale, y }}
    className="relative min-h-screen flex items-center justify-center pt-24 md:pt-32 pb-16 px-6 md:px-8 lg:px-12 xl:px-16 overflow-hidden"
    >
    {/* Enhanced Animated Background Gradient */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary Gradient Orb */}
      <motion.div
        animate={{
          x: ["-20%", "20%", "-20%"],
          y: ["-10%", "10%", "-10%"],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-orange-400/20 rounded-full blur-3xl"
      />
      
      {/* Secondary Gradient Orb */}
      <motion.div
        animate={{
          x: ["20%", "-20%", "20%"],
          y: ["10%", "-10%", "10%"],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-yellow-400/15 rounded-full blur-3xl"
      />
      
      {/* Tertiary Gradient Orb */}
      <motion.div
        animate={{
          x: ["0%", "15%", "0%"],
          y: ["0%", "-15%", "0%"],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-3xl"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
      
      {/* Animated Radial Lines */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-[0.02]"
      >
        <div className="absolute top-1/2 left-1/2 w-full h-full"
          style={{
            background: `conic-gradient(from 0deg, transparent, rgba(255,165,0,0.1), transparent)`,
          }}
        />
      </motion.div>
    </div>
    
    {/* Enhanced Grid Pattern Overlay */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.04 }}
      transition={{ duration: 1.5, delay: 0.5 }}
      className="absolute inset-0 pointer-events-none"
    >
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Animated Grid Glow */}
      <motion.div
        animate={{
          opacity: [0.02, 0.05, 0.02],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,165,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,165,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </motion.div>
    
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative max-w-6xl text-center z-10 px-4 sm:px-6 md:px-8 lg:px-12 overflow-hidden"
    >
      {/* Main Headline with Staggered Animation */}
      <motion.div variants={itemVariants} className="mb-8 md:mb-12 relative overflow-hidden">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight relative">
          <motion.span
            variants={textReveal}
            className="block mb-2 text-white sm:whitespace-nowrap relative overflow-hidden"
          >
            {/* Base text */}
            <span className="relative z-0">
              <span className="inline-block">A</span>{" "}
              <span
                className="inline-block relative"
                style={{
                  WebkitTextStroke: "2px rgba(255,255,255,0.95)",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                } as React.CSSProperties}
              >
                Digital
              </span>
              {" "}
              <span className="inline-block">Infrastructure</span>
            </span>
        
            {/* Secondary cinematic shine pass */}
            <motion.span
              initial={{ 
                x: "-120%",
                opacity: 0
              }}
              animate={{ 
                x: "220%",
                opacity: [0, 0.6, 0.9, 0.6, 0]
              }}
              transition={{
                x: {
                  duration: 2.8,
                  delay: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                },
                opacity: {
                  duration: 2.8,
                  delay: 0.7,
                  times: [0, 0.25, 0.5, 0.75, 1],
                },
              }}
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: "linear-gradient(135deg, transparent 0%, rgba(255,165,0,0.4) 35%, rgba(255,165,0,0.8) 45%, rgba(255,255,255,1) 50%, rgba(255,165,0,0.8) 55%, rgba(255,165,0,0.4) 65%, transparent 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                width: "70%",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
                maskImage: "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
              } as React.CSSProperties}
            >
              A Digital Infrastructure
            </motion.span>
          </motion.span>
          <motion.span
            variants={textReveal}
            className="block text-white mt-1 relative overflow-hidden"
          >
            {/* Base text */}
            <span className="relative z-0">
              <span className="inline-block text-gray-400" style={{ fontSize: "0.65em" }}>for</span>{" "}
              <motion.span
                className="inline-block bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent relative"
                animate={{
                  backgroundPosition: ["0%", "200%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% auto",
                }}
              >
                Global Commodity Trading
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-400/50 via-yellow-400/50 to-orange-400/50 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                />
              </motion.span>
            </span>
            {/* Cinematic shine for second line - text only */}
    
          </motion.span>
        </h1>
      </motion.div>
    
      {/* Subtitle with Enhanced Typography */}
      <motion.div
        variants={itemVariants}
        className="mt-12 md:mt-16 lg:mt-20 max-w-4xl mx-auto relative overflow-hidden"
      >
        <motion.p
          variants={textReveal}
          className="text-xl md:text-2xl lg:text-3xl text-gray-300 leading-relaxed font-light tracking-wide relative overflow-hidden"
        >
          {/* Shine overlay that follows the reveal */}
          <motion.span
            initial={{ 
              x: "-100%",
              opacity: 0
            }}
            animate={{ 
              x: "200%",
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              x: {
                duration: 1.4,
                delay: 0.8,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: {
                duration: 1.4,
                delay: 0.8,
                times: [0, 0.3, 0.7, 1],
              },
            }}
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.3) 55%, transparent 100%)",
              width: "60%",
              mixBlendMode: "screen",
              WebkitMaskImage: "linear-gradient(to right, transparent, black, transparent)",
              maskImage: "linear-gradient(to right, transparent, black, transparent)",
            } as React.CSSProperties}
          />
          <span className="relative z-0">
            <motion.span
              variants={glitchVariants}
              animate="glitch"
              className="inline-block relative text-orange-400 font-semibold"
              style={{
                textShadow: "0 0 10px rgba(255,165,0,0.5)",
              }}
            >
              <motion.span
                className="absolute inset-0 opacity-50 pointer-events-none"
                animate={{
                  x: [0, -2, 2, 0],
                  opacity: [0, 0.6, 0, 0],
                }}
                transition={{
                  duration: 0.15,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                style={{
                  color: "#ff0080",
                  filter: "blur(1px)",
                }}
              >
                OBAOL
              </motion.span>
              <motion.span
                className="absolute inset-0 opacity-40 pointer-events-none"
                animate={{
                  x: [0, 2, -2, 0],
                  opacity: [0, 0.4, 0, 0],
                }}
                transition={{
                  duration: 0.15,
                  repeat: Infinity,
                  repeatDelay: 3,
                  delay: 0.05,
                }}
                style={{
                  color: "#00ffff",
                  filter: "blur(1px)",
                }}
              >
                OBAOL
              </motion.span>
              <span className="relative">OBAOL</span>
            </motion.span>
            {" "}Supreme is an end-to-end trading system built for{" "}
            <span className="text-white font-normal">physical commodity trade</span>
            {" "}— with a strong focus on agro-commodities, import-export, and
            structured procurement.
          </span>
        </motion.p>
      </motion.div>
    
      {/* Emphasis Text */}
      <motion.div
        variants={itemVariants}
        className="mt-10 md:mt-12 lg:mt-16 max-w-3xl mx-auto relative overflow-hidden"
      >
        <motion.p
          variants={textReveal}
          className="text-base md:text-lg lg:text-xl text-white font-medium leading-relaxed tracking-normal relative overflow-hidden"
        >
          {/* Shine overlay that follows the reveal */}
          <motion.span
            initial={{ 
              x: "-100%",
              opacity: 0
            }}
            animate={{ 
              x: "200%",
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              x: {
                duration: 1.6,
                delay: 1.2,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: {
                duration: 1.6,
                delay: 1.2,
                times: [0, 0.3, 0.7, 1],
              },
            }}
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.25) 55%, transparent 100%)",
              width: "60%",
              mixBlendMode: "screen",
              WebkitMaskImage: "linear-gradient(to right, transparent, black, transparent)",
              maskImage: "linear-gradient(to right, transparent, black, transparent)",
            } as React.CSSProperties}
          />
          <span className="relative z-0">
            <span className="text-orange-400/90">This is not financial trading.</span>{" "}
            This is real-world trade execution, modernized through technology, verification, and automation.
          </span>
        </motion.p>
      </motion.div>
    
      {/* Enhanced Buttons */}
      <motion.div
        variants={itemVariants}
        className="mt-16 md:mt-20 lg:mt-24 mb-32 md:mb-40 flex flex-col sm:flex-row gap-6 justify-center items-center flex-wrap"
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full sm:w-auto"
        >
          <Link
            href="/product"
            className="group relative px-10 py-5 rounded-xl bg-white text-black font-semibold text-lg overflow-hidden transition-all duration-300 block text-center shadow-lg shadow-orange-400/20 hover:shadow-xl hover:shadow-orange-400/30"
          >
            <span className="relative z-10 tracking-wide">Explore the System</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              initial={false}
            />
            <motion.div
              className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100"
              initial={false}
            />
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full sm:w-auto"
        >
          <Link
            href="/auth"
            className="group relative px-10 py-5 rounded-xl border-2 border-gray-600 text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:border-orange-400 block text-center backdrop-blur-sm bg-white/5 hover:bg-white/10"
          >
            <span className="relative z-10 tracking-wide">Access Dashboard</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              initial={false}
            />
            <motion.div
              className="absolute inset-0 border-2 border-orange-400/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              initial={false}
            />
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
    
    {/* Enhanced Scroll Indicator */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-20 -translate-y-1/2 -translate-x-1/2 z-20"
    >
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="flex flex-col items-center gap-3 cursor-pointer group"
      >
        <motion.span
          className="text-xs uppercase tracking-wider text-gray-400 font-medium group-hover:text-orange-400 transition-colors duration-300"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll to explore
        </motion.span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400 group-hover:text-orange-400 transition-colors duration-300"
          >
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-orange-400/20 rounded-full blur-md"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0, 0.5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
    </motion.section>
    
  );
}
