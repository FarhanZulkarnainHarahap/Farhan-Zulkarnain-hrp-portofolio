/**
 * RenderLoopController (Fase K4): when the persistent canvas draws, on the shared ticker (K3, one
 * rAF loop for Lenis, GSAP, Theatre and R3F).
 *
 *  - Continuous while at least one reason is held: an animated scene whose anchor is visible
 *    (orbit, idle), a running transition, an unsettled camera, a Theatre timeline, an interaction.
 *  - On demand otherwise: `invalidate(n)` draws n frames (scroll moved an anchor, a preset or the
 *    theme changed, a resize) and the render tick detaches again — a static scene requests no
 *    animation frames at all.
 *  - Suspended while the WebGL context is lost or the canvas is torn down.
 *  - Clock: R3F's `advance(t)` takes the scene time in SECONDS. The loop keeps its own scene clock
 *    and clamps each step (≤ 50 ms; a resume after a hidden tab or a long task counts as one
 *    normal frame), so nothing jumps when the tab comes back and animations simply continue.
 *  - The frame time of continuous frames feeds the quality manager.
 */
import { addTick } from "@/lib/animation/ticker";
import { sceneStore } from "./store";
import type { RenderMode } from "./types";

const MAX_STEP = 1 / 20;
const RESUME_GAP = 0.25;

export type RenderLoop = ReturnType<typeof createRenderLoop>;

export function createRenderLoop({
  advance,
  afterFrame,
}: {
  /** R3F advance with the scene time in seconds. */
  advance: (seconds: number) => void;
  /** After every drawn frame (renderer statistics). `realMs` is 0 for the first frame after idle. */
  afterFrame?: (realMs: number) => void;
}) {
  const reasons = new Set<string>();
  /** Real frame time (ms) of continuous frames → the quality manager. */
  const frameTimeListeners = new Set<(ms: number) => void>();
  let pending = 0;
  let suspended = false;
  let removeTick: (() => void) | null = null;
  let lastNow = 0;
  let clock = 0;
  let mode: RenderMode = "off";

  const report = () => {
    // "demand" covers both "drawing a few requested frames" and "idle, waiting for a request".
    const next: RenderMode = suspended ? "off" : reasons.size > 0 ? "continuous" : "demand";
    if (next !== mode) {
      mode = next;
      sceneStore.set({ renderMode: mode });
    }
  };

  const tick = (_time: number, _delta: number, now: number) => {
    const real = lastNow ? (now - lastNow) / 1000 : 0;
    lastNow = now;
    const step = real <= 0 || real > RESUME_GAP ? 1 / 60 : Math.min(real, MAX_STEP);
    clock += step;
    const continuous = reasons.size > 0;
    advance(clock);
    const realMs = real > 0 && real <= RESUME_GAP ? real * 1000 : 0;
    if (continuous && realMs) for (const listener of frameTimeListeners) listener(realMs);
    afterFrame?.(realMs);
    if (pending > 0) pending--;
    if (!continuous && pending === 0) detach();
  };

  const attach = () => {
    if (removeTick || suspended) return;
    lastNow = 0;
    removeTick = addTick("render", tick);
  };
  const detach = () => {
    removeTick?.();
    removeTick = null;
  };
  const update = () => {
    if (!suspended && (reasons.size > 0 || pending > 0)) attach();
    report();
  };

  return {
    /** Keep (or stop) rendering continuously for a named reason. */
    hold(reason: string, on: boolean) {
      if (on === reasons.has(reason)) return;
      if (on) reasons.add(reason);
      else reasons.delete(reason);
      update();
    },
    /** Draw at least `frames` more frames (static scenes: something changed). */
    invalidate(frames = 1) {
      pending = Math.max(pending, frames);
      update();
    },
    suspend() {
      suspended = true;
      detach();
      report();
    },
    resume() {
      suspended = false;
      pending = Math.max(pending, 2);
      update();
    },
    dispose() {
      reasons.clear();
      pending = 0;
      detach();
      mode = "off";
      sceneStore.set({ renderMode: "off" });
    },
    /** Frame times of continuous frames (quality manager). */
    onFrameTime(listener: (ms: number) => void) {
      frameTimeListeners.add(listener);
      return () => void frameTimeListeners.delete(listener);
    },
    /** Scene time in seconds (what scenes animate with). */
    time: () => clock,
    reasons: () => [...reasons],
    attached: () => removeTick !== null,
  };
}
