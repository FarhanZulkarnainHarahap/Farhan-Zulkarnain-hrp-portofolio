"use client";
/**
 * Shared procedural resources for the scenes (Fase K4), through the AssetManager cache:
 *  - useSharedGeometry(key, create): one geometry per key and detail level, ref-counted;
 *  - useSharedMaterial(key, create): one material per key, re-tinted in place on theme change;
 *  - useAssetTexture(url): an image texture (PNG / WebP / SVG), loaded once, released on unmount,
 *    null while loading or after an error (callers keep their procedural look).
 * Geometry detail follows the quality tier (DETAIL); materials are MeshStandard (PBR) everywhere.
 */
import { useEffect, useState } from "react";
import type { BufferGeometry, Material, Texture } from "three";
import type { QualityTier } from "@/lib/animation/config";
import { assetManager } from "@/lib/scene/assets";

/** Segment counts per tier (higher geometry detail on capable devices). */
export const DETAIL: Record<QualityTier, { radial: number; tube: number; sphere: number }> = {
  high: { radial: 128, tube: 12, sphere: 48 },
  medium: { radial: 96, tube: 8, sphere: 32 },
  low: { radial: 64, tube: 6, sphere: 20 },
  minimal: { radial: 32, tube: 4, sphere: 12 },
};

export function useSharedGeometry<T extends BufferGeometry>(key: string, create: () => T): T {
  const value = assetManager.shared(`geo:${key}`, "geometry", create);
  useEffect(() => {
    assetManager.retain(`geo:${key}`);
    return () => assetManager.release(`geo:${key}`);
  }, [key]);
  return value;
}

export function useSharedMaterial<T extends Material>(key: string, create: () => T): T {
  const value = assetManager.shared(`mat:${key}`, "material", create);
  useEffect(() => {
    assetManager.retain(`mat:${key}`);
    return () => assetManager.release(`mat:${key}`);
  }, [key]);
  return value;
}

/** Disposes objects a component created itself (not shared) when it unmounts or they change. */
export function useDisposeOnUnmount(...objects: ({ dispose: () => void } | null | undefined)[]) {
  useEffect(
    () => () => {
      for (const object of objects) object?.dispose();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the objects themselves are the deps
    objects,
  );
}

export function useAssetTexture(url: string | null): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null);
  useEffect(() => {
    if (!url) return;
    let alive = true;
    assetManager.texture(url).then(
      (t) => alive && setTexture(t),
      () => alive && setTexture(null),
    );
    return () => {
      alive = false;
      assetManager.release(url);
    };
  }, [url]);
  return texture;
}
