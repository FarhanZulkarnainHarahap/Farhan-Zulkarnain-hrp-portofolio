"use client";
/**
 * LabStageScene (Fase K4, DEVELOPMENT ONLY) — the persistent canvas' test scene on
 * /dev/animation-lab (`[data-scene-anchor~="lab"]` stage):
 *
 *  - Orbit prototype with demo rings (unlabelled demo nodes — no skill names are invented).
 *  - Three interactive objects (hover / click / idle / focus; keyboard buttons in the lab DOM).
 *  - 3D MASKING PROTOTYPE: a torus knot cut by a WORLD-SPACE clipping plane (three.js
 *    material.clippingPlanes, renderer.localClippingEnabled): bottom-to-top reveal driven by the
 *    stage's scroll progress, reversible (scroll back → it closes again), plus scroll-driven
 *    translation of the object and the K3 GLSL mask (world space) for a glowing cut edge at the
 *    same height. Geometry above the plane is not drawn at all — not a fade.
 *  - Shader failure test: a deliberately broken ShaderMaterial (reported by WebGLContextRecovery).
 */
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";
import { BoxGeometry, IcosahedronGeometry, MeshPhysicalMaterial, Plane, ShaderMaterial, TorusGeometry, TorusKnotGeometry, Vector3, type Group, type MeshStandardMaterial } from "three";
import { applyMask as withMask, createMaskUniforms, type MaskUniforms } from "@/lib/animation/three/mask-material";
import { sceneStore } from "@/lib/scene/store";
import type { SceneProps } from "../registry";
import { InteractiveObject } from "../InteractiveObject";
import { useDisposeOnUnmount } from "../resources";
import { useThemeColors } from "../theme";
import { labControls } from "./lab-controls";
import { Orbit, type OrbitModel } from "./Orbit";

const DEMO_ORBIT: OrbitModel = {
  rings: [
    { id: "demo-a", radius: 0.48, inclination: 54, roll: -16, direction: 1, period: 21, nodes: Array.from({ length: 5 }, (_, i) => ({ id: `a${i}`, angle: 0.4 + (i * Math.PI * 2) / 5 })) },
    { id: "demo-b", radius: 0.74, inclination: 59, roll: 9, direction: -1, period: 30, nodes: Array.from({ length: 8 }, (_, i) => ({ id: `b${i}`, angle: 1.3 + (i * Math.PI * 2) / 8 })) },
    { id: "demo-c", radius: 1, inclination: 64, roll: -5, direction: 1, period: 38, nodes: Array.from({ length: 8 }, (_, i) => ({ id: `c${i}`, angle: 2.1 + (i * Math.PI * 2) / 8 })) },
  ],
};

function Probe({ id, children, x, color }: { id: string; children: ReactNode; x: number; color: string }) {
  const material = useRef<MeshStandardMaterial>(null);
  return (
    <InteractiveObject id={`lab:${id}`} scene="lab" label={`Lab ${id}`} material={material} baseEmissive={0.05} focusable position={[x, -0.95, 0.2]} idle={{ spin: 0.3, amplitude: 0.03 }}>
      <mesh>
        {children}
        <meshStandardMaterial ref={material} color={color} metalness={0.7} roughness={0.3} emissive="#9fe8f5" emissiveIntensity={0.05} />
      </mesh>
    </InteractiveObject>
  );
}

const WORLD = new Vector3();
const KNOT_HALF = 0.42;

/** Clip height for a reveal progress, in world space around the object's current centre. */
function applyMaskPrototype(group: Group, plane: Plane, uniforms: MaskUniforms, progress: number) {
  group.getWorldPosition(WORLD);
  const scale = group.getWorldScale(new Vector3()).y;
  const bottom = WORLD.y - KNOT_HALF * scale;
  const top = WORLD.y + KNOT_HALF * scale;
  const height = bottom + (top - bottom) * progress;
  plane.constant = height; // normal (0, −1, 0): keeps y ≤ height
  uniforms.uMaskMin.value = bottom;
  uniforms.uMaskMax.value = top;
  uniforms.uMaskProgress.value = progress;
  sceneStore.frame.probes["lab:mask:plane"] = height;
  sceneStore.frame.probes["lab:mask:progress"] = progress;
  sceneStore.frame.probes["lab:mask:revealed"] = Math.min(1, Math.max(0, (height - bottom) / (top - bottom)));
}

