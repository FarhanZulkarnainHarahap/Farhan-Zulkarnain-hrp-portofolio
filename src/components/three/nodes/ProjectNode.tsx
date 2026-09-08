"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import {
  Group,
  MathUtils,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";
import { useBlenderAsset } from "../BlenderAsset";
import { useScene } from "@/components/kinetic/SceneState";
import { getProjectSlug } from "@/lib/portfolio/projects";
import {
  validImageSource,
  cloudinaryImageLoader,
  isCloudinaryImage,
} from "@/lib/image-loader";
import { indexGeometry } from "../geometry/assets";
import { useAsset } from "../geometry/useAsset";
import { useMaterials } from "../materials/SystemMaterials";
function Thumbnail({ src }: { src: string }) {
  const [texture, setTexture] = useState<Texture | null>(null);
  useEffect(() => {
    let alive = true;
    if (!validImageSource(src)) return;
    const url = src;
    const loaded = new TextureLoader().load(
      isCloudinaryImage(url)
        ? cloudinaryImageLoader({ src: url, width: 512, quality: 75 })
        : url,
      (t) => {
        t.colorSpace = SRGBColorSpace;
        if (alive) setTexture(t);
        else t.dispose();
      },
      undefined,
      () => {},
    );
    return () => {
      alive = false;
      loaded.dispose();
    };
  }, [src]);
  return texture ? (
    <mesh position={[0, 0.1, 0.13]}>
      <planeGeometry args={[1.93, 1.1]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  ) : null;
}
export default function ProjectNode() {
  const { mode, projects, selected, setActive } = useScene();
  const router = useRouter();
  const root = useRef<Group>(null),
    [hover, setHover] = useState(false),
    [enter, setEnter] = useState<string | null>(null);
  const model = useBlenderAsset("project-module"),
    material = useMaterials();
  const shutters = useMemo(
    () => [
      model.getObjectByName("Shutter_left"),
      model.getObjectByName("Shutter_right"),
    ],
    [model],
  );
  const project = projects[Math.min(selected, projects.length - 1)];
  const digits = useAsset(() => indexGeometry(selected + 1), [selected]);
  useEffect(() => {
    if (!enter) return;
    const timer = setTimeout(
      () => router.push(enter),
      180,
    );
    return () => clearTimeout(timer);
  }, [enter, router]);
  useFrame((_, dt) => {
    if (!root.current) return;
    const d = Math.min(dt, 0.05);
    root.current.scale.setScalar(
      MathUtils.damp(
        root.current.scale.x,
        mode === "project" && project ? (enter ? 1.8 : 1.5) : 0.001,
        5,
        d,
      ),
    );
    root.current.position.z = MathUtils.damp(
      root.current.position.z,
      enter ? 1.4 : 0.5,
      5,
      d,
    );
    shutters.forEach((shutter, i) => {
      if (shutter)
        shutter.position.x = MathUtils.damp(
          shutter.position.x,
          (i ? 1 : -1) * (hover ? 1.25 : 1.01),
          6,
          d,
        );
    });
  });
  return (
    <group
      ref={root}
      scale={0.001}
      position={[0, -0.3, 0.5]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        if (project) setActive(project.title);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (project) setEnter(`/projects/${getProjectSlug(project)}`);
      }}
    >
      <primitive object={model} dispose={null} />
      {project && <Thumbnail key={project.imageUrl} src={project.imageUrl} />}
      <mesh
        geometry={digits}
        material={material.ink}
        scale={0.32}
        position={[-0.65, -0.65, 0.17]}
      />
    </group>
  );
}
