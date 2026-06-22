"use client";

/* eslint-disable react-hooks/immutability */

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 680;
const CONNECTION_DISTANCE = 1.65;
const MAX_CONNECTIONS_PER_NODE = 5;

const seededRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const getScrollProgress = () => {
  const horizontalStage = document.querySelector<HTMLElement>("[data-horizontal-stage]");
  const isHorizontalStage = window.matchMedia("(min-width: 1024px)").matches && horizontalStage;

  if (isHorizontalStage) {
    const scrollableWidth = horizontalStage.scrollWidth - horizontalStage.clientWidth;
    if (scrollableWidth <= 0) {
      return 0;
    }

    return Math.min(Math.max(horizontalStage.scrollLeft / scrollableWidth, 0), 1);
  }

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) {
    return 0;
  }

  return Math.min(Math.max(window.scrollY / scrollableHeight, 0), 1);
};

const CyberDataNetwork = () => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  // Initialization: create stable GPU buffers for nodes, animated positions, and nearby edge pairs.
  const { basePositions, livePositions, pointGeometry, lineGeometry, connections } = useMemo(() => {
    const base = new Float32Array(PARTICLE_COUNT * 3);
    const live = new Float32Array(PARTICLE_COUNT * 3);

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const i3 = index * 3;
      const angle = seededRandom(index + 17) * Math.PI * 2;
      const radius = 2.2 + seededRandom(index + 31) * 8.4;
      const spiral = (index / PARTICLE_COUNT) * Math.PI * 6;

      base[i3] = Math.cos(angle + spiral) * radius;
      base[i3 + 1] = (seededRandom(index + 73) - 0.5) * 8.2;
      base[i3 + 2] = Math.sin(angle + spiral) * radius - 3.6 - seededRandom(index + 111) * 3.4;

      live[i3] = base[i3];
      live[i3 + 1] = base[i3 + 1];
      live[i3 + 2] = base[i3 + 2];
    }

    const edgePairs: Array<[number, number]> = [];

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      let links = 0;
      const ix = base[index * 3];
      const iy = base[index * 3 + 1];
      const iz = base[index * 3 + 2];

      for (let target = index + 1; target < PARTICLE_COUNT && links < MAX_CONNECTIONS_PER_NODE; target += 1) {
        const tx = base[target * 3];
        const ty = base[target * 3 + 1];
        const tz = base[target * 3 + 2];
        const distance = Math.hypot(ix - tx, iy - ty, iz - tz);

        if (distance < CONNECTION_DISTANCE) {
          edgePairs.push([index, target]);
          links += 1;
        }
      }
    }

    const points = new THREE.BufferGeometry();
    points.setAttribute("position", new THREE.BufferAttribute(live, 3));

    const linePositions = new Float32Array(edgePairs.length * 2 * 3);
    const lines = new THREE.BufferGeometry();
    lines.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    return {
      basePositions: base,
      livePositions: live,
      pointGeometry: points,
      lineGeometry: lines,
      connections: edgePairs,
    };
  }, []);

  useEffect(() => {
    const updateMouse = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const updateScroll = () => {
      scrollRef.current = getScrollProgress();
    };

    updateScroll();
    const horizontalStage = document.querySelector<HTMLElement>("[data-horizontal-stage]");

    window.addEventListener("mousemove", updateMouse, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    horizontalStage?.addEventListener("scroll", updateScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", updateMouse);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      horizontalStage?.removeEventListener("scroll", updateScroll);
    };
  }, []);

  useFrame(({ camera, clock, viewport }, delta) => {
    if (!groupRef.current || !pointsRef.current || !linesRef.current) {
      return;
    }

    const time = clock.elapsedTime;
    const mouseWorldX = mouseRef.current.x * viewport.width * 0.5;
    const mouseWorldY = mouseRef.current.y * viewport.height * 0.5;

    // Scroll-linked animation: orbit and depth shift follow vertical page progress.
    const targetRotationY = scrollRef.current * Math.PI * 0.75;
    const targetRotationX = -0.12 + scrollRef.current * 0.24;
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotationY, 1.8, delta);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotationX, 1.8, delta);
    groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, scrollRef.current * 2.2, 1.6, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 9.8 - scrollRef.current * 1.2, 1.6, delta);

    // Idle animation + hover attraction: each node drifts slowly, then nearby nodes lerp toward the cursor.
    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const i3 = index * 3;
      const baseX = basePositions[i3];
      const baseY = basePositions[i3 + 1];
      const baseZ = basePositions[i3 + 2];
      const driftX = Math.sin(time * 0.18 + index * 0.37) * 0.16;
      const driftY = Math.cos(time * 0.14 + index * 0.23) * 0.13;
      const driftZ = Math.sin(time * 0.12 + index * 0.19) * 0.11;
      const dx = baseX - mouseWorldX;
      const dy = baseY - mouseWorldY;
      const mouseDistance = Math.hypot(dx, dy);
      const influence = Math.max(0, 1 - mouseDistance / 2.7);

      const targetX = baseX + driftX + (mouseWorldX - baseX) * influence * 0.18;
      const targetY = baseY + driftY + (mouseWorldY - baseY) * influence * 0.18;
      const targetZ = baseZ + driftZ + influence * 0.75;

      livePositions[i3] = THREE.MathUtils.lerp(livePositions[i3], targetX, 0.035);
      livePositions[i3 + 1] = THREE.MathUtils.lerp(livePositions[i3 + 1], targetY, 0.035);
      livePositions[i3 + 2] = THREE.MathUtils.lerp(livePositions[i3 + 2], targetZ, 0.035);
    }

    // Edge update: reuse fixed nearby pairs while copying their animated node positions into one line buffer.
    const lineAttribute = linesRef.current.geometry.attributes.position;
    const linePositions = lineAttribute.array as Float32Array;
    connections.forEach(([from, to], edgeIndex) => {
      const offset = edgeIndex * 6;
      const fromIndex = from * 3;
      const toIndex = to * 3;

      linePositions[offset] = livePositions[fromIndex];
      linePositions[offset + 1] = livePositions[fromIndex + 1];
      linePositions[offset + 2] = livePositions[fromIndex + 2];
      linePositions[offset + 3] = livePositions[toIndex];
      linePositions[offset + 4] = livePositions[toIndex + 1];
      linePositions[offset + 5] = livePositions[toIndex + 2];
    });

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    lineAttribute.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[0, 0, -1.8]}>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#0033aa" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>

      <points ref={pointsRef} geometry={pointGeometry}>
        <pointsMaterial
          color="#00f0ff"
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.92}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export default function AntiGravity() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] opacity-95">
      <Canvas
        camera={{ position: [0, 0, 9.8], fov: 54 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <CyberDataNetwork />
      </Canvas>
    </div>
  );
}
