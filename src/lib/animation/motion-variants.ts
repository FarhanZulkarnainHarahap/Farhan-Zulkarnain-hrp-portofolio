/**
 * Motion (motion/react) variants for DOM UI (Fase K3). Durations, eases, springs, distances and
 * scales come from the design tokens; under reduced motion CSS zeroes them, and MotionProvider
 * sets reducedMotion="user" so transforms are skipped entirely.
 *
 * States: idle · hover · tap · focus · active · enter · exit · loading · disabled · success · error.
 */
import type { Transition, Variants } from "motion/react";
import { getMotionTokens, type MotionTokenSet } from "@/lib/design-tokens";

export type UiState = "idle" | "loading" | "disabled" | "success" | "error";

const tween = (duration: number, ease: [number, number, number, number]): Transition => ({ duration, ease });

/** Interaction variants for buttons, links, icons and cards. */
export function interactionVariants(t: MotionTokenSet = getMotionTokens()): Variants {
  const spring = { type: "spring" as const, ...t.spring.default };
  return {
    idle: { scale: 1, y: 0, opacity: 1, transition: tween(t.duration.hover, t.ease.standard) },
    hover: { scale: t.hover.scale, y: t.hover.liftPx, transition: spring },
    tap: { scale: t.press.scale, y: 0, transition: tween(t.duration.press, t.ease.standard) },
    focus: { scale: t.hover.scale, transition: tween(t.duration.micro, t.ease.standard) },
    active: { scale: 1, y: 0, opacity: 1 },
    loading: { opacity: 0.72, scale: 1, transition: tween(t.duration.hover, t.ease.standard) },
    disabled: { opacity: 0.4, scale: 1, y: 0, transition: tween(t.duration.micro, t.ease.standard) },
    success: { scale: [1, t.hover.scale, 1], transition: tween(t.duration.enter, t.ease.enter) },
    // A short horizontal shake; distance collapses to 0 under reduced motion.
    error: {
      x: [0, -t.revealDistance / 2, t.revealDistance / 2, -t.revealDistance / 4, 0],
      transition: tween(t.duration.enter, t.ease.standard),
    },
  };
}

/** Enter / exit for panels, sections and list items (bottom → top). */
export function presenceVariants(t: MotionTokenSet = getMotionTokens()): Variants {
  return {
    exit: { opacity: 0, y: -t.revealDistance, transition: tween(t.duration.pageExit, t.ease.exit) },
    hidden: { opacity: 0, y: t.revealDistance * 2, transition: { duration: 0 } },
    enter: { opacity: 1, y: 0, transition: tween(t.duration.enter, t.ease.enter) },
  };
}

/** Container that staggers children with presenceVariants. */
export function staggerVariants(t: MotionTokenSet = getMotionTokens(), stagger = t.stagger.base): Variants {
  return {
    hidden: { transition: { duration: 0 } },
    enter: { transition: { staggerChildren: stagger, delayChildren: 0 } },
    exit: { transition: { staggerChildren: stagger / 2, staggerDirection: -1 } },
  };
}

/** Masked line/word: slides up from below its clipping parent. */
export function maskVariants(t: MotionTokenSet = getMotionTokens()): Variants {
  return {
    hidden: { y: "105%", transition: { duration: 0 } },
    enter: { y: "0%", transition: tween(t.duration.section, t.ease.mask) },
    exit: { y: "-105%", transition: tween(t.duration.pageExit, t.ease.exit) },
  };
}

/** Section reveal on entering the viewport. */
export function sectionVariants(t: MotionTokenSet = getMotionTokens()): Variants {
  return {
    hidden: { opacity: 0, y: t.revealDistance * 2, transition: { duration: 0 } },
    enter: { opacity: 1, y: 0, transition: tween(t.duration.section, t.ease.enter) },
  };
}

/** Idle float for DOM accents (loops; Motion skips it under reduced motion). */
export function idleVariants(t: MotionTokenSet = getMotionTokens()): Variants {
  return {
    idle: {
      y: [0, -t.revealDistance / 2, 0],
      transition: { duration: t.idle.floatPeriod, ease: "easeInOut", repeat: Infinity },
    },
  };
}
