"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type RulesBadge = {
  label: string;
  colorClass?: string;
};

type RulesSortableCardProps = {
  rule: any;
  onEdit: (rule: any) => void;
  dragDisabled?: boolean;
  badges?: RulesBadge[];
};

export default function RulesSortableCard({ rule, onEdit, dragDisabled, badges = [] }: RulesSortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: rule._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-default-200/70 bg-content1/95 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-bold">{rule.label}</div>
          <div className="text-xs text-default-500">{rule.stageKey}</div>
          {rule.description && (
            <div className="text-xs text-default-400 mt-1">{rule.description}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="flat" onPress={() => onEdit(rule)}>
            Edit
          </Button>
          <button
            {...attributes}
            {...listeners}
            disabled={dragDisabled}
            title={dragDisabled ? "Clear search to reorder" : "Drag to reorder"}
            className={`flex items-center justify-center px-3 h-8 text-xs font-medium rounded-lg transition-colors ${dragDisabled
                ? "opacity-50 cursor-not-allowed bg-transparent text-default-400"
                : "bg-transparent hover:bg-default-100 text-default-600 cursor-grab active:cursor-grabbing"
              }`}
          >
            Drag
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {badges.length === 0 ? (
          <span className="text-xs text-default-500">No tags</span>
        ) : (
          badges.map((badge) => (
            <span
              key={badge.label}
              className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.colorClass || "text-default-600 bg-default-100/70"}`}
            >
              {badge.label}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
