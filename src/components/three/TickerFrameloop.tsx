"use client";
/**
 * Renders an R3F canvas from the shared ticker's "render" phase (Fase K3). Use with
 * <Canvas frameloop="never">: R3F's own rAF loop stays off and the frame is advanced after Lenis
 * (scroll) and Theatre (timeline) have written their values for this frame — one loop for all.
 * Rendering also stops while the canvas is offscreen (IntersectionObserver) or the tab is hidden
 * (the ticker's rAF stops by itself).
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
    const remove = addTick("render", (_time, _delta, now) => {
      if (!visible) return;
      advance(now);
      onFrame?.(now);
    });
    return () => {
      remove();
      observer.disconnect();
    };
  }, [advance, canvas, onFrame]);
  return null;
}
