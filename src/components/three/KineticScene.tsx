"use client";
import { Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  MaterialProvider,
  updateSignals,
  useMaterials,
  type Quality,
} from "./materials/SystemMaterials";
import SystemCore from "./core/SystemCore";
import CapabilityNode from "./nodes/CapabilityNode";
import ProjectNode from "./nodes/ProjectNode";
import DataPaths from "./environment/DataPaths";
import CodeArchitecture from "./environment/CodeArchitecture";
import PortraitRig from "./environment/PortraitRig";
import ScrollRunner from "./environment/ScrollRunner";
import CameraRig from "./camera/CameraRig";
import { CAPABILITIES } from "./controllers/layouts";
import { useScene } from "@/components/kinetic/SceneState";
function Contents({
  quality,
  onReady,
}: {
  quality: Quality;
  onReady: () => void;
}) {
  useEffect(onReady, [onReady]);
  const material = useMaterials();
  const { active } = useScene();
  useFrame(({ clock }) => {
    updateSignals(material, clock.elapsedTime, Boolean(active));
  });
  return (
    <>
      <ambientLight intensity={1.8} />
      <directionalLight position={[3, 5, 6]} intensity={3} color="#b5d0ff" />
      <pointLight position={[-3, 1, 3]} intensity={12} color="#22D3EE" />
      <pointLight position={[3, -1, -1]} intensity={6} color="#8B5CF6" />
      <CameraRig quality={quality} />
      <SystemCore />
      {CAPABILITIES.slice(0, quality === "low" ? 3 : 5).map((kind, index) => (
        <CapabilityNode key={kind} kind={kind} index={index} />
      ))}
      <ProjectNode />
      <PortraitRig />
      <ScrollRunner quality={quality} />
      <DataPaths quality={quality} />
      <CodeArchitecture quality={quality} />
    </>
  );
}
export default function KineticScene({
  quality,
  running,
  onReady,
  onFailure,
}: {
  quality: Quality;
  running: boolean;
  onReady: () => void;
  onFailure: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.35, 9], fov: 42 }}
      dpr={quality === "high" ? [1, 1.5] : 1}
      frameloop={running ? "always" : "never"}
      gl={{
        alpha: true,
        antialias: quality !== "low",
        powerPreference: "low-power",
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", onFailure, {
          once: true,
        });
      }}
    >
      <Suspense fallback={null}>
        <MaterialProvider>
          <Contents quality={quality} onReady={onReady} />
        </MaterialProvider>
      </Suspense>
    </Canvas>
  );
}
