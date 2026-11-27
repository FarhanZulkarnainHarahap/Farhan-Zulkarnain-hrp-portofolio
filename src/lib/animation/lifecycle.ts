/**
 * AnimationLifecycleManager (Fase K3): app-level events every animation must react to, wired once
 * by AnimationProvider. Nothing here depends on an animation library.
 *
 *  - Tab hidden → snapshot.visible=false and every registered animation that is playing is paused
 *    (only those are resumed when the tab is visible again).
 *  - Navigation → previous/current route in the snapshot and the "route" scope is disposed, so no
 *    animation of the old page keeps running (rapid navigation included).
 *  - Resize (debounced, width changes only: mobile URL-bar height changes are ignored) and the
 *    end of web-font loading → `onLayoutChange` listeners (ScrollTrigger.refresh, Lenis resize).
 *  - Pointer position (one listener, written to the frame, no React) and the interaction mode
 *    (pointer / touch / keyboard) for focus styling and cursor decisions.
 *  - Active section: the [data-section] / section[id] element crossing the viewport's centre line.
 */
import { animationRegistry } from "./registry";
import { animationStore } from "./state";

type Cleanup = () => void;
const layoutListeners = new Set<() => void>();

/** Subscribe to layout changes (resize, fonts loaded, route change). */
export function onLayoutChange(listener: () => void): Cleanup {
  layoutListeners.add(listener);
  return () => void layoutListeners.delete(listener);
}

export function notifyLayoutChange() {
  for (const listener of layoutListeners) listener();
}

export function startVisibility(): Cleanup {
  const apply = () => {
    const visible = document.visibilityState === "visible";
    animationStore.set({ visible });
    if (visible) animationRegistry.resumeAll();
    else animationRegistry.pauseAll();
  };
  apply();
  document.addEventListener("visibilitychange", apply);
  return () => document.removeEventListener("visibilitychange", apply);
}

export function startResize(): Cleanup {
  let width = window.innerWidth;
  let timer = 0;
  const onResize = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      notifyLayoutChange();
    }, 150);
  };
  window.addEventListener("resize", onResize, { passive: true });
  let alive = true;
  document.fonts?.ready.then(() => alive && notifyLayoutChange());
  return () => {
    alive = false;
    window.clearTimeout(timer);
    window.removeEventListener("resize", onResize);
  };
}

export function startPointer(): Cleanup {
  const p = animationStore.frame.pointer;
  const onMove = (event: PointerEvent) => {
    p.x = event.clientX;
    p.y = event.clientY;
    p.nx = (event.clientX / window.innerWidth) * 2 - 1;
    p.ny = -((event.clientY / window.innerHeight) * 2 - 1);
    p.inside = true;
    animationStore.emitFrame("pointer");
  };
  const onLeave = () => {
    p.inside = false;
    animationStore.emitFrame("pointer");
  };
  const onDown = (event: PointerEvent) =>
    animationStore.set({ interaction: event.pointerType === "touch" ? "touch" : "pointer" });
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Tab" || event.key.startsWith("Arrow")) animationStore.set({ interaction: "keyboard" });
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("keydown", onKey);
  return () => {
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("keydown", onKey);
  };
}

/** Records a navigation and disposes the previous page's animations. */
let routeKnown = false;
export function enterRoute(pathname: string) {
  const { route } = animationStore.get();
  if (!routeKnown) {
    routeKnown = true;
    animationStore.set({ route: pathname });
    return;
  }
  if (route === pathname) return;
  animationRegistry.disposeScope("route");
  animationStore.set({ previousRoute: route, route: pathname, hovered: null, selected: null, activeSection: null });
}

/** Tracks the section under the viewport's centre line inside `root`. */
export function observeSections(root: HTMLElement): Cleanup {
  const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-section], section[id], section[aria-labelledby]"));
  if (!sections.length || typeof IntersectionObserver === "undefined") return () => {};
  const name = (el: HTMLElement) => el.dataset.section || el.id || el.getAttribute("aria-labelledby") || null;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) animationStore.set({ activeSection: name(entry.target as HTMLElement) });
    },
    { rootMargin: "-50% 0px -50% 0px" },
  );
  for (const el of sections) observer.observe(el);
  return () => observer.disconnect();
}
