"use client";

/* eslint-disable react-hooks/immutability */

import { Canvas, useFrame } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { CyberTablet } from "./CyberTablet";
import { FloatingPhotoFrames } from "./FloatingPhotoFrames";
import { GlassWhiteboard } from "./GlassWhiteboard";

type HorizontalSceneProps = {
  progressRef: MutableRefObject<number>;
  velocityRef: MutableRefObject<number>;
};

const CameraController = ({ progressRef }: { progressRef: MutableRefObject<number> }) => {
  useFrame(({ camera }, delta) => {
    const targetX = progressRef.current * 24;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.15, 3.8, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 6.4, 3.2, delta);
    camera.lookAt(targetX, 0, 0);
  });

  return null;
};

const DataRail = () => {
  return (
    <group position={[12, -2.25, -0.9]}>
      <mesh>
        <boxGeometry args={[26, 0.025, 0.025]} />
        <meshBasicMaterial color="#0055ff" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
      </mesh>
      {[0, 12, 24].map((x) => (
        <mesh key={x} position={[x - 12, 0, 0]}>
          <sphereGeometry args={[0.085, 18, 18]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.85} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
};

const seededRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const DataNodeNetwork = ({ progressRef }: { progressRef: MutableRefObject<number> }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const { pointGeometry, lineGeometry, positions } = useMemo(() => {
    const particleCount = 620;
    const nodePositions = new Float32Array(particleCount * 3);

    for (let index = 0; index < particleCount; index += 1) {
      const i3 = index * 3;
      const spreadX = 31;
      nodePositions[i3] = (seededRandom(index + 1) - 0.5) * spreadX + 12;
      nodePositions[i3 + 1] = (seededRandom(index + 101) - 0.5) * 7.2;
      nodePositions[i3 + 2] = -4.2 - seededRandom(index + 501) * 3.6;
    }

    const linePositions: number[] = [];
    for (let index = 0; index < particleCount; index += 1) {
      const ix = nodePositions[index * 3];
      const iy = nodePositions[index * 3 + 1];
      const iz = nodePositions[index * 3 + 2];

      for (let target = index + 1; target < Math.min(index + 7, particleCount); target += 1) {
        const tx = nodePositions[target * 3];
        const ty = nodePositions[target * 3 + 1];
        const tz = nodePositions[target * 3 + 2];
        const distance = Math.hypot(ix - tx, iy - ty, iz - tz);

        if (distance < 2.05) {
          linePositions.push(ix, iy, iz, tx, ty, tz);
        }
      }
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));

    const edgesGeometry = new THREE.BufferGeometry();
    edgesGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));

    return { pointGeometry: particleGeometry, lineGeometry: edgesGeometry, positions: nodePositions };
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    if (!groupRef.current || !pointsRef.current) {
      return;
    }

    const scrollProgress = progressRef.current;
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, scrollProgress * Math.PI * 0.34, 2.4, delta);
    groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, pointer.x * 0.035, 3, delta);
    groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, -scrollProgress * 0.85, 2.2, delta);

    const time = clock.elapsedTime;
    for (let index = 0; index < positions.length / 3; index += 1) {
      const i3 = index * 3;
      positions[i3 + 1] += Math.sin(time * 0.24 + index * 0.37) * 0.0009;
      positions[i3] += Math.cos(time * 0.18 + index * 0.21) * 0.0007;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#0033aa" transparent opacity={0.17} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points ref={pointsRef} geometry={pointGeometry}>
        <pointsMaterial
          color="#00f0ff"
          size={0.028}
          sizeAttenuation
          transparent
          opacity={0.82}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export const HorizontalScene = ({ progressRef, velocityRef }: HorizontalSceneProps) => {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas
        camera={{ position: [0, 0.15, 6.4], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.65} />
        <pointLight position={[0, 3, 4]} intensity={18} color="#00f0ff" />
        <pointLight position={[10, 2, 5]} intensity={14} color="#0055ff" />
        <pointLight position={[20, 2.5, 4]} intensity={12} color="#93c5fd" />

        <CameraController progressRef={progressRef} />

        <Suspense fallback={null}>
          <DataNodeNetwork progressRef={progressRef} />
          <FloatingPhotoFrames />
          <CyberTablet velocityRef={velocityRef} />
          <GlassWhiteboard />
          <DataRail />
        </Suspense>
      </Canvas>
    </div>
  );
};
