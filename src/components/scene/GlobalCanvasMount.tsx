"use client";
/**
 * GlobalCanvasMount (Fase K4): decides whether the persistent canvas runs, loads it, keeps it in
 * sync with the route and section, and switches the static fallbacks (WebGLFallback).
 *
 * Mounted by SiteChrome inside #webgl-root (public pages only — auth and the dashboard have their
 * own frames and never load three.js). It renders nothing on the server and nothing until the
 * canvas chunk has loaded, so the server HTML, the LCP and hydration are unchanged.
 *
 *  1. At idle after hydration: capability check (lib/scene/quality.capabilityTier). No WebGL, or a
 *     tier without WebGL → status "unsupported": the static fallbacks stay, three.js is never loaded.
 *  2. Otherwise import("./GlobalCanvas") (three + R3F + the scene system) and mount it once.
 *  3. Route / active-section changes → sceneController.sync (scene switching inside the canvas).
 *  4. Renderer failures (error boundary), a context that cannot be restored, or a failed chunk →
 *     "failed": the fallbacks stay and navigation keeps working. One fresh remount is allowed for
 *     context recovery, never more.
 */
import { usePathname } from "next/navigation";
import { Component, useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useAnimationState } from "@/components/animation/hooks";
import type { QualityTier } from "@/lib/animation/config";
import { profileFor } from "@/lib/animation/quality";
import { resetAnchors } from "@/lib/scene/anchors";
import { exposeSceneDebug, sceneController } from "@/lib/scene/controller";
import { capabilityTier } from "@/lib/scene/quality";
import { sceneStore } from "@/lib/scene/store";
import { useSceneState } from "./hooks";

type CanvasProps = { ceiling: QualityTier; reasons: readonly string[]; onRemount: () => boolean };

const MAX_REMOUNTS = 1;

class CanvasErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    sceneStore.set({ renderer: "failed", rendererError: (error instanceof Error ? error.message : String(error)).slice(0, 200) });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * WebGLFallback: mirrors the renderer status on <html data-webgl> (idle | unsupported | loading |
 * active | lost | restoring | failed). CSS shows a slot's WebGL rendering only while "active"
 * (e.g. the hero's SVG orbit is hidden only when data-webgl="active" and the WebGL orbit has drawn);
 * in every other state the static fallback is what the visitor sees.
 */
export function WebGLFallback() {
  const renderer = useSceneState((s) => s.renderer);
  useEffect(() => {
    document.documentElement.dataset.webgl = renderer;
  }, [renderer]);
  useEffect(
    () => () => {
      delete document.documentElement.dataset.webgl;
      delete document.documentElement.dataset.orbitRenderer;
      delete document.documentElement.dataset.sceneHover;
    },
    [],
  );
  return null;
}

const idle = (fn: () => void) =>
  typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(fn, { timeout: 2500 }) : window.setTimeout(fn, 400);

export function GlobalCanvasMount() {
  const pathname = usePathname();
  const section = useAnimationState((s) => s.activeSection);
  const [loaded, setLoaded] = useState<{ Canvas: ComponentType<CanvasProps>; ceiling: QualityTier; reasons: readonly string[] } | null>(null);
  const [generation, setGeneration] = useState(0);
  const remounts = useRef(0);

  useEffect(() => exposeSceneDebug(), []);

  useEffect(() => {
    resetAnchors();
    sceneController.sync(pathname, section);
  }, [pathname, section]);

  useEffect(() => {
    let alive = true;
    const decide = () => {
      const cap = capabilityTier();
      sceneStore.set({ quality: cap.tier, qualityReasons: cap.reasons });
      if (!profileFor(cap.tier).webgl) {
        sceneStore.set({ renderer: "unsupported" });
        return;
      }
      sceneStore.set({ renderer: "loading" });
      import("./GlobalCanvas").then(
        (module) => alive && setLoaded({ Canvas: module.default, ceiling: cap.tier, reasons: cap.reasons }),
        (error: unknown) => sceneStore.set({ renderer: "failed", rendererError: `canvas chunk: ${error instanceof Error ? error.message : String(error)}` }),
      );
    };
    const handle = idle(decide);
    return () => {
      alive = false;
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      sceneStore.set({ renderer: "idle", renderMode: "off" });
    };
  }, []);

  const onRemount = useCallback(() => {
    if (remounts.current >= MAX_REMOUNTS) return false;
    remounts.current++;
    sceneStore.set({ renderer: "restoring" });
    setGeneration((g) => g + 1);
    return true;
  }, []);

  const Canvas = loaded?.Canvas;
  return (
    <>
      <WebGLFallback />
      {Canvas && loaded && (
        <CanvasErrorBoundary key={generation}>
          <Canvas ceiling={loaded.ceiling} reasons={loaded.reasons} onRemount={onRemount} />
        </CanvasErrorBoundary>
      )}
    </>
  );
}
