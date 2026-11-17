"use client";

import { useEffect, useState } from "react";

type CompanyBrandMarkProps = {
  name: string;
  logo?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-10 w-10 rounded-lg text-xs",
  md: "h-14 w-14 rounded-xl text-sm",
  lg: "h-16 w-16 rounded-2xl text-base",
};

const initials = (name: string) => {
  const words = String(name || "Company").trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : words[0]?.slice(0, 2) || "CO").toUpperCase();
};

export default function CompanyBrandMark({ name, logo, size = "md", className = "" }: CompanyBrandMarkProps) {
  const normalizedLogo = String(logo || "").trim();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [normalizedLogo]);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-[var(--db-border-subtle)] bg-[var(--db-inset)] font-bold text-obaol-700 dark:text-obaol-300 ${sizes[size]} ${className}`.trim()}
      aria-label={`${name} logo`}
    >
      {normalizedLogo && !imageFailed ? (
        <img
          src={normalizedLogo}
          alt=""
          className="h-full w-full object-contain p-2"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </div>
  );
}
