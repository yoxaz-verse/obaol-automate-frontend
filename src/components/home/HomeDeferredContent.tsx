"use client";

import Link from "next/link";
import CTASection from "@/components/home/ctasection";
import Footer from "@/components/home/footer";

const intentCards = [
  {
    title: "Why OBAOL",
    description:
      "Understand why OBAOL is needed, what problem it solves, and why execution structure matters in real commodity trade.",
    href: "/why-obaol",
    cta: "Read Why OBAOL",
  },
  {
    title: "How OBAOL Works",
    description:
      "See the complete step-by-step execution model covering procurement, verification, logistics, and settlement.",
    href: "/how-it-works",
    cta: "View How It Works",
  },
];

export default function HomeDeferredContent() {
  return (
    <>
      <section className="relative py-16 md:py-24 bg-background overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-3xl mb-12 md:mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground">
              Built for <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent italic">Serious Trade.</span>
            </h2>
            <p className="text-base md:text-xl text-default-500 font-medium leading-relaxed">
              OBAOL moves trades from conversation to closure with verified counterparties and execution support across every milestone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              "Verified Network",
              "Unified Execution",
              "Global Compliance",
            ].map((title) => (
              <article key={title} className="p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-content1 border border-default-200">
                <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 tracking-tight">{title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-24 bg-default-50/50 border-y border-default-100">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {intentCards.map((card) => (
              <article key={card.href} className="relative p-[1px] bg-gradient-to-br from-default-200 via-transparent to-default-200 rounded-[1.5rem] md:rounded-[3rem] overflow-hidden">
                <div className="relative p-6 md:p-12 rounded-[1.4rem] md:rounded-[2.8rem] bg-white dark:bg-[#0A0A0A] h-full flex flex-col justify-between items-start gap-6 md:gap-12">
                  <div className="space-y-3 md:space-y-6">
                    <h3 className="text-xl md:text-3xl font-black tracking-tight">{card.title}</h3>
                    <p className="text-sm md:text-lg text-default-500 leading-relaxed font-medium">{card.description}</p>
                  </div>
                  <Link href={card.href} className="inline-flex items-center gap-4 px-6 py-3 md:px-10 md:py-5 rounded-full bg-foreground text-background font-black text-sm md:text-lg">
                    {card.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden bg-black text-white">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
          <div className="max-w-3xl space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
              India-first execution <br />
              <span className="text-orange-500">from India to anywhere.</span>
            </h2>
            <p className="text-xl text-white/50 leading-relaxed font-medium">
              Operations are currently India based. We support exports from India to global markets.
            </p>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </>
  );
}
