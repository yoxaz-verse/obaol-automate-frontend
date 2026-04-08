"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuBookOpen,
  LuZap,
  LuShieldCheck,
  LuTerminal,
  LuVideo,
  LuCircleCheck,
  LuActivity,
  LuLayers,
  LuLayoutGrid,
  LuChevronRight,
  LuMap,
  LuClock,
  LuBox,
  LuTruck,
  LuRefreshCw,
} from "react-icons/lu";

const associateFeatureSections = [
  {
    title: "Product",
    summary: "Build your trading catalog and discovery surface.",
    icon: LuLayoutGrid,
    items: [
      {
        name: "My Product",
        route: "/dashboard/product",
        what: "Create and manage your product listings and pricing details.",
        actions: "Add products, update variants, review pricing and visibility.",
      },
      {
        name: "Global Catalog",
        route: "/dashboard/catalog",
        what: "Browse the broader catalog and match listings to enquiries.",
        actions: "Search, filter, and open product detail views.",
      },
      {
        name: "Marketplace",
        route: "/dashboard/marketplace",
        what: "Monitor marketplace activity and connect to active opportunities.",
        actions: "Open listings, start enquiries, and track interest.",
      },
    ],
  },
  {
    title: "Execution",
    summary: "Run day‑to‑day trading workflows and fulfillment.",
    icon: LuActivity,
    items: [
      {
        name: "Enquiries",
        route: "/dashboard/enquiries",
        what: "Handle buyer/seller enquiries and progress them into orders.",
        actions: "Assign roles, negotiate terms, update status, convert to orders.",
      },
      {
        name: "Sample Requests",
        route: "/dashboard/sample-requests",
        what: "Track sample approvals and compliance notes.",
        actions: "Review requests, log approvals, add remarks.",
      },
      {
        name: "Internal Orders",
        route: "/dashboard/orders",
        what: "Manage orders from confirmation to delivery.",
        actions: "Update milestones, attach docs, coordinate timelines.",
      },
      {
        name: "Documents",
        route: "/dashboard/documents",
        what: "Centralize compliance documents and shipment paperwork.",
        actions: "Upload, review, tag, and link to orders.",
      },
      {
        name: "Execution Panel",
        route: "/dashboard/execution-enquiries",
        what: "Dedicated execution view per company interest and capability.",
        actions: "Open execution queues and monitor active tasks.",
      },
      {
        name: "External Orders",
        route: "/dashboard/external-orders",
        what: "Create and track orders originating outside the platform.",
        actions: "Create external orders, map parties, track status.",
      },
    ],
  },
  {
    title: "Services",
    summary: "Logistics and infrastructure services that support operations.",
    icon: LuTruck,
    items: [
      {
        name: "Imports Service",
        route: "/dashboard/imports",
        what: "Coordinate import enquiries, shipments, and compliance.",
        actions: "Track import requests, link documents, follow progress.",
      },
      {
        name: "Warehouse Space",
        route: "/dashboard/warehouse-rent",
        what: "Find and reserve storage capacity for shipments.",
        actions: "Search availability, request slots, manage bookings.",
      },
    ],
  },
  {
    title: "Manage",
    summary: "Company profile, alerts, and account controls.",
    icon: LuLayers,
    items: [
      {
        name: "My Company",
        route: "/dashboard/company",
        what: "Configure company profile and responsibility areas.",
        actions: "Set capabilities, add contacts, update company info.",
      },
      {
        name: "Notifications",
        route: "/dashboard/notifications",
        what: "See alerts for enquiries, orders, and approvals.",
        actions: "Open notifications and jump to related records.",
      },
      {
        name: "Profile",
        route: "/dashboard/profile",
        what: "Manage your personal profile and account settings.",
        actions: "Update details, change password, review access.",
      },
    ],
  },
];

