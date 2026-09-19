"use client";
/* Three.js owns these mutable scene objects and shared refs; useFrame updates them outside React rendering. */
/* eslint-disable react-hooks/immutability */
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { createPortal, useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import { Group, MathUtils, Mesh, MeshStandardMaterial, MeshBasicMaterial, SRGBColorSpace } from "three";
import type { CapabilitySkill } from "@/data/techStack";
import type { NodePosition } from "./capabilityLayout";

function Logo({ plane, url }: { plane: Mesh; url: string }) {
  const cached = useTexture(url);
  const map = useMemo(() => { const t = cached.clone(); t.flipY = false; t.colorSpace = SRGBColorSpace; t.needsUpdate = true; return t; }, [cached]);
  useEffect(() => () => map.dispose(), [map]);
  return createPortal(<meshBasicMaterial attach="material" map={map} transparent depthWrite={false} toneMapped={false} />, plane);
}
export function SkillNode({ template, skill, position, index, selected, hovered, subdued, reduced, mobile, progress, nodeRefs, onHover, onSelect, disabled }: {
  template: Group; skill: CapabilitySkill; position: NodePosition; index: number;
  selected: boolean; hovered: boolean; subdued: boolean; reduced: boolean; mobile: boolean;
  progress: MutableRefObject<number>; nodeRefs: MutableRefObject<(Group | null)[]>;
  onHover: (id: string | null) => void; onSelect: (id: string) => void; disabled: boolean;
}) {
  const root = useRef<Group>(null);
  const assembly = useMemo(() => {
    const object = template.clone(true);
    const indicator = object.getObjectByName("Skill_Node_Indicator") as Mesh;
    const material = (indicator.material as MeshStandardMaterial).clone();
    indicator.material = material;
    return { object, material, plane: object.getObjectByName("Skill_Node_LogoPlane") as Mesh };
  }, [template]);
  useEffect(() => () => assembly.material.dispose(), [assembly]);
  useEffect(() => { const nodes = nodeRefs.current; nodes[index] = root.current; return () => { nodes[index] = null; }; }, [index, nodeRefs]);
  useFrame(({ clock, pointer }, dt) => {
    const group = root.current;
    if (!group) return;
    const damp = (a: number, b: number, rate: number, delta: number) => reduced ? b : MathUtils.damp(a,b,rate,delta);
    const d = Math.min(dt, 0.1), active = selected || hovered;
    const entrance = reduced ? 1 : MathUtils.clamp((progress.current - 0.2 - index * 0.035) / 0.45, 0, 1);
    const float = reduced ? 0 : Math.sin(clock.elapsedTime * 0.8 + index * 1.7) * 0.022;
    group.position.x = damp(group.position.x, position[0] * (0.8 + entrance * 0.2), 9, d);
    group.position.y = damp(group.position.y, position[1] + float, 9, d);
    group.position.z = damp(group.position.z, position[2] + (selected ? 0.19 : hovered ? 0.11 : subdued ? -0.025 : 0) - (1 - entrance) * 0.35, 9, d);
    group.scale.setScalar(damp(group.scale.x, Math.max(0.001, entrance) * (selected ? 1.08 : hovered ? 1.06 : 1), 10, d));
    group.rotation.x = damp(group.rotation.x, !reduced && active && !mobile && !selected ? -pointer.y * 0.052 : 0, 9, d);
    group.rotation.y = damp(group.rotation.y, !reduced && active && !mobile && !selected ? pointer.x * 0.069 : 0, 9, d);
    assembly.material.emissiveIntensity = damp(assembly.material.emissiveIntensity, selected ? 5 : hovered ? 3.8 : subdued ? 1.5 : 2.4, 8, d);
    // Logo remains readable while non-primary nodes lose 20% brightness.
    const logoMaterial = assembly.plane.material as MeshStandardMaterial;
    if (logoMaterial instanceof MeshBasicMaterial) logoMaterial.color.setScalar(subdued ? 0.8 : 1);
  });
  return <group ref={root} position={position} name={`Skill_${skill.id}`}
    onPointerOver={e => { e.stopPropagation(); if (!disabled) onHover(skill.id); }}
    onPointerOut={() => onHover(null)}
    onClick={e => { e.stopPropagation(); if (!disabled) onSelect(skill.id); }}>
    <primitive object={assembly.object} dispose={null} />
    <Suspense fallback={null}><Logo plane={assembly.plane} url={skill.icon} /></Suspense>
    <Html center position={[0, -0.42, 0.12]} style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
      <span className={`matrix-node-label${selected ? " is-selected" : ""}`}>{skill.name}</span>
    </Html>
  </group>;
}
