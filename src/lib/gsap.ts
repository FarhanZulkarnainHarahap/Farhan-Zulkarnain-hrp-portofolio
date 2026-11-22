"use client";
/**
 * Single GSAP entry point (Fase 8). Plugins are registered once; durations and eases come from the
 * design tokens in globals.css, so motion stays in sync with CSS transitions.
 *
 *  - motion(fn): runs fn only when prefers-reduced-motion is "no-preference" (gsap.matchMedia);
 *    under reduced motion nothing tweens and content is shown in its final state.
 *  - Elements are pre-hidden only while <html class="js-motion"> (set before paint by the inline
 *    script in app/layout.tsx); markMotionReady() tells that script GSAP is alive.
 */
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);
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
  gsap.defaults({ ease: "enter", duration: tokens().slow });
  // Fonts change line heights; recompute trigger positions once they are ready.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), {
    once: true,
  });
  // Test hook: number of live ScrollTriggers (checks for leaks between pages).
  (window as unknown as { __motion?: { triggers: () => number } }).__motion = {
    triggers: () => ScrollTrigger.getAll().length,
  };
  return gsap;
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

// Flip is registered only where it is used (projects filter), to keep it off other pages.
export { gsap, ScrollTrigger, useGSAP };