const associateVideoOutline = [
  {
    title: "1. Welcome + Access",
    points: [
      "Explain Associate role and what approval unlocks.",
      "Show login, onboarding, and pending approval screens briefly.",
    ],
  },
  {
    title: "2. Dashboard Orientation",
    points: [
      "Show navigation layout and how sections map to workflows.",
      "Explain notifications and key status indicators.",
    ],
  },
  {
    title: "3. Product Setup",
    points: [
      "Create a product listing and confirm it appears in catalog.",
      "Show how marketplace ties into enquiries.",
    ],
  },
  {
    title: "4. Execution Flow",
    points: [
      "Walk through enquiry → negotiation → order creation.",
      "Cover samples and document management.",
      "Highlight the Execution Panel per company interest.",
    ],
  },
  {
    title: "5. Services + Logistics",
    points: [
      "Imports tracking and warehouse rental flow.",
      "External orders and when to use them.",
    ],
  },
  {
    title: "6. Admin Controls + Wrap",
    points: [
      "Company setup, profile updates, notification hygiene.",
      "Summarize day‑to‑day routine for associates.",
    ],
  },
];

const operatorFeatureSections = [
  {
    title: "Product",
    summary: "Support product visibility and catalog readiness.",
    icon: LuLayoutGrid,
    items: [
      {
        name: "My Product",
        route: "/dashboard/product",
        what: "Review assigned company products and ensure listings are complete.",
        actions: "Verify details, cross‑check compliance, flag missing data.",
      },
      {
        name: "Global Catalog",
        route: "/dashboard/catalog",
        what: "Reference catalog items while validating enquiries and orders.",
        actions: "Search SKUs, verify specs, compare variants.",
      },
      {
        name: "Marketplace",
        route: "/dashboard/marketplace",
        what: "Monitor marketplace listings tied to operator assignments.",
        actions: "Review activity, track demand signals, report issues.",
      },
    ],
  },
  {
    title: "Execution",
    summary: "Run operational workflows and keep flows moving.",
    icon: LuActivity,
    items: [
      {
        name: "Enquiries",
        route: "/dashboard/enquiries",
        what: "Triage incoming enquiries and assign responsibilities.",
        actions: "Update statuses, tag operators, escalate blockers.",
      },
      {
        name: "Sample Requests",
        route: "/dashboard/sample-requests",
        what: "Coordinate sample approvals and shipment notes.",
        actions: "Record approvals, track dispatch, update notes.",
      },
      {
        name: "Internal Orders",
        route: "/dashboard/orders",
        what: "Maintain order status from confirmation to delivery.",
        actions: "Update milestones, confirm logistics, attach docs.",
      },
      {
        name: "Documents",
        route: "/dashboard/documents",
        what: "Store compliance and shipment paperwork tied to orders.",
        actions: "Upload, classify, and link documents.",
      },
      {
        name: "Execution Panel",
        route: "/dashboard/execution-enquiries",
        what: "Operate the active execution queue by company interest.",
        actions: "Process queued tasks and monitor SLAs.",
      },
      {
        name: "External Orders",
        route: "/dashboard/external-orders",
        what: "Create and track off‑platform orders when needed.",
        actions: "Create records, assign parties, sync status.",
      },
    ],
  },
  {
    title: "Services",
    summary: "Operational services tied to logistics and imports.",
    icon: LuTruck,
    items: [
      {
        name: "Imports Service",
        route: "/dashboard/imports",
        what: "Monitor import requests and compliance steps.",
        actions: "Track shipment status, validate documents.",
      },
      {
        name: "Warehouse Space",
        route: "/dashboard/warehouse-rent",
        what: "Coordinate storage capacity for active orders.",
        actions: "Check availability, reserve slots, log updates.",
      },
    ],
  },
  {
    title: "Manage",
    summary: "Inventory, warehouse, and company operations.",
    icon: LuLayers,
    items: [
      {
        name: "Inventory",
        route: "/dashboard/inventory",
        what: "Maintain stock and availability for assigned companies.",
        actions: "Update quantities, sync availability, log variances.",
      },
      {
        name: "Warehouses",
        route: "/dashboard/warehouses",
        what: "Track warehouse status and operational capacity.",
        actions: "Review warehouse data, confirm capacity updates.",
      },
      {
        name: "My Company",
        route: "/dashboard/company",
        what: "Review company details relevant to execution.",
        actions: "Validate contacts, capabilities, and routing rules.",
      },
      {
        name: "Notifications",
        route: "/dashboard/notifications",
        what: "Stay on top of alerts tied to your operations.",
        actions: "Open alerts and jump to action items.",
      },
      {
        name: "Profile",
        route: "/dashboard/profile",
        what: "Manage your operator profile and availability details.",
        actions: "Update contact info and onboarding records.",
      },
    ],
  },
  {
    title: "Operator",
    summary: "Team structure and performance views.",
    icon: LuTerminal,
    items: [
      {
        name: "Hierarchy",
        route: "/dashboard/operator/hierarchy",
        what: "Understand reporting structure and coverage areas.",
        actions: "Inspect chain of responsibility and assigned nodes.",
      },
      {
        name: "Team",
        route: "/dashboard/operator/team",
        what: "Manage team members and referral links.",
        actions: "Invite operators, track team performance.",
      },
      {
        name: "Earnings",
        route: "/dashboard/operator/earnings",
        what: "Review commission and performance history.",
        actions: "Filter by period, export summaries.",
      },
    ],
  },
];

