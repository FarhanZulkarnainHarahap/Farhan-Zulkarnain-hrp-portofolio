import { cn } from "@/lib/utils";

export function Separator({
  orientation = "horizontal",
  decorative = true,
  className,
}: {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  className?: string;
}) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0 bg-hairline",
        orientation === "horizontal"
          ? "h-(--border-hairline) w-full"
          : "h-full w-(--border-hairline)",
        className,
      )}
    />
  );
}
