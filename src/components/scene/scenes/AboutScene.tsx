"use client";
/**
 * AboutScene (Fase K4) — PLACEHOLDER: a brushed-metal dodecahedron inside a thin ring, in the
 * page header slot (#profile and #documents sections use their own slots; #documents also gets the
 * "documents" camera preset). Final About visuals: later phases.
 */
import { useRef } from "react";
import { DodecahedronGeometry, MeshStandardMaterial, TorusGeometry } from "three";
import type { SceneProps } from "../registry";
import { InteractiveObject } from "../InteractiveObject";
import { useSharedGeometry, useSharedMaterial } from "../resources";
import { useThemeColors } from "../theme";
import { PLACEHOLDER, useDetail, useTint } from "./common";

export default function AboutScene({ id }: SceneProps) {
  const colors = useThemeColors();
  const { quality, detail } = useDetail();
  const material = useRef<MeshStandardMaterial>(null);
  const ring = useSharedGeometry(`about-ring:${quality}`, () => new TorusGeometry(0.62, 0.004, detail.tube, detail.radial));
  const solid = useSharedGeometry("about-dodeca", () => new DodecahedronGeometry(0.36, 0));
  const ringMaterial = useSharedMaterial("page-hairline", () => new MeshStandardMaterial({ color: colors.hairlineStrong, metalness: 0.6, roughness: 0.4 }));
  useTint(ringMaterial, colors.hairlineStrong);
  return (
    <group name={`scene:${id} ${PLACEHOLDER}`}>
      <mesh geometry={ring} material={ringMaterial} rotation={[1.15, 0.2, 0]} />
      <InteractiveObject id={`${id}:core`} scene={id} label="About object (placeholder)" material={material} baseEmissive={0.04} focusable idle={{ spin: 0.18 }}>
        <mesh geometry={solid}>
          <meshStandardMaterial ref={material} color={colors.metal} metalness={0.85} roughness={0.3} emissive={colors.accent} emissiveIntensity={0.04} flatShading />
        </mesh>
      </InteractiveObject>
    </group>
  );
}
