"use client";

import React from "react";
import { Chip } from "@nextui-org/react";

export type RulesActionStripItem = {
  label: string;
  used: boolean;
};

type RulesActionStripProps = {
  title: string;
  items?: RulesActionStripItem[];
  emptyMessage?: string;
};

export default function RulesActionStrip({ title, items = [], emptyMessage }: RulesActionStripProps) {
  const hasItems = items.length > 0;

  return (
    <div className="rounded-xl border border-default-200/70 bg-content1/95 p-4">
      <div className="text-xs font-semibold text-default-500 mb-2">{title}</div>
      {hasItems ? (
        <div className="flex flex-wrap gap-2">
          {items.map(({ label, used }) => (
            <Chip
              key={label}
              size="sm"
              color={used ? "success" : "default"}
              variant={used ? "flat" : "bordered"}
            >
              {label} · {used ? "Used" : "Not used"}
            </Chip>
          ))}
        </div>
      ) : (
        <div className="text-xs text-default-400">{emptyMessage || "No actions configured."}</div>
      )}
    </div>
  );
}
