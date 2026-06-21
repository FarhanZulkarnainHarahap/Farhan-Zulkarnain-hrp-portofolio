"use client";

import { useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

export const useMouseParallax = () => {
  const parallaxRef = useRef(new THREE.Vector2(0, 0));
  const activeRef = useRef(false);

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    const { point, object } = event;
    const local = object.worldToLocal(point.clone());
    parallaxRef.current.set(
      THREE.MathUtils.clamp(local.x / 1.2, -1, 1),
      THREE.MathUtils.clamp(local.y / 1.2, -1, 1),
    );
  };

  const onPointerEnter = () => {
    activeRef.current = true;
  };

  const onPointerLeave = () => {
    activeRef.current = false;
    parallaxRef.current.set(0, 0);
  };

  return { parallaxRef, activeRef, onPointerMove, onPointerEnter, onPointerLeave };
};
