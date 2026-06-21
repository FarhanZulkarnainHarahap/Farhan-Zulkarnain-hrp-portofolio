"use client";

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export const GlassWhiteboard = () => {
  const boardRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!boardRef.current) {
      return;
    }

    boardRef.current.rotation.y = THREE.MathUtils.damp(boardRef.current.rotation.y, 0.18, 3, delta);
    boardRef.current.rotation.x = THREE.MathUtils.damp(boardRef.current.rotation.x, -0.04, 3, delta);
  });

  return (
    <group ref={boardRef} position={[20, 0, 0]}>
      <mesh>
        <boxGeometry args={[4.9, 2.8, 0.06]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transparent
          opacity={0.22}
          roughness={0.82}
          metalness={0.08}
          transmission={0.82}
          thickness={0.55}
          ior={1.35}
          emissive="#0055ff"
          emissiveIntensity={0.08}
        />
      </mesh>

      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[4.7, 2.6]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.055} blending={THREE.AdditiveBlending} />
      </mesh>

      <Text position={[-1.65, 0.78, 0.15]} fontSize={0.22} color="#ffffff" anchorX="left">
        CREDENTIAL & ASSETS
      </Text>
      <Text position={[-1.65, 0.26, 0.15]} fontSize={0.13} color="#00f0ff" anchorX="left">
        RESUME.PDF  /  CERTIFICATE.PDF
      </Text>
      <Text position={[-1.65, -0.18, 0.15]} fontSize={0.11} color="#93c5fd" anchorX="left" maxWidth={3.5}>
        Verified documents rendered as a sci-fi glass board with high-transmission material.
      </Text>

      <Text position={[0, -1.66, 0.15]} fontSize={0.16} letterSpacing={0.16} color="#00f0ff" anchorX="center">
        DOCUMENT BOARD / GLASSMORPHIC NODE
      </Text>
    </group>
  );
};
