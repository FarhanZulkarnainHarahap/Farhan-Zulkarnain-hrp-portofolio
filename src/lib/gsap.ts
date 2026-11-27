"use client";
/**
 * Single GSAP entry point (Fase 8; centralised in Fase K3). setupGsap() registers Flip, SplitText,
 * CustomEase (+ @gsap/react) exactly once, and the token eases (standard, enter, exit, cinematic,
 * mask). ScrollTrigger is NOT imported here: it lives in src/lib/animation/scroll-trigger.ts, which
 * only code that creates triggers imports (gsap-utils scrollProgress/parallax). That keeps its
 * ~18 KB out of public pages and avoids its permanent keep-alive requestAnimationFrame, which
 * starts as soon as it is registered. registeredScrollTrigger() lets other code (the Lenis
 * runtime) update it when — and only when — something registered it. SSR-safe: it does nothing on the
 * server, and this module is only reached through dynamic import() chunks loaded after
 * hydration (motion-runtime, smooth-scroll runtime, projects Flip, the lab), never on first paint.
 * Reusable tweens: src/lib/animation/gsap-utils.ts. Durations/eases come from globals.css.
 *
 *  - motion(fn): runs fn only when prefers-reduced-motion is "no-preference" (gsap.matchMedia);
 *    under reduced motion nothing tweens and content is shown in its final state.
 *  - Elements are pre-hidden only while <html class="js-motion"> (set before paint by the inline
 *    script in app/layout.tsx); markMotionReady() tells that script GSAP is alive.
 */
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

let registered = false;
let cachedTokens: MotionTokens | null = null;

export type MotionTokens = {
  fast: number;
  base: number;
  slow: number;
  reveal: number;
  stagger: number;
  distance: number;
  /** Hero intro start times (s), Fase 10.5. */
  intro: { line: number; eyebrow: number; lead: number; cta: number; status: number; hint: number };
};

function seconds(value: string, fallback: number) {
  const v = value.trim();
  if (!v) return fallback;
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return fallback;
  return v.endsWith("ms") ? n / 1000 : n;
}

function bezier(value: string, fallback: string) {
  const match = /cubic-bezier\(([^)]+)\)/.exec(value);
  return match
    ? match[1]
        .split(",")
        .map((n) => n.trim())
        .join(",")
    : fallback;
}

/** Registers plugins and the token eases ("enter", "standard", "exit"). Safe to call repeatedly. */
export function setupGsap() {
  if (registered || typeof window === "undefined") return gsap;
  registered = true;
  gsap.registerPlugin(useGSAP, CustomEase, SplitText, Flip);
  const root = getComputedStyle(document.documentElement);
  CustomEase.create(
    "enter",
    bezier(root.getPropertyValue("--ease-enter"), "0.16,1,0.3,1"),
  );
  CustomEase.create(
    "standard",
    bezier(root.getPropertyValue("--ease-standard"), "0.2,0,0,1"),
  );
  CustomEase.create(
    "exit",
    bezier(root.getPropertyValue("--ease-exit"), "0.4,0,1,1"),
  );
  CustomEase.create(
    "cinematic",
    bezier(root.getPropertyValue("--ease-cinematic"), "0.83,0,0.17,1"),
  );
  CustomEase.create(
    "mask",
    bezier(root.getPropertyValue("--ease-mask"), "0.77,0,0.175,1"),
  );
  gsap.defaults({ ease: "enter", duration: tokens().slow });
  return gsap;
}

/** ScrollTrigger if something registered it (see the header), else undefined. No import needed. */
export function registeredScrollTrigger(): typeof ScrollTriggerType | undefined {
  // gsap.core.globals() is public at runtime (ScrollTrigger registers itself there) but untyped.
  const core = gsap.core as unknown as { globals: () => Record<string, unknown> };
  return core.globals().ScrollTrigger as typeof ScrollTriggerType | undefined;
}

/** Motion tokens in seconds / pixels, read once from :root. */
export function tokens(): MotionTokens {
  if (cachedTokens) return cachedTokens;
  const root = getComputedStyle(document.documentElement);
  cachedTokens = {
    fast: seconds(root.getPropertyValue("--duration-fast"), 0.15),
    base: seconds(root.getPropertyValue("--duration-base"), 0.24),
    slow: seconds(root.getPropertyValue("--duration-slow"), 0.42),
    reveal: seconds(root.getPropertyValue("--duration-reveal"), 0.7),
    stagger: seconds(root.getPropertyValue("--stagger"), 0.06),
    distance: parseFloat(root.getPropertyValue("--reveal-distance")) || 8,
    intro: {
      line: seconds(root.getPropertyValue("--intro-line"), 0.15),
      eyebrow: seconds(root.getPropertyValue("--intro-eyebrow"), 0.25),
      lead: seconds(root.getPropertyValue("--intro-lead"), 0.4),
      cta: seconds(root.getPropertyValue("--intro-cta"), 0.55),
      status: seconds(root.getPropertyValue("--intro-status"), 0.7),
      hint: seconds(root.getPropertyValue("--intro-hint"), 2),
    },
  };
  return cachedTokens;
}

/** Run animations only when motion is allowed; reverted automatically when the preference flips. */
export function motion(setup: () => void | (() => void)) {
  const mm = gsap.matchMedia();
  mm.add(MOTION_OK, setup);
  return mm;
}

export function prefersMotion() {
  return typeof window !== "undefined" && window.matchMedia(MOTION_OK).matches;
}

export function markMotionReady() {
  document.documentElement.classList.add("motion-ready");
}

export { gsap, useGSAP, SplitText, Flip };
