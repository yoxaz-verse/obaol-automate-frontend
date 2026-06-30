"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import AuthContext from "@/context/AuthContext";
import StatusBadge from "@/components/ui/StatusBadge";
import { BUSINESS_IDENTITY } from "@/utils/businessIdentity";

export default function PendingApprovalPage() {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const router = useRouter();
  const submittedAt = user?.pendingSince ? new Date(user.pendingSince) : null;
  const isOperator = ["operator", "team"].includes(String(user?.role || "").toLowerCase());

  return (
    <main className="mx-auto min-h-[80vh] max-w-4xl px-4 py-10 md:px-8">
      <div className="flex justify-end">
        <Button variant="bordered" onPress={async () => { await logout(); router.push("/auth?view=signin"); }}>Sign out safely</Button>
      </div>
      <section className="mt-6 rounded-[2rem] border border-warning-500/25 bg-warning-500/5 p-6 md:p-10">
        <StatusBadge status="PENDING" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">Your account is being reviewed</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/65">
          We are checking the information submitted for your {isOperator ? "operator" : "trade"} account. Normal dashboard pages remain locked until the review is complete.
        </p>

        <dl className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-default-200 bg-background p-5"><dt className="text-xs font-bold uppercase tracking-wider text-default-500">Current status</dt><dd className="mt-2 font-semibold">Waiting for review</dd></div>
          <div className="rounded-2xl border border-default-200 bg-background p-5"><dt className="text-xs font-bold uppercase tracking-wider text-default-500">Submitted</dt><dd className="mt-2 font-semibold">{submittedAt && !Number.isNaN(submittedAt.getTime()) ? submittedAt.toLocaleString() : "Submission received"}</dd></div>
          <div className="rounded-2xl border border-default-200 bg-background p-5"><dt className="text-xs font-bold uppercase tracking-wider text-default-500">What happens next</dt><dd className="mt-2 text-sm leading-6 text-foreground/70">The review team will approve the account or contact you if more information is required.</dd></div>
          <div className="rounded-2xl border border-default-200 bg-background p-5"><dt className="text-xs font-bold uppercase tracking-wider text-default-500">Need help?</dt><dd className="mt-2 text-sm"><a className="font-semibold text-warning-600" href={`mailto:${BUSINESS_IDENTITY.email}`}>{BUSINESS_IDENTITY.email}</a></dd></div>
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button color="warning" onPress={async () => { const approved = await refreshUser(); if (approved) router.refresh(); }}>Check status again</Button>
          <span className="text-sm text-default-500" aria-live="polite">You can close this page and return later.</span>
        </div>
      </section>
    </main>
  );
}
