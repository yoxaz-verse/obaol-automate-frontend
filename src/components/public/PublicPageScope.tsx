"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const privateRoots = ["/dashboard", "/auth", "/developer", "/verification-pending", "/403"];

/** Scope presentation only; this is not an authorization boundary. */
export default function PublicPageScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPrivate = !pathname || privateRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
  return <div className={isPrivate ? undefined : "obaol-public"}>{children}</div>;
}
