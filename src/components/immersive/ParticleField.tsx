"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneMotionProps } from "./scene-types";

function seededRandom(seedValue: number) {
  let seed = seedValue >>> 0;
  return () => {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    return seed / 4_294_967_296;
  };
}

export default function ParticleField({
  quality,
  pointerRef,
  profile,
  reducedMotion,
}: Pick<SceneMotionProps, "quality" | "pointerRef" | "profile" | "reducedMotion">) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = quality === "high" ? 1_200 : quality === "medium" ? 750 : 360;
  const { geometry, material } = useMemo(() => {
    const random = seededRandom(0xf22026);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color("#66e7ff");
    const lilac = new THREE.Color("#aa84ff");
    const workingColor = new THREE.Color();

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      const radius = 2.8 + Math.pow(random(), 0.72) * 10;
      const angle = random() * Math.PI * 2;
      const depthBias = (random() - 0.5) * 8;
      positions[offset] = Math.cos(angle) * radius + (random() - 0.5) * 2.5;
      positions[offset + 1] = (random() - 0.5) * 8;
      positions[offset + 2] = Math.sin(angle) * radius * 0.48 + depthBias - 2.5;

      workingColor.copy(cyan).lerp(lilac, random());
      const intensity = 0.4 + random() * 0.6;
      colors[offset] = workingColor.r * intensity;
      colors[offset + 1] = workingColor.g * intensity;
      colors[offset + 2] = workingColor.b * intensity;
    }

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    bufferGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    bufferGeometry.computeBoundingSphere();

    const pointsMaterial = new THREE.PointsMaterial({
      color: "#ffffff",
      size: profile === "mobile" ? 0.025 : 0.032,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });

    return { geometry: bufferGeometry, material: pointsMaterial };
  }, [count, profile]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points || reducedMotion) return;
    const damping = 1 - Math.exp(-delta * 2.2);
    points.rotation.y += delta * 0.008;
    points.rotation.x = THREE.MathUtils.lerp(points.rotation.x, pointerRef.current.y * 0.025, damping);
    points.rotation.z = THREE.MathUtils.lerp(points.rotation.z, -pointerRef.current.x * 0.018, damping);
    points.position.x = THREE.MathUtils.lerp(points.position.x, pointerRef.current.x * 0.11, damping);
    points.position.y = THREE.MathUtils.lerp(
      points.position.y,
      pointerRef.current.y * 0.07 + Math.sin(state.clock.elapsedTime * 0.12) * 0.08,
      damping,
    );
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
