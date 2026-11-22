"use client";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { profile } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Email address as a copy button with a polite announcement (no toast needed). */
export function CopyEmail({ className }: { className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 3000);
    return () => clearTimeout(timer);
  }, [state]);
  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(profile.email);
            setState("copied");
          } catch {
            setState("failed");
          }
        }}
        className="inline-flex min-h-(--hit-area-min) items-center gap-2 rounded-(--radius-control) font-meta text-meta text-body transition-colors duration-(--duration-fast) ease-standard hover:text-ink [&_svg]:size-(--icon-sm)"
      >
        {state === "copied" ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
        {profile.email}
        <span className="sr-only">, copy email address</span>
      </button>
      <p aria-live="polite" className="min-h-5 font-meta text-meta text-muted">
        {state === "copied"
          ? "Email address copied."
          : state === "failed"
            ? "Couldn't copy automatically. Please copy the address above."
            : ""}
      </p>
    </div>
  );
}
