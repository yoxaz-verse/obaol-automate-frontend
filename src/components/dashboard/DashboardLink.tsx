"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useDashboardNavigation } from "@/context/DashboardNavigationContext";

type Props = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

export default function DashboardLink({ href, onClick, onMouseEnter, onFocus, onTouchStart, ...props }: Props) {
  const { navigate, prefetch } = useDashboardNavigation();
  const path = typeof href === "string" ? href : href.pathname || "";
  const warm = () => path.startsWith("/dashboard") && prefetch(path);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!path.startsWith("/dashboard")) return;
    event.preventDefault();
    navigate(path);
  };

  return (
    <Link
      {...props}
      href={href}
      prefetch={false}
      onClick={handleClick}
      onMouseEnter={(event) => { onMouseEnter?.(event); warm(); }}
      onFocus={(event) => { onFocus?.(event); warm(); }}
      onTouchStart={(event) => { onTouchStart?.(event); warm(); }}
    />
  );
}
