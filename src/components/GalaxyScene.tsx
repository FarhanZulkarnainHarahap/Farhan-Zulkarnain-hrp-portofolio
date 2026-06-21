"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type GalaxySceneProps = {
  className?: string;
  count?: number;
  interactive?: boolean;
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
    const insideColor = new THREE.Color("#93c5fd");
    const midColor = new THREE.Color("#2563eb");
    const outsideColor = new THREE.Color("#020617");
    const sparkColor = new THREE.Color("#f8fafc");

    for (let i = 0; i < count; i += 1) {
      const radius = Math.random() ** 0.58 * 4.8;
      const branch = (i % 6) * ((Math.PI * 2) / 6);
      const spin = radius * 1.15;
      const randomnessPower = 2.7;
      const spread = 0.34 + radius * 0.09;
      const randomX = (Math.random() < 0.5 ? 1 : -1) * Math.random() ** randomnessPower * spread * radius;
      const randomY = (Math.random() < 0.5 ? 1 : -1) * Math.random() ** randomnessPower * 0.28;
      const randomZ = (Math.random() < 0.5 ? 1 : -1) * Math.random() ** randomnessPower * spread * radius;
      const index = i * 3;

      positionArray[index] = Math.cos(branch + spin) * radius + randomX;
      positionArray[index + 1] = randomY;
      positionArray[index + 2] = Math.sin(branch + spin) * radius + randomZ;

      const mixedColor = insideColor.clone().lerp(midColor, Math.min(radius / 3.8, 1));
      mixedColor.lerp(outsideColor, Math.max(0, (radius - 3.2) / 2.1));
      if (Math.random() > 0.88) {
        mixedColor.lerp(sparkColor, 0.78);
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

    pointsRef.current.rotation.y += delta * 0.045;
    pointsRef.current.rotation.x = 0.52 + Math.sin(Date.now() * 0.0002) * 0.05;
  });

  return (
    <points ref={pointsRef} rotation={[0.48, -0.28, 0.18]}>
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
        opacity={0.9}
        size={0.042}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const GalaxyOrbitRings = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.z += delta * 0.08;
    groupRef.current.rotation.y = Math.sin(Date.now() * 0.00016) * 0.18;
  });

  return (
    <group ref={groupRef} rotation={[1.05, 0.2, -0.42]}>
      {[1.55, 2.2, 2.9].map((radius, index) => (
        <mesh key={radius} rotation={[index * 0.18, index * 0.26, 0]}>
          <torusGeometry args={[radius, 0.006, 8, 180]} />
          <meshBasicMaterial
            color={index === 1 ? "#22d3ee" : "#3b82f6"}
            transparent
            opacity={index === 1 ? 0.34 : 0.2}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      <mesh position={[0.2, 0, 0]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.52} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

const CameraRig = ({ interactive = false }: { interactive?: boolean }) => {
  const target = useRef({ x: 0, y: 0 });
  const drag = useRef({ active: false, x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!interactive) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof HTMLElement) {
        const tagName = event.target.tagName.toLowerCase();
        if (["input", "textarea", "select", "button", "a"].includes(tagName)) {
          return;
        }
      }

      drag.current = {
        active: true,
        x: event.clientX,
        y: event.clientY,
        targetX: target.current.x,
        targetY: target.current.y,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const normalX = (event.clientX / window.innerWidth - 0.5) * 2;
      const normalY = (event.clientY / window.innerHeight - 0.5) * 2;

      if (!drag.current.active) {
        target.current.x = normalX * 0.35;
        target.current.y = -normalY * 0.22;
        return;
      }

      const deltaX = (event.clientX - drag.current.x) / window.innerWidth;
      const deltaY = (event.clientY - drag.current.y) / window.innerHeight;
      target.current.x = THREE.MathUtils.clamp(drag.current.targetX - deltaX * 2.2, -1.15, 1.15);
      target.current.y = THREE.MathUtils.clamp(drag.current.targetY + deltaY * 1.4, -0.7, 0.7);
    };

    const onPointerUp = () => {
      drag.current.active = false;
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [interactive]);

  useFrame(({ camera }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.current.x, 0.045);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.72 + target.current.y, 0.045);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5.7, 0.03);
    camera.lookAt(0, -0.08, 0);
  });

  return null;
};

export default function GalaxyScene({ className = "", count, interactive = false }: GalaxySceneProps) {
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className || "absolute inset-0"}`}>
      <Canvas
        camera={{ position: [0, 0.72, 5.7], fov: 62 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      >
        <CameraRig interactive={interactive} />
        <GalaxyOrbitRings />
        <GalaxyParticles count={count} />
      </Canvas>
    </div>
  );
}
