"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useAdaptiveMotion } from "@/hooks/useAdaptiveMotion";

type AccentPlacement = "hero" | "services" | "serviceChapter" | "workspace";
type AccentDepth = "foreground" | "middle" | "background";
type AccentSize = "small" | "medium" | "large";

type Accent = {
  id: string;
  src: string;
  className: string;
  aspect: string;
  travel: number;
  xTravel: number;
  depth: AccentDepth;
  size: AccentSize;
  serviceId?: string;
};

const accents: Record<AccentPlacement, readonly Accent[]> = {
  hero: [
    { id: "commodity", src: "/images/home-accents/commodity-spices.webp", className: "bottom-[10%] left-[1%] w-[clamp(7rem,7vw,9rem)] opacity-55", aspect: "aspect-[640/427]", travel: 96, xTravel: 18, depth: "foreground", size: "small" },
    { id: "verification", src: "/images/home-accents/verification-clipboard.webp", className: "left-[-13%] top-[-24%] w-[clamp(6.5rem,6.5vw,8.5rem)] opacity-[0.42]", aspect: "aspect-[640/427]", travel: 60, xTravel: -10, depth: "middle", size: "medium" },
  ],
  services: [
    { id: "laboratory", src: "/images/home-accents/laboratory-sample.webp", className: "left-[-2.5rem] top-[7%] w-[clamp(6rem,7vw,8rem)] opacity-[0.3]", aspect: "aspect-[560/518]", travel: 84, xTravel: 14, depth: "foreground", size: "small" },
    { id: "forklift", src: "/images/home-accents/warehouse-forklift.webp", className: "right-[-5%] top-[34%] w-[clamp(15rem,18vw,20rem)] opacity-[0.28]", aspect: "aspect-[720/575]", travel: 44, xTravel: 10, depth: "background", size: "large" },
  ],
  serviceChapter: [
    { id: "logistics-container", src: "/images/home-accents/logistics-container.webp", className: "right-[-20%] top-[14%] w-[clamp(12rem,14vw,16rem)] opacity-[0.62]", aspect: "aspect-[640/427]", travel: 64, xTravel: 16, depth: "foreground", size: "large", serviceId: "freight" },
  ],
  workspace: [
    { id: "commodity", src: "/images/home-accents/commodity-spices.webp", className: "left-[-2.5rem] top-[12%] w-[clamp(7rem,8vw,9rem)] opacity-[0.25]", aspect: "aspect-[640/427]", travel: 34, xTravel: 3, depth: "foreground", size: "small" },
    { id: "cargo-ship", src: "/images/home-accents/cargo-ship.webp", className: "bottom-[1%] right-[-7%] w-[clamp(18rem,23vw,26rem)] opacity-[0.3]", aspect: "aspect-[800/451]", travel: 18, xTravel: -4, depth: "background", size: "large" },
  ],
};

function ParallaxAccent({ accent, placement, visible }: { accent: Accent; placement: AccentPlacement; visible: boolean }) {
  return (
    <div
      data-parallax-accent={accent.id}
      data-accent-placement={placement}
      data-accent-depth={accent.depth}
      data-accent-size={accent.size}
      data-accent-service={accent.serviceId}
      data-accent-visible={visible ? "true" : "false"}
      data-accent-travel={accent.travel}
      data-accent-x-travel={accent.xTravel}
      style={accent.serviceId ? { opacity: visible ? 0.62 : 0, scale: visible ? "1" : "0.9" } : undefined}
      className={`absolute ${accent.aspect} ${accent.className} transition-[opacity,scale] duration-500 [filter:drop-shadow(0_8px_10px_rgba(15,23,42,0.09))]`}
    >
      <Image src={accent.src} alt="" aria-hidden="true" fill sizes={accent.size === "large" ? "26rem" : "12rem"} className="object-contain" />
    </div>
  );
}

export default function ParallaxTradeAccents({ placement, motionEnabled, activeServiceId }: { placement: AccentPlacement; motionEnabled?: boolean; activeServiceId?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const adaptiveMotion = useAdaptiveMotion();
  const adaptiveMotionEnabled = !adaptiveMotion.prefersReducedMotion && !adaptiveMotion.isMobile && !adaptiveMotion.isTouch;
  const enabled = motionEnabled ?? adaptiveMotionEnabled;
  const isHeroComposition = placement === "hero";
  const isChapterComposition = placement === "serviceChapter";

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax-accent]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const range = window.innerHeight + rect.height;
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / Math.max(range, 1)));
      for (const item of items) {
        const travel = Number(item.dataset.accentTravel || 0);
        const xTravel = Number(item.dataset.accentXTravel || 0);
        item.style.transform = `translate3d(${(progress - 0.5) * xTravel}px, ${(0.5 - progress) * travel}px, 0)`;
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return (
    <div
      ref={rootRef}
      data-home-parallax-accents={placement}
      data-hero-floating-composition={isHeroComposition ? "true" : undefined}
      data-accent-motion={enabled ? "active" : "static"}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 hidden lg:block ${isHeroComposition ? "z-40 overflow-visible" : isChapterComposition ? "z-[2] overflow-visible" : "z-20 overflow-hidden"}`}
    >
      {accents[placement].map((accent) => {
        const visible = !accent.serviceId || accent.serviceId === activeServiceId;
        return <ParallaxAccent key={`${placement}-${accent.id}`} accent={accent} placement={placement} visible={visible} />;
      })}
    </div>
  );
}
