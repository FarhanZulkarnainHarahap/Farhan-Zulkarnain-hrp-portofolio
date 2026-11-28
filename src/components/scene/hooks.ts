"use client";
/**
 * React access to the scene store (Fase K4). `useSceneState(selector)` re-renders only when the
 * selected slice changes (useSyncExternalStore; return primitives or stable references). Never
 * use it for per-frame data: read `sceneStore.frame` inside useFrame instead.
 */
import { useSyncExternalStore } from "react";
import { sceneStore, type SceneSnapshot } from "@/lib/scene/store";

export function useSceneState<T>(selector: (s: SceneSnapshot) => T): T {
  return useSyncExternalStore(
    sceneStore.subscribe,
    () => selector(sceneStore.get()),
    () => selector(sceneStore.getServer()),
  );
}
