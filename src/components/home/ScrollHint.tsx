"use client";
/**
 * Scroll indicator at the bottom of the hero (Kinetic): "Scroll down" on the left, a rail with a
 * travelling dot on the right (CSS, stops under reduced motion). Earlier: "Scroll to explore ↓" at the bottom of the hero, which fills the first screen (Fase 10.5) — so
 * nothing below it is painted at load and the H1 stays the LCP element. A visual cue only (aria-hidden; the content
 * below is reachable normally). It appears in the hero intro at ≈ 2 s with one gentle nudge (no
 * loop, MotionController) and hides for good as soon as the page scrolls. One passive scroll
 * listener, removed after the first scroll or on unmount.
 */
import { useEffect, useRef } from "react";

export function ScrollHint() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const hide = () => {
      if (window.scrollY < 8) return;
      el.dataset.hidden = "true";
      window.removeEventListener("scroll", hide);
    };
    hide();
    window.addEventListener("scroll", hide, { passive: true });
    return () => window.removeEventListener("scroll", hide);
  }, []);

  return (
    <p
      ref={ref}
      aria-hidden="true"
      data-intro="hint"
      className="scroll-hint pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-full max-w-wide px-gutter pb-6 font-meta text-label text-muted uppercase"
    >
      <span className="flex items-end justify-between">
        <span>Scroll down</span>
        <span className="scroll-rail" />
      </span>
    </p>
  );
}
