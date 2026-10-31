import { ExtrudeGeometry, Shape } from 'three';

/** Closed annular sector, extruded with machined bevels and real side walls. */
export function sector(inner: number, outer: number, angle: number, depth: number, detail: number) {
  const shape = new Shape();
  const start = -angle / 2, end = angle / 2;
  shape.moveTo(inner * Math.cos(start), inner * Math.sin(start));
  shape.lineTo(outer * Math.cos(start), outer * Math.sin(start));
  shape.absarc(0, 0, outer, start, end, false);
  shape.lineTo(inner * Math.cos(end), inner * Math.sin(end));
  shape.absarc(0, 0, inner, end, start, true);
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: true, bevelSegments: 2, bevelSize: .012, bevelThickness: .012, curveSegments: detail });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

export function emblem() {
  const shape = new Shape();
  // An asymmetric lightning-cut F, with a stepped mechanical silhouette.
  const points = [[-.38,-.48],[-.38,.48],[.38,.48],[.29,.26],[-.12,.26],[-.12,.08],[.22,.08],[.12,-.14],[-.12,-.14],[-.12,-.48]];
  points.forEach(([x,y],i) => i ? shape.lineTo(x,y) : shape.moveTo(x,y));
  shape.closePath();
  return new ExtrudeGeometry(shape, { depth: .16, bevelEnabled: true, bevelSegments: 3, bevelSize: .025, bevelThickness: .025, steps: 1 });
}
