"use client";
/**
 * Render-loop hooks for the TransformStack layers (Fase K3), thin wrappers over the drivers in
 * src/lib/animation/three/drivers.ts:
 *  - useIdleLayer: float / breath / spin from the --idle-* tokens; at rest under reduced motion.
 *  - useInteractionLayer: hover / press / pointer-follow damped with maath; returns the pointer
 *    handlers to spread on the mesh (the input lives inside the hook — no React state per move).
 */
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { getMotionTokens } from "@/lib/design-tokens";
import { animationStore } from "@/lib/animation/state";
import { applyIdle, applyInteraction, type InteractionInput } from "@/lib/animation/three/drivers";
import type { TransformLayers } from "./TransformStack";

type LayerRef = RefObject<TransformLayers | null>;

export function useIdleLayer(layers: LayerRef, options: { amplitude?: number; period?: number; spin?: number } = {}) {
  useFrame(({ clock }) => {
    const layer = layers.current?.idle;
    if (layer) applyIdle(layer, clock.elapsedTime, getMotionTokens().idle, { reduced: animationStore.get().reducedMotion, ...options });
  });
}

export function useInteractionLayer(layers: LayerRef, options: { tilt?: number; lift?: number; onHover?: (hovered: boolean) => void; onSelect?: () => void } = {}) {
  const input = useRef<InteractionInput>({ hovered: false, pressed: false, follow: true });
  const opts = useRef(options);
  useEffect(() => {
    opts.current = options;
  });

  useFrame((_, delta) => {
    const layer = layers.current?.interaction;
    if (layer)
      applyInteraction(layer, input.current, animationStore.frame.pointer, delta, getMotionTokens(), {
        reduced: animationStore.get().reducedMotion,
        tilt: opts.current.tilt,
        lift: opts.current.lift,
      });
  });

  return useMemo(
    () => ({
      onPointerOver: (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        input.current.hovered = true;
        opts.current.onHover?.(true);
      },
      onPointerOut: () => {
        input.current.hovered = false;
        input.current.pressed = false;
        opts.current.onHover?.(false);
      },
      onPointerDown: () => {
        input.current.pressed = true;
      },
      onPointerUp: () => {
        input.current.pressed = false;
      },
      onClick: () => opts.current.onSelect?.(),
    }),
    [],
  );
}
