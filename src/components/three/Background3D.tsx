"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 3_200;
const CYAN = new THREE.Color("#22d3ee");
const PURPLE = new THREE.Color("#a855f7");

const seededRandom = (initialSeed: number) => {
  let seed = initialSeed;

  return () => {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    return seed / 4_294_967_296;
  };
};

function GalaxyParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const pointerRef = useRef(new THREE.Vector2());

  const geometry = useMemo(() => {
    const random = seededRandom(0x7a11cafe);
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const color = new THREE.Color();

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const radius = Math.pow(random(), 0.58) * 7.2;
      const branch = (index % 5) / 5 * Math.PI * 2;
      const spin = radius * 1.18;
      const angle = branch + spin + (random() - 0.5) * 0.72;
      const coreBias = 1 - radius / 7.2;

      positions[offset] = Math.cos(angle) * radius;
      positions[offset + 1] =
        (random() - 0.5) * (0.35 + radius * 0.18) +
        Math.sin(radius * 1.7) * 0.08;
      positions[offset + 2] = Math.sin(angle) * radius;

      color
        .copy(CYAN)
        .lerp(PURPLE, Math.min(1, random() * 0.78 + coreBias * 0.3));
      const intensity = 0.52 + random() * 0.48;

      colors[offset] = color.r * intensity;
      colors[offset + 1] = color.g * intensity;
      colors[offset + 2] = color.b * intensity;
    }

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    bufferGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    bufferGeometry.computeBoundingSphere();

    return bufferGeometry;
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.032,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
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

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const pointer = pointerRef.current;
    const smoothing = 1 - Math.exp(-delta * 2.2);
    points.rotation.y += delta * 0.025;
    points.rotation.x = THREE.MathUtils.lerp(
      points.rotation.x,
      pointer.y * 0.075,
      smoothing,
    );
    points.rotation.z = THREE.MathUtils.lerp(
      points.rotation.z,
      -pointer.x * 0.06,
      smoothing,
    );
    points.position.x = THREE.MathUtils.lerp(
      points.position.x,
      pointer.x * 0.18,
      smoothing,
    );
    points.position.y = THREE.MathUtils.lerp(
      points.position.y,
      pointer.y * 0.1 + Math.sin(state.clock.elapsedTime * 0.15) * 0.08,
      smoothing,
    );
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      rotation={[-0.18, 0, 0.08]}
      frustumCulled={false}
    />
  );
}

export default function Background3D() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-[#02030a]"
    >
      <Canvas
        camera={{ position: [0, 3.2, 8.5], fov: 55, near: 0.1, far: 30 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: false,
          antialias: false,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={["#02030a"]} />
        <fog attach="fog" args={["#050315", 8, 18]} />
        <GalaxyParticles />
        <AdaptiveDpr pixelated />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(2,3,10,0.38)_58%,#02030a_100%)]" />
    </div>
  );
}
