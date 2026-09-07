"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { useScene } from "./SceneState";
const Scene = dynamic(() => import("./SpatialScene"), { ssr: false });
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function SpatialSystem() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [running, setRunning] = useState(false);
  const { active, mode } = useScene();
  useEffect(() => {
    const query = matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    );
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    const supported = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    let visible = false;
    const update = () => setEnabled(query.matches && supported && visible);
    update();
    query.addEventListener("change", update);
    const visibility = () => setRunning(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
      visibility();
    });
    if (ref.current) observer.observe(ref.current);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <div
      className={`spatial-system ${active ? "is-active" : ""}`}
      ref={ref}
      aria-label="Connected system architecture illustration"
      role="img"
    >
      <div className="spatial-fallback" aria-hidden="true">
        <Image
          src="/visuals/system-map.svg"
          alt=""
          fill
          sizes="(max-width: 767px) 90vw, 50vw"
          unoptimized
        />
      </div>
      {enabled && (
        <div className="spatial-canvas" aria-hidden="true" data-cursor="DRAG">
          <SceneBoundary>
            <Scene running={running} />
          </SceneBoundary>
        </div>
      )}
      <div className="spatial-tag tag-top">
        <span className="status-dot" />
        {active || "CONNECTED ARCHITECTURE"}
      </div>
      <div className="spatial-tag tag-left">01 / INTERFACE</div>
      <div className="spatial-tag tag-right">02 / LOGIC</div>
      <div className="spatial-caption">
        <span>FZ—CORE / {mode.toUpperCase()}</span>
        <span>FIG. 001</span>
      </div>
    </div>
  );
}
