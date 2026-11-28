"use client";
/**
 * EnvironmentController (Fase K4): image-based lighting for the PBR materials.
 *
 * ONE procedural studio environment, baked once into a cube map from drei Lightformers — soft
 * rectangular boxes and a faint accent ring — so metals get real reflections without downloading
 * an HDRI. (assetManager.hdri() can load a CC0 Poly Haven HDRI instead; none is needed for the
 * prototypes.) Scenes differ by environment INTENSITY (lighting presets), not by re-baking: each
 * Environment remount leaves a texture behind (measured in K4: +1 per remount), so it re-bakes only
 * when the theme, the quality tier (cube resolution) or a context restore (`recoveries`) changes.
 * No background: the canvas is transparent over the page's environment layer.
 */
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect } from "react";
import { useRenderLoop } from "./RenderLoopController";
import { useSceneState } from "./hooks";
import { useThemeColors } from "./theme";

const RESOLUTION = { high: 256, medium: 128, low: 64, minimal: 32 } as const;

export function EnvironmentController() {
  const quality = useSceneState((s) => s.quality);
  const recoveries = useSceneState((s) => s.recoveries);
  const colors = useThemeColors();
  const loop = useRenderLoop();

  useEffect(() => loop.invalidate(2), [loop, quality, recoveries, colors]);

  return (
    <Environment key={`${quality}-${recoveries}-${colors.accent}`} resolution={RESOLUTION[quality]} frames={1}>
      <Lightformer form="rect" intensity={2} position={[0, 4, 3]} scale={[8, 1.5, 1]} />
      <Lightformer form="rect" intensity={0.8} position={[-4, 0.5, 2]} rotation-y={Math.PI / 2} scale={[5, 1, 1]} />
      <Lightformer form="rect" intensity={0.6} position={[4, -0.5, 1]} rotation-y={-Math.PI / 2} scale={[5, 1, 1]} />
      <Lightformer form="ring" intensity={0.9} color={colors.accent} position={[3, -1, -3]} scale={2.5} />
    </Environment>
  );
}
