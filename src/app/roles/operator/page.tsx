"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardBody, Button } from "@nextui-org/react";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiZap,
  FiTarget,
  FiLayers,
  FiMap,
  FiAnchor,
  FiCpu,
  FiPieChart,
  FiSearch,
  FiUserCheck,
  FiBookOpen,
  FiClock,
  FiStar,
  FiGlobe,
  FiAward
} from "react-icons/fi";
import { buildWebPageJsonLd } from "@/utils/seo";

const webPageJsonLd = buildWebPageJsonLd({
  title: "Operator Role | OBAOL Supreme",
  description:
    "Define the Digital Agro Trader (Operator) role as a system-first execution role without inventory ownership, focused on coordination and completion.",
  path: "/roles/operator",
});

export default function OperatorRolePage() {
  const router = useRouter();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const workflowSteps = [
    { title: "Identify", desc: "Spot high-intent opportunities in the global agro market.", icon: <FiSearch /> },
    { title: "Verify", desc: "Use OBAOL's system to check counterparty and stock reality.", icon: <FiUserCheck /> },
    { title: "Coordinate", desc: "Manage the layers of logistics, packaging, and audit.", icon: <FiAnchor /> },
    { title: "Complete", desc: "Stay involved until the final settlement is confirmed.", icon: <FiTarget /> }
  ];

  return (
    <section className="min-h-screen bg-background selection:bg-orange-500/30 text-foreground overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />

      <ThemedContentWrapper className="public-reading-page">
        {/* --- HERO SECTION --- */}
        <div className="relative pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden">
          {/* Background Ambient Effects */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none public-decoration" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none public-decoration" />

          <div className="container mx-auto max-w-6xl px-4 md:px-6 relative z-10 public-layout-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <Link
                href="/roles"
                className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-orange-500 transition-colors group px-4 py-2 rounded-full border border-default-200/50 bg-content1/50 backdrop-blur-md mb-8"
              >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                Back to Roles
              </Link>

              <div className="flex flex-col gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-content2/50 border border-default-200/50 text-orange-500 w-fit font-black uppercase tracking-[0.25em] text-[10px] shadow-sm"
                >
                  <FiStar className="fill-orange-500 text-orange-500 animate-pulse" size={12} />
                  Premium Execution Identity
                </motion.div>

                <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tight leading-[0.98]">
                  The New Standard of <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 italic">
                    Trade Operation.
                  </span>
                </h1>

                <p className="text-lg md:text-2xl text-foreground/70 max-w-4xl leading-relaxed font-medium">
                  We don&apos;t need more brokers. We need <span className="text-foreground font-bold">Execution Specialists</span>.
                  Operate in global trades from <span className="text-foreground underline decoration-orange-500/30 font-semibold">anywhere in the world</span> with <span className="text-orange-500 uppercase italic font-black">Zero Capital</span>.
                </p>
              </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-16 md:mt-20">
              {[
                { icon: <FiZap size={24} />, title: "Asset-Light", desc: "No capital required. Enter the multi-billion dollar agro market with zero inventory." },
                { icon: <FiTarget size={24} />, title: "Result Driven", desc: "Earnings are generated by completion, not effort or negotiation." },
                { icon: <FiLayers size={24} />, title: "System Backed", desc: "Leverage OBAOL's verification and audit trail for every trade." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Card className="h-full bg-content1/50 backdrop-blur-xl border border-default-200/50 hover:border-orange-500/30 transition-all shadow-xl rounded-[2.5rem] public-surface-card group">
                    <CardBody className="p-8 md:p-10 flex flex-col justify-between">
                      <div>
                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-8 font-bold group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-sm">
                          {item.icon}
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">{item.title}</h3>
                        <p className="text-foreground/60 leading-relaxed font-medium text-base">
                          {item.desc}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* --- GLOBAL ACCESS SECTION --- */}
        <div className="py-12 md:py-20 relative overflow-hidden bg-content2/30 border-y border-default-200/50">
          <div className="container mx-auto max-w-6xl px-4 md:px-6 text-center public-layout-container">
            <motion.div {...fadeIn} className="space-y-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-sm">
                <FiGlobe size={32} />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
                Operate From <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 italic">Anywhere</span> in the World.
              </h2>
              <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed font-medium">
                The OBAOL ecosystem is location-independent. Whether you are in Dubai, Mumbai, Lagos, or London, you can orchestrate global agro-trades through our structured execution layer.
              </p>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-8">
                {[
                  "No Geographical Boundaries",
                  "Global Settlement Sync",
                  "Remote Execution Tools",
                  "Cross-Border Compliance"
                ].map((point, i) => (
                  <div key={i} className="px-5 py-2.5 rounded-2xl bg-content1/80 border border-default-200/60 text-foreground font-bold text-xs shadow-sm hover:border-orange-500/40 transition-all cursor-default hover:-translate-y-0.5 public-surface-card">
                    {point}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- IDENTITY & HERITAGE SECTION --- */}
        <div className="py-16 md:py-24 relative overflow-hidden">
          <div className="container mx-auto max-w-6xl px-4 md:px-6 public-layout-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">
              <motion.div {...fadeIn} className="space-y-10">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Identity & Role</span>
                  <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
                    Who Is An <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 italic">Operator?</span>
                  </h2>
                  <p className="text-lg md:text-xl text-foreground/70 leading-relaxed font-medium">
                    This is a role for professionals who understand that trade is 10% discussion and 90% coordination.
                  </p>
                </div>

                {/* Legacy/Expertise Note */}
                <Card className="bg-content1/50 backdrop-blur-xl border border-default-200/50 rounded-[2rem] public-surface-card shadow-lg">
                  <CardBody className="p-8">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full pointer-events-none public-decoration" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                      <FiAward size={16} /> Professional Heritage
                    </h3>
                    <p className="text-foreground/90 font-semibold leading-relaxed mb-3">
                      Specifically designed for <span className="text-foreground font-bold underline decoration-orange-500/40">Retired Custom Brokers</span>, <span className="text-foreground font-bold underline decoration-orange-500/40">Logistics Pros</span>, and <span className="text-foreground font-bold underline decoration-orange-500/40">Industry Veterans</span>.
                    </p>
                    <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                      Your years of experience in cross-border trade, compliance, and documentation are the most valuable assets in the OBAOL ecosystem.
                    </p>
                  </CardBody>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Opportunity Identifiers",
                    "Relationship Architects",
                    "Coordination Experts",
                    "Completion Specialists"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 text-foreground/80 font-bold group p-3 rounded-xl bg-content2/30 border border-default-200/40">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shrink-0">
                        <FiCheckCircle size={16} />
                      </div>
                      <span className="text-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Visual Interactive Element */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="bg-content1/60 backdrop-blur-xl border border-default-200/50 shadow-2xl rounded-[3rem] p-4 md:p-8 public-surface-card overflow-hidden">
                  <CardBody className="p-6 md:p-8 space-y-8 relative z-10">
                    <div className="text-center space-y-2">
                      <span className="text-[10px] font-black tracking-[0.4em] uppercase text-foreground/40">The Operator Pulse</span>
                      <div className="h-1 w-16 bg-orange-500/40 mx-auto rounded-full" />
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-5 p-5 rounded-2xl bg-content2/40 border border-danger-500/20 group opacity-75 hover:opacity-100 transition-all">
                        <FiXCircle className="text-danger-500 text-3xl shrink-0" />
                        <div>
                          <div className="font-bold text-foreground/50 line-through">Passive Lead Forwarding</div>
                          <div className="text-[10px] text-danger-500 font-black uppercase tracking-widest mt-1">Inefficient Legacy Approach</div>
                        </div>
                      </div>

                      <div className="w-full flex justify-center py-2">
                        <motion.div
                          animate={{ y: [0, 8, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-px h-10 bg-gradient-to-b from-orange-500/60 to-transparent"
                        />
                      </div>

                      <div className="flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xl border border-orange-400 group relative">
                        <FiZap className="text-white text-3xl shrink-0 animate-pulse" />
                        <div>
                          <div className="font-black text-white text-lg tracking-tight">Active Execution</div>
                          <div className="text-[10px] text-white/80 uppercase font-black tracking-[0.2em] mt-1">The OBAOL System Standard</div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* --- PERFORMANCE ROADMAP --- */}
        <div className="py-16 md:py-24 container mx-auto max-w-6xl px-4 md:px-6 public-layout-container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div className="max-w-2xl space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Structured Process</span>
              <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Execution</span> Roadmap.</h2>
              <p className="text-base md:text-lg text-foreground/60 font-medium leading-relaxed">How a single trade moves from identification to confirmed settlement within our system.</p>
            </div>
            <div className="px-4 py-1.5 rounded-full border border-default-200/50 bg-content2/50 text-orange-500 font-black uppercase tracking-widest text-[10px] shadow-sm">
              4 Key Milestones
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-content1/50 backdrop-blur-xl border border-default-200/50 hover:border-orange-500/30 transition-all shadow-lg rounded-[2rem] public-surface-card">
                  <CardBody className="p-6 md:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-xl font-bold">
                        {step.icon}
                      </div>
                      <span className="text-2xl font-black text-foreground/20">0{i + 1}</span>
                    </div>
                    <h4 className="text-xl font-black text-foreground tracking-tight">{step.title}</h4>
                    <p className="text-sm text-foreground/60 leading-relaxed font-medium">{step.desc}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- PERFORMANCE-BASED EARNINGS --- */}
        <div className="py-16 md:py-24 container mx-auto max-w-6xl px-4 md:px-6 public-layout-container">
          <Card className="bg-content1/60 backdrop-blur-xl border border-default-200/50 shadow-2xl rounded-[3rem] p-6 md:p-12 public-surface-card">
            <CardBody className="p-0">
              <div className="text-center mb-12 md:mb-16 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Commission Governance</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">Controlled Clarity.</h2>
                <p className="text-base md:text-lg text-foreground/60 max-w-2xl mx-auto font-medium leading-relaxed italic">
                  Earnings are generated exclusively from completion. No completion, no commission.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 md:p-8 rounded-[2rem] bg-content2/30 border border-default-200/50 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-foreground mb-6 pb-4 border-b border-default-200/50 flex items-center gap-3">
                      <FiPieChart className="text-orange-500" /> Revenue Source
                    </h3>
                    <div className="space-y-6">
                      {[
                        { label: "Deal Execution", sub: "Closing the final trade", val: "Major Pool Share" },
                        { label: "Supplier Ownership", sub: "Managing verified sources", val: "Recurring Flow" },
                        { label: "Handling", sub: "Managing successful orders & enquiries", val: "Rating Based" },
                        { label: "Leadership", sub: "Mentoring & growing operators", val: "Tiered Share" }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-foreground text-base mb-0.5">{item.label}</div>
                            <div className="text-xs text-foreground/50 font-medium">{item.sub}</div>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 font-black text-[10px] uppercase tracking-wider">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 rounded-[2rem] bg-danger-500/[0.03] border border-danger-500/20 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-foreground mb-6 pb-4 border-b border-danger-500/20 flex items-center gap-3">
                      <FiXCircle className="text-danger-500" /> Non-Earning
                    </h3>
                    <div className="space-y-4">
                      {["Initial Enquiries", "Long Negotiations", "Partial Progress", "Static Lead Sharing"].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-foreground/40 line-through font-bold text-base">
                          <div className="w-2 h-2 rounded-full bg-danger-500/40" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8 p-5 rounded-2xl bg-danger-500/5 text-danger-500 font-bold text-xs italic leading-relaxed border border-danger-500/10">
                    &quot;Efficiency is rewarded. Effort is expected. Completion is what creates value.&quot;
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center">
                <Button
                  as={Link}
                  href="/commission-structure"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-orange-600/20 transition-all text-sm"
                  endContent={<FiArrowRight size={16} />}
                >
                  View Detailed Commission Structure
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* --- PATHWAYS --- */}
        <div className="py-16 md:py-24 container mx-auto max-w-6xl px-4 md:px-6 public-layout-container">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Operating Models</span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Two Pathways. One Goal.</h2>
            <p className="text-base md:text-lg text-foreground/60 font-medium">Choose how you want to integrate into the OBAOL ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Independent Card */}
            <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3 }}>
              <Card className="h-full bg-content1/50 backdrop-blur-xl border border-default-200/50 hover:border-orange-500/30 transition-all shadow-xl rounded-[2.5rem] public-surface-card">
                <CardBody className="p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-8 font-bold shadow-sm">
                      <FiBriefcase size={28} />
                    </div>
                    <div className="space-y-3 mb-6">
                      <h3 className="text-3xl font-black text-foreground leading-tight">Independent <br /> Operator</h3>
                      <p className="text-foreground/60 leading-relaxed font-semibold text-sm">For self-starters and existing network owners.</p>
                    </div>

                    <div className="space-y-3 mb-8">
                      {[
                        "Maintain your own relationship network",
                        "Self-driven trade coordination",
                        "Use OBAOL for verification & audit",
                        "Manage your own completion timeline"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-semibold text-foreground/80">
                          <FiCheckCircle className="text-orange-500 shrink-0" size={16} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-default-200/50 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Category</span>
                    <span className="text-foreground font-bold text-xs italic">Industry Veteran / Experienced</span>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Team-Based Card */}
            <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3 }}>
              <Card className="h-full bg-gradient-to-br from-orange-600 to-amber-700 text-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-orange-400/40">
                <CardBody className="p-8 md:p-10 flex flex-col justify-between relative z-10">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-8 font-bold shadow-md">
                      <FiUsers size={28} />
                    </div>
                    <div className="space-y-3 mb-6">
                      <h3 className="text-3xl font-black text-white leading-tight">Team-Based <br /> Operator</h3>
                      <p className="text-white/80 leading-relaxed font-semibold text-sm">For those building their legacy within a team structure.</p>
                    </div>

                    <div className="space-y-3 mb-8">
                      {[
                        "Operate within internal workflow layers",
                        "Collaborative execution with senior pros",
                        "Direct capability building roadmap",
                        "Focus on specific trade segments"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-semibold text-white">
                          <FiCheckCircle className="text-white shrink-0" size={16} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/20 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Category</span>
                    <span className="text-white font-bold text-xs italic">Builder / Capability Focused</span>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* --- THE EXECUTION TOOLKIT --- */}
        <div className="py-16 md:py-24 bg-content2/30 border-y border-default-200/50">
          <div className="container mx-auto max-w-6xl px-4 md:px-6 text-center public-layout-container">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 block mb-3">Platform Capabilities</span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-12">Tools of The Operator.</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: <FiCpu size={24} />, label: "Verification Engine" },
                { icon: <FiPieChart size={24} />, label: "Completion Tracking" },
                { icon: <FiClock size={24} />, label: "Audit Timeline" },
                { icon: <FiMap size={24} />, label: "Trade Topology" },
                { icon: <FiBookOpen size={24} />, label: "Legacy Knowledge" },
                { icon: <FiUsers size={24} />, label: "Counterparty Radar" },
                { icon: <FiShield size={24} />, label: "Compliance Filter" },
                { icon: <FiAnchor size={24} />, label: "Logistics Node" }
              ].map((tool, i) => (
                <motion.div key={i} whileHover={{ y: -4 }}>
                  <Card className="bg-content1/50 backdrop-blur-xl border border-default-200/50 hover:border-orange-500/30 transition-all shadow-sm rounded-2xl public-surface-card">
                    <CardBody className="p-6 flex flex-col items-center gap-3 text-center">
                      <div className="text-orange-500">{tool.icon}</div>
                      <span className="text-xs font-bold text-foreground/80 tracking-tight">{tool.label}</span>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* --- FINAL CTA --- */}
        <div className="py-20 md:py-28 container mx-auto max-w-5xl px-4 md:px-6 text-center public-layout-container">
          <Card className="bg-content1/60 backdrop-blur-xl border-2 border-orange-500/20 shadow-2xl rounded-[3rem] p-8 md:p-16 public-surface-card overflow-hidden">
            <CardBody className="p-0 relative z-10 space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Get Started</span>
                <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
                  Ready to Step Into <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 italic">Your Role?</span>
                </h2>
                <p className="text-base md:text-xl text-foreground/60 max-w-2xl mx-auto font-medium leading-relaxed italic">
                  Operator is not a position we assign. It is a role you define by the trades you complete within the system.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button
                  as={Link}
                  href="/auth/operator/register"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-orange-600/20 transition-all text-sm"
                  endContent={<FiArrowRight size={18} />}
                >
                  Start Operator Entry
                </Button>
                
                <Button
                  as={Link}
                  href="/commission-structure"
                  variant="bordered"
                  className="border-default-200 hover:border-orange-500/40 text-foreground font-bold h-12 px-8 rounded-xl transition-all text-sm"
                  endContent={<FiArrowRight size={16} className="text-orange-500" />}
                >
                  Commission Structure
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
