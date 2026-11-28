"use client";
/**
 * SkillsScene (Fase K4) — PLACEHOLDER: a lattice with one cube per skill in the #stack section
 * slot. The count comes from the slot's `data-scene-props` (the API skills rendered by FullStack);
 * one InstancedMesh, so 21 skills cost one draw call. Final skills visuals: later phases.
 */
import { useEffect, useMemo, useRef } from "react";
import { BoxGeometry, Matrix4, type InstancedMesh, type MeshStandardMaterial } from "three";
import type { SceneProps } from "../registry";
import { InteractiveObject } from "../InteractiveObject";
import { useRenderLoop } from "../RenderLoopController";
import { useSharedGeometry } from "../resources";
import { useThemeColors } from "../theme";
import { PLACEHOLDER, useSceneProps } from "./common";

function layout(mesh: InstancedMesh, count: number) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(count)));
  const step = 0.22;
  const m = new Matrix4();
  for (let i = 0; i < count; i++) {
    const x = (i % cols) - (cols - 1) / 2;
    const y = Math.floor(i / cols) - (Math.ceil(count / cols) - 1) / 2;
    m.makeTranslation(x * step, -y * step, ((i * 7) % 5) * 0.03 - 0.06);
    mesh.setMatrixAt(i, m);
  }
  mesh.count = count;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}

export default function SkillsScene({ id }: SceneProps) {
  const { count = 0 } = useSceneProps<{ count: number }>(id);
  const colors = useThemeColors();
  const box = useSharedGeometry("skills-cube", () => new BoxGeometry(0.11, 0.11, 0.11));
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const loop = useRenderLoop();
  const max = useMemo(() => Math.max(1, count), [count]);
  useEffect(() => {
    if (mesh.current) layout(mesh.current, count);
    loop.invalidate(2);
  }, [count, loop]);
  if (!count) return null;
  return (
    <group name={`scene:${id} ${PLACEHOLDER}`} rotation={[0.35, -0.45, 0]}>
      <InteractiveObject id={`${id}:lattice`} scene={id} label={`Skills lattice (${count}, placeholder)`} material={material} baseEmissive={0.06} focusable idle={{ spin: 0.1 }}>
        <instancedMesh ref={mesh} args={[box, undefined, max]}>
          <meshStandardMaterial ref={material} color={colors.metal} metalness={0.8} roughness={0.35} emissive={colors.accent} emissiveIntensity={0.06} />
        </instancedMesh>
      </InteractiveObject>
    </group>
  );
}
