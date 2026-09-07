"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useScene } from "./SceneState";

function Architecture() {
  const group = useRef<THREE.Group>(null);
  const flow = useRef<THREE.Mesh>(null);
  const { active, mode } = useScene();
  const colors = useMemo(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      primary: style.getPropertyValue("--primary").trim(),
      secondary: style.getPropertyValue("--secondary").trim(),
      accent: style.getPropertyValue("--accent").trim(),
    };
  }, []);
  const nodes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        if (mode === "trajectory")
          return new THREE.Vector3(
            (i - 5.5) * 0.45,
            Math.sin(i * 0.7) * 0.5,
            Math.cos(i * 0.7) * 0.5,
          );
        const angle = (i / 6) * Math.PI * 2;
        const radius = (i < 6 ? 2.3 : 1.35) * (mode === "signal" ? 0.55 : 1);
        return new THREE.Vector3(
          Math.cos(angle) * radius,
          i < 6 ? -0.6 : 0.8,
          Math.sin(angle) * radius,
        );
      }),
    [mode],
  );
  const selectedNode = active
    ? Array.from(active).reduce(
        (sum, character) => sum + character.charCodeAt(0),
        0,
      ) % nodes.length
    : -1;
  useFrame((state, delta) => {
    if (!group.current) return;
    const target =
      mode === "trajectory" ? 0.8 : mode === "signal" ? -0.2 : 0.25;
    group.current.rotation.y += delta * (active ? 0.13 : 0.045);
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      target + state.pointer.y * 0.06,
      3,
      delta,
    );
    if (flow.current) {
      const t = (state.clock.elapsedTime * 0.22) % 1;
      flow.current.position
        .copy(nodes[selectedNode < 0 ? 2 : selectedNode])
        .multiplyScalar(mode === "signal" ? 1 - t : t);
    }
  });
  return (
    <group ref={group} rotation={[0.25, 0.3, -0.13]}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, (i - 1) * 0.27, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.72, 0.028, 6, 6]} />
            <meshBasicMaterial color={colors.secondary} />
          </mesh>
        </group>
      ))}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial color={colors.primary} wireframe />
      </mesh>
      {nodes.map((node, i) => (
        <group key={i}>
          <Line
            points={[[0, 0, 0], [node.x * 0.6, node.y, node.z * 0.6], node]}
            color={i === selectedNode ? colors.secondary : colors.primary}
            transparent
            opacity={i === selectedNode ? 1 : 0.38}
            lineWidth={1}
          />
          <mesh position={node} rotation={[0, Math.PI / 4, 0]}>
            <octahedronGeometry args={[i < 6 ? 0.115 : 0.08, 0]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? colors.accent : colors.secondary}
              wireframe
            />
          </mesh>
        </group>
      ))}
      {[2.4, 3].map((radius) => (
        <mesh
          key={radius}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, -0.9, 0]}
        >
          <torusGeometry args={[radius, 0.007, 3, 80]} />
          <meshBasicMaterial
            color={colors.primary}
            transparent
            opacity={0.25}
          />
        </mesh>
      ))}
      <mesh ref={flow}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color={colors.secondary} />
      </mesh>
      <gridHelper
        args={[8, 16, colors.primary, colors.primary]}
        position={[0, -1.1, 0]}
        material-transparent
        material-opacity={0.08}
      />
    </group>
  );
}
export default function SpatialScene({ running }: { running: boolean }) {
  return (
    <Canvas
      camera={{ position: [4, 3, 5], fov: 43 }}
      dpr={[1, 1.5]}
      frameloop={running ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <Architecture />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.4}
        minPolarAngle={0.5}
        maxPolarAngle={1.8}
      />
    </Canvas>
  );
}
