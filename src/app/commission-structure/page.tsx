"use client";

import React from "react";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiBriefcase,
  FiTrendingUp,
  FiDollarSign,
  FiPackage,
  FiUserCheck,
  FiLayers,
  FiZap,
  FiInfo,
  FiArrowRight,
  FiPieChart,
  FiGlobe,
} from "react-icons/fi";
import { Card, CardBody, Divider, Button, Tooltip } from "@heroui/react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function CommissionStructurePage() {
  const [profit, setProfit] = React.useState(100000);

  const calculateShares = (netProfit: number) => {
    const totalPool = netProfit * 0.30;
    return {
      totalPool,
      closer: totalPool * 0.40,
      owner: totalPool * 0.30,
      l1: totalPool * 0.12,
      l2: totalPool * 0.08,
      l3plus: totalPool * 0.10
    };
  };

  const shares = calculateShares(profit);

  return (
    <section className="min-h-screen bg-background text-foreground selection:bg-warning-500/30">
      <Header />
      <ThemedContentWrapper>
        <div className="mx-auto max-w-6xl px-4 pt-32 pb-24">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning-500/10 border border-warning-500/20 text-warning-600 text-xs font-bold uppercase tracking-widest mb-4">
              <FiPieChart className="text-sm" /> Rewards & Incentives
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
              Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning-400 to-amber-600">Commission</span> Framework
            </h1>
            <p className="text-lg text-default-500 font-medium leading-relaxed">
              OBAOL empowers contributors with a clear profit-sharing model designed to reward activation, execution, and leadership.
            </p>
          </motion.div>

          {/* Core Logic Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
          >
            <Card className="bg-content1/50 backdrop-blur-md border-default-200/60 shadow-xl overflow-hidden group">
              <CardBody className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-warning-500/10 flex items-center justify-center text-warning-600 shadow-inner group-hover:scale-110 transition-transform">
                    <FiTrendingUp className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-default-400">Section 01</h3>
                    <h2 className="text-xl font-black">Commission Pool</h2>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-default-500 leading-relaxed font-medium">
                    Every completed trade generates a commission pool from the company’s net profit. This pool is split between Closing and Management.
                  </p>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-warning-500 to-amber-600 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 flex items-end gap-2">
                      <span className="text-5xl font-black tracking-tighter">30%</span>
                      <span className="text-sm font-bold uppercase opacity-80 mb-2 tracking-widest">Of Net Profit</span>
                    </div>
                    <FiDollarSign className="absolute -bottom-4 -right-4 text-8xl opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-700" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-warning-600 bg-warning-500/5 p-3 rounded-xl border border-warning-500/10 mt-4">
                    <FiInfo className="text-xs" />
                    Calculated only after trade execution is finalized.
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-md border-default-200/60 shadow-xl overflow-hidden group">
              <CardBody className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-600 shadow-inner group-hover:scale-110 transition-transform">
                    <FiZap className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-default-400">Section 02</h3>
                    <h2 className="text-xl font-black">Release Conditions</h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1 space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-success-600 flex items-center gap-1.5 mb-2">
                      <div className="w-1 h-3 bg-success-500 rounded-full" /> Triggers
                    </div>
                    {[
                      { text: "Product Loaded/Dispatched", icon: FiPackage },
                      { text: "Payment Verified", icon: FiUserCheck },
                      { text: "Trade Profit Finalized", icon: FiDollarSign }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-success-500/5 border border-success-500/10 text-[11px] font-bold text-success-700">
                        <item.icon className="mt-0.5 shrink-0" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="col-span-2 sm:col-span-1 space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-danger-600 flex items-center gap-1.5 mb-2">
                      <div className="w-1 h-3 bg-danger-500 rounded-full" /> No Payouts
                    </div>
                    {[
                      "Purchase Orders (PO)",
                      "Open Inquiries",
                      "Negotiation Stages",
                      "Partial Transactions"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-danger-500/5 border border-danger-500/10 text-[11px] font-bold text-danger-700">
                        <FiXCircle className="shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Distribution Visualization */}
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4 px-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-default-400 mb-1">Section 03</h3>
                <h2 className="text-3xl font-black">Two Major Pillars</h2>
                <p className="text-default-500 max-w-lg mt-2 font-medium">The commission pool is divided between those who close the deal and those who manage the supplier network.</p>
              </div>
              <div className="flex items-center gap-2 bg-content1 p-2 rounded-2xl border border-default-200">
                <div className="px-4 py-2 bg-warning-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-warning-500/20"><strong>Total 100%</strong></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-content1/50 border-default-200/60 shadow-lg overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform pointer-events-none">
                  <FiUserCheck className="text-8xl" />
                </div>
                <CardBody className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-warning-500/10 text-warning-600">
                      <FiUserCheck className="text-xl" />
                    </div>
                    <div className="text-3xl font-black tracking-tighter text-foreground">40%</div>
                  </div>
                  <h3 className="text-lg font-black mb-3 text-warning-600">Deal Closer</h3>
                  <p className="text-xs text-default-500 leading-relaxed font-medium mb-4">The closer who converts an inquiry into a successfully finalized trade.</p>
                  <Divider className="my-4 opacity-50" />
                  <p className="text-[10px] font-bold text-default-400 uppercase leading-normal tracking-wide italic">
                    Direct reward for execution and negotiation.
                  </p>
                </CardBody>
              </Card>

              <Card className="bg-content1/50 border-default-200/60 shadow-lg overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform pointer-events-none">
                  <FiBriefcase className="text-8xl" />
                </div>
                <CardBody className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-500/10 text-primary-600">
                      <FiBriefcase className="text-xl" />
                    </div>
                    <div className="text-3xl font-black tracking-tighter text-foreground">60%</div>
                  </div>
                  <h3 className="text-lg font-black mb-3 text-primary-600">Supplier Portfolio Management</h3>
                  <p className="text-xs text-default-500 leading-relaxed font-medium mb-4">A shared pool for the supplier owner and their leadership hierarchy.</p>
                  <Divider className="my-4 opacity-50" />
                  <p className="text-[10px] font-bold text-default-400 uppercase leading-normal tracking-wide italic">
                    Split between Owner (30%) and Mentors (12% + 8% + 10%).
                  </p>
                </CardBody>
              </Card>
            </div>
          </motion.section>

          {/* Leadership Tier Breakdown Under Portfolio Layer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="mb-10 text-center max-w-2xl mx-auto px-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-default-400 mb-2">Section 04</h3>
              <h2 className="text-3xl font-black mb-4">The <span className="text-secondary-500">Portfolio Management</span> Split</h2>
              <p className="text-default-500 font-medium text-sm leading-relaxed">
                Leaders earn by supporting the Supplier Portfolio Owner.
                The hierarchy rewards those who manage and mentor the contributors responsible for supplier assets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {[
                {
                  tier: "Owner",
                  label: "Asset Manager",
                  share: "30%",
                  icon: FiBriefcase,
                  role: "The active Operator who manages the specific supplier involved in the trade.",
                  color: "primary",
                  rule: "Fixed Share"
                },
                {
                  tier: "L1",
                  label: "Direct Mentor",
                  share: "12%",
                  icon: FiUserCheck,
                  role: "The primary guide for the Portfolio Owner, responsible for their daily support.",
                  color: "secondary",
                  rule: "Fixed Share"
                },
                {
                  tier: "L2",
                  label: "Team Leader",
                  share: "8%",
                  icon: FiBriefcase,
                  role: "Oversees the L1 mentor and ensures strategic portfolio growth.",
                  color: "secondary",
                  rule: "Fixed Share"
                },
                {
                  tier: "L3+",
                  label: "Executive Circle",
                  share: "10%",
                  icon: FiGlobe,
                  role: "Senior leadership responsible for platform-wide supplier ecosystem health.",
                  color: "secondary",
                  rule: "Dividend Model"
                }
              ].map((item, i) => (
                <div key={i} className="flex flex-col group">
                  <Card className={`bg-content1/50 backdrop-blur-md border-default-200/60 shadow-xl p-1 h-full transition-all group-hover:scale-[1.02] ${item.tier === 'Owner' ? 'border-primary-500/30 ring-1 ring-primary-500/10' : ''}`}>
                    <CardBody className="p-6 text-center flex flex-col items-center">
                      <div className={`text-2xl font-black ${item.color === 'primary' ? 'text-primary-500' : 'text-secondary-500'} mb-1`}>{item.share}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-2">{item.tier}: {item.label}</div>
                      <div className="px-2 py-0.5 rounded-full bg-default-100 text-[8px] font-black uppercase tracking-tighter text-default-400 mb-4">{item.rule}</div>
                      <p className="text-[10px] font-medium text-default-500 leading-relaxed">
                        {item.role}
                      </p>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>

            {/* L3+ Dividend Rule Clarifier */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="mt-6 p-6 rounded-3xl bg-secondary-500/[0.03] border border-secondary-500/10"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary-500/10 flex items-center justify-center text-secondary-600 shrink-0">
                  <FiInfo className="text-xl" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-secondary-600 uppercase tracking-widest mb-2">The L3+ Dividend Rule</h4>
                  <p className="text-xs text-default-500 font-medium leading-relaxed mb-4">
                    The 10% Executive Pool is shared among all leaders at L3 and above.
                    To maintain a balanced ecosystem, a **Max Individual Cap of 5%** is applied.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { scenario: "Only L3 Active", result: "L3 gets 5%" },
                      { scenario: "L3 & L4 Active", result: "Each gets 5% (Total 10%)" },
                      { scenario: "L3, L4 & L5 Active", result: "10% split as Dividend" }
                    ].map((sc, sci) => (
                      <div key={sci} className="p-3 rounded-2xl bg-content1 border border-default-200 shadow-sm flex flex-col justify-center">
                        <div className="text-[9px] font-black uppercase text-default-400 mb-1">{sc.scenario}</div>
                        <div className="text-[10px] font-black text-secondary-500">{sc.result}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Path to Leadership */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 relative p-1 md:p-1.5 rounded-[3rem] bg-gradient-to-br from-secondary-500/20 via-transparent to-primary-500/10 border border-default-200/50"
          >
            <Card className="bg-background/80 backdrop-blur-xl border-none rounded-[2.8rem] shadow-none p-8 md:p-16 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                  <div className="max-w-xl text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-500/10 border border-secondary-500/20 text-secondary-600 text-[10px] font-black uppercase tracking-widest mb-4">
                      <FiTrendingUp className="text-xs" /> Evolution Roadmap
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                      How <span className="text-secondary-500">You</span> Become a Leader
                    </h2>
                    <p className="text-default-500 font-medium leading-relaxed italic">
                      "Scale by building a team of Portfolio Owners. Your earnings grow as your team's supplier network expands."
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  {[
                    {
                      step: "Step 01",
                      title: "Manage Your Own Assets",
                      desc: "Start by managing your assigned suppliers. Earn your primary 40% as a Closer and 30% as an Asset Owner.",
                      badge: "Active Operator",
                      unlock: "Primary Rewards"
                    },
                    {
                      step: "Step 02",
                      title: "Mentor New Managers",
                      desc: "Bring in new Operators to manage their own portfolios. As their L1 Mentor, you earn 12% on all their trade pools.",
                      badge: "L1 Reward Active",
                      unlock: "Override Commissions"
                    },
                    {
                      step: "Step 03",
                      title: "Strategic Multiplier",
                      desc: "Help your team members become mentors themselves. Gain 8% from their sub-teams' portfolio activity.",
                      badge: "Network Leader",
                      unlock: "Geometric Scaling"
                    }
                  ].map((s, si) => (
                    <div key={si} className="group relative">
                      <div className="text-6xl font-black text-default-200/50 absolute -top-8 -left-4 pointer-events-none group-hover:text-secondary-500/10 transition-colors">
                        {si + 1}
                      </div>
                      <div className="relative p-6 rounded-3xl border border-default-200 bg-content1/30 hover:bg-content1 hover:shadow-2xl hover:border-secondary-500/30 transition-all flex flex-col h-full">
                        <div className="text-[10px] font-black text-secondary-500 uppercase tracking-[0.2em] mb-4">{s.step}</div>
                        <h4 className="text-xl font-black mb-3 text-foreground">{s.title}</h4>
                        <p className="text-xs text-default-500 font-medium leading-relaxed mb-6 flex-1">{s.desc}</p>

                        <div className="mt-auto space-y-2">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary-500/10 border border-secondary-500/20 text-secondary-600 text-[10px] font-black uppercase tracking-widest">
                            <FiCheckCircle /> {s.badge}
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-500/5 border border-primary-500/10 text-primary-600 text-[10px] font-black uppercase tracking-widest">
                            <FiZap /> {s.unlock}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-16 bg-content1 rounded-[2rem] p-8 border border-default-200 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-secondary-500 to-primary-500 flex items-center justify-center text-white text-2xl shrink-0">
                    <FiLayers />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h5 className="text-lg font-black mb-1 text-primary-600">The Power of Choice</h5>
                    <p className="text-xs text-default-500 font-medium leading-relaxed">
                      You can be just a Closer (40%), or just a Portfolio Owner (30%).
                      But a **Network Leader** captures the Management pool overrides while continuing to close high-value trades.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Example Calculation Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 relative p-8 md:p-12 rounded-3xl bg-content1 border-2 border-primary-500/20 shadow-2xl overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 text-[10px] font-black uppercase tracking-widest mb-6">
                  <FiZap className="text-xs" /> Dynamic Simulator
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                  Simulator: <span className="text-primary-500">Live Rewards</span>
                </h2>
                <div className="space-y-8">
                  <p className="text-default-500 font-medium leading-relaxed">
                    Adjust the <span className="text-foreground font-black">Net Profit</span> below to see how the commission pool is split between execution and assets in real-time.
                  </p>

                  <div className="p-8 rounded-[2rem] bg-default-50 border-2 border-primary-500/10 shadow-inner">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-black uppercase text-default-400 tracking-widest">Company Net Profit</span>
                      <span className="text-3xl font-black text-foreground">₹{profit.toLocaleString()}</span>
                    </div>

                    <input
                      type="range"
                      min="10000"
                      max="1000000"
                      step="5000"
                      value={profit}
                      onChange={(e) => setProfit(Number(e.target.value))}
                      className="w-full h-2 bg-default-200 rounded-lg appearance-none cursor-pointer accent-primary-500 mb-8"
                    />

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase text-primary-600 tracking-widest">Shareable Pool (30%)</span>
                        <span className="text-[10px] font-bold text-default-400 opacity-60 uppercase">Distributable Total</span>
                      </div>
                      <span className="text-4xl font-black text-primary-500">₹{shares.totalPool.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Deal Closer (Direct 40%)", amt: shares.closer, pct: "40%", icon: FiUserCheck, color: "text-warning-500" },
                  { label: "Portfolio Owner (Direct 30%)", amt: shares.owner, pct: "30%", icon: FiBriefcase, color: "text-primary-500" },
                  { label: "L1 Mentor (Hierarchy 12%)", amt: shares.l1, pct: "12%", icon: FiCheckCircle, color: "text-secondary-500" },
                  { label: "L2 Team Lead (Hierarchy 8%)", amt: shares.l2, pct: "8%", icon: FiLayers, color: "text-secondary-500" },
                  { label: "L3+ Executive (Ecosystem 10%)", amt: shares.l3plus, pct: "10%", icon: FiGlobe, color: "text-secondary-500" },
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    layout
                    className="flex items-center gap-4 p-4 rounded-2xl bg-content2/30 border border-default-200/50 transition-all hover:bg-content2/50"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-content1 flex items-center justify-center ${row.color} shadow-sm`}>
                      <row.icon className="text-lg" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-default-500 leading-none">{row.label}</span>
                        <span className="text-[10px] font-black text-default-400 bg-content1 px-1.5 py-0.5 rounded-lg border border-default-100 leading-none">{row.pct}</span>
                      </div>
                      <div className="text-lg font-black text-foreground mt-1">₹{row.amt.toLocaleString()}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Philosophy Section */}
          <Divider className="my-16 opacity-50" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-default-400 mb-2">Our Values</h3>
              <h2 className="text-3xl font-black mb-4">Trade Philosophy</h2>
              <p className="text-default-500 font-medium text-sm leading-relaxed">
                OBAOL's commission system reinforces patterns that reward both active building and passive portfolio growth.
              </p>
            </div>
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Portfolio Ownership", desc: "Encourage treating suppliers as long-term assets rather than one-off contacts.", icon: FiBriefcase },
                { title: "Leadership Rewards", desc: "Recognize the invisible effort mentors put into guiding their teams.", icon: FiUserCheck },
                { title: "Fixed Transparency", desc: "A immutable 30% profit share that ensures no ambiguity in rewards.", icon: FiCheckCircle }
              ].map((card, i) => (
                <div key={i} className="content1 p-6 rounded-2xl border border-default-200/60 bg-content1 hover:border-warning-400/30 transition-all group">
                  <card.icon className="text-xl text-warning-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-black mb-1.5 uppercase tracking-wide">{card.title}</h4>
                  <p className="text-[11px] font-medium text-default-400 leading-normal">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 p-1 rounded-[2.5rem] bg-gradient-to-r from-warning-500 to-amber-600 shadow-2xl"
          >
            <div className="bg-background rounded-[2.4rem] p-12 text-center">
              <h2 className="text-3xl font-black mb-4">Manage Your Portfolio</h2>
              <p className="text-default-500 max-w-xl mx-auto mb-8 font-medium">
                Ready to optimize your supplier activation and scale your commission earnings? Dive into your dashboard overview.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  as="a"
                  href="/dashboard"
                  size="lg"
                  className="bg-warning-500 text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-warning-500/20 hover:scale-105 transition-all"
                  endContent={<FiArrowRight />}
                >
                  Go to Dashboard
                </Button>
                <Button
                  as="a"
                  href="/roles/operator"
                  size="lg"
                  variant="bordered"
                  className="font-black px-8 h-14 rounded-2xl border-default-200 hover:bg-default-100 transition-all font-sans"
                >
                  Operator Roles
                </Button>
              </div>
            </div>
          </motion.div>

        </div>
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
