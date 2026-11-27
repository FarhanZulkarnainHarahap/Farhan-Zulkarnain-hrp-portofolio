"use client";
/**
 * AnimatedPanel (Fase K3, Motion): content that enters (bottom → top) and exits (up and out)
 * through AnimatePresence — disclosure panels, toasts, tab content. `mode="wait"` lets the old
 * panel leave before the new one enters when `panelKey` changes (rapid toggles are interrupted
 * cleanly by Motion, never stacked).
 */
import { AnimatePresence, m } from "motion/react";
import { useMemo, type ReactNode } from "react";
import { presenceVariants } from "@/lib/animation/motion-variants";

export function AnimatedPanel({
  open = true,
  panelKey = "panel",
  children,
  className,
  id,
}: {
  open?: boolean;
  panelKey?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const variants = useMemo(() => presenceVariants(), []);
  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <m.div key={panelKey} id={id} className={className} variants={variants} initial="hidden" animate="enter" exit="exit">
          {children}
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
