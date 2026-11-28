"use client";
/**
 * ScrollSceneController (Fase K4): scroll → scene, from the ONE shared scroll source.
 *
 * Every rendered frame it measures the anchors of the mounted scenes (active + outgoing) and
 * projects them to world space (lib/scene/anchors.ts) into `sceneStore.frame.placement`:
 *   - centre / size: the ScrollTransformGroup of each scene follows its DOM slot, so the 3D
 *     moves with the page as it scrolls (Lenis or native — the rect already includes it);
 *   - visible: an animated scene renders continuously only while its slot is on screen;
 *   - progress (0–1 through the viewport): scroll-driven effects (the masking prototype).
 * Between frames (on-demand mode) a scroll event that touches a visible slot asks for one frame.
 * No second scroll listener feeds progress anywhere else, and no ScrollTrigger is needed here.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { animationStore } from "@/lib/animation/state";
import { getMotionTokens } from "@/lib/design-tokens";
import { emptyPlacement, findSceneAnchor, layoutFov, placeAnchor } from "@/lib/scene/anchors";
import { SCENES } from "@/lib/scene/presets";
import { sceneStore } from "@/lib/scene/store";
import type { SceneId } from "@/lib/scene/types";
import { useRenderLoop } from "./RenderLoopController";

const RECT = { top: 0, left: 0, width: 0, height: 0 };

function measure(id: SceneId, viewport: { width: number; height: number }) {
  const def = SCENES[id];
  const s = sceneStore.get();
  // The outgoing scene keeps its own slot (e.g. #profile) while the new one enters (#stack).
  const section = id === s.transition.from && id !== s.activeScene ? s.previousSection : s.section;
  const anchor = findSceneAnchor(def.anchor, section, !!def.sectionBased);
  const placement = (sceneStore.frame.placement[id] ??= emptyPlacement());
  if (!anchor) {
    placement.visible = false;
    return placement;
  }
  const rect = anchor.getBoundingClientRect();
  RECT.top = rect.top;
  RECT.left = rect.left;
  RECT.width = rect.width;
  RECT.height = rect.height;
  return placeAnchor(RECT, viewport, layoutFov(viewport.width, getMotionTokens().camera), placement);
}

export function ScrollSceneController() {
  const size = useThree((s) => s.size);
  const loop = useRenderLoop();

  // Between frames: a scroll that moves a visible slot (or makes one appear) needs a frame.
  useEffect(
    () =>
      animationStore.onFrame((_frame, kind) => {
        if (kind !== "scroll") return;
        const id = sceneStore.get().activeScene;
        if (!id) return;
        const was = sceneStore.frame.placement[id]?.visible ?? false;
        const now = measure(id, size).visible;
        if (was || now) loop.invalidate(1);
      }),
    [loop, size],
  );

  useFrame(() => {
    const s = sceneStore.get();
    const reduced = animationStore.get().reducedMotion;
    for (const id of Object.keys(SCENES) as SceneId[]) {
      const mounted = id === s.activeScene || (id === s.transition.from && s.transition.phase === "out");
      if (!mounted) {
        loop.hold(`scene:${id}`, false);
        continue;
      }
      const placement = measure(id, size);
      loop.hold(`scene:${id}`, SCENES[id].animated && placement.visible && !reduced && id === s.activeScene);
    }
  }, -30);

  return null;
}
