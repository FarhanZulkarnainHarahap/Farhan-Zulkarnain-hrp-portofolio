"use client";
/**
 * LightingController (Fase K4): the global light rig and its presets.
 *
 *   ambient + hemisphere (sky = metal token, ground = canvas token) — soft fill, keeps detail
 *   key    directional, neutral white, casts shadows on tiers that allow them
 *   rim    directional, accent token — the cool edge that separates objects from the dark page
 *   accent point light, accent token, near the subject — emissive details (0 on calm presets)
 *   environment intensity (IBL from EnvironmentController)
 *
 * Preset = lab override ?? the active scene's preset; Theatre's "Lighting" values (Fase 5) win
 * when present. Intensities are damped on preset changes (the loop stays continuous until they
 * settle). The "low" tier drops the rim and accent lights (minimal lighting). Colours follow the
 * theme (re-read on <html data-theme> changes).
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { AmbientLight, DirectionalLight, HemisphereLight, PointLight } from "three";
import { profileFor } from "@/lib/animation/quality";
import { animationStore } from "@/lib/animation/state";
import { getMotionTokens } from "@/lib/design-tokens";
import { applyLighting } from "@/lib/scene/drivers";
import { LIGHTING_PRESETS, SCENES } from "@/lib/scene/presets";
import { sceneStore } from "@/lib/scene/store";
import { useRenderLoop } from "./RenderLoopController";
import { useSceneState } from "./hooks";
import { useThemeColors } from "./theme";

export function LightingController() {
  const scene = useThree((s) => s.scene);
  const loop = useRenderLoop();
  const quality = useSceneState((s) => s.quality);
  const colors = useThemeColors();
  const shadows = profileFor(quality).shadows;
  const ambient = useRef<AmbientLight>(null);
  const hemisphere = useRef<HemisphereLight>(null);
  const key = useRef<DirectionalLight>(null);
  const rim = useRef<DirectionalLight>(null);
  const accent = useRef<PointLight>(null);

  useEffect(() => loop.invalidate(2), [loop, colors, quality]);

  useFrame((_, delta) => {
    const s = sceneStore.get();
    const preset = s.lightingPreset ? LIGHTING_PRESETS[s.lightingPreset] : s.activeScene ? SCENES[s.activeScene].lighting : LIGHTING_PRESETS.page;
    const settled = applyLighting(
      {
        ambient: ambient.current,
        hemisphere: hemisphere.current,
        key: key.current,
        rim: rim.current,
        accent: accent.current,
        scene: scene as unknown as { environmentIntensity: number },
      },
      preset,
      sceneStore.frame.theatre.lights,
      { smoothTime: animationStore.get().reducedMotion ? 0 : getMotionTokens().camera.smoothTime, delta, minimal: sceneStore.get().quality === "low" },
    );
    loop.hold("lights", !settled);
  }, -15);

  return (
    <>
      <ambientLight ref={ambient} intensity={0} />
      <hemisphereLight ref={hemisphere} args={[colors.metal, colors.canvas, 0]} />
      <directionalLight
        ref={key}
        color="#ffffff"
        intensity={0}
        position={[3, 4, 5]}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <directionalLight ref={rim} color={colors.accent} intensity={0} position={[-4, 2, -3]} />
      <pointLight ref={accent} color={colors.accent} intensity={0} position={[0.6, 0.4, 1.6]} distance={6} decay={2} />
    </>
  );
}
