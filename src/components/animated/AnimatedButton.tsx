"use client";
/**
 * AnimatedButton (Fase K3, Motion): the token button (buttonClasses) with Motion states —
 * hover lift/scale (spring), tap press, focus, and the UI states loading / disabled / success /
 * error (error = short shake). Requires MotionProvider. The CSS :hover colours of buttonClasses
 * stay CSS (colour is CSS's job; transform is Motion's — one owner per property), so the CSS
 * `active:scale` press of buttonClasses is turned off here (Motion's tap owns the press).
 */
import { m } from "motion/react";
import { useMemo, type ComponentProps } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { interactionVariants, type UiState } from "@/lib/animation/motion-variants";

export type AnimatedButtonProps = Omit<ComponentProps<typeof m.button>, "children"> & {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: UiState;
};

export function AnimatedButton({ variant = "primary", size = "md", state = "idle", className, disabled, children, ...props }: AnimatedButtonProps) {
  const variants = useMemo(() => interactionVariants(), []);
  const inert = disabled || state === "disabled" || state === "loading";
  return (
    <m.button
      type="button"
      {...props}
      disabled={disabled || state === "disabled"}
      aria-busy={state === "loading" || undefined}
      data-state={state}
      className={buttonClasses({ variant, size, className: `active:scale-100 ${className ?? ""}` })}
      variants={variants}
      initial={false}
      animate={state === "idle" ? "idle" : state}
      whileHover={inert ? undefined : "hover"}
      whileTap={inert ? undefined : "tap"}
      whileFocus={inert ? undefined : "focus"}
    >
      {children}
    </m.button>
  );
}
