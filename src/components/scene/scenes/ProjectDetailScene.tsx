"use client";
/**
 * ProjectDetailScene (Fase K4) — PLACEHOLDER: one framed metal plate beside the case-study header.
 * A static scene (rendered on demand): it moves only on scroll, hover or click. Final case-study
 * visuals: later phases.
 */
import { useRef } from "react";
import { BoxGeometry, type MeshStandardMaterial } from "three";
import type { SceneProps } from "../registry";
import { InteractiveObject } from "../InteractiveObject";
import { useSharedGeometry } from "../resources";
import { useThemeColors } from "../theme";
import { PLACEHOLDER } from "./common";

export default function ProjectDetailScene({ id }: SceneProps) {
  const colors = useThemeColors();
  const plate = useSharedGeometry("project-plate", () => new BoxGeometry(0.72, 0.46, 0.018));
  const frame = useSharedGeometry("project-frame", () => new BoxGeometry(0.8, 0.54, 0.008));
  const material = useRef<MeshStandardMaterial>(null);
  return (
    <group name={`scene:${id} ${PLACEHOLDER}`} rotation={[0.1, -0.35, 0]} scale={1.5}>
      <InteractiveObject id={`${id}:plate`} scene={id} label="Project plate (placeholder)" material={material} baseEmissive={0.03} focusable>
        <mesh geometry={frame} position={[0, 0, -0.02]}>
          <meshStandardMaterial color={colors.hairlineStrong} metalness={0.6} roughness={0.45} />
        </mesh>
        <mesh geometry={plate}>
          <meshStandardMaterial ref={material} color={colors.raised} metalness={0.7} roughness={0.28} emissive={colors.accent} emissiveIntensity={0.03} />
        </mesh>
      </InteractiveObject>
    </group>
  );
}