function MaskPrototype() {
  const colors = useThemeColors();
  const group = useRef<Group>(null);
  const shift = useRef<Group>(null);
  const { geometry, material, plane, uniforms } = useMemo(() => {
    const geometry = new TorusKnotGeometry(0.26, 0.08, 160, 24);
    const plane = new Plane(new Vector3(0, -1, 0), 0);
    const uniforms = createMaskUniforms({ min: -KNOT_HALF, max: KNOT_HALF, edgeColor: colors.accent });
    const material = withMask(
      new MeshPhysicalMaterial({ color: colors.metal, metalness: 0.85, roughness: 0.28, clearcoat: 0.4, clippingPlanes: [plane], clipShadows: true }),
      uniforms,
      { space: "world" },
    );
    return { geometry, material, plane, uniforms };
  }, [colors.accent, colors.metal]);
  useDisposeOnUnmount(geometry, material);

  useFrame(() => {
    const g = group.current;
    if (!g || !shift.current) return;
    const lab = labControls.get();
    const progress = lab.maskSource === "manual" ? lab.maskManual : Math.min(1, Math.max(0, (sceneStore.frame.placement.lab?.progress ?? 0) * 2.2 - 0.35));
    // Scroll-driven translation (its own layer): rises as it is revealed.
    shift.current.position.y = (progress - 0.5) * 0.25;
    applyMaskPrototype(g, plane, uniforms, progress);
    // Proof for tests: the cut is a real clipping plane on the material (geometry, not opacity).
    sceneStore.frame.probes["lab:mask:clipping"] = material.clippingPlanes?.length ?? 0;
    sceneStore.frame.probes["lab:mask:opacity"] = material.opacity;
  });

  return (
    <group ref={shift} name="layer:scroll-mask-translation" position={[1.05, 0.35, 0]}>
      <group ref={group} name="mask-prototype">
        <mesh geometry={geometry} material={material} />
      </group>
    </group>
  );
}

function BrokenShader() {
  const material = useMemo(() => new ShaderMaterial({ vertexShader: "void main() { gl_Position = vec4(0.0); }", fragmentShader: "void main() { gl_FragColor = vec4(undefined_symbol); }" }), []);
  useDisposeOnUnmount(material);
  return (
    // Never culled: the program must be compiled (and fail) whatever the camera sees.
    <mesh position={[0, 1.1, 0]} material={material} frustumCulled={false}>
      <planeGeometry args={[0.1, 0.1]} />
    </mesh>
  );
}

export default function LabStageScene({ id }: SceneProps) {
  const colors = useThemeColors();
  const broken = useSyncExternalStore(labControls.subscribe, () => labControls.get().brokenShader, () => false);
  const box = useMemo(() => new BoxGeometry(0.22, 0.22, 0.22), []);
  const ico = useMemo(() => new IcosahedronGeometry(0.14, 0), []);
  const torus = useMemo(() => new TorusGeometry(0.12, 0.04, 12, 48), []);
  useDisposeOnUnmount(box, ico, torus);
  return (
    <group name={`scene:${id}`}>
      <group position={[-0.45, 0.25, 0]} scale={0.8}>
        <Orbit scene={id} model={DEMO_ORBIT} />
      </group>
      <Probe id="box" x={-0.7} color={colors.metal}>
        <primitive object={box} attach="geometry" />
      </Probe>
      <Probe id="ico" x={-0.2} color={colors.metal}>
        <primitive object={ico} attach="geometry" />
      </Probe>
      <Probe id="torus" x={0.3} color={colors.metal}>
        <primitive object={torus} attach="geometry" />
      </Probe>
      <MaskPrototype />
      {broken && <BrokenShader />}
    </group>
  );
}
