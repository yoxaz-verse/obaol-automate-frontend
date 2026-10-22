"use client";

import Image from "next/image";
import { motion, type MotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
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
    { id: "commodity", src: "/images/home-accents/commodity-spices.webp", className: "bottom-[-14%] left-[1%] w-[clamp(7rem,7vw,9rem)] opacity-55", aspect: "aspect-[640/427]", travel: 96, xTravel: 18, depth: "foreground", size: "small" },
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

function ParallaxAccent({ accent, placement, progress, enabled, visible }: { accent: Accent; placement: AccentPlacement; progress: MotionValue<number>; enabled: boolean; visible: boolean }) {
  const y = useTransform(progress, [0, 1], [accent.travel / 2, accent.travel / -2]);
  const x = useTransform(progress, [0, 1], [accent.xTravel / -2, accent.xTravel / 2]);

  return (
    <motion.div
      data-parallax-accent={accent.id}
      data-accent-placement={placement}
      data-accent-depth={accent.depth}
      data-accent-size={accent.size}
      data-accent-service={accent.serviceId}
      data-accent-visible={visible ? "true" : "false"}
      style={{ x: enabled ? x : 0, y: enabled ? y : 0 }}
      initial={false}
      animate={accent.serviceId ? { opacity: visible ? 0.62 : 0, scale: visible ? 1 : 0.9 } : undefined}
      transition={enabled ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
      className={`absolute ${accent.aspect} ${accent.className} will-change-transform [filter:drop-shadow(0_8px_10px_rgba(15,23,42,0.09))]`}
    >
      <Image src={accent.src} alt="" aria-hidden="true" fill sizes={accent.size === "large" ? "26rem" : "12rem"} className="object-contain" />
    </motion.div>
  );
}

export default function ParallaxTradeAccents({ placement, progress: sharedProgress, motionEnabled, activeServiceId }: { placement: AccentPlacement; progress?: MotionValue<number>; motionEnabled?: boolean; activeServiceId?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const adaptiveMotion = useAdaptiveMotion();
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start end", "end start"] });
  const localProgress = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.4 });
  const progress = sharedProgress ?? localProgress;
  const adaptiveMotionEnabled = !adaptiveMotion.prefersReducedMotion && !adaptiveMotion.isMobile && !adaptiveMotion.isTouch;
  const enabled = motionEnabled ?? adaptiveMotionEnabled;
  const isHeroComposition = placement === "hero";
  const isChapterComposition = placement === "serviceChapter";

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
        return <ParallaxAccent key={`${placement}-${accent.id}`} accent={accent} placement={placement} progress={progress} enabled={enabled} visible={visible} />;
      })}
    </div>
  );
}
