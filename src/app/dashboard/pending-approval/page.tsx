"use client";

import { useContext } from "react";
import AuthContext from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@nextui-org/react";
import GuidanceContent from "@/components/guidance/GuidanceContent";
import { 
  LuShieldCheck, 
  LuActivity, 
  LuZap, 
  LuLayers, 
  LuBox, 
  LuTruck, 
  LuRefreshCw, 
  LuSettings, 
  LuFileText, 
  LuLayoutGrid,
  LuClock,
  LuCheckCircle,
  LuLock,
  LuSearch
} from "react-icons/lu";

const SectionHeader = ({ title, status }: { title: string; status?: string }) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-6 bg-warning-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
      <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/80 italic">{title}</h3>
    </div>
    {status && (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-warning-500/10 border border-warning-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-widest text-warning-500">{status}</span>
      </div>
    )}
  </div>
);

const FeatureCard = ({ title, desc, note, icon: Icon, colorClass = "text-warning-500" }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="relative group h-full p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-500 backdrop-blur-3xl overflow-hidden flex flex-col"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-warning-500/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-warning-500/10 transition-colors" />
    <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center ${colorClass} mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
      <Icon size={22} />
    </div>
    <p className="text-sm font-black text-foreground uppercase tracking-tight mb-2">{title}</p>
    <p className="text-[11px] font-bold text-default-400 uppercase tracking-widest leading-relaxed opacity-70 mb-4">{desc}</p>
    <div className="mt-auto pt-4 border-t border-white/5">
      <p className="text-[9px] font-black text-default-500 uppercase tracking-widest italic group-hover:text-warning-500/70 transition-colors">{note}</p>
    </div>
  </motion.div>
);

