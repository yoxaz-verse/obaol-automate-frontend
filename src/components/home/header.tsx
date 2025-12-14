"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold text-white">
          OBAOL
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <NavLink href="/about">About</NavLink>
          <NavLink href="/product">Product</NavLink>
          <NavLink href="/catalog">Catalog</NavLink>
          <NavLink href="/case-studies">Insights</NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/auth"
            className="text-sm text-gray-300 hover:text-white"
          >
            Sign In
          </Link>

          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm rounded-md bg-white text-black font-medium"
          >
            Dashboard
          </Link>
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
    <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
      <Link
        href={href}
        className="hover:text-white transition-colors"
      >
        {children}
      </Link>
    </motion.div>
  );
}
