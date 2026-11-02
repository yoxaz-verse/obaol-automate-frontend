"use client";

import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";
import { PublicContainer, PublicSectionHeading, PublicLinkButton } from "@/components/public/PublicUI";

export default function CTASection({
  eyebrow = "Your next move",
  title = "Trade Faster. Trade Smarter. Trade Securely.",
  description,
  href,
  label,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  href?: string;
  label?: string;
} = {}) {
  const { isAuthenticated, loading } = usePublicAuthStatus();
  return <section className="public-section border-t border-default-200">
    <PublicContainer>
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <PublicSectionHeading eyebrow={eyebrow} title={title}>{description}</PublicSectionHeading>
        <PublicLinkButton className="shrink-0" href={href || (!loading && isAuthenticated ? "/dashboard" : "/auth")}>
          {label || (!loading && isAuthenticated ? "Go to Dashboard" : "Get Started")}
        </PublicLinkButton>
      </div>
    </PublicContainer>
  </section>;
}
