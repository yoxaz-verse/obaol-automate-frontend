"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

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
    <section
      ref={sectionRef}
      className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 md:pt-36 md:pb-28 bg-background overflow-hidden public-standard-section"
    >
      {/* Deep ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] public-decoration" />
        <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-orange-400/5 blur-[150px] public-decoration" />
      </div>

      <div className="relative z-10 public-layout-container max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* SECTION HEADER – SEO + POSITIONING */}
        <header className="max-w-4xl mb-12 md:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground"
          >
            Built to Make <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-400">Bulk Trade Execution</span> More Accountable
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 text-default-500 text-lg md:text-xl leading-relaxed"
          >
            OBAOL Supreme is an India-first B2B bulk trade execution platform
            for registered companies coordinating domestic and international
            agricultural commodity trade.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-default-600 text-base md:text-lg"
          >
            It connects requirements, supply responses, company context,
            samples, documents, procurement, packaging, quality, warehousing,
            logistics, customs, and closure in a shared operating environment.
          </motion.p>
        </header>

        {/* ROLE / PARTICIPANT FLOWS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 relative">
          {/* Subtle line connecting cards */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-default-200/20 -translate-x-1/2" />

          <BenefitRow
            title="Buyers, Importers & Procurement Companies"
            subtitle="Define demand and coordinate sourcing activity."
            delay={0.1}
            points={[
              "Record product, quantity, destination, timing, and delivery requirements",
              "Discover relevant supply and manage structured responses",
              "Coordinate buyer-side documents, decisions, and execution handoffs",
            ]}
          />

          <BenefitRow
            title="Suppliers, Exporters & Traders"
            subtitle="Present capabilities and respond to genuine requirements."
            delay={0.2}
            points={[
              "Maintain accurate product, supply, origin, and company information",
              "Respond against requirements the business can substantiate",
              "Coordinate samples, quality, documents, readiness, and dispatch",
            ]}
          />

          <BenefitRow
            title="Packaging, Quality, Warehouse & Logistics Companies"
            subtitle="Support physical execution with visible capabilities."
            delay={0.3}
            points={[
              "Record service capabilities, locations, facilities, and credentials",
              "Review requirements linked to active execution workflows",
              "Coordinate service milestones and operational handoffs",
            ]}
          />

          <BenefitRow
            title="Freight Forwarders & Customs Agencies"
            subtitle="Keep shipment and clearance work connected to the trade."
            delay={0.4}
            points={[
              "Review route, cargo, port, schedule, and document context",
              "Coordinate bookings, filings, status, and partner handoffs",
              "Maintain shipment or clearance milestones in the execution record",
            ]}
          />

          <BenefitRow
            title="Finance, Insurance & Technology Partners"
            subtitle="Support eligible trades through specialist capabilities."
            delay={0.5}
            points={[
              "Describe supported markets, products, and assessment requirements",
              "Review authorized trade context under provider-led processes",
              "Coordinate decisions, documents, or approved integrations",
            ]}
          />

          <BenefitRow
            title="Operators for Registered Organizations"
            subtitle="Coordinate work on behalf of an accountable company."
            delay={0.6}
            points={[
              "Maintain enquiries, documents, tasks, and company information",
              "Coordinate internal and external participants against assigned work",
              "Keep decisions, exceptions, and next actions visible",
            ]}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 flex justify-center"
        >
          <Link
            href="/roles"
            className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-orange-600 px-7 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Explore All Platform Roles
            <FiArrowRight
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>

        {/* TRUST & CLARITY FOOTNOTE */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-4xl mt-32 mx-auto text-center p-8 rounded-2xl bg-default-50/[0.03] border border-default-200/30"
        >
          <p className="text-foreground/70 text-sm leading-relaxed">
            <span className="text-orange-400/80 font-semibold uppercase tracking-widest block mb-2 text-xs">The OBAOL Standard</span>
            OBAOL supports coordination but does not guarantee transactions,
            demand, supply, assignments, financing, insurance, delivery, quality,
            or commercial outcomes. Registered companies remain responsible for
            their decisions, diligence, licenses, contracts, and regulated work.
          </p>
        </motion.div>
      </div>
    </section>
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
      className="group p-8 rounded-3xl bg-white/[0.02] border border-default-200/50 backdrop-blur-xl hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden public-surface-card"
    >
      {/* Subtle border accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.02] max-w-full rounded-full blur-[40px] pointer-events-none public-decoration" />

      {/* HEADER */}
      <div className="mb-6 relative z-10">
        <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{title}</h3>
        <p className="mt-2 text-sm font-medium tracking-wide text-orange-400/90">{subtitle}</p>
      </div>

      {/* POINTS */}
      <ul className="space-y-4 relative z-10">
        {points.map((point, i) => (
          <li key={i} className="flex items-start text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors leading-relaxed">
            <span className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400/50 shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
