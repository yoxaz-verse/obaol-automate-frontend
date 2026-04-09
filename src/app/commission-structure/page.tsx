"use client";

import React from "react";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuCircleCheck,
  LuCircleX,
  LuUsers,
  LuBriefcase,
  LuTrendingUp,
  LuPackage,
  LuUserCheck,
  LuLayers,
  LuZap,
  LuInfo,
  LuArrowRight,
  LuChartPie,
  LuGlobe,
  LuShieldCheck,
  LuCpu,
  LuNetwork,
  LuActivity,
  LuTarget
} from "react-icons/lu";
import { Card, CardBody, Divider, Button, Tooltip, Progress, Slider, Tabs, Tab } from "@heroui/react";
import { useCurrency } from "@/context/CurrencyContext";

const DecorativeNode = ({ className = "" }: { className?: string }) => (
  <div className={`absolute pointer-events-none opacity-10 ${className}`}>
    <div className="w-12 h-12 rounded-full border border-warning-500/20 animate-[pulse_4s_infinite]" />
  </div>
);

export default function CommissionStructurePage() {
  const { formatRate } = useCurrency();
  const [profit, setProfit] = React.useState(500000);
  const [isMounted, setIsMounted] = React.useState(false);
  const [activeTier, setActiveTier] = React.useState("L1");

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayRate = (value: number) => (isMounted ? formatRate(Number(value || 0)) : "…");

  const calculateShares = (netProfit: number) => {
    const totalCommissionPool = netProfit * 0.50;
    const corePoolTotal = netProfit * 0.30;
    const procurement = netProfit * 0.10;
    const handler = netProfit * 0.10;
    
    return {
      totalCommissionPool,
      corePoolTotal,
      procurement,
      handler,
      closer: corePoolTotal * 0.40,
      owner: corePoolTotal * 0.30,
      l1: corePoolTotal * 0.12,
      l2: corePoolTotal * 0.08,
      l3plus: corePoolTotal * 0.10
    };
  };

  const shares = calculateShares(profit);

  const tierData = {
    L1: {
      title: "Mentor (L1)",
      pct: "12%",
      focus: "Direct Multiplier",
      desc: "Activate this tier the moment you onboard a new Operator. You immediately earn a 12% lifetime override on their direct trade yields as they close deals.",
      impact: "Rewards direct leadership and active ecosystem expansion.",
      icon: LuUserCheck,
      color: "text-primary-400"
    },
    L2: {
      title: "Cluster Leader (L2)",
      pct: "8%",
      focus: "Structural Override",
      desc: "Unlocks organically when the Operators you mentored start building their own teams. You passively earn an 8% yield on every trade finalized by their sub-nodes.",
      impact: "Encourages multi-generational growth and network stability.",
      icon: LuNetwork,
      color: "text-secondary-400"
    },
    L3: {
      title: "Executive Circle (L3+)",
      pct: "10%",
      focus: "Ecosystem Dividend",
      desc: "Secured when your operational network scales deep across multiple levels. You gain access to a 10% ecosystem dividend pool. To ensure balanced structural expansion, the maximum yield extracted per network layer is capped at 5%. This means your 10% override naturally stretches down across multiple deep-tier generations.",
      impact: "The 5% per-layer limit guarantees sustainable, long-term passive yield across massive global networks.",
      icon: LuGlobe,
      color: "text-warning-400"
    }
  };

  return (
    <section className="min-h-screen bg-background text-foreground selection:bg-warning-500/30 overflow-x-hidden">
      <Header />
      <ThemedContentWrapper>
        <div className="mx-auto max-w-[1280px] px-6 pt-32 md:pt-40 pb-20 relative">
          
          <div className="absolute top-0 right-[-10%] w-[400px] h-[400px] bg-warning-500/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] bg-primary-500/5 blur-[80px] rounded-full pointer-events-none" />

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center max-w-3xl mx-auto relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-content2/50 border border-default-200/50 text-warning-500 text-[9px] font-black uppercase tracking-[0.3em] mb-6 shadow-lg">
              <LuChartPie size={12} className="animate-pulse" /> Unified rewards engine v4.2
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 leading-tight uppercase italic text-foreground">
              Supreme <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning-400 via-amber-500 to-orange-600">Execution</span> <br/> 
              <span className="text-foreground/90">Incentives</span>
            </h1>
          </motion.div>

          {/* 01. Layering Structure Hub */}
          <div className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 transition-all">
            <Card className="lg:col-span-12 bg-content1/50 backdrop-blur-xl border-default-200/50 shadow-xl rounded-[2.5rem] overflow-hidden group border-r-4 border-r-warning-500/20">
              <CardBody className="p-0">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-default-200/50 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-500 border border-warning-500/20">
                        <LuNetwork size={20} />
                      </div>
                      <h2 className="text-2xl font-black tracking-tighter uppercase leading-none text-foreground">Layering Structure</h2>
                    </div>
                    <p className="text-base text-foreground/70 leading-relaxed font-medium mb-10">
                      Our system activates a 50% system-wide commission pool sourced from net operational yields, distributed across three primary hubs.
                    </p>
                    <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-warning-500 to-orange-700 text-white shadow-xl overflow-hidden group">
                      <div className="relative z-10 flex items-end gap-2">
                        <span className="text-5xl md:text-6xl font-black tracking-tighter leading-none">50%</span>
                        <div className="flex flex-col mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Commission Pool</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest italic opacity-70 leading-none">Of Net Trade Profit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-1/2 p-8 md:p-12 bg-content2/20">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary-500 mb-6 font-bold flex items-center gap-2">
                      <LuActivity size={12} /> Execution Triggers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { text: "Terminal Dispatch", icon: LuPackage, active: true },
                        { text: "Ledger Verification", icon: LuShieldCheck, active: true },
                        { text: "Negotiation Hub", icon: LuCircleX, active: false },
                        { text: "Draft Inquiries", icon: LuCircleX, active: false }
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border ${item.active ? 'bg-content1/80 border-success-500/20 text-success-600' : 'bg-content1/80 border-danger-500/20 text-danger-600 opacity-60'} text-[10px] font-black uppercase tracking-widest`}>
                          <item.icon size={14} />
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 02. Allocation Matrix */}
          <div className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 text-white">
            {[
              { label: "Core Pool", share: "30%", icon: LuCpu, color: "text-primary-500", tone: "bg-primary-500/5", border: "border-primary-500/20" },
              { label: "Procurement", share: "10%", icon: LuNetwork, color: "text-warning-500", tone: "bg-warning-500/5", border: "border-warning-500/20" },
              { label: "Handler", share: "10%", icon: LuLayers, color: "text-secondary-500", tone: "bg-secondary-500/5", border: "border-secondary-500/20" },
            ].map((item, index) => (
              <Card key={index} className={`bg-content1/50 backdrop-blur-xl ${item.border} shadow-lg rounded-[2rem]`}>
                <CardBody className="p-8 flex items-center gap-5">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.tone} ${item.color} border border-current/10`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-black uppercase tracking-widest text-foreground/80 leading-none mb-1">{item.label}</div>
                    <div className={`text-2xl font-black italic tracking-tighter ${item.color}`}>{item.share}</div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* 03. Dynamic Yield Scanner (REORDERED) */}
          <div className="mb-32 relative z-10 w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-black leading-tight uppercase tracking-tighter italic text-foreground block">
                Dynamic <span className="text-foreground/70">Yield Scanner</span>
              </h2>
            </div>

            <Card className="max-w-5xl mx-auto bg-content1/50 backdrop-blur-3xl border-default-200/50 shadow-2xl rounded-[3rem] overflow-hidden">
                <CardBody className="p-8 md:p-12">
                    {/* Controller */}
                    <div className="flex flex-col items-center text-center space-y-8 border-b border-default-200/50 pb-12 mb-12">
                        <div className="flex flex-col gap-4 w-full max-w-xl px-4">
                            <span className="text-[11px] font-black uppercase text-warning-500 tracking-[0.4em] mb-1">Adjust Net Yield Input</span>
                            <div className="flex items-center justify-center mb-2">
                               <span className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-none italic tabular-nums">{displayRate(profit)}</span>
                            </div>
                            <Slider 
                                size="md"
                                step={10000}
                                color="warning"
                                maxValue={2000000}
                                minValue={10000}
                                value={profit}
                                onChange={(value) => setProfit(value as number)}
                                className="w-full"
                                classNames={{
                                    base: "max-w-md mx-auto",
                                    filler: "bg-warning-500",
                                    thumb: "bg-warning-500 border-2 border-white shadow-lg h-6 w-6",
                                    track: "bg-default-200 h-2 rounded-full"
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                            <div className="p-8 rounded-[1.5rem] bg-gradient-to-br from-warning-500 to-orange-700 text-white shadow-lg flex flex-col items-center justify-center">
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Total Pool (50%)</span>
                                <span className="text-3xl font-black tracking-tighter italic leading-none">{displayRate(shares.totalCommissionPool)}</span>
                            </div>
                            <Card className="p-8 rounded-[1.5rem] bg-content2/30 border border-default-200/50 flex flex-col items-center justify-center">
                                <span className="text-[11px] font-black uppercase text-foreground/70 font-black tracking-widest mb-2">Procurement (10%)</span>
                                <span className="text-2xl font-black text-foreground italic">{displayRate(shares.procurement)}</span>
                            </Card>
                            <Card className="p-8 rounded-[1.5rem] bg-content2/30 border border-default-200/50 flex flex-col items-center justify-center">
                                <span className="text-[11px] font-black uppercase text-foreground/70 font-black tracking-widest mb-2">Handler (10%)</span>
                                <span className="text-2xl font-black text-foreground italic">{displayRate(shares.handler)}</span>
                            </Card>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <span className="text-[12px] font-black uppercase text-primary-400 tracking-[0.4em] whitespace-nowrap">Core Pool Subdivision (30%)</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-primary-500/20 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {[
                                { label: "DC", share: "40%", amt: shares.closer, color: "text-warning-500", bg: "bg-warning-500", icon: LuUserCheck },
                                { label: "Owner", share: "30%", amt: shares.owner, color: "text-primary-500", bg: "bg-primary-500", icon: LuBriefcase },
                                { label: "L1 Mentor", share: "12%", amt: shares.l1, color: "text-secondary-500", bg: "bg-secondary-500", icon: LuShieldCheck },
                                { label: "L2 Cluster", share: "8%", amt: shares.l2, color: "text-secondary-500", bg: "bg-secondary-500", icon: LuNetwork },
                                { label: "L3+ Div", share: "10%", amt: shares.l3plus, color: "text-secondary-500", bg: "bg-secondary-500", icon: LuGlobe },
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-[1.5rem] bg-content2/20 border border-default-200/50 flex flex-col items-center text-center hover:bg-content2/40 transition-all cursor-default group">
                                    <div className={`h-8 w-8 rounded-lg ${item.bg}/10 border border-current/10 flex items-center justify-center ${item.color} mb-3 group-hover:scale-110 transition-transform`}>
                                        <item.icon size={16} />
                                    </div>
                                    <span className="text-[11px] font-black uppercase text-foreground/80 tracking-widest mb-1 leading-none">{item.label} ({item.share})</span>
                                    <div className="text-base font-black text-foreground tracking-tighter italic">{displayRate(item.amt)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardBody>
            </Card>
          </div>

          {/* 04. How You Become a Leader (REORDERED) */}
          <div className="mb-32 relative z-10">
            <div className="text-center mb-16">
               <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 italic text-foreground">How You Become a <span className="text-warning-500">Leader</span></h2>
               <div className="h-1 w-20 bg-warning-500 mx-auto rounded-full mb-6" />
               <p className="text-sm text-foreground/70 font-medium max-w-xl mx-auto leading-relaxed">
                 Transform from a tactical operator to a strategic architect by scaling your mentorship activities across the OBAOL ecosystem.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
              {[
                { step: "Step 01", title: "Active Assets", icon: LuUserCheck, color: "text-warning-500", desc: "Secure your operational foundation. Finalize deals to earn your 40% Deal Closer share and maintain assigned suppliers for a 30% Portfolio Owner yield." },
                { step: "Step 02", title: "Mentorship", icon: LuUsers, color: "text-primary-500", desc: "Onboard new Operators to multiply your yield. You instantly earn a 12% L1 override on every finalized trade they execute." },
                { step: "Step 03", title: "Strategic Arc", icon: LuTrendingUp, color: "text-secondary-500", desc: "Scale your network autonomously. As your team recruits their own operators, capture 8% (L2) and 10% (L3+) passive overrides on all sub-node volume." }
              ].map((item, i) => (
                <div key={i} className="group relative">
                  <div className="absolute -inset-2 bg-gradient-to-b from-content2/50 to-transparent rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <Card className="relative h-full bg-content1/50 backdrop-blur-xl border-default-200/50 shadow-md rounded-[3rem] overflow-hidden hover:translate-y-[-10px] transition-all">
                    <CardBody className="p-10">
                      <div className="text-[10px] font-black uppercase tracking-[0.5em] text-warning-500 mb-6 font-bold">{item.step}</div>
                      <div className={`h-14 w-14 rounded-2xl ${item.color.replace('text', 'bg')}/10 border border-current/20 flex items-center justify-center ${item.color} mb-8 shadow-inner`}>
                        <item.icon size={28} />
                      </div>
                      <h4 className="text-xl font-black mb-4 text-foreground uppercase tracking-tight italic">{item.title}</h4>
                      <p className="text-sm text-foreground/70 font-medium leading-relaxed">{item.desc}</p>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* 05. Interactive Hierarchy Flow (NEW) */}
          <div className="mb-24 relative z-10 w-full text-white">
             <div className="text-center mb-16 px-4">
                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-primary-500 block mb-6 px-4">Deep Logic Hub</span>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic text-foreground mb-4">Hierarchical <span className="text-primary-500">Yield Mechanics</span></h2>
                <div className="h-1 w-32 bg-primary-500 mx-auto rounded-full mb-10" />
                <p className="max-w-xl mx-auto text-foreground/70 font-medium text-sm leading-relaxed">
                   Explaining the tactical flow of override commissions through our multi-generational mentorship model.
                </p>
             </div>

             <Card className="max-w-4xl mx-auto bg-content1/50 backdrop-blur-3xl border-default-200/50 rounded-[3.5rem] overflow-hidden shadow-2xl">
                <CardBody className="p-4 md:p-10 flex flex-col items-center">
                    <Tabs 
                        aria-label="Tier Analysis" 
                        color="primary" 
                        variant="underlined"
                        selectedKey={activeTier}
                        onSelectionChange={(key) => setActiveTier(key as string)}
                        classNames={{
                            tabList: "gap-8 w-full relative rounded-none p-0 border-b border-default-200/50 mb-10",
                            cursor: "w-full bg-primary-500 h-1",
                            tab: "max-w-fit px-0 h-12",
                            tabContent: "font-black uppercase tracking-widest text-[11px]"
                        }}
                    >
                        <Tab key="L1" title="L1 (12%)" />
                        <Tab key="L2" title="L2 (8%)" />
                        <Tab key="L3" title="L3+ (10%)" />
                    </Tabs>

                    <div className="w-full flex flex-col md:flex-row gap-12 items-center min-h-[300px]">
                        <div className="md:w-1/2 flex justify-center">
                            <motion.div 
                                key={activeTier}
                                initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                className={`h-48 w-48 rounded-[3rem] ${tierData[activeTier as keyof typeof tierData].color.replace('text', 'bg')}/10 border-4 border-dashed border-current flex items-center justify-center ${tierData[activeTier as keyof typeof tierData].color} shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]`}
                            >
                                {React.createElement(tierData[activeTier as keyof typeof tierData].icon, { size: 80 })}
                            </motion.div>
                        </div>
                        <div className="md:w-1/2 space-y-8">
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={activeTier}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-foreground/70 tracking-[0.4em] block mb-2">{tierData[activeTier as keyof typeof tierData].focus}</span>
                                        <h3 className={`text-4xl font-black uppercase tracking-tighter italic ${tierData[activeTier as keyof typeof tierData].color}`}>{tierData[activeTier as keyof typeof tierData].title}</h3>
                                    </div>
                                    <p className="text-foreground/90 font-medium leading-relaxed">{tierData[activeTier as keyof typeof tierData].desc}</p>
                                    <div className="p-6 rounded-[1.5rem] bg-content2/50 border border-default-200/50 flex items-start gap-4">
                                        <LuTarget className={tierData[activeTier as keyof typeof tierData].color} size={24} />
                                        <p className="text-xs text-foreground/90 leading-relaxed font-bold italic">{tierData[activeTier as keyof typeof tierData].impact}</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </CardBody>
             </Card>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 p-1 rounded-[3rem] bg-gradient-to-r from-warning-500 via-amber-600 to-orange-700 shadow-xl"
          >
            <div className="bg-[#05070c] rounded-[2.9rem] p-12 md:p-16 text-center relative overflow-hidden text-white">
                <div className="relative z-10">
                    <LuShieldCheck size={50} className="text-warning-500 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                    <h2 className="text-3xl md:text-5xl font-black mb-6 leading-none uppercase italic tracking-tighter text-foreground">
                        Ready to <span className="text-warning-500">Scale?</span>
                    </h2>
                    <p className="text-sm text-foreground/70 max-w-xl mx-auto mb-10 font-medium leading-relaxed">
                        Join our elite network of operators and architects. Activate your organizational position to secure tiered yields.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button
                        as="a"
                        href="/dashboard"
                        size="md"
                        className="bg-warning-500 text-black font-black px-8 h-12 rounded-2xl shadow-lg hover:scale-105 transition-all text-[10px] uppercase tracking-widest font-sans"
                        endContent={<LuArrowRight size={14} />}
                        >
                        Go To Dashboard
                        </Button>
                    </div>
                </div>
            </div>
          </motion.div>

        </div>
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
