"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 1400;
const CYAN = new THREE.Color("#00f3ff");
const MAGENTA = new THREE.Color("#ff0055");

const createSeededRandom = () => {
  let seed = 0x0f3ff055;

  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

function CyberCore({ reduceMotion }: { reduceMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointerTarget = useRef(new THREE.Vector2());
  const { size } = useThree();

  const { positions, colors } = useMemo(() => {
    const random = createSeededRandom();
    const nextPositions = new Float32Array(PARTICLE_COUNT * 3);
    const nextColors = new Float32Array(PARTICLE_COUNT * 3);

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const isOuterNode = index % 11 === 0;
      const radius = 1.78 + random() * (isOuterNode ? 0.55 : 0.16);

      nextPositions[offset] = radius * Math.sin(phi) * Math.cos(theta);
      nextPositions[offset + 1] = radius * Math.cos(phi);
      nextPositions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const mix = random();
      const color = CYAN.clone().lerp(MAGENTA, mix > 0.78 ? 0.9 : mix * 0.18);
      const intensity = 0.62 + random() * 0.38;
      nextColors[offset] = color.r * intensity;
      nextColors[offset + 1] = color.g * intensity;
      nextColors[offset + 2] = color.b * intensity;
    }

    return { positions: nextPositions, colors: nextColors };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointerTarget.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group || reduceMotion) return;

    const smoothing = 1 - Math.exp(-delta * 2.8);
    const elapsed = state.clock.getElapsedTime();
    const compact = size.width < 768;
    const baseX = compact ? 0 : 2.35;
    const scale = compact ? 0.78 : 1;

    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      elapsed * 0.035 - pointerTarget.current.y * 0.16,
      smoothing,
    );
    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      elapsed * 0.052 + pointerTarget.current.x * 0.22,
      smoothing,
    );
    group.position.x = THREE.MathUtils.lerp(
      group.position.x,
      baseX + pointerTarget.current.x * 0.26,
      smoothing,
    );
    group.position.y = THREE.MathUtils.lerp(
      group.position.y,
      pointerTarget.current.y * 0.16 + Math.sin(elapsed * 0.45) * 0.08,
      smoothing,
    );
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, scale, smoothing));
  });

  return (
    <group ref={groupRef} position={[2.35, 0, 0]} rotation={[0.15, -0.2, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.036}
          sizeAttenuation
          transparent
          opacity={0.88}
          vertexColors
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh scale={0.94}>
        <icosahedronGeometry args={[1.8, 2]} />
        <meshBasicMaterial
          color="#00f3ff"
          wireframe
          transparent
          opacity={0.075}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0.2, 0.35]} scale={1.12}>
        <torusGeometry args={[1.78, 0.012, 6, 96]} />
        <meshBasicMaterial
          color="#ff0055"
          transparent
          opacity={0.36}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh rotation={[0.35, Math.PI / 2, -0.25]} scale={1.05}>
        <torusGeometry args={[1.86, 0.008, 6, 96]} />
        <meshBasicMaterial
          color="#00f3ff"
          transparent
          opacity={0.28}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh scale={0.76}>
        <sphereGeometry args={[1.65, 24, 24]} />
        <meshBasicMaterial
          color="#071b34"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function CyberBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 -z-10 h-screen w-full overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 48, near: 0.1, far: 40 }}
        dpr={[1, 1.5]}
        frameloop={reduceMotion ? "demand" : "always"}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#03050a", 6, 18]} />
        <CyberCore reduceMotion={reduceMotion} />
        <AdaptiveDpr pixelated />
      </Canvas>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(0,243,255,0.07),transparent_28%),radial-gradient(circle_at_82%_58%,rgba(255,0,85,0.055),transparent_24%),linear-gradient(90deg,rgba(3,4,6,0.76)_0%,rgba(3,4,6,0.2)_58%,rgba(3,4,6,0.48)_100%)]" />
    </div>
  );
}
