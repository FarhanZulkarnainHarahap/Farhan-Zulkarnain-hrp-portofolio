"use client";
/**
 * ProjectsScene (Fase K4) — PLACEHOLDER: a fanned stack of thin metal plates (one per project from
 * the slot's `data-scene-props.count`, at most 8 drawn) in the page header slot. Final project
 * showcase: later phases (Theatre "Project Showcase" sheet).
 */
import { useRef } from "react";
import { BoxGeometry, type MeshStandardMaterial } from "three";
import type { SceneProps } from "../registry";
import { InteractiveObject } from "../InteractiveObject";
import { useSharedGeometry } from "../resources";
import { useThemeColors } from "../theme";
import { PLACEHOLDER, useSceneProps } from "./common";

export default function ProjectsScene({ id }: SceneProps) {
  const { count = 3 } = useSceneProps<{ count: number }>(id);
  const colors = useThemeColors();
  const plate = useSharedGeometry("project-plate", () => new BoxGeometry(0.72, 0.46, 0.018));
  const material = useRef<MeshStandardMaterial>(null);
  const plates = Math.min(8, Math.max(1, count));
  return (
    <group name={`scene:${id} ${PLACEHOLDER}`} rotation={[0.15, -0.5, 0]}>
      <InteractiveObject id={`${id}:stack`} scene={id} label="Project stack (placeholder)" material={material} baseEmissive={0.04} focusable idle={{ spin: 0.05, amplitude: 0.02 }}>
        {Array.from({ length: plates }, (_, i) => {
          const t = i - (plates - 1) / 2;
          return (
            <mesh key={i} geometry={plate} position={[t * 0.06, t * 0.05, -t * 0.12]} rotation={[0, t * 0.08, 0]}>
              <meshStandardMaterial ref={i === plates - 1 ? material : undefined} color={i === plates - 1 ? colors.raised : colors.metal} metalness={0.75} roughness={0.3} emissive={colors.accent} emissiveIntensity={0.04} />
            </mesh>
          );
        })}
      </InteractiveObject>
    </group>
  );
}
