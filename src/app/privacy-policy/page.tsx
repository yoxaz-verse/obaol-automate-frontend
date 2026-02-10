import { Metadata } from "next";
import Content1 from "./content.mdx";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how OBAOL Supreme collects, uses, and protects your information within its verified agro trade ecosystem."
};
export default function DisclaimerPage() {
  return (
    <section>
      <Header />
      <ThemedContentWrapper>
        <Content1 />
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
