"use client";
/**
 * React access to the shared animation state (Fase K3).
 *  - useAnimationState(selector): re-renders only when the selected low-frequency slice changes.
 *  - useAnimationFrame(callback): scroll/pointer frames pushed outside React (never re-renders).
 *  - useFrameRef(): the mutable frame object, for render loops that poll it (useFrame, ticker).
 *  - useReducedMotion(): the user preference as tracked by ReducedMotionProvider.
 */
import { useEffect, useRef, useSyncExternalStore } from "react";
import { animationStore, type AnimationFrame, type AnimationSnapshot } from "@/lib/animation/state";

export function useAnimationState<T>(selector: (state: AnimationSnapshot) => T): T {
  return useSyncExternalStore(
    animationStore.subscribe,
    () => selector(animationStore.get()),
    () => selector(animationStore.getServer()),
  );
}

export function useReducedMotion() {
  return useAnimationState((s) => s.reducedMotion);
}

/** Calls `callback` on every scroll / pointer frame. The latest callback is always used. */
export function useAnimationFrame(callback: (frame: Readonly<AnimationFrame>, kind: "scroll" | "pointer") => void) {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  });
  useEffect(() => animationStore.onFrame((frame, kind) => ref.current(frame, kind)), []);
}

export function useFrameRef() {
  return animationStore.frame;
}
