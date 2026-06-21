"use client";

/* eslint-disable react-hooks/immutability */

import { useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { Text } from "@react-three/drei";
import { useMouseParallax } from "../hooks/useMouseParallax";

const photoUrls = [
  "https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg",
  "https://res.cloudinary.com/dpanr1qqp/image/upload/v1765863460/bake-bliss/uvrcju3eqxe40hca2nlm.jpg",
];

const PhotoPlane = ({ url, position, rotation }: { url: string; position: [number, number, number]; rotation: [number, number, number] }) => {
  const frameRef = useRef<THREE.Group>(null);
  const texture = useLoader(TextureLoader, url);
  const { parallaxRef, activeRef, onPointerEnter, onPointerLeave, onPointerMove } = useMouseParallax();

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.offset.set(0, 0);
  }, [texture]);

  useFrame((_, delta) => {
    if (!frameRef.current) {
      return;
    }

    const targetX = rotation[0] + parallaxRef.current.y * 0.08;
    const targetY = rotation[1] - parallaxRef.current.x * 0.08;
    frameRef.current.rotation.x = THREE.MathUtils.damp(frameRef.current.rotation.x, targetX, 6, delta);
    frameRef.current.rotation.y = THREE.MathUtils.damp(frameRef.current.rotation.y, targetY, 6, delta);
    frameRef.current.position.y = THREE.MathUtils.damp(
      frameRef.current.position.y,
      position[1] + (activeRef.current ? 0.08 : 0),
      4,
      delta,
    );

    texture.offset.x = THREE.MathUtils.damp(texture.offset.x, parallaxRef.current.x * 0.018, 5, delta);
    texture.offset.y = THREE.MathUtils.damp(texture.offset.y, parallaxRef.current.y * 0.018, 5, delta);
  });

  return (
    <group ref={frameRef} position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[2.05, 2.65, 0.12]} />
        <meshStandardMaterial color="#020617" roughness={0.55} metalness={0.55} emissive="#0033aa" emissiveIntensity={0.18} />
      </mesh>
      <mesh
        position={[0, 0, 0.071]}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
      >
        <planeGeometry args={[1.82, 2.42, 12, 12]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.085]}>
        <planeGeometry args={[1.98, 2.58]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.08} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

export const FloatingPhotoFrames = () => {
  return (
    <group position={[0, 0, 0]}>
      <Suspense fallback={null}>
        <PhotoPlane url={photoUrls[0]} position={[-1.15, 0.05, 0]} rotation={[0.02, 0.23, -0.07]} />
        <PhotoPlane url={photoUrls[1]} position={[1.16, -0.18, -0.32]} rotation={[-0.04, -0.22, 0.08]} />
      </Suspense>

      <Text
        position={[0, -2.05, 0.2]}
        fontSize={0.22}
        letterSpacing={0.18}
        color="#00f0ff"
        anchorX="center"
        anchorY="middle"
      >
        ABOUT / SKILLS NODE
      </Text>
    </group>
  );
};
