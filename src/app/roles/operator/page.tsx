"use client";

import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiUsers,
  FiLayers,
  FiDollarSign,
  FiPhone,
  FiActivity,
  FiBarChart2,
  FiSettings,
  FiCheckCircle,
  FiArrowRight,
  FiTrendingUp,
  FiTarget,
  FiZap
} from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { buildWebPageJsonLd } from "@/utils/seo";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";

const webPageJsonLd = buildWebPageJsonLd({
  title: "Operator Role | OBAOL Supreme",
  description:
    "Learn who can become an Operator on OBAOL Supreme and how operators manage supplier portfolios, relationships, and execution support across global trade.",
  path: "/roles/operator",
});

export default function OperatorRolePage() {
  return (
    <section className="min-h-screen bg-background selection:bg-orange-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />
      <ThemedContentWrapper>
        {/* ── HERO SECTION ── */}
        <div className="relative min-h-[85vh] flex items-center pt-32 pb-20 overflow-hidden">
          {/* Parallax Background */}
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <Image
              src="/images/roles/operator/hero_bg.png"
              alt="Background Abstract"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-[1]" />

          <div className="container mx-auto max-w-7xl px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link
                href="/roles"
                className="inline-flex items-center gap-2 text-sm font-bold text-orange-500/70 hover:text-orange-500 transition-all group px-4 py-2 rounded-full border border-orange-500/10 bg-orange-500/5 backdrop-blur-sm"
              >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                Back to Roles
              </Link>
            </motion.div>

            <div className="max-w-4xl space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-600/30 flex items-center justify-center text-orange-500 shadow-inner">
                    <FiZap size={24} />
                  </div>
                  <span className="text-orange-500 font-bold uppercase tracking-[0.2em] text-xs">Digital Agro Trader</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tighter leading-[1.05] overflow-visible">
                  The <span className="inline-block px-1 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent italic">Digital Agro Trader</span> <br />
                  Role
                </h1>
                <p className="mt-8 text-xl md:text-2xl text-default-400 leading-relaxed max-w-3xl">
                  Stop managing products. Start owning relationships.
                  Operators are the power-brokers who activate supplier portfolios and earn from every successful trade.
                </p>
                <div className="mt-6 max-w-3xl">
                  <IndiaFirstNote />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <Link
                  href="/auth/operator/register"
                  className="px-8 py-4 rounded-2xl bg-orange-600 text-white font-bold text-lg shadow-[0_0_30px_-5px_rgba(234,88,12,0.5)] hover:bg-orange-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group"
                >
                  Join as Operator
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => document.getElementById('responsibilities')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-2xl border border-default-200 bg-default-100/50 backdrop-blur-md text-foreground font-bold text-lg hover:bg-default-200/80 transition-all"
                >
                  Explore the Role
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── KEY ADVANTAGES ── */}
        <div className="py-24 border-y border-default-100/50 bg-content1/30">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <FiUsers />,
                  title: "Build Relationships",
                  desc: "Cultivate trust with suppliers. You don't sell items; you represent OBAOL to build long-term business partnerships."
                },
                {
                  icon: <FiLayers />,
                  title: "Manage Portfolios",
                  desc: "Curate a selection of top-tier companies. Your portfolio is your asset — the more active it is, the more you earn."
                },
                {
                  icon: <FiDollarSign />,
                  title: "Earn Commission",
                  desc: "Benefit from every trade closed within your managed portfolio. Scale your earnings as your suppliers grow."
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[2rem] bg-background border border-default-200/50 shadow-lg hover:border-orange-500/30 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-default-500 leading-relaxed leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── THE MODERN TRADER BLOCK ── */}
        <div className="py-24 relative overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 space-y-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-widest">
                  Conceptual Shift
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Portfolio Accountability, <br />
                  <span className="text-default-400">Not just support.</span>
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-5 p-6 rounded-2xl bg-content1/50 border border-default-200/50">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                      <FiCheckCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Supplier Ownership</h4>
                      <p className="text-default-500 text-sm">You manage the entire catalog of your assigned suppliers. If they thrive, you thrive.</p>
                    </div>
                  </div>
                  <div className="flex gap-5 p-6 rounded-2xl bg-content1/50 border border-default-200/50">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                      <FiCheckCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Long-Term Incentive</h4>
                      <p className="text-default-500 text-sm">Receive commissions even if other team members close the final deal within your portfolio.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/5"
                >
                  <Image
                    src="/images/roles/operator/digital_trader.png"
                    alt="Digital Trader Workspace"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover scale-105"
                  />
                </motion.div>
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-600/20 blur-[60px] rounded-full pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ── RESPONSIBILITIES GRID ── */}
        <div id="responsibilities" className="py-24 bg-foreground/[0.02] border-t border-default-100">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Core Responsibilities</h2>
              <p className="text-default-500 max-w-2xl mx-auto">The day-to-day execution that makes a top-performing Operator.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <FiPhone />, color: "bg-blue-500", label: "Supplier Ownership", text: "Regular communication to understand supplier needs and build trust." },
                { icon: <FiActivity />, color: "bg-orange-500", label: "Platform Activity", text: "Ensuring product listings stay live, updated, and competitive." },
                { icon: <FiBarChart2 />, color: "bg-purple-500", label: "Market Communication", text: "Relaying demand trends and feedback to your supplier portfolio." },
                { icon: <FiSettings />, color: "bg-cyan-500", label: "Supplier Activation", text: "Encouraging suppliers to list new products and participate in enquiries." },
              ].map((item, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-background border border-default-200/50 hover:shadow-2xl transition-all h-full">
                  <div className={`w-12 h-12 ${item.color}/10 ${item.color.replace('bg-', 'text-')} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-lg mb-3">{item.label}</h4>
                  <p className="text-sm text-default-500 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SUCCESS FORMULA ── */}
        <div className="py-32 relative overflow-hidden bg-[#0A0A0A] text-white">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Success Formula</h2>
                <p className="text-default-400 max-w-md">Focused execution leads to portfolio scalability and higher revenue share.</p>
              </div>
              <div className="hidden md:flex items-center gap-10 text-[100px] font-black text-white/[0.03] pointer-events-none select-none">
                FORMULA
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { i: "01", title: "Relationship Building", desc: "Develop strong and trusted connections with your supplier associates." },
                { i: "02", title: "Supplier Activation", desc: "Ensure your portfolio products remain active and market-competitive." },
                { i: "03", title: "Market Awareness", desc: "Keep suppliers aligned with real demand and pricing trends." }
              ].map((step, idx) => (
                <div key={idx} className="relative group">
                  <span className="text-8xl font-black text-white/[0.05] absolute -top-10 left-0 transition-colors group-hover:text-orange-500/20">{step.i}</span>
                  <div className="relative pt-12">
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-default-400 text-lg leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FINAL CTA ── */}
        <div className="py-32 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-10 max-w-3xl"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500 font-bold uppercase tracking-widest text-xs">
              Take the Lead
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
              Ready to orchestrate your <span className="italic">Portfolio?</span>
            </h2>
            <p className="text-xl text-default-500 leading-relaxed">
              Join OBAOL Supreme as an Operator today and start building your trading asset portfolio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/auth/operator/register"
                className="px-12 py-6 rounded-[2rem] bg-orange-600 text-white font-black text-xl shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] hover:bg-orange-700 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-4 group"
              >
                Start Registration
                <FiArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
