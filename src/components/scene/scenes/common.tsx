"use client";
/**
 * Helpers shared by the scene modules (Fase K4).
 *  - useSceneProps(id): the `data-scene-props` JSON of the scene's DOM slot (server-rendered,
 *    API-derived data such as the orbit model or a count) — never hardcoded content.
 *  - useDetail(): geometry detail for the current quality tier.
 *  - useTint(material, color): keeps a shared material on the theme palette.
 *  - PLACEHOLDER: every K4 page scene is procedural placeholder geometry (named so in the scene
 *    graph and in docs) until its final design phase.
 */
import { useEffect, useMemo } from "react";
import { Color, type MeshStandardMaterial } from "three";
import { anchorProps, findSceneAnchor } from "@/lib/scene/anchors";
import { SCENES } from "@/lib/scene/presets";
import type { SceneId } from "@/lib/scene/types";
import { useSceneState } from "../hooks";
import { useRenderLoop } from "../RenderLoopController";
import { DETAIL } from "../resources";

export const PLACEHOLDER = "placeholder (Fase K4 — procedural, not the final design)";

export function useSceneProps<T extends Record<string, unknown>>(id: SceneId): Partial<T> {
  const route = useSceneState((s) => s.route);
  const section = useSceneState((s) => s.section);
  // Client-only module (the canvas never renders on the server): the slot is read from the DOM
  // again whenever the scene, route or section changes (the key encodes all three).
  const key = JSON.stringify([id, route, section]);
  return useMemo(() => readSceneProps<T>(key), [key]);
}

function readSceneProps<T extends Record<string, unknown>>(key: string): Partial<T> {
  const [id, , section] = JSON.parse(key) as [SceneId, string, string | null];
  const def = SCENES[id];
  return anchorProps<T>(findSceneAnchor(def.anchor, section, !!def.sectionBased));
}

export function useDetail() {
  const quality = useSceneState((s) => s.quality);
  return { quality, detail: DETAIL[quality] };
}

/** Re-tints a shared material when the theme colour changes (and redraws). */
export function useTint(material: MeshStandardMaterial, color: string, emissive?: string) {
  const loop = useRenderLoop();
  useEffect(() => {
    tint(material, color, emissive);
    loop.invalidate(2);
  }, [material, color, emissive, loop]);
}

function tint(material: MeshStandardMaterial, color: string, emissive?: string) {
  material.color = new Color(color);
  if (emissive) material.emissive = new Color(emissive);
  material.needsUpdate = true;
}