const operatorDailyFlow = [
  {
    title: "Start of Day",
    points: [
      "Open Notifications and review overnight alerts.",
      "Check Enquiries queue for urgent items.",
    ],
  },
  {
    title: "Triage + Assignment",
    points: [
      "Update enquiry statuses and assign operators.",
      "Flag missing data or compliance gaps.",
    ],
  },
  {
    title: "Order Execution",
    points: [
      "Move active orders through milestones.",
      "Attach documents and confirm shipment steps.",
    ],
  },
  {
    title: "Inventory + Warehouse",
    points: [
      "Sync inventory availability for active SKUs.",
      "Coordinate warehouse capacity and storage slots.",
    ],
  },
  {
    title: "Team + Reporting",
    points: [
      "Review team performance (Hierarchy/Team).",
      "Check earnings or commission summaries if needed.",
    ],
  },
  {
    title: "End of Day",
    points: [
      "Clear notifications and log any unresolved blockers.",
      "Ensure all active enquiries/orders are updated.",
    ],
  },
];

const operatorJourney = [
  {
    title: "Signup",
    detail: "Register via email or Google, verify access, enter onboarding.",
  },
  {
    title: "Onboarding",
    detail: "Complete profile, security, and operational details.",
  },
  {
    title: "Pending Approval",
    detail: "Wait for admin approval while reviewing platform flows.",
  },
  {
    title: "Dashboard Unlock",
    detail: "Begin daily operational tasks and manage active flows.",
  },
];

const operatorVideoOutline = [
  {
    title: "1. Role Overview + Access",
    points: [
      "Explain operator responsibilities and approval flow.",
      "Show onboarding and pending approval screens briefly.",
    ],
  },
  {
    title: "2. Daily Flow Walkthrough",
    points: [
      "Start of day checks → triage → execution → wrap‑up.",
      "Call out notifications and priority handling.",
    ],
  },
  {
    title: "3. Execution Tools",
    points: [
      "Enquiries, orders, documents, and execution panel.",
      "Sample requests and external orders when needed.",
    ],
  },
  {
    title: "4. Inventory + Warehousing",
    points: [
      "Inventory sync and warehouse coordination.",
      "Imports + warehouse rent service touchpoints.",
    ],
  },
  {
    title: "5. Operator Team + Performance",
    points: [
      "Hierarchy, team management, and earnings.",
      "Close with daily reporting habits.",
    ],
  },
];

const SectionDecoration = () => (
  <div className="absolute top-0 right-0 w-32 h-32 bg-warning-500/5 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none" />
);

