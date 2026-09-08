"use client";
import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useScene, type SceneMode } from "@/components/kinetic/SceneState";
import type { Quality } from "../materials/SystemMaterials";
const Scene = dynamic(() => import("../KineticScene"), { ssr: false });
class Boundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function SceneHost() {
  const host = useRef<HTMLDivElement>(null),
    activeSlot = useRef<HTMLElement | null>(null);
  const [quality, setQuality] = useState<Quality | null>(null),
    [running, setRunning] = useState(false),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  const { setMode } = useScene();
  const onReady = useCallback(() => setReady(true), []),
    onFailure = useCallback(() => setFailed(true), []);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const canvas = document.createElement("canvas"),
      gl = canvas.getContext("webgl2");
    const supported = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    const update = () =>
      setQuality(
        !supported ||
          motion.matches ||
          (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) ||
          (nav.deviceMemory && nav.deviceMemory <= 2) ||
          nav.connection?.saveData
          ? null
          : innerWidth >= 1100
            ? "high"
            : innerWidth >= 768
              ? "medium"
              : "low",
      );
    update();
    motion.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      motion.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!host.current) return;
      const slots = Array.from(
        document.querySelectorAll<HTMLElement>("[data-scene-slot]"),
      );
      let best: HTMLElement | null = null,
        score = 0;
      for (const slot of slots) {
        const r = slot.getBoundingClientRect();
        const visible = Math.max(
          0,
          Math.min(r.bottom, innerHeight) - Math.max(r.top, 0),
        );
        const value = visible / Math.max(r.height, 1);
        if (r.width > 0 && value > score) {
          score = value;
          best = slot;
        }
      }
      if (activeSlot.current !== best) {
        activeSlot.current?.removeAttribute("data-rendered");
        activeSlot.current = best;
        if (best) setMode(best.dataset.sceneSlot as SceneMode);
      }
      const visible = Boolean(best) && !document.hidden;
      setRunning(visible);
      host.current.style.visibility = visible ? "visible" : "hidden";
      if (best) {
        const r = best.getBoundingClientRect();
        Object.assign(host.current.style, {
          top: `${r.top}px`,
          left: `${r.left}px`,
          width: `${r.width}px`,
          height: `${r.height}px`,
        });
        host.current.dataset.mode = best.dataset.sceneSlot;
        host.current.style.pointerEvents = best.closest(".graph-spatial")
          ? "none"
          : "auto";
        if (ready && !failed && quality) best.dataset.rendered = "true";
        else best.removeAttribute("data-rendered");
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      activeSlot.current?.removeAttribute("data-rendered");
    };
  }, [ready, failed, quality, setMode]);
  return (
    <div
      ref={host}
      className="kinetic-scene-host"
      aria-hidden="true"
      data-quality={quality || "static"}
      data-cursor="EXPLORE"
    >
      {quality && !failed && (
        <Boundary onFailure={onFailure}>
          <Scene
            quality={quality}
            running={running}
            onReady={onReady}
            onFailure={onFailure}
          />
        </Boundary>
      )}
    </div>
  );
}
