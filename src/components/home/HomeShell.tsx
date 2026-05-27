import Link from "next/link";
import Header from "@/components/home/header";
import HeroLite from "@/components/home/HeroLite";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";
import CinematicIntro from "@/components/home/CinematicIntro";
import DeferredHomeSections from "@/components/home/DeferredHomeSections";

export default function HomeShell() {
  return (
    <>
      <CinematicIntro />
      <Header />
      <HeroLite />

      <section className="relative py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col gap-10 md:gap-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start">
              <div className="lg:col-span-5 space-y-5 md:space-y-6">
                <p className="inline-flex items-center gap-2 rounded-full border border-warning-500/20 bg-warning-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-warning-500 shadow-sm">
                  Industry Workspace
                </p>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground italic">What This Panel Does</h2>
                <p className="text-base md:text-xl text-foreground/80 font-medium leading-relaxed">
                  OBAOL is a commodity execution platform and execution ecosystem for agro trade workflows, not a marketplace.
                </p>
              </div>
              <div className="lg:col-span-7 space-y-4 lg:pt-14">
                <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed">
                  Build products, run enquiries, move orders, and manage documents with execution panels for each function.
                </p>
                <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed">
                  Importer Service and Warehouse Rent Management stay connected end to end in one execution workspace.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {[
                "Verified Ecosystem",
                "Enquiry Hub",
                "Execution Panels",
                "Product and Marketplace",
                "Samples and Documents",
                "Importer Service",
                "Warehouse Rent Management",
                "Orders and External Orders",
              ].map((title) => (
                <article key={title} className="p-6 md:p-7 rounded-[2rem] border border-default-200/60 bg-content1/30 backdrop-blur-md">
                  <h3 className="text-lg md:text-xl font-black tracking-tight text-foreground">{title}</h3>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-14">
            <IndiaFirstNote />
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/why-obaol" className="inline-flex items-center rounded-full border border-default-300 px-6 py-3 text-sm font-bold">
              Read Why OBAOL
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center rounded-full bg-foreground text-background px-6 py-3 text-sm font-bold">
              View How It Works
            </Link>
          </div>
        </div>
      </section>

      <DeferredHomeSections />
    </>
  );
}
