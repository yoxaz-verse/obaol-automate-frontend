"use client";

import { motion } from "framer-motion";

export function TimeCompare({
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
          className={`p-6 rounded-lg bg-neutral-900 border transition-all ${
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
