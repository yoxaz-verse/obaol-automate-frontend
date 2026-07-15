"use client";

import { RefObject, useEffect, useRef, useState } from "react";

type ViewportOptions = {
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
  initialInView?: boolean;
};

export function useInViewport<T extends HTMLElement>({
  rootMargin = "0px",
  threshold = 0,
  once = false,
  initialInView = false,
}: ViewportOptions = {}): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(initialInView);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const next = entries.some((entry) => entry.isIntersecting);
        setIsInView(next);
        if (next && once) observer.disconnect();
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return [ref, isInView];
}