type RoleView = "associate" | "operator";

type GuidanceContentProps = {
  roleView?: RoleView;
  showToggle?: boolean;
};

export default function GuidanceContent({ roleView, showToggle = true }: GuidanceContentProps) {
  const [localRoleView, setLocalRoleView] = useState<RoleView>("associate");
  const activeRole = (roleView || localRoleView) as RoleView;
  const isOperator = activeRole === "operator";
  const featureSections = isOperator ? operatorFeatureSections : associateFeatureSections;
  const videoOutline = isOperator ? operatorVideoOutline : associateVideoOutline;

  return (
    <div className="min-h-screen px-6 py-12 md:px-12 lg:px-20 bg-background text-foreground transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* Tactical Briefing Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-10 md:p-16 rounded-[3rem] bg-content2/30 dark:bg-white/[0.02] border border-divider shadow-2xl overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-1/2 h-full bg-warning-500/[0.03] blur-[120px] rounded-full -mr-40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-primary-500/[0.01] blur-[100px] rounded-full -ml-40 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-warning-500/10 border border-warning-500/20 mb-8">
              <LuBookOpen className="text-warning-500 animate-pulse" size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-warning-500">
                System Protocol: Training // Orientation
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter italic leading-none mb-6">
              Platform{" "}
              <span className="text-warning-500 underline decoration-warning-500/20 underline-offset-8">Guidance Map</span>
            </h1>

            <p className="text-sm md:text-lg font-bold text-default-600 dark:text-default-400 uppercase tracking-widest max-w-3xl leading-relaxed opacity-90">
              Reference checklist for operational mastery and guidance recording.
              Organized by the exact dashboard nodes activated upon approval.
            </p>

            {showToggle && (
              <div className="mt-10 inline-flex p-1.5 rounded-2xl bg-content3/50 dark:bg-[#0a0f1d] border border-divider shadow-inner">
                {[
                  { id: "associate", label: "Associate", icon: LuLayers },
                  { id: "operator", label: "Operator", icon: LuTerminal },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setLocalRoleView(role.id as RoleView)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                      activeRole === role.id
                        ? "bg-warning-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                        : "text-default-500 dark:text-default-400 hover:text-foreground"
                    }`}
                  >
                    <role.icon size={14} />
                    {role.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-[2fr,1fr]">
          <div className="flex flex-col gap-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                {featureSections.map((section) => (
                  <div key={section.title} className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-warning-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                        <div>
                          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-foreground italic">
                            {section.title}
                          </h2>
                          <p className="text-[10px] font-bold text-default-500 uppercase tracking-widest mt-1 opacity-80">
                            {section.summary}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-warning-500/60 uppercase tracking-[0.3em]">
                        [{section.items.length} ACTIVE NODES]
                      </span>
                    </div>

                    <div className="grid gap-4">
                      {section.items.map((item) => (
                        <motion.div
                          key={item.route}
                          whileHover={{ x: 10 }}
                          className="relative group p-6 rounded-[2rem] bg-content1/40 dark:bg-white/[0.02] border border-divider hover:border-warning-500/30 hover:bg-content1/60 dark:hover:bg-white/[0.04] transition-all duration-500 backdrop-blur-3xl overflow-hidden"
                        >
                          <SectionDecoration />
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-base font-black text-foreground uppercase tracking-tight">
                                  {item.name}
                                </span>
                                <span className="text-[10px] font-bold text-warning-500/60 bg-warning-500/5 px-2 py-0.5 rounded-full border border-warning-500/20">
                                  {item.route}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-default-600 dark:text-default-400 uppercase tracking-widest leading-relaxed opacity-90 mb-3">
                                {item.what}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-warning-600 dark:text-warning-500 uppercase tracking-widest italic leading-none opacity-80">
                                  Protocol Actions:
                                </span>
                                <span className="text-[11px] font-black text-default-500 uppercase tracking-widest leading-none">
                                  {item.actions}
                                </span>
                              </div>
                            </div>
                            <LuChevronRight className="text-warning-500/30 group-hover:text-warning-500 transition-colors" size={20} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}

                {isOperator && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                      <div className="w-1.5 h-6 bg-primary-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                      <h2 className="text-sm font-black uppercase tracking-[0.4em] text-foreground italic">
                        Daily Operator Flow
                      </h2>
                    </div>
                    <div className="grid gap-4">
                      {operatorDailyFlow.map((step, i) => (
                        <div key={step.title} className="p-6 rounded-[2rem] bg-content2/30 dark:bg-white/[0.02] border border-divider">
                          <p className="text-xs font-black text-primary-500 uppercase tracking-widest mb-3">
                            Phase {i + 1}: {step.title}
                          </p>
                          <ul className="space-y-2">
                            {step.points.map((point) => (
                              <li
                                key={point}
                                className="flex items-start gap-2 text-[11px] font-bold text-default-600 dark:text-default-400 uppercase tracking-widest leading-relaxed opacity-90"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mt-1.5 shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Protocol Sidebar */}
          <div className="flex flex-col gap-8">
            <div className="sticky top-8 space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-content2/40 dark:bg-white/[0.02] border border-divider backdrop-blur-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <LuVideo className="text-warning-500" size={18} />
                  <h2 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">
                    Narration Outline
                  </h2>
                </div>

                <div className="space-y-8 relative">
                  <div className="absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-warning-500/50 via-warning-500/20 to-transparent" />

                  {videoOutline.map((step, i) => (
                    <div key={step.title} className="relative pl-10">
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-lg bg-content4 dark:bg-[#0a0f1d] border border-warning-500/30 flex items-center justify-center z-10 shadow-sm">
                        <span className="text-[11px] font-black text-warning-500 italic">{i + 1}</span>
                      </div>
                      <p className="text-[12px] font-black text-foreground uppercase tracking-widest mb-3">
                        {step.title}
                      </p>
                      <ul className="space-y-2">
                        {step.points.map((point) => (
                          <li
                            key={point}
                            className="text-[10px] font-bold text-default-600 dark:text-default-400 uppercase tracking-widest leading-relaxed opacity-90"
                          >
                            + {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {isOperator && (
                <div className="p-8 rounded-[2.5rem] bg-content1/30 dark:bg-white/[0.01] border border-divider">
                  <div className="flex items-center gap-3 mb-6">
                    <LuMap className="text-primary-500" size={18} />
                    <h2 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">
                      Operator Journey
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {operatorJourney.map((step) => (
                      <div
                        key={step.title}
                        className="p-4 rounded-2xl bg-content2 dark:bg-white/[0.03] border border-divider group hover:border-primary-500/30 transition-all"
                      >
                        <p className="text-[11px] font-black text-primary-500 uppercase tracking-widest mb-1">{step.title}</p>
                        <p className="text-[10px] font-bold text-default-500 uppercase tracking-widest leading-relaxed opacity-80">
                          {step.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 rounded-[2rem] bg-warning-500/[0.05] dark:bg-warning-500/[0.02] border border-warning-500/30 backdrop-blur-xl group">
                <div className="flex items-center gap-3 mb-3 text-warning-500">
                  <LuCircleCheck size={16} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">System Advisory</span>
                </div>
                <p className="text-[11px] font-bold text-default-600 dark:text-default-400 uppercase tracking-widest leading-relaxed italic opacity-90">
                  Limit each section to 30–60 seconds. Use active telemetry data to visualize enquire/order flow transitions across the command node.
                </p>
              </div>

              <div className="text-center pt-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-content2 dark:bg-white/[0.02] border border-divider">
                  <LuClock size={10} className="text-default-500" />
                  <span className="text-[9px] font-black text-default-500 uppercase tracking-[0.3em]">OBAOL // GUIDANCE_v4.2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
