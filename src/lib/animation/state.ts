/**
 * AnimationStateManager (Fase K3): shared state for every animation engine, in two tiers.
 *
 *  1. `snapshot` — low-frequency, immutable, reactive. Route, active section, hovered/selected
 *     object, transition and interaction state, reduced motion, quality, visibility. Changing it
 *     notifies subscribers (React reads it through useSyncExternalStore: re-renders only when the
 *     selected slice changes).
 *  2. `frame` — high-frequency, mutable, NEVER reactive. Scroll position/progress/direction/
 *     velocity and pointer position, written by the single scroll source (ScrollProgressController)
 *     and the single pointer listener. Readers poll it in their own loop (useFrame, gsap.ticker) or
 *     subscribe with `onFrame` (called synchronously, no React).
 *
 * No React state is set per frame. Server-safe: nothing here touches the DOM at import time.
 */
import type { QualityTier } from "./config";

export type TransitionState = "idle" | "exiting" | "entering";
export type InteractionMode = "idle" | "pointer" | "touch" | "keyboard";
export type WebGLStatus = "unknown" | "webgl2" | "webgl1" | "unavailable" | "lost";

export type AnimationSnapshot = Readonly<{
  route: string;
  previousRoute: string | null;
  activeSection: string | null;
  hovered: string | null;
  selected: string | null;
  transition: TransitionState;
  interaction: InteractionMode;
  reducedMotion: boolean;
  quality: QualityTier;
  webgl: WebGLStatus;
  visible: boolean;
  /** Lenis is driving the wheel (false: native scrolling). */
  smoothScroll: boolean;
  /** Number of active scroll locks (modal, menu). */
  scrollLocks: number;
}>;

export type ScrollFrame = {
  /** Scroll offset in px. */
  y: number;
  /** Scrollable distance in px. */
  limit: number;
  /** 0–1 over the whole document. */
  progress: number;
  /** 1 down, -1 up, 0 at rest. */
  direction: 1 | -1 | 0;
  /** px per frame (Lenis) or px per 16.7 ms (native), signed. */
  velocity: number;
};

export type PointerFrame = {
  /** Client px. */
  x: number;
  y: number;
  /** Normalised to the viewport, -1 … 1 (y up, like three.js NDC). */
  nx: number;
  ny: number;
  /** The pointer is over the document. */
  inside: boolean;
};

export type AnimationFrame = { scroll: ScrollFrame; pointer: PointerFrame };

type Listener = () => void;
type FrameListener = (frame: Readonly<AnimationFrame>, kind: "scroll" | "pointer") => void;

const INITIAL: AnimationSnapshot = {
  route: "/",
  previousRoute: null,
  activeSection: null,
  hovered: null,
  selected: null,
  transition: "idle",
  interaction: "idle",
  reducedMotion: false,
  quality: "medium",
  webgl: "unknown",
  visible: true,
  smoothScroll: false,
  scrollLocks: 0,
};

function createAnimationStore() {
  let snapshot: AnimationSnapshot = INITIAL;
  const listeners = new Set<Listener>();
  const frameListeners = new Set<FrameListener>();
  const frame: AnimationFrame = {
    scroll: { y: 0, limit: 0, progress: 0, direction: 0, velocity: 0 },
    pointer: { x: 0, y: 0, nx: 0, ny: 0, inside: false },
  };

  return {
    /** Current low-frequency snapshot (stable reference until something changes). */
    get: () => snapshot,
    /** Server snapshot for useSyncExternalStore (always the initial state). */
    getServer: () => INITIAL,
    /** Shallow-merges; notifies only when a value actually changed. */
    set(patch: Partial<AnimationSnapshot>) {
      let changed = false;
      for (const key of Object.keys(patch) as (keyof AnimationSnapshot)[])
        if (!Object.is(snapshot[key], patch[key])) changed = true;
      if (!changed) return;
      snapshot = { ...snapshot, ...patch };
      for (const listener of listeners) listener();
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    /** Mutable per-frame data. Read freely; only the scroll/pointer sources write it. */
    frame,
    /** Push-style frame updates (synchronous, outside React). */
    onFrame(listener: FrameListener) {
      frameListeners.add(listener);
      return () => void frameListeners.delete(listener);
    },
    /** Called by the scroll / pointer sources after writing `frame`. */
    emitFrame(kind: "scroll" | "pointer") {
      for (const listener of frameListeners) listener(frame, kind);
    },
    /** Test / dev helper. */
    reset() {
      snapshot = INITIAL;
      Object.assign(frame.scroll, { y: 0, limit: 0, progress: 0, direction: 0, velocity: 0 });
      Object.assign(frame.pointer, { x: 0, y: 0, nx: 0, ny: 0, inside: false });
      for (const listener of listeners) listener();
    },
  };
}

export type AnimationStore = ReturnType<typeof createAnimationStore>;

/** The single store for the whole app (module singleton; client navigations keep it). */
export const animationStore: AnimationStore = createAnimationStore();
