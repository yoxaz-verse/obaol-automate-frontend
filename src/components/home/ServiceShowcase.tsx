"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiPackage,
  FiShoppingBag,
  FiTruck,
  FiTarget,
  FiFileText,
} from "react-icons/fi";
import { FaShip, FaWarehouse } from "react-icons/fa6";
import { homeTitleStyles } from "@/components/home/homeTitleStyles";

const services = [
  {
    id: "sourcing",
    title: "Sourcing",
    eyebrow: "Find",
    description:
      "Find the exact product specifications and identify the best origins that match the buyer's unique requirements.",
    metric: "Requirement to origin",
    image:
      "https://images.pexels.com/photos/35855061/pexels-photo-35855061.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=webp&h=1280&w=1600",
    imagePosition: "center 42%",
    imageAlt:
      "Agricultural specialist inspecting a crop in the field before sourcing",
    icon: FiTarget,
    accent: "from-purple-400 to-violet-500",
    color: "#a78bfa",
  },
  {
    id: "documentation",
    title: "Documentation & Planning",
    eyebrow: "Plan",
    description:
      "Prepare compliance documents, manage export paperwork, and systematically plan the execution logistics.",
    metric: "Origin to readiness",
    image:
      "https://images.pexels.com/photos/8297652/pexels-photo-8297652.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=webp&h=1280&w=1600",
    imagePosition: "center 38%",
    imageAlt:
      "Trade professionals reviewing shipment documents and export paperwork",
    icon: FiFileText,
    accent: "from-blue-400 to-indigo-500",
    color: "#60a5fa",
  },
  {
    id: "procurement",
    title: "Procurement",
    eyebrow: "Source",
    description:
      "On-ground procurement partners inspect availability, negotiate readiness, and prepare confirmed lots for execution.",
    metric: "Supplier to stock",
    image:
      "https://images.pexels.com/photos/12833512/pexels-photo-12833512.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=webp&h=1280&w=1600",
    imagePosition: "center 44%",
    imageAlt:
      "Agricultural supplier weighing a sack of produce for procurement",
    icon: FiShoppingBag,
    accent: "from-orange-400 to-amber-500",
    color: "#fb923c",
  },
  {
    id: "quality",
    title: "Quality Testing",
    eyebrow: "Verify",
    description:
      "Quality labs and verification operators test samples, validate specifications, and reduce uncertainty before shipment.",
    metric: "Sample to approval",
    image:
      "https://images.pexels.com/photos/8940363/pexels-photo-8940363.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=webp&h=1280&w=1600",
    imagePosition: "center 42%",
    imageAlt:
      "Laboratory technician testing a grain sample with food-quality equipment",
    icon: FiCheckCircle,
    accent: "from-emerald-400 to-teal-500",
    color: "#34d399",
  },
  {
    id: "packaging",
    title: "Packaging",
    eyebrow: "Pack",
    description:
      "Packaging teams handle bags, cartons, labeling, and export-ready preparation based on buyer and commodity needs.",
    metric: "Lot to load-ready",
    image:
      "https://images.pexels.com/photos/13795516/pexels-photo-13795516.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=webp&h=1280&w=1600",
    imagePosition: "center 46%",
    imageAlt:
      "Worker sealing a filled agricultural commodity sack for dispatch",
    icon: FiPackage,
    accent: "from-pink-400 to-rose-500",
    color: "#fb7185",
  },
  {
    id: "logistics",
    title: "Logistics",
    eyebrow: "Move",
    description:
      "Truck operators, dispatch teams, and route handlers coordinate pickup, inland movement, and live shipment handoffs.",
    metric: "Pickup to port",
    image:
      "https://images.pexels.com/photos/29948458/pexels-photo-29948458.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=webp&h=1280&w=1600",
    imagePosition: "center 40%",
    imageAlt:
      "Workers loading agricultural sacks onto an inland transport truck",
    icon: FiTruck,
    accent: "from-sky-400 to-blue-500",
    color: "#38bdf8",
  },
  {
    id: "warehouse",
    title: "Warehouse",
    eyebrow: "Store",
    description:
      "Warehouse operators manage capacity, stock visibility, staging, and release windows inside the execution flow.",
    metric: "Stock to dispatch",
    image:
      "https://images.pexels.com/photos/4483942/pexels-photo-4483942.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=webp&h=1280&w=1600",
    imagePosition: "center 42%",
    imageAlt:
      "Warehouse operator scanning stored inventory for stock control",
    icon: FaWarehouse,
    accent: "from-amber-400 to-orange-600",
    color: "#f59e0b",
  },
  {
    id: "freight",
    title: "Freight Forwarding",
    eyebrow: "Forward",
    description:
      "Freight forwarders coordinate customs, vessel planning, port documents, and shipment milestones through closing.",
    metric: "Port to buyer",
    image:
      "https://images.pexels.com/photos/28438329/pexels-photo-28438329.jpeg?auto=compress&cs=tinysrgb&fit=crop&fm=webp&h=1280&w=1600",
    imagePosition: "center 42%",
    imageAlt:
      "Port crane transferring shipping containers onto a cargo vessel",
    icon: FaShip,
    accent: "from-lime-300 to-green-500",
    color: "#84cc16",
  },
] as const;

