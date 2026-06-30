"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

const CYAN = new THREE.Color("#00f3ff");
const MAGENTA = new THREE.Color("#ff0055");
const ORIGIN = new THREE.Vector3(0, 0, 0);
const TRAIL_COUNT = 34;

type HardwarePointer = {
  clientX: number;
  clientY: number;
  active: boolean;
};

function CyberCursorScene({
  hardwarePointer,
}: {
  hardwarePointer: RefObject<HardwarePointer>;
}) {
  const cursorRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const stageLookupDoneRef = useRef(false);
  const previousScrollRef = useRef(0);
  const hasScrollSampleRef = useRef(false);
  const scrollVelocityRef = useRef(0);
  const cursorPositionRef = useRef(new THREE.Vector3());

  const trailPositions = useMemo(
    () => new Float32Array(TRAIL_COUNT * 3),
    [],
  );

  const trailColors = useMemo(() => {
    const colors = new Float32Array(TRAIL_COUNT * 3);

    for (let index = 0; index < TRAIL_COUNT; index += 1) {
      const progress = index / (TRAIL_COUNT - 1);
      const color = CYAN.clone().lerp(MAGENTA, progress);
      const brightness = THREE.MathUtils.lerp(1, 0.12, progress);

      colors[index * 3] = color.r * brightness;
      colors[index * 3 + 1] = color.g * brightness;
      colors[index * 3 + 2] = color.b * brightness;
    }

    return colors;
  }, []);

  useFrame((state, delta) => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    const hardware = hardwarePointer.current;

    if (!cursor || !trail || !hardware) return;

    if (
      !stageLookupDoneRef.current ||
      (stageRef.current && !stageRef.current.isConnected)
    ) {
      stageRef.current = document.querySelector<HTMLElement>(
        "[data-horizontal-stage]",
      );
      stageLookupDoneRef.current = true;
    }

    const hasHorizontalStage = Boolean(
      stageRef.current &&
      stageRef.current.scrollWidth > stageRef.current.clientWidth + 8,
    );
    const motionOffset = hasHorizontalStage
      ? window.scrollX + (stageRef.current?.scrollLeft ?? 0)
      : window.scrollY;

    /*
     * Normalize through document space before returning to viewport space.
     * This explicitly removes window/stage horizontal offsets, preventing
     * section-local coordinates from drifting after long horizontal scrolls.
     */
    const documentX =
      hardware.clientX + (hasHorizontalStage ? motionOffset : 0);
    const viewportX =
      documentX - (hasHorizontalStage ? motionOffset : 0);
    const viewportY = hardware.clientY;

    const pointerX = THREE.MathUtils.clamp(
      (viewportX / Math.max(state.size.width, 1)) * 2 - 1,
      -1,
      1,
    );
    const pointerY = THREE.MathUtils.clamp(
      -(viewportY / Math.max(state.size.height, 1)) * 2 + 1,
      -1,
      1,
    );

    // Canvas ignores pointer events, so synchronize R3F's pointer manually.
    state.pointer.set(pointerX, pointerY);

    const viewport = state.viewport.getCurrentViewport(state.camera, ORIGIN);
    const targetX = state.pointer.x * (viewport.width / 2);
    const targetY = state.pointer.y * (viewport.height / 2);
    const followStrength = 1 - Math.exp(-delta * 22);

    cursorPositionRef.current.x = THREE.MathUtils.lerp(
      cursorPositionRef.current.x,
      targetX,
      followStrength,
    );
    cursorPositionRef.current.y = THREE.MathUtils.lerp(
      cursorPositionRef.current.y,
      targetY,
      followStrength,
    );
    cursor.position.copy(cursorPositionRef.current);

    const rawScrollVelocity = hasScrollSampleRef.current
      ? (motionOffset - previousScrollRef.current) /
        Math.max(delta, 1 / 240)
      : 0;

    hasScrollSampleRef.current = true;
    previousScrollRef.current = motionOffset;
    scrollVelocityRef.current = THREE.MathUtils.lerp(
      scrollVelocityRef.current,
      rawScrollVelocity,
      1 - Math.exp(-delta * 10),
    );

    const velocity = scrollVelocityRef.current;
    const warp = Math.min(Math.abs(velocity) * 0.00045, 1.15);
    const scaleStrength = 1 - Math.exp(-delta * 15);

    cursor.scale.x = THREE.MathUtils.lerp(
      cursor.scale.x,
      1 + warp,
      scaleStrength,
    );
    cursor.scale.y = THREE.MathUtils.lerp(
      cursor.scale.y,
      1 - Math.min(warp * 0.15, 0.16),
      scaleStrength,
    );
    cursor.rotation.z = THREE.MathUtils.lerp(
      cursor.rotation.z,
      -Math.sign(velocity) * Math.min(warp * 0.16, 0.14),
      scaleStrength,
    );

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * (1.7 + warp * 2.8);
    }

    const positionAttribute = trail.geometry.attributes
      .position as THREE.BufferAttribute;
    const positions = positionAttribute.array as Float32Array;
    const elapsed = state.clock.elapsedTime;
    const direction = Math.sign(velocity);

    positions[0] = THREE.MathUtils.lerp(
      positions[0],
      cursorPositionRef.current.x,
      followStrength,
    );
    positions[1] = THREE.MathUtils.lerp(
      positions[1],
      cursorPositionRef.current.y,
      followStrength,
    );
    positions[2] = 0;

    for (let index = 1; index < TRAIL_COUNT; index += 1) {
      const current = index * 3;
      const previous = (index - 1) * 3;
      const progress = index / (TRAIL_COUNT - 1);
      const angle = elapsed * 4.5 - index * 0.52;
      const orbitRadius = 0.012 + progress * 0.018;
      const trailFollow = 1 - Math.exp(-delta * (20 - progress * 12));
      const velocityDrag = direction * warp * progress * 0.018;

      positions[current] = THREE.MathUtils.lerp(
        positions[current],
        positions[previous] -
          velocityDrag +
          Math.cos(angle) * orbitRadius,
        trailFollow,
      );
      positions[current + 1] = THREE.MathUtils.lerp(
        positions[current + 1],
        positions[previous + 1] + Math.sin(angle) * orbitRadius,
        trailFollow,
      );
      positions[current + 2] = 0;
    }

    positionAttribute.needsUpdate = true;
    cursor.visible = hardware.active;
    trail.visible = hardware.active;
  });

  return (
    <>
      <points ref={trailRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[trailPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[trailColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={2.2}
          sizeAttenuation={false}
          transparent
          opacity={0.82}
          vertexColors
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>

      <group ref={cursorRef} visible={false}>
        <mesh>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshBasicMaterial
            color={CYAN}
            transparent
            opacity={0.98}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <mesh>
          <torusGeometry args={[0.12, 0.011, 8, 48]} />
          <meshBasicMaterial
            color={CYAN}
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <mesh ref={outerRingRef} rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.175, 0.007, 6, 4]} />
          <meshBasicMaterial
            color={MAGENTA}
            transparent
            opacity={0.68}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <mesh scale={1.7}>
          <torusGeometry args={[0.12, 0.018, 8, 48]} />
          <meshBasicMaterial
            color={CYAN}
            transparent
            opacity={0.1}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>
    </>
  );
}

