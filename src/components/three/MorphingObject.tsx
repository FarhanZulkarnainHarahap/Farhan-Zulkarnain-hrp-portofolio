"use client";

/* eslint-disable react-hooks/immutability */

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { RenderQuality } from "@/hooks/useDeviceCapability";

export type MorphShape = "sphere" | "torus" | "wave" | "code" | "initials";

const BLUE = new THREE.Color("#2563eb");
const CYAN = new THREE.Color("#67e8f9");
const VIOLET = new THREE.Color("#8b5cf6");
const SHAPE_COUNT = 5;

const seededRandom = (initialSeed: number) => {
  let seed = initialSeed;
  return () => {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    return seed / 4_294_967_296;
  };
};

const samplePolyline = (
  segments: Array<[number, number, number, number]>,
  index: number,
  total: number,
) => {
  const progress = ((index / Math.max(total - 1, 1)) * segments.length) % segments.length;
  const segmentIndex = Math.floor(progress);
  const local = progress - segmentIndex;
  const [x1, y1, x2, y2] = segments[segmentIndex];

  return {
    x: THREE.MathUtils.lerp(x1, x2, local),
    y: THREE.MathUtils.lerp(y1, y2, local),
  };
};

const createTargets = (count: number) => {
  const random = seededRandom(0xfade2026);
  const sphere = new Float32Array(count * 3);
  const torus = new Float32Array(count * 3);
  const wave = new Float32Array(count * 3);
  const code = new Float32Array(count * 3);
  const initials = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const codeSegments: Array<[number, number, number, number]> = [
    [-1.58, 0.12, -0.82, 0.62],
    [-1.58, 0.12, -0.82, -0.38],
    [-0.28, -0.72, 0.2, 0.78],
    [0.72, 0.62, 1.52, 0.12],
    [1.52, 0.12, 0.72, -0.38],
  ];
  const initialSegments: Array<[number, number, number, number]> = [
    [-1.75, -0.82, -1.75, 0.82],
    [-1.75, 0.82, -0.92, 0.82],
    [-1.75, 0.1, -1.02, 0.1],
    [-0.54, 0.82, 0.34, 0.82],
    [0.34, 0.82, -0.54, -0.82],
    [-0.54, -0.82, 0.34, -0.82],
    [0.8, -0.82, 0.8, 0.82],
    [1.66, -0.82, 1.66, 0.82],
    [0.8, 0.06, 1.66, 0.06],
  ];

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const seedA = random();
    const seedB = random();
    const theta = seedA * Math.PI * 2;
    const phi = Math.acos(2 * seedB - 1);
    const radius = 1.28 + random() * 0.16;

    sphere[offset] = radius * Math.sin(phi) * Math.cos(theta);
    sphere[offset + 1] = radius * Math.cos(phi);
    sphere[offset + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const torusU = (index / count) * Math.PI * 2 * 3;
    const torusV = seedB * Math.PI * 2;
    const knotRadius = 1.05 + 0.25 * Math.cos(3 * torusU);
    torus[offset] = knotRadius * Math.cos(2 * torusU) + 0.14 * Math.cos(torusV);
    torus[offset + 1] = 0.72 * Math.sin(3 * torusU) + 0.14 * Math.sin(torusV);
    torus[offset + 2] = knotRadius * Math.sin(2 * torusU);

    const grid = Math.ceil(Math.sqrt(count));
    const gx = (index % grid) / Math.max(grid - 1, 1);
    const gy = Math.floor(index / grid) / Math.max(grid - 1, 1);
    const wx = (gx - 0.5) * 3.8;
    const wz = (gy - 0.5) * 2.15;
    wave[offset] = wx;
    wave[offset + 1] = Math.sin(wx * 2.2 + wz * 1.2) * 0.34 + Math.cos(wz * 3) * 0.16;
    wave[offset + 2] = wz;

    const codePoint = samplePolyline(codeSegments, index, count);
    code[offset] = codePoint.x + (random() - 0.5) * 0.08;
    code[offset + 1] = codePoint.y + (random() - 0.5) * 0.08;
    code[offset + 2] = (random() - 0.5) * 0.28;

    const initialPoint = samplePolyline(initialSegments, index, count);
    initials[offset] = initialPoint.x + (random() - 0.5) * 0.09;
    initials[offset + 1] = initialPoint.y + (random() - 0.5) * 0.09;
    initials[offset + 2] = (random() - 0.5) * 0.24;

    const color = BLUE.clone().lerp(index % 7 === 0 ? VIOLET : CYAN, random() * 0.72);
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
    sizes[index] = 0.75 + random() * 1.7;
  }

  return { sphere, torus, wave, code, initials, colors, sizes };
};

