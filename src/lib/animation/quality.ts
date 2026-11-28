/**
 * AnimationQualityManager (Fase K3): decides how much a device may render.
 *
 *  - `estimateTier()` uses cheap signals only (no WebGL context): reduced motion, Save-Data,
 *    device memory, CPU cores, coarse pointer, viewport size. Runs at startup.
 *  - `probeWebGL()` creates ONE throwaway context, reads the renderer and limits, then releases it
 *    (WEBGL_lose_context). Called lazily by the canvas (Fase 4) / the lab — never on pages that
 *    show no 3D. A software renderer (SwiftShader, llvmpipe) lowers the tier to "low".
 *  - `adaptiveDpr()` clamps the device pixel ratio to the tier's range; the canvas lowers it
 *    further when frames drop (drei PerformanceMonitor → `stepDown()`).
 */
import { QUALITY_PROFILES, type QualityProfile, type QualityTier } from "./config";
import type { WebGLStatus } from "./state";

export type WebGLProbe = {
  status: Exclude<WebGLStatus, "unknown" | "lost">;
  renderer: string | null;
  maxTextureSize: number;
  software: boolean;
};

type NavigatorSignals = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

const ORDER: QualityTier[] = ["minimal", "low", "medium", "high"];

/**
 * `ignoreReducedMotion`: for rendering quality (the canvas, Fase K4) reduced motion changes what
 * moves, not how well a frame may be drawn.
 */
export function estimateTier({ ignoreReducedMotion = false }: { ignoreReducedMotion?: boolean } = {}): { tier: QualityTier; reasons: string[] } {
  if (typeof window === "undefined") return { tier: "medium", reasons: ["server"] };
  const nav = navigator as NavigatorSignals;
  const reasons: string[] = [];
  let score = 3; // index in ORDER: high
  const lower = (to: number, why: string) => {
    if (to < score) {
      score = to;
      reasons.push(why);
    }
  };
  if (!ignoreReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) lower(1, "reduced motion");
  if (nav.connection?.saveData) lower(1, "save-data");
  if (/(^|-)2g$/.test(nav.connection?.effectiveType ?? "")) lower(1, "slow network");
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) lower(1, `memory ${nav.deviceMemory} GB`);
  else if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) lower(2, `memory ${nav.deviceMemory} GB`);
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) lower(1, `${nav.hardwareConcurrency} cores`);
  else if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) lower(2, `${nav.hardwareConcurrency} cores`);
  if (window.matchMedia("(pointer: coarse)").matches) lower(2, "touch device");
  if (!reasons.length) reasons.push("capable device");
  return { tier: ORDER[score], reasons };
}

let probeCache: WebGLProbe | null = null;

export function probeWebGL(): WebGLProbe {
  if (probeCache) return probeCache;
  if (typeof document === "undefined")
    return { status: "unavailable", renderer: null, maxTextureSize: 0, software: false };
  const canvas = document.createElement("canvas");
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  let status: WebGLProbe["status"] = "unavailable";
  try {
    gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false });
    if (gl) status = "webgl2";
    else {
      gl = canvas.getContext("webgl");
      if (gl) status = "webgl1";
    }
  } catch {
    gl = null;
  }
  let renderer: string | null = null;
  let maxTextureSize = 0;
  if (gl) {
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
    maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
  const software = !!renderer && /swiftshader|llvmpipe|software|basic render/i.test(renderer);
  probeCache = { status, renderer, maxTextureSize, software };
  return probeCache;
}

/** Tier after the WebGL probe: no WebGL → "minimal"; software renderer → at most "low". */
export function tierWithWebGL(tier: QualityTier, probe: WebGLProbe): QualityTier {
  if (probe.status === "unavailable") return "minimal";
  if (probe.software || probe.maxTextureSize < 4096) return ORDER[Math.min(ORDER.indexOf(tier), 1)];
  return tier;
}

export function profileFor(tier: QualityTier): QualityProfile {
  return QUALITY_PROFILES[tier];
}

/** One tier lower (adaptive performance), never below "low" while WebGL works. */
export function stepDown(tier: QualityTier): QualityTier {
  return ORDER[Math.max(1, ORDER.indexOf(tier) - 1)];
}

/** Device pixel ratio clamped to the tier's range. */
export function adaptiveDpr(tier: QualityTier): number {
  const [min, max] = QUALITY_PROFILES[tier].dpr;
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  return Math.min(max, Math.max(min, dpr));
}
