"use client";

import type { ReactNode } from "react";
import { useContext } from "react";
import { LuClock3, LuFileText, LuTruck, LuWarehouse } from "react-icons/lu";

import AuthContext from "@/context/AuthContext";

type ComingSoonFeature = "documents" | "external-orders" | "warehouse-booking";

const featureContent: Record<
  ComingSoonFeature,
  { eyebrow: string; title: string; description: string; icon: typeof LuFileText }
> = {
  documents: {
    eyebrow: "Trade documentation",
    title: "Documents are coming soon",
    description:
      "We are preparing a simpler workspace for managing your trade documents. This section will be available soon.",
    icon: LuFileText,
  },
  "external-orders": {
    eyebrow: "Trade execution",
    title: "External Orders are coming soon",
    description:
      "We are preparing the external order workspace for a smoother execution experience. This section will be available soon.",
    icon: LuTruck,
  },
  "warehouse-booking": {
    eyebrow: "Storage services",
    title: "Warehouse Booking is coming soon",
    description:
      "We are preparing the warehouse booking workspace for a smoother storage experience. This section will be available soon.",
    icon: LuWarehouse,
  },
};

function GateLoadingState() {
  return (
    <div
      aria-busy="true"
      aria-label="Checking access"
      className="flex min-h-[420px] items-center justify-center"
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
    </div>
  );
}

function ComingSoonState({ feature }: { feature: ComingSoonFeature }) {
  const content = featureContent[feature];
  const FeatureIcon = content.icon;

  return (
    <section className="flex min-h-[calc(100dvh-13rem)] items-center justify-center px-2 py-8 sm:px-6">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-primary/20 bg-content1/80 px-6 py-14 text-center shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:px-12 sm:py-20">
        <div
          aria-hidden="true"
          className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-primary/25 bg-primary/10 text-primary shadow-inner">
          <FeatureIcon aria-hidden="true" size={34} strokeWidth={1.7} />
          <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-content1 text-primary shadow-md">
            <LuClock3 aria-hidden="true" size={16} />
          </span>
        </div>

        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
          {content.eyebrow}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {content.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm font-medium leading-7 text-default-500 sm:text-base">
          {content.description}
        </p>

        <div className="mx-auto mt-9 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          In development
        </div>
      </div>
    </section>
  );
}

export default function RoleGatedComingSoon({
  children,
  feature,
}: {
  children: ReactNode;
  feature: ComingSoonFeature;
}) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <GateLoadingState />;

  const isAdmin = String(user?.role || "").trim().toLowerCase() === "admin";
  if (isAdmin) return <>{children}</>;

  return <ComingSoonState feature={feature} />;
}
