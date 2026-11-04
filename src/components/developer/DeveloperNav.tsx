"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/developer", "Overview"],
  ["/developer/catalog", "Catalog"],
  ["/developer/api", "API Reference"],
  ["/developer/integrations", "Integrations"],
  ["/developer/keys", "Keys"],
  ["/developer/usage", "Usage"],
] as const;

export default function DeveloperNav() {
  const pathname = usePathname();
  if (pathname === "/developer/login") return null;
  return (
    <nav aria-label="Developer navigation" className="sticky top-0 z-40 border-b border-default-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-brand-abyssal/95">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-3">
        <Link href="/" className="mr-4 whitespace-nowrap font-black text-default-900 dark:text-white">OBAOL Developers</Link>
        {links.map(([href, label]) => {
          const active = href === "/developer" ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold ${active ? "bg-obaol-500 text-black" : "text-default-600 hover:bg-default-100 dark:text-white/75 dark:hover:bg-white/10"}`}>{label}</Link>;
        })}
      </div>
    </nav>
  );
}
