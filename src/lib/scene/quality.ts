/**
 * QualityManager for the persistent canvas (Fase K4), on top of the K3 quality module.
 *
 * Tier = min(capability ceiling, runtime tier):
 *  - Capability ceiling (once): K3 `estimateTier()` signals (Save-Data, device memory, CPU cores,
 *    coarse pointer) + `probeWebGL()` (no WebGL → minimal = static fallback; software renderer or
 *    small max texture size → at most low). Never screen size or user agent alone.
 *  - Runtime (continuously, only while frames are rendered continuously): frame-time windows of
 *    one second. Hysteresis: step down after 3 consecutive slow windows (median > 28 ms, i.e. under
 *    ~36 fps); step up only after 10 consecutive fast windows (median < 12 ms), at most twice per
 *    session, never above the ceiling, and never within 20 s of the previous change — so the tier
 *    cannot flap. Samples over 250 ms (tab switch, debugger) and the first 30 frames after a resume
 *    are ignored.
 *
 * Profiles (K3 config QUALITY_PROFILES): high = DPR ≤ 2, antialias, shadows, detailed geometry;
 * medium = DPR ≤ 1.5, no shadows, moderate geometry; low = DPR 1, simplified geometry, minimal
 * lighting, no post-processing, fewer particles; minimal = no WebGL (fallback).
 */
import type { QualityTier } from "@/lib/animation/config";
import { estimateTier, probeWebGL, tierWithWebGL } from "@/lib/animation/quality";

const ORDER: QualityTier[] = ["minimal", "low", "medium", "high"];
const rank = (tier: QualityTier) => ORDER.indexOf(tier);

export function capabilityTier(): { tier: QualityTier; reasons: string[]; webgl: ReturnType<typeof probeWebGL> } {
  const base = estimateTier({ ignoreReducedMotion: true });
  const webgl = probeWebGL();
  const reasons = base.reasons.filter((r) => r !== "capable device");
  if (webgl.status === "unavailable") reasons.push("no WebGL");
  else if (webgl.software) reasons.push(`software renderer (${webgl.renderer})`);
  else if (webgl.maxTextureSize < 4096) reasons.push(`max texture ${webgl.maxTextureSize}`);
  if (!reasons.length) reasons.push("capable device");
  return { tier: tierWithWebGL(base.tier, webgl), reasons, webgl };
}

export type FrameMonitor = {
  sample(deltaMs: number): void;
  /** Ignore the next frames (resume, mount, tier change). */
  settle(frames?: number): void;
};

export function createFrameMonitor({
  ceiling,
  initial,
  onChange,
}: {
  ceiling: QualityTier;
  initial: QualityTier;
  onChange: (tier: QualityTier, reason: string) => void;
}): FrameMonitor {
  let tier = initial;
  let samples: number[] = [];
  let windowStart = 0;
  let elapsed = 0;
  let slow = 0;
  let fast = 0;
  let upgrades = 0;
  let lastChange = -Infinity;
  let skip = 30;

  const change = (next: QualityTier, reason: string) => {
    tier = next;
    lastChange = elapsed;
    slow = 0;
    fast = 0;
    skip = 30;
    onChange(next, reason);
  };

  return {
    sample(deltaMs) {
      if (deltaMs <= 0) return;
      if (deltaMs > 250) {
        skip = 30;
        return;
      }
      elapsed += deltaMs;
      if (skip > 0) {
        skip--;
        windowStart = elapsed;
        samples = [];
        return;
      }
      samples.push(deltaMs);
      if (elapsed - windowStart < 1000) return;
      const sorted = samples.slice().sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
      samples = [];
      windowStart = elapsed;
      if (median > 28) {
        slow++;
        fast = 0;
      } else if (median < 12) {
        fast++;
        slow = 0;
      } else {
        slow = 0;
        fast = 0;
      }
      const cooled = elapsed - lastChange > 20_000;
      if (slow >= 3 && rank(tier) > rank("low") && cooled) change(ORDER[rank(tier) - 1], `frame time ${median.toFixed(1)} ms`);
      else if (fast >= 10 && rank(tier) < rank(ceiling) && upgrades < 2 && cooled) {
        upgrades++;
        change(ORDER[rank(tier) + 1], `frame time ${median.toFixed(1)} ms`);
      }
    },
    settle(frames = 30) {
      skip = frames;
    },
  };
}
