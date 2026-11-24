"use client";
/**
 * "Scroll to explore ↓" at the bottom of the hero, which fills the first screen (Fase 10.5) — so
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
      className="scroll-hint flex justify-center py-8 font-meta text-label text-muted uppercase"
    >
      <span>
        Scroll to explore <span className="inline-block">↓</span>
      </span>
    </p>
  );
}
