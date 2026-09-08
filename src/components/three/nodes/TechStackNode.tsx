"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import BlenderAsset from "../BlenderAsset";
import { techAssetName } from "../controllers/layouts";
import { useScene } from "@/components/kinetic/SceneState";

export default function TechStackNode() {
  const root = useRef<Group>(null);
  const { mode, active } = useScene();
  const asset = useMemo(() => techAssetName(active), [active]);

  useFrame(({ clock, pointer }, dt) => {
    if (!root.current) return;
    const delta = Math.min(dt, 0.05);
    const visible = mode === "capability" && Boolean(asset);
    root.current.scale.setScalar(
      MathUtils.damp(root.current.scale.x, visible ? 2.25 : 0.001, 6, delta),
    );
    root.current.position.x = MathUtils.damp(
      root.current.position.x,
      pointer.x * 0.22,
      5,
      delta,
    );
    root.current.position.y = MathUtils.damp(
      root.current.position.y,
      0.12 + pointer.y * 0.14,
      5,
      delta,
    );
    root.current.position.z = MathUtils.damp(
      root.current.position.z,
      visible ? 2.55 : 0.2,
      5,
      delta,
    );
    root.current.rotation.x = MathUtils.damp(
      root.current.rotation.x,
      pointer.y * -0.18,
      5,
      delta,
    );
    root.current.rotation.y =
      MathUtils.damp(root.current.rotation.y, pointer.x * 0.24, 5, delta) +
      Math.sin(clock.elapsedTime * 0.5) * 0.015;
  });

  return (
    <group ref={root} scale={0.001} position={[0, 0.12, 2.55]}>
      {asset && <BlenderAsset key={asset} name={asset} />}
    </group>
  );
}
