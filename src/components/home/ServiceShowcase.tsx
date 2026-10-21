"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ComponentType, type RefCallback } from "react";
import { FiCheckCircle, FiFileText, FiPackage, FiSearch, FiShoppingBag, FiTarget, FiTruck } from "react-icons/fi";
import { FaShip, FaWarehouse } from "react-icons/fa6";
import { homeTitleStyles } from "@/components/home/homeTitleStyles";
import { useAdaptiveMotion } from "@/hooks/useAdaptiveMotion";
import ParallaxTradeAccents from "@/components/home/ParallaxTradeAccents";

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

function DesktopChapter({ service, index, active, chapterRef }: { service: ServiceChapter; index: number; active: boolean; chapterRef: RefCallback<HTMLElement> }) {
  const Icon = service.icon;

  return (
    <article ref={chapterRef} data-service-chapter={service.id} className="relative flex min-h-[72svh] items-center">
      <div className={`relative border-l py-16 pl-7 transition-colors duration-500 ${active ? "border-obaol-400" : "border-default-200"}`}>
        <span className={`absolute -left-[7px] top-[4.25rem] h-3.5 w-3.5 rounded-full border-4 border-background transition-colors ${active ? "bg-obaol-400 shadow-[0_0_18px_rgba(207,152,60,0.75)]" : "bg-default-300"}`} />
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-black text-obaol-600 dark:text-obaol-300">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45">{service.role}</span>
        </div>
        <h3 className="mt-3 text-4xl font-black tracking-tight text-foreground">{service.title}</h3>
        <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-foreground/65">{service.description}</p>
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-default-200/80 bg-content1/70 p-4 text-sm font-bold text-foreground/80">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-black" style={{ backgroundColor: service.accent }}><Icon size={16} /></span>
          <span className="pt-1.5">{service.outcome}</span>
        </div>
      </div>
    </article>
  );
}

