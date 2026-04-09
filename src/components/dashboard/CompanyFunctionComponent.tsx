"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Button, Card, CardBody, CardHeader, Chip, Divider, Progress } from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuArrowRight,
  LuActivity,
  LuPackageCheck,
  LuCalendar,
  LuTruck,
  LuWarehouse,
  LuBeaker,
  LuShip,
  LuRoute,
  LuBoxes,
  LuClock,
  LuCheck,
  LuInfo,
} from "react-icons/lu";

type FunctionMetrics = {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
};

type ExecutionItem = {
  enquiryId?: string;
  type?: string;
  status?: string;
  title?: string;
  createdAt?: string | Date;
};

type OrderItem = {
  orderId?: string;
  status?: string;
  createdAt?: string | Date;
  productName?: string;
};

type ActionLink = {
  label: string;
  href: string;
  description: string;
};

type Props = {
  name: string;
  slug: string;
  priorityRank?: number | null;
  metrics: FunctionMetrics;
  recentExecutionInquiries?: ExecutionItem[];
  recentOrders?: OrderItem[];
  previewMode?: boolean;
  placeholderRecommended?: boolean;
};

type SectionProps = Props & {
  actions: ActionLink[];
};

const ACTIONS_BY_SLUG: Record<string, ActionLink[]> = {
  "sourcing": [
    { label: "Enquiries", href: "/dashboard/enquiries", description: "Capture buyer demand and request details." },
    { label: "Marketplace", href: "/dashboard/marketplace", description: "Scan live listings and supply offers." },
    { label: "My Product", href: "/dashboard/product", description: "Manage your active sourcing catalog." },
  ],
  "packaging": [
    { label: "Execution Feed", href: "/dashboard/execution-enquiries", description: "Track packaging tasks in flight." },
    { label: "Orders", href: "/dashboard/orders", description: "Review packaging needs per order." },
    { label: "Documents", href: "/dashboard/documents", description: "Verify packing lists and labels." },
  ],
  "testing": [
    { label: "Certificates", href: "/dashboard/documents", description: "Upload and track lab certificates." },
    { label: "Execution Feed", href: "/dashboard/execution-enquiries", description: "Monitor sample testing tasks." },
    { label: "Orders", href: "/dashboard/orders", description: "See testing needs per order." },
  ],
  "warehouse-storage": [
    { label: "Warehouses", href: "/dashboard/warehouses", description: "Manage storage sites and capacity." },
    { label: "Inventory", href: "/dashboard/inventory", description: "Track stock levels and movements." },
    { label: "Warehouse Space", href: "/dashboard/warehouse-rent", description: "Allocate or rent extra space." },
  ],
  "freight-forwarding": [
    { label: "Execution Feed", href: "/dashboard/execution-enquiries", description: "Coordinate freight tasks and legs." },
    { label: "Orders", href: "/dashboard/orders", description: "Track forwarding status per order." },
    { label: "Documents", href: "/dashboard/documents", description: "Handle freight and shipping docs." },
  ],
  "importing-distribution": [
    { label: "Imports", href: "/dashboard/imports", description: "Manage inbound import shipments." },
    { label: "Orders", href: "/dashboard/orders", description: "Align distribution with orders." },
    { label: "Execution Feed", href: "/dashboard/execution-enquiries", description: "Track customs and handoffs." },
  ],
  "inland-logistics": [
    { label: "Execution Feed", href: "/dashboard/execution-enquiries", description: "Monitor dispatch and delivery." },
    { label: "Orders", href: "/dashboard/orders", description: "Plan inland moves per order." },
    { label: "Warehouses", href: "/dashboard/warehouses", description: "Coordinate storage handoffs." },
  ],
  "finance-risk": [
    { label: "Orders", href: "/dashboard/orders", description: "Review payment status by order." },
    { label: "Enquiries", href: "/dashboard/enquiries", description: "Assess financial exposure early." },
    { label: "Documents", href: "/dashboard/documents", description: "Validate invoices and terms." },
  ],
};

const defaultActions: ActionLink[] = [
  { label: "Enquiries", href: "/dashboard/enquiries", description: "Review incoming requests." },
  { label: "Orders", href: "/dashboard/orders", description: "Track order lifecycle." },
  { label: "Documents", href: "/dashboard/documents", description: "Manage key files." },
];

const statusColor = (status?: string) => {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "COMPLETED") return "success";
  if (normalized === "IN_PROGRESS") return "secondary";
  if (normalized === "OPEN") return "warning";
  return "default";
};

