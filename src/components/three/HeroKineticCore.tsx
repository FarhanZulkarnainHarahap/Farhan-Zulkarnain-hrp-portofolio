"use client";

import { getAssetMotion } from "./assetMotion";

import { useAssetViewport, type AssetInteraction } from "./useAssetViewport";

import { Component, Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useAnimations, useGLTF } from "@react-three/drei";
import { Group, MathUtils } from "three";

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

/** Use inside an existing Canvas, or use the standalone HeroKineticCore below. */
export function HeroKineticCoreModel({ mobile = false, reducedMotion = false, tablet = false, onReady, interaction }: {
  mobile?: boolean;
  reducedMotion?: boolean;
  tablet?: boolean;
  onReady?: () => void;
  interaction?: RefObject<AssetInteraction>;
}) {
  const gltf = useGLTF(`${BASE}${mobile ? "_LOD" : ""}.glb`);
  // Independent transforms/mixer; cached geometry and materials remain shared.
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, scene);
  const wrapper = useRef<Group>(null);
  const motionTime = useRef(0);
  useEffect(() => { onReady?.(); }, [onReady]);
  useEffect(() => {
    const idle = actions.idle;
    if (!idle || reducedMotion) return;
    idle.reset().setEffectiveTimeScale(mobile ? 0.9 : tablet ? 0.95 : 1).play();
    return () => { idle.stop(); };
  }, [actions, mobile, tablet, reducedMotion]);
  useFrame(({ pointer }, delta) => {
    if (!wrapper.current) return;
    const group = wrapper.current;
    if (reducedMotion) {
      group.rotation.set(0, 0, 0);
      group.position.y = 0;
      group.scale.setScalar(1);
      return;
    }
    // Advance only on rendered frames; resuming a hidden tab cannot jump the pose.
    const step = Math.min(delta, 0.1);
    motionTime.current += step;
    const target = getAssetMotion({
      kind: "core", time: motionTime.current, mobile, tablet,
      active: interaction?.current.hovered ?? false,
      pointerX: interaction?.current.pointerX ?? pointer.x,
      pointerY: interaction?.current.pointerY ?? pointer.y,
      scroll: interaction?.current.scroll ?? 0,
    });
    if (actions.idle) actions.idle.setEffectiveTimeScale(MathUtils.damp(actions.idle.getEffectiveTimeScale(), target.speed, 4, step));
    group.rotation.x = MathUtils.damp(group.rotation.x, target.rotationX, 4, step);
    group.rotation.y = MathUtils.damp(group.rotation.y, target.rotationY, 4, step);
    group.rotation.z = MathUtils.damp(group.rotation.z, target.rotationZ, 4, step);
    group.position.y = MathUtils.damp(group.position.y, target.positionY, 4, step);
    group.scale.setScalar(MathUtils.damp(group.scale.x, target.scale, 4, step));
  });
  return <group ref={wrapper}><primitive object={scene} dispose={null} /></group>;
}

class AssetBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

/** Decorative, isolated viewer. Parent retains normal scrolling and accessible content. */
export default function HeroKineticCore({ className }: { className?: string }) {
  const { ref: viewportRef, interaction, onPointerEnter, onPointerLeave, onPointerMove, onPointerDown, onPointerUp, entered, running, failed, onFailure } = useAssetViewport();
  const mobile = useMedia("(max-width: 767px)");
  const tablet = useMedia("(min-width: 768px) and (max-width: 1023px)");
  const [ready, setReady] = useState(false);
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  return (
    <div ref={viewportRef} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onPointerMove={onPointerMove} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerLeave} data-fzh-asset="core" data-ready={ready && !failed} data-running={running && !reducedMotion && !failed} className={className} aria-hidden="true" style={{ position: "relative", width: "100%", aspectRatio: "1", touchAction: "pan-y" }}>
      {/* Visible before hydration, during loading, and when WebGL is unavailable. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BASE}_poster.webp`} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
      {hydrated && entered && !failed && <AssetBoundary>
        <Canvas
          style={{ position: "absolute", inset: 0, touchAction: "pan-y", opacity: ready ? 1 : 0 }}
          camera={{ position: [0, 0.15, 6], fov: 40 }}
          dpr={mobile ? 1 : [1, 1.5]}
          frameloop={!running ? "never" : reducedMotion ? "demand" : "always"}
          gl={{ antialias: !mobile, alpha: false, powerPreference: "low-power" }}
          fallback={<span />}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", onFailure, { once: true });
          }}
        >
          <color attach="background" args={["#070a0f"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 4, 5]} intensity={3} />
          <directionalLight position={[-3, -2, 3]} intensity={1.5} color="#a4dfff" />
          <Suspense fallback={null}>
            {/* Local studio reflection maps: no remote HDR download or runtime shadows. */}
            <Environment resolution={128} frames={1}>
              <Lightformer position={[0, 3, 2]} intensity={3} scale={[6, 3, 1]} />
              <Lightformer position={[-3, 0, 1]} rotation={[0, Math.PI / 2, 0]} intensity={2} scale={[3, 6, 1]} color="#a4dfff" />
            </Environment>
            <HeroKineticCoreModel interaction={interaction} mobile={mobile} tablet={tablet} reducedMotion={reducedMotion} onReady={() => setReady(true)} />
          </Suspense>
        </Canvas>
      </AssetBoundary>}
    </div>
  );
}
