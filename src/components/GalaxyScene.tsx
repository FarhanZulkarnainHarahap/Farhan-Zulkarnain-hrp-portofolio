"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type GalaxySceneProps = {
  className?: string;
  count?: number;
};

const GalaxyParticles = ({ count = 900 }: { count?: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const positionArray = new Float32Array(count * 3);
    const colorArray = new Float32Array(count * 3);
    const coreColor = new THREE.Color("#60a5fa");
    const edgeColor = new THREE.Color("#1d4ed8");
    const sparkColor = new THREE.Color("#f8fafc");

    for (let i = 0; i < count; i += 1) {
      const radius = Math.random() * 4.2;
      const branch = (i % 4) * ((Math.PI * 2) / 4);
      const spin = radius * 1.35;
      const randomX = (Math.random() - 0.5) * 0.6 * radius;
      const randomY = (Math.random() - 0.5) * 0.24;
      const randomZ = (Math.random() - 0.5) * 0.6 * radius;
      const index = i * 3;

      positionArray[index] = Math.cos(branch + spin) * radius + randomX;
      positionArray[index + 1] = randomY;
      positionArray[index + 2] = Math.sin(branch + spin) * radius + randomZ;

      const mixedColor = coreColor.clone().lerp(edgeColor, radius / 4.2);
      if (Math.random() > 0.88) {
        mixedColor.lerp(sparkColor, 0.7);
      }

      colorArray[index] = mixedColor.r;
      colorArray[index + 1] = mixedColor.g;
      colorArray[index + 2] = mixedColor.b;
    }

    return { positions: positionArray, colors: colorArray };
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) {
      return;
    }

    pointsRef.current.rotation.y += delta * 0.035;
    pointsRef.current.rotation.x = Math.sin(Date.now() * 0.00018) * 0.08;
  });

  return (
    <points ref={pointsRef} rotation={[0.55, 0, 0.18]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        transparent
        depthWrite={false}
        opacity={0.78}
        size={0.022}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default function GalaxyScene({ className = "", count }: GalaxySceneProps) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 1.1, 5.2], fov: 58 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      >
        <GalaxyParticles count={count} />
      </Canvas>
    </div>
  );
}