const formatDate = (value?: string | Date) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

const GlassIcon = ({ children, color = "primary" }: { children: React.ReactNode; color?: string }) => (
  <div className={`p-2.5 rounded-xl bg-${color}/10 border border-${color}/20 text-${color} shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:bg-${color}/20 transition-all duration-300`}>
    {children}
  </div>
);

const KpiItem = ({ 
  label, 
  value, 
  icon: Icon, 
  color = "default",
  index
}: { 
  label: string; 
  value: number; 
  icon: any; 
  color?: string;
  index: number;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
    className="relative group overflow-hidden rounded-3xl border border-default-200/50 bg-gradient-to-br from-content2/30 via-content2/10 to-transparent p-5 transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-1"
  >
    <div className={`absolute -right-6 -bottom-6 opacity-[0.03] transition-all duration-700 group-hover:opacity-[0.07] group-hover:scale-125 group-hover:rotate-12 group-hover:text-${color}`}>
      <Icon size={120} />
    </div>
    <div className="flex items-start justify-between relative z-10">
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400/80">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-foreground tracking-tighter leading-none">{value}</span>
          <div className={`h-1.5 w-1.5 rounded-full bg-${color}/80 animate-pulse shadow-[0_0_8px_var(--tw-shadow-color)] shadow-${color}/50`} />
        </div>
      </div>
      <GlassIcon color={color}>
        <Icon size={20} />
      </GlassIcon>
    </div>
    <div className={`absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-${color}/40 to-transparent transition-all duration-700 group-hover:w-full`} />
  </motion.div>
);

const KpiStrip = ({
  metrics,
  labels,
}: {
  metrics: FunctionMetrics;
  labels: [string, string, string];
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    <KpiItem label={labels[0]} value={metrics.open} icon={LuClock} color="warning" index={0} />
    <KpiItem label={labels[1]} value={metrics.inProgress} icon={LuActivity} color="secondary" index={1} />
    <KpiItem label={labels[2]} value={metrics.completed} icon={LuCheck} color="success" index={2} />
  </div>
);

const KPI_LABELS: Record<string, [string, string, string]> = {
  "sourcing": ["Active Enquiries", "Supplier Matches", "Conversions"],
  "packaging": ["Packs Pending", "In Packaging", "Ready to Dispatch"],
  "testing": ["Samples Pending", "In Testing", "Certificates Issued"],
  "warehouse-storage": ["Storage Used", "Inbound Moves", "Outbound Moves"],
  "finance-risk": ["Payments Due", "Payments Processing", "Payments Cleared"],
  "importing-distribution": ["Imports Scheduled", "Customs Processing", "Delivered"],
  "freight-forwarding": ["Legs Scheduled", "In Transit", "Delivered"],
  "inland-logistics": ["Routes Planned", "En Route", "Delivered"],
};

const SectionHeader = ({ title, icon: Icon }: { title: string; icon?: any }) => (
  <div className="flex items-center gap-2 mb-4">
    {Icon && <Icon className="text-primary/60 w-3.5 h-3.5" />}
    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-default-400/70">{title}</h4>
    <div className="h-[1px] flex-1 bg-gradient-to-r from-default-200/40 via-default-200/10 to-transparent ml-3" />
  </div>
);

const ExecutionFeed = ({
  recentExecutionInquiries,
  previewMode,
  placeholderRecommended,
}: {
  recentExecutionInquiries: ExecutionItem[];
  previewMode?: boolean;
  placeholderRecommended?: boolean;
}) => (
  <div className="rounded-[2.5rem] border border-default-200/50 bg-content2/10 backdrop-blur-md p-5 space-y-5 h-full flex flex-col">
    <div className="flex items-center justify-between shrink-0">
      <SectionHeader title="Execution Feed" />
      <Button
        as={Link}
        href="/dashboard/execution-enquiries"
        size="sm"
        variant="light"
        className="h-8 text-[10px] font-black tracking-widest uppercase text-default-400 hover:text-primary transition-colors"
        endContent={<LuArrowRight className="w-3 h-3" />}
      >
        View
      </Button>
    </div>
    <div className="flex-1 overflow-hidden">
      {recentExecutionInquiries.length ? (
        <div className="space-y-3">
          {recentExecutionInquiries.slice(0, 3).map((item, idx) => (
            <motion.div 
              key={`${item.enquiryId || "execution"}-${idx}`} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex items-center justify-between gap-4 p-3 rounded-2xl border border-transparent hover:border-default-200/60 hover:bg-content1/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center bg-${statusColor(item.status)}/10 text-${statusColor(item.status)} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  <LuLayers size={16} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{item.title || "Execution Item"}</span>
                  <span className="text-[10px] text-default-500/80 font-medium uppercase tracking-tighter">{item.type}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Chip size="sm" variant="dot" color={statusColor(item.status)} className="border-none h-5 text-[9px] uppercase font-black px-0">
                  {item.status}
                </Chip>
                <span className="text-[9px] text-default-400 flex items-center gap-1 font-mono tracking-tighter">
                  <LuClock size={9} />
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-40">
          <div className="relative mb-3">
     <LuBoxes size={40} className="text-default-300 animate-pulse" />
             <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-default-100 border-2 border-content1" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400">
            No Active Inquiries
          </p>
          {previewMode && placeholderRecommended && <span className="text-[8px] text-primary/50 mt-1 uppercase font-black">Simulation Data Off</span>}
        </div>
      )}
    </div>
  </div>
);

const RecentOrders = ({
  recentOrders,
  previewMode,
  placeholderRecommended,
}: {
  recentOrders: OrderItem[];
  previewMode?: boolean;
  placeholderRecommended?: boolean;
}) => (
  <div className="rounded-[2.5rem] border border-default-200/50 bg-content2/10 backdrop-blur-md p-5 space-y-5 h-full flex flex-col">
    <div className="flex items-center justify-between shrink-0">
      <SectionHeader title="Recent Orders" />
      <Button
        as={Link}
        href="/dashboard/orders"
        size="sm"
        variant="light"
        className="h-8 text-[10px] font-black tracking-widest uppercase text-default-400 hover:text-primary transition-colors"
        endContent={<LuArrowRight className="w-3 h-3" />}
      >
        Track
      </Button>
    </div>
    <div className="flex-1 overflow-hidden">
      {recentOrders.length ? (
        <div className="space-y-3">
          {recentOrders.slice(0, 3).map((item, idx) => (
            <motion.div 
              key={`${item.orderId || "order"}-${idx}`} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex items-center justify-between gap-4 p-3 rounded-2xl border border-transparent hover:border-default-200/60 hover:bg-content1/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <LuPackageCheck size={16} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-black text-foreground tracking-tight truncate max-w-[140px] group-hover:text-primary transition-colors">
                    {item.productName || "Order"}
                  </span>
                  <span className="text-[10px] text-default-500 font-mono tracking-tighter">#{String(item.orderId || "").slice(-6)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Chip size="sm" variant="flat" color="primary" className="h-5 text-[9px] uppercase font-black tracking-tighter shadow-sm">
                  {item.status || "IDLE"}
                </Chip>
                <span className="text-[9px] text-default-400 flex items-center gap-1 font-mono tracking-tighter">
                  <LuCalendar size={9} />
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-40">
          <div className="relative mb-3">
             <LuPackageCheck size={40} className="text-default-300 animate-pulse" />
             <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-default-100 border-2 border-content1" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400">
            No Recent Activity
          </p>
          {previewMode && placeholderRecommended && <span className="text-[8px] text-primary/50 mt-1 uppercase font-black">Simulation Data Off</span>}
        </div>
      )}
    </div>
  </div>
);

const FunctionSectionShell = ({
  name,
  slug,
  priorityRank,
  metrics,
  accent = "primary",
  children,
}: {
  name: string;
  slug: string;
  priorityRank?: number | null;
  metrics: FunctionMetrics;
  accent?: "primary" | "secondary" | "success" | "warning" | "danger";
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative group/shell"
  >
    {/* Ambient Glows */}
    <div className={`absolute -inset-4 bg-gradient-radial from-${accent}/10 via-transparent to-transparent opacity-0 group-hover/shell:opacity-100 transition-opacity duration-1000 -z-10`} />
    <div className={`absolute top-0 right-0 w-64 h-64 bg-${accent}/5 blur-[100px] -z-10 pointer-events-none`} />
    
    <Card className="border border-default-200/50 bg-content1/70 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[3rem] overflow-hidden">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between px-8 pt-8 pb-4 border-none relative">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-4">
            <h3 className="text-3xl font-black text-foreground tracking-tighter leading-none">{name}</h3>
            <AnimatePresence>
                {priorityRank && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-warning/20 blur-md animate-pulse rounded-full" />
                    <Chip size="sm" variant="shadow" color="warning" className="h-6 px-3 text-[10px] font-black uppercase tracking-widest relative z-10 border-none">
                        RANK #{priorityRank}
                    </Chip>
                </motion.div>
                )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3">
            <div className={`h-[3px] w-12 bg-gradient-to-r from-${accent} to-transparent rounded-full`} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-default-300 leading-none">{slug}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mt-6 md:mt-0 p-3 px-6 rounded-[2rem] bg-content2/20 border border-default-200/40 backdrop-blur-md">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-default-400/80 uppercase tracking-widest leading-none">Global Vol</span>
            <span className="text-2xl font-black text-foreground leading-none mt-1">{metrics.total}</span>
          </div>
          <Divider orientation="vertical" className="h-10 bg-default-200/50" />
          <div className="flex items-center gap-2.5">
             <div className="relative">
                <div className={`absolute inset-0 bg-${accent} blur-sm animate-ping opacity-40 rounded-full`} />
                <div className={`h-2.5 w-2.5 rounded-full bg-${accent} relative z-10 shadow-[0_0_10px_rgba(0,0,0,0.2)]`} />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">MISSION</span>
                <span className="text-[9px] font-bold text-default-400/80 uppercase tracking-tighter leading-none mt-1 shrink-0">CORE SYNCED</span>
             </div>
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-8 pb-8 pt-4 space-y-8">{children}</CardBody>
    </Card>
  </motion.div>
);

const ActionCardGrid = ({ actions, accent = "primary" }: { actions: ActionLink[]; accent?: string }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    {actions.map((action, idx) => (
      <motion.div
        key={action.href}
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Link
          href={action.href}
          className="group flex flex-col h-full rounded-[2rem] border border-default-200/50 bg-content2/20 p-6 transition-all duration-500 hover:border-primary/40 hover:bg-content2/50 relative overflow-hidden backdrop-blur-sm"
        >
          {/* Animated Background Element */}
          <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex flex-col">
                <span className="text-[9px] font-black text-primary/50 uppercase tracking-[0.2em] mb-1">EXECUTE</span>
                <span className="text-sm font-black text-foreground uppercase tracking-wider group-hover:text-primary transition-colors duration-300">{action.label}</span>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-default-200/30 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary group-hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all duration-300">
              <LuArrowRight size={18} className="group-hover:translate-x-1- transition-transform" />
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-default-500/90 font-medium group-hover:text-default-700 transition-colors duration-300 relative z-10">{action.description}</p>
        </Link>
      </motion.div>
    ))}
  </div>
);

const SourcingSection = (props: SectionProps) => (
  <FunctionSectionShell {...props} accent="primary">
    <KpiStrip metrics={props.metrics} labels={KPI_LABELS["sourcing"]} />
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
       <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-default-200/50 bg-content2/10 backdrop-blur-md p-6 space-y-6">
            <div className="flex items-center justify-between">
        <SectionHeader title="Operational Pipelines" icon={LuActivity} />
                <Chip size="sm" variant="flat" color="primary" className="h-5 px-3 text-[9px] font-black uppercase">LIVE DATA</Chip>
            </div>
            
            {props.recentExecutionInquiries?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {props.recentExecutionInquiries.slice(0, 4).map((item, idx) => (
                    <motion.div 
                        key={idx}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-content1/40 border border-transparent hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group/item"
                    >
                        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(249,115,22,0.4)] group-hover/item:scale-125 transition-transform" />
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs font-black text-foreground truncate group-hover/item:text-primary transition-colors">{item.title || "Enquiry Pipeline"}</span>
                            <span className="text-[9px] text-default-400 font-bold uppercase tracking-tighter">{item.type}</span>
                        </div>
                        <Chip size="sm" variant="dot" color={statusColor(item.status)} className="h-4 border-none text-[8px] font-black uppercase shrink-0">
                            {item.status}
                        </Chip>
                    </motion.div>
                ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
        <LuInfo size={32} className="mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Awaiting New Pipelines</span>
                </div>
            )}
          </div>
          
          <ActionCardGrid actions={props.actions} accent="primary" />
       </div>

       <div className="rounded-[2.5rem] border border-default-200/50 bg-content2/10 backdrop-blur-md p-6 space-y-6">
          <SectionHeader title="Conversion Funnel" />
          <div className="space-y-6 pt-2">
            {["Demand Capture", "Supplier Logic", "Negotiation", "Fulfillment"].map((label, idx) => (
              <motion.div 
                key={label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="group/funnel"
              >
                <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-2xl flex items-center justify-center text-xs font-black ${idx < 2 ? "bg-primary text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)]" : "bg-default-100 text-default-400"} group-hover/funnel:scale-110 transition-all duration-300`}>
                            {idx + 1}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-foreground uppercase tracking-wide group-hover/funnel:text-primary transition-colors">{label}</span>
                            <span className="text-[9px] text-default-400 font-bold uppercase tracking-tighter">{idx < 2 ? "Operating" : "Pending Intake"}</span>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-foreground/70">{idx < 2 ? "100%" : "0%"}</span>
                </div>
                <div className="h-1.5 w-full bg-default-100/50 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: idx < 2 ? "100%" : "0%" }}
                        transition={{ duration: 1.5, ease: "circOut", delay: 0.6 + idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-primary/40 to-primary shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                    />
                </div>
              </motion.div>
            ))}
          </div>
       </div>
    </div>
  </FunctionSectionShell>
);

const PackagingSection = (props: SectionProps) => (
  <FunctionSectionShell {...props} accent="warning">
    <KpiStrip metrics={props.metrics} labels={KPI_LABELS["packaging"]} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="rounded-[2.5rem] border border-default-200/50 bg-content2/10 backdrop-blur-md p-6 space-y-6">
        <SectionHeader title="System Readiness" icon={LuBoxes} />
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Design Specs", status: "success", info: "Verified" },
            { label: "Material Stock", status: "success", info: "In Range" },
            { label: "Label Logic", status: "warning", info: "Processing" },
            { label: "Final QC", status: "default", info: "Scheduled" }
          ].map((item, idx) => (
            <motion.div 
                key={item.label}
                whileHover={{ scale: 1.05 }}
                className="p-5 rounded-[2rem] bg-content1/40 border border-default-200/60 flex flex-col items-center text-center gap-3 transition-all duration-500 hover:border-warning/40 hover:shadow-xl group"
            >
              <div className={`h-10 w-10 rounded-2xl bg-${item.status}/10 flex items-center justify-center text-${item.status}`}>
                 {item.status === 'success' ? <LuCheck size={20} /> : item.status === 'warning' ? <LuActivity size={20} className="animate-spin-slow" /> : <LuClock size={20} />}
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-[11px] font-black text-foreground uppercase tracking-tight">{item.label}</span>
                 <span className="text-[9px] font-bold text-default-400 uppercase tracking-tighter">{item.info}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <ExecutionFeed
        recentExecutionInquiries={props.recentExecutionInquiries || []}
        previewMode={props.previewMode}
        placeholderRecommended={props.placeholderRecommended}
      />
    </div>
    <ActionCardGrid actions={props.actions} accent="warning" />
  </FunctionSectionShell>
);

const TestingSection = (props: SectionProps) => (
  <FunctionSectionShell {...props} accent="secondary">
    <KpiStrip metrics={props.metrics} labels={KPI_LABELS["testing"]} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="rounded-[2.5rem] border border-default-200/50 bg-secondary/5 backdrop-blur-md p-8 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-secondary group-hover:scale-110 transition-transform duration-700">
            <LuBeaker size={150} className="-rotate-12" />
        </div>
        
        <SectionHeader title="Lab Terminal 01" icon={LuBeaker} />
        
        <div className="space-y-6 relative z-10">
          <motion.div 
            whileHover={{ x: 10 }}
            className="p-6 rounded-[2rem] bg-content1/60 border border-default-200/60 shadow-lg group/box"
          >
            <div className="flex gap-5 items-center">
               <div className="h-14 w-14 rounded-[1.2rem] bg-secondary/20 flex items-center justify-center text-secondary shadow-lg group-hover/box:shadow-secondary/20 transition-all">
       <LuActivity size={24} className="animate-pulse" />
               </div>
               <div className="flex flex-col gap-1.5 px-1">
                  <h5 className="text-sm font-black text-foreground uppercase tracking-wide">Automated Intake</h5>
                  <p className="text-[11px] leading-relaxed text-default-500 font-medium">Next sample processing cycle initiates at <span className="text-secondary font-black">14:00 UTC</span>.</p>
               </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary/5 border border-dashed border-secondary/30">
             <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-secondary animate-ping" />
                <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Live Analysis Active</span>
             </div>
             <Chip size="sm" variant="shadow" color="secondary" className="h-6 px-4 text-[9px] font-black uppercase tracking-widest border-none">NOMINAL</Chip>
          </div>
        </div>
      </div>
      <ExecutionFeed
        recentExecutionInquiries={props.recentExecutionInquiries || []}
        previewMode={props.previewMode}
        placeholderRecommended={props.placeholderRecommended}
      />
    </div>
    <ActionCardGrid actions={props.actions} accent="secondary" />
  </FunctionSectionShell>
);

const WarehouseSection = (props: SectionProps) => (
  <FunctionSectionShell {...props} accent="success">
    <KpiStrip metrics={props.metrics} labels={KPI_LABELS["warehouse-storage"]} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="rounded-[2.5rem] border border-default-200/50 bg-success/5 backdrop-blur-md p-8 space-y-8 h-full">
        <SectionHeader title="Logistics Capacity" icon={LuWarehouse} />
        <div className="space-y-8 pr-2">
          {[
            { label: "Cold Storage", value: 62, color: "success", icon: LuActivity },
            { label: "Dry Storage", value: 38, color: "primary", icon: LuBoxes },
            { label: "Dock Bays", value: 74, color: "warning", icon: LuTruck },
          ].map((item, idx) => (
            <motion.div 
                key={item.label} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={`h-8 w-8 rounded-xl bg-${item.color}/10 flex items-center justify-center text-${item.color} group-hover:scale-110 transition-transform`}>
                      <item.icon size={16} />
                   </div>
                   <span className="text-[11px] font-black text-foreground uppercase tracking-widest">{item.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-foreground">{item.value}</span>
                    <span className="text-[10px] font-bold text-default-400">%</span>
                </div>
              </div>
              <div className="relative h-2 w-full bg-default-100 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1.5, ease: "circOut", delay: 0.5 + idx * 0.1 }}
                    className={`absolute inset-0 bg-gradient-to-r from-${item.color}/50 to-${item.color} shadow-[0_0_12px_rgba(34,197,94,0.3)] shadow-${item.color}/40`} 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <RecentOrders
        recentOrders={props.recentOrders || []}
        previewMode={props.previewMode}
        placeholderRecommended={props.placeholderRecommended}
      />
    </div>
    <ActionCardGrid actions={props.actions} accent="success" />
  </FunctionSectionShell>
);

const FinanceRiskSection = (props: SectionProps) => (
  <FunctionSectionShell {...props} accent="danger">
    <KpiStrip metrics={props.metrics} labels={KPI_LABELS["finance-risk"]} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="rounded-[2.5rem] border border-default-200/50 bg-content2/10 backdrop-blur-md p-8 space-y-8">
        <SectionHeader title="Financial Health" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative group overflow-hidden rounded-[2.5rem] border border-default-200/60 bg-content1/60 p-6 shadow-xl transition-all duration-500 hover:border-danger/40"
          >
            <div className="absolute -top-4 -right-4 p-4 opacity-5 text-danger group-hover:scale-125 group-hover:opacity-10 transition-all duration-700">
               <LuClock size={80} />
            </div>
            <div className="text-[10px] uppercase font-black text-default-400 tracking-[0.2em] mb-3">Arrears Intake</div>
            <div className="text-4xl font-black text-foreground tracking-tighter">0</div>
            <div className="mt-4 h-1 w-12 bg-danger/20 rounded-full" />
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative group overflow-hidden rounded-[2.5rem] border border-default-200/60 bg-content1/60 p-6 shadow-xl transition-all duration-500 hover:border-success/40"
          >
            <div className="absolute -top-4 -right-4 p-4 opacity-5 text-success group-hover:scale-125 group-hover:opacity-10 transition-all duration-700">
              <LuCheck size={80} />
            </div>
            <div className="text-[10px] uppercase font-black text-default-400 tracking-[0.2em] mb-3">Liquid Settled</div>
            <div className="text-4xl font-black text-foreground tracking-tighter">0</div>
            <div className="mt-4 h-1 w-12 bg-success/20 rounded-full" />
          </motion.div>
        </div>
      </div>
      <div className="rounded-[2.5rem] border border-default-200/50 bg-danger/5 backdrop-blur-md p-8 space-y-6 relative group overflow-hidden">
        <div className="absolute -bottom-8 -left-8 h-40 w-40 bg-danger/5 blur-3xl rounded-full" />
        <SectionHeader title="Risk Telemetry" />
        <div className="space-y-6 relative z-10">
          <div className="flex gap-5 p-5 rounded-[1.5rem] bg-danger/5 border border-danger/10 group-hover:bg-danger/10 transition-all duration-500">
             <div className="h-10 w-10 rounded-2xl bg-danger/20 flex items-center justify-center text-danger shrink-0 shadow-lg shadow-danger/10">
                <LuInfo size={20} />
             </div>
             <p className="text-[11px] leading-relaxed text-default-600 font-medium italic">
                {props.previewMode && props.placeholderRecommended ? "Simulated High-Frequency Trading Terminal: Connection to Global Risk Feed established. Monitoring deviations..." : "Automated algorithms are scanning payment vectors and counterparty compliance benchmarks. Status update pending next block."}
             </p>
          </div>
          <div className="flex items-center justify-center pt-2">
             <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
             >
                <Chip size="lg" variant="dot" color="success" className="h-8 px-6 text-[11px] font-black tracking-[0.2em] uppercase border-none bg-success/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]">STABLE HORIZON</Chip>
             </motion.div>
          </div>
        </div>
      </div>
    </div>
    <ActionCardGrid actions={props.actions} accent="danger" />
  </FunctionSectionShell>
);

const ImportDistributionSection = (props: SectionProps) => (
  <FunctionSectionShell {...props} accent="primary" name="Importer">
    <KpiStrip metrics={props.metrics} labels={KPI_LABELS["importing-distribution"]} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="rounded-[2.5rem] border border-default-200/50 bg-primary/5 backdrop-blur-md p-8 space-y-8">
        <SectionHeader title="Port Intelligence" icon={LuShip} />
        <div className="space-y-6">
          {["Vessel Arrival", "Customs Protocol", "Last Mile Distribution"].map((label, idx) => (
            <div key={label} className="flex flex-col gap-3 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-1.5 w-1.5 rounded-full ${idx === 0 ? 'bg-success animate-pulse' : 'bg-default-300'}`} />
                    <span className="text-[11px] font-black text-foreground uppercase tracking-widest transition-colors group-hover:text-primary">{label}</span>
                </div>
                <Chip size="sm" variant={idx === 0 ? "shadow" : "flat"} color={idx === 0 ? "success" : "default"} className="h-5 px-3 text-[9px] font-black uppercase border-none tracking-widest">
                  {idx === 0 ? "ACTIVE" : "QUEUED"}
                </Chip>
              </div>
              <div className="h-1.5 w-full bg-default-100/50 rounded-full overflow-hidden shadow-inner">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: idx === 0 ? "100%" : "30%" }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.5 + idx * 0.2 }}
                    className={`h-full bg-gradient-to-r ${idx === 0 ? 'from-success/50 to-success' : 'from-default-200 to-default-300'} rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]`}
                 />
              </div>
            </div>
          ))}
        </div>
      </div>
      <RecentOrders
        recentOrders={props.recentOrders || []}
        previewMode={props.previewMode}
        placeholderRecommended={props.placeholderRecommended}
      />
    </div>
    <ActionCardGrid actions={props.actions} accent="primary" />
  </FunctionSectionShell>
);

const FreightForwardingSection = (props: SectionProps) => (
  <FunctionSectionShell {...props} accent="secondary">
    <KpiStrip metrics={props.metrics} labels={KPI_LABELS["freight-forwarding"]} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="rounded-[2.5rem] border border-default-200/50 bg-secondary/5 backdrop-blur-md p-8 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-secondary group-hover:rotate-12 transition-transform duration-700">
            <LuTruck size={120} />
        </div>
        
        <SectionHeader title="Logistics Vector" icon={LuTruck} />
        
        <div className="space-y-6 relative z-10 pr-2">
          {[
            { label: "Dispatch Intake", status: "success", detail: "Validated" },
            { label: "Global Transit", status: "success", detail: "In Motion" },
            { label: "Port Handover", status: "default", detail: "Awaiting" },
            { label: "Final Clearance", status: "default", detail: "Pending" }
          ].map((item, idx) => (
            <div key={item.label} className="flex items-center gap-5 group/row">
               <div className={`h-10 w-10 rounded-[1.2rem] border-2 border-dashed ${item.status === 'success' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-default-200 text-default-300'} flex items-center justify-center shrink-0 group-hover/row:scale-110 transition-all duration-300`}>
                  {item.status === 'success' ? <LuCheck size={18} /> : <span className="text-[11px] font-black">{idx + 1}</span>}
               </div>
               <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                     <span className={`text-[11px] font-black uppercase tracking-wider ${item.status === 'success' ? 'text-foreground' : 'text-default-400'}`}>{item.label}</span>
                     <span className={`text-[9px] font-black uppercase tracking-tighter ${item.status === 'success' ? 'text-secondary/80' : 'text-default-300'}`}>{item.detail}</span>
                  </div>
                  {idx < 3 && <div className="h-[1px] w-full bg-default-100/50 mt-3 group-hover/row:bg-secondary/20 transition-colors" />}
               </div>
            </div>
          ))}
        </div>
      </div>
      <ExecutionFeed
        recentExecutionInquiries={props.recentExecutionInquiries || []}
        previewMode={props.previewMode}
        placeholderRecommended={props.placeholderRecommended}
      />
    </div>
    <ActionCardGrid actions={props.actions} accent="secondary" />
  </FunctionSectionShell>
);

const InlandLogisticsSection = (props: SectionProps) => (
  <FunctionSectionShell {...props} accent="warning">
    <KpiStrip metrics={props.metrics} labels={KPI_LABELS["inland-logistics"]} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="rounded-[2.5rem] border border-default-200/50 bg-warning/5 backdrop-blur-md p-8 space-y-6 h-full flex flex-col">
        <SectionHeader title="Dispatch Intelligence" icon={LuRoute} />
        
        <div className="relative flex-1 min-h-[160px] rounded-[2rem] overflow-hidden border border-default-200/60 bg-content1/40 group shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-warning/15 via-transparent to-transparent animate-pulse duration-5000" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
             <div className="relative mb-4">
                <div className="absolute inset-0 bg-warning blur-2xl opacity-20 animate-ping rounded-full" />
                <LuRoute size={48} className="text-warning group-hover:scale-110 transition-transform duration-500 relative z-10" />
             </div>
             <p className="text-[11px] font-black text-foreground uppercase tracking-[0.3em] mb-1">Vector Map Engaged</p>
             <div className="px-4 py-1.5 rounded-full bg-warning/10 border border-warning/20 text-[9px] font-black text-warning uppercase tracking-widest shadow-lg">
                OPTIMIZED DISPATCH V2.4
             </div>
          </div>
          {/* Decorative lines/dots to simulate map */}
          <div className="absolute top-10 left-10 h-1 w-1 rounded-full bg-warning/40" />
          <div className="absolute bottom-20 right-20 h-1 w-1 rounded-full bg-warning/40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-10 -translate-y-10 h-[100px] w-[1px] bg-gradient-to-t from-warning/20 to-transparent rotate-45" />
        </div>
        
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-content1/60 border border-default-200/60 group/status">
           <div className="relative">
              <div className="h-3 w-3 rounded-full bg-success animate-ping opacity-40" />
              <div className="absolute inset-0 h-3 w-3 rounded-full bg-success" />
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">CONSOLIDATION ENGINE</span>
              <span className="text-[9px] font-bold text-default-400 uppercase mt-1">Status: Nominal Response</span>
           </div>
        </div>
      </div>
      <ExecutionFeed
        recentExecutionInquiries={props.recentExecutionInquiries || []}
        previewMode={props.previewMode}
        placeholderRecommended={props.placeholderRecommended}
      />
    </div>
    <ActionCardGrid actions={props.actions} accent="warning" />
  </FunctionSectionShell>
);

const FunctionComponentMap: Record<string, React.FC<SectionProps>> = {
  "sourcing": SourcingSection,
  "packaging": PackagingSection,
  "testing": TestingSection,
  "warehouse-storage": WarehouseSection,
  "finance-risk": FinanceRiskSection,
  "importing-distribution": ImportDistributionSection,
  "freight-forwarding": FreightForwardingSection,
  "inland-logistics": InlandLogisticsSection,
};

export default function CompanyFunctionComponent(props: Props) {
  const actions = useMemo(() => {
    const key = String(props.slug || "").toLowerCase();
    return ACTIONS_BY_SLUG[key] || defaultActions;
  }, [props.slug]);

  const Component = FunctionComponentMap[String(props.slug || "").toLowerCase()] || SourcingSection;

  return (
    <Component
      {...props}
      actions={actions}
    />
  );
}
