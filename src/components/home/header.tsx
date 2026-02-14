"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-default-200  bg-background">

      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="relative flex items-center">
            <Image
              src="/logo.png"
              alt="OBAOL – Global commodity trade execution system"
              width={110}
              height={32}
              priority
              className="object-contain rounded-md"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <NavLink href="/about">About</NavLink>
            <NavLink href="/why-obaol">Why OBAOL</NavLink>
            <NavLink href="/how-it-works">How It Works</NavLink>
            <NavLink href="/product">Products</NavLink>
            <NavLink href="/faq">FAQ</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeSwitcher />

            <Link
              href="https://typebot.co/obaol-early-access"
              className="rounded-md bg-warning px-4 py-2 text-sm font-medium text-warning-foreground hover:opacity-90 transition-opacity"
            >
              Want Early Access
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative text-default-600 transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-0 after:bg-foreground after:transition-all hover:after:w-full"
    >
      {children}
    </Link>
  );
}
