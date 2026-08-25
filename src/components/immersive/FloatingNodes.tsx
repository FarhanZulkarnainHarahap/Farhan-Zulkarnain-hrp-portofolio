"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneMotionProps } from "./scene-types";
import { smoothstep } from "./scene-types";

const nodeData = [
  { label: "PURWADHIKA", position: [-3.2, 1.25, -1.2] as const, color: "#63e7ff" },
  { label: "LARAVEL", position: [3, 0.9, -2.15] as const, color: "#ff6a88" },
  { label: "TOKIO MARINE", position: [-2.8, -1.2, -3.2] as const, color: "#8da2ff" },
  { label: "FULL STACK", position: [2.8, -0.85, -3.85] as const, color: "#c892ff" },
];

function createLabelTexture(label: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 112;
  const context = canvas.getContext("2d");

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(4, 8, 18, 0.82)";
    context.strokeStyle = "rgba(170, 235, 255, 0.55)";
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(3, 3, 506, 106, 22);
    context.fill();
    context.stroke();
    context.fillStyle = "#dff9ff";
    context.font = "700 28px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, canvas.width / 2, canvas.height / 2 + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function OrbitalNode({
  label,
  color,
  position,
  index,
  progressRef,
  profile,
  reducedMotion,
}: {
  label: string;
  color: string;
  position: readonly [number, number, number];
  index: number;
} & Pick<SceneMotionProps, "progressRef" | "profile" | "reducedMotion">) {
  const groupRef = useRef<THREE.Group>(null);
  const solidMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const labelMaterialRef = useRef<THREE.SpriteMaterial>(null);
  const labelTexture = useMemo(() => createLabelTexture(label), [label]);
  const basePosition = useMemo(() => new THREE.Vector3(...position), [position]);
  const compactScale = profile === "mobile" ? 0.72 : profile === "tablet" ? 0.86 : 1;

  useEffect(() => () => labelTexture.dispose(), [labelTexture]);

  useFrame((state) => {
    const group = groupRef.current;
    const solidMaterial = solidMaterialRef.current;
    const glowMaterial = glowMaterialRef.current;
    const labelMaterial = labelMaterialRef.current;
    if (!group || !solidMaterial || !glowMaterial || !labelMaterial) return;

    const progress = progressRef.current;
    const journeyVisibility =
      smoothstep(progress, 0.33, 0.37) * (1 - smoothstep(progress, 0.55, 0.6));
    const reunion = smoothstep(progress, 0.85, 0.97);
    const visibility = Math.max(journeyVisibility, reunion * 0.72);
    const time = reducedMotion ? 0 : state.clock.elapsedTime;
    const orbit = journeyVisibility * (reducedMotion ? 0 : 0.16);
    const reunionScale = THREE.MathUtils.lerp(1, 0.12, reunion);

    group.visible = visibility > 0.005;
    group.position.copy(basePosition).multiplyScalar(reunionScale * compactScale);
    group.position.x += Math.sin(time * 0.42 + index * 1.7) * orbit;
    group.position.y += Math.cos(time * 0.5 + index * 1.3) * orbit * 0.55;
    group.rotation.y = time * (0.16 + index * 0.015);
    group.rotation.x = Math.sin(time * 0.34 + index) * 0.12;

    solidMaterial.opacity = visibility * 0.88;
    glowMaterial.opacity = visibility * 0.24;
    labelMaterial.opacity = visibility * (1 - reunion) * 0.92;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial
          ref={solidMaterialRef}
          color="#081321"
          emissive={color}
          emissiveIntensity={1.8}
          metalness={0.45}
          roughness={0.2}
          transparent
          opacity={0}
        />
      </mesh>
      <mesh scale={1.65}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          color={color}
          wireframe
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.009, 5, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <sprite position={[0, -0.72, 0]} scale={[2.35, 0.51, 1]}>
        <spriteMaterial
          ref={labelMaterialRef}
          map={labelTexture}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}

export default function FloatingNodes({
  progressRef,
  profile,
  reducedMotion,
}: Pick<SceneMotionProps, "progressRef" | "profile" | "reducedMotion">) {
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const lineGeometry = useMemo(() => {
    const points: number[] = [];
    nodeData.forEach((node, index) => {
      const next = nodeData[(index + 1) % nodeData.length];
      points.push(...node.position, ...next.position);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  }, []);

  useEffect(() => () => lineGeometry.dispose(), [lineGeometry]);

  useFrame(() => {
    const material = lineMaterialRef.current;
    if (!material) return;
    const progress = progressRef.current;
    material.opacity =
      smoothstep(progress, 0.35, 0.4) *
      (1 - smoothstep(progress, 0.52, 0.58)) *
      0.2;
  });

  return (
    <group>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          ref={lineMaterialRef}
          color="#80edff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>
      {nodeData.map((node, index) => (
        <OrbitalNode
          key={node.label}
          {...node}
          index={index}
          progressRef={progressRef}
          profile={profile}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}
