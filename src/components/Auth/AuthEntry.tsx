"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const associateExamples = [
  "Trader",
  "Importer / Exporter",
  "Supplier",
  "Manufacturer",
  "Logistics Provider",
  "Freight Forwarder",
  "Warehouse",
  "Quality Lab",
  "Packaging",
  "Customs",
  "Finance",
  "Procurement",
] as const;

const roleOptions = [
  {
    role: "Associate",
    title: "I represent an industry business",
    description:
      "For registered companies that provide commodities or services across the trade ecosystem.",
    href: "/auth/register",
    detailHref: "/roles/associate",
    detailLabel: "Explore Associate roles",
    requirement: "Registered company required",
    examples: associateExamples,
  },
  {
    role: "Operator",
    title: "I want to become an OBAOL Operator",
    description:
      "For individuals who want to build company portfolios, develop buyer and supplier relationships, and coordinate trade execution through OBAOL.",
    href: "/auth/operator/register",
    detailHref: "/roles/operator",
    detailLabel: "Learn how Operators work",
    requirement: "Individual role — no company account required",
    note: "This is an independent trade-execution role, not an internal operations or employee login.",
  },
] as const;

export default function AuthEntry() {
  const searchParams = useSearchParams();
  const signInView = searchParams.get("view") === "signin";

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link href="/" aria-label="OBAOL home">
            <Image src="/logo.png" alt="OBAOL" width={105} height={32} priority />
          </Link>
          <Link href="/how-it-works" className="text-sm font-semibold text-foreground/60 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-warning-500">
            How OBAOL works
          </Link>
        </div>

        <section className="rounded-[2rem] border border-default-200 bg-content1/70 p-6 shadow-xl backdrop-blur-xl md:p-10" aria-labelledby="auth-entry-title">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-warning-600">
            {signInView ? "Choose your account" : "Choose your OBAOL role"}
          </p>
          <h1 id="auth-entry-title" className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
            {signInView ? "Welcome back" : "Which path describes you?"}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-foreground/65">
            {signInView
              ? "Sign in with the account type you already use: an Associate company account or an individual Operator account."
              : "Choose based on who you represent. Your buying, selling, or service capabilities are configured next."}
          </p>

          {signInView ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Link href="/auth/associate" className="rounded-2xl border border-default-200 bg-background p-6 transition hover:-translate-y-0.5 hover:border-warning-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-warning-500">
                <span className="text-xs font-bold uppercase tracking-wider text-warning-600">Associate account</span>
                <h2 className="mt-2 text-xl font-bold">Sign in for your company</h2>
                <p className="mt-2 text-sm leading-6 text-foreground/60">For registered businesses providing commodities or trade-support services.</p>
              </Link>
              <Link href="/auth/operator" className="rounded-2xl border border-default-200 bg-background p-6 transition hover:-translate-y-0.5 hover:border-warning-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-warning-500">
                <span className="text-xs font-bold uppercase tracking-wider text-warning-600">Operator account</span>
                <h2 className="mt-2 text-xl font-bold">Sign in as an Operator</h2>
                <p className="mt-2 text-sm leading-6 text-foreground/60">For individuals managing company relationships and trade execution.</p>
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {roleOptions.map((option) => (
                <article key={option.role} className="flex flex-col rounded-2xl border border-default-200 bg-background p-6 transition hover:border-warning-500">
                  <span className="text-xs font-bold uppercase tracking-wider text-warning-600">{option.role}</span>
                  <h2 className="mt-2 text-xl font-bold">{option.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-foreground/65">{option.description}</p>

                  {"examples" in option ? (
                    <div className="mt-5 flex flex-wrap gap-2" aria-label="Examples of Associate businesses">
                      {option.examples.map((example) => (
                        <span key={example} className="rounded-full border border-default-200 bg-content2 px-2.5 py-1 text-[11px] font-semibold text-foreground/70">
                          {example}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 rounded-xl border border-warning-500/20 bg-warning-500/5 p-3 text-xs leading-5 text-foreground/65">
                      {option.note}
                    </p>
                  )}

                  <p className="mt-5 text-xs font-bold text-foreground/75">{option.requirement}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
                    <Link href={option.href} className="inline-flex min-h-11 items-center rounded-xl bg-warning-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-warning-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-warning-500">
                      Continue as {option.role} <span aria-hidden="true" className="ml-2">→</span>
                    </Link>
                    <Link href={option.detailHref} className="text-sm font-bold text-warning-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-warning-500">
                      {option.detailLabel}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-default-200 pt-6 text-sm">
            {signInView ? (
              <>
                <span className="text-foreground/60">New to OBAOL?</span>
                <Link href="/auth" className="font-bold text-warning-600">Choose your role</Link>
              </>
            ) : (
              <>
                <span className="text-foreground/60">Already registered?</span>
                <Link href="/auth?view=signin" className="font-bold text-warning-600">Sign in</Link>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
