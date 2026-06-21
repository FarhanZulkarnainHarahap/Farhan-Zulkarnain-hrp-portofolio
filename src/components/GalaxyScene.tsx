"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type GalaxySceneProps = {
  className?: string;
  count?: number;
  interactive?: boolean;
};

type Connection = [number, number];

const clampNodeCount = (count = 700) => Math.min(800, Math.max(500, count));

const createNodeTexture = () => {
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

  // Neon blue radial sprite so THREE.Points render as soft glowing nodes.
  const gradient = context.createRadialGradient(48, 48, 0, 48, 48, 48);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.14, "rgba(0,240,255,0.95)");
  gradient.addColorStop(0.42, "rgba(0,85,255,0.42)");
  gradient.addColorStop(0.74, "rgba(0,51,170,0.14)");
  gradient.addColorStop(1, "rgba(0,51,170,0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, 96, 96);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
};

const buildConnections = (positions: Float32Array, count: number) => {
  const connections: Connection[] = [];
  const maxConnections = Math.floor(count * 1.55);
  const maxDistance = 1.05;
  const maxDistanceSq = maxDistance * maxDistance;

  // Connect nearby nodes once, then update the line vertex positions every frame.
  for (let i = 0; i < count; i += 1) {
    let localLinks = 0;
    const ix = positions[i * 3];
    const iy = positions[i * 3 + 1];
    const iz = positions[i * 3 + 2];

    for (let j = i + 1; j < count; j += 1) {
      const jx = positions[j * 3];
      const jy = positions[j * 3 + 1];
      const jz = positions[j * 3 + 2];
      const dx = ix - jx;
      const dy = iy - jy;
      const dz = iz - jz;

      if (dx * dx + dy * dy + dz * dz < maxDistanceSq) {
        connections.push([i, j]);
        localLinks += 1;
      }

      if (localLinks >= 3 || connections.length >= maxConnections) {
        break;
      }
    }

    if (connections.length >= maxConnections) {
      break;
    }
  }

  return connections;
};

