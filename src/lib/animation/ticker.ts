"use client";
/**
 * The single animation loop (Fase K3). One gsap.ticker callback (GSAP's own requestAnimationFrame,
 * which also runs every GSAP tween and ScrollTrigger) runs the phases in a fixed order each frame:
 *
 *   1. "scroll"   — Lenis advances the scroll position (→ ScrollTrigger.update, shared frame)
 *   2. "timeline" — Theatre's rafDriver ticks (sequence playback, onValuesChange callbacks)
 *   3. "render"   — R3F canvases advance (frameloop="never" + advance()), reading the refs the
 *                   previous phases wrote
 *
 * So scroll, choreography and rendering always see the same frame, and there is no second rAF
 * loop (Lenis autoRaf off, Theatre default driver unused, R3F's own loop off). The rAF stops by
 * itself while the tab is hidden.
 */
import { gsap, setupGsap } from "@/lib/gsap";

export type TickPhase = "scroll" | "timeline" | "render";
/** time: seconds since GSAP started; delta: ms since the previous tick; now: performance.now(). */
export type TickCallback = (time: number, delta: number, now: number) => void;

const PHASES: TickPhase[] = ["scroll", "timeline", "render"];
const callbacks: Record<TickPhase, Set<TickCallback>> = { scroll: new Set(), timeline: new Set(), render: new Set() };
let attached = false;
let frames = 0;

function run(time: number, delta: number) {
  frames++;
  const now = performance.now();
  for (const phase of PHASES) for (const cb of callbacks[phase]) cb(time, delta, now);
}

function size() {
  return PHASES.reduce((n, phase) => n + callbacks[phase].size, 0);
}

/** Adds a callback to a phase; returns the remover. The ticker detaches when nothing is left. */
export function addTick(phase: TickPhase, callback: TickCallback): () => void {
  setupGsap();
  callbacks[phase].add(callback);
  if (!attached) {
    gsap.ticker.add(run);
    attached = true;
  }
  return () => {
    callbacks[phase].delete(callback);
    if (attached && size() === 0) {
      gsap.ticker.remove(run);
      attached = false;
    }
  };
}

/** Debug: callbacks per phase and frames run (the lab shows it; a test checks it). */
export function tickerStats() {
  return { scroll: callbacks.scroll.size, timeline: callbacks.timeline.size, render: callbacks.render.size, attached, frames };
}
