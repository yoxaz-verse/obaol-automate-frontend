"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function WhoCanUseObaol() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // SLOW, SOFT, CINEMATIC FADE
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [0, 1, 1, 0]
  );

  // COMING FROM BACK → GOING BACK
  const y = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [200, 0, 0, -200]
  );

  // DEPTH FEEL
  const scale = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [0.94, 1, 1, 0.94]
  );

  return (
    <motion.section
      ref={sectionRef}
      style={{
        opacity,
        y,
        scale,
        willChange: "transform, opacity",
      }}

      className="relative py-32 md:py-48 px-4 sm:px-6 bg-background border-t border-white/5 overflow-hidden"
    >
      {/* Deep ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-orange-400/5 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* SECTION HEADER – SEO + POSITIONING */}
        <header className="max-w-4xl mb-24 md:mb-32">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
          >
            Built to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Lower the Entry Barrier</span> to Commodity Trading
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 text-default-500 text-lg md:text-xl leading-relaxed"
          >
            Commodity trading has traditionally been difficult to enter —
            requiring capital, insider access, and years of informal experience.
            OBAOL changes this by turning trade execution into a structured
            system, not a capital-heavy gamble.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-default-400 text-base md:text-lg"
          >
            Participants can enter the ecosystem, learn how real trades work,
            and contribute value without needing upfront investment to start.
          </motion.p>
        </header>

        {/* ROLE / PARTICIPANT FLOWS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 relative">
          {/* Subtle line connecting cards */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2" />

          {/* NEW ENTRANTS – PRIMARY AUDIENCE */}
          <BenefitRow
            title="New Entrants to Commodity Trading"
            subtitle="Start without capital. Grow through execution."
            delay={0.1}
            points={[
              "Enter the commodity trade ecosystem without upfront capital requirements",
              "Learn real-world trade workflows through structured execution",
              "Participate via verification, coordination, services, or facilitation",
              "Build credibility and experience by contributing measurable value",
            ]}
          />

          <BenefitRow
            title="Buyers"
            subtitle="Source faster. Trade with confidence."
            delay={0.2}
            points={[
              "Access pre-verified suppliers without weeks of manual searching",
              "Reduce counterparty risk through standardized trade workflows",
              "Execute trades faster with integrated documentation and logistics",
            ]}
          />

          <BenefitRow
            title="Suppliers"
            subtitle="Reach genuine demand. Reduce wasted effort."
            delay={0.3}
            points={[
              "Engage only with serious, verified buyers",
              "Showcase available stock, capacity, and certifications clearly",
              "Close deals faster without repeated manual verification",
            ]}
          />

          <BenefitRow
            title="Packaging Providers"
            subtitle="Turn operational capability into revenue."
            delay={0.4}
            points={[
              "Present packaging services directly within trade flows",
              "Get engaged only when packaging is actually required",
              "Create recurring service revenue natively",
            ]}
          />

          <BenefitRow
            title="Logistics Partners"
            subtitle="Convert capacity into consistent business."
            delay={0.5}
            points={[
              "Offer transport services aligned with real shipment requirements",
              "Receive clear timelines, destinations, and readiness signals",
              "Generate revenue without chasing fragmented leads",
            ]}
          />

          <BenefitRow
            title="Procurement Agents"
            subtitle="Execute on-ground work with clarity."
            delay={0.6}
            points={[
              "Receive structured procurement and verification assignments",
              "Perform stock checks, quality verification, and confirmations",
              "Act as trusted third-party representatives for buyers",
            ]}
          />

          <BenefitRow
            title="Trade Facilitators"
            subtitle="Manage complex trades with less friction."
            delay={0.7}
            points={[
              "Coordinate multi-party trades inside a single execution system",
              "Reduce miscommunication and operational overhead",
              "Deliver predictable outcomes with transparent tracking",
            ]}
          />

          <BenefitRow
            title="AI & Automation"
            subtitle="Integrate. Observe. Execute."
            delay={0.8}
            points={[
              "Integrate via APIs to monitor and automate trade workflows",
              "Trigger documentation, alerts, and reporting automatically",
              "Build intelligent execution logic on top of OBAOL",
            ]}
          />
        </div>

        {/* TRUST & CLARITY FOOTNOTE */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-4xl mt-32 mx-auto text-center p-8 rounded-2xl bg-white/[0.01] border border-white/5"
        >
          <p className="text-default-400 text-sm leading-relaxed">
            <span className="text-orange-400/80 font-semibold uppercase tracking-widest block mb-2 text-xs">The OBAOL Standard</span>
            OBAOL does not promise shortcuts or guaranteed profits. It provides
            a standardized system where participants earn by executing real work
            — sourcing, verifying, packaging, transporting, coordinating, and
            managing commodity trades — instead of relying on speculation or
            informal networks.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ---------- SUPPORTING COMPONENT ---------- */

function BenefitRow({
  title,
  subtitle,
  points,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  points: string[];
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 relative overflow-hidden"
    >
      {/* Subtle hover glow inside card */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/0 max-w-full rounded-full blur-[50px] group-hover:bg-orange-400/10 transition-colors duration-700 pointer-events-none" />

      {/* HEADER */}
      <div className="mb-6 relative z-10">
        <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{title}</h3>
        <p className="mt-2 text-sm font-medium tracking-wide text-orange-400/90">{subtitle}</p>
      </div>

      {/* POINTS */}
      <ul className="space-y-4 relative z-10">
        {points.map((point, i) => (
          <li key={i} className="flex items-start text-sm text-default-400 group-hover:text-default-300 transition-colors leading-relaxed">
            <span className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400/50 shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
