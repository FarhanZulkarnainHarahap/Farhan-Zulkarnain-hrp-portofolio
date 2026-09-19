"use client";
/* Three.js owns these mutable scene objects and shared refs; useFrame updates them outside React rendering. */
/* eslint-disable react-hooks/immutability */
import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Mesh, Vector3 } from "three";
function Connection({ index, nodeRefs, active, reduced, progress }: { index: number; nodeRefs: MutableRefObject<(Group | null)[]>; active: boolean; reduced: boolean; progress: MutableRefObject<number> }) {
  const root = useRef<Group>(null), pulse = useRef<Mesh>(null);
  const scratch = useMemo(() => ({ end: new Vector3(), start: new Vector3(), direction: new Vector3(), axis: new Vector3(0,1,0) }), []);
  useFrame(({ clock }, dt) => {
    const node = nodeRefs.current[index]; if (!node || !root.current) return;
    scratch.end.copy(node.position); scratch.end.z -= 0.04;
    scratch.start.copy(scratch.end).normalize().multiplyScalar(0.59);
    scratch.direction.subVectors(scratch.end, scratch.start);
    const length = scratch.direction.length();
    root.current.position.copy(scratch.start).add(scratch.end).multiplyScalar(0.5);
    root.current.quaternion.setFromUnitVectors(scratch.axis, scratch.direction.normalize());
    const entrance = reduced ? 1 : MathUtils.clamp((progress.current - 0.55) / 0.25, 0, 1);
    root.current.scale.set(1, Math.max(0.001,length * entrance),1);
    root.current.visible = entrance > 0.05;
    if (pulse.current) {
      pulse.current.visible = !reduced;
      pulse.current.position.y = ((clock.elapsedTime * (active ? 0.65 : 0.3) + index * 0.19) % 1) - 0.5;
      pulse.current.scale.y = 1 / Math.max(length, 0.01);
    }
    const signal = root.current.children[1] as Mesh;
    signal.scale.x = signal.scale.z = MathUtils.damp(signal.scale.x, active ? 1.5 : 1, 8, Math.min(dt,0.1));
  });
  return <group ref={root}>
    <mesh><cylinderGeometry args={[0.012,0.012,1,5]} /><meshStandardMaterial color="#202d38" metalness={0.8} roughness={0.3} /></mesh>
    <mesh position={[0,0,0.014]}><cylinderGeometry args={[0.003,0.003,1,4]} /><meshBasicMaterial color={active ? "#4de5ff" : "#236272"} /></mesh>
    <mesh ref={pulse} position={[0,0,0.025]}><sphereGeometry args={[0.018,6,4]} /><meshBasicMaterial color="#72eeff" /></mesh>
  </group>;
}
export function CapabilityConnections({ count, nodeRefs, activeIndex, reduced, progress }: { count: number; nodeRefs: MutableRefObject<(Group | null)[]>; activeIndex: number; reduced: boolean; progress: MutableRefObject<number> }) {
  return <group name="Runtime_Data_Connections">{Array.from({ length: count },(_,i) => <Connection key={i} index={i} nodeRefs={nodeRefs} active={i===activeIndex} reduced={reduced} progress={progress} />)}</group>;
}
