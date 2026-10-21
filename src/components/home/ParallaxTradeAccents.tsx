"use client";

import Image from "next/image";
import { motion, type MotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { useAdaptiveMotion } from "@/hooks/useAdaptiveMotion";

type AccentPlacement = "hero" | "services" | "workspace";
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
};

const accents: Record<AccentPlacement, readonly Accent[]> = {
  hero: [
    { id: "commodity", src: "/images/home-accents/commodity-spices.webp", className: "bottom-[1%] left-[42%] w-[clamp(8rem,9vw,11rem)] opacity-70", aspect: "aspect-[640/427]", travel: 38, xTravel: 4, depth: "foreground", size: "small" },
    { id: "verification", src: "/images/home-accents/verification-clipboard.webp", className: "left-[40%] top-[14%] w-[clamp(7rem,7vw,9rem)] opacity-55", aspect: "aspect-[640/427]", travel: 26, xTravel: -3, depth: "middle", size: "medium" },
    { id: "logistics", src: "/images/home-accents/logistics-container.webp", className: "right-[-9%] top-[7%] w-[clamp(18rem,20vw,24rem)] opacity-60", aspect: "aspect-[640/427]", travel: 20, xTravel: 3, depth: "background", size: "large" },
  ],
  services: [
    { id: "laboratory", src: "/images/home-accents/laboratory-sample.webp", className: "left-[-2.5rem] top-[7%] w-[clamp(6rem,7vw,8rem)] opacity-45", aspect: "aspect-[560/518]", travel: 34, xTravel: 4, depth: "foreground", size: "small" },
    { id: "packaging", src: "/images/home-accents/packaging-sack.webp", className: "bottom-[2%] right-[14%] w-[clamp(9rem,10vw,12rem)] opacity-40", aspect: "aspect-[560/525]", travel: 26, xTravel: -3, depth: "middle", size: "medium" },
    { id: "forklift", src: "/images/home-accents/warehouse-forklift.webp", className: "right-[-5%] top-[34%] w-[clamp(15rem,18vw,20rem)] opacity-48", aspect: "aspect-[720/575]", travel: 20, xTravel: 5, depth: "background", size: "large" },
  ],
  workspace: [
    { id: "commodity", src: "/images/home-accents/commodity-spices.webp", className: "left-[-2.5rem] top-[12%] w-[clamp(7rem,8vw,9rem)] opacity-38", aspect: "aspect-[640/427]", travel: 36, xTravel: 4, depth: "foreground", size: "small" },
    { id: "cargo-ship", src: "/images/home-accents/cargo-ship.webp", className: "bottom-[1%] right-[-7%] w-[clamp(18rem,23vw,26rem)] opacity-48", aspect: "aspect-[800/451]", travel: 18, xTravel: -5, depth: "background", size: "large" },
  ],
};

function ParallaxAccent({ accent, placement, progress, enabled }: { accent: Accent; placement: AccentPlacement; progress: MotionValue<number>; enabled: boolean }) {
  const y = useTransform(progress, [0, 1], [accent.travel / 2, accent.travel / -2]);
  const x = useTransform(progress, [0, 1], [accent.xTravel / -2, accent.xTravel / 2]);

  return (
    <motion.div
      data-parallax-accent={accent.id}
      data-accent-placement={placement}
      data-accent-depth={accent.depth}
      data-accent-size={accent.size}
      style={{ x: enabled ? x : 0, y: enabled ? y : 0 }}
      className={`absolute ${accent.aspect} ${accent.className} will-change-transform [filter:drop-shadow(0_10px_12px_rgba(15,23,42,0.12))]`}
    >
      <Image src={accent.src} alt="" aria-hidden="true" fill sizes={accent.size === "large" ? "26rem" : "12rem"} className="object-contain" />
    </motion.div>
  );
}

export default function ParallaxTradeAccents({ placement }: { placement: AccentPlacement }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const adaptiveMotion = useAdaptiveMotion();
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.4 });
  const enabled = !adaptiveMotion.prefersReducedMotion && !adaptiveMotion.isMobile && !adaptiveMotion.isTouch;

  return (
    <div
      ref={rootRef}
      data-home-parallax-accents={placement}
      data-accent-motion={enabled ? "active" : "static"}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 hidden overflow-hidden lg:block"
    >
      {accents[placement].map((accent) => (
        <ParallaxAccent key={`${placement}-${accent.id}`} accent={accent} placement={placement} progress={progress} enabled={enabled} />
      ))}
    </div>
  );
}
