"use client";

import React from "react";

type RulesPreviewPanelProps = {
  title?: string;
  header?: React.ReactNode;
  body: React.ReactNode;
};

export default function RulesPreviewPanel({ title = "Flow Preview", header, body }: RulesPreviewPanelProps) {
  return (
    <div className="rounded-xl border border-default-200/70 bg-content1/95 p-4 h-fit sticky top-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-bold">{title}</div>
        {header}
      </div>
      {body}
    </div>
  );
}
