"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneMotionProps } from "./scene-types";
import { smoothstep } from "./scene-types";

const shardDirections = [
  [-1.2, 0.75, 0.3],
  [1.1, 0.9, -0.25],
  [-0.85, -1.05, -0.4],
  [1.25, -0.7, 0.2],
  [0.15, 1.35, -0.7],
  [-0.2, -1.3, 0.65],
  [1.45, 0.05, -0.45],
  [-1.4, -0.1, 0.5],
] as const;

const monogramBars = [
  { position: [-0.38, 0, 0.03] as const, scale: [0.1, 0.72, 0.08] as const, rotation: 0 },
  { position: [-0.13, 0.31, 0.03] as const, scale: [0.34, 0.09, 0.08] as const, rotation: 0 },
  { position: [-0.17, 0.02, 0.03] as const, scale: [0.27, 0.08, 0.08] as const, rotation: 0 },
  { position: [0.28, 0.32, 0.03] as const, scale: [0.36, 0.08, 0.08] as const, rotation: 0 },
  { position: [0.28, -0.32, 0.03] as const, scale: [0.36, 0.08, 0.08] as const, rotation: 0 },
  { position: [0.28, 0, 0.03] as const, scale: [0.1, 0.46, 0.08] as const, rotation: -0.72 },
];

