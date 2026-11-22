"use client";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { profile } from "@/lib/site";

export function ContactBand() {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  useEffect(() => {
    if (copied === "idle") return;
    const timer = setTimeout(() => setCopied("idle"), 3000);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <section aria-labelledby="contact-band-title" className="py-section">
      <Container size="wide">
        <div className="flex flex-col gap-8 rounded-(--card-radius) border border-hairline bg-surface p-(--card-padding) md:flex-row md:items-end md:justify-between md:p-12">
          <div className="flex max-w-reading flex-col gap-3">
            <h2
              id="contact-band-title"
              className="font-heading text-headline text-ink text-balance"
            >
              Have a role or a project in mind?
            </h2>
            <p className="text-copy-lg text-body">Tell me about it.</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <Link
              href="/contact"
              className={buttonClasses({ variant: "primary", size: "lg" })}
            >
              Get in touch
            </Link>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(profile.email);
                  setCopied("copied");
                } catch {
                  setCopied("failed");
                }
              }}
              className="inline-flex min-h-(--hit-area-min) items-center gap-2 rounded-(--radius-control) font-meta text-meta text-body transition-colors duration-(--duration-fast) ease-standard hover:text-ink [&_svg]:size-(--icon-sm)"
            >
              {copied === "copied" ? (
                <Check aria-hidden="true" />
              ) : (
                <Copy aria-hidden="true" />
              )}
              {profile.email}
              <span className="sr-only">, copy email address</span>
            </button>
            <p
              aria-live="polite"
              className="min-h-5 font-meta text-meta text-muted"
            >
              {copied === "copied"
                ? "Email address copied."
                : copied === "failed"
                  ? "Couldn't copy automatically. Please copy the address above."
                  : ""}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
