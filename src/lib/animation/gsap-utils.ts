"use client";
/**
 * Reusable GSAP animations (Fase K3). Every helper:
 *  - reads durations/eases from the tokens (reduced motion: CSS sets them to ~1 ms and distances
 *    to 0, and helpers that would split or hide content jump straight to the final state);
 *  - returns the tween/timeline/ScrollTrigger so the caller owns cleanup — or wrap it with
 *    `registerGsap()` to put it in the AnimationRegistry (lifecycle + ownership);
 *  - is meant to run inside gsap.context()/useGSAP scope so unmount reverts it.
 * Import only from client chunks loaded after hydration (this pulls GSAP + plugins).
 */
import { getMotionTokens } from "@/lib/design-tokens";
import { gsap, prefersMotion, setupGsap, SplitText } from "@/lib/gsap";
import { ScrollTrigger, setupScrollTrigger } from "./scroll-trigger";
import type { EaseName } from "./config";
import { animationRegistry, type AnimationHandle, type AnimationSpec, type AnimationStatus } from "./registry";

type Targets = gsap.TweenTarget;
type Direction = "up" | "down" | "left" | "right";

function ready() {
  setupGsap();
  return getMotionTokens();
}

/** Children (or targets) rise and fade in one after the other. */
export function staggeredReveal(
  targets: Targets,
  { stagger, distance, duration, ease = "enter", delay = 0 }: { stagger?: number; distance?: number; duration?: number; ease?: EaseName; delay?: number } = {},
) {
  const t = ready();
  return gsap.fromTo(
    targets,
    { opacity: 0, y: distance ?? t.revealDistance },
    {
      opacity: 1,
      y: 0,
      duration: duration ?? t.duration.enter,
      ease,
      delay,
      stagger: stagger ?? t.stagger.base,
      clearProps: "transform",
    },
  );
}

/** Bottom-to-top entrance of a single block (no fade on the mask variant). */
export function riseIn(targets: Targets, { duration, distance, ease = "enter", delay = 0 }: { duration?: number; distance?: number; ease?: EaseName; delay?: number } = {}) {
  const t = ready();
  return gsap.fromTo(
    targets,
    { opacity: 0, y: distance ?? t.revealDistance * 2 },
    { opacity: 1, y: 0, duration: duration ?? t.duration.enter, ease, delay, clearProps: "transform" },
  );
}

/**
 * Masked text reveal: SplitText splits into lines/words/chars, each inside a clipping mask, and
 * slides them up from below the mask edge. The split is reverted when the timeline completes or
 * is disposed, so the DOM (and the LCP text) is the original server markup again. Under reduced
 * motion nothing is split.
 */
export function maskedTextReveal(
  element: HTMLElement,
  { type = "lines", duration, stagger, ease = "mask", delay = 0 }: { type?: "lines" | "words" | "chars"; duration?: number; stagger?: number; ease?: EaseName; delay?: number } = {},
) {
  const t = ready();
  const tl = gsap.timeline({ delay });
  if (!prefersMotion()) return { timeline: tl, revert: () => {} };
  const split = SplitText.create(element, { type, mask: type, aria: "auto" });
  const parts = type === "lines" ? split.lines : type === "words" ? split.words : split.chars;
  const step = stagger ?? (type === "lines" ? t.stagger.lines : type === "words" ? t.stagger.words : t.stagger.chars);
  tl.from(parts, { yPercent: 105, duration: duration ?? t.duration.section, ease, stagger: step });
  // Last step (not onComplete, which callers may use): restore the original markup.
  tl.add(() => split.revert());
  return { timeline: tl, revert: () => split.revert() };
}

const CLIP_FROM: Record<Direction, string> = {
  up: "inset(100% 0% 0% 0%)", // revealed bottom → top
  down: "inset(0% 0% 100% 0%)",
  left: "inset(0% 0% 0% 100%)", // revealed right → left
  right: "inset(0% 100% 0% 0%)",
};

/** Clip-path wipe in a direction ("up" = the --mask-hidden token, bottom → top). */
export function directionalReveal(targets: Targets, direction: Direction = "up", { duration, ease = "mask", delay = 0 }: { duration?: number; ease?: EaseName; delay?: number } = {}) {
  const t = ready();
  return gsap.fromTo(
    targets,
    { clipPath: CLIP_FROM[direction] },
    { clipPath: "inset(0% 0% 0% 0%)", duration: duration ?? t.duration.section, ease, delay, clearProps: "clipPath" },
  );
}

/**
 * Scroll progress of a trigger element as 0–1 (the only scroll → progress mapping; the scroll
 * position itself comes from Lenis/native scroll through the shared store).
 */
