
import BrokenTradeSystemSection from "@/components/home/brokentradesystemsection";
import AboutSection from "@/components/home/aboutsection";
import CommodityServicesSection from "@/components/home/commodityservices";
import EndToEndSection from "@/components/home/endtoend";
import Footer from "@/components/home/footer";
import Header from "@/components/home/header";

import HeroSection from "@/components/home/herosection";
import ProcurementSpecialistSection from "@/components/home/procurementprocess";
import StartedIn from "@/components/home/startedin";
import SystemIntergrationSection from "@/components/home/systemintergration";
import TradeOperatingLayer from "@/components/home/tradeoperatinglayer";
import { Metadata } from "next";
import Link from "next/link";



export const metadata: Metadata = {
  title: "OBAOL Supreme | Commodity & Agro Trading Platform",
  description:
    "OBAOL is a verified commodity trading operating system. Securely trade agro commodities with integrated procurement, logistics, and trade execution.",
  keywords: ["Agro Commodities", "Commodity Trading", "Supply Chain", "Procurement", "Trade Execution", "OBAOL", "Agriculture", "B2B Trading"],
  authors: [{ name: "OBAOL Supreme" }],
  creator: "OBAOL Supreme",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://obaol.com",
    title: "OBAOL Supreme | Commodity & Agro Trading Platform",
    description: "Secure, verified agro commodity trading system. From procurement to logistics.",
    siteName: "OBAOL Supreme",
  },
  twitter: {
    card: "summary_large_image",
    title: "OBAOL Supreme | Commodity & Agro Trading Platform",
    description: "Secure, verified agro commodity trading system.",
    creator: "@obaol_supreme", // Placeholder if they have one, or remove
  },
  metadataBase: new URL('https://obaol.com'), // Important for resolving social images
};

export default function HomePage() {

  return (
    <main className="bg-background text-foreground overflow-hidden">
      {/* HERO */}
      <Header />
      <HeroSection />
      {/* CLARITY */}
      {/* COMMODITY FOCUS SECTION */}

      <CommodityServicesSection />
      <TradeOperatingLayer />
      <BrokenTradeSystemSection />

      {/* END-TO-END TIME SIMULATION (UPDATED) */}
      <EndToEndSection />

      <ProcurementSpecialistSection />


      <SystemIntergrationSection />

      {/* GLOBAL */}
      {/* TRADE SCOPE & ORIGIN */}
      <StartedIn />

      {/* ABOUT */}
      <AboutSection />

      {/* CTA */}
      <section className="py-24 px-6 border-t border-default-200 text-center">
        <h2 className="text-3xl font-semibold">
          Trade Faster. Trade Smarter. Trade Securely.
        </h2>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="https://typebot.co/obaol-early-access"
            target="_blank"
            className="px-6 py-3 rounded-md bg-warning text-warning-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Apply for Early Access
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}


