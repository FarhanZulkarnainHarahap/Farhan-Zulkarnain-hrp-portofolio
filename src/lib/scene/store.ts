/**
 * SceneManager state (Fase K4) — same two-tier pattern as the animation store (K3):
 *
 *  1. `snapshot`: low-frequency and reactive. Active route, section, scene, transition, selected /
 *     hovered / focused object, camera and lighting preset, quality tier, renderer status, render
 *     mode, canvas mount count, scene lifecycle, asset counters. React reads it with
 *     useSyncExternalStore (re-render only when the selected slice changes).
 *  2. `frame`: high-frequency and mutable, NEVER reactive. Current camera, renderer statistics,
 *     per-scene anchor placement and scroll progress, Theatre overrides, probes for tests. Written
 *     by the controllers inside the render loop and read in the same loop.
 *
 * No React state is set per frame. Server-safe.
 */
import type { QualityTier } from "@/lib/animation/config";
import type { CameraPresetId, LightingPresetId } from "./presets";
import type { RendererStatus, RenderMode, SceneId, SceneLifecycle, Vec3Tuple } from "./types";

export type SceneTransition = { from: SceneId | null; to: SceneId | null; phase: "idle" | "out" | "in" };

export type SceneSnapshot = Readonly<{
  route: string;
  section: string | null;
  /** Section when the outgoing scene was active (it stays in its own slot while it leaves). */
  previousSection: string | null;
  /** Scene resolved from route + section (or forced in the lab). */
  activeScene: SceneId | null;
  previousScene: SceneId | null;
  /** Development lab override; null = follow the route. */
  forcedScene: SceneId | null;
  transition: SceneTransition;
  hoveredObject: string | null;
  selectedObject: string | null;
  focusedObject: string | null;
  cameraPreset: CameraPresetId | null;
  /** Lab override for the lighting preset; null = the scene's own. */
  lightingPreset: LightingPresetId | null;
  quality: QualityTier;
  /** Why the quality manager chose the tier (capability probe, frame time). */
  qualityReasons: readonly string[];
  /** Lab override (pins the tier, disables runtime changes). */
  qualityPinned: boolean;
  renderer: RendererStatus;
  rendererError: string | null;
  renderMode: RenderMode;
  /** Times the <Canvas> was created (must stay 1 across public navigations). */
  mountCount: number;
  contextLosses: number;
  recoveries: number;
  scenes: Readonly<Partial<Record<SceneId, SceneLifecycle>>>;
  assets: Readonly<{ pending: number; loaded: number; failed: number; lastError: string | null }>;
}>;

export type CameraFrame = { position: Vec3Tuple; target: Vec3Tuple; fov: number; settled: boolean };
export type RendererFrame = { calls: number; triangles: number; textures: number; geometries: number; programs: number; frameTime: number; fps: number; frames: number };
export type ScenePlacement = {
  /** Anchor visible in the viewport (drives continuous rendering). */
  visible: boolean;
  /** 0 when the anchor's top enters the viewport bottom → 1 when its bottom leaves the top. */
  progress: number;
  /** World placement of the anchor centre and its world height (layout camera). */
  center: Vec3Tuple;
  height: number;
  width: number;
};

/** Values pushed by Theatre sheet objects (Fase 5 choreography); null = not driven. */
export type TheatreOverrides = {
  camera: { position: Vec3Tuple; target: Vec3Tuple; fov: number } | null;
  lights: { key: number; rim: number; environment: number } | null;
  objects: Record<string, { position: Vec3Tuple; rotation: Vec3Tuple; scale: number }>;
  materials: Record<string, { roughness: number; metalness: number; emissiveIntensity: number }>;
  mask: { progress: number; dissolve: number } | null;
};

export type SceneFrame = {
  camera: CameraFrame;
  renderer: RendererFrame;
  placement: Partial<Record<SceneId, ScenePlacement>>;
  theatre: TheatreOverrides;
  /** Test / debug probes written by scenes (e.g. the orbit's first node, the mask plane). */
  probes: Record<string, number | Vec3Tuple | string>;
};

const INITIAL: SceneSnapshot = {
  route: "/",
  section: null,
  previousSection: null,
  activeScene: null,
  previousScene: null,
  forcedScene: null,
  transition: { from: null, to: null, phase: "idle" },
  hoveredObject: null,
  selectedObject: null,
  focusedObject: null,
  cameraPreset: null,
  lightingPreset: null,
  quality: "medium",
  qualityReasons: [],
  qualityPinned: false,
  renderer: "idle",
  rendererError: null,
  renderMode: "off",
  mountCount: 0,
  contextLosses: 0,
  recoveries: 0,
  scenes: {},
  assets: { pending: 0, loaded: 0, failed: 0, lastError: null },
};

function createFrame(): SceneFrame {
  return {
    camera: { position: [0, 0, 10], target: [0, 0, 0], fov: 35, settled: true },
    renderer: { calls: 0, triangles: 0, textures: 0, geometries: 0, programs: 0, frameTime: 0, fps: 0, frames: 0 },
    placement: {},
    theatre: { camera: null, lights: null, objects: {}, materials: {}, mask: null },
    probes: {},
  };
}

function createSceneStore() {
  let snapshot: SceneSnapshot = INITIAL;
  const listeners = new Set<() => void>();
  const frame = createFrame();
  return {
    get: () => snapshot,
    getServer: () => INITIAL,
    /** Shallow merge; notifies only when a value changed (Object.is per key). */
    set(patch: Partial<SceneSnapshot>) {
      let changed = false;
      for (const key of Object.keys(patch) as (keyof SceneSnapshot)[])
        if (!Object.is(snapshot[key], patch[key])) changed = true;
      if (!changed) return;
      snapshot = { ...snapshot, ...patch };
      for (const listener of listeners) listener();
    },
    /** Updates one scene's lifecycle state. */
    setSceneStatus(id: SceneId, status: SceneLifecycle) {
      if (snapshot.scenes[id] === status) return;
      this.set({ scenes: { ...snapshot.scenes, [id]: status } });
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    frame,
  };
}

export const sceneStore = createSceneStore();
export type SceneStore = typeof sceneStore;
