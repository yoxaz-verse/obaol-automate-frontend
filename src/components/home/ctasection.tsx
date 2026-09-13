"use client";

import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";
import { PublicContainer, PublicSectionHeading, PublicLinkButton } from "@/components/public/PublicUI";

export default function CTASection() {
  const { isAuthenticated, loading } = usePublicAuthStatus();
  return <section className="public-section border-t border-default-200">
    <PublicContainer>
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <PublicSectionHeading eyebrow="Your next move" title="Trade Faster. Trade Smarter. Trade Securely." />
        <PublicLinkButton className="shrink-0" href={!loading && isAuthenticated ? "/dashboard" : "/auth"}>
          {!loading && isAuthenticated ? "Go to Dashboard" : "Get Started"}
        </PublicLinkButton>
      </div>
    </PublicContainer>
  </section>;
}
