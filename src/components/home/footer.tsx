"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MdEmail } from "react-icons/md";
import { FaWhatsapp, FaLinkedin, FaArrowRight } from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";
import { BUSINESS_IDENTITY } from "@/utils/businessIdentity";

export default function Footer() {
  const accentText = "text-obaol-700 dark:text-obaol-300";
  const accentHover = "hover:text-obaol-700 dark:hover:text-obaol-300";
  const accentLine = "bg-obaol-500";
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="relative bg-background border-t border-white/[0.05] pt-24 pb-12 overflow-hidden z-0">
      {/* DECORATIVE BACKGROUND ELEMENTS */}
      <div className="absolute left-1/4 top-0 z-0 h-[500px] w-[500px] rounded-full bg-obaol-500/[0.08] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none z-0" />



      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="visible"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8"
        >
          {/* BRAND SECTION */}
          <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col items-start">
            <Link href="/" className="group">
              <h3 className="flex items-center gap-2 text-3xl font-bold tracking-[-0.025em] text-foreground">
                OBAOL <span className="bg-gradient-to-r from-obaol-700 to-obaol-500 bg-clip-text text-transparent dark:from-obaol-200 dark:to-obaol-500">Supreme</span>
              </h3>
            </Link>
            <p className="mt-6 text-default-500 text-lg leading-relaxed max-w-md">
              The execution-focused agro trade infrastructure. We build systems that reduce risk, enforce discipline, and ensure real-world trade completion.
            </p>

            <div className="mt-10 flex flex-col gap-6">
              <div className="flex items-center gap-4 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] transition-all duration-300 group-hover:border-obaol-500/25 group-hover:bg-obaol-500/10">
                  <MdEmail className={`text-xl ${accentText}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">Email Us</span>
                  <a href={`mailto:${BUSINESS_IDENTITY.email}`} className={`text-foreground font-medium transition-colors ${accentHover}`}>
                    {BUSINESS_IDENTITY.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] transition-all duration-300 group-hover:border-obaol-500/25 group-hover:bg-obaol-500/10">
                  <span className={`text-xl ${accentText}`}>✓</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">Verified Identity</span>
                  <Link href="/trust" className={`text-foreground font-medium transition-colors ${accentHover}`}>
                    View trust profile
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <a
                  href={BUSINESS_IDENTITY.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-green-500/10 hover:border-green-500/20 hover:scale-110 transition-all duration-300 text-green-500"
                >
                  <FaWhatsapp className="text-xl" />
                </a>
                <a
                  href={BUSINESS_IDENTITY.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-blue-500/10 hover:border-blue-500/20 hover:scale-110 transition-all duration-300 text-blue-500"
                >
                  <FaLinkedin className="text-xl" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* LINKS GRID */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            {/* PLATFORM */}
            <motion.div variants={itemVariants}>
              <h4 className="mb-8 text-sm font-bold uppercase tracking-[0.2em] text-foreground">Platform</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { name: "About OBAOL", href: "/about" },
                  { name: "Roles & Participants", href: "/roles" },
                  { name: "Why OBAOL", href: "/why-obaol" },
                  { name: "How It Works", href: "/how-it-works" },
                  { name: "Procurement", href: "/procurement" },
                  { name: "Verification", href: "/verification" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-default-500 hover:text-foreground hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                      <span className={`w-0 h-[1px] group-hover:w-3 transition-all duration-300 ${accentLine}`} />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* RESOURCES */}
            <motion.div variants={itemVariants}>
              <h4 className="mb-8 text-sm font-bold uppercase tracking-[0.2em] text-foreground">Resources</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { name: "FAQs", href: "/faq" },
                  { name: "Export Resources", href: "/export-resources" },
                  { name: "Trade Finance", href: "/trade-finance" },
                  { name: "Catalog", href: "/trade-directory" },
                  { name: "Sign In", href: "/auth" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-default-500 hover:text-foreground hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                      <span className={`w-0 h-[1px] group-hover:w-3 transition-all duration-300 ${accentLine}`} />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* LEGAL */}
            <motion.div variants={itemVariants} className="col-span-2 md:col-span-1">
              <h4 className="mb-8 text-sm font-bold uppercase tracking-[0.2em] text-foreground">Legal</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { name: "Privacy Policy", href: "/privacy-policy" },
                  { name: "Terms & Conditions", href: "/terms-and-conditions" },
                  { name: "Disclaimer", href: "/disclaimer" },
                  { name: "Trust & Verification", href: "/trust" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-default-500 hover:text-foreground hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                      <span className={`w-0 h-[1px] group-hover:w-3 transition-all duration-300 ${accentLine}`} />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* GIANT FOREGROUND TEXT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-24 w-full flex justify-center items-center overflow-hidden"
        >
          <p aria-hidden="true" className="whitespace-nowrap text-[clamp(2.5rem,11vw,140px)] font-bold leading-none tracking-[-0.035em] text-foreground">
            OBAOL Supreme
          </p>
        </motion.div>

        {/* BOTTOM SECTION */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-24 pt-12 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-xs text-default-500 font-medium">
              © {new Date().getFullYear()} OBAOL Supreme. All rights reserved.
            </p>
            <p className="text-[10px] text-default-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${accentLine}`} />
              Empowering Global Agro Trade
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all duration-500 hover:border-obaol-500/30 hover:bg-obaol-500/10"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-default-400 transition-colors group-hover:text-foreground">Back to Top</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-obaol-500/10 transition-all duration-500 group-hover:bg-obaol-500 group-hover:text-obaol-950">
              <FiArrowUp className="text-obaol-700 transition-all group-hover:-translate-y-1 group-hover:text-obaol-950 dark:text-obaol-300" />
            </div>
          </button>

          <p className="text-[10px] font-bold text-default-400 uppercase tracking-[0.2em] hidden md:block">
            Architected for Execution.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
