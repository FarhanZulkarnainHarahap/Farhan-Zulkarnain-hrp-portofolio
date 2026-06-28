"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const CORE_PARTICLE_COUNT = 1350;
const FIELD_PARTICLE_COUNT = 720;
const NETWORK_SEGMENT_COUNT = 190;
const CYAN = new THREE.Color("#00f3ff");
const MAGENTA = new THREE.Color("#ff0055");

const createSeededRandom = (initialSeed: number) => {
  let seed = initialSeed;

  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

function CyberWorld({ reduceMotion }: { reduceMotion: boolean }) {
  const coreRef = useRef<THREE.Group>(null);
  const fieldRef = useRef<THREE.Group>(null);
  const primaryRingRef = useRef<THREE.Mesh>(null);
  const secondaryRingRef = useRef<THREE.Mesh>(null);
  const satelliteRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.GridHelper>(null);
  const fieldMaterialRef = useRef<THREE.PointsMaterial>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const pointerTargetRef = useRef(new THREE.Vector2());
  const pointerRef = useRef(new THREE.Vector2());
  const previousScrollRef = useRef(0);
  const hasScrollSampleRef = useRef(false);
  const scrollVelocityRef = useRef(0);
  const scrollProgressRef = useRef(0);
  const { size } = useThree();

  const coreGeometry = useMemo(() => {
    const random = createSeededRandom(0x0f3ff055);
    const positions = new Float32Array(CORE_PARTICLE_COUNT * 3);
    const colors = new Float32Array(CORE_PARTICLE_COUNT * 3);

    for (let index = 0; index < CORE_PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const isOuterNode = index % 11 === 0;
      const radius = 1.72 + random() * (isOuterNode ? 0.62 : 0.18);

      positions[offset] = radius * Math.sin(phi) * Math.cos(theta);
      positions[offset + 1] = radius * Math.cos(phi);
      positions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const colorMix = random();
      const color = CYAN.clone().lerp(
        MAGENTA,
        colorMix > 0.76 ? 0.92 : colorMix * 0.14,
      );
      const intensity = 0.58 + random() * 0.42;

      colors[offset] = color.r * intensity;
      colors[offset + 1] = color.g * intensity;
      colors[offset + 2] = color.b * intensity;
    }

    return { positions, colors };
  }, []);

  const fieldGeometry = useMemo(() => {
    const random = createSeededRandom(0xc7be4127);
    const positions = new Float32Array(FIELD_PARTICLE_COUNT * 3);
    const colors = new Float32Array(FIELD_PARTICLE_COUNT * 3);

    for (let index = 0; index < FIELD_PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const depth = -1.5 - random() * 8;

      positions[offset] = (random() - 0.5) * 18;
      positions[offset + 1] = (random() - 0.5) * 10;
      positions[offset + 2] = depth;

      const color = index % 9 === 0 ? MAGENTA : CYAN;
      const intensity = 0.18 + random() * 0.62;
      colors[offset] = color.r * intensity;
      colors[offset + 1] = color.g * intensity;
      colors[offset + 2] = color.b * intensity;
    }

    return { positions, colors };
  }, []);

  const networkGeometry = useMemo(() => {
    const random = createSeededRandom(0x82a1f0d3);
    const positions = new Float32Array(NETWORK_SEGMENT_COUNT * 6);
    const colors = new Float32Array(NETWORK_SEGMENT_COUNT * 6);

    for (let index = 0; index < NETWORK_SEGMENT_COUNT; index += 1) {
      const offset = index * 6;
      const startX = (random() - 0.5) * 17;
      const startY = (random() - 0.5) * 9;
      const startZ = -2.2 - random() * 7;
      const horizontal = random() > 0.38;
      const length = 0.18 + random() * 0.85;
      const endX = startX + (horizontal ? length : 0);
      const endY = startY + (horizontal ? 0 : length);

      positions.set(
        [startX, startY, startZ, endX, endY, startZ],
        offset,
      );

      const color = index % 7 === 0 ? MAGENTA : CYAN;
      const intensity = 0.12 + random() * 0.28;

      for (let vertex = 0; vertex < 2; vertex += 1) {
        const colorOffset = offset + vertex * 3;
        colors[colorOffset] = color.r * intensity;
        colors[colorOffset + 1] = color.g * intensity;
        colors[colorOffset + 2] = color.b * intensity;
      }
    }

    return { positions, colors };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      pointerTargetRef.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const materials = Array.isArray(grid.material)
      ? grid.material
      : [grid.material];

    materials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.11;
      material.depthWrite = false;
      material.blending = THREE.AdditiveBlending;
      material.toneMapped = false;
    });
  }, []);

  useFrame((state, delta) => {
    const core = coreRef.current;
    const field = fieldRef.current;
    const grid = gridRef.current;
    if (!core || !field || !grid) return;

    if (!stageRef.current?.isConnected) {
      stageRef.current = document.querySelector<HTMLElement>(
        "[data-horizontal-stage]",
      );
    }

    const stage = stageRef.current;
    const stageScroll = stage?.scrollLeft ?? 0;
    const horizontalScroll = window.scrollX + stageScroll;
    const maxHorizontalScroll = stage
      ? Math.max(stage.scrollWidth - stage.clientWidth, 1)
      : Math.max(
          document.documentElement.scrollWidth - window.innerWidth,
          1,
        );
    const targetProgress = THREE.MathUtils.clamp(
      horizontalScroll / maxHorizontalScroll,
      0,
      1,
    );
    const rawVelocity = hasScrollSampleRef.current
      ? (horizontalScroll - previousScrollRef.current) /
        Math.max(delta, 1 / 240)
      : 0;

    hasScrollSampleRef.current = true;
    previousScrollRef.current = horizontalScroll;
    scrollVelocityRef.current = THREE.MathUtils.lerp(
      scrollVelocityRef.current,
      rawVelocity,
      1 - Math.exp(-delta * 8),
    );
    scrollProgressRef.current = THREE.MathUtils.lerp(
      scrollProgressRef.current,
      targetProgress,
      1 - Math.exp(-delta * 5),
    );
    pointerRef.current.lerp(
      pointerTargetRef.current,
      1 - Math.exp(-delta * 3.4),
    );

    const elapsed = reduceMotion ? 0 : state.clock.elapsedTime;
    const progress = scrollProgressRef.current;
    const phase = progress * Math.PI * 6;
    const velocity = scrollVelocityRef.current;
    const warp = Math.min(Math.abs(velocity) * 0.00032, 1);
    const compact = size.width < 768;
    const smoothing = 1 - Math.exp(-delta * 3.8);
    const coreTravel = compact ? 0.85 : 2.3;
    const coreTargetX =
      Math.cos(progress * Math.PI * 1.5) * coreTravel +
      pointerRef.current.x * 0.28;
    const coreTargetY =
      Math.sin(progress * Math.PI * 3) * (compact ? 0.35 : 0.78) +
      pointerRef.current.y * 0.2;
    const coreScale = (compact ? 0.66 : 0.92) + warp * 0.12;

    core.position.x = THREE.MathUtils.lerp(
      core.position.x,
      coreTargetX,
      smoothing,
    );
    core.position.y = THREE.MathUtils.lerp(
      core.position.y,
      coreTargetY,
      smoothing,
    );
    core.position.z = THREE.MathUtils.lerp(
      core.position.z,
      -0.25 - warp * 0.55,
      smoothing,
    );
    core.rotation.x = THREE.MathUtils.lerp(
      core.rotation.x,
      elapsed * 0.035 - pointerRef.current.y * 0.18 + progress * 0.7,
      smoothing,
    );
    core.rotation.y = THREE.MathUtils.lerp(
      core.rotation.y,
      elapsed * 0.052 + pointerRef.current.x * 0.24 + phase * 0.22,
      smoothing,
    );
    core.rotation.z = THREE.MathUtils.lerp(
      core.rotation.z,
      Math.sin(phase) * 0.12 - Math.sign(velocity) * warp * 0.08,
      smoothing,
    );
    core.scale.x = THREE.MathUtils.lerp(
      core.scale.x,
      coreScale * (1 + warp * 0.38),
      smoothing,
    );
    core.scale.y = THREE.MathUtils.lerp(
      core.scale.y,
      coreScale * (1 - warp * 0.08),
      smoothing,
    );
    core.scale.z = THREE.MathUtils.lerp(
      core.scale.z,
      coreScale,
      smoothing,
    );

    field.position.x = THREE.MathUtils.lerp(
      field.position.x,
      Math.sin(phase * 0.55) * 0.72 - pointerRef.current.x * 0.32,
      smoothing,
    );
    field.position.y = THREE.MathUtils.lerp(
      field.position.y,
      pointerRef.current.y * 0.24,
      smoothing,
    );
    field.position.z = THREE.MathUtils.lerp(
      field.position.z,
      -warp * 0.9,
      smoothing,
    );
    field.rotation.z = THREE.MathUtils.lerp(
      field.rotation.z,
      progress * 0.16 + pointerRef.current.x * 0.018,
      smoothing,
    );

    const gridStep = 30 / 42;
    grid.position.z = -5 + ((horizontalScroll * 0.006) % gridStep);
    grid.rotation.z = THREE.MathUtils.lerp(
      grid.rotation.z,
      pointerRef.current.x * 0.025 - Math.sign(velocity) * warp * 0.01,
      smoothing,
    );

    if (primaryRingRef.current) {
      primaryRingRef.current.rotation.z =
        elapsed * 0.24 + phase * 0.32;
    }
    if (secondaryRingRef.current) {
      secondaryRingRef.current.rotation.x =
        Math.PI / 2 + elapsed * 0.16 - phase * 0.18;
    }
    if (satelliteRef.current) {
      satelliteRef.current.position.x =
        Math.cos(elapsed * 0.42 + phase) * (compact ? 2.6 : 4.8);
      satelliteRef.current.position.y =
        Math.sin(elapsed * 0.55 + phase * 0.7) * (compact ? 1.4 : 2.35);
      satelliteRef.current.rotation.x = elapsed * 0.32 + phase;
      satelliteRef.current.rotation.y = elapsed * 0.46 + phase * 0.5;
    }
    if (fieldMaterialRef.current) {
      fieldMaterialRef.current.opacity = 0.48 + warp * 0.24;
      fieldMaterialRef.current.size = 0.026 + warp * 0.024;
    }
    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = 0.22 + warp * 0.18;
    }
  });

  return (
    <>
      <group ref={fieldRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[fieldGeometry.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[fieldGeometry.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={fieldMaterialRef}
            size={0.026}
            sizeAttenuation
            transparent
            opacity={0.48}
            vertexColors
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[networkGeometry.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[networkGeometry.colors, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            ref={lineMaterialRef}
            transparent
            opacity={0.22}
            vertexColors
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </lineSegments>
      </group>

      <gridHelper
        ref={gridRef}
        args={[30, 42, "#00f3ff", "#123252"]}
        position={[0, -3.1, -5]}
      />

      <group ref={coreRef} position={[2.3, 0, -0.25]}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[coreGeometry.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[coreGeometry.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.035}
            sizeAttenuation
            transparent
            opacity={0.82}
            vertexColors
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
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
            toneMapped={false}
          />
        </mesh>

        <mesh
          ref={primaryRingRef}
          rotation={[Math.PI / 2, 0.2, 0.35]}
          scale={1.12}
        >
          <torusGeometry args={[1.78, 0.012, 6, 96]} />
          <meshBasicMaterial
            color="#ff0055"
            transparent
            opacity={0.42}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <mesh
          ref={secondaryRingRef}
          rotation={[0.35, Math.PI / 2, -0.25]}
          scale={1.05}
        >
          <torusGeometry args={[1.86, 0.009, 6, 96]} />
          <meshBasicMaterial
            color="#00f3ff"
            transparent
            opacity={0.32}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <mesh scale={0.76}>
          <sphereGeometry args={[1.65, 24, 24]} />
          <meshBasicMaterial
            color="#071b34"
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>
      </group>

      <mesh ref={satelliteRef} position={[-4.8, 2.2, -2.8]}>
        <octahedronGeometry args={[0.34, 0]} />
        <meshBasicMaterial
          color="#ff0055"
          wireframe
          transparent
          opacity={0.46}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </>
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
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 7.8], fov: 52, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
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
        <fog attach="fog" args={["#03050a", 7, 19]} />
        <CyberWorld reduceMotion={reduceMotion} />
        <AdaptiveDpr pixelated />
      </Canvas>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_38%,rgba(0,243,255,0.07),transparent_26%),radial-gradient(circle_at_24%_64%,rgba(255,0,85,0.045),transparent_24%),linear-gradient(90deg,rgba(3,4,6,0.42)_0%,rgba(3,4,6,0.08)_50%,rgba(3,4,6,0.42)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(0,243,255,0.32) 4px)",
        }}
      />
    </div>
  );
}
