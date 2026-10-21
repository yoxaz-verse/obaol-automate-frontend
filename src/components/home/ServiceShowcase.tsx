"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useMemo, useRef, useState, type ComponentType } from "react";
import { FiCheckCircle, FiFileText, FiPackage, FiSearch, FiShoppingBag, FiTarget, FiTruck } from "react-icons/fi";
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
  { id: "discovery", title: "Discovery", role: "Buyer and supplier matching", description: "Buyers publish requirements and find relevant products, suppliers, and service partners through the OBAOL network.", outcome: "Right participants identified", image: "/images/execution-flow/01-discovery-art-v2.webp", imageAlt: "Expressive ink-and-watercolor artwork of an OBAOL trading panel used to discover products, suppliers, and specialist service partners", imagePosition: "center", icon: FiSearch, accent: "#fbbf24" },
  { id: "sourcing", title: "Sourcing", role: "Sourcing partners", description: "Sourcing partners match exact product specifications with suitable origins and suppliers for the buyer's requirements.", outcome: "Requirement matched to origin", image: "/images/services/sourcing-trade-art-v2.webp", imageAlt: "Expressive ink-and-watercolor artwork of an Indian sourcing team inspecting commercial spice samples and recording specifications on a tablet", imagePosition: "center 42%", icon: FiTarget, accent: "#a78bfa" },
  { id: "documentation", title: "Documentation & Planning", role: "Documentation specialists", description: "Documentation specialists prepare compliance records, manage export paperwork, and plan the execution requirements.", outcome: "Trade file ready for execution", image: "/images/services/documentation-trade-art-v2.webp", imageAlt: "Expressive ink-and-watercolor artwork of Indian trade operations professionals coordinating shipment documents in a modern export office", imagePosition: "center 40%", icon: FiFileText, accent: "#60a5fa" },
  { id: "procurement", title: "Procurement", role: "Procurement partners", description: "Procurement partners inspect availability, negotiate readiness, and prepare confirmed lots for execution.", outcome: "Supply secured and purchase locked", image: "/images/services/procurement-trade-art-v2.webp", imageAlt: "Expressive ink-and-watercolor artwork of a procurement operator and supplier verifying a weighed commodity lot at an organized collection facility", imagePosition: "center 43%", icon: FiShoppingBag, accent: "#CF983C" },
  { id: "quality", title: "Quality Testing", role: "Independent labs", description: "Independent labs and verification operators test samples, validate specifications, and reduce uncertainty before shipment.", outcome: "Specifications verified before shipment", image: "/images/services/quality-trade-art-v2.webp", imageAlt: "Expressive ink-and-watercolor artwork of a food laboratory technician testing grain and spice samples with professional equipment and PPE", imagePosition: "center 42%", icon: FiCheckCircle, accent: "#34d399" },
  { id: "packaging", title: "Packaging", role: "Packaging providers", description: "Packaging providers handle bags, cartons, labeling, and export-ready preparation based on buyer and commodity needs.", outcome: "Lots packed and load-ready", image: "/images/services/packaging-trade-art-v2.webp", imageAlt: "Expressive ink-and-watercolor artwork of an Indian packaging team weighing, sealing, and palletizing agricultural commodities in a hygienic facility", imagePosition: "center 43%", icon: FiPackage, accent: "#fb7185" },
  { id: "logistics", title: "Logistics", role: "Transport partners", description: "Transport partners and dispatch teams coordinate pickup, inland movement, and live shipment handoffs.", outcome: "Pickup moved reliably to port", image: "/images/services/logistics-trade-art-v2.webp", imageAlt: "Expressive ink-and-watercolor artwork of dispatch professionals coordinating trucks, forklifts, and palletized cargo between warehouse and port", imagePosition: "center 43%", icon: FiTruck, accent: "#38bdf8" },
  { id: "warehouse", title: "Warehouse", role: "Warehouse operators", description: "Warehouse operators manage capacity, stock visibility, staging, and release windows inside the execution flow.", outcome: "Inventory visible and dispatch-ready", image: "/images/services/warehouse-trade-art-v2.webp", imageAlt: "Expressive ink-and-watercolor artwork of an inventory team scanning organized agricultural stock in a modern Indian commodity warehouse", imagePosition: "center 41%", icon: FaWarehouse, accent: "#f59e0b" },
  { id: "freight", title: "Freight Forwarding", role: "Freight forwarders", description: "Freight forwarders coordinate customs, vessel planning, port documents, and shipment milestones through closing.", outcome: "Cargo cleared and moving to buyer", image: "/images/services/freight-trade-art-v2.webp", imageAlt: "Expressive ink-and-watercolor artwork of freight professionals coordinating container and vessel operations at an international terminal", imagePosition: "center 42%", icon: FaShip, accent: "#84cc16" },
] as const;

const fragmentLayouts = [
  "col-span-1 row-span-2 lg:col-span-3 lg:row-span-2",
  "col-span-1 row-span-1 lg:col-span-2 lg:row-span-1",
  "col-span-1 row-span-1 lg:col-span-2 lg:row-span-2",
  "col-span-2 row-span-1 lg:col-span-3 lg:row-span-1",
  "col-span-1 row-span-1 lg:col-span-2 lg:row-span-1",
  "col-span-1 row-span-2 lg:col-span-3 lg:row-span-2",
  "col-span-1 row-span-2 lg:col-span-2 lg:row-span-2",
  "col-span-1 row-span-1 lg:col-span-3 lg:row-span-1",
] as const;

const fragmentPositions = ["20% 35%", "72% 30%", "35% 70%", "80% 55%", "18% 68%", "62% 72%", "42% 28%", "84% 76%"] as const;

