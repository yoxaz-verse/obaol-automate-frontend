import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found | OBAOL Supreme",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-background px-6 py-20 text-foreground">
      <section className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-obaol-600">404 · Page not found</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">This destination is unavailable.</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-default-600">
          The address may be outdated, retired, or incorrect. Continue to OBAOL Supreme’s public trade execution information or return home.
        </p>
        <nav aria-label="Page not found options" className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="public-button public-button--primary">Return home</Link>
          <Link href="/how-it-works" className="public-button public-button--secondary">How OBAOL works</Link>
          <Link href="/roles" className="public-button public-button--secondary">Explore participant roles</Link>
        </nav>
      </section>
    </main>
  );
}
