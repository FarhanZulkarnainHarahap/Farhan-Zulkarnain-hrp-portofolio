"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

export type AssetInteraction = { hovered: boolean; scroll: number; pointerX: number; pointerY: number };

/** Load near the viewport; sample scroll without rerendering React on every tick. */
export function useAssetViewport() {
  const ref = useRef<HTMLDivElement>(null);
  const interaction = useRef<AssetInteraction>({ hovered: false, scroll: 0, pointerX: 0, pointerY: 0 });
  const [entered, setEntered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [failed, setFailed] = useState(false);
  const onFailure = useCallback(() => setFailed(true), []);
  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    interaction.current.pointerX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    interaction.current.pointerY = Math.max(-1, Math.min(1, 1 - (event.clientY - rect.top) / rect.height * 2));
  }, []);
  const onPointerEnter = useCallback((event: PointerEvent<HTMLDivElement>) => {
    interaction.current.hovered = event.pointerType !== "touch";
    onPointerMove(event);
  }, [onPointerMove]);
  const onPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    // Touch/pen gets the same response as mouse hover without capturing scroll.
    interaction.current.hovered = true;
    onPointerMove(event);
  }, [onPointerMove]);
  const onPointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") interaction.current.hovered = false;
  }, []);
  const onPointerLeave = useCallback(() => {
    interaction.current.hovered = false;
    interaction.current.pointerX = 0;
    interaction.current.pointerY = 0;
  }, []);
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
  return { ref, interaction, onPointerEnter, onPointerLeave, onPointerMove, onPointerDown, onPointerUp, entered, running: visible && pageVisible, failed, onFailure };
}
