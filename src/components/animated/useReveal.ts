"use client";
/**
 * Reveal phase for Motion components (Fase K3). Content never depends on animation:
 *  - the server (and no-JS, and reduced motion) renders the final, visible state;
 *  - after mount, only an element still BELOW the first screen is set to "hidden" — in a layout
 *    effect, before paint, so nothing visible ever blinks — and revealed when it enters the
 *    viewport (once);
 *  - something already on screen stays as it is (never hidden while the page loads; the LCP text
 *    is never touched).
 */
import { useInView, useReducedMotion } from "motion/react";
import { useLayoutEffect, useState, type RefObject } from "react";

export type RevealPhase = "shown" | "hidden" | "enter";

export function useReveal(ref: RefObject<Element | null>, { margin = "0px 0px -15% 0px" as const } = {}) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<RevealPhase>("shown");
  const inView = useInView(ref, { once: true, margin });

  useLayoutEffect(() => {
    const el = ref.current;
    if (reduced || !el) return;
    // One pre-paint measurement decides the initial phase.
    if (el.getBoundingClientRect().top >= window.innerHeight) setPhase("hidden");
  }, [ref, reduced]);

  const current: RevealPhase = phase === "hidden" && inView ? "enter" : phase;
  /** Variant to animate to: "hidden" (instant) or "enter". */
  const variant = current === "hidden" ? "hidden" : "enter";
  return { phase: current, variant } as const;
}
