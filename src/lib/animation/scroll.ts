/**
 * ScrollProgressController (Fase K3): the ONE source of scroll position / progress / direction /
 * velocity for every engine.
 *
 *  - An engine writes `animationStore.frame.scroll` and emits a "scroll" frame event:
 *      · Lenis engine (smooth-scroll-runtime.ts, loaded dynamically): from Lenis' own scroll event,
 *        driven by gsap.ticker (one rAF loop for Lenis + GSAP + ScrollTrigger);
 *      · native engine (here): a passive scroll listener, used under reduced motion, on touch-only
 *        devices and until/unless Lenis loads.
 *    Lenis scrolls the real window, so ScrollTrigger, IntersectionObserver, anchors and browser
 *    scroll restoration all keep reading native scrollY: there is no second, virtual position.
 *  - `scrollToTarget()` is the programmatic API (smooth via Lenis when active, otherwise native,
 *    instant under reduced motion).
 *  - `acquireScrollLock()` is counter-based (menu + palette may overlap): locks <html> overflow
 *    and stops Lenis; the last release restores both.
 */
import { animationStore } from "./state";

export type ScrollTarget = number | string | HTMLElement;
export type ScrollToOptions = {
  offset?: number;
  immediate?: boolean;
  duration?: number;
  onComplete?: () => void;
};

export type ScrollEngine = {
  kind: "lenis" | "native";
  scrollTo: (target: ScrollTarget, options?: ScrollToOptions) => void;
  stop: () => void;
  start: () => void;
  /** Re-measure (content height changed, route changed). */
  resize: () => void;
  /** Drop inertia and sync to the real scroll position (navigation). */
  reset: () => void;
  destroy: () => void;
};

let engine: ScrollEngine | null = null;

/** Writes the shared scroll frame. Only scroll engines call this. */
export function writeScroll(y: number, limit: number, velocity: number) {
  const s = animationStore.frame.scroll;
  const delta = y - s.y;
  s.y = y;
  s.limit = Math.max(0, limit);
  s.progress = s.limit > 0 ? Math.min(1, Math.max(0, y / s.limit)) : 0;
  s.velocity = velocity;
  s.direction = delta > 0 ? 1 : delta < 0 ? -1 : velocity === 0 ? 0 : s.direction;
  animationStore.emitFrame("scroll");
}

const docLimit = () => document.documentElement.scrollHeight - window.innerHeight;

/** Passive native scroll source. Returns the engine (also registered as the active one). */
export function createNativeEngine(): ScrollEngine {
  let last = performance.now();
  let settle = 0;
  const onScroll = () => {
    const now = performance.now();
    const y = window.scrollY;
    const dt = Math.max(1, now - last);
    last = now;
    writeScroll(y, docLimit(), ((y - animationStore.frame.scroll.y) * 16.67) / dt);
    // Velocity decays to 0 once scrolling stops (no rAF loop: one timeout).
    window.clearTimeout(settle);
    settle = window.setTimeout(() => writeScroll(window.scrollY, docLimit(), 0), 120);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  writeScroll(window.scrollY, docLimit(), 0);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    kind: "native",
    scrollTo(target, options = {}) {
      const top = resolveTop(target, options.offset ?? 0);
      if (top == null) return;
      window.scrollTo({ top, behavior: options.immediate || reduced() ? "instant" : "smooth" });
      if (options.onComplete) window.setTimeout(options.onComplete, options.immediate || reduced() ? 0 : 600);
    },
    stop: () => {},
    start: () => {},
    resize: () => writeScroll(window.scrollY, docLimit(), 0),
    reset: () => writeScroll(window.scrollY, docLimit(), 0),
    destroy: () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
    },
  };
}

/** Document top (px) of a target, honouring scroll-padding-top (sticky header) and scroll-margin. */
export function resolveTop(target: ScrollTarget, offset = 0): number | null {
  if (typeof target === "number") return target + offset;
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target.startsWith("#") ? `#${CSS.escape(target.slice(1))}` : target) : target;
  if (!el) return null;
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return boxTop(el) + window.scrollY - padding - margin + offset;
}

/**
 * Viewport top of an element. An element without a box (`display: contents`, e.g. the site frame's
 * `#top` wrapper) reports a zero rect, so its place in the flow is measured with a temporary
 * zero-height marker inserted right before it.
 */
function boxTop(el: HTMLElement): number {
  if (el.getClientRects().length > 0) return el.getBoundingClientRect().top;
  const marker = document.createElement("span");
  marker.style.cssText = "display:block;height:0;margin:0;padding:0;border:0";
  el.before(marker);
  const top = marker.getBoundingClientRect().top;
  marker.remove();
  return top;
}

export function setScrollEngine(next: ScrollEngine | null) {
  if (engine && engine !== next) engine.destroy();
  engine = next;
  animationStore.set({ smoothScroll: next?.kind === "lenis" });
  if (next && animationStore.get().scrollLocks > 0) next.stop();
}

export function getScrollEngine() {
  return engine;
}

/** Programmatic scrolling (any component, any engine). */
export function scrollToTarget(target: ScrollTarget, options?: ScrollToOptions) {
  if (engine) engine.scrollTo(target, options);
  else if (typeof window !== "undefined") {
    const top = resolveTop(target, options?.offset ?? 0);
    if (top != null) window.scrollTo({ top, behavior: "instant" });
    options?.onComplete?.();
  }
}

let savedOverflow: string | null = null;

/** Locks page scrolling (modal, menu). Returns the release function; safe to call twice. */
export function acquireScrollLock(): () => void {
  const root = document.documentElement;
  const locks = animationStore.get().scrollLocks;
  if (locks === 0) {
    savedOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    engine?.stop();
  }
  animationStore.set({ scrollLocks: locks + 1 });
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const left = Math.max(0, animationStore.get().scrollLocks - 1);
    animationStore.set({ scrollLocks: left });
    if (left === 0) {
      root.style.overflow = savedOverflow ?? "";
      savedOverflow = null;
      engine?.start();
    }
  };
}
