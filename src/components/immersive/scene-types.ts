import type { RefObject } from "react";
import type { Vector2 } from "three";
import type { RenderQuality } from "@/hooks/useDeviceCapability";

export type SceneProgressRef = RefObject<number>;
export type ScenePointerRef = RefObject<Vector2>;

export type ViewportProfile = "mobile" | "tablet" | "desktop";

export type SceneProject = {
  id: string;
  title: string;
  imageUrl: string;
};

export type SceneMotionProps = {
  progressRef: SceneProgressRef;
  pointerRef: ScenePointerRef;
  quality: RenderQuality;
  reducedMotion: boolean;
  profile: ViewportProfile;
};

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const rangeProgress = (value: number, from: number, to: number) =>
  clamp01((value - from) / Math.max(to - from, Number.EPSILON));

export const smoothstep = (value: number, from: number, to: number) => {
  const progress = rangeProgress(value, from, to);
  return progress * progress * (3 - 2 * progress);
};
