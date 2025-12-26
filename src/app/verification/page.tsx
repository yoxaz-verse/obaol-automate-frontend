import { Metadata } from "next";
import Content1 from "./content.1.mdx";
import Content2 from "./content.2.mdx";
import FadeIn from "./FadeIn";
import { Spacer } from "@nextui-org/react";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";



export const metadata: Metadata = {
    title: "Procurement Support",
    description:
"OBAOL provides structured procurement support to ensure commodity sourcing executes reliably and as agreed."};
export default function ProcurementPage() {
  return (
    <section>
    <Header/>

  <section className="py-32 px-6 bg-black">
      <div className="max-w-4xl mx-auto prose prose-invert">
        <FadeIn>
        <Content1 />
        </FadeIn>
        <Spacer y={32}/>
        <FadeIn>
        <Content2 />
        </FadeIn>
      </div>
      </section>
      <Footer/>
      </section>
  );
}
