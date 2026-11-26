import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Content-shaped placeholder. A light sheen passes over it only when motion is allowed. */
export function Skeleton({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "skeleton-sheen rounded-(--radius-control) bg-(--skeleton-bg)",
        className,
      )}
      {...props}
    />
  );
}
