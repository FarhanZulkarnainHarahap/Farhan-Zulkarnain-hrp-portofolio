/**
 * AnimationConfig (Fase K3): the one place that says which engine owns what, which durations each
 * kind of motion may use, and how much each quality tier may render. Numbers come from the CSS
 * design tokens (src/app/globals.css → src/lib/design-tokens.ts); this file only names and checks
 * them. Docs: docs/ANIMATION_ARCHITECTURE.md.
 */
import { getMotionTokens, type MotionTokenSet, type Seconds } from "@/lib/design-tokens";

// ── Engines and ownership ─────────────────────────────────────────────────────

export type AnimationEngine =
  | "three" // rendering: geometry, materials, lights
  | "r3f" // React integration + the single render loop; applies transforms in useFrame
  | "drei" // 3D helpers (environment, camera helpers, adaptive DPR)
  | "theatre" // cinematic choreography: keyframed sequences
  | "gsap" // DOM sequencing / timelines
  | "scrolltrigger" // scroll-driven progress (the only scroll → progress mapping)
  | "lenis" // smooth scrolling (the scroll position itself)
  | "motion" // DOM UI micro-interactions
  | "maath" // damping / interpolation of pointer response
  | "glsl" // masking, dissolve, distortion (shader uniforms)
  | "postprocessing" // screen-space effects
  | "css"; // light transitions, hover colours, pre-hide

/** Responsibility of each engine (rendered in the lab and in the docs). */
export const ENGINE_RESPONSIBILITY: Readonly<Record<AnimationEngine, string>> = {
  three: "3D rendering, geometry, material, lighting",
  r3f: "React integration and the single render loop",
  drei: "3D utilities, environment, camera helpers",
  theatre: "Cinematic choreography and keyframe timelines",
  gsap: "Complex DOM animation sequencing",
  scrolltrigger: "Scroll-driven progress",
  lenis: "Smooth scrolling",
  motion: "UI animation and micro-interactions",
  maath: "Damping and smooth interpolation",
  glsl: "Object masking, dissolve, distortion",
  postprocessing: "Cinematic rendering effects",
  css: "Lightweight animation and transitions",
};

/**
 * Transform layers of an animated 3D object, outermost first. Each layer is an Object3D (group)
 * owned by exactly one engine, so scroll, choreography, interaction and idle compose by
 * multiplication instead of overwriting each other (components/three/TransformStack.tsx).
 */
export const TRANSFORM_LAYERS = [
  { layer: "scene-root", owner: "r3f", drives: "placement in the scene" },
  { layer: "route-transition", owner: "r3f", drives: "scene enter / leave (SceneRoot, Fase K4)" },
  { layer: "scroll", owner: "scrolltrigger", drives: "scroll progress → position / rotation (persistent canvas: ScrollSceneController from the shared scroll frame)" },
  { layer: "choreography", owner: "theatre", drives: "keyframed cinematic transform" },
  { layer: "interaction", owner: "maath", drives: "damped hover / pointer / click response" },
  { layer: "idle", owner: "r3f", drives: "float, breath, slow rotation (useFrame clock)" },
  { layer: "mesh", owner: "glsl", drives: "material uniforms: mask, dissolve" },
] as const satisfies readonly { layer: string; owner: AnimationEngine; drives: string }[];

export type TransformLayer = (typeof TRANSFORM_LAYERS)[number]["layer"];

/** Property-level ownership rules (what a registry claim may combine). */
export const OWNERSHIP_RULES: readonly { property: string; owner: AnimationEngine; note: string }[] = [
  { property: "window scroll position", owner: "lenis", note: "native scroll when Lenis is off (reduced motion, touch)" },
  { property: "scroll progress (0–1) of a section", owner: "scrolltrigger", note: "fed by the shared scroll store" },
  { property: "Theatre sequence position", owner: "theatre", note: "GSAP/ScrollTrigger may set it; nothing else animates the values" },
  { property: "DOM element transform / opacity", owner: "motion", note: "GSAP for page intros and reveals: never both on one element" },
  { property: "Object3D transform (per layer)", owner: "r3f", note: "one engine per TransformStack layer" },
  { property: "global camera (persistent canvas)", owner: "r3f", note: "CameraController only; Theatre values replace its goal (Fase 5)" },
  { property: "global lights / environment intensity", owner: "r3f", note: "LightingController only; Theatre values override presets" },
  { property: "shader uniforms", owner: "glsl", note: "values come from Theatre or scroll, written in useFrame" },
];

// ── Durations ─────────────────────────────────────────────────────────────────

