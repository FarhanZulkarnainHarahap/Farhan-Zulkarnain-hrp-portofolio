"use client";
/**
 * ContactScene (Fase K4) — PLACEHOLDER: a "signal" — a small emissive core inside two crossed
 * rings — in the page header slot. Final contact visuals: later phases.
 */
import { useRef } from "react";
import { IcosahedronGeometry, TorusGeometry, type MeshStandardMaterial } from "three";
import type { SceneProps } from "../registry";
import { InteractiveObject } from "../InteractiveObject";
import { useSharedGeometry } from "../resources";
import { useThemeColors } from "../theme";
import { PLACEHOLDER, useDetail } from "./common";

export default function ContactScene({ id }: SceneProps) {
  const colors = useThemeColors();
  const { quality, detail } = useDetail();
  const ring = useSharedGeometry(`contact-ring:${quality}`, () => new TorusGeometry(0.5, 0.006, detail.tube, detail.radial));
  const core = useSharedGeometry("contact-core", () => new IcosahedronGeometry(0.16, 1));
  const material = useRef<MeshStandardMaterial>(null);
  return (
    <group name={`scene:${id} ${PLACEHOLDER}`}>
      <InteractiveObject id={`${id}:signal`} scene={id} label="Signal (placeholder)" material={material} baseEmissive={0.35} focusable idle={{ spin: 0.25 }}>
        <mesh geometry={core}>
          <meshStandardMaterial ref={material} color={colors.metal} metalness={0.6} roughness={0.3} emissive={colors.accent} emissiveIntensity={0.35} flatShading />
        </mesh>
        <mesh geometry={ring} rotation={[1.2, 0, 0]}>
          <meshStandardMaterial color={colors.hairlineStrong} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh geometry={ring} rotation={[1.2, 1.1, 0]} scale={0.82}>
          <meshStandardMaterial color={colors.hairlineStrong} metalness={0.6} roughness={0.4} />
        </mesh>
      </InteractiveObject>
    </group>
  );
}
