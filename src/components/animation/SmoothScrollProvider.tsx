"use client";
/**
 * SmoothScrollProvider (Fase K3): chooses and runs the scroll engine for public pages.
 *
 *  - Native engine immediately (no library): the shared scroll frame is live from hydration on.
 *  - Lenis (smooth wheel) when motion is allowed, the primary pointer is fine (mouse/trackpad) and
 *    the quality tier allows it; loaded with import() at idle time, so it is never on the first-
 *    paint path. Touch devices and reduced motion keep native scrolling. Flipping the preference
 *    swaps engines live.
 *  - Same-page anchors (#id) under Lenis: smooth scroll to the target (honouring scroll-padding for
 *    the sticky header), the URL hash is pushed so back/forward work, and focus moves to the target
 *    (keyboard activation scrolls instantly). Without Lenis the browser handles anchors natively.
 *  - Client navigation: inertia is dropped and the engine re-measures after Next has scrolled the
 *    new page; back/forward scroll restoration is the browser's (Lenis follows native scroll).
 *  - Layout changes (resize, fonts) → Lenis resize + ScrollTrigger.refresh.
 * Mounted only by SiteChrome: the dashboard never gets smooth scrolling.
 */
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { profileFor } from "@/lib/animation/quality";
import { onLayoutChange } from "@/lib/animation/lifecycle";
import { createNativeEngine, getScrollEngine, setScrollEngine } from "@/lib/animation/scroll";
import { useAnimationState } from "./hooks";

// requestIdleCallback is missing in Safari < 18: fall back to a short timeout.
const hasIdle = () => typeof window.requestIdleCallback === "function";
const idle = (fn: () => void): number => (hasIdle() ? window.requestIdleCallback(fn, { timeout: 1500 }) : window.setTimeout(fn, 200));
const cancelIdle = (id: number) => (hasIdle() ? window.cancelIdleCallback(id) : window.clearTimeout(id));

function focusTarget(target: HTMLElement) {
  if (!target.matches("a[href], button, input, select, textarea, [tabindex]")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

export function SmoothScrollProvider({ children }: { children?: ReactNode }) {
  const reducedMotion = useAnimationState((s) => s.reducedMotion);
  const quality = useAnimationState((s) => s.quality);
  const pathname = usePathname();
  const firstPath = useRef(true);

  const wantsLenis = !reducedMotion && profileFor(quality).smoothScroll;

  // Engine selection.
  useEffect(() => {
    let cancelled = false;
    setScrollEngine(createNativeEngine());
    if (!wantsLenis || !window.matchMedia("(pointer: fine)").matches) return;
    const handle = idle(() => {
      import("@/lib/animation/smooth-scroll-runtime")
        .then(({ createLenisEngine }) => {
          if (!cancelled) setScrollEngine(createLenisEngine());
        })
        .catch(() => {
          /* keep native scrolling */
        });
    });
    return () => {
      cancelled = true;
      cancelIdle(handle);
      setScrollEngine(null);
    };
  }, [wantsLenis]);

  // Re-measure on layout changes.
  useEffect(() => onLayoutChange(() => getScrollEngine()?.resize()), []);

  // Client navigation: Next scrolls the new page first, then we drop inertia and re-measure.
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    const frame = requestAnimationFrame(() => {
      const engine = getScrollEngine();
      engine?.reset();
      engine?.resize();
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  // Same-page anchors under Lenis.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const engine = getScrollEngine();
      if (engine?.kind !== "lenis" || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href*='#']");
      if (!link || link.target === "_blank") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      if (window.location.hash !== url.hash) window.history.pushState(null, "", url.hash);
      // Keyboard activation (detail 0) jumps: no motion between focus and the new position.
      const immediate = event.detail === 0;
      engine.scrollTo(target, { immediate, onComplete: () => focusTarget(target) });
      if (immediate) focusTarget(target);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return children;
}
