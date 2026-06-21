"use client";

import { Html, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const fallbackDocuments: string[] = [
  "Full-Stack Developer Certification",
  "UI/UX Advanced Engineering Credential",
  "Verified CV & Tech Stack Portfolio Node",
];

export const GlassWhiteboard = ({ documents = fallbackDocuments }: { documents?: string[] }) => {
  const boardRef = useRef<THREE.Group>(null);
  const visibleDocuments = documents.length ? documents.slice(0, 3) : fallbackDocuments;

  useFrame((_, delta) => {
    if (!boardRef.current) {
      return;
    }

    boardRef.current.rotation.y = THREE.MathUtils.damp(boardRef.current.rotation.y, 0.18, 3, delta);
    boardRef.current.rotation.x = THREE.MathUtils.damp(boardRef.current.rotation.x, -0.04, 3, delta);
  });

  return (
    <group ref={boardRef} position={[24, 0, 0]}>
      <mesh>
        <boxGeometry args={[4.9, 2.8, 0.06]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transparent
          opacity={0.22}
          roughness={0.82}
          metalness={0.08}
          transmission={0.82}
          thickness={0.55}
          ior={1.35}
          emissive="#0055ff"
          emissiveIntensity={0.08}
        />
      </mesh>

      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[4.7, 2.6]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.055} blending={THREE.AdditiveBlending} />
      </mesh>

      <Text position={[-1.65, 0.78, 0.15]} fontSize={0.22} color="#ffffff" anchorX="left">
        CREDENTIAL & ASSETS
      </Text>

      <Html transform center position={[0, 0.03, 0.16]} rotation={[0, 0, 0]} distanceFactor={3.4}>
        <div className="w-[520px] rounded-[28px] border border-white/10 bg-black/35 p-6 text-white shadow-[0_0_54px_rgba(0,240,255,0.13)] backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-[0.42em] text-[#00ffcc]">Verified Documents</p>
            <span className="rounded-full border border-[#3b82f6]/35 bg-[#3b82f6]/15 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-blue-100">
              {visibleDocuments.length} Assets
            </span>
          </div>
          <div className="space-y-3">
            {visibleDocuments.map((document, index) => (
              <div
                key={document}
                className="flex items-center gap-4 rounded-2xl border border-[#00ffcc]/18 bg-[#001a66]/20 px-4 py-3"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full border border-[#00ffcc]/35 bg-[#00ffcc]/10 text-[10px] font-black text-[#00ffcc]">
                  0{index + 1}
                </span>
                <span className="text-sm font-black uppercase tracking-[0.08em] text-white">{document}</span>
              </div>
            ))}
          </div>
        </div>
      </Html>

      {visibleDocuments.map((document, index) => (
        <mesh key={document} position={[-1.98 + index * 1.98, -1.0, 0.14]}>
          <sphereGeometry args={[0.06, 18, 18]} />
          <meshBasicMaterial color={index === 1 ? "#3b82f6" : "#00ffcc"} transparent opacity={0.85} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}

      <Text position={[0, -1.66, 0.15]} fontSize={0.16} letterSpacing={0.16} color="#00f0ff" anchorX="center">
        DOCUMENT BOARD / GLASSMORPHIC NODE
      </Text>
    </group>
  );
};
