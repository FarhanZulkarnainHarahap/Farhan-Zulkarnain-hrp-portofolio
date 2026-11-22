import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const widths = {
  page: "max-w-page",
  wide: "max-w-wide",
  reading: "max-w-reading",
} as const;

/** Centered column with the fluid page gutter. */
export function Container({
  as = "div",
  size = "page",
  className,
  ...props
}: ComponentPropsWithoutRef<"div"> & {
  as?: "div" | "section" | "header" | "footer" | "main" | "article";
  size?: keyof typeof widths;
}) {
  const Comp = as as "div";
  return (
    <Comp
      className={cn("mx-auto w-full px-gutter", widths[size], className)}
      {...props}
    />
  );
}
