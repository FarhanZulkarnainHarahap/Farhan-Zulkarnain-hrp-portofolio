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
  const particleTexture = useMemo(() => {
    if (typeof document === "undefined") {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    const gradient = context.createRadialGradient(48, 48, 0, 48, 48, 48);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.18, "rgba(147,197,253,0.95)");
    gradient.addColorStop(0.48, "rgba(59,130,246,0.42)");
    gradient.addColorStop(0.78, "rgba(37,99,235,0.12)");
    gradient.addColorStop(1, "rgba(37,99,235,0)");

    context.clearRect(0, 0, 96, 96);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 96, 96);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
  }, []);

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
        map={particleTexture ?? undefined}
        vertexColors
        transparent
        alphaTest={0.01}
        depthWrite={false}
        opacity={0.82}
        size={0.036}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default function GalaxyScene({ className = "", count }: GalaxySceneProps) {
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className || "absolute inset-0"}`}>
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
