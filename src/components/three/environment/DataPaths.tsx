"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Mesh, TubeGeometry, Vector3 } from "three";
import { plate } from "../geometry/assets";
import { useAsset } from "../geometry/useAsset";
import { useMaterials, type Quality } from "../materials/SystemMaterials";
import {
  nodePosition,
  activeCapability,
  CAPABILITIES,
} from "../controllers/layouts";
import { useScene } from "@/components/kinetic/SceneState";
function Path({ index, quality }: { index: number; quality: Quality }) {
  const { mode, active } = useScene();
  const material = useMaterials(),
    packet = useRef<Mesh>(null);
  const tube = useRef<Mesh>(null);
  const phase = useRef(index * 0.18);
  const curve = useMemo(() => {
    const end = nodePosition(index, mode);
    return new CatmullRomCurve3([
      new Vector3(0, 0, -0.35),
      new Vector3(end.x * 0.25, end.y * 0.5, -0.7),
      new Vector3(end.x * 0.75, end.y * 0.9, -0.5),
      end,
    ]);
  }, [index, mode]);
  const target = useAsset(
    () =>
      new TubeGeometry(
        curve,
        quality === "high" ? 40 : quality === "medium" ? 24 : 12,
        0.012,
        3,
        false,
      ),
    [curve, quality],
  );
  const geometry = useAsset(() => target.clone(), [quality]);
  const chip = useAsset(
    () =>
      plate(
        [
          [0, 0.055],
          [0.055, 0],
          [0, -0.055],
          [-0.055, 0],
        ],
        0.03,
      ),
    [],
  );
  const selected = activeCapability(active) === CAPABILITIES[index];
  useFrame((_, dt) => {
    const delta = Math.min(dt, 0.05),
      blend = 1 - Math.exp(-4 * delta);
    if (!tube.current) return;
    const liveGeometry = tube.current.geometry;
    const current = liveGeometry.attributes.position,
      next = target.attributes.position;
    for (let i = 0; i < current.array.length; i++)
      current.array[i] += (next.array[i] - current.array[i]) * blend;
    current.needsUpdate = true;
    liveGeometry.boundingSphere = null;
    phase.current = (phase.current + delta * (selected ? 0.22 : 0.12)) % 1;
    if (packet.current) {
      const sample = curve.getPointAt(
        mode === "signal" ? 1 - phase.current : phase.current,
      );
      packet.current.position.lerp(sample, blend);
    }
  });
  return (
    <group>
      <mesh
        ref={tube}
        geometry={geometry}
        material={quality === "low" ? material.lowSignal : material.pulse}
      />
      {quality !== "low" && (
        <mesh
          ref={packet}
          geometry={chip}
          material={selected ? material.ink : material.signal}
        />
      )}
    </group>
  );
}
export default function DataPaths({ quality }: { quality: Quality }) {
  return (
    <>
      {CAPABILITIES.slice(0, quality === "low" ? 3 : 5).map((_, index) => (
        <Path key={index} index={index} quality={quality} />
      ))}
    </>
  );
}
