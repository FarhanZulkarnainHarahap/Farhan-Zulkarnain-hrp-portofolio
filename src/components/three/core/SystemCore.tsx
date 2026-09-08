"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import BlenderAsset from "../BlenderAsset";
import { useScene } from "@/components/kinetic/SceneState";
import { techAssetName } from "../controllers/layouts";
export default function SystemCore() {
  const root = useRef<Group>(null);
  const { mode, active } = useScene();
  useFrame(({ clock, pointer }, dt) => {
    if (!root.current) return;
    const delta = Math.min(dt, 0.05);
    const target =
      mode === "project"
        ? 0.35
        : mode === "capability"
          ? techAssetName(active)
            ? 0.06
            : 0.42
        : mode === "trajectory"
          ? 0.62
          : mode === "signal"
            ? 0.8
            : 1.12;
    root.current.scale.setScalar(
      MathUtils.damp(root.current.scale.x, target, 4, delta),
    );
    root.current.position.y = MathUtils.damp(
      root.current.position.y,
      mode === "project"
        ? 1.7
        : mode === "capability"
          ? 0.62
        : mode === "system"
          ? pointer.y * 0.22
          : 0,
      4,
      delta,
    );
    root.current.position.x = MathUtils.damp(
      root.current.position.x,
      mode === "system" ? pointer.x * 0.35 : 0,
      4,
      delta,
    );
    root.current.rotation.x = MathUtils.damp(
      root.current.rotation.x,
      mode === "system" ? -pointer.y * 0.22 : 0,
      4,
      delta,
    );
    root.current.rotation.y = MathUtils.damp(
      root.current.rotation.y,
      mode === "system"
        ? pointer.x * 0.35 + Math.sin(clock.elapsedTime * 0.14) * 0.08
        : mode === "identity"
          ? -0.35
          : Math.sin(clock.elapsedTime * 0.14) * 0.12,
      3,
      delta,
    );
  });
  return (
    <group ref={root} scale={0.4}>
      <BlenderAsset name="system-core" />
    </group>
  );
}
