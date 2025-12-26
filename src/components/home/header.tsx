"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
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
              className="object-contain"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <NavLink href="/about">About</NavLink>
            <NavLink href="/why_obaol">Why OBAOL</NavLink>
            <NavLink href="/how_it_works">How It Works</NavLink>
            <NavLink href="/faq">FAQ</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* <Link
              href="/auth"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link> */}

            <Link
            href="https://typebot.co/obaol-early-access"
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 transition-colors"
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
      className="relative text-gray-300 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-0 after:bg-white after:transition-all hover:after:w-full"
    >
      {children}
    </Link>
  );
}
