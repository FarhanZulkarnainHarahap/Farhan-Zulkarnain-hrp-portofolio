/**
 * Theatre.js prop definitions (Fase K3). Factories take `types` from the lazily imported
 * @theatre/core, so nothing here pulls Theatre into a bundle by itself.
 *
 * Units: position = scene metres, rotation = radians, fov = degrees, 0–1 for progress values.
 * Every object of every sheet is declared in THEATRE_OBJECTS; renaming a key orphans its keyframes
 * in the committed state JSON (src/theatre/kinetic-systems.theatre.json).
 */
import type { types as TheatreTypes } from "@theatre/core";
import type { TheatreSheetKey } from "../config";

export type TheatreTypesModule = typeof TheatreTypes;

const TAU = Math.PI * 2;

export function vec3(t: TheatreTypesModule, [x, y, z]: [number, number, number] = [0, 0, 0], nudge = 0.01) {
  return t.compound({
    x: t.number(x, { nudgeMultiplier: nudge }),
    y: t.number(y, { nudgeMultiplier: nudge }),
    z: t.number(z, { nudgeMultiplier: nudge }),
  });
}

/** Position X/Y/Z, rotation X/Y/Z, uniform scale. */
export function transformProps(t: TheatreTypesModule, init: { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number } = {}) {
  const [rx, ry, rz] = init.rotation ?? [0, 0, 0];
  return {
    position: vec3(t, init.position),
    rotation: t.compound({
      x: t.number(rx, { range: [-TAU, TAU], nudgeMultiplier: 0.01 }),
      y: t.number(ry, { range: [-TAU, TAU], nudgeMultiplier: 0.01 }),
      z: t.number(rz, { range: [-TAU, TAU], nudgeMultiplier: 0.01 }),
    }),
    scale: t.number(init.scale ?? 1, { range: [0, 4], nudgeMultiplier: 0.01 }),
  };
}

/** Camera position, look-at target and field of view. */
export function cameraProps(t: TheatreTypesModule, init: { position?: [number, number, number]; target?: [number, number, number]; fov?: number } = {}) {
  return {
    position: vec3(t, init.position ?? [0, 0, 6]),
    target: vec3(t, init.target ?? [0, 0, 0]),
    fov: t.number(init.fov ?? 35, { range: [10, 90] }),
  };
}

/** Light intensity and position. */
export function lightProps(t: TheatreTypesModule, init: { intensity?: number; position?: [number, number, number] } = {}) {
  return {
    intensity: t.number(init.intensity ?? 1, { range: [0, 20], nudgeMultiplier: 0.05 }),
    position: vec3(t, init.position ?? [3, 4, 5], 0.05),
  };
}

/** PBR material response. */
export function materialProps(t: TheatreTypesModule, init: { roughness?: number; metalness?: number; emissiveIntensity?: number } = {}) {
  return {
    roughness: t.number(init.roughness ?? 0.35, { range: [0, 1] }),
    metalness: t.number(init.metalness ?? 0.8, { range: [0, 1] }),
    emissiveIntensity: t.number(init.emissiveIntensity ?? 0, { range: [0, 10], nudgeMultiplier: 0.05 }),
  };
}

/** Mask / dissolve progress and the shader uniforms that shape the edge. */
export function maskProps(t: TheatreTypesModule, init: { progress?: number; dissolve?: number } = {}) {
  return {
    progress: t.number(init.progress ?? 1, { range: [0, 1] }),
    dissolve: t.number(init.dissolve ?? 0, { range: [0, 1] }),
    uniforms: t.compound({
      feather: t.number(0.08, { range: [0, 0.5] }),
      noiseScale: t.number(3, { range: [0, 20], nudgeMultiplier: 0.1 }),
      edgeGlow: t.number(1.5, { range: [0, 10], nudgeMultiplier: 0.05 }),
    }),
  };
}

/** Every Theatre object, per sheet. Phase 4+ scenes create them through useTheatreObject(). */
export const THEATRE_OBJECTS = {
  heroOrbit: {
    "Orbit Root": (t: TheatreTypesModule) => transformProps(t),
    "Core Material": (t: TheatreTypesModule) => materialProps(t, { roughness: 0.28, metalness: 0.9, emissiveIntensity: 0.4 }),
    Rings: (t: TheatreTypesModule) => ({
      spread: t.number(1, { range: [0.5, 2] }),
      tilt: t.number(0, { range: [-1, 1] }),
      speed: t.number(1, { range: [0, 4] }),
    }),
  },
  camera: {
    Camera: (t: TheatreTypesModule) => cameraProps(t),
  },
  lighting: {
    "Key Light": (t: TheatreTypesModule) => lightProps(t, { intensity: 2.2, position: [3, 4, 5] }),
    "Rim Light": (t: TheatreTypesModule) => lightProps(t, { intensity: 1.4, position: [-4, 2, -3] }),
    Environment: (t: TheatreTypesModule) => ({ intensity: t.number(0.6, { range: [0, 4] }) }),
  },
  scrollMask: {
    Mask: (t: TheatreTypesModule) => maskProps(t, { progress: 0 }),
  },
  pageTransition: {
    Overlay: (t: TheatreTypesModule) => maskProps(t, { progress: 0 }),
    "Camera Offset": (t: TheatreTypesModule) => transformProps(t),
  },
  projectShowcase: {
    Showcase: (t: TheatreTypesModule) => ({ ...transformProps(t), ...materialProps(t) }),
  },
  journey: {
    Path: (t: TheatreTypesModule) => ({ progress: t.number(0, { range: [0, 1] }) }),
    Camera: (t: TheatreTypesModule) => cameraProps(t),
  },
  lab: {
    "Lab Object": (t: TheatreTypesModule) => ({ ...transformProps(t), ...materialProps(t, { emissiveIntensity: 0.2 }) }),
  },
} as const satisfies Record<TheatreSheetKey, Record<string, (t: TheatreTypesModule) => Record<string, unknown>>>;

export type TheatreObjectKey<S extends TheatreSheetKey> = keyof (typeof THEATRE_OBJECTS)[S] & string;
