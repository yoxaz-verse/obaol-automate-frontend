"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { FiCheckCircle, FiFileText, FiPackage, FiShoppingBag, FiTarget, FiTruck } from "react-icons/fi";
import { FaShip, FaWarehouse } from "react-icons/fa6";
import { homeTitleStyles } from "@/components/home/homeTitleStyles";
import { useAdaptiveMotion } from "@/hooks/useAdaptiveMotion";

export type ServiceChapter = {
  id: string;
  title: string;
  role: string;
  description: string;
  outcome: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  accent: string;
};

const services: readonly ServiceChapter[] = [
  { id: "sourcing", title: "Sourcing", role: "Origin discovery", description: "Find the exact product specifications and identify the best origins that match the buyer's unique requirements.", outcome: "Requirement matched to origin", image: "/images/services/sourcing-india.webp", imageAlt: "Agricultural specialist inspecting crops at origin", imagePosition: "center 42%", icon: FiTarget, accent: "#a78bfa" },
  { id: "documentation", title: "Documentation & Planning", role: "Trade readiness", description: "Prepare compliance documents, manage export paperwork, and systematically plan the execution logistics.", outcome: "Trade file ready for execution", image: "/images/services/documentation-india.webp", imageAlt: "Trade professionals reviewing shipment documentation", imagePosition: "center 38%", icon: FiFileText, accent: "#60a5fa" },
  { id: "procurement", title: "Procurement", role: "On-ground buying", description: "On-ground procurement partners inspect availability, negotiate readiness, and prepare confirmed lots for execution.", outcome: "Supply secured and purchase locked", image: "/images/services/procurement-india.webp", imageAlt: "Agricultural produce being prepared for procurement", imagePosition: "center 44%", icon: FiShoppingBag, accent: "#CF983C" },
  { id: "quality", title: "Quality Testing", role: "Independent verification", description: "Quality labs and verification operators test samples, validate specifications, and reduce uncertainty before shipment.", outcome: "Specifications verified before shipment", image: "/images/services/quality-india.webp", imageAlt: "Laboratory technician testing an agricultural sample", imagePosition: "center 42%", icon: FiCheckCircle, accent: "#34d399" },
  { id: "packaging", title: "Packaging", role: "Export preparation", description: "Packaging teams handle bags, cartons, labeling, and export-ready preparation based on buyer and commodity needs.", outcome: "Lots packed and load-ready", image: "/images/services/packaging-india.webp", imageAlt: "Agricultural goods being packaged for dispatch", imagePosition: "center 46%", icon: FiPackage, accent: "#fb7185" },
  { id: "logistics", title: "Logistics", role: "Inland coordination", description: "Truck operators, dispatch teams, and route handlers coordinate pickup, inland movement, and live shipment handoffs.", outcome: "Pickup moved reliably to port", image: "/images/services/logistics-india.webp", imageAlt: "Agricultural shipment moving through inland logistics", imagePosition: "center 40%", icon: FiTruck, accent: "#38bdf8" },
  { id: "warehouse", title: "Warehouse", role: "Stock control", description: "Warehouse operators manage capacity, stock visibility, staging, and release windows inside the execution flow.", outcome: "Inventory visible and dispatch-ready", image: "/images/services/warehouse-india-professional.webp", imageAlt: "Organized commercial warehouse with agricultural inventory", imagePosition: "center 42%", icon: FaWarehouse, accent: "#f59e0b" },
  { id: "freight", title: "Freight Forwarding", role: "International movement", description: "Freight forwarders coordinate customs, vessel planning, port documents, and shipment milestones through closing.", outcome: "Cargo cleared and moving to buyer", image: "/images/services/freight-india.webp", imageAlt: "Cargo containers being handled at an international port", imagePosition: "center 42%", icon: FaShip, accent: "#84cc16" },
] as const;

