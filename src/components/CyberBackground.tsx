"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const CORE_PARTICLE_COUNT = 1350;
const FIELD_PARTICLE_COUNT = 720;
const NETWORK_SEGMENT_COUNT = 190;
const CYAN = new THREE.Color("#00f3ff");
const MAGENTA = new THREE.Color("#ff0055");
const SECTION_IDS = [
  "home",
  "about",
  "projects",
  "journey",
  "contact",
  "about-overview",
  "about-skills",
  "about-documents",
];

type RenderProfile = {
  coreParticles: number;
  fieldParticles: number;
  networkSegments: number;
  targetFps: number;
};

const getRenderProfile = (width: number): RenderProfile => {
  if (width < 640) {
    return {
      coreParticles: 620,
      fieldParticles: 320,
      networkSegments: 82,
      targetFps: 28,
    };
  }

  if (width < 1024) {
    return {
      coreParticles: 900,
      fieldParticles: 460,
      networkSegments: 122,
      targetFps: 36,
    };
  }

  return {
    coreParticles: CORE_PARTICLE_COUNT,
    fieldParticles: FIELD_PARTICLE_COUNT,
    networkSegments: NETWORK_SEGMENT_COUNT,
    targetFps: 55,
  };
};

const getMaxDpr = () => {
  const width = window.innerWidth;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  const connection = nav.connection;
  const memory = nav.deviceMemory ?? 4;
  const saveData = connection?.saveData;

  if (saveData || memory <= 2 || width < 640) return 1;
  if (width < 1024) return 1.15;
  return 1.5;
};

