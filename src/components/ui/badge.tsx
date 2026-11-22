"use client";
import { useId, useState, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const chipBase =
  "inline-flex min-h-(--chip-height) max-w-full items-center rounded-(--chip-radius) border px-(--chip-padding-x) " +
  "font-meta text-meta [overflow-wrap:anywhere]";

/** Neutral metadata chip (tags, technologies). Labels wrap; they are never truncated. */
export function Chip({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        chipBase,
        "border-(color:--chip-border) bg-(--chip-bg) text-(color:--chip-text)",
        className,
      )}
      {...props}
    />
  );
}

/** Emphasised label (e.g. case type). */
export function Badge({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        chipBase,
        "border-transparent bg-accent-soft text-ink uppercase text-label",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Shows the first `max` items as chips and a "+N" toggle for the rest
 * (aria-label "{n} more technologies", per docs/COPY.md). The toggle is a real button,
 * so the hidden values are reachable by keyboard and touch, not only on hover.
 */
export function ChipList({
  items,
  max = 4,
  noun = "technologies",
  className,
}: {
  items: string[];
  max?: number;
  noun?: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const hidden = Math.max(items.length - max, 0);
  const shown = expanded ? items : items.slice(0, max);
  return (
    <ul id={listId} className={cn("flex flex-wrap gap-2", className)}>
      {shown.map((item, index) => (
        <li key={`${item}-${index}`}>
          <Chip>{item}</Chip>
        </li>
      ))}
      {hidden > 0 && (
        <li>
          <button
            type="button"
            className={cn(
              chipBase,
              "relative cursor-pointer border-(color:--chip-border) bg-transparent text-(color:--chip-text) transition-colors duration-(--duration-fast) ease-standard hover:bg-(--chip-bg)",
              "after:absolute after:inset-x-0 after:top-1/2 after:h-(--hit-area-min) after:-translate-y-1/2",
            )}
            aria-expanded={expanded}
            aria-controls={listId}
            aria-label={
              expanded ? `Show fewer ${noun}` : `${hidden} more ${noun}`
            }
            onClick={(event) => {
              // Inside a card link: toggle without navigating.
              event.preventDefault();
              event.stopPropagation();
              setExpanded((value) => !value);
            }}
          >
            {expanded ? "Less" : `+${hidden}`}
          </button>
        </li>
      )}
    </ul>
  );
}
