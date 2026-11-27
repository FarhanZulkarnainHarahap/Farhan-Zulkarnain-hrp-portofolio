"use client";
/**
 * AnimatedIcon (Fase K3, Motion): an icon that reacts to its own or its parent's hover/tap
 * variants ("hover" / "tap" propagate from a Motion parent), with a motion kind: nudge (→),
 * rise (↑), spin (a quarter turn) or pulse (scale). Decorative: aria-hidden.
 */
import { m, type Variants } from "motion/react";
import { useMemo, type ReactNode } from "react";
import { getMotionTokens } from "@/lib/design-tokens";

export type IconMotion = "nudge" | "rise" | "spin" | "pulse";

export function AnimatedIcon({ children, motion = "nudge", className }: { children: ReactNode; motion?: IconMotion; className?: string }) {
  const variants = useMemo<Variants>(() => {
    const t = getMotionTokens();
    const transition = { type: "spring" as const, ...t.spring.default };
    const d = t.revealDistance / 3;
    const hover = { nudge: { x: d }, rise: { y: -d }, spin: { rotate: 90 }, pulse: { scale: t.hover.scale * 1.05 } }[motion];
    return {
      idle: { x: 0, y: 0, rotate: 0, scale: 1, transition },
      hover: { ...hover, transition },
      tap: { scale: t.press.scale, transition: { duration: t.duration.press } },
    };
  }, [motion]);
  return (
    <m.span aria-hidden="true" className={`inline-flex ${className ?? ""}`} variants={variants} initial="idle" whileHover="hover" whileTap="tap">
      {children}
    </m.span>
  );
}
