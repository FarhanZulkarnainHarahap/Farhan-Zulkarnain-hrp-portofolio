"use client";
/**
 * InteractiveObject (Fase K4): the reusable interactive 3D object controller.
 *
 * Owns the per-object part of the hierarchy (the scene part — RouteTransitionGroup and
 * ScrollTransformGroup — lives in SceneRoot):
 *
 *   <group choreography>   Theatre "objects[id]" values (Fase 5), else identity      — Theatre
 *     <group interaction>  hover scale + pointer tilt + click spring                  — maath / spring
 *       <group idle>       spin, float, breath (scene clock); at rest when reduced    — R3F clock
 *         {children}       mesh + material (emissive response written here)          — material
 *
 *  - Idle: continuous rotation, subtle float, breathing scale, faint emissive breathing.
 *  - Hover: damped scale-up, tilt toward the pointer, emissive highlight, pointer cursor.
 *  - Click: tactile compression then a spring back with one soft overshoot; selects the object
 *    and (focusable objects) moves the camera to it. Clicking again releases it.
 *  - Exit: back to idle with damped velocity and the material reset.
 * Pointer input arrives only through the InteractionController filter (interactive slots).
 * Keyboard / touch alternative: sceneController.activate(id) runs the same response (lab buttons).
 */
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Vector3, type Group, type MeshStandardMaterial } from "three";
import { easing } from "maath";
import { animationStore } from "@/lib/animation/state";
import { applyChoreography, applyIdle } from "@/lib/animation/three/drivers";
import { getMotionTokens } from "@/lib/design-tokens";
import { sceneController } from "@/lib/scene/controller";
import { applyObjectInteraction, kickSpring, type Spring } from "@/lib/scene/drivers";
import { objectRegistry } from "@/lib/scene/objects";
import { SCENES } from "@/lib/scene/presets";
import { sceneStore } from "@/lib/scene/store";
import type { SceneId, Vec3Tuple } from "@/lib/scene/types";
import { setSceneCursor } from "./InteractionController";
import { useRenderLoop } from "./RenderLoopController";

type Props = {
  id: string;
  scene: SceneId;
  label: string;
  children: ReactNode;
  /** Material whose emissive responds to hover / selection / idle breathing. */
  material?: RefObject<MeshStandardMaterial | null>;
  baseEmissive?: number;
  focusable?: boolean;
  idle?: { spin?: number; amplitude?: number; period?: number; yaw?: number };
  hoverScale?: number;
  tilt?: number;
  position?: Vec3Tuple;
};

const IMPULSE = 2.2;

/** Emissive response (hover / selected / idle breath), damped. Returns true when settled. */
function applyEmissive(material: MeshStandardMaterial, goal: number, smoothTime: number, delta: number) {
  if (smoothTime <= 0) material.emissiveIntensity = goal;
  else easing.damp(material, "emissiveIntensity", goal, smoothTime, delta);
  return Math.abs(material.emissiveIntensity - goal) < 1e-3;
}

export function InteractiveObject({ id, scene, label, children, material, baseEmissive = 0, focusable = false, idle, hoverScale = 1.08, tilt = 0.25, position }: Props) {
  const choreography = useRef<Group>(null);
  const interaction = useRef<Group>(null);
  const idleLayer = useRef<Group>(null);
  const loop = useRenderLoop();
  const input = useRef({ hovered: false, spring: { value: 0, velocity: 0 } as Spring });
  const world = useRef(new Vector3());
  const options = useRef({ focusable, idle });
  useEffect(() => {
    options.current = { focusable, idle };
  });

  useEffect(() => {
    const press = () => {
      kickSpring(input.current.spring, IMPULSE);
      loop.invalidate(2);
    };
    return objectRegistry.register({
      id,
      scene,
      label,
      press,
      worldPosition: () => {
        const v = world.current;
        idleLayer.current?.getWorldPosition(v);
        return [v.x, v.y, v.z];
      },
    });
  }, [id, scene, label, loop]);

  useEffect(
    () => () => {
      // Exit on unmount: never leave a stale hover / selection / cursor behind.
      const s = sceneStore.get();
      if (s.hoveredObject === id) {
        sceneController.hover(null);
        setSceneCursor(false);
      }
      if (s.selectedObject === id) sceneController.select(null);
      if (s.focusedObject === id) sceneController.focus(null);
      loop.hold(`object:${id}`, false);
    },
    [id, loop],
  );

  useFrame((_, delta) => {
    const s = sceneStore.get();
    const reduced = animationStore.get().reducedMotion;
    const tokens = getMotionTokens();
    const theatre = sceneStore.frame.theatre.objects[id];
    if (theatre && choreography.current)
      applyChoreography(choreography.current, {
        position: { x: theatre.position[0], y: theatre.position[1], z: theatre.position[2] },
        rotation: { x: theatre.rotation[0], y: theatre.rotation[1], z: theatre.rotation[2] },
        scale: theatre.scale,
      });
    const selected = s.selectedObject === id;
    // Time-based motion (idle, breathing) only while the scene is on screen; otherwise it settles.
    const live = !reduced && SCENES[scene].animated && !!sceneStore.frame.placement[scene]?.visible;
    if (idleLayer.current) applyIdle(idleLayer.current, loop.time(), tokens.idle, { reduced: !live, ...options.current.idle });
    let settled = true;
    const state = input.current;
    if (interaction.current)
      settled = applyObjectInteraction(interaction.current, { hovered: state.hovered, selected, spring: state.spring }, animationStore.frame.pointer, {
        reduced,
        smoothTime: tokens.camera.smoothTime,
        delta,
        hoverScale,
        tilt,
      });
    const m = material?.current;
    if (m) {
      const breath = live ? (Math.sin(loop.time() * 0.9) * 0.5 + 0.5) * 0.12 : 0;
      const goal = baseEmissive + (state.hovered ? 0.9 : 0) + (selected ? 0.5 : 0) + breath;
      settled = applyEmissive(m, goal, reduced ? 0 : tokens.duration.hover, delta) && settled;
    }
    // While live the breathing never settles — the scene holds the loop then anyway; off screen
    // the response damps out and the hold is released.
    loop.hold(`object:${id}`, !settled);
  });

  const handlers = useMemo(
    () => ({
      onPointerOver: (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        input.current.hovered = true;
        sceneController.hover(id);
        setSceneCursor(true);
        loop.invalidate(2);
      },
      onPointerOut: () => {
        input.current.hovered = false;
        if (sceneStore.get().hoveredObject === id) sceneController.hover(null);
        setSceneCursor(false);
        loop.invalidate(2);
      },
      onPointerDown: (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        kickSpring(input.current.spring, IMPULSE);
        loop.invalidate(2);
      },
      onClick: (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const s = sceneStore.get();
        const next = s.selectedObject === id ? null : id;
        sceneController.select(next);
        if (options.current.focusable) sceneController.focus(next);
      },
    }),
    [id, loop],
  );

  return (
    <group position={position} name={`object:${id}`}>
      <group ref={choreography} name="layer:choreography">
        <group ref={interaction} name="layer:interaction">
          <group ref={idleLayer} name="layer:idle" {...handlers}>
            {children}
          </group>
        </group>
      </group>
    </group>
  );
}