const vertexShader = `
attribute vec3 aSphere;
attribute vec3 aTorus;
attribute vec3 aWave;
attribute vec3 aCode;
attribute vec3 aInitials;
attribute vec3 aColor;
attribute float aSize;

uniform float uTime;
uniform float uShapeFrom;
uniform float uShapeTo;
uniform float uMorphProgress;
uniform float uNoiseStrength;
uniform float uEnergy;
uniform vec2 uPointer;

varying vec3 vColor;
varying float vAlpha;

vec3 getShape(float shape) {
  if (shape < 0.5) return aSphere;
  if (shape < 1.5) return aTorus;
  if (shape < 2.5) return aWave;
  if (shape < 3.5) return aCode;
  return aInitials;
}

float easeInOutCubic(float value) {
  return value < 0.5
    ? 4.0 * value * value * value
    : 1.0 - pow(-2.0 * value + 2.0, 3.0) / 2.0;
}

void main() {
  float eased = easeInOutCubic(clamp(uMorphProgress, 0.0, 1.0));
  vec3 fromShape = getShape(uShapeFrom);
  vec3 toShape = getShape(uShapeTo);
  vec3 morphed = mix(fromShape, toShape, eased);
  float breathing = sin(uTime * 0.75 + morphed.x * 1.8 + morphed.z * 1.2);
  float pointerPull = dot(normalize(vec2(morphed.x, morphed.y) + 0.001), uPointer);

  morphed += normalize(morphed + vec3(0.01)) * breathing * uNoiseStrength;
  morphed.xy += uPointer * pointerPull * (0.035 + uEnergy * 0.045);

  vec4 modelPosition = modelMatrix * vec4(morphed, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
  gl_PointSize = (aSize * (4.4 + uEnergy * 1.8)) * (1.0 / -viewPosition.z);
  vColor = mix(aColor, vec3(0.58, 0.78, 1.0), uEnergy * 0.55);
  vAlpha = 0.68 + uEnergy * 0.22;
}
`;

