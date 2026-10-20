"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ComponentType, type RefCallback } from "react";
import { FiCheckCircle, FiFileText, FiPackage, FiSearch, FiShoppingBag, FiTarget, FiTruck } from "react-icons/fi";
import { FaShip, FaWarehouse } from "react-icons/fa6";
import { homeTitleStyles } from "@/components/home/homeTitleStyles";
import { spaciousInkArtworkMaskStyle } from "@/components/home/inkArtworkMask";
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

function Chapter({ service, index, active, chapterRef }: { service: ServiceChapter; index: number; active: boolean; chapterRef: RefCallback<HTMLElement> }) {
  const Icon = service.icon;

  return (
    <article ref={chapterRef} data-service-chapter={service.id} className="relative lg:flex lg:min-h-[72svh] lg:items-center">
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

        <div className="relative mt-7 aspect-[4/3] lg:hidden">
          <div data-ink-artwork-mask="spacious" style={spaciousInkArtworkMaskStyle} className="absolute inset-[3%] overflow-hidden">
            <Image src={service.image} alt={service.imageAlt} fill sizes="(max-width: 1023px) 90vw, 1px" className="object-cover" style={{ objectPosition: service.imagePosition }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>
          <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">Indian origin operations</span>
        </div>
      </div>
    </article>
  );
}

export default function ServiceShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [introStatus, setIntroStatus] = useState<"waiting" | "playing" | "complete">("waiting");
  const adaptiveMotion = useAdaptiveMotion();
  const adaptiveMotionRef = useRef(adaptiveMotion);
  const sectionRef = useRef<HTMLElement>(null);
  const introTriggerRef = useRef<HTMLDivElement>(null);
  const chapterNodesRef = useRef<Array<HTMLElement | null>>([]);
  const chapterRefSetters = useMemo(
    () => services.map((_, index): RefCallback<HTMLElement> => (node) => {
      chapterNodesRef.current[index] = node;
    }),
    [],
  );
  const active = services[activeIndex];
  const ActiveIcon = active.icon;

  useEffect(() => {
    adaptiveMotionRef.current = adaptiveMotion;
  }, [adaptiveMotion]);

  useEffect(() => {
    if (introStatus !== "playing") return;

    const completionTimer = window.setTimeout(
      () => setIntroStatus("complete"),
      adaptiveMotionRef.current.shouldReduceMotion ? 800 : 1900,
    );
    return () => window.clearTimeout(completionTimer);
  }, [introStatus]);

  useEffect(() => {
    const introTrigger = introTriggerRef.current;
    if (!introTrigger || introStatus !== "waiting") return;

    if (adaptiveMotion.prefersReducedMotion) {
      setIntroStatus("complete");
      return;
    }

    const introObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      introObserver.disconnect();
      setIntroStatus("playing");
    }, { threshold: 0.35, rootMargin: "0px 0px -8%" });

    introObserver.observe(introTrigger);
    return () => introObserver.disconnect();
  }, [adaptiveMotion.prefersReducedMotion, introStatus]);

  useEffect(() => {
    if (adaptiveMotion.isMobile) return;

    const section = sectionRef.current;
    if (!section) return;

    let frameId = 0;
    let isTracking = false;

    const updateActiveChapter = () => {
      frameId = 0;
      const nodes = chapterNodesRef.current.filter((node): node is HTMLElement => node !== null);
      if (nodes.length !== services.length) return;

      const activationLine = window.innerHeight * 0.45;
      const sectionRect = section.getBoundingClientRect();
      let nextIndex = 0;

      if (sectionRect.bottom <= activationLine) {
        nextIndex = services.length - 1;
      } else if (sectionRect.top < activationLine) {
        let nearestDistance = Number.POSITIVE_INFINITY;
        nodes.forEach((node, index) => {
          const rect = node.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - activationLine);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nextIndex = index;
          }
        });
      }

      setActiveIndex((current) => current === nextIndex ? current : nextIndex);
    };

    const scheduleUpdate = () => {
      if (!isTracking || frameId) return;
      frameId = window.requestAnimationFrame(updateActiveChapter);
    };

    const startTracking = () => {
      if (isTracking) return;
      isTracking = true;
      window.addEventListener("scroll", scheduleUpdate, { passive: true });
      window.addEventListener("resize", scheduleUpdate);
      scheduleUpdate();
    };

    const stopTracking = () => {
      if (!isTracking) return;
      isTracking = false;
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const sectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startTracking();
      else stopTracking();
    }, { rootMargin: "100px 0px" });

    sectionObserver.observe(section);
    return () => {
      sectionObserver.disconnect();
      stopTracking();
    };
  }, [adaptiveMotion.isMobile]);

  return (
    <section ref={sectionRef} data-service-story="true" data-service-intro-status={introStatus} aria-labelledby="service-story-title" className="relative overflow-clip border-y border-default-200/60 bg-background py-16 md:py-24 public-standard-section">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(207,152,60,0.12),transparent_28%)]" />
      {introStatus === "playing" && (
        <motion.div
          data-service-intro-layer="dream"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: adaptiveMotionRef.current.shouldReduceMotion ? 0.75 : 1.8, times: [0, 0.16, 0.62, 1], ease: "easeInOut" }}
          onAnimationComplete={() => setIntroStatus("complete")}
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden bg-[rgba(249,247,242,0.9)] dark:bg-[rgba(12,11,9,0.9)]"
        >
          <motion.div
            initial={adaptiveMotionRef.current.shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.08, filter: "blur(16px) saturate(0.78)" }}
            animate={adaptiveMotionRef.current.shouldReduceMotion ? { opacity: [0, 0.38, 0] } : { opacity: [0, 0.68, 0.56, 0], scale: [1.08, 1.03, 1, 1], filter: ["blur(16px) saturate(0.78)", "blur(5px) saturate(0.9)", "blur(0px) saturate(0.96)", "blur(2px) saturate(0.96)"] }}
            transition={{ duration: adaptiveMotionRef.current.shouldReduceMotion ? 0.75 : 1.8, times: adaptiveMotionRef.current.shouldReduceMotion ? [0, 0.45, 1] : [0, 0.35, 0.72, 1], ease: "easeOut" }}
            className="absolute inset-[-5%]"
          >
            <div data-ink-artwork-mask="spacious" style={spaciousInkArtworkMaskStyle} className="absolute inset-[4%] overflow-hidden opacity-75">
              <Image src={services[0].image} alt="" fill priority sizes="100vw" className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/25 to-background/65" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.72, 0.45, 0] }} transition={{ duration: 1.8, times: [0, 0.28, 0.72, 1] }} className="absolute -left-[8%] top-[6%] h-[70%] w-[58%] rounded-full bg-amber-300/25 blur-[90px] dark:bg-amber-500/15" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0.32, 0] }} transition={{ duration: 1.8, times: [0, 0.32, 0.72, 1] }} className="absolute -right-[8%] bottom-[3%] h-[62%] w-[52%] rounded-full bg-violet-300/25 blur-[100px] dark:bg-violet-500/15" />
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <motion.p
              initial={{ opacity: 0, y: adaptiveMotionRef.current.shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: [0, 1, 1, 0], y: adaptiveMotionRef.current.shouldReduceMotion ? 0 : [10, 0, 0, -4] }}
              transition={{ duration: adaptiveMotionRef.current.shouldReduceMotion ? 0.75 : 1.65, times: [0, 0.28, 0.7, 1], ease: "easeOut" }}
              className="max-w-3xl text-2xl font-semibold tracking-[-0.025em] text-foreground/85 drop-shadow-sm sm:text-4xl lg:text-5xl"
            >
              Every trade begins as a possibility
            </motion.p>
          </div>
        </motion.div>
      )}
      <motion.div
        data-service-intro-content="true"
        initial={false}
        animate={introStatus === "complete" ? { opacity: 1, y: 0, filter: "blur(0px)" } : introStatus === "playing" ? { opacity: [0.72, 0.84, 1], y: adaptiveMotion.shouldReduceMotion ? 0 : [8, 4, 0], filter: adaptiveMotion.shouldReduceMotion ? "blur(0px)" : ["blur(4px)", "blur(2px)", "blur(0px)"] } : { opacity: 0.72, y: adaptiveMotion.shouldReduceMotion ? 0 : 8, filter: adaptiveMotion.shouldReduceMotion ? "blur(0px)" : "blur(4px)" }}
        transition={{ duration: adaptiveMotion.shouldReduceMotion ? 0.35 : 1.15, delay: introStatus === "playing" && !adaptiveMotion.shouldReduceMotion ? 0.55 : 0, ease: [0.22, 1, 0.36, 1] }}
        className="container relative z-10 mx-auto max-w-6xl px-6 sm:px-12 xl:max-w-7xl public-layout-container"
      >
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <div ref={introTriggerRef} data-service-intro-trigger="true" className="mb-10 space-y-5 lg:mb-2">
              <p className={homeTitleStyles.sectionKicker}>Connected Execution Network</p>
              <h2 id="service-story-title" className={homeTitleStyles.sectionTitle}>Different specialists. One connected trade.</h2>
              <p className="max-w-xl text-base font-medium leading-relaxed text-foreground/65">Discovery starts the trade, then buyers, suppliers, and specialist partners each perform their own work. OBAOL connects the handoffs, records, and progress—it does not replace them.</p>
            </div>
            <div className="space-y-12 lg:space-y-0">
              {services.map((service, index) => (
                <Chapter key={service.id} service={service} index={index} active={index === activeIndex} chapterRef={chapterRefSetters[index]} />
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div data-active-service={active.id} className="sticky top-28 h-[calc(100svh-12rem)] min-h-[480px] max-h-[650px]">
              <div className="pointer-events-none absolute inset-[8%] rounded-full bg-obaol-400/10 blur-3xl dark:bg-obaol-400/[0.08]" />
              {services.map((service, index) => {
                const isActive = index === activeIndex;
                return (
                <div key={service.id} data-service-artwork-layer="true" data-ink-artwork-mask="spacious" aria-hidden={!isActive} style={spaciousInkArtworkMaskStyle} className={`absolute inset-[4%] overflow-hidden transition-[opacity,filter] ease-out ${adaptiveMotion.prefersReducedMotion ? "duration-0" : "duration-[550ms]"} ${isActive ? "z-[1] opacity-100 blur-0 saturate-100" : "z-0 opacity-0 blur-[2px] saturate-[0.92]"}`}>
                  <Image src={service.image} alt={isActive ? service.imageAlt : ""} aria-hidden={!isActive} fill priority={index === 0} sizes="(max-width: 1023px) 1px, 52vw" className="object-cover" style={{ objectPosition: service.imagePosition }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/15" />
                </div>
                );
              })}
              <div className="absolute inset-x-[4%] top-[3%] z-10 flex items-center justify-between px-9 py-8">
                <span className="rounded-full border border-white/15 bg-black/55 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">Indian origin operations</span>
                <span className="font-mono text-xs font-black text-white/60">{String(activeIndex + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}</span>
              </div>
              <div className="absolute inset-x-12 bottom-7 z-10 rounded-[1.5rem] border border-white/12 bg-black/62 p-5 text-white shadow-[0_18px_48px_-28px_rgba(0,0,0,0.9)] backdrop-blur-lg">
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
      </motion.div>
    </section>
  );
}
