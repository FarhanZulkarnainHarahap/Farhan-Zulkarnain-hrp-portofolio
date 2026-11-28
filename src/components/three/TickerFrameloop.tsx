"use client";
/**
 * Renders an R3F canvas from the shared ticker's "render" phase (Fase K3). Use with
 * <Canvas frameloop="never">: R3F's own rAF loop stays off and the frame is advanced after Lenis
 * (scroll) and Theatre (timeline) have written their values for this frame — one loop for all.
 * Rendering also stops while the canvas is offscreen (IntersectionObserver) or the tab is hidden
 * (the ticker's rAF stops by itself).
 *
 * Clock (fixed in Fase K4): R3F's advance(t) takes the scene time in SECONDS; K3 passed
 * performance.now() in milliseconds, so idle and damping ran on a 1000× time scale. The scene
 * clock here advances by the real frame time, clamped to 50 ms (a resume after a hidden tab counts
 * as one normal frame), so nothing jumps.
 */
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { addTick } from "@/lib/animation/ticker";

export function TickerFrameloop({ onFrame }: { onFrame?: (now: number) => void }) {
  const advance = useThree((s) => s.advance);
  const canvas = useThree((s) => s.gl.domElement);
  useEffect(() => {
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);
    let last = 0;
    let clock = 0;
    const remove = addTick("render", (_time, _delta, now) => {
      if (!visible) {
        last = 0;
        return;
      }
      const step = last ? (now - last) / 1000 : 0;
      last = now;
      clock += step <= 0 || step > 0.25 ? 1 / 60 : Math.min(step, 0.05);
      advance(clock);
      onFrame?.(now);
    });
    return () => {
      remove();
      observer.disconnect();
    };
  }, [advance, canvas, onFrame]);
  return null;
}
