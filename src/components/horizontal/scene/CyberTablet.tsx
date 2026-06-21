"use client";

/* eslint-disable react-hooks/immutability */

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  uniform float uVelocity;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float grid = sin((position.x + uTime * 0.55) * 9.0) * sin((position.y - uTime * 0.4) * 7.0);
    float scan = sin((uv.y + uTime * 0.35) * 28.0);
    transformed.z += (grid * 0.11 + scan * 0.025) * uVelocity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uVelocity;
  varying vec2 vUv;

  void main() {
    float border = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x) *
                   smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
    float scan = smoothstep(0.48, 0.5, fract(vUv.y * 14.0 + uVelocity * 0.12));
    vec3 color = mix(uColorA, uColorB, vUv.y + uVelocity * 0.14);
    float alpha = 0.46 * border + scan * 0.12;
    gl_FragColor = vec4(color, alpha);
  }
`;

const ProjectPlane = ({ index, title, position, velocityRef }: {
  index: number;
  title: string;
  position: [number, number, number];
  velocityRef: MutableRefObject<number>;
}) => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uVelocity: { value: 0 },
          uTime: { value: 0 },
          uColorA: { value: new THREE.Color(index % 2 ? "#0055ff" : "#00f0ff") },
          uColorB: { value: new THREE.Color("#001a66") },
        },
        vertexShader,
        fragmentShader,
      }),
    [index],
  );

  useFrame(({ clock }, delta) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uVelocity.value = THREE.MathUtils.damp(material.uniforms.uVelocity.value, velocityRef.current, 5, delta);
  });

  return (
    <group position={position}>
      <mesh material={material}>
        <planeGeometry args={[1.42, 0.86, 42, 22]} />
      </mesh>
      <Text position={[0, -0.03, 0.08]} fontSize={0.105} maxWidth={1.1} color="#ffffff" anchorX="center" anchorY="middle">
        {String(index + 1).padStart(2, "0")} / {title}
      </Text>
    </group>
  );
};

export const CyberTablet = ({ velocityRef }: { velocityRef: MutableRefObject<number> }) => {
  const tabletRef = useRef<THREE.Group>(null);
  const projects = ["Learnova", "Nexxora", "Market-Snap", "ReservA"];

  useFrame((_, delta) => {
    if (!tabletRef.current) {
      return;
    }

    tabletRef.current.rotation.y = THREE.MathUtils.damp(tabletRef.current.rotation.y, -0.18, 3, delta);
    tabletRef.current.rotation.x = THREE.MathUtils.damp(tabletRef.current.rotation.x, 0.04 + velocityRef.current * 0.05, 4, delta);
  });

  return (
    <group ref={tabletRef} position={[10, 0, 0]}>
      <mesh>
        <boxGeometry args={[4.7, 2.95, 0.16]} />
        <meshPhysicalMaterial color="#020617" roughness={0.42} metalness={0.75} emissive="#0033aa" emissiveIntensity={0.2} />
      </mesh>

      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[4.34, 2.56]} />
        <meshBasicMaterial color="#001a66" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>

      {projects.map((project, index) => (
        <ProjectPlane
          key={project}
          index={index}
          title={project}
          velocityRef={velocityRef}
          position={[
            index % 2 === 0 ? -1.08 : 1.08,
            index < 2 ? 0.62 : -0.62,
            0.16,
          ]}
        />
      ))}

      <Text position={[0, -1.72, 0.2]} fontSize={0.18} letterSpacing={0.15} color="#00f0ff" anchorX="center">
        PROJECT TABLET / WARP SHADER
      </Text>
    </group>
  );
};
