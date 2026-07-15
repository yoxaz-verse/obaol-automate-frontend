"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type AdaptiveMotionState = {
  isMobile: boolean;
  isTouch: boolean;
  isLowPower: boolean;
  prefersReducedMotion: boolean;
  shouldReduceMotion: boolean;
  allowDecorativeMotion: boolean;
  allowPointerEffects: boolean;
};

const defaultState: AdaptiveMotionState = {
  isMobile: true,
  isTouch: true,
  isLowPower: false,
  prefersReducedMotion: false,
  shouldReduceMotion: true,
  allowDecorativeMotion: false,
  allowPointerEffects: false,
};

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory?: number;
};

export function useAdaptiveMotion(): AdaptiveMotionState {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    const mobileMedia = window.matchMedia("(max-width: 1023px)");
    const touchMedia = window.matchMedia("(hover: none), (pointer: coarse)");
    const lowPowerMedia = window.matchMedia("(update: slow)");

    const update = () => {
      const nav = window.navigator as NavigatorWithDeviceMemory;
      const isLowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
      const isLowCore = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
      const isMobile = mobileMedia.matches;
      const isTouch = touchMedia.matches;
      const isLowPower = lowPowerMedia.matches || isLowMemory || isLowCore;
      const shouldReduceMotion = prefersReducedMotion || isMobile || isTouch || isLowPower;

      setState({
        isMobile,
        isTouch,
        isLowPower,
        prefersReducedMotion,
        shouldReduceMotion,
        allowDecorativeMotion: !shouldReduceMotion,
        allowPointerEffects: !shouldReduceMotion && !isTouch,
      });
    };

    update();
    mobileMedia.addEventListener("change", update);
    touchMedia.addEventListener("change", update);
    lowPowerMedia.addEventListener("change", update);

    return () => {
      mobileMedia.removeEventListener("change", update);
      touchMedia.removeEventListener("change", update);
      lowPowerMedia.removeEventListener("change", update);
    };
  }, [prefersReducedMotion]);

  return {
    ...state,
    prefersReducedMotion,
    shouldReduceMotion: prefersReducedMotion || state.shouldReduceMotion,
    allowDecorativeMotion: !prefersReducedMotion && state.allowDecorativeMotion,
    allowPointerEffects: !prefersReducedMotion && state.allowPointerEffects,
  };
}
