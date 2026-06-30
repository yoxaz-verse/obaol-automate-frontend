"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const startOptions = [
  { title: "I want to buy", description: "Discover products, create enquiries, request samples, and track orders.", href: "/auth/register?intent=BUY", accent: "Buyer" },
  { title: "I want to sell", description: "Set up your company, list products, and respond to buyer enquiries.", href: "/auth/register?intent=SELL", accent: "Seller" },
  { title: "I work in operations", description: "Manage assigned companies and coordinate trade execution.", href: "/auth/operator/register", accent: "Operator" },
] as const;

export default function AuthEntry() {
  const searchParams = useSearchParams();
  const signInView = searchParams.get("view") === "signin";

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link href="/" aria-label="OBAOL home"><Image src="/logo.png" alt="OBAOL" width={105} height={32} priority /></Link>
          <Link href="/how-it-works" className="text-sm font-semibold text-foreground/60 hover:text-foreground">How OBAOL works</Link>
        </div>

        <section className="rounded-[2rem] border border-default-200 bg-content1/70 p-6 shadow-xl backdrop-blur-xl md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-warning-600">Choose your workspace</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">{signInView ? "Welcome back" : "What would you like to do?"}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/65">
            {signInView
              ? "Choose the account type you already use. Buyers and sellers sign in through the trade account."
              : "We will configure the platform around your work. Buyer and seller accounts share one secure trade profile."}
          </p>

          {signInView ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Link href="/auth/associate" className="rounded-2xl border border-default-200 bg-background p-6 transition hover:border-warning-500 hover:-translate-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-warning-600">Buyer or seller</span>
                <h2 className="mt-2 text-xl font-bold">Sign in to your trade account</h2>
                <p className="mt-2 text-sm text-foreground/60">Access marketplace, enquiries, samples, products, and orders.</p>
              </Link>
              <Link href="/auth/operator" className="rounded-2xl border border-default-200 bg-background p-6 transition hover:border-warning-500 hover:-translate-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-warning-600">Operations</span>
                <h2 className="mt-2 text-xl font-bold">Sign in as an operator</h2>
                <p className="mt-2 text-sm text-foreground/60">Access assigned companies, execution tasks, and team work.</p>
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {startOptions.map((option) => (
                <Link key={option.href} href={option.href} className="group rounded-2xl border border-default-200 bg-background p-6 transition hover:border-warning-500 hover:-translate-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-warning-600">{option.accent}</span>
                  <h2 className="mt-2 text-xl font-bold group-hover:text-warning-600">{option.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-foreground/60">{option.description}</p>
                  <span className="mt-5 inline-flex text-sm font-bold">Continue <span aria-hidden="true" className="ml-2">→</span></span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-default-200 pt-6 text-sm">
            {signInView ? <><span className="text-foreground/60">New to OBAOL?</span><Link href="/auth" className="font-bold text-warning-600">Choose how to get started</Link></> : <><span className="text-foreground/60">Need both buying and selling?</span><Link href="/auth/register?intent=BOTH" className="font-bold text-warning-600">Create a combined trade account</Link><span className="ml-auto text-foreground/60">Already registered?</span><Link href="/auth?view=signin" className="font-bold text-warning-600">Sign in</Link></>}
          </div>
        </section>
      </div>
    </main>
  );
}
