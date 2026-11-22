import { Slot, Slottable } from "@radix-ui/react-slot";
import { ArrowUpRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "relative inline-flex shrink-0 items-center justify-center gap-2 font-body font-medium whitespace-nowrap select-none " +
  "transition-[color,background-color,border-color,text-decoration-color] duration-(--duration-fast) ease-standard " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 " +
  "[&_svg]:pointer-events-none [&_svg]:size-(--icon-sm)";

const variants: Record<ButtonVariant, string> = {
  primary:
    "rounded-(--button-radius) bg-(--button-primary-bg) text-(color:--button-primary-text) hover:bg-(--button-primary-bg-hover)",
  secondary:
    "rounded-(--button-radius) border border-(color:--button-secondary-border) bg-(--button-secondary-bg) text-(color:--button-secondary-text) hover:bg-(--button-secondary-bg-hover)",
  ghost:
    "rounded-(--button-radius) text-(color:--button-ghost-text) hover:bg-(--button-ghost-bg-hover)",
  link: "rounded-(--radius-control) text-(color:--link-text) underline decoration-(color:--link-underline) decoration-(length:--link-underline-thickness) underline-offset-(--link-underline-offset) hover:decoration-current",
};

// sm keeps a 44px hit area via an invisible ::after so touch targets stay >= 44px.
const sizes: Record<ButtonSize, string> = {
  sm: "h-(--button-height-sm) px-(--button-padding-x-sm) text-small after:absolute after:inset-x-0 after:top-1/2 after:h-(--hit-area-min) after:-translate-y-1/2",
  md: "h-(--button-height) px-(--button-padding-x) text-small",
  lg: "h-(--button-height-lg) px-(--button-padding-x-lg) text-copy",
};
const linkSizes: Record<ButtonSize, string> = {
  sm: "min-h-(--hit-area-min) text-small",
  md: "min-h-(--hit-area-min) text-small",
  lg: "min-h-(--hit-area-min) text-copy",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    base,
    variants[variant],
    variant === "link" ? linkSizes[size] : sizes[size],
    className,
  );
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render the single child (e.g. next/link <Link>) with button styles. */
  asChild?: boolean;
  /** Appends ↗ and the "opens in a new tab" hint for external links. */
  external?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  asChild = false,
  external = false,
  icon,
  className,
  children,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={buttonClasses({ variant, size, className })}
      {...(asChild ? {} : { type: type ?? "button" })}
      {...props}
    >
      {icon}
      <Slottable>{children}</Slottable>
      {external && <ExternalMark />}
    </Comp>
  );
}

/** ↗ for links that leave the site, with a screen-reader hint. */
export function ExternalMark() {
  return (
    <>
      <ArrowUpRight aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </>
  );
}
