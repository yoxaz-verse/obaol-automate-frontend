import { Metadata } from "next";
import AboutContent1 from "./about.content.1.mdx";
import AboutContent2 from "./about.content.2.mdx";
import FadeIn from "./FadeIn";
import { Spacer } from "@nextui-org/react";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";



export const metadata: Metadata = {
    title: "About OBAOL Supreme",
    description:
"OBAOL Supreme is an execution-focused agro trade support system built for serious commodity traders and new market entrants."

};
export default function AboutPage() {
  return (
    <section>
    <Header/>
 <section className="py-32 px-6 bg-black">
      <div className="max-w-4xl mx-auto prose prose-invert">
        <FadeIn>
        <AboutContent1 />
        </FadeIn>

        <Spacer y={32}/>
        <FadeIn>
        <AboutContent2 />
        </FadeIn>
      </div>
      </section>
      <Footer/>
      </section>
  );
}
