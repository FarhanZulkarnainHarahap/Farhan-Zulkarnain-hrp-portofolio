import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Content-shaped placeholder. Pulses only when motion is allowed. */
export function Skeleton({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-(--radius-control) bg-(--skeleton-bg) motion-safe:animate-pulse",
        className,
      )}
      {...props}
    />
  );
}
