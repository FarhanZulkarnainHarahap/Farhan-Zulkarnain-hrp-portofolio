"use client";
/**
 * Animation lab 3D scene (Fase K3, development only). One object, every engine, no conflicts:
 *
 *   TransformStack layer   driven by                         input
 *   scroll                 ScrollTrigger progress (demo 10)  signals.scrollProgress (ref)
 *   choreography           Theatre "Animation Lab" sequence  useTheatreObject ref
 *   interaction            maath damp (hover / press / tilt) pointer events → ref
 *   idle                   useFrame clock (float, breath)    --idle-* tokens
 *   mesh material          GLSL mask (demo 11)               Theatre "Scroll Masking" → uniforms
 *
 * Rendering: <Canvas frameloop="never"> advanced by the shared ticker's render phase
 * (TickerFrameloop), DPR clamped by the quality tier and lowered by PerformanceMonitor,
 * postprocessing only on tiers that allow it, context loss reported to the shared state.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { MeshPhysicalMaterial, TorusKnotGeometry } from "three";
import { useTheatreObject } from "@/components/animation/TheatreProvider";
import { useAnimationState } from "@/components/animation/hooks";
import { TickerFrameloop } from "@/components/three/TickerFrameloop";
import { TransformStack, type TransformLayers } from "@/components/three/TransformStack";
import { useIdleLayer, useInteractionLayer } from "@/components/three/layers";
import { animationController } from "@/lib/animation/controller";
import { adaptiveDpr, profileFor } from "@/lib/animation/quality";
import { animationStore } from "@/lib/animation/state";
import { applyMask as withMask, createMaskUniforms } from "@/lib/animation/three/mask-material";
import { applyChoreography, applyMask, applyMaterial, applyScrollLayer } from "@/lib/animation/three/drivers";
import { getColorTokens, getMotionTokens } from "@/lib/design-tokens";

export type LabSignals = {
  /** 0–1, written by the demo-10 ScrollTrigger. */
  scrollProgress: number;
  /** Frames rendered (debug). */
  frames: number;
  /** Latest mask values applied to the uniforms (readout for demos 9 / 11). */
  mask: { progress: number; dissolve: number };
};

function useMaskedMaterial() {
  return useMemo(() => {
    const colors = getColorTokens();
    const geometry = new TorusKnotGeometry(0.85, 0.26, 220, 36);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const uniforms = createMaskUniforms({ min: box.min.y, max: box.max.y, edgeColor: colors.accent });
    const material = withMask(
      new MeshPhysicalMaterial({ color: colors.metal, metalness: 0.9, roughness: 0.3, emissive: colors.accent, emissiveIntensity: 0.2, clearcoat: 0.6 }),
      uniforms,
      { space: "object" },
    );
    return { geometry, material, uniforms };
  }, []);
}

function LabObject({ signals }: { signals: RefObject<LabSignals> }) {
  const layers = useRef<TransformLayers>(null);
  const { geometry, material, uniforms } = useMaskedMaterial();
  const choreography = useTheatreObject("lab", "Lab Object");
  const mask = useTheatreObject("scrollMask", "Mask");

  useIdleLayer(layers);
  const handlers = useInteractionLayer(layers, {
    onHover: (hovered) => {
      animationController.hover(hovered ? "lab-object" : null);
      document.body.style.cursor = hovered ? "pointer" : "";
    },
    onSelect: () => animationController.select(animationStore.get().selected === "lab-object" ? null : "lab-object"),
  });

  useFrame(() => {
    const l = layers.current;
    if (!l?.scroll || !l.choreography) return;
    applyScrollLayer(l.scroll, signals.current.scrollProgress); // demo 10 (ScrollTrigger)
    const c = choreography.values.current; // demo 7 (Theatre)
    if (c) {
      applyChoreography(l.choreography, c);
      applyMaterial(material, c);
    }
    const m = mask.values.current; // demos 9 + 11 (ScrollTrigger → Theatre → GLSL)
    if (m) {
      applyMask(uniforms, m);
      recordFrame(signals.current, m);
    }
  });

  return (
    <TransformStack ref={layers}>
      <mesh geometry={geometry} material={material} {...handlers} />
    </TransformStack>
  );
}

/** Debug readout for the lab (frames + the mask values just applied). */
function recordFrame(target: LabSignals, m: { progress: number; dissolve: number }) {
  target.frames++;
  target.mask.progress = m.progress;
  target.mask.dissolve = m.dissolve;
}

/** Reports WebGL context loss / restore to the shared state (Fase 4 extends it to recovery). */
function ContextWatch() {
  const canvas = useThree((s) => s.gl.domElement);
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      animationStore.set({ webgl: "lost" });
    };
    const restored = () => animationController.ensureWebGL();
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, [canvas]);
  return null;
}

export default function LabScene({ signals }: { signals: RefObject<LabSignals> }) {
  const quality = useAnimationState((s) => s.quality);
  const webgl = useAnimationState((s) => s.webgl);
  const profile = profileFor(quality);
  const colors = getColorTokens();
  const camera = getMotionTokens().camera;

  useEffect(() => {
    animationController.ensureWebGL();
  }, []);

  if (webgl === "unavailable" || !profile.webgl)
    return (
      <div data-testid="lab-webgl-fallback" className="flex h-full items-center justify-center border border-hairline p-6 text-center text-small text-body">
        WebGL is unavailable on this device: the lab shows its static fallback. Every DOM demo still works.
      </div>
    );

  return (
    <Canvas
      data-testid="lab-canvas"
      frameloop="never"
      dpr={adaptiveDpr(quality)}
      gl={{ antialias: profile.antialias, powerPreference: "high-performance", alpha: false }}
      camera={{ position: [0, 0, 6], fov: camera.fov }}
    >
      <TickerFrameloop />
      <ContextWatch />
      <PerformanceMonitor onDecline={() => animationController.degrade()} />
      <color attach="background" args={[colors.canvas]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-4, 2, -3]} intensity={1.2} color={colors.accent} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 3, 2]} scale={[6, 1, 1]} />
        <Lightformer form="rect" intensity={1} position={[-3, 0, 1]} rotation-y={Math.PI / 2} scale={[4, 1, 1]} />
        <Lightformer form="ring" intensity={1.5} color={colors.accent} position={[3, -1, -2]} scale={2} />
      </Environment>
      <LabObject signals={signals} />
      {profile.postprocessing ? (
        <EffectComposer multisampling={profile.antialias ? 4 : 0}>
          <Bloom mipmapBlur luminanceThreshold={0.8} intensity={0.55} />
          <Vignette darkness={0.55} offset={0.25} />
        </EffectComposer>
      ) : (
        <></>
      )}
    </Canvas>
  );
}