export function scrollProgress(
  trigger: Element,
  onProgress: (progress: number, self: ScrollTrigger) => void,
  { start = "top bottom", end = "bottom top", scrub }: { start?: string; end?: string; scrub?: boolean | number } = {},
) {
  ready();
  setupScrollTrigger();
  return ScrollTrigger.create({
    trigger,
    start,
    end,
    scrub,
    onUpdate: (self) => onProgress(self.progress, self),
    onRefresh: (self) => onProgress(self.progress, self),
  });
}

/** Parallax: the element drifts `speed` × its height while its trigger crosses the viewport. */
export function parallax(target: HTMLElement, { speed = 0.15, trigger }: { speed?: number; trigger?: Element } = {}) {
  ready();
  if (!prefersMotion()) return null;
  setupScrollTrigger();
  return gsap.fromTo(
    target,
    { yPercent: -speed * 50 },
    {
      yPercent: speed * 50,
      ease: "none",
      scrollTrigger: { trigger: trigger ?? target, start: "top bottom", end: "bottom top", scrub: true },
    },
  );
}

type Vec3 = { x?: number; y?: number; z?: number };

/** Translate a DOM element (px) or a three.js vector-like object (scene units). */
export function translate(target: Vec3 | Targets, to: Vec3, { duration, ease = "standard" }: { duration?: number; ease?: EaseName } = {}) {
  const t = ready();
  return gsap.to(target, { ...to, duration: duration ?? t.duration.slow, ease, overwrite: "auto" });
}

/** Rotate: DOM (degrees: rotation/rotationX/rotationY) or a three.js Euler (radians: x/y/z). */
export function rotate(target: Vec3 | Targets, to: Vec3 | { rotation?: number; rotationX?: number; rotationY?: number }, { duration, ease = "standard" }: { duration?: number; ease?: EaseName } = {}) {
  const t = ready();
  return gsap.to(target, { ...to, duration: duration ?? t.duration.slow, ease, overwrite: "auto" });
}

export type SequenceStep = {
  targets: Targets;
  vars: gsap.TweenVars;
  /** GSAP position parameter ("<", ">-0.2", 0.4, "label"). */
  at?: gsap.Position;
  label?: string;
};

/** Timeline from steps (labels allowed); paused when `paused` is true. */
export function sequence(steps: SequenceStep[], { paused = false, defaults }: { paused?: boolean; defaults?: gsap.TweenVars } = {}) {
  const t = ready();
  const tl = gsap.timeline({ paused, defaults: { duration: t.duration.enter, ease: "enter", ...defaults } });
  for (const step of steps) {
    if (step.label) tl.addLabel(step.label, step.at);
    tl.to(step.targets, step.vars, step.label ?? step.at);
  }
  return tl;
}

/**
 * Reversible toggle for rapid clicking: each call flips direction from wherever the timeline is,
 * never restarts it, so spamming the control never jumps or stacks tweens.
 */
export function reversible(timeline: gsap.core.Timeline | gsap.core.Tween) {
  timeline.pause(0);
  let open = false;
  return {
    toggle(next = !open) {
      open = next;
      if (open) timeline.play();
      else timeline.reverse();
      return open;
    },
    get open() {
      return open;
    },
  };
}

/** Registry adapter for a GSAP animation (tween, timeline or ScrollTrigger). */
export function registerGsap(
  spec: AnimationSpec,
  animation: gsap.core.Animation | ScrollTrigger,
  extraDispose?: () => void,
): AnimationHandle {
  if (animation instanceof ScrollTrigger) {
    let enabled = true;
    return animationRegistry.register(spec, {
      // disable(false): keep the current scroll position / pin state while paused.
      pause: () => {
        enabled = false;
        animation.disable(false);
      },
      resume: () => {
        enabled = true;
        animation.enable();
      },
      play: () => {
        enabled = true;
        animation.enable();
      },
      dispose: () => {
        animation.kill();
        extraDispose?.();
      },
      status: () => (!enabled ? "paused" : animation.isActive ? "playing" : "idle"),
    });
  }
  const status = (): AnimationStatus =>
    animation.isActive() ? "playing" : animation.paused() ? "paused" : animation.progress() >= 1 ? "finished" : "idle";
  return animationRegistry.register(spec, {
    play: () => void animation.play(),
    pause: () => void animation.pause(),
    resume: () => void animation.resume(),
    reverse: () => void animation.reverse(),
    reset: () => void animation.pause(0),
    interrupt: () => void animation.progress(animation.reversed() ? 0 : 1).pause(),
    dispose: () => {
      animation.kill();
      extraDispose?.();
    },
    status,
  });
}

export { gsap, ScrollTrigger };
