
import BrokenTradeSystemSection from "@/components/home/brokentradesystemsection";
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
  title: "Commodity & Agro Trading Platform",
  description:
    "OBAOL is a commodity trading operating system for agro commodities, enabling supplier discovery, verification, procurement, logistics, and secure trade execution — without capital-heavy entry barriers.",
};

export default function HomePage() {
 
  return (
    <main className=" text-white overflow-hidden">
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
<StartedIn/>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-gray-800 text-center">
        <h2 className="text-3xl font-semibold">
          Trade Faster. Trade Smarter. Trade Securely.
        </h2>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="https://typebot.co/obaol-early-access"
  target="_blank"

            className="px-6 py-3 rounded-md bg-white text-black font-medium"
          >
    Apply for Early Access
    </Link>
          {/* <Link
            href="/product"
            className="px-6 py-3 rounded-md border border-gray-600 text-white"
          >
            Learn How It Works
          </Link> */}
        </div>
      </section>
      <Footer />
    </main>
  );
}


