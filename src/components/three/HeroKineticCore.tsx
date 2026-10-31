"use client";
import {useReduced3DMotion} from "./motionPreference";
import { useAssetViewport } from "./useAssetViewport";

import { Component, Suspense, useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";

const BASE = "/models/fzh-kinetic-core/FZH_Hero_Kinetic_Core";
function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export { default as HeroKineticCoreModel } from "./kinetic/KineticCore";
import KineticCore from "./kinetic/KineticCore";

class AssetBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function ContextLifecycle({onFailure}: {onFailure: () => void}) {
  const {gl}=useThree();
  useEffect(()=>{
    const canvas=gl.domElement;
    canvas.addEventListener('webglcontextlost',onFailure);
    return ()=>canvas.removeEventListener('webglcontextlost',onFailure);
  },[gl,onFailure]);
  return null;
}

/** Decorative, isolated viewer. Parent retains normal scrolling and accessible content. */
export default function HeroKineticCore({ className }: { className?: string }) {
  const { ref: viewportRef, interaction, onPointerEnter, onPointerLeave, onPointerMove, onPointerDown, onPointerUp, entered, running, failed, onFailure } = useAssetViewport(true);
  const mobile = useMedia("(max-width: 767px)");
  const tablet = useMedia("(min-width: 768px) and (max-width: 1023px)");
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  const reducedMotion = useReduced3DMotion();
  return (
    <div ref={viewportRef} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onPointerMove={onPointerMove} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerLeave} data-fzh-asset="core" data-ready={ready && !failed} data-running={running && !reducedMotion && !failed} className={className} aria-hidden="true" style={{ position: "relative", width: "100%", aspectRatio: "1", touchAction: "pan-y" }}>
      {/* Visible before hydration, during loading, and when WebGL is unavailable. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={!ready && !failed ? "asset-poster-pending" : undefined} src={`${BASE}_poster.webp`} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
      {hydrated && entered && !failed && <AssetBoundary onFailure={onFailure}>
        <Canvas
          style={{ position: "absolute", inset: 0, touchAction: "pan-y", opacity: ready ? 1 : 0, transition: reducedMotion ? "none" : "opacity 600ms ease" }}
          camera={{ position: [0, 0.15, 6.8], fov: 40 }}
          dpr={mobile ? [1, 1.25] : tablet ? [1, 1.5] : [1, 1.75]}
          frameloop={!running ? "never" : reducedMotion ? "demand" : "always"}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          fallback={<span />}
        >
          <color attach="background" args={["#070a0f"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 4, 5]} intensity={3} />
          <directionalLight position={[-3, -2, 3]} intensity={1.5} color="#a4dfff" />
          <ContextLifecycle onFailure={onFailure} />
          <hemisphereLight args={["#bdd9e9", "#101722", 0.7]} />
          <pointLight position={[1, -2, -1]} color="#21cbe4" intensity={8} />
          <Suspense fallback={null}>
            {/* Local studio reflection maps: no remote HDR download or runtime shadows. */}
            <Environment resolution={128} frames={1}>
              <Lightformer position={[0, 3, 2]} intensity={3} scale={[6, 3, 1]} />
              <Lightformer position={[-3, 0, 1]} rotation={[0, Math.PI / 2, 0]} intensity={2} scale={[3, 6, 1]} color="#a4dfff" />
            </Environment>
            <KineticCore interaction={interaction} mobile={mobile} tablet={tablet} reducedMotion={reducedMotion} onReady={onReady} />
          </Suspense>
        </Canvas>
      </AssetBoundary>}
    </div>
  );
}
