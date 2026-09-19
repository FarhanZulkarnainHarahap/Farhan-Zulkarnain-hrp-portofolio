"use client";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useAnimations } from "@react-three/drei";
import { Group, MathUtils, Mesh, MeshStandardMaterial, type AnimationClip } from "three";
export function CapabilityCore({ template, animations, category, active, direction, reduced, progress }: {
  template: Group; animations: AnimationClip[]; category: string; active: boolean; direction: number; reduced: boolean; progress: MutableRefObject<number>;
}) {
  const scene = useMemo(() => { const clone = template.clone(true); let cyan: MeshStandardMaterial | undefined; clone.traverse(object => { if (object instanceof Mesh && object.material.name === "Cyan_Signal") { cyan ||= object.material.clone(); object.material = cyan; } }); return clone; }, [template]);
  useEffect(() => () => { const materials = new Set<MeshStandardMaterial>(); scene.traverse(object => { if (object instanceof Mesh && object.material.name === "Cyan_Signal") materials.add(object.material); }); materials.forEach(material => material.dispose()); }, [scene]);
  const { actions } = useAnimations(animations, scene);
  const root = useRef<Group>(null), reset = useRef(0), initial = useRef(true);
  useEffect(() => {
    if (initial.current) initial.current = false; else reset.current += Math.PI / 3;
  }, [category]);
  useEffect(() => { if (reduced) return; const idle = actions.idle; idle?.reset().play(); return () => { idle?.stop(); }; }, [actions, reduced]);
  useFrame(({ clock }, dt) => {
    if (!root.current) return;
    const d = Math.min(dt, 0.1);
    const t = reduced ? 1 : MathUtils.clamp(progress.current / 0.2, 0, 1);
    const scale = (0.72 + 0.28 * t) * (active ? 1.025 : 1);
    root.current.scale.setScalar(reduced ? scale : MathUtils.damp(root.current.scale.x, scale, 8, d));
    root.current.rotation.y = reduced ? 0 : MathUtils.damp(root.current.rotation.y, direction * .035, 7, d);
    scene.traverse(object => { if (object instanceof Mesh && object.material instanceof MeshStandardMaterial && object.material.name === "Cyan_Signal") object.material.emissiveIntensity = reduced ? 2.4 : 2.4 + Math.sin(clock.elapsedTime * .65) * .3 + (active ? .6 : 0); });
    root.current.position.y = reduced ? 0 : Math.sin(clock.elapsedTime * 0.7) * 0.015;
    const frame = scene.getObjectByName("Category_Core_Frame");
    if (frame) frame.rotation.z = reduced ? reset.current : MathUtils.damp(frame.rotation.z, reset.current, 7, d);
  });
  return <group ref={root} name="Category_Core_Runtime"><primitive object={scene} dispose={null} /><Html center position={[0,0,0.20]} style={{ pointerEvents: "none", whiteSpace: "nowrap" }}><span className="matrix-core-label">{category.toUpperCase()}</span></Html></group>;
}
