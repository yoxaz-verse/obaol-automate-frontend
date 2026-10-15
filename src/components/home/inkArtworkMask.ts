import type { CSSProperties } from "react";

const inkMask = 'url("/images/masks/ink-wash-edge.svg")';

export const inkArtworkMaskStyle = {
  maskImage: inkMask,
  maskPosition: "center",
  maskRepeat: "no-repeat",
  maskSize: "100% 100%",
  WebkitMaskImage: inkMask,
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskSize: "100% 100%",
} satisfies CSSProperties;
