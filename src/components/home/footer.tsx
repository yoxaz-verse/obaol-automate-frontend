"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MdEmail, MdPhone } from "react-icons/md";
import { FaWhatsapp, FaLinkedin, FaArrowRight } from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";

export default function Footer() {
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
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* GIANT BACKGROUND TEXT */}
      <div className="absolute -bottom-20 -left-10 text-[20vw] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter z-0">
        OBAOL
      </div>

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
              <h3 className="text-3xl font-black tracking-tighter text-foreground flex items-center gap-2">
                OBAOL <span className="text-orange-500 italic">Supreme</span>
              </h3>
            </Link>
            <p className="mt-6 text-default-500 text-lg leading-relaxed max-w-md">
              The execution-focused agro trade infrastructure. We build systems that reduce risk, enforce discipline, and ensure real-world trade completion.
            </p>

            <div className="mt-10 flex flex-col gap-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all duration-300">
                  <MdEmail className="text-xl text-orange-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">Email Us</span>
                  <a href="mailto:info@support.obaol.com" className="text-foreground font-medium hover:text-orange-500 transition-colors">
                    info@support.obaol.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <a
                  href="https://wa.me/919019351483"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-green-500/10 hover:border-green-500/20 hover:scale-110 transition-all duration-300 text-green-500"
                >
                  <FaWhatsapp className="text-xl" />
                </a>
                <a
                  href="https://www.linkedin.com/company/obaol"
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
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-foreground mb-8">Platform</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { name: "About OBAOL", href: "/about" },
                  { name: "Why OBAOL", href: "/why-obaol" },
                  { name: "How It Works", href: "/how-it-works" },
                  { name: "Procurement", href: "/procurement" },
                  { name: "Verification", href: "/verification" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-default-500 hover:text-foreground hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                      <span className="w-0 h-[1px] bg-orange-500 group-hover:w-3 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* RESOURCES */}
            <motion.div variants={itemVariants}>
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-foreground mb-8">Resources</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { name: "FAQs", href: "/faq" },
                  { name: "Export Resources", href: "/export-resources" },
                  { name: "Global Marketplace", href: "/product" },
                  { name: "Sign In", href: "/auth" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-default-500 hover:text-foreground hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                      <span className="w-0 h-[1px] bg-orange-500 group-hover:w-3 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* LEGAL */}
            <motion.div variants={itemVariants} className="col-span-2 md:col-span-1">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-foreground mb-8">Legal</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { name: "Privacy Policy", href: "/privacy-policy" },
                  { name: "Terms & Conditions", href: "/terms-and-conditions" },
                  { name: "Disclaimer", href: "/disclaimer" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-default-500 hover:text-foreground hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                      <span className="w-0 h-[1px] bg-orange-500 group-hover:w-3 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
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
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Empowering Global Agro Trade
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="group p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/10 transition-all duration-500 flex items-center gap-3"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-default-400 group-hover:text-foreground transition-colors">Back to Top</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
              <FiArrowUp className="text-orange-500 group-hover:text-white group-hover:-translate-y-1 transition-all" />
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
