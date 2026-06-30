"use client";

import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center p-6">
      <section className="w-full max-w-xl rounded-3xl border border-warning-500/20 bg-content1 p-8 text-center shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-warning-600">Access restricted</p>
        <h1 className="mt-3 text-3xl font-black">This workspace is not available to your role.</h1>
        <p className="mt-3 text-sm text-default-500">
          Your account is active, but this page is outside your current responsibilities or trading mode.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="rounded-xl bg-warning-500 px-5 py-3 text-sm font-bold text-black">
            Return to dashboard
          </Link>
          <Link href="/dashboard/guidance" className="rounded-xl border border-default-200 px-5 py-3 text-sm font-bold">
            Open guidance
          </Link>
        </div>
      </section>
    </main>
  );
}
