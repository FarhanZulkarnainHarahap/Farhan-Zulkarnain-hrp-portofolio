/**
 * DOM anchors → world placement (Fase K4, used by ScrollSceneController).
 *
 * The page layout decides where 3D goes: an element marked `data-scene-anchor="<key>"` (the hero
 * orbit stage, the empty columns beside a page lead or a section label) is the scene's slot. Each
 * rendered frame the active scene's anchor rect is projected onto the z = 0 plane of the LAYOUT
 * camera — a fixed perspective camera at (0, 0, LAYOUT_DISTANCE) looking at the origin — so the 3D
 * sits exactly in its slot and moves with it when the page scrolls (scroll-driven translation
 * without a second scroll source: the rect already reflects Lenis / native scrolling).
 * Camera presets then only offset that camera slightly (presets.ts).
 *
 * An anchor with no box (display: none on phones) is "not visible": the scene renders nothing
 * there, so 3D never overlaps text on small screens.
 */
import type { ScenePlacement } from "./store";

export const LAYOUT_DISTANCE = 10;

const cache = new Map<string, HTMLElement>();
const propsCache = new WeakMap<HTMLElement, Record<string, unknown>>();

/** The element for an anchor key (`data-scene-anchor` is a space-separated list); "any" is the lab's catch-all slot. */
export function findAnchor(key: string): HTMLElement | null {
  const cached = cache.get(key);
  if (cached?.isConnected) return cached;
  const el =
    document.querySelector<HTMLElement>(`[data-scene-anchor~="${key}"]`) ??
    document.querySelector<HTMLElement>('[data-scene-anchor~="any"]');
  if (el) cache.set(key, el);
  else cache.delete(key);
  return el;
}

/**
 * Anchor of a scene: section-based scenes (/about) use the anchor inside the active section
 * (`#stack [data-scene-anchor]`), falling back to the page anchor.
 */
export function findSceneAnchor(key: string, section: string | null, sectionBased: boolean): HTMLElement | null {
  if (sectionBased && section) {
    const inSection = document.getElementById(section)?.querySelector<HTMLElement>("[data-scene-anchor]");
    if (inSection) return inSection;
  }
  return findAnchor(key);
}

/** Layout camera FOV: the token FOV, wider on narrow (portrait) viewports. */
export function layoutFov(width: number, tokens: { fov: number; fovMobile: number }) {
  return width < 768 ? tokens.fovMobile : tokens.fov;
}

/** Drop cached anchors (route change). */
export function resetAnchors() {
  cache.clear();
}

/** JSON in `data-scene-props` (API-derived counts / orbit model rendered by the server). */
export function anchorProps<T extends Record<string, unknown>>(el: HTMLElement | null): Partial<T> {
  if (!el) return {};
  const cached = propsCache.get(el);
  if (cached) return cached as Partial<T>;
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(el.dataset.sceneProps ?? "{}") as Record<string, unknown>;
  } catch {
    parsed = {};
  }
  propsCache.set(el, parsed);
  return parsed as Partial<T>;
}

/** Visible world height at z = 0 for the layout camera. */
export function visibleHeight(fov: number) {
  return 2 * LAYOUT_DISTANCE * Math.tan(((fov * Math.PI) / 180) / 2);
}

/**
 * Projects an anchor rect to world space. `viewport` is the canvas size in CSS px.
 * Writes into `out` (no allocation per frame) and returns it.
 */
export function placeAnchor(
  rect: { top: number; left: number; width: number; height: number },
  viewport: { width: number; height: number },
  fov: number,
  out: ScenePlacement,
): ScenePlacement {
  const vh = visibleHeight(fov);
  const vw = vh * (viewport.width / Math.max(1, viewport.height));
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  out.center[0] = (cx / viewport.width - 0.5) * vw;
  out.center[1] = -(cy / viewport.height - 0.5) * vh;
  out.center[2] = 0;
  out.height = (rect.height / viewport.height) * vh;
  out.width = (rect.width / viewport.width) * vw;
  const hasBox = rect.width > 0 && rect.height > 0;
  out.visible = hasBox && rect.top < viewport.height && rect.top + rect.height > 0;
  out.progress = hasBox ? Math.min(1, Math.max(0, (viewport.height - rect.top) / (viewport.height + rect.height))) : 0;
  return out;
}

export function emptyPlacement(): ScenePlacement {
  return { visible: false, progress: 0, center: [0, 0, 0], height: 0, width: 0 };
}
