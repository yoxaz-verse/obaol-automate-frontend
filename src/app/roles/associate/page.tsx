"use client";

import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";
import { buildWebPageJsonLd } from "@/utils/seo";
import {
  associateRoleDefinitions,
  getAssociateRolePath,
  type AssociateRoleIconKey,
} from "@/data/associateRoles";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArchive,
  FiBriefcase,
  FiCheckCircle,
  FiCpu,
  FiDollarSign,
  FiGlobe,
  FiGrid,
  FiHome,
  FiLayers,
  FiPackage,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiTarget,
  FiTruck,
} from "react-icons/fi";

const webPageJsonLd = buildWebPageJsonLd({
  title: "Associate Role Directory | OBAOL Supreme",
  description:
    "Explore every Associate category on OBAOL Supreme, including traders, importers, exporters, warehouse owners, logistics, labs, agritech, and more.",
  path: "/roles/associate",
});

const iconByRoleKey: Record<AssociateRoleIconKey, JSX.Element> = {
  trader: <FiBriefcase />,
  importer: <FiShoppingBag />,
  exporter: <FiGlobe />,
  warehouse: <FiHome />,
  inlandTransport: <FiTruck />,
  freightForwarder: <FiTarget />,
  logistics: <FiLayers />,
  supplier: <FiArchive />,
  packaging: <FiPackage />,
  qualityLab: <FiSearch />,
  agritech: <FiCpu />,
  customs: <FiShield />,
  finance: <FiDollarSign />,
  procurement: <FiGrid />,
};

export default function AssociateRolePage() {
  return (
    <section className="min-h-screen bg-background selection:bg-orange-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />
      <ThemedContentWrapper>
        <div className="relative min-h-[80vh] flex items-center pt-32 pb-20 overflow-hidden">
          <motion.div
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <Image
              src="/images/roles/associate/hero_bg.png"
              alt="Associate ecosystem background"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-[1]" />

          <div className="container mx-auto max-w-7xl px-4 relative z-10">
            <Link
              href="/roles"
              className="inline-flex items-center gap-2 text-sm font-bold text-orange-500/70 hover:text-orange-500 transition-all group px-4 py-2 rounded-full border border-orange-500/10 bg-orange-500/5 backdrop-blur-sm"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to Roles
            </Link>

            <div className="max-w-5xl space-y-8 mt-8">
              <div>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-600/30 flex items-center justify-center text-orange-500 shadow-inner">
                    <FiBriefcase size={24} />
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 text-orange-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center">
                    One-Stop Associate Ecosystem
                  </div>
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 font-bold uppercase tracking-[0.1em] text-[10px] flex items-center">
                    Company Registration Mandatory
                  </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tighter leading-[1.05]">
                  Who Can Be an{" "}
                  <span className="inline-block px-1 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent italic">
                    Associate?
                  </span>
                </h1>
                <p className="mt-8 text-xl md:text-2xl text-default-400 leading-relaxed max-w-4xl">
                  OBAOL Supreme is building a full trade-execution ecosystem. Beyond traders and warehouses, our network includes importers, exporters, inland transportation, freight forwarders, quality testing labs, agritech companies, and other execution-critical partners.
                </p>
                <div className="mt-6 max-w-4xl">
                  <IndiaFirstNote />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/auth"
                  className="px-8 py-4 rounded-2xl bg-orange-600 text-white font-bold text-lg shadow-[0_0_30px_-5px_rgba(234,88,12,0.5)] hover:bg-orange-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group"
                >
                  Join as Associate
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-8 py-4 rounded-2xl border border-default-200 bg-default-100/50 backdrop-blur-md text-foreground font-bold text-lg hover:bg-default-200/80 transition-all"
                >
                  Browse Role Directory
                </button>
              </div>
            </div>
          </div>
        </div>

        <div id="directory" className="py-24 border-y border-default-100/50 bg-content1/30">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Associate Role Directory</h2>
              <p className="text-default-500 max-w-3xl mx-auto">
                Dedicated SEO-friendly role pages for every category in the trade workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
              {associateRoleDefinitions.map((role, index) => (
                <motion.div
                  key={role.slug}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={getAssociateRolePath(role.slug)}
                    className="group block h-full p-7 rounded-[2rem] bg-background border border-default-200/60 hover:border-orange-500/40 shadow-lg transition-all hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-5 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      {iconByRoleKey[role.iconKey]}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{role.displayName}</h3>
                    <p className="text-default-500 text-sm leading-relaxed">{role.shortDescription}</p>
                    <div className="mt-6 text-orange-500 text-xs font-extrabold tracking-wider uppercase flex items-center gap-2">
                      View dedicated page
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-24 bg-foreground/[0.02] border-t border-default-100">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">How Associates Work on OBAOL</h2>
              <p className="text-default-500 max-w-2xl mx-auto">
                Structured onboarding, clear execution responsibilities, and role-based collaboration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { i: "01", icon: <FiLayers />, label: "Onboarding", text: "Register your company and get aligned to the right associate role in the ecosystem." },
                { i: "02", icon: <FiTarget />, label: "Activation", text: "Connect your service layer, inventory, or trade capability to active execution workflows." },
                { i: "03", icon: <FiCheckCircle />, label: "Execution", text: "Collaborate with other associates through role-specific subpages and shared execution visibility." },
              ].map((item) => (
                <div key={item.i} className="relative p-8 rounded-3xl bg-background border border-default-200/50 hover:border-orange-500/20 transition-all">
                  <div className="absolute right-6 top-5 text-5xl font-black text-foreground/[0.03]">{item.i}</div>
                  <div className="w-11 h-11 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center mb-5">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-xl mb-3">{item.label}</h4>
                  <p className="text-default-500 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-28 flex flex-col items-center justify-center text-center px-4">
          <div className="space-y-8 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500 font-bold uppercase tracking-widest text-xs">
              Expand With The Ecosystem
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
              Build your role in global commodity execution.
            </h2>
            <p className="text-xl text-default-500 leading-relaxed">
              Choose your associate category, explore the dedicated subpage, and onboard into a one-stop trade execution network.
            </p>
            <div className="pt-4">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-4 px-12 py-5 rounded-[2rem] bg-orange-600 text-white font-black text-xl shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] hover:bg-orange-700 hover:scale-[1.04] active:scale-[0.98] transition-all"
              >
                Register as Associate
                <FiArrowRight size={22} />
              </Link>
            </div>
          </div>
        </div>
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
