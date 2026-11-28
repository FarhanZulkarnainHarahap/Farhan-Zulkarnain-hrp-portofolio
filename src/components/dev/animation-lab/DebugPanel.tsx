"use client";
/**
 * Lab debug panel (Fase K3; persistent-canvas rows added in Fase K4). Low-frequency values come
 * from the shared snapshots / registry (React, re-render on change only). Per-frame values (FPS,
 * scroll, velocity, Theatre position, and the global canvas' frame time, draw calls, triangles,
 * textures, geometries, camera) are written into the DOM from the shared ticker's render phase,
 * ~10 times per second, through refs — the panel itself never re-renders per frame.
 * "FPS" counts the panel's own ticks (the shared ticker); "Canvas frame time" is the global canvas.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAnimationState } from "@/components/animation/hooks";
import { durationViolations } from "@/lib/animation/config";
import { animationRegistry } from "@/lib/animation/registry";
import { getScrollEngine } from "@/lib/animation/scroll";
import { animationStore } from "@/lib/animation/state";
import { addTick, tickerStats } from "@/lib/animation/ticker";
import { useSceneState } from "@/components/scene/hooks";
import { sceneStore } from "@/lib/scene/store";

type Live = { timeline: () => string };

function useRegistryVersion() {
  const version = useRef(0);
  return useSyncExternalStore(
    (cb) =>
      animationRegistry.subscribe(() => {
        version.current++;
        cb();
      }),
    () => version.current,
    () => 0,
  );
}

export function DebugPanel({ live }: { live: Live }) {
  const s = useAnimationState((x) => x);
  useRegistryVersion();
  const animations = animationRegistry.list();
  const playing = animations.filter((a) => a.status === "playing");
  const [violations] = useState(() => durationViolations());
  const fps = useRef<HTMLElement>(null);
  const scroll = useRef<HTMLElement>(null);
  const velocity = useRef<HTMLElement>(null);
  const timeline = useRef<HTMLElement>(null);
  const ticker = useRef<HTMLElement>(null);
  const canvasFrame = useRef<HTMLElement>(null);
  const canvasDraws = useRef<HTMLElement>(null);
  const canvasMemory = useRef<HTMLElement>(null);
  const canvasCamera = useRef<HTMLElement>(null);
  const scene = useSceneState((x) => x);
  const liveRef = useRef(live);
  useEffect(() => {
    liveRef.current = live;
  });

  useEffect(() => {
    let frames = 0;
    let since = performance.now();
    return addTick("render", (_t, _d, now) => {
      frames++;
      if (now - since < 100) return;
      const rate = (frames * 1000) / (now - since);
      frames = 0;
      since = now;
      const f = animationStore.frame.scroll;
      if (fps.current) fps.current.textContent = rate.toFixed(0);
      if (scroll.current) scroll.current.textContent = `${(f.progress * 100).toFixed(1)}% · ${Math.round(f.y)} px`;
      if (velocity.current) velocity.current.textContent = `${f.velocity.toFixed(2)} (${f.direction > 0 ? "down" : f.direction < 0 ? "up" : "rest"})`;
      if (timeline.current) timeline.current.textContent = liveRef.current.timeline();
      if (ticker.current) {
        const st = tickerStats();
        ticker.current.textContent = `scroll ${st.scroll} · timeline ${st.timeline} · render ${st.render}`;
      }
      const r = sceneStore.frame.renderer;
      const c = sceneStore.frame.camera;
      if (canvasFrame.current) canvasFrame.current.textContent = r.frameTime ? `${r.frameTime.toFixed(1)} ms (${r.fps} fps) · ${r.frames} frames` : `– · ${r.frames} frames`;
      if (canvasDraws.current) canvasDraws.current.textContent = `${r.calls} calls · ${r.triangles.toLocaleString("en")} triangles`;
      if (canvasMemory.current) canvasMemory.current.textContent = `${r.textures} textures · ${r.geometries} geometries · ${r.programs} programs`;
      if (canvasCamera.current)
        canvasCamera.current.textContent = `pos ${c.position.map((v) => v.toFixed(2)).join(", ")} · fov ${c.fov.toFixed(1)} · ${c.settled ? "settled" : "moving"}`;
    });
  }, []);

  const rows: [string, React.ReactNode, string?][] = [
    ["FPS", <span key="fps" ref={fps} data-testid="debug-fps">–</span>],
    ["Scroll progress", <span key="sp" ref={scroll} data-testid="debug-scroll">–</span>],
    ["Scroll velocity", <span key="sv" ref={velocity} data-testid="debug-velocity">–</span>],
    ["Scroll engine", s.smoothScroll ? "Lenis (smooth wheel)" : (getScrollEngine()?.kind ?? "none"), "debug-engine"],
    ["Active section", s.activeSection ?? "–", "debug-section"],
    ["Active animations", playing.length ? playing.map((a) => `${a.id} (${a.owner})`).join(", ") : `none playing · ${animations.length} registered`, "debug-animations"],
    ["Active timeline", <span key="tl" ref={timeline} data-testid="debug-timeline">–</span>],
    ["Device quality", s.quality, "debug-quality"],
    ["WebGL", s.webgl, "debug-webgl"],
    ["Reduced motion", s.reducedMotion ? "on" : "off", "debug-reduced"],
    ["Hovered / selected", `${s.hovered ?? "–"} / ${s.selected ?? "–"}`, "debug-pointer"],
    ["Ticker phases", <span key="tk" ref={ticker} data-testid="debug-ticker">–</span>],
    ["Duration tokens", violations.length ? violations.join("; ") : "all within range", "debug-tokens"],
    ["— Canvas (K4)", "persistent global canvas", undefined],
    ["Renderer", `${scene.renderer}${scene.rendererError ? ` · ${scene.rendererError}` : ""}`, "debug-renderer"],
    ["Canvas mounts", String(scene.mountCount), "debug-mounts"],
    ["Render mode", scene.renderMode, "debug-render-mode"],
    ["Current scene", `${scene.activeScene ?? "–"} (${scene.activeScene ? (scene.scenes[scene.activeScene] ?? "–") : "–"})${scene.forcedScene ? " · forced" : ""}`, "debug-scene"],
    ["Camera preset", scene.cameraPreset ?? "scene default", "debug-camera-preset"],
    ["Active camera", <span key="cam" ref={canvasCamera} data-testid="debug-camera">–</span>],
    ["Canvas quality", `${scene.quality}${scene.qualityPinned ? " (pinned)" : ""} · ${scene.qualityReasons.join(", ")}`, "debug-canvas-quality"],
    ["Canvas frame time", <span key="cft" ref={canvasFrame} data-testid="debug-frame-time">–</span>],
    ["Draw calls", <span key="dc" ref={canvasDraws} data-testid="debug-draws">–</span>],
    ["Textures / geometries", <span key="mem" ref={canvasMemory} data-testid="debug-memory">–</span>],
    ["Object hover / select", `${scene.hoveredObject ?? "–"} / ${scene.selectedObject ?? "–"}${scene.focusedObject ? " · focused" : ""}`, "debug-object"],
    ["Context losses", `${scene.contextLosses} lost · ${scene.recoveries} recovered`, "debug-context"],
    ["Assets", `${scene.assets.loaded} loaded · ${scene.assets.pending} pending · ${scene.assets.failed} failed`, "debug-assets"],
  ];

  return (
    <aside
      aria-label="Animation debug"
      data-lenis-prevent
      className="site-scheme fixed bottom-3 left-3 z-(--z-overlay) max-h-[45svh] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto border border-hairline bg-(--nav-bg) p-3 font-meta text-[0.6875rem] leading-relaxed text-body backdrop-blur-md"
    >
      <p className="mb-2 text-label text-ink uppercase">Debug</p>
      <dl className="grid grid-cols-[8.5rem_1fr] gap-x-3">
        {rows.map(([label, value, testid]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd className="min-w-0 break-words text-ink" data-testid={testid}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
