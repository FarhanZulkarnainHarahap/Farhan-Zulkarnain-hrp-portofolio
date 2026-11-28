/**
 * AssetManager (Fase K4): loading, caching and ownership of 3D resources for the persistent canvas.
 *
 *  - One cache entry per key (URL or procedural id) with a reference count. Scenes `acquire` what
 *    they use and `release` it on unmount; an entry is disposed only when nobody holds it any more,
 *    after a short grace period (so the outgoing and incoming scene of a transition can share it).
 *    Shared resources are therefore never disposed while another scene still uses them.
 *  - Loaders are imported on first use (GLTF + Meshopt, textures, HDR), so the canvas chunk only
 *    carries what a page needs. Nothing is preloaded for every scene on the home page: a scene
 *    declares its assets and the controller preloads only the likely next scene, at idle time.
 *  - Errors are recorded (counters in the scene store) and returned to the caller, which shows its
 *    procedural fallback instead.
 *  - Procedural geometry and materials go through the same cache (`shared`), synchronously.
 */
import type { BufferGeometry, Material, Object3D, Texture } from "three";
import { sceneStore } from "./store";

type Disposable = { dispose: () => void };
type Entry = {
  key: string;
  kind: "gltf" | "texture" | "hdri" | "geometry" | "material";
  refs: number;
  status: "loading" | "ready" | "error";
  value?: unknown;
  promise?: Promise<unknown>;
  error?: string;
  dispose: (value: unknown) => void;
  timer?: ReturnType<typeof setTimeout>;
};

const GRACE_MS = 2500;
const entries = new Map<string, Entry>();

function report() {
  let pending = 0;
  let loaded = 0;
  let failed = 0;
  let lastError: string | null = sceneStore.get().assets.lastError;
  for (const entry of entries.values()) {
    if (entry.kind === "geometry" || entry.kind === "material") continue;
    if (entry.status === "loading") pending++;
    else if (entry.status === "ready") loaded++;
    else {
      failed++;
      lastError = `${entry.key}: ${entry.error}`;
    }
  }
  sceneStore.set({ assets: { pending, loaded, failed, lastError } });
}

function hold(entry: Entry) {
  entry.refs++;
  if (entry.timer) {
    clearTimeout(entry.timer);
    entry.timer = undefined;
  }
}

function disposeObject(root: Object3D) {
  root.traverse((node) => {
    const mesh = node as Object3D & { geometry?: BufferGeometry; material?: Material | Material[] };
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const material of materials) {
      for (const value of Object.values(material)) if ((value as Texture | null)?.isTexture) (value as Texture).dispose();
      material.dispose();
    }
  });
}

function scheduleDispose(entry: Entry) {
  if (entry.timer) return;
  entry.timer = setTimeout(() => {
    entry.timer = undefined;
    if (entry.refs > 0 || entries.get(entry.key) !== entry) return;
    entries.delete(entry.key);
    if (entry.status === "ready") entry.dispose(entry.value);
    report();
  }, GRACE_MS);
}

async function load<T>(key: string, kind: Entry["kind"], loader: () => Promise<T>, dispose: (value: T) => void): Promise<T> {
  let entry = entries.get(key);
  if (entry) {
    hold(entry);
    if (entry.status === "error") throw new Error(entry.error);
    return (entry.status === "ready" ? entry.value : entry.promise) as T;
  }
  entry = { key, kind, refs: 1, status: "loading", dispose: dispose as (v: unknown) => void };
  entries.set(key, entry);
  const current = entry;
  current.promise = loader().then(
    (value) => {
      current.value = value;
      current.status = "ready";
      report();
      return value;
    },
    (error: unknown) => {
      current.status = "error";
      current.error = error instanceof Error ? error.message : String(error);
      report();
      throw new Error(current.error);
    },
  );
  report();
  return current.promise as Promise<T>;
}

export const assetManager = {
  /** GLB / glTF (Meshopt-compressed allowed). Returns the shared scene graph: clone it to place it twice. */
  gltf(url: string) {
    return load(
      url,
      "gltf",
      async () => {
        const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
          import("three/examples/jsm/loaders/GLTFLoader.js"),
          import("three/examples/jsm/libs/meshopt_decoder.module.js"),
        ]);
        const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
        return loader.loadAsync(url);
      },
      (gltf) => disposeObject(gltf.scene),
    );
  },

  /** PNG / WebP / SVG texture in sRGB. */
  texture(url: string) {
    return load(
      url,
      "texture",
      async () => {
        const { TextureLoader, SRGBColorSpace } = await import("three");
        const texture = await new TextureLoader().loadAsync(url);
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = 4;
        return texture;
      },
      (texture) => texture.dispose(),
    );
  },

  /** Equirectangular HDR environment (e.g. a CC0 Poly Haven HDRI), ready for scene.environment. */
  hdri(url: string) {
    return load(
      url,
      "hdri",
      async () => {
        const [{ HDRLoader }, { EquirectangularReflectionMapping }] = await Promise.all([
          import("three/examples/jsm/loaders/HDRLoader.js"),
          import("three"),
        ]);
        const texture = await new HDRLoader().loadAsync(url);
        texture.mapping = EquirectangularReflectionMapping;
        return texture;
      },
      (texture) => texture.dispose(),
    );
  },

  /**
   * Procedural geometry / material shared between scenes. Created on first use WITHOUT taking a
   * reference (safe to call during render); owners `retain` / `release` it from an effect. An
   * entry nobody retains is disposed after the grace period.
   */
  shared<T extends Disposable>(key: string, kind: "geometry" | "material", create: () => T): T {
    const existing = entries.get(key);
    if (existing && existing.status === "ready") return existing.value as T;
    const value = create();
    const entry: Entry = { key, kind, refs: 0, status: "ready", value, dispose: (v) => (v as T).dispose() };
    entries.set(key, entry);
    scheduleDispose(entry);
    return value;
  },

  /** Takes a reference on an existing entry (cancels a pending disposal). */
  retain(key: string) {
    const entry = entries.get(key);
    if (entry) hold(entry);
  },

  /** Peek at a ready shared value without taking a reference (e.g. to re-tint on theme change). */
  peek<T>(key: string): T | undefined {
    const entry = entries.get(key);
    return entry?.status === "ready" ? (entry.value as T) : undefined;
  },

  /** Gives back one reference; disposes after the grace period when none are left. */
  release(key: string) {
    const entry = entries.get(key);
    if (!entry) return;
    entry.refs = Math.max(0, entry.refs - 1);
    if (entry.refs === 0) scheduleDispose(entry);
  },

  /** Loads and immediately releases: the entry stays cached for the grace period (+ while used). */
  async preload(kind: "gltf" | "texture" | "hdri", url: string) {
    try {
      await assetManager[kind](url);
    } catch {
      /* recorded in the store */
    } finally {
      assetManager.release(url);
    }
  },

  /** Debug: entries with their kind, status and reference count. */
  list() {
    return [...entries.values()].map(({ key, kind, refs, status, error }) => ({ key, kind, refs, status, error }));
  },

  /** Canvas teardown (context could not be recovered / canvas unmounted): drop everything. */
  disposeAll() {
    for (const entry of entries.values()) {
      if (entry.timer) clearTimeout(entry.timer);
      if (entry.status === "ready") entry.dispose(entry.value);
    }
    entries.clear();
    report();
  },
};

export type AssetManager = typeof assetManager;
