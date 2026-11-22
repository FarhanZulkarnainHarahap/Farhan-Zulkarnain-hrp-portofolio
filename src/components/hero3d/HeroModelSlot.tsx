"use client";
/**
 * Loads the HeroModel (three.js + GLB) only on capable desktops (CAPABLE_QUERY + WebGL2), once the
 * slot is on screen; nothing is rendered or fetched otherwise (no canvas in the server HTML). The
 * poster stays until the first frame is rendered, then the canvas cross-fades in (onReady).
 * Colours follow the site theme; the model eases towards the pointer and rests when it leaves
 * (render on demand, no rAF while idle). Unmount (navigation) disposes the scene and the context.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getCapable, readTokenColors, subscribeCapable, subscribeTheme } from "@/lib/webgl-capability";
import type { HeroScene, ModelColors } from "./heroScene";

const TOKENS = ["--model-surface", "--model-line", "--model-accent"];
const readColors = () => readTokenColors(TOKENS).join("|");
const toColors = (snapshot: string): ModelColors => {
  const [surface, line, accent] = snapshot.split("|");
  return { surface, line, accent };
};

export function HeroModelSlot({ onReady }: { onReady: (ready: boolean) => void }) {
  const slotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HeroScene | null>(null);
  const [visible, setVisible] = useState(false);
  const capable = useSyncExternalStore(subscribeCapable, getCapable, () => false);
  const colors = useSyncExternalStore(subscribeTheme, readColors, () => "");

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot || !capable) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(slot);
    return () => observer.disconnect();
  }, [capable]);

  const live = capable && visible && Boolean(colors);

  useEffect(() => {
    const slot = slotRef.current;
    const canvas = canvasRef.current;
    if (!live || !slot || !canvas) return;
    let disposed = false;
    let scene: HeroScene | null = null;
    const onMove = (event: PointerEvent) => {
      const rect = slot.getBoundingClientRect();
      scene?.setPointer(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        ((event.clientY - rect.top) / rect.height) * 2 - 1,
      );
    };
    const onLeave = () => scene?.setPointer(null);
    const resize = new ResizeObserver(() => scene?.resize());
    import("./heroScene")
      .then(({ createHeroScene }) => createHeroScene(canvas, toColors(readColors())))
      .then((created) => {
        if (disposed) return created.dispose();
        scene = sceneRef.current = created;
        slot.addEventListener("pointermove", onMove);
        slot.addEventListener("pointerleave", onLeave);
        resize.observe(canvas);
        onReady(true);
      })
      .catch(() => onReady(false));
    return () => {
      disposed = true;
      slot.removeEventListener("pointermove", onMove);
      slot.removeEventListener("pointerleave", onLeave);
      resize.disconnect();
      scene?.dispose();
      sceneRef.current = null;
      onReady(false);
    };
  }, [live, onReady]);

  useEffect(() => {
    if (colors) sceneRef.current?.setColors(toColors(colors));
  }, [colors]);

  return (
    <div ref={slotRef} data-hero-model={live ? "live" : "off"} className="absolute inset-0">
      {capable && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="hero-model-canvas pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}