const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float distanceToCenter = length(uv);
  float circle = smoothstep(0.5, 0.08, distanceToCenter);

  gl_FragColor = vec4(vColor, circle * vAlpha);
}
`;

export default function MorphingObject({
  quality,
  energyBoost,
  reducedMotion,
}: {
  quality: RenderQuality;
  energyBoost: number;
  reducedMotion: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const pointerRef = useRef(new THREE.Vector2());
  const dragRef = useRef({ active: false, x: 0, y: 0, rotationX: 0, rotationY: 0 });
  const shapeRef = useRef({ from: 0, to: 0, progress: 1, lastTarget: 0 });
  const scrollProgressRef = useRef(0);
  const energyRef = useRef(0);
  const count = quality === "high" ? 1800 : quality === "medium" ? 1200 : 720;

  const { geometry, material } = useMemo(() => {
    const targets = createTargets(count);
    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute("position", new THREE.BufferAttribute(targets.sphere, 3));
    bufferGeometry.setAttribute("aSphere", new THREE.BufferAttribute(targets.sphere, 3));
    bufferGeometry.setAttribute("aTorus", new THREE.BufferAttribute(targets.torus, 3));
    bufferGeometry.setAttribute("aWave", new THREE.BufferAttribute(targets.wave, 3));
    bufferGeometry.setAttribute("aCode", new THREE.BufferAttribute(targets.code, 3));
    bufferGeometry.setAttribute("aInitials", new THREE.BufferAttribute(targets.initials, 3));
    bufferGeometry.setAttribute("aColor", new THREE.BufferAttribute(targets.colors, 3));
    bufferGeometry.setAttribute("aSize", new THREE.BufferAttribute(targets.sizes, 1));
    bufferGeometry.computeBoundingSphere();

    const shaderMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uShapeFrom: { value: 0 },
        uShapeTo: { value: 0 },
        uMorphProgress: { value: 1 },
        uNoiseStrength: { value: quality === "low" ? 0.012 : 0.035 },
        uEnergy: { value: 0 },
        uPointer: { value: new THREE.Vector2() },
      },
    });

    return { geometry: bufferGeometry, material: shaderMaterial };
  }, [count, quality]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const home = document.getElementById("home");
      const about = document.getElementById("about");
      if (!home || !about) return;

      const homeRect = home.getBoundingClientRect();
      const aboutRect = about.getBoundingClientRect();
      const travel = Math.max(aboutRect.top - homeRect.top, window.innerHeight);
      scrollProgressRef.current = THREE.MathUtils.clamp(-homeRect.top / travel, 0, 1);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    const group = groupRef.current;
    if (!points || !group) return;

    const time = reducedMotion ? 0 : state.clock.elapsedTime;
    const scrollTarget = Math.min(SHAPE_COUNT - 1, Math.floor(scrollProgressRef.current * SHAPE_COUNT));
    const idleTarget = Math.floor((time / 7) % SHAPE_COUNT);
    const targetShape = scrollProgressRef.current > 0.06 ? scrollTarget : idleTarget;
    const shape = shapeRef.current;

    if (targetShape !== shape.lastTarget) {
      shape.from = shape.to;
      shape.to = targetShape;
      shape.progress = 0;
      shape.lastTarget = targetShape;
    }

    shape.progress = reducedMotion ? 1 : Math.min(1, shape.progress + delta * 0.42);
    energyRef.current = THREE.MathUtils.lerp(energyRef.current, energyBoost, 1 - Math.exp(-delta * 5));
    pointerRef.current.lerp(state.pointer, 1 - Math.exp(-delta * 3));

    material.uniforms.uTime.value = time;
    material.uniforms.uShapeFrom.value = shape.from;
    material.uniforms.uShapeTo.value = shape.to;
    material.uniforms.uMorphProgress.value = shape.progress;
    material.uniforms.uEnergy.value = energyRef.current;
    material.uniforms.uPointer.value.copy(pointerRef.current);

    const drag = dragRef.current;
    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      drag.rotationX + pointerRef.current.y * 0.16,
      1 - Math.exp(-delta * 4),
    );
    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      drag.rotationY + pointerRef.current.x * 0.22 + time * 0.04,
      1 - Math.exp(-delta * 4),
    );
    group.position.y = Math.sin(time * 0.6) * 0.04;
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={(event) => {
        dragRef.current.active = true;
        dragRef.current.x = event.clientX;
        dragRef.current.y = event.clientY;
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag.active) return;
        drag.rotationY += (event.clientX - drag.x) * 0.006;
        drag.rotationX += (event.clientY - drag.y) * 0.004;
        drag.x = event.clientX;
        drag.y = event.clientY;
      }}
      onPointerUp={() => {
        dragRef.current.active = false;
      }}
      onPointerLeave={() => {
        dragRef.current.active = false;
      }}
    >
      <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
      <mesh scale={1.3}>
        <torusGeometry args={[1.35, 0.004, 4, 80]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  );
}