export type DurationKind =
  | "micro"
  | "hover"
  | "press"
  | "enter"
  | "section"
  | "page"
  | "camera"
  | "idleFloat"
  | "orbitRevolution";

/** Allowed ranges (seconds) from the master prompt; the starting values sit inside them. */
export const DURATION_RANGES: Readonly<Record<DurationKind, readonly [Seconds, Seconds]>> = {
  micro: [0.12, 0.18],
  hover: [0.2, 0.35],
  press: [0.1, 0.18],
  enter: [0.4, 0.7],
  section: [0.6, 1],
  page: [0.6, 1],
  camera: [0.8, 1.5],
  idleFloat: [3, 6],
  orbitRevolution: [12, 40],
};

/** Current duration of each kind from the tokens (reduced motion: ~0, set in CSS). */
export function durations(tokens: MotionTokenSet = getMotionTokens()): Record<DurationKind, Seconds> {
  return {
    micro: tokens.duration.micro,
    hover: tokens.duration.hover,
    press: tokens.duration.press,
    enter: tokens.duration.enter,
    section: tokens.duration.section,
    page: tokens.duration.page,
    camera: tokens.duration.camera,
    idleFloat: tokens.idle.floatPeriod,
    orbitRevolution: tokens.orbit.middle,
  };
}

/** Kinds whose token falls outside its range (empty = valid). Used by the lab and tests. */
export function durationViolations(tokens: MotionTokenSet = getMotionTokens()) {
  const values = durations(tokens);
  const orbit = [tokens.orbit.inner, tokens.orbit.middle, tokens.orbit.outer];
  const out: string[] = [];
  for (const kind of Object.keys(DURATION_RANGES) as DurationKind[]) {
    const [min, max] = DURATION_RANGES[kind];
    const list = kind === "orbitRevolution" ? orbit : [values[kind]];
    for (const v of list) if (v < min - 1e-6 || v > max + 1e-6) out.push(`${kind}=${v}s ∉ [${min}, ${max}]`);
  }
  return out;
}

/** GSAP ease names registered by setupGsap() (CustomEase from the --ease-* tokens). */
export const EASE = {
  standard: "standard",
  enter: "enter",
  exit: "exit",
  cinematic: "cinematic",
  mask: "mask",
} as const;
export type EaseName = keyof typeof EASE;

// ── Quality ───────────────────────────────────────────────────────────────────

export type QualityTier = "high" | "medium" | "low" | "minimal";

export type QualityProfile = {
  /** Device pixel ratio clamp for the WebGL canvas. */
  dpr: readonly [number, number];
  antialias: boolean;
  postprocessing: boolean;
  shadows: boolean;
  /** Particle budget for decorative systems. */
  particles: number;
  /** Max simultaneous high-frequency animations (registry warns above this). */
  maxActive: number;
  /** Smooth wheel scrolling (Lenis). */
  smoothScroll: boolean;
  /** WebGL scenes at all ("minimal" uses the static fallbacks). */
  webgl: boolean;
};

export const QUALITY_PROFILES: Readonly<Record<QualityTier, QualityProfile>> = {
  high: { dpr: [1, 2], antialias: true, postprocessing: true, shadows: true, particles: 1200, maxActive: 48, smoothScroll: true, webgl: true },
  medium: { dpr: [1, 1.5], antialias: true, postprocessing: true, shadows: false, particles: 600, maxActive: 32, smoothScroll: true, webgl: true },
  low: { dpr: [1, 1], antialias: false, postprocessing: false, shadows: false, particles: 200, maxActive: 16, smoothScroll: false, webgl: true },
  minimal: { dpr: [1, 1], antialias: false, postprocessing: false, shadows: false, particles: 0, maxActive: 8, smoothScroll: false, webgl: false },
};

// ── Theatre.js ────────────────────────────────────────────────────────────────

/** The project id is also the key in the exported state JSON (src/theatre/). */
export const THEATRE_PROJECT_ID = "Kinetic Systems";

/** Sheet ids (stable: renaming one orphans its keyframes in the state JSON). */
export const THEATRE_SHEETS = {
  heroOrbit: "Hero Orbit",
  camera: "Global Camera",
  lighting: "Lighting",
  scrollMask: "Scroll Masking",
  pageTransition: "Page Transition",
  projectShowcase: "Project Showcase",
  journey: "Journey Timeline",
  lab: "Animation Lab",
} as const;
export type TheatreSheetKey = keyof typeof THEATRE_SHEETS;
export type TheatreSheetId = (typeof THEATRE_SHEETS)[TheatreSheetKey];
