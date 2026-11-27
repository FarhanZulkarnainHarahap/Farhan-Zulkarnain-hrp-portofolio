"use client";
/**
 * ReducedMotionProvider (Fase K3): tracks prefers-reduced-motion live and publishes it to the
 * shared animation state. Engines read `snapshot.reducedMotion`; CSS already neutralises the
 * duration/distance tokens, so token caches are invalidated when the preference flips.
 * Under reduced motion: no Lenis (native scroll), GSAP helpers jump to final states, Motion skips
 * transforms (MotionProvider reducedMotion="user"), Theatre sequences are not auto-played, and 3D
 * scenes render still frames.
 */
import { useEffect, type ReactNode } from "react";
import { invalidateDesignTokens } from "@/lib/design-tokens";
import { animationStore } from "@/lib/animation/state";

const QUERY = "(prefers-reduced-motion: reduce)";

let override: boolean | null = null;
let reapply: (() => void) | null = null;

/**
 * Forces the engines' reduced-motion behaviour (true/false) or follows the OS again (null).
 * Used by the animation lab to demonstrate reduced motion without changing OS settings. CSS
 * tokens follow only the real media query, so engines must also branch on the snapshot.
 */
export function setReducedMotionOverride(value: boolean | null) {
  override = value;
  reapply?.();
}

export function ReducedMotionProvider({ children }: { children?: ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const apply = () => {
      invalidateDesignTokens();
      animationStore.set({ reducedMotion: override ?? media.matches });
    };
    reapply = apply;
    apply();
    media.addEventListener("change", apply);
    return () => {
      reapply = null;
      media.removeEventListener("change", apply);
    };
  }, []);
  return children;
}
