"use client";
/**
 * MotionProvider (Fase K3): Motion (motion/react) for DOM UI and micro-interactions.
 *  - LazyMotion + domAnimation with `strict`: components use `m.*`, so only the DOM animation
 *    features ship (no layout/drag code unless a page opts into domMax).
 *  - MotionConfig reducedMotion="user": transforms are skipped under prefers-reduced-motion
 *    (opacity/colour still change), on top of the CSS tokens collapsing durations.
 *  - Default transition = the --duration-hover / --ease-standard tokens.
 * Mount it around the subtree that uses the components in src/components/animated/ (it is not
 * part of SiteChrome until a page uses them, to keep Motion off pages that do not).
 * The dashboard keeps its own `motion` import (DashboardShell), unchanged in behaviour.
 */
import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { getMotionTokens } from "@/lib/design-tokens";

export function MotionProvider({ children }: { children: ReactNode }) {
  const t = getMotionTokens();
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: t.duration.hover, ease: t.ease.standard }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
