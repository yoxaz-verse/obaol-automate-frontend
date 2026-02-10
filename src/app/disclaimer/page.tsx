import { Metadata } from "next";
import Content1 from "./content.mdx";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

export const metadata: Metadata = {
  title: "Disclaimer & Engagement Terms",
  description:
    "Important information about OBAOL Supreme’s engagement model, responsibilities, and limitations."
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
