import { Metadata } from "next";
import Content from "./content.mdx";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

export const metadata: Metadata = {
  title: "Operator vs Associate | OBAOL Supreme",
  description:
    "Clear role definitions for Operators and Associates on the OBAOL Supreme platform.",
};

export default function RolesPage() {
  return (
    <section>
      <Header />
      <ThemedContentWrapper>
        <Content />
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
