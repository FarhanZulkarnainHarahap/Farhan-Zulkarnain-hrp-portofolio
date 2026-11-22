"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Mounted once in the site layout. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={300} skipDelayDuration={150}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

/**
 * Supplementary hint on hover and keyboard focus (Esc dismisses). Never the only place a
 * piece of information lives: the trigger keeps its own accessible name.
 */
export function Tooltip({
  content,
  children,
  side = "bottom",
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            "site-scheme z-(--z-toast) rounded-(--tooltip-radius) bg-(--tooltip-bg) px-2 py-1 font-meta text-meta text-(color:--tooltip-text) shadow-raised",

            className,
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
