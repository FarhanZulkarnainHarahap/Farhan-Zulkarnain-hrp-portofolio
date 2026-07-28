export const motionEase = [0.22, 1, 0.36, 1] as const;

export const motionSpring = {
  type: "spring",
  stiffness: 180,
  damping: 24,
  mass: 0.82,
} as const;

export const motionTiming = {
  fast: 0.22,
  base: 0.46,
  slow: 0.72,
  intro: 1.7,
} as const;

export const stagger = {
  tight: 0.045,
  base: 0.08,
  relaxed: 0.12,
} as const;
