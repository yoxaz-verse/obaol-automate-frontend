"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Stage = {
  id: string;
  label: string;
  obaolDesc: string;
};

const STAGES: Stage[] = [
  {
    id: "suppliers",
    label: "Supplier Access",
    obaolDesc: "OBAOL provides verified suppliers based on your requirements.",
  },
  {
    id: "verification",
    label: "Verification & Certification",
    obaolDesc:
      "Independent verification of supplier legitimacy, stock, and documents.",
  },
  {
    id: "documentation",
    label: "Trade Documentation",
    obaolDesc:
      "LOI, PO, contracts, and confirmations are structured and managed.",
  },
  {
    id: "procurement",
    label: "On-Ground Procurement",
    obaolDesc:
      "OBAOL acts as your on-site representative for stock and quality checks.",
  },
  {
    id: "packaging",
    label: "Packaging",
    obaolDesc: "Packaging is verified and confirmed before dispatch.",
  },
  {
    id: "logistics",
    label: "Logistics & Transport",
    obaolDesc: "Domestic transport and shipping coordination is handled.",
  },
  {
    id: "payments",
    label: "Payments",
    obaolDesc:
      "Secure, milestone-based payment handling based on selected terms.",
  },
];

export default function ResponsibilityTransferSection() {
  const [obaolHandles, setObaolHandles] = useState<string[]>([]);

  const toggle = (id: string) => {
    setObaolHandles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <>
      <section className="py-32 px-6 border-t border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          {/* Top Statement */}
          <div className="max-w-3xl mb-20 ">
            <span className="text-sm uppercase tracking-wider text-gray-400">
              Who we are
            </span>

            <h2 className="mt-4 text-3xl font-semibold leading-snug">
              Not a Marketplace.
              <br />A Complete Trading System.
            </h2>

            <p className="mt-6 text-gray-300">
              We operate the entire trade workflow — from supplier discovery and
              verification to documentation, logistics coordination,
              procurement, and settlement.
            </p>
          </div>
          <div className="max-w-3xl mb-5 ">
            <p className="mt-10 text-gray-300">
              Every commodity trade has multiple responsibilities. You can
              manage them yourself — or delegate execution to OBAOL at any
              stage.
            </p>{" "}
          </div>

          {/* Columns */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* LEFT: Trade Stages */}

            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-4">
                Trade Lifecycle
              </h3>

              <div className="space-y-3">
                {STAGES.map((stage) => {
                  const active = obaolHandles.includes(stage.id);

                  return (
                    <motion.div
                      key={stage.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggle(stage.id)}
                      className={`cursor-pointer p-4 rounded-md border transition-all
                      ${
                        active
                          ? "border-orange-400 bg-neutral-900"
                          : "border-gray-800 bg-neutral-950"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white">
                          {stage.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {active ? "OBAOL" : "You"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Explanation */}
            <div className="p-6 rounded-lg border border-gray-800 bg-neutral-950">
              <h3 className="font-semibold text-white">What OBAOL Executes</h3>

              {obaolHandles.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  Select any stage to delegate execution to OBAOL.
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {obaolHandles.map((id) => {
                    const stage = STAGES.find((s) => s.id === id);
                    return (
                      <li key={id}>
                        <p className="text-sm font-medium text-white">
                          {stage?.label}
                        </p>
                        <p className="mt-1 text-xs text-gray-300">
                          {stage?.obaolDesc}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}

              <p className="mt-6 text-xs text-gray-500">
                You retain control while OBAOL executes selected
                responsibilities.
              </p>
            </div>
          </div>

          {/* Bottom Statement */}
          <div className="max-w-3xl mt-20">
            <p className="text-lg text-gray-300">
              Trading is no longer a collection of disconnected steps.
            </p>

            <p className="mt-4 text-gray-400">
              OBAOL replaces fragmented tools, informal processes, and manual
              coordination with a single structured system designed for
              real-world commodity trade.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
