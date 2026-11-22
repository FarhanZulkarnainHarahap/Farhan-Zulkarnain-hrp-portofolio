/**
 * HeroModel runtime (Fase 10): plain three.js, loaded only via dynamic import from HeroModelSlot.
 *  - public/3d/hero-model.glb (Blender, meshopt) with the Blender camera, so the canvas lines up with
 *    the poster it cross-fades from;
 *  - material colours come from CSS tokens (setColors) and follow the theme;
 *  - render on demand: a frame is requested only while the rotation eases towards its target, so
 *    there is no requestAnimationFrame while idle; dispose() frees GPU resources and the context.
 */
import {
  Color,
  HemisphereLight,
  DirectionalLight,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  NoToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { MODEL_SCALE } from "./hero-frame";

export type ModelColors = { surface: string; line: string; accent: string };

export type HeroScene = {
  setColors: (colors: ModelColors) => void;
  /** Pointer in [-1, 1] on both axes, or null when it leaves (eases back to rest). */
  setPointer: (x: number | null, y?: number) => void;
  resize: () => void;
  dispose: () => void;
};

/**
 * Approximation of the Blender studio rig per theme (posters: hero light vs dark energies), so
 * the canvas matches the poster it replaces (tuned against the posters: mean pixel difference
 * ≈ 2.7/255 light, 3.1/255 dark). Picked from the surface colour's luminance.
 */
export const RIGS = {
  light: { sky: 1.7, ground: 0.9, key: 1.8, fill: 0.5, rim: 0.4, shadow: 0.32, blur: 12 },
  dark: { sky: 3.2, ground: 1.1, key: 3.4, fill: 0.9, rim: 0.4, shadow: 0.3, blur: 12 },
};

const MAX_YAW = (8 * Math.PI) / 180;
const MAX_PITCH = (4 * Math.PI) / 180;

/** Blender Z-up light positions → three.js Y-up (x, z, -y). */
const fromBlender = (x: number, y: number, z: number) => [x, z, -y] as const;

export async function createHeroScene(canvas: HTMLCanvasElement, colors: ModelColors): Promise<HeroScene> {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync("/3d/hero-model.glb");

  const camera = (gltf.cameras[0] as PerspectiveCamera | undefined) ?? new PerspectiveCamera(24, 0.8, 0.1, 100);
  // Same framing as the poster (scaled about the frame centre, see hero-frame.ts).
  camera.zoom = MODEL_SCALE;
  gltf.scene.updateMatrixWorld(true);

  // Rotate the stack around its own vertical axis (pivot at the model origin).
  const pivot = new Group();
  scene.add(pivot);
  const materials = new Map<string, MeshStandardMaterial>();
  const meshes: Mesh[] = [];
  gltf.scene.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshes.push(mesh);
    const material = mesh.material as MeshStandardMaterial;
    if (material?.name) materials.set(material.name, material);
  });
  const model = gltf.scene;
  // Keep the camera (child of gltf.scene) out of the rotating group.
  if (camera.parent) {
    camera.parent.remove(camera);
    camera.matrixAutoUpdate = true;
  }
  pivot.add(model);

  // Studio rig (Blender key / fill / rim, Z-up → Y-up) with a soft sky/ground fill.
  const hemi = new HemisphereLight(0xffffff, 0xe8e2d8, 1);
  const key = new DirectionalLight(0xfffaf2, 1);
  key.position.set(...fromBlender(-3.0, -2.6, 3.4));
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.01;
  key.shadow.camera.left = key.shadow.camera.bottom = -1.4;
  key.shadow.camera.right = key.shadow.camera.top = 1.4;
  const fill = new DirectionalLight(0xf2f6ff, 1);
  fill.position.set(...fromBlender(3.4, -2.2, 1.2));
  const rim = new DirectionalLight(0xffffff, 1);
  rim.position.set(...fromBlender(1.0, 3.5, 2.6));
  scene.add(hemi, key, fill, rim);
  const applyRig = (surface: Color) => {
    const rig = surface.getHSL({ h: 0, s: 0, l: 0 }).l < 0.5 ? RIGS.dark : RIGS.light;
    hemi.intensity = rig.sky;
    hemi.groundColor.setScalar(rig.ground / rig.sky).multiply(new Color(0xe8e2d8));
    key.intensity = rig.key;
    key.shadow.intensity = rig.shadow;
    key.shadow.radius = rig.blur;
    fill.intensity = rig.fill;
    rim.intensity = rig.rim;
  };

  let frame = 0;
  const target = { yaw: 0, pitch: 0 };
  const current = { yaw: 0, pitch: 0 };

  const render = () => renderer.render(scene, camera);
  const tick = () => {
    frame = 0;
    current.yaw += (target.yaw - current.yaw) * 0.12;
    current.pitch += (target.pitch - current.pitch) * 0.12;
    pivot.rotation.set(current.pitch, current.yaw, 0);
    render();
    if (Math.abs(target.yaw - current.yaw) > 1e-4 || Math.abs(target.pitch - current.pitch) > 1e-4) {
      frame = requestAnimationFrame(tick);
    }
  };
  const wake = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const setColors = (c: ModelColors) => {
    const surface = new Color(c.surface);
    applyRig(surface);
    materials.get("MAT_Surface")?.color.set(surface);
    materials.get("MAT_Line")?.color.set(new Color(c.line));
    materials.get("MAT_Accent")?.color.set(new Color(c.accent));
    render();
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  };

  setColors(colors);
  resize();

  return {
    setColors,
    setPointer: (x, y = 0) => {
      target.yaw = x === null ? 0 : x * MAX_YAW;
      target.pitch = x === null ? 0 : y * MAX_PITCH;
      wake();
    },
    resize,
    dispose: () => {
      cancelAnimationFrame(frame);
      for (const mesh of meshes) mesh.geometry.dispose();
      for (const material of materials.values()) (material as Material).dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