export default function ServiceShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const adaptiveMotion = useAdaptiveMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const puzzleInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const active = services[activeIndex];
  const orderedServices = useMemo(() => [active, ...services.filter((_, index) => index !== activeIndex)], [active, activeIndex]);
  const puzzleAssembled = adaptiveMotion.prefersReducedMotion || puzzleInView;

  return (
    <section ref={sectionRef} data-service-puzzle="true" data-puzzle-assembled={puzzleAssembled ? "true" : "false"} aria-labelledby="service-puzzle-title" className="relative overflow-clip border-y border-default-200/60 bg-background py-14 md:py-20 public-standard-section">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(207,152,60,0.1),transparent_28%),radial-gradient(circle_at_86%_78%,rgba(96,165,250,0.07),transparent_24%)]" />
      <div className="container relative z-10 mx-auto max-w-6xl px-6 sm:px-12 xl:max-w-7xl public-layout-container">
        <div className="mb-9 grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end lg:gap-14">
          <div>
            <p className={homeTitleStyles.sectionKicker}>Connected Execution Network</p>
            <h2 id="service-puzzle-title" className={`${homeTitleStyles.sectionTitle} mt-4`}>Different specialists. One connected trade.</h2>
          </div>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-foreground/65 sm:text-base">Select a piece to see how each specialist completes a distinct part of the trade. OBAOL connects the work without replacing the people performing it.</p>
        </div>

        <div data-service-puzzle-grid="true" data-mobile-layout="irregular" className="grid grid-flow-dense grid-cols-2 auto-rows-[96px] gap-2.5 sm:auto-rows-[118px] sm:gap-3 lg:grid-cols-12 lg:auto-rows-[112px] lg:gap-4">
          {orderedServices.map((service, position) => {
            const serviceIndex = services.findIndex((item) => item.id === service.id);
            const isSelected = serviceIndex === activeIndex;
            const Icon = service.icon;
            const fragmentIndex = Math.max(0, position - 1);
            const pieceClass = isSelected
              ? "col-span-2 row-span-3 sm:row-span-3 lg:col-span-7 lg:row-span-4"
              : fragmentLayouts[fragmentIndex];

            return (
              <motion.button
                layout={!adaptiveMotion.prefersReducedMotion}
                key={service.id}
                type="button"
                data-service-piece={service.id}
                data-service-selected={isSelected ? "true" : "false"}
                aria-pressed={isSelected}
                aria-controls="service-puzzle-details"
                aria-label={isSelected ? `Selected service: ${service.title}` : `View ${service.title} service`}
                onClick={() => setActiveIndex(serviceIndex)}
                initial={adaptiveMotion.prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
                animate={puzzleAssembled ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.96 }}
                transition={adaptiveMotion.prefersReducedMotion ? { duration: 0 } : { layout: { duration: 0.48, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.38, delay: position * 0.045 }, y: { duration: 0.48, delay: position * 0.045 }, scale: { duration: 0.48, delay: position * 0.045 } }}
                className={`group relative min-w-0 overflow-hidden border text-left shadow-[0_18px_50px_-34px_rgba(15,23,42,0.6)] outline-none transition-[border-color,box-shadow] focus-visible:ring-2 focus-visible:ring-obaol-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${pieceClass} ${isSelected ? "rounded-[1.65rem] border-obaol-400/45 sm:rounded-[2rem]" : "rounded-[1.15rem] border-white/20 hover:border-obaol-400/55 sm:rounded-[1.45rem]"}`}
              >
                <Image
                  src={service.image}
                  alt={isSelected ? service.imageAlt : ""}
                  fill
                  priority={serviceIndex === 0}
                  sizes={isSelected ? "(max-width: 1023px) 100vw, 58vw" : "(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 24vw"}
                  data-service-partial-image={isSelected ? "false" : "true"}
                  className={`object-cover transition-transform duration-500 ${isSelected ? "scale-100" : "scale-[1.16] saturate-[0.88] group-hover:scale-[1.1]"}`}
                  style={{ objectPosition: isSelected ? service.imagePosition : fragmentPositions[fragmentIndex] }}
                />
                <div className={`absolute inset-0 ${isSelected ? "bg-gradient-to-t from-black via-black/30 to-black/10" : "bg-gradient-to-t from-black/90 via-black/25 to-black/5"}`} />

                {isSelected ? (
                  <div id="service-puzzle-details" className="absolute inset-x-0 bottom-0 z-10 p-5 text-white sm:p-7 lg:p-8">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-black sm:h-12 sm:w-12" style={{ backgroundColor: service.accent }}><Icon size={20} /></span>
                      <div className="min-w-0">
                        <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-white/60">{String(serviceIndex + 1).padStart(2, "0")} · {service.role}</p>
                        <h3 className="mt-1 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">{service.title}</h3>
                      </div>
                    </div>
                    <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-white/78 sm:text-base">{service.description}</p>
                    <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-xs font-bold text-white/88 backdrop-blur-md sm:text-sm">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: service.accent }} />
                      <span className="truncate">{service.outcome}</span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-x-0 bottom-0 z-10 p-3 text-white sm:p-4">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-[8px] font-black text-white/60 sm:text-[9px]">{String(serviceIndex + 1).padStart(2, "0")}</p>
                        <p className="mt-1 line-clamp-2 text-xs font-black leading-tight sm:text-sm">{service.title}</p>
                      </div>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-black" style={{ backgroundColor: service.accent }}><Icon size={14} /></span>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
        <p aria-live="polite" aria-atomic="true" className="sr-only">Selected service: {active.title}. {active.description} Outcome: {active.outcome}.</p>
      </div>
    </section>
  );
}