export default function ServiceShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const adaptiveMotion = useAdaptiveMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const desktopStoryRef = useRef<HTMLDivElement>(null);
  const chapterNodesRef = useRef<Array<HTMLElement | null>>([]);
  const puzzleInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const active = services[activeIndex];
  const ActiveIcon = active.icon;
  const orderedServices = useMemo(() => [active, ...services.filter((_, index) => index !== activeIndex)], [active, activeIndex]);
  const chapterRefSetters = useMemo(
    () => services.map((_, index): RefCallback<HTMLElement> => (node) => { chapterNodesRef.current[index] = node; }),
    [],
  );
  const puzzleAssembled = adaptiveMotion.prefersReducedMotion || puzzleInView;

  useEffect(() => {
    if (adaptiveMotion.isMobile) return;
    const story = desktopStoryRef.current;
    if (!story) return;

    let frameId = 0;
    let tracking = false;
    const update = () => {
      frameId = 0;
      const nodes = chapterNodesRef.current.filter((node): node is HTMLElement => node !== null);
      if (nodes.length !== services.length) return;
      const activationLine = window.innerHeight * 0.45;
      const storyRect = story.getBoundingClientRect();
      let nextIndex = 0;
      if (storyRect.bottom <= activationLine) nextIndex = services.length - 1;
      else if (storyRect.top < activationLine) {
        let nearestDistance = Number.POSITIVE_INFINITY;
        nodes.forEach((node, index) => {
          const rect = node.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - activationLine);
          if (distance < nearestDistance) { nearestDistance = distance; nextIndex = index; }
        });
      }
      setActiveIndex((current) => current === nextIndex ? current : nextIndex);
    };
    const schedule = () => { if (tracking && !frameId) frameId = window.requestAnimationFrame(update); };
    const start = () => {
      if (tracking) return;
      tracking = true;
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      schedule();
    };
    const stop = () => {
      if (!tracking) return;
      tracking = false;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    };
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting ? start() : stop(), { rootMargin: "100px 0px" });
    observer.observe(story);
    return () => { observer.disconnect(); stop(); };
  }, [adaptiveMotion.isMobile]);

  return (
    <section ref={sectionRef} data-service-showcase="true" aria-labelledby="service-showcase-title" className="relative overflow-clip border-y border-default-200/60 bg-background py-14 md:py-20 public-standard-section">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(207,152,60,0.1),transparent_28%),radial-gradient(circle_at_86%_78%,rgba(96,165,250,0.07),transparent_24%)]" />
      <ParallaxTradeAccents placement="services" />
      <div className="container relative z-30 mx-auto max-w-6xl px-6 sm:px-12 xl:max-w-7xl public-layout-container">
        <div className="mb-9 grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end lg:gap-14">
          <div>
            <p className={homeTitleStyles.sectionKicker}>Connected Execution Network</p>
            <h2 id="service-showcase-title" className={`${homeTitleStyles.sectionTitle} mt-4`}>Different specialists. One connected trade.</h2>
          </div>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-foreground/65 sm:text-base"><span className="lg:hidden">Select a piece to see how each specialist completes a distinct part of the trade. </span><span className="hidden lg:inline">Follow the trade as each specialist completes a distinct part of the journey. </span>OBAOL connects the work without replacing the people performing it.</p>
        </div>

        <div data-service-mobile-puzzle="true" data-service-puzzle="true" data-puzzle-assembled={puzzleAssembled ? "true" : "false"} className="lg:hidden">
        <div data-service-puzzle-grid="true" data-mobile-layout="irregular" className="grid grid-flow-dense grid-cols-2 auto-rows-[96px] gap-2.5 sm:auto-rows-[118px] sm:gap-3">
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

        <div ref={desktopStoryRef} data-service-desktop-story="true" className="hidden gap-20 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            {services.map((service, index) => (
              <DesktopChapter key={service.id} service={service} index={index} active={index === activeIndex} chapterRef={chapterRefSetters[index]} />
            ))}
          </div>
          <div className="relative">
            <div data-active-service={active.id} className="sticky top-28 h-[calc(100svh-12rem)] min-h-[480px] max-h-[650px]">
              <div
                data-service-background-wash="true"
                className="absolute inset-0 overflow-hidden"
                style={{
                  WebkitMaskImage: "radial-gradient(ellipse 78% 84% at 52% 50%, black 48%, rgba(0,0,0,0.9) 63%, transparent 100%)",
                  maskImage: "radial-gradient(ellipse 78% 84% at 52% 50%, black 48%, rgba(0,0,0,0.9) 63%, transparent 100%)",
                }}
              >
                {services.map((service, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <div key={service.id} data-service-artwork-layer="true" aria-hidden={!isActive} className={`absolute inset-0 transition-[opacity,filter,transform] ease-out ${adaptiveMotion.prefersReducedMotion ? "duration-0" : "duration-[550ms]"} ${isActive ? "z-[1] scale-100 opacity-100 blur-0" : "z-0 scale-[1.015] opacity-0 blur-[2px]"}`}>
                      <Image src={service.image} alt={isActive ? service.imageAlt : ""} aria-hidden={!isActive} fill priority={index === 0} sizes="(max-width: 1023px) 1px, 52vw" className="object-cover opacity-75 saturate-[0.82] contrast-[0.92]" style={{ objectPosition: service.imagePosition }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-background/15" />
                    </div>
                  );
                })}
              </div>
              <div data-service-overlay-meta="true" className="absolute inset-x-[7%] top-[8%] z-10 flex items-center justify-between text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.75)]">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Indian origin operations</span>
                <span className="font-mono text-xs font-black text-white/70">{String(activeIndex + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}</span>
              </div>
              <div data-service-overlay-chapter="true" className="absolute inset-x-[7%] bottom-[8%] z-10 text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-black" style={{ backgroundColor: active.accent }}><ActiveIcon size={20} /></span>
                  <div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/55">Active chapter</p><p className="mt-1 text-2xl font-black">{active.title}</p></div>
                </div>
                <p className="mt-4 text-sm font-semibold text-white/80">Outcome: {active.outcome}</p>
                <div className="mt-5 flex gap-1.5" aria-hidden="true">{services.map((service, index) => <span key={service.id} className={`h-1 flex-1 rounded-full transition-colors ${index === activeIndex ? "bg-obaol-400" : "bg-white/20"}`} />)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
