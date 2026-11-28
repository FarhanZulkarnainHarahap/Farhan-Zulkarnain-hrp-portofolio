"use client";
/**
 * GlobalCanvas (Fase K4): the ONE persistent WebGL canvas of the public pages. Loaded with
 * import() by GlobalCanvasMount (never on the first-paint path, never on auth / dashboard) and
 * mounted inside SiteChrome's #webgl-root layer, so client navigation between public pages never
 * recreates it (sceneStore.mountCount stays 1) — scenes switch inside it instead.
 *
 *   <Canvas frameloop="never", transparent, fixed full viewport, no pointer events>
 *     RenderLoopController   shared-ticker frames: continuous / on demand / suspended
 *       QualityManager       tier → DPR (capability ceiling + frame time with hysteresis)
 *       WebGLContextRecovery lost → fallback → bounded restore → remount → fallback for good
 *       ScrollSceneController DOM slots → world placement, visibility, scroll progress
 *       CameraController     presets, focus, parallax, Theatre hook
 *       LightingController   light rig + presets
 *       EnvironmentController procedural IBL
 *       SceneRoot            active scene(s) with route transitions
 *
 * Pointer events: R3F listens on <html> (eventSource) and the InteractionController filter lets
 * raycasts through only over interactive slots. Colour: sRGB output, ACES tone mapping, physically
 * correct lights; local clipping enabled (masking).
 */
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace, Vector2 } from "three";
import type { QualityTier } from "@/lib/animation/config";
import { adaptiveDpr, profileFor } from "@/lib/animation/quality";
import { getMotionTokens } from "@/lib/design-tokens";
import { LAYOUT_DISTANCE, layoutFov } from "@/lib/scene/anchors";
import { assetManager } from "@/lib/scene/assets";
import { exposeSceneDebug, sceneController } from "@/lib/scene/controller";
import { sceneStore } from "@/lib/scene/store";
import { CameraController } from "./CameraController";
import { EnvironmentController } from "./EnvironmentController";
import { pointerDebug, sceneEvents } from "./InteractionController";
import { LightingController } from "./LightingController";
import { QualityManager } from "./QualityManager";
import { NEXT_SCENES, SCENE_PRELOADERS } from "./registry";
import { RenderLoopController } from "./RenderLoopController";
import { SceneRoot } from "./SceneRoot";
import { ScrollSceneController } from "./ScrollSceneController";
import { WebGLContextRecovery } from "./WebGLContextRecovery";

type Props = {
  ceiling: QualityTier;
  reasons: readonly string[];
  /** Asks the mount for a fresh canvas (context could not be restored). False when out of budget. */
  onRemount: () => boolean;
};

/** Preloads the likely next scenes' modules at idle once a scene is active (selective preloading). */
function usePreloadNext() {
  useEffect(() => {
    sceneController.setPreloaders(SCENE_PRELOADERS);
    const preloaded = new Set<string>();
    return sceneStore.subscribe(() => {
      const s = sceneStore.get();
      if (!s.activeScene || s.scenes[s.activeScene] !== "active" || preloaded.has(s.activeScene)) return;
      preloaded.add(s.activeScene);
      const next = NEXT_SCENES[s.activeScene] ?? [];
      const run = () => {
        for (const id of next) void sceneController.preload(id);
      };
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 4000 });
      else window.setTimeout(run, 1500);
    });
  }, []);
}

/** Debug surface inside the canvas: pointer filter state and a manual raycast (tests, lab). */
function SceneDebug() {
  const get = useThree((s) => s.get);
  useEffect(
    () =>
      exposeSceneDebug({
        pointer: pointerDebug,
        raycast: (x: number, y: number) => {
          const { raycaster, camera, scene, size } = get();
          const ndc = new Vector2((x / size.width) * 2 - 1, -(y / size.height) * 2 + 1);
          raycaster.setFromCamera(ndc, camera);
          return { size: [size.width, size.height], ndc: [ndc.x, ndc.y], hits: raycaster.intersectObject(scene, true).slice(0, 5).map((h) => `${h.object.type}:${h.object.parent?.name ?? ""}@${h.distance.toFixed(2)}`) };
        },
      }),
    [get],
  );
  return null;
}

export default function GlobalCanvas({ ceiling, reasons, onRemount }: Props) {
  const profile = profileFor(ceiling);
  usePreloadNext();
  useEffect(() => () => assetManager.disposeAll(), []);


  return (
    <Canvas
      frameloop="never"
      dpr={adaptiveDpr(ceiling)}
      gl={{ antialias: profile.antialias, alpha: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false }}
      camera={{ position: [0, 0, LAYOUT_DISTANCE], fov: layoutFov(window.innerWidth, getMotionTokens().camera), near: 0.1, far: 60 }}
      shadows={profile.shadows}
      eventSource={document.documentElement}
      eventPrefix="client"
      events={sceneEvents}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 120 } }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      data-testid="global-canvas"
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.outputColorSpace = SRGBColorSpace;
        gl.localClippingEnabled = true;
        gl.setClearColor(0x000000, 0);
        const s = sceneStore.get();
        sceneStore.set({ mountCount: s.mountCount + 1, renderer: "active", rendererError: null });
      }}
    >
      <RenderLoopController>
        <QualityManager ceiling={ceiling} reasons={reasons} />
        <WebGLContextRecovery onRemount={onRemount} />
        <ScrollSceneController />
        <CameraController />
        <LightingController />
        <EnvironmentController />
        <SceneRoot />
        <SceneDebug />
      </RenderLoopController>
    </Canvas>
  );
}
