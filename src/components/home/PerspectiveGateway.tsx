import { FiArrowRight, FiCompass, FiShield, FiUsers } from "react-icons/fi";
import { PublicContainer, PublicSectionHeading, PublicCard, PublicLinkButton } from "@/components/public/PublicUI";
import RevealImage from "@/components/ui/RevealImage";

const perspectives = [
  {
    number: "01 / 03",
    title: "Understand the market",
    description:
      "Learn how OBAOL sees the gaps in commodity trade—and why trust, context, and disciplined execution matter.",
    href: "/why-obaol",
    cta: "Read our perspective",
    icon: FiCompass,
    signal: "Market context",
  },
  {
    number: "02 / 03",
    title: "Work with confidence",
    description:
      "See how verification, market protection, and structured coordination create a more credible trade environment.",
    href: "/trust",
    cta: "Explore our standards",
    icon: FiShield,
    signal: "Verified execution",
  },
  {
    number: "03 / 03",
    title: "Find your place",
    description:
      "Buyers, suppliers, exporters, service partners, and operators can contribute through roles that go beyond a single transaction.",
    href: "/roles",
    cta: "Explore the ecosystem",
    icon: FiUsers,
    signal: "Role-based participation",
  },
] as const;

export default function PerspectiveGateway() {
  return (
    <section aria-labelledby="obaol-perspective-heading" className="public-section public-perspective">
      <div className="public-perspective-art" aria-hidden="true">
        <RevealImage src="/images/order-execution-laptop.png" alt="" fill sizes="100vw" className="object-cover object-center" />
      </div>
      <PublicContainer className="relative z-10">
        <PublicSectionHeading id="obaol-perspective-heading" eyebrow="The OBAOL perspective" title="Trade is more than buying and selling.">
          <p>OBAOL helps participants understand the market, act with verified confidence, and execute through trust—not merely complete transactions.</p>
        </PublicSectionHeading>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {perspectives.map((perspective) => (
            <PublicCard key={perspective.href} data-perspective-card="true" className="flex flex-col">
              <div className="mb-7 flex items-center justify-between">
                <span className="public-icon"><perspective.icon size={22} aria-hidden="true" /></span>
                <span className="text-xs public-muted">{perspective.number}</span>
              </div>
              <p className="public-eyebrow">{perspective.signal}</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{perspective.title}</h3>
              <p className="mt-3 flex-1 public-muted leading-7">{perspective.description}</p>
              <PublicLinkButton href={perspective.href} variant="secondary" className="mt-7 self-start">
                {perspective.cta}<FiArrowRight aria-hidden="true" />
              </PublicLinkButton>
            </PublicCard>
          ))}
        </div>
      </PublicContainer>
    </section>
  );
}
