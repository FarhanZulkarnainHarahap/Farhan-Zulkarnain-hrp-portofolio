"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

export type AssetInteraction = { hovered: boolean; scroll: number };

/** Load near the viewport; sample scroll without rerendering React on every tick. */
export function useAssetViewport() {
  const ref = useRef<HTMLDivElement>(null);
  const interaction = useRef<AssetInteraction>({ hovered: false, scroll: 0 });
  const [entered, setEntered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [failed, setFailed] = useState(false);
  const onFailure = useCallback(() => setFailed(true), []);
  const onPointerEnter = useCallback((event: PointerEvent) => {
    interaction.current.hovered = event.pointerType !== "touch";
  }, []);
  const onPointerLeave = useCallback(() => { interaction.current.hovered = false; }, []);
  useEffect(() => {
    let frame = 0;
    let inView = false;
    const sample = () => {
      frame = 0;
      if (!inView || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      interaction.current.scroll = Math.max(-1, Math.min(1,
        (innerHeight / 2 - rect.top - rect.height / 2) / (innerHeight / 2 + rect.height / 2)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sample); };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      setVisible(inView);
      if (inView) { setEntered(true); schedule(); }
      else interaction.current.hovered = false;
    }, { rootMargin: "100px" });
    if (ref.current) observer.observe(ref.current);
    const visibility = () => setPageVisible(!document.hidden);
    visibility();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return { ref, interaction, onPointerEnter, onPointerLeave, entered, running: visible && pageVisible, failed, onFailure };
}