type Service = (typeof services)[number];

function RealisticServiceVisual({ service }: { service: Service }) {
  const Icon = service.icon;

  return (
    <motion.div
      key={service.id}
      className="absolute inset-0 overflow-hidden bg-black"
      initial={{ opacity: 0, scale: 1.06, filter: "blur(16px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.035, filter: "blur(12px)" }}
      transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.img
        key={service.image}
        src={service.image}
        alt={service.imageAlt}
        className="absolute inset-0 !h-full !w-full !max-w-none object-cover"
        style={{ objectPosition: service.imagePosition }}
        initial={{ scale: 1.04 }}
        animate={{ scale: 1 }}
        transition={{ duration: 5.2, ease: "easeOut" }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.48)_43%,rgba(0,0,0,0.1)_76%),linear-gradient(to_right,rgba(0,0,0,0.42),transparent_64%)]" />

      <div className="absolute right-6 top-8 hidden h-24 w-24 items-center justify-center rounded-[1.75rem] border border-white/15 bg-black/35 text-white/36 shadow-[0_0_34px_rgba(0,0,0,0.42)] backdrop-blur-md md:flex">
        <Icon size={58} />
      </div>

      <div className="absolute left-5 top-5 flex items-center gap-3 rounded-full border border-white/12 bg-black/42 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/64 shadow-lg shadow-black/20 backdrop-blur-md md:left-8 md:top-8">
        <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)]" />
        Indian Origin Operations
      </div>

      {service.id === "documentation" && (
        <div className="absolute right-7 top-28 hidden max-w-[210px] rounded-2xl border border-blue-300/35 bg-black/45 p-4 text-white/72 shadow-xl shadow-black/30 backdrop-blur-md md:block">
          <div className="flex items-center gap-3">
            <FiFileText size={24} className="text-blue-300" />
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em]">Trade File</span>
          </div>
          <div className="mt-4 space-y-2">
            {["PO", "PI", "COO"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                <span className="h-1.5 flex-1 rounded-full bg-white/18" />
                <span className="font-mono text-[8px] font-black text-white/45">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

const particleSeeds = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 29) % 100}%`,
  top: `${(index * 47) % 100}%`,
  size: 2 + (index % 4),
  delay: (index % 9) * 0.18,
  duration: 3.4 + (index % 6) * 0.36,
}));

export default function ServiceShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeService = services[activeIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % services.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [activeIndex]);

  const Icon = activeService.icon;

  const supportingServices = useMemo(
    () =>
      services.map((service, index) => ({
        ...service,
        isActive: index === activeIndex,
      })),
    [activeIndex],
  );

  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24">
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(249,115,22,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(249,115,22,0.1)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]" />
        {particleSeeds.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute rounded-full bg-orange-300/70 shadow-[0_0_14px_rgba(251,146,60,0.55)]"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              opacity: [0.08, 0.75, 0.08],
              y: [-8, 10, -8],
              scale: [0.8, 1.25, 0.8],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl xl:max-w-7xl px-6 sm:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <div className="lg:col-span-4 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <p className={homeTitleStyles.sectionKicker}>Execution Services</p>
              <h2 className={homeTitleStyles.sectionTitle}>
                Every role becomes visible.
              </h2>
              <p className="max-w-xl text-sm md:text-base text-foreground/60 font-medium leading-relaxed">
                A timed operations view shows the people and partners behind procurement, logistics, testing, packaging, warehousing, and freight forwarding.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
              {supportingServices.map((service, index) => {
                const ServiceIcon = service.icon;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`group flex min-h-[76px] flex-col justify-between rounded-2xl border px-3.5 py-3 text-left transition-all duration-500 ${
                      service.isActive
                        ? "border-orange-400/70 bg-orange-500/10 shadow-[0_0_26px_rgba(249,115,22,0.16)]"
                        : "border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.06]"
                    }`}
                    aria-pressed={service.isActive}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${service.accent} text-black shadow-lg shadow-black/20`}>
                        <ServiceIcon size={15} />
                      </span>
                      {service.isActive && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)]" />
                      )}
                    </div>
                    <p className="mt-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-foreground/80 leading-tight">
                      {service.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl shadow-orange-950/20 md:min-h-[620px]">
              <AnimatePresence mode="wait">
                <RealisticServiceVisual
                  key={activeService.id}
                  service={activeService}
                />
              </AnimatePresence>

              <div className="absolute inset-x-5 bottom-5 md:inset-x-8 md:bottom-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${activeService.accent} text-black shadow-xl`}>
                        <Icon size={22} />
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.38em] text-orange-300">
                        {activeService.eyebrow} / {activeService.metric}
                      </span>
                    </div>
                    <h3 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black leading-none tracking-normal text-white">
                      {activeService.title}
                    </h3>
                    <p className="mt-5 max-w-xl text-sm md:text-base font-medium leading-relaxed text-white/72">
                      {activeService.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="absolute bottom-8 right-8 hidden w-44 gap-2 md:flex">
                {services.map((service, index) => (
                  <span
                    key={service.id}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                      index === activeIndex ? "bg-orange-400" : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