const PUBLIC_CURSOR_ROUTES = [
  "/",
  "/home",
  "/explore",
  "/about",
  "/projects",
  "/contact",
  "/dashboard/user",
];

export default function CyberCursor() {
  const pathname = usePathname();
  const hardwarePointer = useRef<HardwarePointer>({
    clientX: 0,
    clientY: 0,
    active: false,
  });
  const [supportsFinePointer, setSupportsFinePointer] = useState(false);

  const isPublicRoute = PUBLIC_CURSOR_ROUTES.some((route) =>
    route === "/" ? pathname === route : pathname.startsWith(route),
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");

    const updatePointerCapability = () => {
      setSupportsFinePointer(mediaQuery.matches);
    };

    updatePointerCapability();
    mediaQuery.addEventListener("change", updatePointerCapability);

    return () => {
      mediaQuery.removeEventListener("change", updatePointerCapability);
    };
  }, []);

  useEffect(() => {
    if (!supportsFinePointer || !isPublicRoute) return;

    const pointer = hardwarePointer.current;
    pointer.clientX = window.innerWidth / 2;
    pointer.clientY = window.innerHeight / 2;

    const handlePointerMove = (event: PointerEvent) => {
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    document.documentElement.classList.add("cyber-cursor-active");
    document.body.classList.add("cyber-cursor-active");
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.documentElement.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );

    return () => {
      pointer.active = false;
      document.documentElement.classList.remove("cyber-cursor-active");
      document.body.classList.remove("cyber-cursor-active");
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
    };
  }, [isPublicRoute, supportsFinePointer]);

  if (!supportsFinePointer || !isPublicRoute) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[10050]"
    >
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 10],
          zoom: 100,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          background: "transparent",
        }}
      >
        <CyberCursorScene hardwarePointer={hardwarePointer} />
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
