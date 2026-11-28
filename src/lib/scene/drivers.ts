/**
 * Per-frame drivers of the global scene (Fase K4). Plain functions called from useFrame: each one
 * writes only what its owner owns (camera → CameraController, lights → LightingController, route
 * transition group → SceneRoot, interaction group → InteractiveObject). Smoothing uses maath's
 * critically damped easing (no overshoot) except the click spring, which is meant to bounce.
 */
import { easing } from "maath";
import type { Camera, Object3D, PerspectiveCamera, Vector3, WebGLRenderer } from "three";
import type { CameraPreset, LightingPreset, Vec3Tuple } from "./types";
import { LAYOUT_DISTANCE } from "./anchors";

const EPS = 1e-3;
/** Metres the camera moves toward a focused object (≈ 6 % closer: noticeable, not dizzying). */
const FOCUS_DOLLY = 0.6;

export type CameraGoal = { position: Vec3Tuple; target: Vec3Tuple; fov: number };

/**
 * Goal of the camera for this frame: layout camera + preset offsets + gentle sway / parallax
 * (both off under reduced motion), or the Theatre values when a timeline drives the camera.
 */
export function cameraGoal(
  preset: CameraPreset,
  layoutFov: number,
  time: number,
  pointer: { nx: number; ny: number; active: boolean },
  { reduced, focus }: { reduced: boolean; focus: Vec3Tuple | null },
  out: CameraGoal,
): CameraGoal {
  // Small amplitudes, and the target follows 70 % of the sway / parallax offset: the slot plane
  // (z = 0) barely moves on screen — what the pointer is over stays under it — while objects in
  // front of / behind it still show depth parallax.
  const sway = reduced || !preset.orbit ? 0 : Math.sin(time * preset.orbit * 6) * 0.08;
  const px = reduced || !pointer.active ? 0 : pointer.nx * preset.parallax;
  const py = reduced || !pointer.active ? 0 : pointer.ny * preset.parallax * 0.6;
  const follow = 0.7;
  out.target[0] = preset.target[0] + (px + sway) * follow;
  out.target[1] = preset.target[1] + py * follow;
  out.target[2] = preset.target[2];
  out.position[0] = preset.offset[0] + px + sway;
  out.position[1] = preset.offset[1] + py;
  out.position[2] = LAYOUT_DISTANCE + preset.offset[2];
  out.fov = layoutFov + preset.fovDelta;
  if (focus) {
    // Focus = dolly along the line of sight to the object: camera and target move together along
    // that ray, so the object stays where the layout put it on screen and only grows — the scene
    // never slides sideways over the page text.
    const dx = focus[0] - out.position[0];
    const dy = focus[1] - out.position[1];
    const dz = focus[2] - out.position[2];
    const k = FOCUS_DOLLY / Math.max(1e-3, Math.hypot(dx, dy, dz));
    for (const [i, d] of [dx, dy, dz].entries()) {
      out.position[i] += d * k;
      out.target[i] += d * k;
    }
  }
  return out;
}

/** Damps the camera toward the goal; returns true once it has settled. */
export function applyCamera(camera: Camera, target: Vector3, goal: CameraGoal, smoothTime: number, delta: number): boolean {
  const cam = camera as PerspectiveCamera;
  if (smoothTime <= 0) {
    cam.position.set(...goal.position);
    target.set(...goal.target);
    if (cam.fov !== goal.fov) {
      cam.fov = goal.fov;
      cam.updateProjectionMatrix();
    }
    cam.lookAt(target.x, target.y, target.z);
    return true;
  }
  easing.damp3(cam.position, goal.position, smoothTime, delta);
  easing.damp3(target, goal.target, smoothTime, delta);
  const before = cam.fov;
  easing.damp(cam, "fov", goal.fov, smoothTime, delta);
  if (Math.abs(cam.fov - before) > 1e-5) cam.updateProjectionMatrix();
  cam.lookAt(target.x, target.y, target.z);
  const dp =
    Math.abs(cam.position.x - goal.position[0]) + Math.abs(cam.position.y - goal.position[1]) + Math.abs(cam.position.z - goal.position[2]);
  const dt = Math.abs(target.x - goal.target[0]) + Math.abs(target.y - goal.target[1]) + Math.abs(target.z - goal.target[2]);
  return dp + dt < EPS && Math.abs(cam.fov - goal.fov) < 0.01;
}

export type LightRig = {
  ambient: { intensity: number } | null;
  hemisphere: { intensity: number } | null;
  key: { intensity: number; position: { set: (x: number, y: number, z: number) => void } } | null;
  rim: { intensity: number; position: { set: (x: number, y: number, z: number) => void } } | null;
  accent: { intensity: number } | null;
  scene: { environmentIntensity: number } | null;
};

