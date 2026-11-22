import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Calm placeholder for an API-driven section with no items. */
export function EmptyState({
  title,
  description,
  action,
  icon,
  headingLevel: Heading = "h3",
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-4 rounded-(--card-radius) border border-dashed border-hairline-strong p-(--card-padding)",
        className,
      )}
    >
      {icon && (
        <span
          className="text-muted [&_svg]:size-(--icon-md)"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className="flex max-w-reading flex-col gap-2">
        <Heading className="font-heading text-title text-ink text-balance">
          {title}
        </Heading>
        {description && (
          <p className="text-copy text-body text-pretty">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
