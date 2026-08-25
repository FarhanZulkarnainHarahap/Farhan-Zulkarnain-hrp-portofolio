"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type {
  SceneProgressRef,
  SceneProject,
  ViewportProfile,
} from "./scene-types";
import { smoothstep } from "./scene-types";

type ProjectSceneProps = {
  projects: SceneProject[];
  activeIndex: number;
  progressRef: SceneProgressRef;
  profile: ViewportProfile;
  reducedMotion: boolean;
};

function ProjectPlane({
  project,
  index,
  activeIndex,
  progressRef,
  profile,
  reducedMotion,
}: {
  project: SceneProject;
  index: number;
} & Omit<ProjectSceneProps, "projects">) {
  const loadedTexture = useTexture(project.imageUrl);
  const texture = useMemo(() => {
    const clonedTexture = loadedTexture.clone();
    clonedTexture.colorSpace = THREE.SRGBColorSpace;
    clonedTexture.anisotropy = Math.min(4, clonedTexture.anisotropy || 1);
    clonedTexture.needsUpdate = true;
    return clonedTexture;
  }, [loadedTexture]);
  const groupRef = useRef<THREE.Group>(null);
  const imageMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const frameMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const image = texture.image as { width?: number; height?: number } | undefined;
  const aspect = Math.min(2, Math.max(1.2, (image?.width ?? 16) / (image?.height ?? 10)));
  const width = profile === "mobile" ? 3.65 : profile === "tablet" ? 4.25 : 4.8;
  const height = width / aspect;

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const imageMaterial = imageMaterialRef.current;
    const frameMaterial = frameMaterialRef.current;
    if (!group || !imageMaterial || !frameMaterial) return;

    const progress = progressRef.current;
    const sceneVisibility =
      smoothstep(progress, 0.52, 0.57) * (1 - smoothstep(progress, 0.83, 0.88));
    const offset = index - activeIndex;
    const isActive = offset === 0;
    const side = index % 2 === 0 ? 1 : -1;
    const compact = profile === "mobile";
    const targetX = isActive ? side * (compact ? 0.45 : 1.45) : offset * (compact ? 3.9 : 5.2);
    const targetY = isActive ? (compact ? 0.45 : 0.05) : -Math.abs(offset) * 0.35;
    const targetZ = isActive ? -1.2 : -2.8 - Math.abs(offset) * 0.7;
    const targetScale = isActive ? 1 : 0.72;
    const damping = reducedMotion ? 1 : 1 - Math.exp(-delta * 4.5);
    const time = reducedMotion ? 0 : state.clock.elapsedTime;

    group.position.x = THREE.MathUtils.lerp(group.position.x, targetX, damping);
    group.position.y = THREE.MathUtils.lerp(
      group.position.y,
      targetY + Math.sin(time * 0.45 + index) * (isActive ? 0.06 : 0.02),
      damping,
    );
    group.position.z = THREE.MathUtils.lerp(group.position.z, targetZ, damping);
    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      isActive ? side * -0.08 : offset * -0.22,
      damping,
    );
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, isActive ? side * 0.012 : 0, damping);
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, damping));

    const opacity = sceneVisibility * (isActive ? 0.62 : 0.13);
    imageMaterial.opacity = opacity;
    frameMaterial.opacity = sceneVisibility * (isActive ? 0.34 : 0.08);
    group.visible = opacity > 0.005;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.045]}>
        <planeGeometry args={[width + 0.14, height + 0.14]} />
        <meshBasicMaterial
          ref={frameMaterialRef}
          color={index % 2 === 0 ? "#58dfff" : "#a77bff"}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={imageMaterialRef}
          map={texture}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -height / 2 - 0.1, 0.02]}>
        <planeGeometry args={[width * 0.34, 0.018]} />
        <meshBasicMaterial
          color={index % 2 === 0 ? "#80edff" : "#c3a6ff"}
          transparent
          opacity={0.75}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default function ProjectScene({
  projects,
  activeIndex,
  progressRef,
  profile,
  reducedMotion,
}: ProjectSceneProps) {
  const visibleProjects = useMemo(() => {
    if (!projects.length) return [];
    const radius = profile === "desktop" ? 1 : 0;
    return projects
      .map((project, index) => ({ project, index }))
      .filter(({ index }) => Math.abs(index - activeIndex) <= radius);
  }, [activeIndex, profile, projects]);

  return (
    <group>
      {visibleProjects.map(({ project, index }) => (
        <ProjectPlane
          key={project.id}
          project={project}
          index={index}
          activeIndex={activeIndex}
          progressRef={progressRef}
          profile={profile}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}
