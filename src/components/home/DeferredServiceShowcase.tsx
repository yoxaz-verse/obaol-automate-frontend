"use client";

import dynamic from "next/dynamic";
import { useInViewport } from "@/hooks/useInViewport";

const ServiceShowcase = dynamic(() => import("@/components/home/ServiceShowcase"), {
  ssr: false,
  loading: () => (
    <section className="bg-background py-16 md:py-24" aria-hidden="true">
      <div className="container mx-auto max-w-6xl xl:max-w-7xl px-6 sm:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <div className="lg:col-span-4 space-y-5">
            <div className="h-4 w-36 rounded-full bg-content1" />
            <div className="h-16 max-w-sm rounded-2xl bg-content1" />
            <div className="h-24 max-w-md rounded-2xl bg-content1/70" />
          </div>
          <div className="lg:col-span-8">
            <div className="min-h-[420px] rounded-[2rem] border border-obaol-500/10 bg-content1/45 md:min-h-[560px]" />
          </div>
        </div>
      </div>
    </section>
  ),
});

export default function DeferredServiceShowcase() {
  const [anchorRef, shouldLoad] = useInViewport<HTMLDivElement>({
    rootMargin: "640px 0px",
    once: true,
  });

  return (
    <>
      <div ref={anchorRef} aria-hidden="true" className="h-px w-full" />
      {shouldLoad ? <ServiceShowcase /> : null}
    </>
  );
}
