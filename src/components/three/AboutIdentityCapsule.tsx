"use client";

import { useAssetViewport, type AssetInteraction } from "./useAssetViewport";

import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useAnimations, useGLTF, useTexture } from "@react-three/drei";
import { Group, MathUtils, Mesh, MeshBasicMaterial, SRGBColorSpace } from "three";

const MODEL = "/models/fzh-identity-capsule/FZH_About_Identity_Capsule";

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

/** Cached textures stay untouched; each portrait owns its map transform/material. */
function PortraitSurface({ plane, url }: { plane: Mesh; url: string }) {
  const source = useTexture(url);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const map = source.clone();
    map.flipY = false; // glTF UV convention, including exporter V conversion.
    map.colorSpace = SRGBColorSpace;
    const image = source.image as { width: number; height: number };
    const imageAspect = image.width / image.height;
    const targetAspect = 4 / 5;
    // Center-crop instead of stretching portraits with a different aspect ratio.
    if (imageAspect > targetAspect) {
      map.repeat.x = targetAspect / imageAspect;
      map.offset.x = (1 - map.repeat.x) / 2;
    } else {
      map.repeat.y = imageAspect / targetAspect;
      map.offset.y = (1 - map.repeat.y) / 2;
    }
    map.needsUpdate = true;
    const material = new MeshBasicMaterial({ map, toneMapped: false });
    const previous = plane.material;
    /* eslint-disable react-hooks/immutability -- Imperative attachment to our per-instance Three.js clone, never a cached mesh. */
    plane.material = material;
    invalidate();
    return () => {
      plane.material = previous;
      material.dispose();
      map.dispose();
      invalidate();
    };
    /* eslint-enable react-hooks/immutability */
  }, [plane, source, invalidate]);
  return null;
}

export type IdentityCapsuleModelProps = {
  interaction?: RefObject<AssetInteraction>;
  portraitUrl?: string;
  mobile?: boolean;
  tablet?: boolean;
  reducedMotion?: boolean;
  onPortraitReady?: (plane: Mesh | null) => void;
  onReady?: () => void;
};

/** Canvas child. Exposes the per-instance Portrait_Plane, with independent transforms. */
export function AboutIdentityCapsuleModel({ portraitUrl, mobile = false, tablet = false,
  reducedMotion = false, onPortraitReady, onReady, interaction }: IdentityCapsuleModelProps) {
  const gltf = useGLTF(`${MODEL}${mobile ? "_LOD" : ""}.glb`);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const portrait = useMemo(() => {
    const plane = scene.getObjectByName("Portrait_Plane");
    if (!(plane instanceof Mesh)) throw new Error("Identity asset is missing Portrait_Plane");
    return plane;
  }, [scene]);
  const { actions } = useAnimations(gltf.animations, scene);
  const wrapper = useRef<Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    onPortraitReady?.(portrait);
    onReady?.();
    return () => onPortraitReady?.(null);
  }, [portrait, onPortraitReady, onReady]);
  useEffect(() => {
    const action = actions.idle;
    if (!action || reducedMotion) {
      if (wrapper.current) wrapper.current.rotation.set(0, 0, 0);
      invalidate();
      return;
    }
    action.reset().setEffectiveTimeScale(mobile ? 0.55 : tablet ? 0.8 : 1).play();
    return () => { action.stop(); invalidate(); };
  }, [actions, reducedMotion, mobile, tablet, invalidate]);
  useFrame(({ pointer, clock }, delta) => {
    if (!wrapper.current) return;
    const group = wrapper.current;
    if (reducedMotion) {
      group.rotation.set(0, 0, 0);
      group.position.y = 0;
      group.scale.setScalar(1);
      return;
    }
    const hover = interaction?.current.hovered ? 1 : 0;
    const scroll = interaction?.current.scroll ?? 0;
    const amount = mobile ? 0.025 : tablet ? 0.045 : 0.075;
    const baseSpeed = mobile ? 0.55 : tablet ? 0.8 : 1;
    if (actions.idle) actions.idle.setEffectiveTimeScale(MathUtils.damp(actions.idle.getEffectiveTimeScale(), baseSpeed * (1 + hover * 0.5), 3, delta));
    group.rotation.y = MathUtils.damp(group.rotation.y, pointer.x * amount * hover + scroll * amount * 1.5 + Math.sin(clock.elapsedTime * 0.4) * hover * amount * 0.4, 3, delta);
    group.rotation.x = MathUtils.damp(group.rotation.x, -pointer.y * amount * 0.55 * hover + scroll * amount, 3, delta);
    group.position.y = MathUtils.damp(group.position.y, scroll * amount * 1.2, 3, delta);
    group.scale.setScalar(MathUtils.damp(group.scale.x, 1 + hover * 0.02, 3, delta));
  });
  return <group ref={wrapper}>
    <primitive object={scene} dispose={null} />
    {portraitUrl && <IdentityBoundary key={portraitUrl}>
      <Suspense fallback={null}><PortraitSurface plane={portrait} url={portraitUrl} /></Suspense>
    </IdentityBoundary>}
  </group>;
}

class IdentityBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

/** Decorative viewer; keep the developer's name and About content in normal HTML. */
export default function AboutIdentityCapsule({ portraitUrl, className }: {
  portraitUrl?: string;
  className?: string;
}) {
  const { ref: viewportRef, interaction, onPointerEnter, onPointerLeave, entered, running, failed, onFailure } = useAssetViewport();
  const mobile = useMedia("(max-width: 767px)");
  const tablet = useMedia("(min-width: 768px) and (max-width: 1023px)");
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  return <div ref={viewportRef} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} data-fzh-asset="identity" data-ready={ready && !failed} data-running={running && !reducedMotion && !failed} className={className} aria-hidden="true" style={{ position: "relative", width: "100%", aspectRatio: "10 / 13", touchAction: "pan-y" }}>
    {/* A real portrait remains visible without WebGL; otherwise use the capsule poster. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={portraitUrl || `${MODEL}_poster.webp`} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
    {hydrated && entered && !failed && <IdentityBoundary>
      <Canvas
        style={{ position: "absolute", inset: 0, opacity: ready ? 1 : 0, touchAction: "pan-y" }}
        camera={{ position: [0, 0, 5], fov: 38 }}
        dpr={mobile ? 1 : [1, 1.5]}
        frameloop={!running ? "never" : reducedMotion ? "demand" : "always"}
        gl={{ alpha: false, antialias: !mobile, powerPreference: "low-power" }}
        fallback={<span />}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", onFailure, { once: true });
          }}
      >
        <color attach="background" args={["#0d1117"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={3} />
        <directionalLight position={[-3, -2, 3]} intensity={1.5} color="#a4dfff" />
        <Suspense fallback={null}>
          <Environment resolution={128} frames={1}>
            <Lightformer position={[0, 3, 2]} intensity={3} scale={[6, 3, 1]} />
            <Lightformer position={[-3, 0, 1]} rotation={[0, Math.PI / 2, 0]} intensity={2} scale={[3, 6, 1]} color="#a4dfff" />
          </Environment>
          <AboutIdentityCapsuleModel interaction={interaction} portraitUrl={portraitUrl} mobile={mobile} tablet={tablet} reducedMotion={reducedMotion} onReady={onReady} />
        </Suspense>
      </Canvas>
    </IdentityBoundary>}
  </div>;
}
