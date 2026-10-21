"use client";

import Image from "next/image";
import { motion, type MotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { useAdaptiveMotion } from "@/hooks/useAdaptiveMotion";

type AccentPlacement = "hero" | "services" | "workspace";

type Accent = {
  id: string;
  src: string;
  className: string;
  aspect: string;
  travel: number;
};

const accents: Record<AccentPlacement, readonly Accent[]> = {
  hero: [
    { id: "commodity", src: "/images/home-accents/commodity-spices.webp", className: "bottom-[2%] left-[43%] w-[clamp(6rem,8vw,9rem)] opacity-70", aspect: "aspect-[640/427]", travel: 16 },
    { id: "verification", src: "/images/home-accents/verification-clipboard.webp", className: "left-[42%] top-[17%] w-[clamp(4.5rem,6vw,7rem)] opacity-55", aspect: "aspect-[640/427]", travel: 10 },
    { id: "logistics", src: "/images/home-accents/logistics-container.webp", className: "right-[-3%] top-[11%] w-[clamp(7rem,10vw,12rem)] opacity-65", aspect: "aspect-[640/427]", travel: 18 },
  ],
  services: [
    { id: "laboratory", src: "/images/home-accents/laboratory-sample.webp", className: "left-[-2.5rem] top-[7%] w-[clamp(5rem,7vw,8rem)] opacity-45", aspect: "aspect-[560/518]", travel: 12 },
    { id: "packaging", src: "/images/home-accents/packaging-sack.webp", className: "bottom-[2%] right-[-2rem] w-[clamp(5rem,7vw,8rem)] opacity-45", aspect: "aspect-[560/525]", travel: 16 },
  ],
  workspace: [
    { id: "commodity", src: "/images/home-accents/commodity-spices.webp", className: "left-[-2.5rem] top-[12%] w-[clamp(5rem,7vw,8rem)] opacity-40", aspect: "aspect-[640/427]", travel: 10 },
    { id: "logistics", src: "/images/home-accents/logistics-container.webp", className: "bottom-[4%] right-[-3rem] w-[clamp(6rem,8vw,9rem)] opacity-40", aspect: "aspect-[640/427]", travel: 16 },
  ],
};

function ParallaxAccent({ accent, placement, progress, enabled }: { accent: Accent; placement: AccentPlacement; progress: MotionValue<number>; enabled: boolean }) {
  const y = useTransform(progress, [0, 1], [accent.travel / 2, accent.travel / -2]);

  return (
    <motion.div
      data-parallax-accent={accent.id}
      data-accent-placement={placement}
      style={{ y: enabled ? y : 0 }}
      className={`absolute ${accent.aspect} ${accent.className} will-change-transform [filter:drop-shadow(0_10px_12px_rgba(15,23,42,0.12))]`}
    >
      <Image src={accent.src} alt="" aria-hidden="true" fill sizes="12rem" className="object-contain" />
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
