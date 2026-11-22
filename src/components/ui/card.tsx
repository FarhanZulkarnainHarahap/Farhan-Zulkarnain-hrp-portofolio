import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Quiet outlined surface. Add `interactive` when the whole card is one link. */
export function Card({
  className,
  interactive = false,
  ...props
}: ComponentPropsWithoutRef<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-(--card-radius) border border-(color:--card-border) bg-(--card-bg) p-(--card-padding)",
        interactive &&
          "transition-colors duration-(--duration-fast) ease-standard hover:bg-(--card-bg-hover) has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-(--focus-ring-offset) has-[a:focus-visible]:outline-focus",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cn("font-heading text-title text-ink text-balance", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn("text-small text-body text-pretty", className)}
      {...props}
    />
  );
}

/** Fixed-ratio media frame with a tonal placeholder (prevents layout shift). */
export function CardMedia({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "relative aspect-[16/10] overflow-hidden rounded-(--media-radius) bg-(--media-bg)",
        className,
      )}
      {...props}
    />
  );
}
