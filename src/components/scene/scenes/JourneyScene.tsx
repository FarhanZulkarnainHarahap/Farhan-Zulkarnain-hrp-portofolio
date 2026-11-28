"use client";
/**
 * JourneyScene (Fase K4) — PLACEHOLDER: a rising helix path (tube) with milestone diamonds in the
 * page header slot. The milestone count comes from the slot (`data-scene-props.count`, the API
 * experiences); without it the path is drawn alone. Final journey visuals: later phases.
 */
import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Matrix4, OctahedronGeometry, TubeGeometry, Vector3, type InstancedMesh, type MeshStandardMaterial } from "three";
import type { SceneProps } from "../registry";
import { InteractiveObject } from "../InteractiveObject";
import { useRenderLoop } from "../RenderLoopController";
import { useSharedGeometry } from "../resources";
import { useThemeColors } from "../theme";
import { PLACEHOLDER, useDetail, useSceneProps } from "./common";

const TURNS = 1.25;
const point = (t: number) => new Vector3(Math.cos(t * TURNS * Math.PI * 2) * 0.42, (t - 0.5) * 1.1, Math.sin(t * TURNS * Math.PI * 2) * 0.42);

function placeMilestones(mesh: InstancedMesh, count: number) {
  const m = new Matrix4();
  for (let i = 0; i < count; i++) {
    const p = point(count === 1 ? 0.5 : i / (count - 1));
    m.makeTranslation(p.x, p.y, p.z);
    mesh.setMatrixAt(i, m);
  }
  mesh.count = count;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}

export default function JourneyScene({ id }: SceneProps) {
  const { count = 0 } = useSceneProps<{ count: number }>(id);
  const colors = useThemeColors();
  const { quality, detail } = useDetail();
  const curve = useMemo(() => new CatmullRomCurve3(Array.from({ length: 24 }, (_, i) => point(i / 23))), []);
  const tube = useSharedGeometry(`journey-tube:${quality}`, () => new TubeGeometry(curve, detail.radial, 0.006, detail.tube, false));
  const diamond = useSharedGeometry("journey-diamond", () => new OctahedronGeometry(0.05, 0));
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const loop = useRenderLoop();
  useEffect(() => {
    if (mesh.current && count) placeMilestones(mesh.current, count);
    loop.invalidate(2);
  }, [count, loop]);
  return (
    <group name={`scene:${id} ${PLACEHOLDER}`}>
      <InteractiveObject id={`${id}:path`} scene={id} label="Journey path (placeholder)" material={material} baseEmissive={0.08} focusable idle={{ spin: 0.12, amplitude: 0.02 }}>
        <mesh geometry={tube}>
          <meshStandardMaterial color={colors.hairlineStrong} metalness={0.6} roughness={0.4} />
        </mesh>
        {count > 0 && (
          <instancedMesh ref={mesh} args={[diamond, undefined, count]}>
            <meshStandardMaterial ref={material} color={colors.ink} metalness={0.7} roughness={0.3} emissive={colors.accent} emissiveIntensity={0.08} />
          </instancedMesh>
        )}
      </InteractiveObject>
    </group>
  );
}
