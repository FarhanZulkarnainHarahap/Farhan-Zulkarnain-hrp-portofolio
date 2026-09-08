"use client";
import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
/** Loader cache owns GPU resources. Clones only the hierarchy for independent animation. */
export function useBlenderAsset(name: string) {
  const { scene } = useGLTF(`/models/${name}.glb`);
  return useMemo(() => scene.clone(true), [scene]);
}
export default function BlenderAsset({ name }: { name: string }) {
  const scene = useBlenderAsset(name);
  return <primitive object={scene} dispose={null} />;
}
