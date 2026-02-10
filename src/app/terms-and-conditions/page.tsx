import { Metadata } from "next";
import Content1 from "./content.mdx";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Terms and conditions governing access to and use of the OBAOL Supreme ecosystem."
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
