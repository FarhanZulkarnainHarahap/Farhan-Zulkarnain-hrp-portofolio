/**
 * Global scene types (Fase K4). Shared by the scene store, registry, presets and the R3F
 * controllers in src/components/scene/.
 */

/** Every scene the persistent canvas can show. "lab" exists only in development. */
export type SceneId = "home" | "about" | "skills" | "journey" | "projects" | "project-detail" | "contact" | "lab";

export type Vec3Tuple = [number, number, number];

/**
 * Camera preset. Offsets are relative to the LAYOUT camera (see anchors.ts): objects are placed
 * from their DOM anchors with the layout camera, so presets only dolly / orbit / pan a little and
 * the 3D stays where the page layout put it.
 */
export type CameraPreset = {
  /** Camera position offset from the layout camera (scene metres). */
  offset: Vec3Tuple;
  /** Look-at target offset from the layout target. */
  target: Vec3Tuple;
  /** Field-of-view delta in degrees (dynamic FOV). */
  fovDelta: number;
  /** Pointer parallax amplitude (metres at the camera); 0 disables it. */
  parallax: number;
  /** Slow camera orbit around the target (rad/s); 0 disables it. */
  orbit: number;
};

/** Lighting preset (values from the design tokens; colours are resolved at runtime). */
export type LightingPreset = {
  ambient: number;
  hemisphere: number;
  key: { intensity: number; position: Vec3Tuple };
  rim: { intensity: number; position: Vec3Tuple };
  /** Accent point light near the subject (emissive details), 0 = off. */
  accent: number;
  /** Environment (IBL) intensity. */
  environment: number;
};

export type SceneDefinition = {
  id: SceneId;
  label: string;
  /** Placeholder geometry until the final scene of a later phase — never presented as final. */
  placeholder: boolean;
  /** `[data-scene-anchor~=…]` key the scene positions itself in. */
  anchor: string;
  camera: CameraPreset;
  /** Includes the environment (IBL) intensity: one shared environment map, per-scene intensity. */
  lighting: LightingPreset;
  /** Continuous animation while visible (orbit, idle); static scenes render on demand. */
  animated: boolean;
  /** Placed in the active section's anchor when there is one (/about sections). */
  sectionBased?: boolean;
};

export type RendererStatus =
  | "idle" // not requested yet
  | "unsupported" // no WebGL, or the quality tier forbids it
  | "loading" // three.js chunk loading
  | "active"
  | "lost" // context lost, recovery pending
  | "restoring"
  | "failed"; // renderer error, or recovery attempts exhausted → permanent fallback

export type RenderMode = "off" | "demand" | "continuous";

export type SceneLifecycle = "idle" | "loading" | "ready" | "active" | "deactivating" | "disposed" | "error";