const createSeededRandom = (initialSeed: number) => {
  let seed = initialSeed;

  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

function CyberWorld({
  reduceMotion,
  documentVisible,
}: {
  reduceMotion: boolean;
  documentVisible: boolean;
}) {
  const cameraRigRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const fieldRef = useRef<THREE.Group>(null);
  const corePointsRef = useRef<THREE.Points>(null);
  const fieldPointsRef = useRef<THREE.Points>(null);
  const networkLinesRef = useRef<THREE.LineSegments>(null);
  const primaryRingRef = useRef<THREE.Mesh>(null);
  const secondaryRingRef = useRef<THREE.Mesh>(null);
  const satelliteRef = useRef<THREE.Mesh>(null);
  const skillOrbitRef = useRef<THREE.Group>(null);
  const documentGroupRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.GridHelper>(null);
  const coreWireMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const fieldMaterialRef = useRef<THREE.PointsMaterial>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const stageLookupDoneRef = useRef(false);
  const activeSectionRef = useRef("home");
  const pointerTargetRef = useRef(new THREE.Vector2());
  const pointerRef = useRef(new THREE.Vector2());
  const previousScrollRef = useRef(0);
  const hasScrollSampleRef = useRef(false);
  const motionAxisRef = useRef<"horizontal" | "vertical" | null>(null);
  const scrollVelocityRef = useRef(0);
  const scrollProgressRef = useRef(0);
  const frameAccumulatorRef = useRef(0);
  const sectionRatiosRef = useRef<Record<string, number>>({});
  const motionMetricsRef = useRef({
    useHorizontalMotion: false,
    horizontalScroll: 0,
    verticalScroll: 0,
    motionOffset: 0,
    maxMotionOffset: 1,
  });
  const { size } = useThree();
  const renderProfile = useMemo(() => getRenderProfile(size.width), [size.width]);

  const coreGeometry = useMemo(() => {
    const random = createSeededRandom(0x0f3ff055);
    const positions = new Float32Array(CORE_PARTICLE_COUNT * 3);
    const colors = new Float32Array(CORE_PARTICLE_COUNT * 3);

    for (let index = 0; index < CORE_PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const isOuterNode = index % 11 === 0;
      const radius = 1.72 + random() * (isOuterNode ? 0.62 : 0.18);

      positions[offset] = radius * Math.sin(phi) * Math.cos(theta);
      positions[offset + 1] = radius * Math.cos(phi);
      positions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const colorMix = random();
      const color = CYAN.clone().lerp(
        MAGENTA,
        colorMix > 0.76 ? 0.92 : colorMix * 0.14,
      );
      const intensity = 0.58 + random() * 0.42;

      colors[offset] = color.r * intensity;
      colors[offset + 1] = color.g * intensity;
      colors[offset + 2] = color.b * intensity;
    }

    return { positions, colors };
  }, []);

  const fieldGeometry = useMemo(() => {
    const random = createSeededRandom(0xc7be4127);
    const positions = new Float32Array(FIELD_PARTICLE_COUNT * 3);
    const colors = new Float32Array(FIELD_PARTICLE_COUNT * 3);

    for (let index = 0; index < FIELD_PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const depth = -1.5 - random() * 8;

      positions[offset] = (random() - 0.5) * 18;
      positions[offset + 1] = (random() - 0.5) * 10;
      positions[offset + 2] = depth;

      const color = index % 9 === 0 ? MAGENTA : CYAN;
      const intensity = 0.18 + random() * 0.62;
      colors[offset] = color.r * intensity;
      colors[offset + 1] = color.g * intensity;
      colors[offset + 2] = color.b * intensity;
    }

    return { positions, colors };
  }, []);

  const networkGeometry = useMemo(() => {
    const random = createSeededRandom(0x82a1f0d3);
    const positions = new Float32Array(NETWORK_SEGMENT_COUNT * 6);
    const colors = new Float32Array(NETWORK_SEGMENT_COUNT * 6);

    for (let index = 0; index < NETWORK_SEGMENT_COUNT; index += 1) {
      const offset = index * 6;
      const startX = (random() - 0.5) * 17;
      const startY = (random() - 0.5) * 9;
      const startZ = -2.2 - random() * 7;
      const horizontal = random() > 0.38;
      const length = 0.18 + random() * 0.85;
      const endX = startX + (horizontal ? length : 0);
      const endY = startY + (horizontal ? 0 : length);

      positions.set(
        [startX, startY, startZ, endX, endY, startZ],
        offset,
      );

      const color = index % 7 === 0 ? MAGENTA : CYAN;
      const intensity = 0.12 + random() * 0.28;

      for (let vertex = 0; vertex < 2; vertex += 1) {
        const colorOffset = offset + vertex * 3;
        colors[colorOffset] = color.r * intensity;
        colors[colorOffset + 1] = color.g * intensity;
        colors[colorOffset + 2] = color.b * intensity;
      }
    }

    return { positions, colors };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerTargetRef.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        pointerTargetRef.current.set(0, 0);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerEnd, { passive: true });
    window.addEventListener("pointercancel", handlePointerEnd, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const materials = Array.isArray(grid.material)
      ? grid.material
      : [grid.material];

    materials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.11;
      material.depthWrite = false;
      material.blending = THREE.AdditiveBlending;
      material.toneMapped = false;
    });
  }, []);

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sectionRatiosRef.current[entry.target.id] = entry.intersectionRatio;
        });

        activeSectionRef.current = sections
          .map((section) => ({
            id: section.id,
            ratio: sectionRatiosRef.current[section.id] ?? 0,
          }))
          .sort((a, b) => b.ratio - a.ratio)[0]?.id ?? "home";
      },
      {
        root: null,
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0, 0.12, 0.28, 0.5, 0.72, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateMetrics = () => {
      frame = 0;

      if (
        !stageLookupDoneRef.current ||
        (stageRef.current && !stageRef.current.isConnected)
      ) {
        stageRef.current = document.querySelector<HTMLElement>(
          "[data-horizontal-stage]",
        );
        stageLookupDoneRef.current = true;
      }

      const stage = stageRef.current;
      const useHorizontalMotion = Boolean(
        window.innerWidth >= 1024 &&
        stage &&
        stage.scrollWidth > stage.clientWidth + 8,
      );
      const scrollingElement =
        document.scrollingElement ?? document.documentElement;
      const horizontalScroll = window.scrollX + (stage?.scrollLeft ?? 0);
      const maxHorizontalScroll = stage
        ? Math.max(stage.scrollWidth - stage.clientWidth, 1)
        : Math.max(document.documentElement.scrollWidth - window.innerWidth, 1);
      const verticalScroll = window.scrollY || scrollingElement.scrollTop;
      const maxVerticalScroll = Math.max(
        scrollingElement.scrollHeight - window.innerHeight,
        1,
      );

      motionMetricsRef.current = {
        useHorizontalMotion,
        horizontalScroll,
        verticalScroll,
        motionOffset: useHorizontalMotion ? horizontalScroll : verticalScroll,
        maxMotionOffset: useHorizontalMotion
          ? maxHorizontalScroll
          : maxVerticalScroll,
      };
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateMetrics);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    const stage = document.querySelector<HTMLElement>("[data-horizontal-stage]");
    stage?.addEventListener("scroll", requestUpdate, { passive: true });

    const resizeObserver = new ResizeObserver(requestUpdate);
    resizeObserver.observe(document.documentElement);
    if (stage) resizeObserver.observe(stage);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      stage?.removeEventListener("scroll", requestUpdate);
      resizeObserver.disconnect();
    };
  }, []);

  useFrame((state, delta) => {
    const core = coreRef.current;
    const field = fieldRef.current;
    const grid = gridRef.current;
    if (!core || !field || !grid || !documentVisible) return;

    frameAccumulatorRef.current += delta;
    const targetFrameTime = 1 / renderProfile.targetFps;
    if (frameAccumulatorRef.current < targetFrameTime) return;

    const effectiveDelta = Math.min(frameAccumulatorRef.current, 1 / 18);
    frameAccumulatorRef.current = 0;

    const {
      useHorizontalMotion,
      horizontalScroll,
      verticalScroll,
      motionOffset,
      maxMotionOffset,
    } = motionMetricsRef.current;
    const motionAxis = useHorizontalMotion ? "horizontal" : "vertical";

    if (motionAxisRef.current !== motionAxis) {
      motionAxisRef.current = motionAxis;
      previousScrollRef.current = motionOffset;
      hasScrollSampleRef.current = false;
      scrollVelocityRef.current = 0;
    }

    const targetProgress = THREE.MathUtils.clamp(
      motionOffset / maxMotionOffset,
      0,
      1,
    );
    const rawVelocity = hasScrollSampleRef.current
      ? (motionOffset - previousScrollRef.current) /
        Math.max(effectiveDelta, 1 / 240)
      : 0;
    const boundedVelocity = THREE.MathUtils.clamp(
      rawVelocity,
      -6000,
      6000,
    );

    hasScrollSampleRef.current = true;
    previousScrollRef.current = motionOffset;
    scrollVelocityRef.current = THREE.MathUtils.lerp(
      scrollVelocityRef.current,
      boundedVelocity,
      1 - Math.exp(-effectiveDelta * 8),
    );
    scrollProgressRef.current = THREE.MathUtils.lerp(
      scrollProgressRef.current,
      targetProgress,
      1 - Math.exp(-effectiveDelta * 5),
    );
    pointerRef.current.lerp(
      pointerTargetRef.current,
      1 - Math.exp(-effectiveDelta * 3.4),
    );

    const elapsed = reduceMotion ? 0 : state.clock.elapsedTime;
    const progress = scrollProgressRef.current;
    const phase = progress * Math.PI * 6;
    const velocity = scrollVelocityRef.current;
    const warp = Math.min(Math.abs(velocity) * 0.00032, 1);
    const compact = size.width < 1024;
    const smoothing = 1 - Math.exp(-effectiveDelta * 3.8);
    corePointsRef.current?.geometry.setDrawRange(
      0,
      renderProfile.coreParticles,
    );
    fieldPointsRef.current?.geometry.setDrawRange(
      0,
      renderProfile.fieldParticles,
    );
    networkLinesRef.current?.geometry.setDrawRange(
      0,
      renderProfile.networkSegments * 2,
    );
    const activeSection = activeSectionRef.current;
    const sectionX = {
      home: 0,
      about: compact ? 0.45 : 1.85,
      projects: compact ? -0.45 : -2.15,
      journey: compact ? 0.25 : 1.45,
      contact: 0,
      "about-overview": compact ? 0.35 : 1.6,
      "about-skills": compact ? 0.2 : 1.9,
      "about-documents": compact ? 0.3 : 1.45,
    }[activeSection] ?? 0;
    const sectionY = {
      home: 0,
      about: compact ? -0.4 : 0.25,
      projects: compact ? -0.5 : 0,
      journey: compact ? 0.35 : -0.12,
      contact: compact ? -0.4 : 0,
      "about-overview": compact ? -0.45 : 0.15,
      "about-skills": compact ? 0.25 : 0.18,
      "about-documents": compact ? 0.45 : 0.15,
    }[activeSection] ?? 0;
    const sectionScale = activeSection === "about" || activeSection === "about-overview"
      ? 1.12
      : activeSection === "contact"
        ? 0.62
        : activeSection === "journey"
          ? 0.78
        : activeSection === "about-skills"
          ? compact ? 0.58 : 0.72
          : 0.94;

    if (cameraRigRef.current) {
      const rigTargetZ = activeSection === "about" || activeSection === "about-overview"
        ? 0.52
        : activeSection === "projects"
          ? -0.3
          : activeSection === "contact"
            ? -0.48
            : 0;

      cameraRigRef.current.position.x = THREE.MathUtils.damp(
        cameraRigRef.current.position.x,
        -pointerRef.current.x * (compact ? 0.06 : 0.16),
        3.2,
        effectiveDelta,
      );
      cameraRigRef.current.position.y = THREE.MathUtils.damp(
        cameraRigRef.current.position.y,
        -pointerRef.current.y * (compact ? 0.05 : 0.12),
        3.2,
        effectiveDelta,
      );
      cameraRigRef.current.position.z = THREE.MathUtils.damp(
        cameraRigRef.current.position.z,
        rigTargetZ,
        2.6,
        effectiveDelta,
      );
    }
    const coreTargetX = useHorizontalMotion
      ? Math.cos(progress * Math.PI * 1.5) * 2.3 +
        pointerRef.current.x * 0.28
      : sectionX +
        Math.sin(progress * Math.PI * 5) * (compact ? 0.18 : 0.28) +
        pointerRef.current.x * (compact ? 0.12 : 0.22);
    const coreTargetY = useHorizontalMotion
      ? Math.sin(progress * Math.PI * 3) * 0.78 +
        pointerRef.current.y * 0.2
      : sectionY +
        Math.cos(progress * Math.PI * 4) * (compact ? 0.16 : 0.25) +
        pointerRef.current.y * (compact ? 0.12 : 0.2);
    const coreScale =
      ((compact ? 0.66 : 0.92) + warp * 0.12) * sectionScale;

    core.position.x = THREE.MathUtils.lerp(
      core.position.x,
      coreTargetX,
      smoothing,
    );
    core.position.y = THREE.MathUtils.lerp(
      core.position.y,
      coreTargetY,
      smoothing,
    );
    core.position.z = THREE.MathUtils.lerp(
      core.position.z,
      -0.25 - warp * 0.55,
      smoothing,
    );
    core.rotation.x = THREE.MathUtils.lerp(
      core.rotation.x,
        elapsed * 0.035 -
        pointerRef.current.y * 0.18 +
        progress * (useHorizontalMotion ? 0.7 : 2.4),
      smoothing,
    );
    core.rotation.y = THREE.MathUtils.lerp(
      core.rotation.y,
        elapsed * 0.052 +
        pointerRef.current.x * 0.24 +
        phase * (useHorizontalMotion ? 0.22 : 0.08),
      smoothing,
    );
    core.rotation.z = THREE.MathUtils.lerp(
      core.rotation.z,
      Math.sin(phase) * 0.12 -
        Math.sign(velocity) * warp * (useHorizontalMotion ? 0.08 : 0.16),
      smoothing,
    );
    core.scale.x = THREE.MathUtils.lerp(
      core.scale.x,
      coreScale * (useHorizontalMotion ? 1 + warp * 0.38 : 1 - warp * 0.07),
      smoothing,
    );
    core.scale.y = THREE.MathUtils.lerp(
      core.scale.y,
      coreScale * (useHorizontalMotion ? 1 - warp * 0.08 : 1 + warp * 0.42),
      smoothing,
    );
    core.scale.z = THREE.MathUtils.lerp(
      core.scale.z,
      coreScale,
      smoothing,
    );

    field.position.x = THREE.MathUtils.lerp(
      field.position.x,
      useHorizontalMotion
        ? Math.sin(phase * 0.55) * 0.72 - pointerRef.current.x * 0.32
        : Math.sin(phase * 0.38) * 0.28 - pointerRef.current.x * 0.12,
      smoothing,
    );
    field.position.y = THREE.MathUtils.lerp(
      field.position.y,
      useHorizontalMotion
        ? pointerRef.current.y * 0.24
        : Math.cos(phase * 0.46) * 0.58 + pointerRef.current.y * 0.16,
      smoothing,
    );
    field.position.z = THREE.MathUtils.lerp(
      field.position.z,
      -warp * 0.9,
      smoothing,
    );
    field.rotation.z = THREE.MathUtils.lerp(
      field.rotation.z,
      progress * (useHorizontalMotion ? 0.16 : -0.28) +
        pointerRef.current.x * 0.018,
      smoothing,
    );
    field.rotation.x = THREE.MathUtils.lerp(
      field.rotation.x,
      pointerRef.current.y * 0.025 + Math.sin(elapsed * 0.11) * 0.012,
      smoothing,
    );
    field.rotation.y = THREE.MathUtils.lerp(
      field.rotation.y,
      pointerRef.current.x * 0.03 + Math.cos(elapsed * 0.09) * 0.015,
      smoothing,
    );

    const gridStep = 30 / 42;
    grid.position.x = THREE.MathUtils.lerp(
      grid.position.x,
      useHorizontalMotion ? 0 : Math.sin(phase * 0.32) * 0.2,
      smoothing,
    );
    grid.position.y = THREE.MathUtils.lerp(
      grid.position.y,
      useHorizontalMotion
        ? -3.1
        : -gridStep / 2 + ((verticalScroll * 0.006) % gridStep),
      smoothing,
    );
    grid.position.z = THREE.MathUtils.lerp(
      grid.position.z,
      useHorizontalMotion
        ? -5 + ((horizontalScroll * 0.006) % gridStep)
        : -6.4,
      smoothing,
    );
    grid.rotation.x = THREE.MathUtils.lerp(
      grid.rotation.x,
      useHorizontalMotion ? 0 : Math.PI / 2,
      smoothing,
    );
    grid.rotation.z = THREE.MathUtils.lerp(
      grid.rotation.z,
      pointerRef.current.x * 0.025 -
        Math.sign(velocity) * warp * (useHorizontalMotion ? 0.01 : 0.025),
      smoothing,
    );

    if (primaryRingRef.current) {
      primaryRingRef.current.rotation.z =
        elapsed * 0.24 + phase * (useHorizontalMotion ? 0.32 : 0.12);
      primaryRingRef.current.rotation.x = useHorizontalMotion
        ? Math.PI / 2
        : Math.PI / 2 + Math.sin(phase) * 0.24;
    }
    if (secondaryRingRef.current) {
      secondaryRingRef.current.rotation.x =
        Math.PI / 2 +
        elapsed * 0.16 -
        phase * (useHorizontalMotion ? 0.18 : 0.34);
    }
    if (satelliteRef.current) {
      satelliteRef.current.position.x = useHorizontalMotion
        ? Math.cos(elapsed * 0.42 + phase) * 4.8
        : Math.sin(elapsed * 0.42 + phase * 0.62) * 1.55;
      satelliteRef.current.position.y = useHorizontalMotion
        ? Math.sin(elapsed * 0.55 + phase * 0.7) * 2.35
        : Math.cos(elapsed * 0.55 + phase) * 2.75;
      satelliteRef.current.rotation.x = elapsed * 0.32 + phase;
      satelliteRef.current.rotation.y = elapsed * 0.46 + phase * 0.5;
    }
    if (fieldMaterialRef.current) {
      const calmFactor = activeSection === "contact" ? 0.55 : 1;
      fieldMaterialRef.current.opacity = (0.48 + warp * 0.24) * calmFactor;
      fieldMaterialRef.current.size = 0.026 + warp * 0.024;
    }
    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = 0.22 + warp * 0.18;
    }
    if (coreWireMaterialRef.current) {
      coreWireMaterialRef.current.opacity = THREE.MathUtils.lerp(
        coreWireMaterialRef.current.opacity,
        activeSection === "about" || activeSection === "about-overview"
          ? 0.16
          : 0.075,
        smoothing,
      );
    }
    if (skillOrbitRef.current) {
      const targetScale = activeSection === "about-skills" ? (compact ? 0.45 : 0.72) : 0.001;
      skillOrbitRef.current.scale.setScalar(
        THREE.MathUtils.lerp(
          skillOrbitRef.current.scale.x,
          targetScale,
          smoothing,
        ),
      );
      skillOrbitRef.current.rotation.z = elapsed * 0.2 + phase * 0.08;
      skillOrbitRef.current.rotation.y = elapsed * 0.14;
    }
    if (documentGroupRef.current) {
      const targetScale = activeSection === "about-documents" ? 1 : 0.001;
      documentGroupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(
          documentGroupRef.current.scale.x,
          targetScale,
          smoothing,
        ),
      );
      documentGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        documentGroupRef.current.rotation.y,
        pointerRef.current.x * 0.2 + Math.sin(elapsed * 0.32) * 0.1,
        smoothing,
      );
      documentGroupRef.current.position.y =
        Math.sin(elapsed * 0.48) * 0.14;
    }
  });

  return (
    <group ref={cameraRigRef}>
      <group ref={fieldRef}>
        <points ref={fieldPointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[fieldGeometry.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[fieldGeometry.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={fieldMaterialRef}
            size={0.026}
            sizeAttenuation
            transparent
            opacity={0.48}
            vertexColors
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>

        <lineSegments ref={networkLinesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[networkGeometry.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[networkGeometry.colors, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            ref={lineMaterialRef}
            transparent
            opacity={0.22}
            vertexColors
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </lineSegments>
      </group>

      <gridHelper
        ref={gridRef}
        args={[30, 42, "#00f3ff", "#123252"]}
        position={[0, -3.1, -5]}
      />

      <group ref={coreRef} position={[2.3, 0, -0.25]}>
        <points ref={corePointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[coreGeometry.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[coreGeometry.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.035}
            sizeAttenuation
            transparent
            opacity={0.82}
            vertexColors
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>

        <mesh scale={0.94}>
          <icosahedronGeometry args={[1.8, 2]} />
          <meshBasicMaterial
            ref={coreWireMaterialRef}
            color="#00f3ff"
            wireframe
            transparent
            opacity={0.075}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <mesh
          ref={primaryRingRef}
          rotation={[Math.PI / 2, 0.2, 0.35]}
          scale={1.12}
        >
          <torusGeometry args={[1.78, 0.012, 6, 96]} />
          <meshBasicMaterial
            color="#ff0055"
            transparent
            opacity={0.42}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <mesh
          ref={secondaryRingRef}
          rotation={[0.35, Math.PI / 2, -0.25]}
          scale={1.05}
        >
          <torusGeometry args={[1.86, 0.009, 6, 96]} />
          <meshBasicMaterial
            color="#00f3ff"
            transparent
            opacity={0.32}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <mesh scale={0.76}>
          <sphereGeometry args={[1.65, 24, 24]} />
          <meshBasicMaterial
            color="#071b34"
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>
      </group>

      <group ref={skillOrbitRef} scale={0.001} position={[0, 0, -0.8]}>
        {Array.from({ length: 10 }, (_, index) => {
          const angle = (index / 10) * Math.PI * 2;
          const radius = index % 2 === 0 ? 2.7 : 3.35;

          return (
            <mesh
              key={index}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius * 0.56,
                Math.sin(angle * 2) * 0.65,
              ]}
              rotation={[angle, angle * 0.7, 0]}
            >
              <octahedronGeometry args={[index % 3 === 0 ? 0.22 : 0.13, 0]} />
              <meshBasicMaterial
                color={index % 3 === 0 ? "#ff0055" : "#00f3ff"}
                wireframe
                transparent
                opacity={0.62}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
          );
        })}
      </group>

      <group ref={documentGroupRef} scale={0.001} position={[0, 0, -0.9]}>
        {[-1, 0, 1].map((offset, index) => (
          <mesh
            key={offset}
            position={[
              offset * 0.78,
              Math.abs(offset) * -0.12,
              -Math.abs(offset) * 0.25,
            ]}
            rotation={[0.08 * offset, -0.16 * offset, 0.05 * offset]}
          >
            <boxGeometry args={[1.05, 1.45, 0.06]} />
            <meshBasicMaterial
              color={index === 1 ? "#ff0055" : "#00f3ff"}
              wireframe
              transparent
              opacity={index === 1 ? 0.58 : 0.42}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <mesh ref={satelliteRef} position={[-4.8, 2.2, -2.8]}>
        <octahedronGeometry args={[0.34, 0]} />
        <meshBasicMaterial
          color="#ff0055"
          wireframe
          transparent
          opacity={0.46}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default function CyberBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [maxDpr, setMaxDpr] = useState(1);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setDocumentVisible(!document.hidden);
    const updateDpr = () => setMaxDpr(getMaxDpr());

    updateVisibility();
    updateDpr();
    document.addEventListener("visibilitychange", updateVisibility);
    window.addEventListener("resize", updateDpr, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
      window.removeEventListener("resize", updateDpr);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 7.8], fov: 52, near: 0.1, far: 50 }}
        dpr={[0.75, maxDpr]}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#03050a", 7, 19]} />
        <CyberWorld
          reduceMotion={reduceMotion}
          documentVisible={documentVisible}
        />
        <AdaptiveDpr pixelated />
      </Canvas>

      <div className="absolute inset-0 hidden bg-[radial-gradient(circle_at_70%_38%,rgba(0,243,255,0.07),transparent_26%),radial-gradient(circle_at_24%_64%,rgba(255,0,85,0.045),transparent_24%),linear-gradient(90deg,rgba(3,4,6,0.42)_0%,rgba(3,4,6,0.08)_50%,rgba(3,4,6,0.42)_100%)] lg:block" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(0,243,255,0.075),transparent_28%),radial-gradient(circle_at_42%_76%,rgba(255,0,85,0.05),transparent_26%),linear-gradient(180deg,rgba(3,4,6,0.38)_0%,rgba(3,4,6,0.08)_48%,rgba(3,4,6,0.46)_100%)] lg:hidden" />
      <div
        className="absolute inset-0 hidden opacity-[0.035] lg:block"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0, transparent 3px, rgba(0,243,255,0.32) 4px)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] lg:hidden"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(0,243,255,0.32) 4px)",
        }}
      />
    </div>
  );
}
