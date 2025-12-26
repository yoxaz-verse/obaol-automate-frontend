import { Metadata } from "next";
import Content1 from "./content.mdx";
import Header from "@/components/home/header";



export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
    "Learn how OBAOL Supreme collects, uses, and protects your information within its verified agro trade ecosystem."
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