const AssociatePanel = () => (
  <div className="flex flex-col gap-12">
    {/* Hero Section */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-10 md:p-16 rounded-[3rem] bg-[#04070f] border border-white/10 shadow-2xl overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-1/2 h-full bg-warning-500/[0.02] blur-[120px] rounded-full -mr-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-primary-500/[0.01] blur-[100px] rounded-full -ml-40 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-warning-500/10 border border-warning-500/20 mb-8">
          <LuClock className="text-warning-500 animate-pulse" size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-warning-500">Security Gate: Hold // In Review</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter italic leading-none mb-6">
          Welcome to <span className="text-warning-500 underline decoration-warning-500/20 underline-offset-8">OBAOL Hub</span>
        </h1>
        
        <p className="text-sm md:text-lg font-bold text-default-400 uppercase tracking-widest max-w-3xl leading-relaxed opacity-80">
          Your credentials are undergoing tactical verification. This procedure enforces marketplace integrity. 
          Monitor the progression sequence below as your operational dashboard nears activation.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Verified trading network", icon: LuShieldCheck },
            { label: "Compliance‑ready workflows", icon: LuZap },
            { label: "Role‑based execution panels", icon: LuLayers }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-500 shadow-inner">
                <item.icon size={16} />
              </div>
              <span className="text-[10px] font-black text-default-300 uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>

    <div className="space-y-4">
       <SectionHeader title="Platform Flows" status="Awaiting Initialization" />
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={LuLayoutGrid} 
            title="Order Flow" 
            desc="Track deal stages from enquiry → contract → production." 
            note="Full Lifecycle Visualization" 
          />
          <FeatureCard 
            icon={LuZap} 
            title="Enquiry Flow" 
            desc="Capture leads, negotiate terms, and route to execution." 
            note="Advanced Negotiation Core" 
          />
          <FeatureCard 
            icon={LuBox} 
            title="Sample Flow" 
            desc="Request, approve, and track samples with compliance." 
            note="Supply Chain Validation" 
          />
          <FeatureCard 
            icon={LuLayers} 
            title="Execution Panels" 
            desc="Dedicated panels unlock based on registered interests." 
            note="Modular Control Center" 
          />
       </div>
    </div>

    <div className="space-y-4">
       <SectionHeader title="Services Available" />
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={LuTruck} 
            title="Imports Service" 
            desc="Reserve shipments, manage compliance, and track arrivals." 
            note="Global Logistics Node" 
            colorClass="text-primary-500"
          />
          <FeatureCard 
            icon={LuLayoutGrid} 
            title="Warehouse Hub" 
            desc="Discover verified storage and reserve capacity slots." 
            note="Secure Grid Storage" 
            colorClass="text-emerald-500"
          />
          <FeatureCard 
            icon={LuRefreshCw} 
            title="Live Analytics" 
            desc="Monitor catalog changes and pricing updates in real-time." 
            note="Market Telemetry" 
            colorClass="text-purple-500"
          />
       </div>
    </div>

    <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-2xl">
      <SectionHeader title="Progression Sequence" />
      <div className="flex flex-col md:flex-row items-center gap-6">
        {[
          { step: "01", label: "Admin Review", icon: LuSearch },
          { step: "02", label: "Compliance Check", icon: LuShieldCheck },
          { step: "03", label: "Protocol Activate", icon: LuZap }
        ].map((item, i) => (
          <div key={i} className="flex-1 flex items-center gap-6 w-full">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-warning-500 shadow-inner group">
                <span className="absolute -top-3 -right-3 text-[10px] font-black text-warning-500/50 italic tracking-widest">{item.step}</span>
                <item.icon size={24} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-foreground uppercase tracking-widest">{item.label}</span>
              <span className="text-[9px] font-bold text-default-500 uppercase tracking-widest mt-1 italic">Phase {i+1} Authorization</span>
            </div>
            {i < 2 && <div className="hidden lg:block flex-1 h-px bg-gradient-to-r from-warning-500/40 to-transparent mx-4" />}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OperatorPanel = () => (
  <div className="flex flex-col gap-12">
    {/* Operator Hero */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-10 md:p-16 rounded-[3rem] bg-[#04070f] border border-white/10 shadow-2xl overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-500/[0.02] blur-[120px] rounded-full -mr-40 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8">
          <LuClock className="text-primary-500 animate-pulse" size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Operator Protocol: Verification In Progress</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter italic leading-none mb-6">
          COMMAND <span className="text-primary-500 underline decoration-primary-500/20 underline-offset-8">VERIFICATION</span>
        </h1>
        
        <p className="text-sm md:text-lg font-bold text-default-400 uppercase tracking-widest max-w-3xl leading-relaxed opacity-80">
          Administrator level review of your operational status is active. Once approved, you will coordinate 
          the logistical backbone of the OBAOL platform. Standby for authorization.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Inventory Ownership", icon: LuBox },
            { label: "Verification Support", icon: LuShieldCheck },
            { label: "Flow Coordination", icon: LuRefreshCw }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md text-primary-500">
              <item.icon size={16} />
              <span className="text-[10px] font-black text-default-300 uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>

    <div className="space-y-4">
       <SectionHeader title="Mission Parameters" />
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard 
            icon={LuActivity} 
            title="Inventory Operations" 
            desc="Track inventory availability, allocations, and dispatch." 
            note="Logistical Precision" 
            colorClass="text-primary-500"
          />
          <FeatureCard 
            icon={LuShieldCheck} 
            title="Verification Support" 
            desc="Assist with compliance checks and document validation." 
            note="Security Overseer" 
            colorClass="text-primary-500"
          />
          <FeatureCard 
            icon={LuFileText} 
            title="Manual Pipeline" 
            desc="Coordinate enquiries, orders, and sample pipelines." 
            note="Execution Lead" 
            colorClass="text-primary-500"
          />
          <FeatureCard 
            icon={LuRefreshCw} 
            title="Fleet Correlation" 
            desc="Support associate teams and match verified suppliers." 
            note="Operational Backbone" 
            colorClass="text-primary-500"
          />
       </div>
    </div>
  </div>
);

export default function PendingApprovalPage() {
  const { user, loading, logout } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const guidanceRole = roleLower === "operator" || roleLower === "team" ? "operator" : "associate";

  if (loading) return null;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-12 md:py-20 lg:py-28">
      <div className="flex justify-end mb-6">
        <Button
          size="sm"
          radius="full"
          variant="bordered"
          className="border-default-200 text-default-500"
          onPress={() => logout()}
        >
          Sign Out
        </Button>
      </div>
      {roleLower === "operator" || roleLower === "team" ? <OperatorPanel /> : <AssociatePanel />}
      <div className="mt-16">
        <GuidanceContent roleView={guidanceRole} showToggle={false} />
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-20 text-center"
      >
        <div className="inline-flex items-center gap-4 p-6 rounded-[2rem] bg-foreground/[0.02] border border-divider/40 backdrop-blur-md">
           <div className="w-1.5 h-1.5 rounded-full bg-default-400 animate-pulse shadow-[0_0_8px_rgba(161,161,170,0.5)]" />
           <p className="text-[10px] font-black text-default-400 uppercase tracking-[0.2em]">
             System Support Available // Contact operational HQ for direct assistance.
           </p>
        </div>
        <p className="mt-8 text-[9px] font-black text-default-500/30 uppercase tracking-[0.4em]">
          OBAOL SUPREME EXECUTION // PLATFORM VERSION 4.2.0
        </p>
      </motion.div>
    </div>
  );
}
