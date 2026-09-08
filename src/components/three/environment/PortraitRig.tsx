"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import BlenderAsset from "../BlenderAsset";
import { useScene } from "@/components/kinetic/SceneState";

export default function PortraitRig() {
  const root = useRef<Group>(null);
  const { mode } = useScene();

  useFrame(({ clock, pointer }, dt) => {
    if (!root.current) return;
    const delta = Math.min(dt, 0.05);
    const visible = mode === "identity";
    root.current.scale.setScalar(
      MathUtils.damp(root.current.scale.x, visible ? 1.02 : 0.001, 5, delta),
    );
    root.current.position.x = MathUtils.damp(
      root.current.position.x,
      visible ? -2.2 + pointer.x * 0.18 : -2.2,
      5,
      delta,
    );
    root.current.position.y = MathUtils.damp(
      root.current.position.y,
      visible ? -0.12 + pointer.y * 0.12 : -0.12,
      5,
      delta,
    );
    root.current.position.z = MathUtils.damp(
      root.current.position.z,
      visible ? 0.35 : 0,
      5,
      delta,
    );
    root.current.rotation.x = MathUtils.damp(
      root.current.rotation.x,
      visible ? pointer.y * -0.14 : 0,
      5,
      delta,
    );
    root.current.rotation.y = MathUtils.damp(
      root.current.rotation.y,
      visible ? -0.2 + pointer.x * 0.18 : 0,
      5,
      delta,
    );
    root.current.rotation.z =
      Math.sin(clock.elapsedTime * 0.45) * (visible ? 0.025 : 0);
  });

  return (
    <group ref={root} scale={0.001} position={[-2.2, -0.12, 0.35]}>
      <BlenderAsset name="portrait-card" />
    </group>
  );
}
