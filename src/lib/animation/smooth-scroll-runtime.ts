"use client";
/**
 * Lenis engine (Fase K3), loaded with import() by SmoothScrollProvider after hydration and only
 * when smooth scrolling is allowed (motion OK, fine pointer, quality tier allows it).
 *
 * One loop: Lenis has autoRaf off and is advanced in the "scroll" phase of the shared ticker
 * (./ticker.ts, on gsap.ticker — also GSAP's and ScrollTrigger's clock), so there is no second
 * requestAnimationFrame loop. Lenis' scroll event updates ScrollTrigger (when registered) and the
 * shared scroll frame (ScrollProgressController).
 *
 * Idle = no frames: the "scroll" tick is attached only while Lenis is animating — woken by a wheel
 * gesture (virtual-scroll) or a smooth scrollTo, detached on the first frame it has settled. An
 * idle page therefore requests no animation frames at all (GSAP's ticker sleeps again).
 *
 *  - Wheel only: touch keeps native momentum scrolling (syncTouch off).
 *  - Nested scrollers (code blocks, the palette list, the menu sheet) scroll natively
 *    (allowNestedScroll), as does anything inside <dialog> or [data-lenis-prevent].
 *  - Keyboard (Space, PageDown, arrows), form controls and find-in-page are native — Lenis only
 *    intercepts wheel events — and it follows native scroll changes when it is not animating.
 *  - Same-page anchors are handled by SmoothScrollProvider (focus + history), not Lenis' option.
 */
import Lenis from "lenis";
import { getMotionTokens } from "@/lib/design-tokens";
import { gsap, registeredScrollTrigger, setupGsap } from "@/lib/gsap";
import { resolveTop, writeScroll, type ScrollEngine } from "./scroll";
import { addTick } from "./ticker";

export function createLenisEngine(): ScrollEngine {
  setupGsap();
  const tokens = getMotionTokens();
  const lenis = new Lenis({
    autoRaf: false,
    smoothWheel: true,
    syncTouch: false,
    lerp: tokens.scroll.lerp,
    wheelMultiplier: tokens.scroll.wheelMultiplier,
    anchors: false,
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
    respectReducedMotion: true,
    prevent: (node) => !!node.closest?.("dialog, [data-lenis-prevent]"),
  });

  const onScroll = () => {
    registeredScrollTrigger()?.update();
    writeScroll(lenis.scroll, lenis.limit, lenis.velocity);
  };
  lenis.on("scroll", onScroll);

  // Tick only while animating (see header).
  let removeTick: (() => void) | null = null;
  let last = 0;
  const tick = (time: number) => {
    const ms = time * 1000;
    // Resuming after idle: give Lenis a one-frame delta instead of the whole idle gap.
    if (ms - last > 100) lenis.time = ms - 1000 / 60;
    last = ms;
    lenis.raf(ms);
    if (lenis.isScrolling !== "smooth") sleep();
  };
  const wake = () => {
    if (!removeTick) removeTick = addTick("scroll", tick);
  };
  const sleep = () => {
    removeTick?.();
    removeTick = null;
  };
  const offVirtual = lenis.on("virtual-scroll", wake);
  // Lenis expects a steady clock; GSAP's lag smoothing would make the scroll jump after a stall.
  gsap.ticker.lagSmoothing(0);
  writeScroll(window.scrollY, lenis.limit, 0);

  return {
    kind: "lenis",
    scrollTo(target, options = {}) {
      const top = resolveTop(target, options.offset ?? 0);
      if (top == null) return;
      lenis.scrollTo(top, {
        immediate: options.immediate,
        duration: options.duration,
        lock: false,
        force: true,
        onComplete: () => options.onComplete?.(),
      });
      if (!options.immediate) wake();
    },
    stop: () => lenis.stop(),
    start: () => lenis.start(),
    resize: () => {
      lenis.resize();
      registeredScrollTrigger()?.refresh();
    },
    // Lenis#reset is private in 1.3: an immediate scrollTo the real position drops inertia and
    // re-syncs its animated/target scroll (used after client navigations).
    reset: () => {
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      writeScroll(window.scrollY, lenis.limit, 0);
    },
    destroy: () => {
      sleep();
      offVirtual();
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    },
  };
}
