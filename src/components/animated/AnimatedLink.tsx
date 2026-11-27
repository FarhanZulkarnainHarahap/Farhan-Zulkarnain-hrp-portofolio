"use client";
/**
 * AnimatedLink (Fase K3, Motion): next/link with an underline that draws from the left on hover /
 * focus and retracts to the right on leave, plus an optional trailing icon nudge. The underline is
 * a separate span (scaleX owned by Motion); link colour stays CSS. Requires MotionProvider.
 */
import Link from "next/link";
import { m, type Variants } from "motion/react";
import { useMemo, type ComponentProps, type ReactNode } from "react";
import { getMotionTokens } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export function AnimatedLink({ children, icon, className, ...props }: ComponentProps<typeof Link> & { icon?: ReactNode }) {
  const { line, nudge } = useMemo(() => {
    const t = getMotionTokens();
    const transition = { duration: t.duration.hover, ease: t.ease.standard };
    return {
      line: {
        idle: { scaleX: 0, originX: 1, transition },
        hover: { scaleX: 1, originX: 0, transition },
      } satisfies Variants,
      nudge: {
        idle: { x: 0, transition },
        hover: { x: t.revealDistance / 3, transition },
      } satisfies Variants,
    };
  }, []);
  return (
    <m.span className="inline-flex" initial="idle" animate="idle" whileHover="hover" whileFocus="hover">
      <Link {...props} className={cn("relative inline-flex items-center gap-2 text-ink outline-offset-4", className)}>
        <span className="relative">
          {children}
          <m.span aria-hidden="true" variants={line} className="absolute inset-x-0 -bottom-0.5 h-px bg-current" />
        </span>
        {icon ? (
          <m.span aria-hidden="true" variants={nudge} className="inline-flex">
            {icon}
          </m.span>
        ) : null}
      </Link>
    </m.span>
  );
}
