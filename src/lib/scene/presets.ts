/**
 * Camera, lighting and environment presets per scene / section (Fase K4).
 *
 * Camera presets are small offsets from the layout camera (anchors.ts) so the 3D never leaves the
 * place the page layout gives it: gentle dolly, a few degrees of orbit, a soft pointer parallax.
 * Nothing swings far or fast (motion-sickness budget: offset ≤ 0.6 m, orbit ≤ 0.05 rad/s).
 * Light intensities are tuned for MeshStandard/Physical materials with ACES tone mapping; colours
 * come from the design tokens at runtime (getColorTokens), so both themes stay on palette.
 * Theatre.js (Fase 5) can override any of these values through the scene store.
 */
import type { CameraPreset, LightingPreset, SceneDefinition, SceneId } from "./types";

const camera = (p: Partial<CameraPreset>): CameraPreset => ({ offset: [0, 0, 0], target: [0, 0, 0], fovDelta: 0, parallax: 0.18, orbit: 0, ...p });

export const CAMERA_PRESETS = {
  home: camera({ offset: [0, 0.15, -0.4], target: [0, 0, 0], fovDelta: -2, parallax: 0.22, orbit: 0.02 }),
  about: camera({ offset: [0.2, 0.1, 0], parallax: 0.15 }),
  skills: camera({ offset: [-0.25, 0.3, -0.2], target: [0, 0.05, 0], fovDelta: 2, parallax: 0.15 }),
  documents: camera({ offset: [0.1, -0.1, -0.3], fovDelta: -1, parallax: 0.12 }),
  journey: camera({ offset: [0.3, 0.2, 0], parallax: 0.15, orbit: 0.015 }),
  projects: camera({ offset: [-0.2, 0.15, -0.1], parallax: 0.15 }),
  "project-detail": camera({ offset: [0, 0, -0.2], fovDelta: -2, parallax: 0.1 }),
  contact: camera({ offset: [0, 0.2, 0], parallax: 0.2, orbit: 0.01 }),
  lab: camera({ offset: [0, 0.1, -0.3], parallax: 0.2, orbit: 0.02 }),
  /** Focus preset (lab button / Theatre): a centred zoom. Object focus instead dollies along the line of sight (drivers.cameraGoal). */
  focus: camera({ offset: [0, 0, -0.6], fovDelta: -4, parallax: 0.05 }),
} as const satisfies Record<string, CameraPreset>;

export type CameraPresetId = keyof typeof CAMERA_PRESETS;

const lighting = (p: Partial<LightingPreset>): LightingPreset => ({
  ambient: 0.18,
  hemisphere: 0.35,
  key: { intensity: 2.2, position: [3, 4, 5] },
  rim: { intensity: 1.2, position: [-4, 2, -3] },
  accent: 0,
  environment: 0.6,
  ...p,
});

export const LIGHTING_PRESETS = {
  /** Hero: cool key, accent rim and a faint accent point near the core. */
  hero: lighting({ key: { intensity: 2.4, position: [3, 4, 5] }, rim: { intensity: 1.6, position: [-4, 2, -3] }, accent: 1.2, environment: 0.7 }),
  /** Page scenes: calmer, more ambient, no accent point. */
  page: lighting({ ambient: 0.22, key: { intensity: 1.8, position: [2, 3, 5] }, rim: { intensity: 0.9, position: [-3, 2, -3] } }),
  /** Skills lattice: brighter fill so many small nodes stay legible. */
  lattice: lighting({ ambient: 0.28, hemisphere: 0.45, key: { intensity: 1.6, position: [1, 4, 4] }, rim: { intensity: 1.1, position: [-3, 1, -2] }, accent: 0.6 }),
  /** Showcase (projects): stronger key, low ambient for metallic contrast. */
  showcase: lighting({ ambient: 0.12, key: { intensity: 2.6, position: [4, 3, 4] }, rim: { intensity: 1.4, position: [-4, 3, -2] }, environment: 0.8 }),
} as const satisfies Record<string, LightingPreset>;

export type LightingPresetId = keyof typeof LIGHTING_PRESETS;

const scene = (d: SceneDefinition) => d;

/**
 * Scene definitions (the data half of the SceneRegistry; loaders live in components/scene).
 * Section-based scenes on /about: #profile → about, #stack → skills, #documents → about with the
 * "documents" camera (the old /about/detail|skills|docs routes are 308 redirects to these).
 */
export const SCENES: Record<SceneId, SceneDefinition> = {
  home: scene({ id: "home", label: "Home — technology orbit (prototype)", placeholder: true, anchor: "home", camera: CAMERA_PRESETS.home, lighting: LIGHTING_PRESETS.hero, animated: true }),
  about: scene({ id: "about", label: "About — profile object (placeholder)", placeholder: true, anchor: "page", camera: CAMERA_PRESETS.about, lighting: LIGHTING_PRESETS.page, animated: true, sectionBased: true }),
  skills: scene({ id: "skills", label: "Skills — lattice (placeholder)", placeholder: true, anchor: "skills", camera: CAMERA_PRESETS.skills, lighting: LIGHTING_PRESETS.lattice, animated: true, sectionBased: true }),
  journey: scene({ id: "journey", label: "Journey — helix path (placeholder)", placeholder: true, anchor: "page", camera: CAMERA_PRESETS.journey, lighting: LIGHTING_PRESETS.page, animated: true }),
  projects: scene({ id: "projects", label: "Projects — plate stack (placeholder)", placeholder: true, anchor: "page", camera: CAMERA_PRESETS.projects, lighting: LIGHTING_PRESETS.showcase, animated: true }),
  "project-detail": scene({ id: "project-detail", label: "Project — single plate (placeholder)", placeholder: true, anchor: "page", camera: CAMERA_PRESETS["project-detail"], lighting: LIGHTING_PRESETS.showcase, animated: false }),
  contact: scene({ id: "contact", label: "Contact — signal ring (placeholder)", placeholder: true, anchor: "page", camera: CAMERA_PRESETS.contact, lighting: LIGHTING_PRESETS.page, animated: true }),
  lab: scene({ id: "lab", label: "Lab — K4 test scene (development)", placeholder: true, anchor: "lab", camera: CAMERA_PRESETS.lab, lighting: LIGHTING_PRESETS.hero, animated: true }),
};

/** Section → camera preset override on section-based scenes. */
export const SECTION_CAMERA: Partial<Record<string, CameraPresetId>> = {
  documents: "documents",
};

/** Route + active section → scene. Unknown routes keep no scene (canvas idles, renders nothing). */
export function resolveScene(pathname: string, section: string | null): SceneId | null {
  if (pathname === "/") return "home";
  if (pathname === "/about") return section === "stack" ? "skills" : "about";
  if (pathname === "/journey") return "journey";
  if (pathname === "/projects") return "projects";
  if (pathname.startsWith("/projects/")) return "project-detail";
  if (pathname === "/contact") return "contact";
  if (pathname.startsWith("/dev/animation-lab")) return "lab";
  return null;
}
