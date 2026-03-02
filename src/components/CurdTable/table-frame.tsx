"use client";

import React from "react";

type TableFrameProps = {
  children: React.ReactNode;
  className?: string;
  withTopGap?: boolean;
  withBottomGap?: boolean;
};

export default function TableFrame({
  children,
  className = "",
  withTopGap = false,
  withBottomGap = false,
}: TableFrameProps) {
  return (
    <div
      className={`w-full min-w-0 max-w-full overflow-hidden ${
        withTopGap ? "pt-2" : ""
      } ${withBottomGap ? "pb-2" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
