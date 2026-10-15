import type { CSSProperties } from "react";

const inkMask = 'url("/images/masks/ink-wash-edge.svg")';

const sharedInkMaskStyle = {
  maskImage: inkMask,
  maskPosition: "center",
  maskRepeat: "no-repeat",
  WebkitMaskImage: inkMask,
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
} satisfies CSSProperties;

export const inkArtworkMaskStyle = {
  ...sharedInkMaskStyle,
  maskSize: "98% 96%",
  WebkitMaskSize: "98% 96%",
} satisfies CSSProperties;

export const spaciousInkArtworkMaskStyle = {
  ...sharedInkMaskStyle,
  maskSize: "94% 94%",
  WebkitMaskSize: "94% 94%",
} satisfies CSSProperties;
