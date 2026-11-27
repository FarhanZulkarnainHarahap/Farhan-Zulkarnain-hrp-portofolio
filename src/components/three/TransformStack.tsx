"use client";
/**
 * TransformStack (Fase K3): the nested group hierarchy that lets several engines move one object
 * at the same time without overwriting each other (config TRANSFORM_LAYERS):
 *
 *   <group scene-root>        placement (props: position / rotation / scale)      — R3F props
 *     <group scroll>          scroll progress → transform                         — ScrollTrigger
 *       <group choreography>  keyframed cinematic transform                       — Theatre.js
 *         <group interaction> damped hover / pointer / click response             — maath
 *           <group idle>      float, breath, slow spin                            — useFrame clock
 *             {children}      the mesh; material uniforms (mask, dissolve)        — GLSL
 *
 * Each layer's ref is handed to exactly one driver; the transforms multiply down the tree.
 */
import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import type { Group } from "three";
import type { ThreeElements } from "@react-three/fiber";

export type TransformLayers = {
  root: Group | null;
  scroll: Group | null;
  choreography: Group | null;
  interaction: Group | null;
  idle: Group | null;
};

type Props = ThreeElements["group"] & { children?: ReactNode };

export const TransformStack = forwardRef<TransformLayers, Props>(function TransformStack({ children, ...rootProps }, ref) {
  const root = useRef<Group>(null);
  const scroll = useRef<Group>(null);
  const choreography = useRef<Group>(null);
  const interaction = useRef<Group>(null);
  const idle = useRef<Group>(null);
  useImperativeHandle(
    ref,
    () => ({
      get root() {
        return root.current;
      },
      get scroll() {
        return scroll.current;
      },
      get choreography() {
        return choreography.current;
      },
      get interaction() {
        return interaction.current;
      },
      get idle() {
        return idle.current;
      },
    }),
    [],
  );
  return (
    <group ref={root} name="layer:scene-root" {...rootProps}>
      <group ref={scroll} name="layer:scroll">
        <group ref={choreography} name="layer:choreography">
          <group ref={interaction} name="layer:interaction">
            <group ref={idle} name="layer:idle">
              {children}
            </group>
          </group>
        </group>
      </group>
    </group>
  );
});
