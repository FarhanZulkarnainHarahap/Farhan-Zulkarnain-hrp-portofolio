"use client";

/* eslint-disable react-hooks/immutability */

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import type {
  ScenePointerRef,
  SceneProgressRef,
  ViewportProfile,
} from "./scene-types";

type CameraRigProps = {
  progressRef: SceneProgressRef;
  pointerRef: ScenePointerRef;
  profile: ViewportProfile;
  reducedMotion: boolean;
};

type CameraKeyframe = {
  progress: number;
  position: THREE.Vector3;
  target: THREE.Vector3;
  roll: number;
};

const desktopFrames: CameraKeyframe[] = [
  { progress: 0, position: new THREE.Vector3(0, 0.15, 7.4), target: new THREE.Vector3(0, 0, 0), roll: 0 },
  { progress: 0.15, position: new THREE.Vector3(0.7, 0.3, 6.65), target: new THREE.Vector3(0.2, 0, 0), roll: -0.015 },
  { progress: 0.27, position: new THREE.Vector3(3.1, 0.65, 5.8), target: new THREE.Vector3(-1.65, 0.05, 0), roll: -0.035 },
  { progress: 0.35, position: new THREE.Vector3(3.65, 1.2, 5.2), target: new THREE.Vector3(-1.2, 0.35, -0.4), roll: -0.055 },
  { progress: 0.405, position: new THREE.Vector3(-2.2, 1.65, 3.3), target: new THREE.Vector3(-3.2, 1.25, -1.2), roll: 0.045 },
  { progress: 0.455, position: new THREE.Vector3(2.1, 1.25, 2.15), target: new THREE.Vector3(3.0, 0.9, -2.15), roll: -0.055 },
  { progress: 0.505, position: new THREE.Vector3(-1.85, -0.65, 1.1), target: new THREE.Vector3(-2.8, -1.2, -3.2), roll: 0.045 },
  { progress: 0.54, position: new THREE.Vector3(1.8, -0.55, 0.7), target: new THREE.Vector3(2.8, -0.85, -3.85), roll: -0.035 },
  { progress: 0.55, position: new THREE.Vector3(1.65, -0.25, 4.8), target: new THREE.Vector3(1.9, -0.2, -1.3), roll: 0 },
  { progress: 0.66, position: new THREE.Vector3(-2.15, 0.35, 5.4), target: new THREE.Vector3(-0.8, 0, -1.4), roll: 0.025 },
  { progress: 0.76, position: new THREE.Vector3(2.45, -0.45, 5.15), target: new THREE.Vector3(0.9, -0.15, -1.7), roll: -0.025 },
  { progress: 0.85, position: new THREE.Vector3(-1.35, 0.3, 5.9), target: new THREE.Vector3(0, 0, -0.2), roll: 0.015 },
  { progress: 1, position: new THREE.Vector3(0, 0.08, 6.85), target: new THREE.Vector3(0, 0, 0), roll: 0 },
];

const tabletFrames: CameraKeyframe[] = desktopFrames.map((frame) => ({
  ...frame,
  position: new THREE.Vector3(
    frame.position.x * 0.58,
    frame.position.y * 0.66,
    Math.max(frame.position.z, 4.5) + 0.35,
  ),
  target: new THREE.Vector3(
    frame.target.x * 0.68,
    frame.target.y * 0.72,
    frame.target.z * 0.74,
  ),
  roll: frame.roll * 0.4,
}));

const mobileFrames: CameraKeyframe[] = [
  { progress: 0, position: new THREE.Vector3(0, 0.1, 8.2), target: new THREE.Vector3(0, 0, 0), roll: 0 },
  { progress: 0.15, position: new THREE.Vector3(0.25, 0.2, 7.8), target: new THREE.Vector3(0.2, 0, 0), roll: 0 },
  { progress: 0.35, position: new THREE.Vector3(1.05, 0.45, 6.9), target: new THREE.Vector3(0.75, 0.1, -0.5), roll: -0.01 },
  { progress: 0.45, position: new THREE.Vector3(-0.9, 0.55, 6.2), target: new THREE.Vector3(-0.8, 0.35, -1.6), roll: 0.01 },
  { progress: 0.55, position: new THREE.Vector3(0.8, -0.15, 6.6), target: new THREE.Vector3(0.7, -0.1, -1.1), roll: 0 },
  { progress: 0.7, position: new THREE.Vector3(-0.75, 0.1, 7.0), target: new THREE.Vector3(-0.5, 0, -1.2), roll: 0 },
  { progress: 0.85, position: new THREE.Vector3(0.45, 0.15, 7.3), target: new THREE.Vector3(0, 0, -0.2), roll: 0 },
  { progress: 1, position: new THREE.Vector3(0, 0.08, 7.8), target: new THREE.Vector3(0, 0, 0), roll: 0 },
];

function findFramePair(frames: CameraKeyframe[], progress: number) {
  for (let index = 0; index < frames.length - 1; index += 1) {
    const from = frames[index];
    const to = frames[index + 1];
    if (progress <= to.progress) return { from, to };
  }

  const last = frames[frames.length - 1];
  return { from: last, to: last };
}

export default function CameraRig({
  progressRef,
  pointerRef,
  profile,
  reducedMotion,
}: CameraRigProps) {
  const { camera } = useThree();
  const working = useMemo(
    () => ({
      position: new THREE.Vector3(),
      target: new THREE.Vector3(),
      pointer: new THREE.Vector2(),
      looker: new THREE.Object3D(),
    }),
    [],
  );

  useFrame((_, delta) => {
    const progress = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const frames = profile === "mobile" ? mobileFrames : profile === "tablet" ? tabletFrames : desktopFrames;
    const { from, to } = findFramePair(frames, progress);
    const frameDistance = Math.max(to.progress - from.progress, Number.EPSILON);
    const rawMix = THREE.MathUtils.clamp((progress - from.progress) / frameDistance, 0, 1);
    const mix = rawMix * rawMix * (3 - 2 * rawMix);

    working.position.lerpVectors(from.position, to.position, mix);
    working.target.lerpVectors(from.target, to.target, mix);

    const pointerStrength = reducedMotion ? 0 : profile === "desktop" ? 0.18 : 0.07;
    working.pointer.lerp(pointerRef.current, 1 - Math.exp(-delta * 3.2));
    working.position.x += working.pointer.x * pointerStrength;
    working.position.y += working.pointer.y * pointerStrength * 0.55;
    working.target.x += working.pointer.x * pointerStrength * 0.18;
    working.target.y += working.pointer.y * pointerStrength * 0.12;

    const damping = reducedMotion ? 1 : 1 - Math.exp(-delta * 3.8);
    camera.position.lerp(working.position, damping);
    working.looker.position.copy(camera.position);
    working.looker.lookAt(working.target);
    working.looker.rotateZ(THREE.MathUtils.lerp(from.roll, to.roll, mix));
    camera.quaternion.slerp(working.looker.quaternion, damping);

    const targetFov = profile === "mobile" ? 51 : profile === "tablet" ? 47 : 43;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, damping);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
