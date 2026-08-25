"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import CameraRig from "./CameraRig";
import FloatingNodes from "./FloatingNodes";
import FZCore from "./FZCore";
import ParticleField from "./ParticleField";
import ProjectScene from "./ProjectScene";
import type { SceneProject, ViewportProfile } from "./scene-types";
import { rangeProgress } from "./scene-types";

type SceneCanvasProps = {
  projects: SceneProject[];
};

function SceneInvalidator({ tick }: { tick: number }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [invalidate, tick]);

  return null;
}

function SceneFallback() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#020409]"
    >
      <div className="absolute left-1/2 top-1/2 aspect-square w-[min(64vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/25 bg-[radial-gradient(circle,rgba(63,211,255,0.22),rgba(47,95,180,0.08)_42%,transparent_70%)] shadow-[0_0_120px_rgba(44,198,255,0.16)]">
        <div className="absolute inset-[18%] grid place-items-center rounded-full border border-violet-300/25 text-[clamp(2rem,8vw,5rem)] font-black tracking-[-0.12em] text-cyan-50/85">
          FZ
        </div>
      </div>
    </div>
  );
}

export default function SceneCanvas({ projects }: SceneCanvasProps) {
  const progressRef = useRef(0);
  const pointerRef = useRef(new THREE.Vector2());
  const lastProjectIndexRef = useRef(-1);
  const { quality, reducedMotion, maxDpr } = useDeviceCapability();
  const webGLSupported = useWebGLSupport();
  const [profile, setProfile] = useState<ViewportProfile>("desktop");
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [projectTexturesEnabled, setProjectTexturesEnabled] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [renderTick, setRenderTick] = useState(0);

  useEffect(() => {
    const updateProfile = () => {
      setProfile(
        window.innerWidth < 768
          ? "mobile"
          : window.innerWidth < 1180
            ? "tablet"
            : "desktop",
      );
    };

    updateProfile();
    window.addEventListener("resize", updateProfile, { passive: true });
    return () => window.removeEventListener("resize", updateProfile);
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const scrollingElement = document.scrollingElement ?? document.documentElement;
      const scrollRange = Math.max(scrollingElement.scrollHeight - window.innerHeight, 1);
      const normalizedPageScroll = THREE.MathUtils.clamp(
        (window.scrollY || scrollingElement.scrollTop) / scrollRange,
        0,
        1,
      );

      progressRef.current = normalizedPageScroll;
      document.documentElement.style.setProperty(
        "--story-progress",
        normalizedPageScroll.toFixed(4),
      );

      if (normalizedPageScroll >= 0.5) setProjectTexturesEnabled(true);

      if (projects.length > 0) {
        const projectProgress = rangeProgress(normalizedPageScroll, 0.55, 0.85);
        const nextIndex = Math.min(
          projects.length - 1,
          Math.floor(projectProgress * projects.length),
        );
        if (nextIndex !== lastProjectIndexRef.current) {
          lastProjectIndexRef.current = nextIndex;
          setActiveProjectIndex(nextIndex);
        }
      }

      if (reducedMotion) setRenderTick((value) => value + 1);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      document.documentElement.style.removeProperty("--story-progress");
    };
  }, [projects.length, reducedMotion]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotion || event.pointerType === "touch") return;
      pointerRef.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };
    const resetPointer = () => pointerRef.current.set(0, 0);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", resetPointer, { passive: true });
    window.addEventListener("blur", resetPointer);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", resetPointer);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const handleVisibility = () => {
      setDocumentVisible(!document.hidden);
      setRenderTick((value) => value + 1);
    };
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  if (!webGLSupported) return <SceneFallback />;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#020409]"
    >
      <Canvas
        camera={{ position: [0, 0.15, 7.4], fov: 43, near: 0.1, far: 60 }}
        dpr={[1, Math.min(1.5, maxDpr)]}
        frameloop={documentVisible && !reducedMotion ? "always" : "demand"}
        gl={{
          alpha: false,
          antialias: quality === "high",
          powerPreference: "high-performance",
          stencil: false,
        }}
        performance={{ min: 0.7 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#020409", 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
      >
        <color attach="background" args={["#020409"]} />
        <fog attach="fog" args={["#020409", 8, 27]} />
        <ambientLight intensity={0.45} color="#9ac8ff" />
        <directionalLight position={[4, 5, 5]} intensity={1.7} color="#b9f4ff" />
        <pointLight position={[-4, -1, 3]} intensity={16} distance={12} color="#744bff" />

        <Suspense fallback={null}>
          <ParticleField
            quality={quality}
            pointerRef={pointerRef}
            profile={profile}
            reducedMotion={reducedMotion}
          />
          <FZCore
            progressRef={progressRef}
            pointerRef={pointerRef}
            quality={quality}
            profile={profile}
            reducedMotion={reducedMotion}
          />
          <FloatingNodes
            progressRef={progressRef}
            profile={profile}
            reducedMotion={reducedMotion}
          />
          {projectTexturesEnabled && projects.length > 0 && (
            <ProjectScene
              projects={projects}
              activeIndex={activeProjectIndex}
              progressRef={progressRef}
              profile={profile}
              reducedMotion={reducedMotion}
            />
          )}
          <CameraRig
            progressRef={progressRef}
            pointerRef={pointerRef}
            profile={profile}
            reducedMotion={reducedMotion}
          />
          <AdaptiveDpr pixelated />
          <SceneInvalidator tick={renderTick} />
        </Suspense>
      </Canvas>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_12%,rgba(2,4,9,0.18)_58%,rgba(2,4,9,0.78)_100%)]" />
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:100%_4px]" />
    </div>
  );
}
