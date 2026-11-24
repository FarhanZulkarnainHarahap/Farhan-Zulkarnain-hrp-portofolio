"use client";
/**
 * One small client component drives the page motion (docs/MOTION_PLAN.md):
 *  - [data-intro]: page intro, once per page per visit (the H1 and the header are never marked): the
 *    home hero and, lighter, the PageHeader of /about, /journey, /projects, /contact. Fase 10.5
 *    timeline, start times from the --intro-* tokens: accent line under the H1 draws left → right,
 *    eyebrow, lead line by line (SplitText, reverted afterwards), CTAs one after the other, status
 *    (+ the ShinyText sweep), then the scroll hint with a single nudge. Unnamed [data-intro]
 *    elements follow the lead;
 *  - [data-reveal]: revealed once when it enters the viewport, detected with IntersectionObserver
 *    (no ScrollTrigger, no scroll listeners, no idle rAF loop); [data-reveal="group"] staggers its
 *    children (capped at 6 steps). Each element is unobserved after it is shown.
 * Markup stays server-rendered; this only reads attributes. GSAP lives in ./motion-runtime, loaded
 * with import() after hydration (Fase 12.1: off the first-paint path). Tweens and observers are
 * reverted when the pathname changes or on unmount. Reduced motion: GSAP is never loaded and
 * nothing is hidden; late content (e.g. after a retry) is never hidden.
 */
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { MotionState } from "./motion-runtime";

const MOTION_OK = "(prefers-reduced-motion: no-preference)";
const markMotionReady = () => document.documentElement.classList.add("motion-ready");

// Each page's intro plays once per visit; returning to it client-side shows it settled.
// Elements still waiting to be revealed (test hook: must never outlive their page).
const state: MotionState = { introPlayed: new Set<string>(), pending: new Set<Element>() };
/** True once ./motion-runtime (GSAP) has been loaded (test hook: never under reduced motion). */
let runtimeLoaded = false;
if (typeof window !== "undefined")
  (window as unknown as { __motion?: { pending: () => number; loaded: () => boolean } }).__motion = {
    pending: () => state.pending.size,
    loaded: () => runtimeLoaded,
  };

export function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main || !window.matchMedia(MOTION_OK).matches) {
      markMotionReady();
      return;
    }
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    import("./motion-runtime")
      .then(({ runMotion }) => {
        runtimeLoaded = true;
        if (!cancelled) cleanup = runMotion(main, pathname, state);
      })
      // The chunk failed to load: show everything rather than leave it pre-hidden.
      .catch(() => document.documentElement.classList.remove("js-motion"));
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
