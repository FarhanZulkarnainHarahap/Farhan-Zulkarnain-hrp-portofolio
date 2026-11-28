/**
 * AnimationController (Fase K3): the facade components use instead of reaching into each engine.
 * It owns no animation itself; it routes to the shared store, the registry, the scroll engine and
 * the quality manager. Hooks for React live in src/components/animation/hooks.ts.
 */
import { animationRegistry, type AnimationSpec, type AnimationControls } from "./registry";
import { acquireScrollLock, getScrollEngine, scrollToTarget, type ScrollTarget, type ScrollToOptions } from "./scroll";
import { animationStore, type TransitionState } from "./state";
import { estimateTier, probeWebGL, profileFor, stepDown, tierWithWebGL } from "./quality";

export const animationController = {
  store: animationStore,
  registry: animationRegistry,

  register: (spec: AnimationSpec, controls: AnimationControls) => animationRegistry.register(spec, controls),
  pauseAll: () => animationRegistry.pauseAll(),
  resumeAll: () => animationRegistry.resumeAll(),

  scrollTo: (target: ScrollTarget, options?: ScrollToOptions) => scrollToTarget(target, options),
  lockScroll: () => acquireScrollLock(),
  scrollEngine: () => getScrollEngine()?.kind ?? "none",

  hover: (id: string | null) => animationStore.set({ hovered: id }),
  select: (id: string | null) => animationStore.set({ selected: id }),
  transition: (state: TransitionState) => animationStore.set({ transition: state }),

  /** Probes WebGL once (lazy) and settles the quality tier; returns the profile. */
  ensureWebGL() {
    const probe = probeWebGL();
    const tier = tierWithWebGL(animationStore.get().quality, probe);
    animationStore.set({ webgl: probe.status, quality: tier });
    return { probe, tier, profile: profileFor(tier) };
  },
  /** Adaptive performance: drop one tier (frame drops). */
  degrade() {
    animationStore.set({ quality: stepDown(animationStore.get().quality) });
  },
  estimateTier,
};

export type AnimationController = typeof animationController;

/** Test / debug hook (read-only views; no internals are exposed for writing). */
export type KineticDebug = {
  state: () => ReturnType<typeof animationStore.get>;
  frame: () => typeof animationStore.frame;
  animations: () => ReturnType<typeof animationRegistry.list>;
  scrollEngine: () => string;
};

export function exposeDebug() {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __kinetic?: KineticDebug & Record<string, unknown> };
  // Merge: the scene manager (Fase K4) adds `scene` to the same object, possibly first.
  w.__kinetic = {
    ...w.__kinetic,
    state: () => animationStore.get(),
    frame: () => animationStore.frame,
    animations: () => animationRegistry.list(),
    scrollEngine: () => animationController.scrollEngine(),
  };
}
