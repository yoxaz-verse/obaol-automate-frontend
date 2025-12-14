"use client";

import { motion } from "framer-motion";

export default function WhoCanUseObaol() {
  return (
    <section className="py-28 sm:py-36 px-4 sm:px-6 bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* SECTION HEADER – SEO + POSITIONING */}
        <header className="max-w-4xl mb-24">
          <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
            Built to Lower the Entry Barrier to Commodity Trading
          </h2>

          <p className="mt-6 text-gray-300 text-base sm:text-lg">
            Commodity trading has traditionally been difficult to enter —
            requiring capital, insider access, and years of informal experience.
            OBAOL changes this by turning trade execution into a structured
            system, not a capital-heavy gamble.
          </p>

          <p className="mt-4 text-gray-400 text-sm sm:text-base">
            Participants can enter the ecosystem, learn how real trades work,
            and contribute value without needing upfront investment to start.
          </p>
        </header>

        {/* ROLE / PARTICIPANT FLOWS */}
        <div className="space-y-20">
          {/* NEW ENTRANTS – PRIMARY AUDIENCE */}
          <BenefitRow
            title="New Entrants to Commodity Trading"
            subtitle="Start without capital. Grow through execution."
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
            reverse
            points={[
              "Access pre-verified suppliers without weeks of manual searching",
              "Reduce counterparty risk through standardized trade workflows",
              "Execute trades faster with integrated documentation and logistics",
            ]}
          />

          <BenefitRow
            title="Suppliers"
            subtitle="Reach genuine demand. Reduce wasted effort."
            points={[
              "Engage only with serious, verified buyers",
              "Showcase available stock, capacity, and certifications clearly",
              "Close deals faster without repeated manual verification",
            ]}
          />

          <BenefitRow
            title="Packaging & Handling Providers"
            subtitle="Turn operational capability into revenue."
            reverse
            points={[
              "Present packaging and handling services directly within trade flows",
              "Get engaged only when packaging is actually required",
              "Create recurring service revenue without trading commodities yourself",
            ]}
          />

          <BenefitRow
            title="Logistics & Transport Partners"
            subtitle="Convert capacity into consistent business."
            points={[
              "Offer transport services aligned with real shipment requirements",
              "Receive clear timelines, destinations, and readiness signals",
              "Generate revenue without chasing fragmented or unreliable leads",
            ]}
          />

          <BenefitRow
            title="Procurement Agents"
            subtitle="Execute on-ground work with clarity."
            reverse
            points={[
              "Receive structured procurement and verification assignments",
              "Perform stock checks, quality verification, and confirmations",
              "Act as trusted third-party representatives for buyers",
            ]}
          />

          <BenefitRow
            title="Exporters & Trade Facilitators"
            subtitle="Manage complex trades with less friction."
            points={[
              "Coordinate multi-party trades inside a single execution system",
              "Reduce miscommunication and operational overhead",
              "Deliver predictable outcomes with transparent tracking",
            ]}
          />

          <BenefitRow
            title="AI & Automation Systems"
            subtitle="Integrate. Observe. Execute."
            reverse
            points={[
              "Integrate via APIs to monitor and automate trade workflows",
              "Trigger documentation, alerts, and reporting automatically",
              "Build intelligent execution logic on top of OBAOL",
            ]}
          />
        </div>

        {/* TRUST & CLARITY FOOTNOTE */}
        <div className="max-w-4xl mt-24">
          <p className="text-gray-400 text-sm sm:text-base">
            OBAOL does not promise shortcuts or guaranteed profits. It provides
            a standardized system where participants earn by executing real work
            — sourcing, verifying, packaging, transporting, coordinating, and
            managing commodity trades — instead of relying on speculation or
            informal networks.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- SUPPORTING COMPONENT ---------- */

function BenefitRow({
  title,
  subtitle,
  points,
  reverse = false,
}: {
  title: string;
  subtitle: string;
  points: string[];
  reverse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className={`grid md:grid-cols-12 gap-6 items-start ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* LEFT: ROLE */}
      <div className="md:col-span-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-orange-400">{subtitle}</p>
      </div>

      {/* RIGHT: BENEFITS */}
      <div className="md:col-span-8">
        <ul className="space-y-3 text-sm sm:text-base text-gray-300 leading-relaxed">
          {points.map((point, i) => (
            <li key={i}>— {point}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
