"use client";
/**
 * StaggerContainer + StaggerItem (Fase K3, Motion): children rise in one after the other when the
 * container enters the viewport (once). Server/no-JS/reduced motion: everything visible.
 */
import { m } from "motion/react";
import { useMemo, useRef, type ReactNode } from "react";
import { presenceVariants, staggerVariants } from "@/lib/animation/motion-variants";
import { getMotionTokens } from "@/lib/design-tokens";
import { useReveal } from "./useReveal";

export function StaggerContainer({ children, className, stagger, as = "div" }: { children: ReactNode; className?: string; stagger?: number; as?: "div" | "ul" | "ol" }) {
  const ref = useRef<HTMLDivElement & HTMLUListElement & HTMLOListElement>(null);
  const { variant } = useReveal(ref);
  const variants = useMemo(() => staggerVariants(getMotionTokens(), stagger), [stagger]);
  const Comp = as === "ul" ? m.ul : as === "ol" ? m.ol : m.div;
  return (
    <Comp ref={ref} className={className} variants={variants} initial={false} animate={variant}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const variants = useMemo(() => presenceVariants(), []);
  const Comp = as === "li" ? m.li : m.div;
  return (
    <Comp className={className} variants={variants}>
      {children}
    </Comp>
  );
}
