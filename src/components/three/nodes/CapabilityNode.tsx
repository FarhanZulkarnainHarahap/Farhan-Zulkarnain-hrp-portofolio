"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import BlenderAsset from "../BlenderAsset";
import type { SymbolKind } from "../geometry/assets";
import { activeCapability, nodePosition } from "../controllers/layouts";
import { useScene } from "@/components/kinetic/SceneState";
export default function CapabilityNode({
  kind,
  index,
}: {
  kind: SymbolKind;
  index: number;
}) {
  const { mode, active, setActive } = useScene(),
    group = useRef<Group>(null);
  const destination = useMemo(() => nodePosition(index, mode), [index, mode]);
  const highlighted = activeCapability(active) === kind;
  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const delta = Math.min(dt, 0.05);
    group.current.position.lerp(destination, 1 - Math.exp(-4 * delta));
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      highlighted ? -0.3 : Math.sin(clock.elapsedTime * 0.15 + index) * 0.15,
      4,
      delta,
    );
    group.current.scale.setScalar(
      MathUtils.damp(
        group.current.scale.x,
        mode === "project" ? 0.4 : highlighted ? 1 : 0.75,
        4,
        delta,
      ),
    );
  });
  return (
    <group
      ref={group}
      position={nodePosition(index, "system")}
      onPointerOver={(e) => {
        e.stopPropagation();
        setActive(kind);
      }}
      onPointerOut={() => setActive("")}
    >
      <BlenderAsset name={`symbol-${kind}`} />
    </group>
  );
}
