"use client";
/**
 * CameraController (Fase K4): the one owner of the global perspective camera.
 *
 * Goal per frame (lib/scene/drivers.cameraGoal): layout camera + preset (route / section / lab
 * override) + focus on the selected object + gentle sway and pointer parallax (mouse only; off for
 * touch and reduced motion). Theatre's "Global Camera" values, when a timeline drives them
 * (sceneStore.frame.theatre.camera), replace the goal — the Fase 5 hook.
 * Smoothing: maath critically-damped easing with the --camera-smooth-time token; reduced motion
 * snaps. While the camera is still moving the render loop stays continuous ("camera" reason);
 * a pointer move over a visible scene asks for one frame so parallax can start.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Vector3 } from "three";
import { animationStore } from "@/lib/animation/state";
import { getMotionTokens } from "@/lib/design-tokens";
import { layoutFov } from "@/lib/scene/anchors";
import { applyCamera, cameraGoal, type CameraGoal } from "@/lib/scene/drivers";
import { objectRegistry } from "@/lib/scene/objects";
import { CAMERA_PRESETS, SCENES } from "@/lib/scene/presets";
import { sceneStore } from "@/lib/scene/store";
import type { CameraPreset } from "@/lib/scene/types";
import { useRenderLoop } from "./RenderLoopController";

const NEUTRAL: CameraPreset = { offset: [0, 0, 0], target: [0, 0, 0], fovDelta: 0, parallax: 0, orbit: 0 };

function activePreset(): CameraPreset {
  const s = sceneStore.get();
  const base = s.cameraPreset ? CAMERA_PRESETS[s.cameraPreset] : s.activeScene ? SCENES[s.activeScene].camera : NEUTRAL;
  // While an object is focused: calmer parallax and no sway (the dolly itself is in cameraGoal).
  return s.focusedObject ? { ...base, parallax: Math.min(base.parallax, CAMERA_PRESETS.focus.parallax), orbit: 0 } : base;
}

export function CameraController() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const loop = useRenderLoop();
  const [state] = useState(() => ({ target: new Vector3(), goal: { position: [0, 0, 10], target: [0, 0, 0], fov: 35 } as CameraGoal }));

  // Pointer parallax needs a frame to start when the scene is static.
  useEffect(
    () =>
      animationStore.onFrame((frame, kind) => {
        if (kind !== "pointer" || animationStore.get().reducedMotion) return;
        const id = sceneStore.get().activeScene;
        if (id && sceneStore.frame.placement[id]?.visible && SCENES[id].camera.parallax > 0) loop.invalidate(1);
      }),
    [loop],
  );

  useFrame((_, delta) => {
    const s = sceneStore.get();
    const a = animationStore.get();
    const reduced = a.reducedMotion;
    const tokens = getMotionTokens().camera;
    const fov = layoutFov(size.width, tokens);
    const focused = s.focusedObject ? objectRegistry.get(s.focusedObject)?.worldPosition() ?? null : null;
    const pointer = animationStore.frame.pointer;
    const theatre = sceneStore.frame.theatre.camera;
    // Sway and parallax only while the scene's slot is on screen: off screen the camera settles
    // and the loop can go idle (no frames for a page the visitor is not looking at).
    const live = !!s.activeScene && !!sceneStore.frame.placement[s.activeScene]?.visible;
    const goal = theatre
      ? Object.assign(state.goal, { position: theatre.position, target: theatre.target, fov: theatre.fov })
      : cameraGoal(
          activePreset(),
          fov,
          loop.time(),
          { nx: pointer.nx, ny: pointer.ny, active: live && pointer.inside && a.interaction === "pointer" },
          { reduced: reduced || !live, focus: focused },
          state.goal,
        );
    const settled = applyCamera(camera, state.target, goal, reduced ? 0 : tokens.smoothTime, delta);
    const out = sceneStore.frame.camera;
    out.position[0] = camera.position.x;
    out.position[1] = camera.position.y;
    out.position[2] = camera.position.z;
    out.target[0] = state.target.x;
    out.target[1] = state.target.y;
    out.target[2] = state.target.z;
    out.fov = (camera as { fov?: number }).fov ?? fov;
    out.settled = settled;
    loop.hold("camera", !settled);
  }, -20);

  return null;
}
