"use client";
import { BufferGeometry, Float32BufferAttribute } from "three";
import BlenderAsset from "../BlenderAsset";
import { useAsset } from "../geometry/useAsset";
import { useMaterials, type Quality } from "../materials/SystemMaterials";
export default function CodeArchitecture({ quality }: { quality: Quality }) {
  const materials = useMaterials();
  const grid = useAsset(() => {
    const positions: number[] = [];
    for (let i = -4; i <= 4; i++) {
      positions.push(
        i,
        -2.1,
        -3,
        i,
        -2.1,
        2,
        -4,
        -2.1,
        i * 0.6,
        4,
        -2.1,
        i * 0.6,
      );
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);
  return (
    <group>
      <lineSegments geometry={grid} material={materials.grid} />
      {quality !== "low" &&
        [
          "api",
          "cloud",
          "deployment",
          "architecture",
          "ui",
          "code",
          "performance",
        ]
          .slice(0, quality === "high" ? 7 : 4)
          .map((key, i) => (
            <group
              key={key}
              scale={0.35}
              position={[(i - 3) * 0.9, 1.85 + (i % 2) * 0.35, -2.2]}
            >
              <BlenderAsset name={`symbol-${key}`} />
            </group>
          ))}
    </group>
  );
}