export default function FZCore({
  progressRef,
  pointerRef,
  profile,
  reducedMotion,
}: SceneMotionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const ringARef = useRef<THREE.Mesh>(null);
  const ringBRef = useRef<THREE.Mesh>(null);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const wireMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const monogramMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const shardRefs = useRef<Array<THREE.Mesh | null>>([]);
  const baseShardRotations = useMemo(
    () => shardDirections.map((_, index) => new THREE.Euler(index * 0.52, index * 0.73, index * 0.31)),
    [],
  );
  const compactScale = profile === "mobile" ? 0.73 : profile === "tablet" ? 0.86 : 1;

  useFrame((state, delta) => {
    const group = groupRef.current;
    const inner = innerRef.current;
    const outer = outerRef.current;
    const ringA = ringARef.current;
    const ringB = ringBRef.current;
    const haloMaterial = haloMaterialRef.current;
    const wireMaterial = wireMaterialRef.current;
    const monogramMaterial = monogramMaterialRef.current;
    if (!group || !inner || !outer || !ringA || !ringB || !haloMaterial || !wireMaterial || !monogramMaterial) return;

    const progress = progressRef.current;
    const aboutShift = smoothstep(progress, 0.13, 0.2) * (1 - smoothstep(progress, 0.34, 0.39));
    const breakApart = smoothstep(progress, 0.34, 0.43) * (1 - smoothstep(progress, 0.55, 0.62));
    const projectRecede = smoothstep(progress, 0.54, 0.62) * (1 - smoothstep(progress, 0.83, 0.9));
    const reunion = smoothstep(progress, 0.84, 0.98);
    const time = reducedMotion ? 0 : state.clock.elapsedTime;
    const side = profile === "desktop" ? -2.25 : profile === "tablet" ? -1.25 : -0.25;
    const damping = reducedMotion ? 1 : 1 - Math.exp(-delta * 4.2);

    const targetX = aboutShift * side + projectRecede * -1.1 * (profile === "mobile" ? 0.2 : 1);
    const targetY = aboutShift * 0.1 + Math.sin(time * 0.52) * 0.045 * (1 - breakApart);
    const targetZ = projectRecede * -4;
    group.position.x = THREE.MathUtils.lerp(group.position.x, targetX * (1 - reunion), damping);
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetY * (1 - reunion), damping);
    group.position.z = THREE.MathUtils.lerp(group.position.z, targetZ * (1 - reunion), damping);

    const targetScale = compactScale * (1 - breakApart * 0.26 - projectRecede * 0.62);
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, damping));
    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      (reducedMotion ? 0 : time * 0.09) + pointerRef.current.x * (profile === "desktop" ? 0.12 : 0.035),
      damping,
    );
    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      (reducedMotion ? 0.08 : Math.sin(time * 0.24) * 0.08) + pointerRef.current.y * 0.05,
      damping,
    );

    inner.rotation.x = time * 0.13;
    inner.rotation.y = time * -0.17;
    outer.rotation.y = time * 0.1;
    ringA.rotation.z = time * 0.18;
    ringB.rotation.x = Math.PI / 2.5 + Math.sin(time * 0.2) * 0.08;
    ringB.rotation.z = -time * 0.11;

    const coreVisibility = 1 - projectRecede * 0.82;
    haloMaterial.opacity = 0.18 * coreVisibility + reunion * 0.08;
    wireMaterial.opacity = 0.38 * coreVisibility + reunion * 0.14;
    monogramMaterial.opacity = 0.96 * coreVisibility + reunion * 0.04;
    monogramMaterial.emissiveIntensity = 2.1 + breakApart * 1.5 + reunion * 0.8;

    shardRefs.current.forEach((shard, index) => {
      if (!shard) return;
      const direction = shardDirections[index];
      const distance = breakApart * (1.15 + index * 0.085) * (profile === "mobile" ? 0.72 : 1);
      shard.position.set(direction[0] * distance, direction[1] * distance, direction[2] * distance);
      shard.rotation.set(
        baseShardRotations[index].x + time * 0.12 * (index % 2 ? 1 : -1),
        baseShardRotations[index].y + time * 0.15,
        baseShardRotations[index].z + breakApart * 0.7,
      );
      shard.scale.setScalar(0.72 + breakApart * 0.38);
    });
  });

  return (
    <group ref={groupRef}>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.02, profile === "mobile" ? 1 : 2]} />
        <meshPhysicalMaterial
          color="#6be7ff"
          emissive="#0b5d83"
          emissiveIntensity={0.52}
          transmission={0.76}
          thickness={0.7}
          roughness={0.16}
          metalness={0.12}
          transparent
          opacity={0.38}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={innerRef} scale={0.68}>
        <octahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#071528"
          emissive="#22d3ee"
          emissiveIntensity={1.65}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      <mesh scale={1.22}>
        <icosahedronGeometry args={[1.02, 1]} />
        <meshBasicMaterial
          ref={wireMaterialRef}
          color="#86efff"
          wireframe
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <mesh scale={1.48}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial
          ref={haloMaterialRef}
          color="#4cc9ff"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <group position={[0, 0, 0.82]}>
        {monogramBars.map((bar, index) => (
          <mesh
            key={index}
            position={bar.position}
            rotation={[0, 0, bar.rotation]}
            scale={bar.scale}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              ref={index === 0 ? monogramMaterialRef : undefined}
              color="#e8fdff"
              emissive="#67e8f9"
              emissiveIntensity={2.1}
              metalness={0.2}
              roughness={0.18}
              transparent
              opacity={0.96}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <mesh ref={ringARef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.42, 0.018, 8, profile === "mobile" ? 56 : 96]} />
        <meshBasicMaterial color="#6ee7ff" transparent opacity={0.52} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ringBRef} rotation={[0.8, 0.2, 0]}>
        <torusGeometry args={[1.67, 0.01, 6, profile === "mobile" ? 48 : 84]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.3} depthWrite={false} toneMapped={false} />
      </mesh>

      {shardDirections.map((_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            shardRefs.current[index] = node;
          }}
          scale={0.72}
        >
          <tetrahedronGeometry args={[0.18 + (index % 3) * 0.035, 0]} />
          <meshStandardMaterial
            color={index % 2 ? "#a78bfa" : "#67e8f9"}
            emissive={index % 2 ? "#6d28d9" : "#0891b2"}
            emissiveIntensity={1.25}
            metalness={0.62}
            roughness={0.24}
          />
        </mesh>
      ))}
    </group>
  );
}