/** Damps light intensities toward the preset (Theatre overrides win); returns true when settled. */
export function applyLighting(
  rig: LightRig,
  preset: LightingPreset,
  theatre: { key: number; rim: number; environment: number } | null,
  { smoothTime, delta, minimal }: { smoothTime: number; delta: number; minimal: boolean },
): boolean {
  let settled = true;
  const damp = (obj: { intensity: number } | null, goal: number) => {
    if (!obj) return;
    if (smoothTime <= 0) obj.intensity = goal;
    else easing.damp(obj, "intensity", goal, smoothTime, delta);
    if (Math.abs(obj.intensity - goal) > EPS) settled = false;
  };
  damp(rig.ambient, preset.ambient + (minimal ? 0.15 : 0));
  damp(rig.hemisphere, preset.hemisphere);
  damp(rig.key, theatre?.key ?? preset.key.intensity);
  damp(rig.rim, minimal ? 0 : (theatre?.rim ?? preset.rim.intensity));
  damp(rig.accent, minimal ? 0 : preset.accent);
  rig.key?.position.set(...preset.key.position);
  rig.rim?.position.set(...preset.rim.position);
  if (rig.scene) {
    const goal = theatre?.environment ?? preset.environment;
    if (smoothTime <= 0) rig.scene.environmentIntensity = goal;
    else easing.damp(rig.scene, "environmentIntensity", goal, smoothTime, delta);
    if (Math.abs(rig.scene.environmentIntensity - goal) > EPS) settled = false;
  }
  return settled;
}

/**
 * RouteTransitionGroup: scene enters (rises and grows into place) or leaves (sinks and shrinks),
 * then hides. Returns true when the transition reached its end state.
 */
export function applyRouteTransition(group: Object3D, entering: boolean, smoothTime: number, delta: number): boolean {
  // Leaving: shrink and sink faster, and count as done a little earlier (then hidden at once).
  const scale = entering ? 1 : 0.6;
  const y = entering ? 0 : -0.35;
  const tolerance = entering ? 0.004 : 0.03;
  const time = entering ? smoothTime : smoothTime * 0.6;
  if (time <= 0) {
    group.scale.setScalar(scale);
    group.position.y = y;
  } else {
    easing.damp3(group.scale, [scale, scale, scale], time, delta);
    easing.damp(group.position, "y", y, time, delta);
  }
  const done = Math.abs(group.scale.x - scale) < tolerance && Math.abs(group.position.y - y) < tolerance;
  group.visible = entering || !done;
  return done;
}

/** Click spring (tactile compression → slight overshoot → rest). Mutable state, one per object. */
export type Spring = { value: number; velocity: number };

export function kickSpring(spring: Spring, impulse: number) {
  spring.velocity -= impulse;
}

/** Integrates the spring (stiffness 320, damping 18 → one soft overshoot); returns true at rest. */
export function stepSpring(spring: Spring, target: number, delta: number): boolean {
  const dt = Math.min(delta, 1 / 30);
  const force = -320 * (spring.value - target) - 18 * spring.velocity;
  spring.velocity += force * dt;
  spring.value += spring.velocity * dt;
  return Math.abs(spring.value - target) < 1e-3 && Math.abs(spring.velocity) < 1e-2;
}

/** Interaction group of an interactive object: hover scale + pointer tilt + click spring. */
export function applyObjectInteraction(
  group: Object3D,
  state: { hovered: boolean; selected: boolean; spring: Spring },
  pointer: { nx: number; ny: number },
  { reduced, smoothTime, delta, hoverScale, tilt }: { reduced: boolean; smoothTime: number; delta: number; hoverScale: number; tilt: number },
): boolean {
  const base = state.hovered || state.selected ? hoverScale : 1;
  const springAtRest = stepSpring(state.spring, 0, delta);
  const goalScale = base + state.spring.value;
  if (reduced) group.scale.setScalar(base);
  else group.scale.setScalar(group.scale.x + (goalScale - group.scale.x) * Math.min(1, delta / Math.max(0.016, smoothTime / 2)));
  const tx = state.hovered && !reduced ? -pointer.ny * tilt : 0;
  const ty = state.hovered && !reduced ? pointer.nx * tilt : 0;
  if (reduced) group.rotation.set(0, 0, 0);
  else easing.dampE(group.rotation, [tx, ty, 0], smoothTime, delta);
  const rotSettled = Math.abs(group.rotation.x - tx) + Math.abs(group.rotation.y - ty) < EPS;
  return springAtRest && Math.abs(group.scale.x - goalScale) < 2e-3 && rotSettled;
}

/**
 * Routes three.js shader compilation errors to `report` (instead of the console dump) and returns
 * the function that restores the previous handler. Used by WebGLContextRecovery.
 */
export function captureShaderErrors(
  renderer: WebGLRenderer,
  context: WebGLRenderingContext | WebGL2RenderingContext,
  report: (message: string) => void,
) {
  const previous = renderer.debug.onShaderError;
  renderer.debug.onShaderError = (_gl, _program, vertex, fragment) => {
    const log = (shader: WebGLShader) => context.getShaderInfoLog(shader)?.trim() ?? "";
    report(log(fragment) || log(vertex) || "shader compilation failed");
  };
  return () => {
    renderer.debug.onShaderError = previous;
  };
}
