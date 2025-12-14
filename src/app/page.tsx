"use client";

import BrokenTradeSystemSection from "@/components/home/brokentradesystemsection";
import CommodityServicesSection from "@/components/home/commodityservices";
import Footer from "@/components/home/footer";
import Header from "@/components/home/header";
import TradeOperatingLayer from "@/components/home/tradeoperatinglayer";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      {/* HERO */}
      <Header />
      <section className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="max-w-5xl text-center"
        >
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            A New Digital Infrastructure for <br />
            Global Commodity Trading
          </h1>

          <p className="mt-6 text-lg text-gray-300">
            OBAOL is an end-to-end trading system built for physical commodity
            trade — with a strong focus on agro-commodities, import-export, and
            structured procurement.
            <br />
            <br />
            This is not financial trading. This is real-world trade execution,
            modernized through technology, verification, and automation.
          </p>

          <div className="mt-10 flex gap-4 justify-center">
            <Link
              href="/product"
              className="px-6 py-3 rounded-md bg-white text-black font-medium"
            >
              Explore the System
            </Link>
            <Link
              href="/auth"
              className="px-6 py-3 rounded-md border border-gray-600 text-white"
            >
              Access Dashboard
            </Link>
          </div>
        </motion.div>
      </section>

      {/* CLARITY */}
      {/* COMMODITY FOCUS SECTION */}

      <CommodityServicesSection />
      <TradeOperatingLayer />
      <BrokenTradeSystemSection />

      {/* END-TO-END TIME SIMULATION (UPDATED) */}
      <section className="py-32 px-6 border-t border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div className="max-w-3xl mb-20">
            <h2 className="text-3xl font-semibold">
              Trade Execution, Explained by Process — Not Promises
            </h2>
            <p className="mt-6 text-gray-300">
              The difference between delayed trades and fast execution is not
              intent — it is process structure. Below is a realistic breakdown
              of how commodity trades are executed traditionally versus through
              OBAOL.
            </p>
          </div>

          <div className="space-y-14">
            {/* Supplier Discovery */}
            <TimeCompare
              title="Supplier Discovery & Initial Screening"
              traditionalSteps={[
                { label: "Market search & references", time: "2–4 days" },
                { label: "Informal supplier checks", time: "2–3 days" },
              ]}
              obaolSteps={[
                {
                  label: "Access pre-verified suppliers",
                  time: "5–10 minutes",
                },
              ]}
              highlight
            />

            {/* Stock Verification */}
            <TimeCompare
              title="Stock Verification (Mandatory Double Check)"
              traditionalSteps={[
                { label: "Supplier self-declared stock", time: "1–3 days" },
                {
                  label: "Independent verification",
                  time: "Often skipped or delayed",
                },
              ]}
              obaolSteps={[
                { label: "Supplier confirmation", time: "Same day" },
                { label: "Independent OBAOL verification", time: "1–2 days" },
              ]}
              highlight
            />

            {/* Documentation */}
            <TimeCompare
              title="Documentation (LOI, PO, Contract)"
              traditionalSteps={[
                { label: "Manual drafting & sharing", time: "2–3 days" },
                { label: "Revisions & approvals", time: "1–2 days" },
              ]}
              obaolSteps={[
                {
                  label: "Structured documentation workflow",
                  time: "Same day",
                },
              ]}
              highlight
            />

            {/* Procurement */}
            <TimeCompare
              title="Procurement & On-Ground Coordination"
              traditionalSteps={[
                { label: "Buyer travel & site visits", time: "3–6 days" },
                { label: "Local coordination delays", time: "1–2 days" },
              ]}
              obaolSteps={[
                {
                  label: "Nearest procurement specialist assigned",
                  time: "Same day",
                },
                { label: "On-site procurement & checks", time: "1–2 days" },
              ]}
              highlight
              note="For first-time suppliers, full procurement is conducted. For recurring suppliers, this step is significantly reduced."
            />

            {/* Packaging & Domestic Transport */}
            <TimeCompare
              title="Packaging & Domestic Transportation"
              traditionalSteps={[
                { label: "Source packaging solutions", time: "1–2 days" },
                { label: "Arrange inland transport", time: "1–2 days" },
              ]}
              obaolSteps={[
                {
                  label: "Packaging options sourced & finalized",
                  time: "Same day",
                },
                {
                  label: "Domestic transport planned & executed",
                  time: "Same day",
                },
              ]}
              highlight
            />

            {/* Logistics */}
            <TimeCompare
              title="Logistics & Shipping Allocation"
              traditionalSteps={[
                {
                  label: "Identify shipping routes & vessels",
                  time: "2–3 days",
                },
                { label: "Schedule coordination", time: "1–2 days" },
              ]}
              obaolSteps={[
                { label: "Pre-aligned logistics partners", time: "Few hours" },
                { label: "Route & vessel allocation", time: "Same day" },
              ]}
              highlight
            />

            {/* Payments */}
            <TimeCompare
              title="Payments & Settlement"
              traditionalSteps={[
                {
                  label: "Payment negotiation & risk checks",
                  time: "1–3 days",
                },
              ]}
              obaolSteps={[
                {
                  label: "Secure payment method (plan-based)",
                  time: "Immediate",
                },
                {
                  label: "Milestone-based settlement",
                  time: "Defined upfront",
                },
              ]}
              highlight
              note="Payment structure depends on the plan and method selected. Bank-based settlements may bypass escrow-style steps."
            />
          </div>

          {/* TOTAL TIME */}
          <div className="mt-24 grid md:grid-cols-2 gap-8">
            <TotalTimeCard
              title="Traditional Trade Execution"
              time="18–30 Days"
              note="Timelines vary significantly due to travel, manual coordination, and lack of verification."
            />

            <TotalTimeCard
              title="With OBAOL"
              time="6–9 Days"
              highlight
              note="Time is reduced by structuring processes — not by skipping verification or due diligence."
            />
          </div>
        </div>
      </section>

      {/* PROCUREMENT FLOW SECTION */}
      <section className="py-32 px-6 border-t border-gray-800 bg-black">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="max-w-3xl mb-20">
            <h2 className="text-3xl font-semibold">
              Procurement Execution — Step by Step
            </h2>
            <p className="mt-6 text-gray-300">
              Once order confirmation and supplier assignment are completed,
              OBAOL executes procurement as a third-party on-ground
              representative.
              <br />
              This is a structured, sequential process — not ad-hoc
              coordination.
            </p>
          </div>

          {/* Flow */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-orange-400/40 via-gray-700 to-transparent" />

            <div className="space-y-14">
              <FlowStep
                step="01"
                title="Procurement Specialist Assigned"
                desc="A nearby OBAOL procurement specialist is assigned based on
          supplier location, reducing travel time and delays."
              />

              <FlowStep
                step="02"
                title="On-Site Visit & Presence"
                desc="Our representative visits the supplier location and acts
          on your behalf throughout the procurement process."
              />

              <FlowStep
                step="03"
                title="Stock Quantity Verification"
                desc="Before transportation arrives, we verify that the promised
          quantity is physically available to prevent short loading."
              />

              <FlowStep
                step="04"
                title="Quality Inspection"
                desc="Product quality is checked against agreed specifications
          to ensure readiness for dispatch."
              />

              <FlowStep
                step="05"
                title="Photo & Video Confirmation"
                desc="Photos and videos of stock, packaging, and readiness are
          shared to provide real-time visibility."
              />

              <FlowStep
                step="06"
                title="Packaging Validation"
                desc="Packaging is confirmed to meet requirements before
          goods are prepared for transportation."
              />

              <FlowStep
                step="07"
                title="Transport Readiness Check"
                desc="We confirm that the transport vehicle has arrived,
          is suitable, and ready for loading."
              />

              <FlowStep
                step="08"
                title="Loading Supervision"
                desc="Goods are supervised during loading to ensure
          correct handling and dispatch."
              />

              <FlowStep
                step="09"
                title="Payment Checkpoint"
                desc="If payment is linked to dispatch, we ensure required
          payments are received before release."
              />

              <FlowStep
                step="10"
                title="Handover to Logistics"
                desc="Once loading is complete, the shipment is handed over
          to the designated logistics partner."
                highlight
              />
            </div>
          </div>

          {/* Supplier Context */}
          <div className="mt-20 grid md:grid-cols-2 gap-10">
            <ContextCard
              title="First-Time Suppliers"
              text="All steps are executed end-to-end to establish trust,
        validate stock, and ensure smooth execution."
            />

            <ContextCard
              title="Recurring Suppliers"
              text="Several steps are streamlined while maintaining
        verification and execution control."
            />
          </div>
        </div>
      </section>

      {/* SYSTEM INTEGRATION SECTION */}
      <section className="py-28 px-6 border-t border-gray-800 bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Narrative */}
            <div className="max-w-xl">
              <span className="text-sm uppercase tracking-wider text-gray-400">
                System Ready
              </span>

              <h2 className="mt-4 text-3xl font-semibold leading-snug">
                Built as Trading Infrastructure,
                <br />
                Not Just a Platform
              </h2>

              <p className="mt-6 text-gray-300">
                OBAOL is designed to operate at the system level. Beyond the
                interface, we provide structured mechanisms that allow
                businesses to integrate trading workflows directly into their
                existing operations.
              </p>

              <p className="mt-4 text-gray-400">
                Advanced capabilities such as MCP and API-based automation are
                available for organizations that require deeper integration and
                programmable trade execution.
              </p>

              <p className="mt-6 text-sm text-gray-500">
                Detailed documentation and automation workflows are available
                separately.
              </p>
            </div>

            {/* Right: Futuristic Visual Cue */}
            <div className="relative">
              <div className="p-8 rounded-xl border border-gray-800 bg-black">
                <div className="space-y-4 text-sm text-gray-300">
                  <SystemLine label="Live Rates" highlight />
                  <SystemLine label="MCP" />
                  <SystemLine label="Automation Layer" />
                  <SystemLine label="Secure APIs" />
                  <SystemLine label="Enterprise Systems" />
                </div>
              </div>

              {/* Subtle Glow */}
              <div className="absolute inset-0 rounded-xl border border-orange-400/20 shadow-[0_0_60px_rgba(255,165,0,0.08)] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* GLOBAL */}
      {/* TRADE SCOPE & ORIGIN */}
      <section className="py-28 px-6 border-t border-gray-800 bg-black">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl font-semibold leading-snug">
              <span className="text-orange-400">Started </span>
              in Indian
              <span className="text-green-800"> Market</span>
              .
              <br />
              Designed for Domestic and Global Trade.
            </h2>

            <p className="mt-6 text-gray-300">
              OBAOL is built to simplify and automate both domestic and
              international commodity trading using the same structured system.
            </p>
          </div>

          {/* Explanation */}
          <div className="grid md:grid-cols-2 gap-14">
            <div>
              <p className="text-gray-300">
                We started by building and testing the system in India — not
                because it is limited to one geography, but because India
                represents one of the most complex trading environments.
              </p>

              <p className="mt-4 text-gray-400">
                Domestic trading in India involves fragmented supply chains,
                diverse raw material sources, varying quality standards, and
                multiple logistics layers — all operating simultaneously.
              </p>
            </div>

            <div>
              <p className="text-gray-300">
                This diversity of raw material supply, combined with both
                domestic distribution and export flows, makes India an ideal
                environment to validate real trade execution.
              </p>

              <p className="mt-4 text-gray-400">
                By structuring and automating trade in such conditions, OBAOL
                enables the same system to be applied confidently across
                regions, markets, and trade routes.
              </p>
            </div>
          </div>

          {/* Subtle Emphasis */}
          <div className="mt-16">
            <div className="h-px w-full bg-gradient-to-r from-orange-400/30 via-gray-700 to-green-500/30" />
            <p className="mt-6 text-sm text-gray-400 max-w-3xl">
              A system that can handle domestic complexity and raw material
              diversity is inherently capable of supporting global trade
              execution.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-gray-800 text-center">
        <h2 className="text-3xl font-semibold">
          Trade Faster. Trade Smarter. Trade Securely.
        </h2>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/auth"
            className="px-6 py-3 rounded-md bg-white text-black font-medium"
          >
            Get Started
          </Link>
          <Link
            href="/product"
            className="px-6 py-3 rounded-md border border-gray-600 text-white"
          >
            Learn How It Works
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function TimeCompare({
  title,
  traditionalSteps,
  obaolSteps,
  highlight,
  note,
}: {
  title: string;
  traditionalSteps: { label: string; time: string }[];
  obaolSteps: { label: string; time: string }[];
  highlight?: boolean;
  note?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      viewport={{ once: true }}
    >
      <h3 className="text-xl font-semibold text-white mb-6">{title}</h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Traditional */}
        <div className="p-6 rounded-lg border border-gray-800 bg-neutral-950">
          <span className="text-xs uppercase tracking-wide text-gray-500">
            Traditional Method
          </span>
          <ul className="mt-4 space-y-3">
            {traditionalSteps.map((s, i) => (
              <li
                key={i}
                className="flex justify-between text-sm text-gray-300"
              >
                <span>{s.label}</span>
                <span className="text-gray-400">{s.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* OBAOL */}
        <div
          className={`p-6 rounded-lg bg-neutral-900 border transition-all
          ${
            highlight
              ? "border-orange-400 shadow-[0_0_25px_rgba(255,165,0,0.25)]"
              : "border-gray-700"
          }`}
        >
          <span className="text-xs uppercase tracking-wide ">
            With
            <span className="text-orange-400"> OBAOL</span>
          </span>
          <ul className="mt-4 space-y-3">
            {obaolSteps.map((s, i) => (
              <li
                key={i}
                className="flex justify-between text-sm text-gray-200"
              >
                <span>{s.label}</span>
                <span className="font-medium">{s.time}</span>
              </li>
            ))}
          </ul>

          {note && <p className="mt-4 text-xs text-gray-400">{note}</p>}
        </div>
      </div>
    </motion.div>
  );
}

function TotalTimeCard({
  title,
  time,
  note,
  highlight,
}: {
  title: string;
  time: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-lg border ${
        highlight ? "border-white bg-neutral-900" : "border-gray-800 bg-black"
      }`}
    >
      <h4 className="text-lg font-semibold">{title}</h4>
      <p className="mt-4 text-3xl font-semibold">{time}</p>
      <p className="mt-4 text-sm text-gray-400">{note}</p>
    </div>
  );
}

function SystemLine({
  label,
  highlight,
}: {
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-md border
      ${
        highlight
          ? "border-orange-400 text-orange-300"
          : "border-gray-800 text-gray-400"
      }`}
    >
      <span>{label}</span>
      <span className="text-xs">{highlight ? "Active" : "Available"}</span>
    </div>
  );
}

function FlowStep({
  step,
  title,
  desc,
  highlight,
}: {
  step: string;
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      viewport={{ once: true }}
      className="relative pl-14"
    >
      {/* Step Indicator */}
      <div
        className={`absolute left-0 top-1 flex items-center justify-center
        w-8 h-8 rounded-full text-xs font-semibold
        ${
          highlight
            ? "bg-orange-400 text-black shadow-[0_0_20px_rgba(255,165,0,0.6)]"
            : "bg-neutral-800 text-gray-300"
        }`}
      >
        {step}
      </div>

      <h3 className="text-lg font-semibold text-white">{title}</h3>

      <p className="mt-2 text-sm text-gray-300 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function ContextCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="p-6 rounded-lg border border-gray-800 bg-neutral-950">
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-3 text-sm text-gray-300">{text}</p>
    </div>
  );
}
