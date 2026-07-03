"use client";

import { Center, Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  hologramFragmentShader,
  hologramVertexShader,
} from "./hologramShaders";

interface HologramText3DProps {
  children: string;
  font: string;
  size?: number;
  depth?: number;
  colorA?: string;
  colorB?: string;
}

export default function HologramText3D({
  children,
  font,
  size = 1,
  depth = 0.16,
  colorA = "#22d3ee",
  colorB = "#a855f7",
}: HologramText3DProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0.92 },
      uGlitchStrength: { value: 0.12 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
    }),
    [colorA, colorB],
  );

  useFrame(({ clock }) => {
    const material = materialRef.current;
    if (material) material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <Center>
      <Text3D
        font={font}
        size={size}
        height={depth}
        curveSegments={10}
        bevelEnabled
        bevelSize={0.012}
        bevelThickness={0.018}
        bevelSegments={4}
      >
        {children}
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={hologramVertexShader}
          fragmentShader={hologramFragmentShader}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </Text3D>
    </Center>
  );
}
