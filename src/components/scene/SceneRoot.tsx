"use client";
/**
 * SceneRoot (Fase K4): mounts the active scene (and, during a transition, the outgoing one) in
 * the persistent canvas, with the scene-level part of the object hierarchy:
 *
 *   SceneRoot
 *     RouteTransitionGroup   enter / leave between scenes                 — SceneRoot (this file)
 *       ScrollTransformGroup follows the scene's DOM slot while scrolling — ScrollSceneController
 *         <Scene/>           lazy module; its objects are InteractiveObjects with their own
 *                            Theatre → Interaction → Idle → Mesh layers
 *
 * Lifecycle per scene (scene store): loading (module) → ready (mounted) → active (entered) →
 * deactivating (leaving) → disposed (unmounted; R3F disposes what the scene created, shared
 * resources are released to the AssetManager). A scene that fails to load is "error" and shows
 * nothing — the page and the other scenes keep working.
 */
import { useFrame } from "@react-three/fiber";
import { Component, Suspense, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { Group } from "three";
import { animationStore } from "@/lib/animation/state";
import { getMotionTokens } from "@/lib/design-tokens";
import { sceneController } from "@/lib/scene/controller";
import { applyRouteTransition } from "@/lib/scene/drivers";
import { sceneStore } from "@/lib/scene/store";
import type { SceneId } from "@/lib/scene/types";
import { useRenderLoop } from "./RenderLoopController";
import { useSceneState } from "./hooks";
import { SCENE_UNITS } from "./registry";
import { SceneModule } from "./SceneModule";

class SceneErrorBoundary extends Component<{ id: SceneId; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    sceneStore.setSceneStatus(this.props.id, "error");
    sceneStore.set({ rendererError: `scene ${this.props.id}: ${error instanceof Error ? error.message : String(error)}`.slice(0, 200) });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Suspense fallback: a dim wireframe marker in the slot while the scene module loads. */
function SceneLoading() {
  return (
    <mesh>
      <octahedronGeometry args={[0.18, 0]} />
      <meshBasicMaterial wireframe color="#8a94a3" transparent opacity={0.5} />
    </mesh>
  );
}

function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}

/** Minimum scene height as a fraction of its slot width (short slots beside a one-line lead). */
const MIN_HEIGHT_RATIO = 0.42;

/** Fits the scene's authored unit box into its DOM slot and follows it (scroll layer). */
function ScrollTransformGroup({ id, children }: { id: SceneId; children: ReactNode }) {
  const group = useRef<Group>(null);
  const [uw, uh] = SCENE_UNITS[id];
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = sceneStore.frame.placement[id];
    if (!p || !p.visible) {
      g.visible = false;
      return;
    }
    g.visible = true;
    g.position.set(p.center[0], p.center[1], p.center[2]);
    // A slot can be short (one line of lead beside it): size from its width then, centred on it.
    g.scale.setScalar(Math.min(p.width / uw, Math.max(p.height, p.width * MIN_HEIGHT_RATIO) / uh));
  }, -25);
  return (
    <group ref={group} name={`scroll-transform:${id}`} visible={false}>
      {children}
    </group>
  );
}

function SceneSlot({ id, entering }: { id: SceneId; entering: boolean }) {
  const group = useRef<Group>(null);
  const loop = useRenderLoop();
  const finished = useRef(false);
  const ready = useRef(false);

  // "active" needs both: the module mounted (ready) and the enter transition finished.
  const settle = useCallback(() => {
    const t = sceneStore.get().transition;
    if (entering) {
      if (!ready.current || !finished.current) return;
      sceneStore.setSceneStatus(id, "active");
      if (t.to === id && t.phase !== "idle") sceneController.transitionPhase("idle");
    } else if (finished.current && t.from === id && t.phase === "out") sceneController.transitionPhase("in");
  }, [entering, id]);

  const onReady = useCallback(() => {
    ready.current = true;
    if (entering) sceneStore.setSceneStatus(id, finished.current ? "active" : "ready");
    loop.invalidate(2);
    settle();
  }, [entering, id, loop, settle]);

  useEffect(() => {
    sceneStore.setSceneStatus(id, "loading");
    return () => {
      sceneStore.setSceneStatus(id, "disposed");
      loop.hold(`transition:${id}`, false);
    };
  }, [id, loop]);

  useEffect(() => {
    finished.current = false;
    if (!entering) sceneStore.setSceneStatus(id, "deactivating");
    loop.hold(`transition:${id}`, true);
  }, [entering, id, loop]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g || finished.current) return;
    const reduced = animationStore.get().reducedMotion;
    const done = applyRouteTransition(g, entering, reduced ? 0 : getMotionTokens().duration.page / 3, delta);
    if (!done) return;
    finished.current = true;
    loop.hold(`transition:${id}`, false);
    settle();
  });

  return (
    <group ref={group} name={`route-transition:${id}`} scale={0.9} position={[0, -0.25, 0]}>
      <ScrollTransformGroup id={id}>
        <SceneErrorBoundary id={id}>
          <Suspense fallback={<SceneLoading />}>
            <SceneModule id={id} />
            <SceneReady onReady={onReady} />
          </Suspense>
        </SceneErrorBoundary>
      </ScrollTransformGroup>
    </group>
  );
}

export function SceneRoot() {
  const active = useSceneState((s) => s.activeScene);
  const leaving = useSceneState((s) => (s.transition.phase === "out" && s.transition.from !== s.activeScene ? s.transition.from : null));
  return (
    <group name="scene-root">
      {leaving && <SceneSlot key={leaving} id={leaving} entering={false} />}
      {active && <SceneSlot key={active} id={active} entering />}
    </group>
  );
}
