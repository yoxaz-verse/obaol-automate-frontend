import { Metadata } from "next";
import Content1 from "./content.1.mdx";
import Content2 from "./content.2.mdx";
import FadeIn from "./FadeIn";
import { Spacer } from "@nextui-org/react";
import ProcurementSpecialistSection from "@/components/home/procurementprocess";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

const BASE_URL = "https://obaol.com";

export const metadata: Metadata = {
  title: "Procurement & Verification Support | OBAOL",
  description:
    "Explore OBAOL procurement and verification support for consistent commodity sourcing quality and execution reliability.",
  alternates: {
    canonical: `${BASE_URL}/procurement`,
  },
  openGraph: {
    title: "Procurement & Verification Support | OBAOL",
    description:
      "Structured procurement, on-ground checks, and verification processes for commodity trade operations.",
    url: `${BASE_URL}/procurement`,
    type: "article",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "OBAOL Procurement Support" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Procurement & Verification Support | OBAOL",
    description:
      "Execution-grade procurement and verification model for commodity sourcing.",
    images: ["/logo.png"],
  },
};
export default function ProcurementPage() {
  return (
    <section>
      <Header />
      <ThemedContentWrapper>
        <FadeIn>
          <Content1 />
        </FadeIn>
        <ProcurementSpecialistSection key="procurement-specialist-section" />
        <FadeIn>
          <Content2 />
        </FadeIn>
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
