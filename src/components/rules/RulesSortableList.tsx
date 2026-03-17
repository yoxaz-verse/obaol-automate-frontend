"use client";

import React from "react";
import { DndContext, closestCenter, type SensorDescriptor, type Sensor } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import RulesSortableCard, { type RulesBadge } from "./RulesSortableCard";

export type RulesSortableListProps = {
  rules: any[];
  filteredRules: any[];
  dragDisabled?: boolean;
  onEdit: (rule: any) => void;
  onDragEnd: (event: any) => void;
  sensors: SensorDescriptor<Sensor<any>>[];
  renderBadges: (rule: any) => RulesBadge[];
  emptyLabel?: string;
};

export default function RulesSortableList({
  rules,
  filteredRules,
  dragDisabled,
  onEdit,
  onDragEnd,
  sensors,
  renderBadges,
  emptyLabel = "No rules found.",
}: RulesSortableListProps) {
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={rules.map((r: any) => r._id)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 gap-3">
          {filteredRules.length === 0 ? (
            <div className="rounded-xl border border-default-200/70 bg-content1/95 p-6 text-center text-default-500">
              {emptyLabel}
            </div>
          ) : (
            filteredRules.map((rule: any) => (
              <RulesSortableCard
                key={rule._id}
                rule={rule}
                onEdit={onEdit}
                dragDisabled={dragDisabled}
                badges={renderBadges(rule)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
