"use client";
/**
 * HomeScene (Fase K4): the technology orbit PROTOTYPE in the hero's orbit stage
 * (`[data-orbit-stage]`, anchor "home"). The model comes from the stage's `data-scene-props`
 * (built on the server from the API skills — 21 today; nothing is added). Once the first WebGL
 * frame of the orbit is drawn, <html data-orbit-renderer="webgl"> hides the static SVG orbit
 * visually (it stays in the DOM: accessible summary, and the fallback the moment WebGL stops).
 * Contact shadow under the core on the "high" tier only.
 */
import { ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { profileFor } from "@/lib/animation/quality";
import { sceneStore } from "@/lib/scene/store";
import type { SceneProps } from "../registry";
import { useDetail, useSceneProps } from "./common";
import { Orbit, type OrbitModel } from "./Orbit";

function markOrbitRenderer(on: boolean) {
  if (on) document.documentElement.dataset.orbitRenderer = "webgl";
  else delete document.documentElement.dataset.orbitRenderer;
}

export default function HomeScene({ id }: SceneProps) {
  const model = useSceneProps<OrbitModel>(id);
  const { quality } = useDetail();
  const drawn = useRef(false);

  useEffect(() => () => markOrbitRenderer(false), []);

  useFrame(() => {
    if (drawn.current || !model.rings) return;
    if (sceneStore.get().renderer !== "active") return;
    drawn.current = true;
    markOrbitRenderer(true);
  });

  if (!model.rings) return null;
  return (
    <group name={`scene:${id}`}>
      <Orbit scene={id} model={model as OrbitModel} />
      {profileFor(quality).shadows && <ContactShadows position={[0, -0.85, 0]} opacity={0.35} scale={2.4} blur={2.4} far={1.4} resolution={256} />}
    </group>
  );
}
