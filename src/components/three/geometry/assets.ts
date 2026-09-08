import { BufferGeometry, ExtrudeGeometry, Path, Shape, Vector2 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
export const SYMBOLS = [
  "frontend",
  "backend",
  "database",
  "infrastructure",
  "creative",
  "api",
  "cloud",
  "deployment",
  "code",
  "performance",
] as const;
export type SymbolKind = (typeof SYMBOLS)[number];
type Point = readonly [number, number];
/** All contours are authored for Farhan. Units are local model coordinates. */
export function plate(
  points: readonly Point[],
  depth = 0.1,
  holes: readonly Point[][] = [],
) {
  const shape = new Shape(points.map(([x, y]) => new Vector2(x, y)));
  for (const contour of holes)
    shape.holes.push(new Path(contour.map(([x, y]) => new Vector2(x, y))));
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.018,
    bevelThickness: 0.015,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 8,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}
export function chamfer(w: number, h: number, cut = 0.12): Point[] {
  return [
    [-w / 2 + cut, -h / 2],
    [w / 2 - cut, -h / 2],
    [w / 2, -h / 2 + cut],
    [w / 2, h / 2 - cut],
    [w / 2 - cut, h / 2],
    [-w / 2 + cut, h / 2],
    [-w / 2, h / 2 - cut],
    [-w / 2, -h / 2 + cut],
  ];
}
export function frame(w: number, h: number, depth = 0.1, rim = 0.08) {
  return plate(chamfer(w, h), depth, [
    chamfer(w - rim * 2, h - rim * 2, 0.08).reverse(),
  ]);
}
function merged(parts: BufferGeometry[]) {
  const normalized = parts.map((part) => {
    const geo = part.index ? part.toNonIndexed() : part.clone();
    for (const name of Object.keys(geo.attributes))
      if (!["position", "normal"].includes(name)) geo.deleteAttribute(name);
    part.dispose();
    return geo;
  });
  const result = mergeGeometries(normalized)!;
  normalized.forEach((part) => part.dispose());
  result.computeBoundingSphere();
  return result;
}
function bar(x: number, y: number, w: number, h: number, z = 0) {
  return plate(chamfer(w, h, Math.min(w, h) * 0.2), 0.09).translate(x, y, z);
}
export function indexGeometry(value: number) {
  const digits = [
    [0, 1, 2, 3, 4, 5],
    [1, 2],
    [0, 1, 6, 4, 3],
    [0, 1, 6, 2, 3],
    [5, 6, 1, 2],
    [0, 5, 6, 2, 3],
    [0, 5, 6, 4, 2, 3],
    [0, 1, 2],
    [0, 1, 2, 3, 4, 5, 6],
    [0, 1, 2, 3, 5, 6],
  ];
  const locations = [
    [0, 0.2, 0.2, 0.035],
    [0.11, 0.1, 0.035, 0.18],
    [0.11, -0.1, 0.035, 0.18],
    [0, -0.2, 0.2, 0.035],
    [-0.11, -0.1, 0.035, 0.18],
    [-0.11, 0.1, 0.035, 0.18],
    [0, 0, 0.2, 0.035],
  ];
  return merged(
    String(value)
      .padStart(2, "0")
      .split("")
      .flatMap((digit, index) =>
        digits[Number(digit)].map((n) => {
          const [x, y, w, h] = locations[n];
          return bar(x + (index - 0.5) * 0.32, y, w, h);
        }),
      ),
  );
}
