"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import { Suspense } from "react";
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
    const targetX = progressRef.current * 20;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.15, 3.8, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 6.4, 3.2, delta);
    camera.lookAt(targetX, 0, 0);
  });

  return null;
};

const DataRail = () => {
  return (
    <group position={[10, -2.25, -0.9]}>
      <mesh>
        <boxGeometry args={[22, 0.025, 0.025]} />
        <meshBasicMaterial color="#0055ff" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
      </mesh>
      {[0, 10, 20].map((x) => (
        <mesh key={x} position={[x - 10, 0, 0]}>
          <sphereGeometry args={[0.085, 18, 18]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.85} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
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
          <FloatingPhotoFrames />
          <CyberTablet velocityRef={velocityRef} />
          <GlassWhiteboard />
          <DataRail />
        </Suspense>
      </Canvas>
    </div>
  );
};
