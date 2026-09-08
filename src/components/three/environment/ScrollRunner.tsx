"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import BlenderAsset from "../BlenderAsset";
import { useScene } from "@/components/kinetic/SceneState";
import type { Quality } from "../materials/SystemMaterials";

export default function ScrollRunner({ quality }: { quality: Quality }) {
  const root = useRef<Group>(null);
  const travel = useRef(0.15);
  const speed = useRef(0);
  const lastY = useRef(0);
  const { mode } = useScene();

  useFrame(({ clock }, dt) => {
    if (!root.current) return;
    const delta = Math.min(dt, 0.05);
    const y = window.scrollY;
    const dy = y - lastY.current;
    lastY.current = y;
    speed.current = MathUtils.damp(speed.current, dy, 7, delta);
    travel.current = (travel.current + speed.current * 0.0019) % 1;
    if (travel.current < 0) travel.current += 1;

    const lane =
      mode === "project"
        ? -1.9
        : mode === "identity"
          ? 2.2
          : mode === "trajectory"
            ? -2.4
            : 1.85;
    const lift = MathUtils.lerp(2.45, -2.45, travel.current);
    const orbit = Math.sin(clock.elapsedTime * 0.55) * 0.16;
    const targetScale =
      quality === "low" ? 0 : mode === "capability" ? 0.32 : 0.42;

    root.current.position.x = MathUtils.damp(
      root.current.position.x,
      lane + orbit,
      5,
      delta,
    );
    root.current.position.y = MathUtils.damp(
      root.current.position.y,
      lift,
      5,
      delta,
    );
    root.current.position.z = MathUtils.damp(
      root.current.position.z,
      mode === "system" ? -0.45 : 0.2,
      5,
      delta,
    );
    root.current.rotation.z = MathUtils.damp(
      root.current.rotation.z,
      speed.current > 0 ? -0.35 : 0.35,
      6,
      delta,
    );
    root.current.rotation.y += delta * (0.55 + Math.abs(speed.current) * 0.01);
    root.current.scale.setScalar(
      MathUtils.damp(root.current.scale.x, targetScale, 5, delta),
    );
  });

  return (
    <group ref={root} scale={0.001} position={[1.85, 2.45, 0]}>
      <BlenderAsset name="scroll-runner" />
    </group>
  );
}
