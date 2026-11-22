"use client";
import { Check } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";

/** Key features: first 6, then "Show all {n} features" (DESIGN.md → Page patterns). */
export function FeatureList({
  features,
  initial = 6,
}: {
  features: string[];
  initial?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const shown = expanded ? features : features.slice(0, initial);
  return (
    <div className="flex flex-col gap-6">
      <ul id={id} className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {shown.map((feature, index) => (
          <li
            key={`${feature}-${index}`}
            className="flex gap-3 text-copy text-body [overflow-wrap:anywhere]"
          >
            <Check
              aria-hidden="true"
              className="mt-1 size-(--icon-sm) shrink-0 text-accent"
            />
            {feature}
          </li>
        ))}
      </ul>
      {features.length > initial && (
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show fewer" : `Show all ${features.length} features`}
        </Button>
      )}
    </div>
  );
}
