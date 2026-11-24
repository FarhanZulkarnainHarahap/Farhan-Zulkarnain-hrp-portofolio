"use client";
/**
 * CardSpotlight — the light layer of React Bits' SpotlightCard (SpotlightCard-TS-TW), adapted.
 * The original is a whole card with hardcoded surfaces; here only the spotlight is kept, as a
 * decorative overlay inside an existing `.group` card:
 *  - pointer-events: none, so the card's click/focus area is unchanged (focus ring stays on the card);
 *  - follows a fine pointer on hover (rAF-throttled, no loop); centred on keyboard focus (CSS);
 *  - prefers-reduced-motion: does not track the pointer (stays centred);
 *  - colors/size from tokens (--spotlight-color, --spotlight-size).
 */
import { useEffect, useRef } from "react";

export function CardSpotlight() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const layer = ref.current;
    const card = layer?.parentElement;
    if (!layer || !card) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      layer.style.setProperty("--spot-x", `${x}px`);
      layer.style.setProperty("--spot-y", `${y}px`);
    };
    const onMove = (event: PointerEvent) => {
      if (!fine.matches || reduce.matches || event.pointerType !== "mouse")
        return;
      const rect = card.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      layer.style.removeProperty("--spot-x");
      layer.style.removeProperty("--spot-y");
    };
    card.addEventListener("pointermove", onMove, { passive: true });
    card.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="card-spotlight absolute inset-0 rounded-(--card-radius)"
    />
  );
}
