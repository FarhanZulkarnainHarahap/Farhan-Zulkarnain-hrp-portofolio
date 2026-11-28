/**
 * SceneController (Fase K4): the imperative API of the global scene manager. DOM-side code (the
 * route / section sync, the lab, tests) talks to the persistent canvas only through this object;
 * the R3F controllers attach their handles here when the canvas mounts.
 *
 *  - Scene selection: route + active section → scene (presets.resolveScene), or a lab override.
 *    A change starts a transition (out → in) that SceneRoot plays on the RouteTransitionGroups.
 *  - Presets: camera (scene / section / lab override, focus), lighting (scene / lab override).
 *  - Objects: hover, select, focus (camera), reset.
 *  - Quality: pin a tier (lab) or follow the quality manager.
 *  - Rendering: invalidate, and — for tests and the lab — lose / restore the WebGL context on purpose.
 */
import type { QualityTier } from "@/lib/animation/config";
import type { CameraPresetId, LightingPresetId } from "./presets";
import { resolveScene, SECTION_CAMERA } from "./presets";
import { objectRegistry } from "./objects";
import { sceneStore, type SceneSnapshot } from "./store";
import type { RenderLoop } from "./render-loop";
import type { SceneId } from "./types";

type RendererHandle = {
  loseContext: () => boolean;
  restoreContext: () => boolean;
};

let loop: RenderLoop | null = null;
let renderer: RendererHandle | null = null;
let setQuality: ((tier: QualityTier | null) => void) | null = null;
let preloaders: Partial<Record<SceneId, () => Promise<unknown>>> = {};

function applyScene(route: string, section: string | null) {
  const s = sceneStore.get();
  const next = s.forcedScene ?? resolveScene(route, section);
  const sectionCamera = section ? SECTION_CAMERA[section] : undefined;
  const patch: { -readonly [K in keyof SceneSnapshot]?: SceneSnapshot[K] } = { route, section };
  if (next !== s.activeScene) {
    patch.activeScene = next;
    patch.previousScene = s.activeScene;
    patch.previousSection = s.section;
    patch.transition = { from: s.activeScene, to: next, phase: s.activeScene ? "out" : "in" };
    patch.selectedObject = null;
    patch.hoveredObject = null;
    patch.focusedObject = null;
  }
  // Section-based camera on the same scene (e.g. /about#documents), unless the lab pinned one.
  if (!s.forcedScene) patch.cameraPreset = sectionCamera ?? null;
  sceneStore.set(patch);
  loop?.invalidate(2);
}

export const sceneController = {
  /** Route / section changed (AnimationProvider state → GlobalCanvasMount). */
  sync(route: string, section: string | null) {
    applyScene(route, section);
  },
  /** Lab: show a scene regardless of the route (null = follow the route again). */
  forceScene(id: SceneId | null) {
    sceneStore.set({ forcedScene: id });
    const s = sceneStore.get();
    applyScene(s.route, s.section);
  },
  /** SceneRoot: the outgoing scene finished leaving / the incoming one finished entering. */
  transitionPhase(phase: "in" | "idle") {
    const t = sceneStore.get().transition;
    sceneStore.set({ transition: { ...t, phase } });
  },
  setCameraPreset(id: CameraPresetId | null) {
    sceneStore.set({ cameraPreset: id });
    loop?.invalidate(2);
  },
  setLightingPreset(id: LightingPresetId | null) {
    sceneStore.set({ lightingPreset: id });
    loop?.invalidate(2);
  },
  hover(id: string | null) {
    sceneStore.set({ hoveredObject: id });
  },
  select(id: string | null) {
    sceneStore.set({ selectedObject: id });
    loop?.invalidate(2);
  },
  /** Camera focus on an object (null = back to the scene preset). */
  focus(id: string | null) {
    sceneStore.set({ focusedObject: id && objectRegistry.get(id) ? id : null });
    loop?.invalidate(2);
  },
  /** Keyboard / touch alternative to clicking a mesh: same response, then focus. */
  activate(id: string) {
    const object = objectRegistry.get(id);
    if (!object) return false;
    object.press();
    sceneController.select(id);
    return true;
  },
  resetCamera() {
    sceneStore.set({ focusedObject: null, selectedObject: null, cameraPreset: null });
    loop?.invalidate(2);
  },
  /** Lab: pin a tier (null = back to the quality manager). */
  pinQuality(tier: QualityTier | null) {
    sceneStore.set({ qualityPinned: tier !== null });
    setQuality?.(tier);
  },
  invalidate(frames = 2) {
    loop?.invalidate(frames);
  },
  /** Register the preloaders of the scene modules (components/scene/registry). */
  setPreloaders(map: Partial<Record<SceneId, () => Promise<unknown>>>) {
    preloaders = map;
  },
  preload(id: SceneId) {
    return preloaders[id]?.() ?? Promise.resolve();
  },
  attachLoop(next: RenderLoop | null) {
    loop = next;
  },
  attachRenderer(next: RendererHandle | null) {
    renderer = next;
  },
  /** QualityManager: applies a pinned tier (null = back to the measured tier). */
  attachQuality(next: ((tier: QualityTier | null) => void) | null) {
    setQuality = next;
  },
  /** Tests / lab: WEBGL_lose_context.loseContext() on the live canvas. */
  loseContext: () => renderer?.loseContext() ?? false,
  restoreContext: () => renderer?.restoreContext() ?? false,
};

export type SceneController = typeof sceneController;

/** Read-only debug surface: window.__kinetic.scene (next to the K3 animation debug). */
export function exposeSceneDebug(extra: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __kinetic?: Record<string, unknown> };
  w.__kinetic ??= {};
  w.__kinetic.scene = {
    state: () => sceneStore.get(),
    frame: () => sceneStore.frame,
    objects: () => objectRegistry.list().map(({ id, scene, label, worldPosition }) => ({ id, scene, label, position: worldPosition() })),
    loop: () => ({ reasons: loop?.reasons() ?? [], attached: loop?.attached() ?? false, time: loop?.time() ?? 0 }),
    controller: sceneController,
    ...extra,
  };
}