function Chapter({ service, index, active, showInlineMedia, onActivate }: { service: ServiceChapter; index: number; active: boolean; showInlineMedia: boolean; onActivate: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const Icon = service.icon;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onActivate();
    }, { rootMargin: "-35% 0px -45%", threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [onActivate]);

  return (
    <article ref={ref} data-service-chapter={service.id} className={`relative ${showInlineMedia ? "" : "lg:flex lg:min-h-[62vh] lg:items-center"}`}>
      <div className={`relative border-l pl-7 transition-colors duration-500 lg:py-16 ${active ? "border-obaol-400" : "border-default-200"}`}>
        <span className={`absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-4 border-background transition-colors lg:top-[4.25rem] ${active ? "bg-obaol-400 shadow-[0_0_18px_rgba(207,152,60,0.75)]" : "bg-default-300"}`} />
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-black text-obaol-600 dark:text-obaol-300">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45">{service.role}</span>
        </div>
        <h3 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">{service.title}</h3>
        <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-foreground/65 sm:text-base">{service.description}</p>
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-default-200/80 bg-content1/70 p-4 text-sm font-bold text-foreground/80">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-black" style={{ backgroundColor: service.accent }}><Icon size={16} /></span>
          <span className="pt-1.5">{service.outcome}</span>
        </div>

        <div className={`relative mt-7 aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-default-200 bg-black ${showInlineMedia ? "" : "lg:hidden"}`}>
          <Image src={service.image} alt={service.imageAlt} fill sizes="(max-width: 1023px) 90vw, 1px" className="object-cover" style={{ objectPosition: service.imagePosition }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">Indian origin operations</span>
        </div>
      </div>
    </article>
  );
}

export default function ServiceShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const adaptiveMotion = useAdaptiveMotion();
  const active = services[activeIndex];
  const ActiveIcon = active.icon;

  return (
    <section data-service-story="true" aria-labelledby="service-story-title" className="relative overflow-clip border-y border-default-200/60 bg-background py-16 md:py-24 public-standard-section">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(207,152,60,0.12),transparent_28%)]" />
      <div className="container relative z-10 mx-auto max-w-6xl px-6 sm:px-12 xl:max-w-7xl public-layout-container">
        <div className={`grid gap-12 lg:gap-16 ${adaptiveMotion.shouldReduceMotion ? "" : "lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]"}`}>
          <div>
            <div className="mb-10 space-y-5 lg:mb-2">
              <p className={homeTitleStyles.sectionKicker}>Execution Services</p>
              <h2 id="service-story-title" className={homeTitleStyles.sectionTitle}>Every role moves the same trade forward.</h2>
              <p className="max-w-xl text-base font-medium leading-relaxed text-foreground/65">Follow the people and partners behind sourcing, verification, preparation, storage, and movement—connected as one execution story.</p>
            </div>
            <div className="space-y-12 lg:space-y-0">
              {services.map((service, index) => (
                <Chapter key={service.id} service={service} index={index} active={index === activeIndex} showInlineMedia={adaptiveMotion.shouldReduceMotion} onActivate={() => setActiveIndex(index)} />
              ))}
            </div>
          </div>

          <div className={`relative ${adaptiveMotion.shouldReduceMotion ? "hidden" : "hidden lg:block"}`}>
            <div className="sticky top-28 h-[calc(100vh-9rem)] min-h-[540px] max-h-[760px] overflow-hidden rounded-[2rem] border border-obaol-500/20 bg-black shadow-[0_30px_90px_-45px_rgba(207,152,60,0.5)]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={active.id} className="absolute inset-0" initial={adaptiveMotion.shouldReduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={adaptiveMotion.shouldReduceMotion ? undefined : { opacity: 0 }} transition={{ duration: adaptiveMotion.shouldReduceMotion ? 0 : 0.45 }}>
                  <Image src={active.image} alt={active.imageAlt} fill sizes="(max-width: 1023px) 1px, 52vw" className="object-cover" style={{ objectPosition: active.imagePosition }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/15" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-7">
                <span className="rounded-full border border-white/15 bg-black/55 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">Indian origin operations</span>
                <span className="font-mono text-xs font-black text-white/60">{String(activeIndex + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}</span>
              </div>
              <div className="absolute inset-x-7 bottom-7 rounded-[1.5rem] border border-white/12 bg-black/62 p-6 text-white backdrop-blur-lg">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-black" style={{ backgroundColor: active.accent }}><ActiveIcon size={20} /></span>
                  <div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/45">Active chapter</p><p className="mt-1 text-2xl font-black">{active.title}</p></div>
                </div>
                <p className="mt-4 text-sm font-semibold text-white/72">Outcome: {active.outcome}</p>
                <div className="mt-5 flex gap-1.5" aria-hidden="true">{services.map((service, index) => <span key={service.id} className={`h-1 flex-1 rounded-full transition-colors ${index === activeIndex ? "bg-obaol-400" : "bg-white/20"}`} />)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
