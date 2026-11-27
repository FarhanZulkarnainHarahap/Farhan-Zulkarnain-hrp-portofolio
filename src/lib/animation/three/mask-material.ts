/**
 * GLSL object masking (Fase K3): bottom-to-top reveal + noise dissolve for any three.js
 * MeshStandardMaterial / MeshPhysicalMaterial, added through onBeforeCompile so the PBR lighting
 * stays three's own. GLSL owns these uniforms; their values come from Theatre or scroll progress
 * and are written in useFrame (never through React props per frame).
 *
 *   h        = (y - uMaskMin) / (uMaskMax - uMaskMin)               0 at the bottom, 1 at the top
 *              y = object-space Y ("object": the mask moves with the object — reveals) or
 *                  world-space Y ("world": a fixed horizon — global scroll masking, Fase 7)
 *   edge     = uMaskProgress + (noise(worldPos) - 0.5) * uDissolve     ragged when dissolving
 *   visible  ⇔ h <= edge                                               progress 0 = hidden, 1 = shown
 *   glow     = 1 - smoothstep(0, uFeather, edge - h)                   emissive band at the edge
 *
 * Fase 7 (global scroll masking) builds on this; the lab uses it for demo 11.
 */
import { Color, type MeshPhysicalMaterial, type MeshStandardMaterial, type IUniform } from "three";

export type MaskUniforms = {
  uMaskProgress: IUniform<number>;
  uMaskMin: IUniform<number>;
  uMaskMax: IUniform<number>;
  uFeather: IUniform<number>;
  uDissolve: IUniform<number>;
  uNoiseScale: IUniform<number>;
  uEdgeGlow: IUniform<number>;
  uEdgeColor: IUniform<Color>;
};

export function createMaskUniforms(init: { min?: number; max?: number; edgeColor?: string } = {}): MaskUniforms {
  return {
    uMaskProgress: { value: 1 },
    uMaskMin: { value: init.min ?? -1 },
    uMaskMax: { value: init.max ?? 1 },
    uFeather: { value: 0.08 },
    uDissolve: { value: 0 },
    uNoiseScale: { value: 3 },
    uEdgeGlow: { value: 1.5 },
    uEdgeColor: { value: new Color(init.edgeColor ?? "#b9f5ff") },
  };
}

const NOISE = /* glsl */ `
float kineticHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float kineticNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(kineticHash(i), kineticHash(i + vec3(1, 0, 0)), f.x), mix(kineticHash(i + vec3(0, 1, 0)), kineticHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(kineticHash(i + vec3(0, 0, 1)), kineticHash(i + vec3(1, 0, 1)), f.x), mix(kineticHash(i + vec3(0, 1, 1)), kineticHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
`;

/** Adds the mask to `material` (mutates it) and returns it; share `uniforms` to drive it. */
export function applyMask<M extends MeshStandardMaterial | MeshPhysicalMaterial>(
  material: M,
  uniforms: MaskUniforms,
  { space = "object" }: { space?: "object" | "world" } = {},
): M {
  const position = space === "world" ? "(modelMatrix * vec4(transformed, 1.0)).xyz" : "transformed";
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vKineticWorld;")
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>\nvKineticWorld = ${position};`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vKineticWorld;
uniform float uMaskProgress, uMaskMin, uMaskMax, uFeather, uDissolve, uNoiseScale, uEdgeGlow;
uniform vec3 uEdgeColor;
${NOISE}`,
      )
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
float kineticH = (vKineticWorld.y - uMaskMin) / max(1e-4, uMaskMax - uMaskMin);
float kineticEdge = uMaskProgress * (1.0 + uFeather) + (kineticNoise(vKineticWorld * uNoiseScale) - 0.5) * uDissolve;
if (kineticH > kineticEdge) discard;
float kineticBand = 1.0 - smoothstep(0.0, max(1e-4, uFeather), kineticEdge - kineticH);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uEdgeColor * kineticBand * uEdgeGlow * step(uMaskProgress, 0.999);",
      );
  };
  material.customProgramCacheKey = () => `kinetic-mask-v1-${space}`;
  material.needsUpdate = true;
  return material;
}
