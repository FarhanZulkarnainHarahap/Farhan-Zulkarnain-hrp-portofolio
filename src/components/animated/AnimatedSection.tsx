"use client";
/**
 * AnimatedSection (Fase K3, Motion): a <section> that rises in when it enters the viewport (once),
 * with an optional data-section name for the shared "active section" state. Server/no-JS/reduced
 * motion: rendered in place, visible.
 */
import { m } from "motion/react";
import { useMemo, useRef, type ComponentProps } from "react";
import { sectionVariants } from "@/lib/animation/motion-variants";
import { useReveal } from "./useReveal";

export function AnimatedSection({ section, children, ...props }: Omit<ComponentProps<typeof m.section>, "variants" | "initial" | "animate"> & { section?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { variant } = useReveal(ref);
  const variants = useMemo(() => sectionVariants(), []);
  return (
    <m.section ref={ref} data-section={section} {...props} variants={variants} initial={false} animate={variant}>
      {children}
    </m.section>
  );
}
