"use client";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import { useScene } from "@/components/kinetic/SceneState";
import { activeCapability } from "../controllers/layouts";
import type { Quality } from "../materials/SystemMaterials";
export default function CameraRig({ quality }: { quality: Quality }) {
  const { mode, active, selected } = useScene();
  useFrame(({ camera, pointer, size }, dt) => {
    const d = Math.min(dt, 0.05),
      movement = quality === "low" ? 0.04 : 0.22;
    const focus =
      activeCapability(active) === "backend"
        ? 0.2
        : activeCapability(active) === "frontend"
          ? -0.2
          : 0;
    camera.position.x = MathUtils.damp(
      camera.position.x,
      pointer.x * movement +
        focus +
        (mode === "project" ? ((selected % 3) - 1) * 0.08 : 0),
      3,
      d,
    );
    const progress =
      window.scrollY /
      Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    camera.position.y = MathUtils.damp(
      camera.position.y,
      0.35 +
        progress * 0.12 +
        pointer.y * movement +
        (mode === "trajectory" ? 0.2 : 0),
      3,
      d,
    );
    const ratio = size.width / Math.max(size.height, 1);
    camera.position.z = MathUtils.damp(
      camera.position.z,
      Math.max(7.6, 7.6 / ratio) + (mode === "identity" ? -0.4 : 0),
      3,
      d,
    );
    camera.lookAt(0, 0, 0);
  });
  return null;
}
