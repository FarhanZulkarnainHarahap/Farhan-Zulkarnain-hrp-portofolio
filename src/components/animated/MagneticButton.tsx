"use client";
/**
 * MagneticButton (Fase K3, Motion): pulls its content toward the pointer inside
 * --magnetic-radius, with --magnetic-strength, through motion values + a spring (no React state
 * per pointer move). Fine pointers only; inert under reduced motion (strength token = 0, and
 * Motion skips transforms). Wraps any child (a Link, an AnimatedButton); the child keeps its own
 * semantics — this only adds a transform layer around it.
 */
import { m, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { getMotionTokens } from "@/lib/design-tokens";

export function MagneticButton({ children, className, strength }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const t = getMotionTokens();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: t.spring.soft.stiffness, damping: t.spring.soft.damping, mass: t.spring.soft.mass };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  const pull = strength ?? t.hover.magneticStrength;

  const onPointerMove = (event: React.PointerEvent) => {
    if (reduced || event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const reach = t.hover.magneticRadiusPx + Math.max(rect.width, rect.height) / 2;
    const falloff = Math.max(0, 1 - Math.hypot(dx, dy) / reach);
    x.set(dx * pull * falloff);
    y.set(dy * pull * falloff);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.span
      ref={ref}
      data-magnetic=""
      className={`inline-flex ${className ?? ""}`}
      style={{ x: sx, y: sy }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onBlur={reset}
    >
      {children}
    </m.span>
  );
}
