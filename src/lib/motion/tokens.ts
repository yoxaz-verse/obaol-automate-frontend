export const MOTION_DURATION = {
  instant: 0,
  fast: 0.16,
  base: 0.24,
  slow: 0.34,
} as const;

export const MOTION_EASE = {
  standard: [0.22, 1, 0.36, 1] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
} as const;

export const MOTION_OFFSET = {
  pageY: 8,
  panelY: 6,
  sectionY: 10,
} as const;
