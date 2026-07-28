"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import MorphingObject from "./MorphingObject";
import WebGLFallback from "./WebGLFallback";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

export default function HeroCanvas({ energyBoost = 0 }: { energyBoost?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { quality, reducedMotion, maxDpr } = useDeviceCapability();
  const webGLSupported = useWebGLSupport();
  const [visible, setVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "180px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  if (!webGLSupported || reducedMotion) {
    return <WebGLFallback />;
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[min(52vw,20rem)] min-h-56 w-full overflow-hidden rounded-[24px] border border-blue-400/12 bg-[#050911]/50"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.22),transparent_56%)]" />
      {visible && documentVisible && (
        <Canvas
          camera={{ position: [0, 0, 5.1], fov: 42, near: 0.1, far: 40 }}
          dpr={[1, maxDpr]}
          gl={{
            alpha: true,
            antialias: quality !== "low",
            powerPreference: "high-performance",
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.75} />
            <pointLight position={[2, 3, 4]} intensity={1.4} color="#93c5fd" />
            <MorphingObject
              quality={quality}
              energyBoost={energyBoost}
              reducedMotion={reducedMotion}
            />
            <AdaptiveDpr pixelated />
          </Suspense>
        </Canvas>
      )}
      <div className="pointer-events-none absolute inset-x-8 bottom-5 h-px bg-linear-to-r from-transparent via-blue-300/45 to-transparent" />
    </div>
  );
}
