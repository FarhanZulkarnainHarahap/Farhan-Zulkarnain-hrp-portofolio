"use client";
/**
 * ShinyText — adapted from React Bits (ShinyText-TS-TW). The original paints a gradient every
 * frame with colors parsed on a canvas (cannot read CSS tokens, ignores theme switches). Here the
 * same sweep is a single CSS animation driven by tokens (--shine-color, --shine-duration):
 *  - one sweep when the text first scrolls into view, again on hover / focus;
 *  - outside a sweep the text is ordinary text in its token color (intact without JS, AA);
 *  - prefers-reduced-motion: never sweeps.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ShinyText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const run = () => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    delete el.dataset.shine;
    void el.offsetWidth; // restart the animation
    el.dataset.shine = "run";
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      run();
    });
    observer.observe(el);
    const done = () => delete el.dataset.shine;
    el.addEventListener("animationend", done);
    return () => {
      observer.disconnect();
      el.removeEventListener("animationend", done);
    };
  }, []);

  return (
    <span
      ref={ref}
      onPointerEnter={run}
      onFocus={run}
      className={cn("shiny-text", className)}
    >
      {children}
    </span>
  );
}
