"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

const NODE_LABELS = ["UI", "API", "Auth", "DB", "Deploy", "UX"];

const seededRandom = (initialSeed: number) => {
  let seed = initialSeed;

  return () => {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    return seed / 4_294_967_296;
  };
};

function useVisualTier() {
  const [tier, setTier] = useState<"high" | "medium" | "low">("medium");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      const cores = window.navigator.hardwareConcurrency || 4;
      const dpr = window.devicePixelRatio || 1;

      if (reduceMotion || mobile || cores <= 4) {
        setTier("low");
        return;
      }

      setTier(dpr > 1.5 && cores >= 8 ? "high" : "medium");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return tier;
}

function ParticleField({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const random = seededRandom(0x51a7e);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color("#67e8f9");
    const violet = new THREE.Color("#8b5cf6");
    const blue = new THREE.Color("#2563eb");
    const color = new THREE.Color();

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      const ring = index % 6;
      const radius = 1.8 + random() * 5.6 + ring * 0.12;
      const angle = random() * Math.PI * 2;
      const height = (random() - 0.5) * 4.2;

      positions[offset] = Math.cos(angle) * radius;
      positions[offset + 1] = height;
      positions[offset + 2] = Math.sin(angle) * radius;

      color.copy(ring % 3 === 0 ? cyan : ring % 3 === 1 ? blue : violet);
      color.multiplyScalar(0.45 + random() * 0.45);
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    buffer.computeBoundingSphere();
    return buffer;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        vertexColors: true,
        size: 0.035,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.68,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.035;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.08;
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}

function OrbitalRings() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.18;
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
  });

  return (
    <group ref={group}>
      {[0, 1, 2].map((index) => (
        <mesh key={index} rotation={[Math.PI / 2 + index * 0.34, index * 0.62, 0]}>
          <torusGeometry args={[1.45 + index * 0.34, 0.008, 8, 140]} />
          <meshBasicMaterial
            color={index === 1 ? "#67e8f9" : "#60a5fa"}
            transparent
            opacity={0.34 - index * 0.05}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function DigitalCore() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.22;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.07;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.92, 2]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#0ea5e9"
          emissiveIntensity={0.45}
          roughness={0.38}
          metalness={0.75}
          wireframe
        />
      </mesh>
      <mesh scale={0.62}>
        <octahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#38bdf8"
          emissiveIntensity={1.1}
          roughness={0.2}
          metalness={0.4}
          transparent
          opacity={0.55}
        />
      </mesh>
      <OrbitalRings />
    </group>
  );
}

function DataNodes() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y -= delta * 0.08;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.42) * 0.05;
  });

  return (
    <group ref={group}>
      {NODE_LABELS.map((label, index) => {
        const angle = (index / NODE_LABELS.length) * Math.PI * 2;
        const position = [Math.cos(angle) * 2.55, Math.sin(index * 1.7) * 0.55, Math.sin(angle) * 2.55] as const;

        return (
          <group key={label} position={position}>
            <mesh>
              <sphereGeometry args={[0.085, 18, 18]} />
              <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={1.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Scene({ tier }: { tier: "high" | "medium" | "low" }) {
  const particleCount = tier === "high" ? 1800 : tier === "medium" ? 1100 : 520;

  return (
    <>
      <color attach="background" args={["#02040a"]} />
      <fog attach="fog" args={["#02040a", 6, 17]} />
      <ambientLight intensity={0.32} />
      <pointLight position={[3, 4, 3]} intensity={1.6} color="#67e8f9" />
      <pointLight position={[-4, -2, -2]} intensity={0.95} color="#8b5cf6" />
      <group position={[0, 0.05, 0]}>
        <DigitalCore />
        <DataNodes />
        <ParticleField count={particleCount} />
      </group>
      <gridHelper args={[13, 24, "#155e75", "#0f172a"]} position={[0, -2.25, 0]} />
      <AdaptiveDpr pixelated />
      {tier !== "low" && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.28} luminanceThreshold={0.22} luminanceSmoothing={0.62} />
          <Noise opacity={0.025} blendFunction={BlendFunction.SOFT_LIGHT} />
          <Vignette eskil={false} offset={0.2} darkness={0.42} />
        </EffectComposer>
      )}
    </>
  );
}

function CanvasFallback() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.22),transparent_34%),linear-gradient(180deg,#02040a,#030712)]" />
  );
}

export default function CinematicCanvas() {
  const tier = useVisualTier();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Suspense fallback={<CanvasFallback />}>
        <Canvas
          camera={{ position: [0, 2.15, 6.8], fov: 47, near: 0.1, far: 40 }}
          dpr={tier === "high" ? [1, 1.75] : [1, 1.25]}
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        >
          <Scene tier={tier} />
        </Canvas>
      </Suspense>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(2,4,10,0.25)_45%,#02040a_92%)]" />
    </div>
  );
}