const CyberDataNetwork = ({ count = 700, interactive = false }: { count?: number; interactive?: boolean }) => {
  const nodeCount = clampNodeCount(count);
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const scrollRef = useRef(0);

  const nodeTexture = useMemo(() => createNodeTexture(), []);

  const network = useMemo(() => {
    const basePositions = new Float32Array(nodeCount * 3);
    const positions = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);
    const velocities = new Float32Array(nodeCount * 3);
    const cyan = new THREE.Color("#00f0ff");
    const blue = new THREE.Color("#0055ff");
    const deepBlue = new THREE.Color("#0033aa");

    // Node initialization: spread points through a wide shallow 3D data field.
    for (let i = 0; i < nodeCount; i += 1) {
      const index = i * 3;
      const radius = Math.random() ** 0.72 * 5.2;
      const angle = Math.random() * Math.PI * 2;
      const layer = (Math.random() - 0.5) * 3.4;

      basePositions[index] = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.2;
      basePositions[index + 1] = (Math.random() - 0.5) * 3.4;
      basePositions[index + 2] = Math.sin(angle) * radius * 0.62 + layer;

      positions[index] = basePositions[index];
      positions[index + 1] = basePositions[index + 1];
      positions[index + 2] = basePositions[index + 2];

      velocities[index] = (Math.random() - 0.5) * 0.18;
      velocities[index + 1] = (Math.random() - 0.5) * 0.16;
      velocities[index + 2] = (Math.random() - 0.5) * 0.12;

      // Color logic: mostly cyan neon, mixed with deep blue for depth.
      const color = cyan.clone().lerp(blue, Math.random() * 0.48).lerp(deepBlue, Math.random() * 0.22);
      if (Math.random() > 0.86) {
        color.lerp(new THREE.Color("#ffffff"), 0.35);
      }

      colors[index] = color.r;
      colors[index + 1] = color.g;
      colors[index + 2] = color.b;
    }

    const connections = buildConnections(basePositions, nodeCount);
    const linePositions = new Float32Array(connections.length * 6);

    return { basePositions, positions, colors, velocities, connections, linePositions };
  }, [nodeCount]);

  useEffect(() => {
    if (!interactive) {
      return;
    }

    const updateScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollRef.current = window.scrollY / maxScroll;
    };

    const updateMouse = (event: PointerEvent) => {
      // Mouse hover interaction: convert screen coordinates into a loose scene-space target.
      mouseRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(event.clientY / window.innerHeight - 0.5) * 2;
      mouseRef.current.active = true;
    };

    const clearMouse = () => {
      mouseRef.current.active = false;
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    window.addEventListener("pointermove", updateMouse, { passive: true });
    window.addEventListener("pointerleave", clearMouse);

    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      window.removeEventListener("pointermove", updateMouse);
      window.removeEventListener("pointerleave", clearMouse);
    };
  }, [interactive]);

  useFrame(({ camera, clock }, delta) => {
    const elapsed = clock.elapsedTime;
    const { basePositions, positions, velocities, connections, linePositions } = network;
    const mouseX = mouseRef.current.x * 4.2;
    const mouseY = mouseRef.current.y * 2.35;
    const mouseActive = mouseRef.current.active;
    const scrollProgress = scrollRef.current;

    // Idle animation: slow organic drift with particles returning toward their base data grid.
    for (let i = 0; i < nodeCount; i += 1) {
      const index = i * 3;
      const driftX = Math.sin(elapsed * 0.34 + i * 0.37) * 0.16 + velocities[index] * 0.1;
      const driftY = Math.cos(elapsed * 0.29 + i * 0.19) * 0.12 + velocities[index + 1] * 0.1;
      const driftZ = Math.sin(elapsed * 0.22 + i * 0.27) * 0.18 + velocities[index + 2] * 0.1;
      let targetX = basePositions[index] + driftX;
      let targetY = basePositions[index + 1] + driftY;
      let targetZ = basePositions[index + 2] + driftZ;

      // Mouse hover attraction: nearby particles gently lerp toward the pointer target.
      if (mouseActive) {
        const dx = mouseX - positions[index];
        const dy = mouseY - positions[index + 1];
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq < 2.65) {
          const attraction = (1 - distanceSq / 2.65) * 0.72;
          targetX += dx * attraction;
          targetY += dy * attraction;
          targetZ += Math.sin(elapsed + i) * attraction * 0.18;
        }
      }

      positions[index] = THREE.MathUtils.lerp(positions[index], targetX, 0.026 + delta * 0.35);
      positions[index + 1] = THREE.MathUtils.lerp(positions[index + 1], targetY, 0.026 + delta * 0.35);
      positions[index + 2] = THREE.MathUtils.lerp(positions[index + 2], targetZ, 0.022 + delta * 0.28);
    }

    // Edge update: line segment endpoints follow the animated node positions.
    connections.forEach(([a, b], lineIndex) => {
      const ai = a * 3;
      const bi = b * 3;
      const li = lineIndex * 6;

      linePositions[li] = positions[ai];
      linePositions[li + 1] = positions[ai + 1];
      linePositions[li + 2] = positions[ai + 2];
      linePositions[li + 3] = positions[bi];
      linePositions[li + 4] = positions[bi + 1];
      linePositions[li + 5] = positions[bi + 2];
    });

    const pointAttribute = pointsRef.current?.geometry.getAttribute("position");
    const lineAttribute = linesRef.current?.geometry.getAttribute("position");
    if (pointAttribute) {
      pointAttribute.needsUpdate = true;
    }
    if (lineAttribute) {
      lineAttribute.needsUpdate = true;
    }

    // Scroll-linked animation: orbit and depth shift follow page progress.
    if (groupRef.current) {
      groupRef.current.rotation.y = elapsed * 0.035 + scrollProgress * Math.PI * 0.68;
      groupRef.current.rotation.x = -0.14 + scrollProgress * 0.32;
      groupRef.current.position.z = -scrollProgress * 1.25;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseRef.current.x * 0.34, 0.045);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.16 + mouseRef.current.y * 0.16, 0.045);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 6.2 - scrollProgress * 0.72, 0.035);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef} rotation={[-0.14, 0, 0.05]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[network.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[network.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={nodeTexture ?? undefined}
          vertexColors
          transparent
          alphaTest={0.01}
          depthWrite={false}
          opacity={0.9}
          size={0.052}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[network.linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#0033aa"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
};

export default function GalaxyScene({ className = "", count, interactive = false }: GalaxySceneProps) {
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className || "absolute inset-0"}`}>
      <Canvas
        camera={{ position: [0, 0.16, 6.2], fov: 62 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      >
        <CyberDataNetwork count={count} interactive={interactive} />
      </Canvas>
    </div>
  );
}
