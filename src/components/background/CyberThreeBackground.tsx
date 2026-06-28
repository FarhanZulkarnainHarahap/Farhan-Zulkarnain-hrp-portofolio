"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type {
  BufferGeometry,
  Group,
  Material,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

const createSeededRandom = () => {
  let seed = 0x5f3759df;

  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

export default function CyberThreeBackground() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enabled = [
    "/",
    "/home",
    "/explore",
    "/about",
    "/projects",
    "/contact",
    "/dashboard/user",
  ].includes(pathname);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let animationFrame = 0;
    let renderer: WebGLRenderer | null = null;
    let scene: Scene | null = null;
    let camera: PerspectiveCamera | null = null;
    let world: Group | null = null;
    let cleanupScene = () => {};

    const initialise = async () => {
      const THREE = await import("three");
      if (cancelled) return;

      const compact = window.matchMedia("(max-width: 767px)").matches;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const random = createSeededRandom();

      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: !compact,
          powerPreference: "high-performance",
        });
      } catch {
        canvas.dataset.webglUnavailable = "true";
        return;
      }

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.15 : 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x03050a, compact ? 0.065 : 0.052);

      camera = new THREE.PerspectiveCamera(54, 1, 0.1, 70);
      camera.position.set(0, 1.3, 8.8);
      camera.lookAt(0, -0.4, -4);

      world = new THREE.Group();
      scene.add(world);

      const particleCount = compact ? 130 : 360;
      const particlePositions = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);
      const particlePalette = [0x3b82f6, 0x22d3ee, 0x8b5cf6, 0xf59e0b];

      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        particlePositions[offset] = (random() - 0.5) * 30;
        particlePositions[offset + 1] = (random() - 0.5) * 16;
        particlePositions[offset + 2] = -2 - random() * 20;

        const color = new THREE.Color(
          particlePalette[Math.floor(random() * particlePalette.length)],
        );
        const intensity = 0.42 + random() * 0.58;
        particleColors[offset] = color.r * intensity;
        particleColors[offset + 1] = color.g * intensity;
        particleColors[offset + 2] = color.b * intensity;
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(particlePositions, 3),
      );
      particleGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(particleColors, 3),
      );

      const particleMaterial = new THREE.PointsMaterial({
        size: compact ? 0.055 : 0.045,
        transparent: true,
        opacity: 0.84,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      world.add(particles);

      const grid = new THREE.GridHelper(44, compact ? 30 : 44, 0xf59e0b, 0x2563eb);
      grid.position.set(0, -3.5, -8);
      const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
      gridMaterials.forEach((material) => {
        material.transparent = true;
        material.opacity = compact ? 0.11 : 0.16;
        material.depthWrite = false;
      });
      world.add(grid);

      const circuitGroup = new THREE.Group();
      const circuitCount = compact ? 9 : 24;

      for (let index = 0; index < circuitCount; index += 1) {
        const side = index % 2 === 0 ? -1 : 1;
        const x = side * (5.2 + random() * 7);
        const y = -4.5 + random() * 10;
        const z = -3 - random() * 11;
        const horizontal = side * (0.7 + random() * 2.2);
        const vertical = (random() - 0.5) * 2.3;
        const points = [
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(x - horizontal, y, z),
          new THREE.Vector3(x - horizontal, y + vertical, z),
          new THREE.Vector3(x - horizontal * 1.8, y + vertical, z),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: index % 5 === 0 ? 0xf59e0b : index % 3 === 0 ? 0x8b5cf6 : 0x2563eb,
          transparent: true,
          opacity: 0.16 + random() * 0.2,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        circuitGroup.add(new THREE.Line(geometry, material));

        const nodeGeometry = new THREE.BufferGeometry().setFromPoints([
          points[points.length - 1],
        ]);
        const nodeMaterial = new THREE.PointsMaterial({
          color: index % 5 === 0 ? 0xfbbf24 : 0x60a5fa,
          size: compact ? 0.075 : 0.095,
          transparent: true,
          opacity: 0.78,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        circuitGroup.add(new THREE.Points(nodeGeometry, nodeMaterial));
      }

      world.add(circuitGroup);

      const createWireObject = (
        geometry: BufferGeometry,
        color: number,
        position: [number, number, number],
        scale: number,
      ) => {
        const edges = new THREE.EdgesGeometry(geometry);
        geometry.dispose();
        const material = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: compact ? 0.08 : 0.13,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const object = new THREE.LineSegments(edges, material);
        object.position.set(...position);
        object.scale.setScalar(scale);
        world?.add(object);
        return object;
      };

      const leftPolyhedron = createWireObject(
        new THREE.IcosahedronGeometry(1.4, 0),
        0x8b5cf6,
        [-7.7, 2.5, -8],
        1.15,
      );
      const rightPolyhedron = createWireObject(
        new THREE.OctahedronGeometry(1.4, 0),
        0xf59e0b,
        [7.8, -0.2, -9],
        1.35,
      );
      const rearRing = createWireObject(
        new THREE.TorusGeometry(2.7, 0.035, 6, 64),
        0x22d3ee,
        [5.9, 2.7, -13],
        1,
      );

      const mouseTarget = { x: 0, y: 0 };
      const mouseCurrent = { x: 0, y: 0 };

      const handlePointerMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        mouseTarget.x = (event.clientX / window.innerWidth - 0.5) * 0.16;
        mouseTarget.y = (event.clientY / window.innerHeight - 0.5) * 0.1;
      };

      const handleResize = () => {
        if (!renderer || !camera) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
      };

      let previousTime = performance.now();
      let elapsed = 0;

      const render = (time: number) => {
        if (!renderer || !scene || !camera || !world) return;

        const delta = Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;
        elapsed += delta;

        mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.035;
        mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.035;

        world.rotation.y = mouseCurrent.x;
        world.rotation.x = mouseCurrent.y;
        particles.rotation.y = elapsed * 0.008;
        particles.position.y = Math.sin(elapsed * 0.15) * 0.18;
        circuitGroup.position.y = Math.sin(elapsed * 0.22) * 0.08;
        leftPolyhedron.rotation.x += delta * 0.035;
        leftPolyhedron.rotation.y += delta * 0.055;
        rightPolyhedron.rotation.x -= delta * 0.04;
        rightPolyhedron.rotation.y += delta * 0.045;
        rearRing.rotation.z += delta * 0.018;

        renderer.render(scene, camera);
        animationFrame = window.requestAnimationFrame(render);
      };

      const handleVisibilityChange = () => {
        if (reducedMotion) {
          if (renderer && scene && camera) renderer.render(scene, camera);
          return;
        }

        if (document.hidden) {
          window.cancelAnimationFrame(animationFrame);
          return;
        }

        previousTime = performance.now();
        animationFrame = window.requestAnimationFrame(render);
      };

      handleResize();
      window.addEventListener("resize", handleResize, { passive: true });
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.addEventListener("visibilitychange", handleVisibilityChange);

      if (reducedMotion) {
        renderer.render(scene, camera);
      } else {
        animationFrame = window.requestAnimationFrame(render);
      }

      cleanupScene = () => {
        window.cancelAnimationFrame(animationFrame);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("visibilitychange", handleVisibilityChange);

        scene?.traverse((object: Object3D) => {
          const disposable = object as Object3D & {
            geometry?: BufferGeometry;
            material?: Material | Material[];
          };
          disposable.geometry?.dispose();
          const materials = Array.isArray(disposable.material)
            ? disposable.material
            : disposable.material
              ? [disposable.material]
              : [];
          materials.forEach((material) => material.dispose());
        });

        renderer?.dispose();
        renderer?.forceContextLoss();
      };
    };

    void initialise();

    return () => {
      cancelled = true;
      cleanupScene();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="cyber-three-background pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
