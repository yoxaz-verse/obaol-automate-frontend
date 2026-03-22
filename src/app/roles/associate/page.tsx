"use client";

import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiBriefcase,
  FiTruck,
  FiHome,
  FiArchive,
  FiGlobe,
  FiShield,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowRight,
  FiLayers,
  FiTarget,
  FiActivity
} from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { buildWebPageJsonLd } from "@/utils/seo";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";

const webPageJsonLd = buildWebPageJsonLd({
  title: "Associate Role | OBAOL Supreme",
  description:
    "Learn who can become an Associate on OBAOL Supreme, including traders, warehouses, logistics, procurement, and packaging companies.",
  path: "/roles/associate",
});

export default function AssociateRolePage() {
  return (
    <section className="min-h-screen bg-background selection:bg-orange-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />
      <ThemedContentWrapper>
        {/* ── HERO SECTION ── */}
        <div className="relative min-h-[80vh] flex items-center pt-32 pb-20 overflow-hidden">
          {/* Parallax Background */}
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <Image
              src="/images/roles/associate/hero_bg.png"
              alt="Global Logistics Background"
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
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-600/30 flex items-center justify-center text-orange-500 shadow-inner">
                    <FiBriefcase size={24} />
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 text-orange-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center">
                    Primary Execution Force
                  </div>
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 font-bold uppercase tracking-[0.1em] text-[10px] flex items-center">
                    Company Registration Mandatory
                  </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tighter leading-[1.05] overflow-visible">
                  The <span className="inline-block px-1 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent italic">Associate</span> <br />
                  Business Network
                </h1>
                <p className="mt-8 text-xl md:text-2xl text-default-400 leading-relaxed max-w-3xl">
                  Fuel global trades with your specialized infrastructure.
                  Associates are the bedrock of OBAOL Supreme—the entities that move, store, and trade the world&apos;s commodities.
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
                  href="/auth/register"
                  className="px-8 py-4 rounded-2xl bg-orange-600 text-white font-bold text-lg shadow-[0_0_30px_-5px_rgba(234,88,12,0.5)] hover:bg-orange-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group"
                >
                  Join as Associate
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-2xl border border-default-200 bg-default-100/50 backdrop-blur-md text-foreground font-bold text-lg hover:bg-default-200/80 transition-all"
                >
                  See Opportunities
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── CORE CATEGORIES ── */}
        <div id="categories" className="py-24 border-y border-default-100/50 bg-content1/30">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Who Can Be an Associate?</h2>
              <p className="text-default-500 max-w-2xl mx-auto">Scalable infrastructure meeting global execution standards.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <FiGlobe />,
                  title: "Traders & Importers",
                  desc: "Entities executing primary trade contracts. Buy and sell with platform-enforced compliance."
                },
                {
                  icon: <FiHome />,
                  title: "Warehouse Owners",
                  desc: "Stakeholders managing storage assets. Integrate your inventory into the digital grid."
                },
                {
                  icon: <FiTruck />,
                  title: "Logistics Providers",
                  desc: "Freight and transportation firms. Execute the movement of commodities across borders."
                },
                {
                  icon: <FiArchive />,
                  title: "Suppliers & Packagers",
                  desc: "Agro-producers and packaging firms feeding the global supply chain."
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-background border border-default-200/50 shadow-lg hover:border-orange-500/30 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-default-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── THE VALUE ENGINE ── */}
        <div className="py-24 relative overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 space-y-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-widest">
                  Platform Advantage
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Unmatched Security & <br />
                  <span className="text-default-400">Global Execution.</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: "Risk Mitigation", desc: "Digital verification reduces trade non-performance risk." },
                    { title: "Verified Identity", desc: "Join an elite group of pre-vetted trade professionals." },
                    { title: "Direct Demand", desc: "Connect with OBAOL's global catalog of requirements." },
                    { title: "Market Clarity", desc: "Gain real-time insights into trade movement and pricing." }
                  ].map((feat, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2 text-orange-500">
                        <FiCheckCircle size={18} />
                        <h4 className="font-bold">{feat.title}</h4>
                      </div>
                      <p className="text-sm text-default-500 leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
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
                    src="/images/roles/associate/trade_map.png"
                    alt="Global Trade Execution Map"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-orange-600/20 blur-[60px] rounded-full pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ── MISSION GRID ── */}
        <div className="py-24 bg-foreground/[0.02] border-t border-default-100">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">How Associates Work</h2>
              <p className="text-default-500 max-w-2xl mx-auto">A structured path to global trade execution.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { i: "01", icon: <FiLayers />, label: "Onboarding", text: "Register your entity, provide documentation, and undergo pre-verification." },
                { i: "02", icon: <FiTarget />, label: "Activation", text: "Integrate your assets or catalogs into the platform's execution engine." },
                { i: "03", icon: <FiActivity />, label: "Execution", text: "Engage in live trades, enquiries, and fulfillment managed by OBAOL Operators." },
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -top-6 -left-6 text-7xl font-black text-foreground/[0.02] group-hover:text-orange-500/[0.05 transition-colors duration-500">{item.i}</div>
                  <div className="relative p-10 rounded-3xl bg-background border border-default-200/50 hover:border-orange-500/20 transition-all h-full shadow-sm">
                    <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center mb-6">
                      {item.icon}
                    </div>
                    <h4 className="font-bold text-xl mb-4">{item.label}</h4>
                    <p className="text-default-500 leading-relaxed">{item.text}</p>
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
              Secure Your Spot
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
              Bring your <span className="italic">Execution</span> to the global stage.
            </h2>
            <p className="text-xl text-default-500 leading-relaxed">
              Join the OBAOL Supreme network today and transform your local business into a global trade hub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/auth/register"
                className="px-12 py-6 rounded-[2rem] bg-orange-600 text-white font-black text-xl shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] hover:bg-orange-700 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-4 group"
              >
                Register Now
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
