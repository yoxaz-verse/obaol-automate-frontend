import { Metadata } from "next";
import Content1 from "./content.1.mdx";
import Content2 from "./content.2.mdx";
import FadeIn from "./FadeIn";
import { Spacer } from "@nextui-org/react";
import EndToEndSection from "@/components/home/endtoend";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

export const metadata: Metadata = {
  title: "How OBAOL Works",
  description:
    "How OBAOL supports commodity trade execution through verification, coordination, and closure."
};
export default function AboutPage() {
  return (
    <section>
      <Header />
      <ThemedContentWrapper>
        <FadeIn>
          <Content1 />
        </FadeIn>
        <EndToEndSection />
        <FadeIn>
          <Content2 />
        </FadeIn>
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
