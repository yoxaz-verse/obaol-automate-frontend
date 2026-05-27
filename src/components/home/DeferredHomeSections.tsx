"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const HomeDeferredContent = dynamic(() => import("@/components/home/HomeDeferredContent"), {
  ssr: false,
  loading: () => (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="h-64 rounded-3xl border border-default-200/60 bg-content1/40 animate-pulse" />
      </div>
    </section>
  ),
});

export default function DeferredHomeSections() {
  const [enabled, setEnabled] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!anchorRef.current) return;

    const node = anchorRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEnabled(true);
          observer.disconnect();
        }
      },
      { rootMargin: "420px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={anchorRef} aria-hidden="true" className="h-px w-full" />
      {enabled ? <HomeDeferredContent /> : null}
    </>
  );
}
