"use client";
import { RotateCw, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/** Failed load: says what failed and offers a retry (role="alert" announces it). */
export function ErrorState({
  title = "This content couldn't be loaded.",
  description = "The content service may be temporarily unavailable. Please try again in a moment.",
  onRetry,
  retryLabel = "Try again",
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-4 rounded-(--card-radius) border border-hairline bg-surface p-(--card-padding)",
        className,
      )}
    >
      <p className="flex items-center gap-2 font-medium text-ink">
        <TriangleAlert
          aria-hidden="true"
          className="size-(--icon-md) text-danger"
          strokeWidth={1.5}
        />
        {title}
      </p>
      {description && (
        <p className="max-w-reading text-small text-body">{description}</p>
      )}
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={<RotateCw aria-hidden="true" />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
