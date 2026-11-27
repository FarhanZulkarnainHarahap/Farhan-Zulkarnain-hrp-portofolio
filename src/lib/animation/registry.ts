/**
 * AnimationRegistry (Fase K3): every long-lived animation (GSAP timeline, ScrollTrigger, Theatre
 * sequence, Motion animation, render-loop job) is registered with
 *   - an owner engine and the (target, property) pairs it writes — a second engine claiming the
 *     same pair is rejected (OwnershipError), so two libraries never fight over one property;
 *   - a scope: "route" animations are disposed on navigation, "global" ones live with the app;
 *   - one lifecycle API: play / pause / resume / reverse / interrupt / reset / dispose.
 * The lifecycle manager pauses everything while the tab is hidden and disposes the route scope
 * on navigation. The lab lists `registry.list()` as debug info.
 */
import type { AnimationEngine } from "./config";

export type AnimationScope = "route" | "global";
export type AnimationStatus = "idle" | "playing" | "paused" | "finished" | "disposed";

/** What a concrete engine adapter must implement (missing methods are no-ops). */
export type AnimationControls = {
  play?: () => void;
  pause?: () => void;
  resume?: () => void;
  reverse?: () => void;
  /** Stop now and jump to a consistent state (default: pause + reset). */
  interrupt?: () => void;
  reset?: () => void;
  /** Free everything (kill tweens, revert splits, detach listeners). */
  dispose: () => void;
  /** Optional live status (e.g. GSAP isActive). */
  status?: () => AnimationStatus;
};

export type AnimationSpec = {
  id: string;
  owner: AnimationEngine;
  /** Logical target id ("hero-title", "lab-object/interaction") and the properties written. */
  target: string;
  properties: readonly string[];
  scope?: AnimationScope;
  /** Name shown as "active timeline" in debug UIs. */
  timeline?: string;
  /** Paused while the tab is hidden (default true). */
  pauseWhenHidden?: boolean;
};

export type AnimationHandle = Readonly<{
  id: string;
  owner: AnimationEngine;
  target: string;
  properties: readonly string[];
  scope: AnimationScope;
  timeline?: string;
  status: () => AnimationStatus;
  play: () => void;
  pause: () => void;
  resume: () => void;
  reverse: () => void;
  interrupt: () => void;
  reset: () => void;
  dispose: () => void;
}>;

export class OwnershipError extends Error {
  constructor(
    readonly claim: string,
    readonly owner: AnimationEngine,
    readonly contender: AnimationEngine,
  ) {
    super(`"${claim}" is owned by ${owner}; ${contender} may not animate it too`);
    this.name = "OwnershipError";
  }
}

type Entry = {
  spec: Required<Omit<AnimationSpec, "timeline">> & { timeline?: string };
  controls: AnimationControls;
  status: AnimationStatus;
  /** Paused by the lifecycle manager (tab hidden), to resume only what it paused. */
  autoPaused: boolean;
  handle: AnimationHandle;
};

function createRegistry() {
  const entries = new Map<string, Entry>();
  /** "target::property" → { owner, ids }. */
  const claims = new Map<string, { owner: AnimationEngine; ids: Set<string> }>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());

  const claimKey = (target: string, property: string) => `${target}::${property}`;

  function release(entry: Entry) {
    for (const property of entry.spec.properties) {
      const key = claimKey(entry.spec.target, property);
      const claim = claims.get(key);
      if (!claim) continue;
      claim.ids.delete(entry.spec.id);
      if (!claim.ids.size) claims.delete(key);
    }
  }

  function register(spec: AnimationSpec, controls: AnimationControls): AnimationHandle {
    // Re-registering the same id (rapid re-mount, HMR) replaces the old animation.
    entries.get(spec.id)?.handle.dispose();
    for (const property of spec.properties) {
      const claim = claims.get(claimKey(spec.target, property));
      if (claim && claim.owner !== spec.owner)
        throw new OwnershipError(claimKey(spec.target, property), claim.owner, spec.owner);
    }
    for (const property of spec.properties) {
      const key = claimKey(spec.target, property);
      const claim = claims.get(key) ?? { owner: spec.owner, ids: new Set<string>() };
      claim.ids.add(spec.id);
      claims.set(key, claim);
    }

    const full = { scope: "route" as const, pauseWhenHidden: true, ...spec };
    const live = () => entry.status !== "disposed";
    const run = (fn: (() => void) | undefined, next: AnimationStatus) => {
      if (!live()) return;
      fn?.();
      entry.status = next;
      notify();
    };
    const handle: AnimationHandle = {
      id: full.id,
      owner: full.owner,
      target: full.target,
      properties: full.properties,
      scope: full.scope,
      timeline: full.timeline,
      status: () => (live() ? (controls.status?.() ?? entry.status) : "disposed"),
      play: () => run(controls.play, "playing"),
      pause: () => run(controls.pause, "paused"),
      resume: () => run(controls.resume ?? controls.play, "playing"),
      reverse: () => run(controls.reverse, "playing"),
      interrupt: () =>
        run(
          controls.interrupt ??
            (() => {
              controls.pause?.();
              controls.reset?.();
            }),
          "idle",
        ),
      reset: () => run(controls.reset, "idle"),
      dispose: () => {
        if (!live()) return;
        entry.status = "disposed";
        try {
          controls.dispose();
        } finally {
          release(entry);
          if (entries.get(full.id) === entry) entries.delete(full.id);
          notify();
        }
      },
    };
    const entry: Entry = { spec: full, controls, status: "idle", autoPaused: false, handle };
    entries.set(full.id, entry);
    notify();
    return handle;
  }

  return {
    register,
    get: (id: string) => entries.get(id)?.handle,
    /** Owner of a (target, property) pair, if claimed. */
    ownerOf: (target: string, property: string) => claims.get(claimKey(target, property))?.owner,
    list: () =>
      [...entries.values()].map((e) => ({
        id: e.spec.id,
        owner: e.spec.owner,
        target: e.spec.target,
        properties: e.spec.properties,
        scope: e.spec.scope,
        timeline: e.spec.timeline,
        status: e.handle.status(),
      })),
    /** Dispose every animation of a scope (navigation: "route"). */
    disposeScope(scope: AnimationScope) {
      for (const entry of [...entries.values()]) if (entry.spec.scope === scope) entry.handle.dispose();
    },
    /** Tab hidden: pause what is playing, remembering it. */
    pauseAll() {
      for (const entry of entries.values()) {
        if (!entry.spec.pauseWhenHidden || entry.handle.status() !== "playing") continue;
        entry.autoPaused = true;
        entry.handle.pause();
      }
    },
    /** Tab visible again: resume only what pauseAll() paused. */
    resumeAll() {
      for (const entry of entries.values()) {
        if (!entry.autoPaused) continue;
        entry.autoPaused = false;
        entry.handle.resume();
      }
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    get size() {
      return entries.size;
    },
  };
}

export type AnimationRegistry = ReturnType<typeof createRegistry>;

export const animationRegistry: AnimationRegistry = createRegistry();
