"use client";
/**
 * Technology orbit — WebGL PROTOTYPE (Fase K4; the final hero orbit is Fase 6).
 *
 * The same model as the SVG fallback (src/lib/display/orbit.ts, built on the server from the API
 * skills): three rings with their own radius, inclination, roll, direction and period (21 / 30 /
 * 38 s per revolution), one node per skill. Real 3D: each ring is a tilted plane (Euler ZXY of
 * −inclination, −roll, matching projectNode with y up), its nodes ride a spin group rotated by
 * the ring's angular velocity × scene time (delta-time based, clamped after a pause), the
 * perspective camera projects it and the depth buffer hides nodes passing behind the core.
 * Under reduced motion it is frozen at t = 0, which is exactly the SVG layout.
 *
 * Core: a rounded metal plate with the Fz monogram as an SVG texture (theme colours).
 * Nodes are unlabelled diamonds for now (labels arrive with the final orbit, Fase 6); the SVG's
 * accessible text summary stays in the page.
 */
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Euler, MeshStandardMaterial, OctahedronGeometry, TorusGeometry, Vector3, type Group } from "three";
import { FZ_F_PATH, FZ_VIEWBOX, FZ_Z_PATH } from "@/components/brand/FzMark";
import { animationStore } from "@/lib/animation/state";
import { ringSpeed } from "@/lib/display/orbit";
import { SCENES } from "@/lib/scene/presets";
import { sceneStore } from "@/lib/scene/store";
import type { SceneId } from "@/lib/scene/types";
import { InteractiveObject } from "../InteractiveObject";
import { useRenderLoop } from "../RenderLoopController";
import { useAssetTexture, useSharedGeometry, useSharedMaterial } from "../resources";
import { useThemeColors } from "../theme";
import { useDetail, useTint } from "./common";

export type OrbitModel = {
  rings: { id: string; radius: number; inclination: number; roll: number; direction: 1 | -1; period: number; nodes: { id: string; angle: number }[] }[];
};

const CORE = 0.41;
const DEG = Math.PI / 180;
const probe = new Vector3();

function fzTexture(ink: string, accent: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${FZ_VIEWBOX}" width="512" height="512"><path fill="${ink}" d="${FZ_F_PATH}"/><path fill="${accent}" d="${FZ_Z_PATH}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function Ring({ scene, ring, index, nodeGeometry, firstNode }: { scene: SceneId; ring: OrbitModel["rings"][number]; index: number; nodeGeometry: OctahedronGeometry; firstNode: RefObject<Group | null> | null }) {
  const spin = useRef<Group>(null);
  const loop = useRenderLoop();
  const colors = useThemeColors();
  const { quality, detail } = useDetail();
  const torus = useSharedGeometry(`orbit-ring:${ring.radius}:${quality}`, () => new TorusGeometry(ring.radius, 0.0035, detail.tube, detail.radial));
  const ringMaterial = useSharedMaterial("orbit-ring", () => new MeshStandardMaterial({ color: colors.hairlineStrong, metalness: 0.6, roughness: 0.4 }));
  useTint(ringMaterial, colors.hairlineStrong);
  const rotation = useMemo(() => new Euler(-ring.inclination * DEG, 0, -ring.roll * DEG, "ZXY"), [ring.inclination, ring.roll]);
  const speed = ringSpeed(ring);

  useFrame(() => {
    const g = spin.current;
    if (!g) return;
    const live = !animationStore.get().reducedMotion && !!sceneStore.frame.placement[scene]?.visible && SCENES[scene].animated;
    // Time-based revolution; frozen (not reset) when not live, so it resumes where it was.
    if (live) g.rotation.z = -speed * loop.time();
    if (index === 0 && firstNode?.current) {
      firstNode.current.getWorldPosition(probe);
      sceneStore.frame.probes[`${scene}:node0`] = [probe.x, probe.y, probe.z];
    }
  });

  return (
    <group rotation={rotation} name={`orbit-ring:${ring.id}`}>
      <mesh geometry={torus} material={ringMaterial} />
      <group ref={spin} name="layer:idle-orbit">
        {ring.nodes.map((node, i) => (
          <OrbitNode
            key={node.id}
            scene={scene}
            id={`${scene}:node:${node.id}`}
            position={[Math.cos(-node.angle) * ring.radius, Math.sin(-node.angle) * ring.radius, 0]}
            geometry={nodeGeometry}
            groupRef={i === 0 ? firstNode : null}
          />
        ))}
      </group>
    </group>
  );
}

function OrbitNode({ scene, id, position, geometry, groupRef }: { scene: SceneId; id: string; position: [number, number, number]; geometry: OctahedronGeometry; groupRef: RefObject<Group | null> | null }) {
  const material = useRef<MeshStandardMaterial>(null);
  const colors = useThemeColors();
  return (
    <group ref={groupRef ?? undefined} position={position}>
      <InteractiveObject id={id} scene={scene} label="Orbit node" material={material} baseEmissive={0.15} idle={{ spin: 0.6, amplitude: 0.0001 }} hoverScale={1.6} tilt={0}>
        <mesh geometry={geometry}>
          <meshStandardMaterial ref={material} color={colors.ink} metalness={0.7} roughness={0.3} emissive={colors.accent} emissiveIntensity={0.15} />
        </mesh>
      </InteractiveObject>
    </group>
  );
}

function Core({ scene }: { scene: SceneId }) {
  const colors = useThemeColors();
  const material = useRef<MeshStandardMaterial>(null);
  const logo = useAssetTexture(useMemo(() => fzTexture(colors.ink, colors.accent), [colors.ink, colors.accent]));
  const { detail } = useDetail();
  return (
    <InteractiveObject id={`${scene}:core`} scene={scene} label="Orbit core (Fz)" material={material} baseEmissive={0.05} focusable idle={{ yaw: 0.35, amplitude: 0.02 }} hoverScale={1.06}>
      <RoundedBox args={[CORE, CORE, 0.12]} radius={0.025} smoothness={Math.max(2, Math.round(detail.tube / 2))} castShadow>
        <meshStandardMaterial ref={material} color={colors.raised} metalness={0.65} roughness={0.32} emissive={colors.accent} emissiveIntensity={0.05} />
      </RoundedBox>
      {logo && (
        <mesh position={[0, 0, 0.0615]}>
          <planeGeometry args={[CORE * 0.82, CORE * 0.82]} />
          <meshStandardMaterial map={logo} transparent metalness={0.2} roughness={0.5} />
        </mesh>
      )}
    </InteractiveObject>
  );
}

export function Orbit({ scene, model }: { scene: SceneId; model: OrbitModel }) {
  const nodeGeometry = useSharedGeometry("orbit-node", () => new OctahedronGeometry(0.034, 0));
  const firstNode = useRef<Group>(null);
  const loop = useRenderLoop();
  useEffect(() => loop.invalidate(2), [loop, model]);
  return (
    <group name={`orbit:${scene}`}>
      <Core scene={scene} />
      {model.rings.map((ring, index) => (
        <Ring key={ring.id} scene={scene} ring={ring} index={index} nodeGeometry={nodeGeometry} firstNode={index === 0 ? firstNode : null} />
      ))}
    </group>
  );
}
