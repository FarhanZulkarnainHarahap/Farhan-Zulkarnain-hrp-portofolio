/**
 * Layer drivers (Fase K3): plain functions that apply one engine's values to one TransformStack
 * layer (or material / uniforms). Called from useFrame; each writes only what its owner owns.
 * Keeping them outside components makes ownership explicit and keeps per-frame mutation out of
 * React render logic.
 */
import { easing } from "maath";
import type { Material, MeshStandardMaterial, Object3D } from "three";
import type { MotionTokenSet } from "@/lib/design-tokens";
import type { MaskUniforms } from "./mask-material";

export type Vec3Value = { x: number; y: number; z: number };
export type TransformValue = { position: Vec3Value; rotation: Vec3Value; scale: number };
export type MaterialValue = { roughness: number; metalness: number; emissiveIntensity: number };
export type MaskValue = { progress: number; dissolve: number; uniforms: { feather: number; noiseScale: number; edgeGlow: number } };

/** scroll layer ← ScrollTrigger progress (0–1): a half turn around X over the range. */
export function applyScrollLayer(layer: Object3D, progress: number, turn = Math.PI) {
  layer.rotation.x = progress * turn;
}

/** choreography layer ← Theatre transform values. */
export function applyChoreography(layer: Object3D, v: TransformValue) {
  layer.position.set(v.position.x, v.position.y, v.position.z);
  layer.rotation.set(v.rotation.x, v.rotation.y, v.rotation.z);
  layer.scale.setScalar(v.scale);
}

/** material ← Theatre material values. */
export function applyMaterial(material: Material, v: MaterialValue) {
  const m = material as MeshStandardMaterial;
  m.roughness = v.roughness;
  m.metalness = v.metalness;
  m.emissiveIntensity = v.emissiveIntensity;
}

/** GLSL mask uniforms ← Theatre mask values. */
export function applyMask(uniforms: MaskUniforms, v: MaskValue) {
  uniforms.uMaskProgress.value = v.progress;
  uniforms.uDissolve.value = v.dissolve;
  uniforms.uFeather.value = v.uniforms.feather;
  uniforms.uNoiseScale.value = v.uniforms.noiseScale;
  uniforms.uEdgeGlow.value = v.uniforms.edgeGlow;
}

/** idle layer ← clock: float (sin), breath (scale), slow spin. Rests under reduced motion. */
export function applyIdle(
  layer: Object3D,
  time: number,
  idle: MotionTokenSet["idle"],
  { reduced, amplitude, period, spin }: { reduced: boolean; amplitude?: number; period?: number; spin?: number },
) {
  if (reduced) {
    layer.position.y = 0;
    layer.scale.setScalar(1);
    return;
  }
  const w = (Math.PI * 2) / (period ?? idle.floatPeriod);
  layer.position.y = Math.sin(time * w) * (amplitude ?? idle.floatAmplitude);
  layer.scale.setScalar(1 + (Math.sin(time * w * 0.5) * 0.5 + 0.5) * (idle.breathScale - 1));
  layer.rotation.y = time * (spin ?? idle.rotationSpeed);
}

export type InteractionInput = { hovered: boolean; pressed: boolean; follow: boolean };

/** interaction layer ← hover / press / pointer, critically damped (maath), interruptible. */
export function applyInteraction(
  layer: Object3D,
  input: InteractionInput,
  pointer: { nx: number; ny: number },
  delta: number,
  t: MotionTokenSet,
  { reduced, tilt = 0.35, lift = 0.12 }: { reduced: boolean; tilt?: number; lift?: number },
) {
  const scale = input.pressed ? t.press.scale : input.hovered ? t.hover.scale * 1.04 : 1;
  const smooth = reduced ? 0 : t.camera.smoothTime;
  easing.damp3(layer.scale, [scale, scale, scale], smooth / 2, delta);
  easing.damp3(layer.position, [0, input.hovered && !reduced ? lift : 0, 0], smooth, delta);
  const follow = input.follow && !reduced;
  easing.dampE(layer.rotation, [follow ? -pointer.ny * tilt : 0, follow ? pointer.nx * tilt : 0, 0], smooth, delta);
}
