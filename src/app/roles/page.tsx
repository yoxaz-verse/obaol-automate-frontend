"use client";

import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiUsers, FiBriefcase, FiArrowRight, FiShield, FiTrendingUp, FiGlobe } from "react-icons/fi";
import { buildWebPageJsonLd } from "@/utils/seo";

const webPageJsonLd = buildWebPageJsonLd({
  title: "Roles on OBAOL Supreme | Operator vs Associate",
  description:
    "Understand the difference between Operators and Associates on OBAOL Supreme. Choose the right role to join the trade execution platform.",
  path: "/roles",
});

export default function RolesPage() {
  return (
    <section className="min-h-screen bg-background selection:bg-orange-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />

      <ThemedContentWrapper>
        <div className="relative pt-32 pb-24 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full" />

          <div className="container mx-auto max-w-6xl px-4 relative z-10">
            {/* ── HERO SECTION ── */}
            <div className="text-center space-y-6 mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500 text-xs font-bold tracking-widest uppercase mb-4">
                  Platform Roles
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
                  Choose Your <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent italic">Identity</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-default-500 max-w-2xl mx-auto leading-relaxed">
                  OBAOL Supreme is built on collaboration. Whether you&apos;re executing trades or orchestrating the platform, your role defines the future of logistics.
                </p>
              </motion.div>
            </div>

            {/* ── ROLES GRID ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
              {/* Associate Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
                <div className="relative h-full flex flex-col p-8 md:p-10 rounded-[2.5rem] bg-content1/50 backdrop-blur-md border border-default-200/50 hover:border-orange-500/30 transition-all duration-500 shadow-xl overflow-hidden group-hover:-translate-y-2">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                      <FiBriefcase size={28} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground tracking-tight">Associate</h2>
                      <p className="text-orange-500 text-sm font-semibold tracking-wide uppercase">Business Role</p>
                    </div>
                  </div>

                  <p className="text-default-600 mb-8 leading-relaxed">
                    Designed for established entities and trade partners. Associates represent the core workforce of the ecosystem, managing goods, services, and logistics.
                  </p>

                  <div className="mb-8 p-5 rounded-2xl bg-default-100/50 border border-default-200/50">
                    <p className="text-[10px] font-bold text-default-400 uppercase tracking-widest mb-3">Who can join?</p>
                    <div className="flex flex-wrap gap-2">
                      {["Traders", "Import/Exporters", "Suppliers", "Buyers", "Warehouse Managers", "Logistics", "Procurement", "Freight Forwarders", "Manufacturers", "Company Registration Mandatory"].map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-lg bg-background text-[11px] font-semibold text-foreground border border-default-200 shadow-sm transition-colors hover:border-orange-500/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-grow">
                    <p className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Role Focus</p>
                    {[
                      { icon: <FiGlobe />, text: "International Trade Access" },
                      { icon: <FiTrendingUp />, text: "Direct Market Execution" },
                      { icon: <FiShield />, text: "Enterprise-grade Compliance" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-default-600 bg-white/50 dark:bg-default-100/30 p-3 rounded-xl border border-default-200/20">
                        <span className="text-orange-500">{item.icon}</span>
                        <span className="text-sm font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 mt-auto">
                    <Link
                      href="/auth/register"
                      className="flex items-center justify-center w-full p-4 rounded-2xl bg-orange-600 text-white font-bold transition-all hover:bg-orange-700 shadow-lg shadow-orange-600/20 active:scale-[0.98]"
                    >
                      Register Associate
                    </Link>
                    <Link
                      href="/roles/associate"
                      className="flex items-center justify-between w-full p-4 rounded-2xl bg-foreground text-background font-bold transition-all hover:bg-orange-600 hover:text-white group/btn"
                    >
                      <span className="text-sm">Who can be an Associate?</span>
                      <FiArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Decorative background number */}
                  <span className="absolute -bottom-10 -right-6 text-[180px] font-black text-foreground/[0.03] select-none pointer-events-none">01</span>
                </div>
              </motion.div>

              {/* Operator Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
                <div className="relative h-full flex flex-col p-8 md:p-10 rounded-[2.5rem] bg-content1/50 backdrop-blur-md border border-default-200/50 hover:border-orange-500/30 transition-all duration-500 shadow-lg group-hover:shadow-xl overflow-hidden group-hover:-translate-y-2">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
                      <FiUsers size={28} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground tracking-tight">Operator</h2>
                      <p className="text-orange-600 text-sm font-semibold tracking-wide uppercase">Supplier Portfolio Ownership</p>
                    </div>
                  </div>

                  <p className="text-default-600 mb-8 leading-relaxed">
                    Digital agro traders who manage supplier relationships and build portfolios of 5-10+ companies to keep trade execution moving.
                  </p>

                  <div className="mb-8 p-5 rounded-2xl bg-default-100/50 border border-default-200/50">
                    <p className="text-[10px] font-bold text-default-400 uppercase tracking-widest mb-3">Who can join?</p>
                    <div className="flex flex-wrap gap-2">
                      {["Individuals", "Portfolio Managers", "Digital Traders", "Business Developers", "Retired Custom Brokers", "Retired Professionals"].map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-lg bg-background text-[11px] font-semibold text-foreground border border-default-200 shadow-sm transition-colors hover:border-orange-500/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>


                  <div className="space-y-4 mb-10 flex-grow">
                    <p className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Role Focus</p>
                    {[
                      { icon: <FiShield />, text: "Workflow Governance" },
                      { icon: <FiUsers />, text: "Supplier Ownership" },
                      { icon: <FiTrendingUp />, text: "System Performance Tools" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-default-600 bg-white/50 dark:bg-default-100/30 p-3 rounded-xl border border-default-200/20">
                        <span className="text-orange-600">{item.icon}</span>
                        <span className="text-sm font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>


                  <div className="flex flex-col gap-3 mt-auto">
                    <Link
                      href="https://forms.obaol.com/operator"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full p-4 rounded-2xl bg-orange-600 text-white font-bold transition-all hover:bg-orange-700 shadow-lg shadow-orange-600/20 active:scale-[0.98]"
                    >
                      Join as Operator
                    </Link>
                    <Link
                      href="/roles/operator"
                      className="flex items-center justify-between w-full p-4 rounded-2xl bg-foreground text-background font-bold transition-all hover:bg-orange-600 hover:text-white group/btn"
                    >
                      <span className="text-sm">Who can be an Operator?</span>
                      <FiArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Decorative background number */}
                  <span className="absolute -bottom-10 -right-6 text-[180px] font-black text-foreground/[0.03] select-none pointer-events-none">02</span>
                </div>
              </motion.div>
            </div>

            <div className="mt-16 rounded-[2.5rem] border border-default-200/50 bg-content1/60 p-8 md:p-10 shadow-xl">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                India-first roles with global execution expansion
              </h2>
              <p className="mt-3 text-default-600 max-w-3xl">
                We begin with India-based procurement, warehousing, and logistics roles, while expanding
                across global commodity corridors in the GCC, Europe, and North America.
              </p>
            </div>
          </div>
        </div>
      </ThemedContentWrapper>

      <Footer />
    </section>
  );
}
