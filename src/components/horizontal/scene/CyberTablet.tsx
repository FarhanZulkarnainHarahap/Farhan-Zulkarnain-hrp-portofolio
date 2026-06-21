"use client";

/* eslint-disable react-hooks/immutability */

import { Html, Text } from "@react-three/drei";
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

interface Project {
  id: number;
  title: string;
  desc: string;
  tech: string[];
  link?: string;
}

const fallbackProjects: Project[] = [
  {
    id: 1,
    title: "Backend Architecture",
    desc: "High-performance API node systems with strict indexing.",
    tech: ["Node.js", "PostgreSQL"],
  },
  {
    id: 2,
    title: "UI System Node",
    desc: "Cyberpunk responsive design libraries and theme engine.",
    tech: ["Next.js", "Tailwind"],
  },
];

const ProjectPlane = ({ index, project, position, velocityRef }: {
  index: number;
  project: Project;
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
        <planeGeometry args={[1.82, 1.08, 42, 22]} />
      </mesh>
      <Text position={[-0.76, 0.36, 0.08]} fontSize={0.11} color="#00ffcc" anchorX="left" anchorY="middle">
        0{index + 1}
      </Text>
      <Html transform center position={[0, -0.02, 0.12]} distanceFactor={3.35}>
        <article className="w-[270px] rounded-[22px] border border-blue-400/25 bg-black/58 p-5 text-left text-white shadow-[0_0_38px_rgba(59,130,246,0.14)] backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#00ffcc]">Project Node</p>
          <h3 className="mt-3 text-lg font-black uppercase leading-tight text-white">{project.title}</h3>
          <p className="mt-3 text-xs leading-5 text-slate-300">{project.desc}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-[#3b82f6]/35 bg-[#3b82f6]/15 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-blue-100"
              >
                {tech}
              </span>
            ))}
          </div>
        </article>
      </Html>
    </group>
  );
};

export const CyberTablet = ({
  velocityRef,
  projects = fallbackProjects,
}: {
  velocityRef: MutableRefObject<number>;
  projects?: Project[];
}) => {
  const tabletRef = useRef<THREE.Group>(null);
  const visibleProjects = projects.length ? projects.slice(0, 2) : fallbackProjects;

  useFrame((_, delta) => {
    if (!tabletRef.current) {
      return;
    }

    tabletRef.current.rotation.y = THREE.MathUtils.damp(tabletRef.current.rotation.y, -0.18, 3, delta);
    tabletRef.current.rotation.x = THREE.MathUtils.damp(tabletRef.current.rotation.x, 0.04 + velocityRef.current * 0.05, 4, delta);
  });

  return (
    <group ref={tabletRef} position={[12, 0, 0]}>
      <mesh>
        <boxGeometry args={[5.15, 3.02, 0.16]} />
        <meshPhysicalMaterial color="#020617" roughness={0.42} metalness={0.75} emissive="#0033aa" emissiveIntensity={0.2} />
      </mesh>

      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[4.78, 2.64]} />
        <meshBasicMaterial color="#001a66" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>

      <Text position={[-2.16, 1.16, 0.2]} fontSize={0.13} letterSpacing={0.18} color="#00f0ff" anchorX="left">
        LIVE PROJECT FEED
      </Text>

      {visibleProjects.map((project, index) => (
        <ProjectPlane
          key={project.id}
          index={index}
          project={project}
          velocityRef={velocityRef}
          position={[index === 0 ? -1.18 : 1.18, -0.08, 0.16]}
        />
      ))}

      <Text position={[0, -1.72, 0.2]} fontSize={0.18} letterSpacing={0.15} color="#00f0ff" anchorX="center">
        PROJECT TABLET / WARP SHADER
      </Text>
    </group>
  );
};
