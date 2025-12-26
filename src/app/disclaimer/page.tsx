import { Metadata } from "next";
import Content1 from "./content.mdx";
import Header from "@/components/home/header";



export const metadata: Metadata = {
    title: "Disclaimer & Engagement Terms",
    description:
    "Important information about OBAOL Supreme’s engagement model, responsibilities, and limitations."
};
export default function DisclaimerPage() {
  return (
    <section>
    <Header/>

  <section className="py-32 px-6 bg-black">
      <div className="max-w-4xl mx-auto prose prose-invert">
        <Content1 />

      </div>
    </section>
    </section>
  );
}
