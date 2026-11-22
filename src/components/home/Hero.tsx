import Link from "next/link";
import type { ReactNode } from "react";
import { HeroVisual } from "@/components/hero3d/HeroVisual";
import { ShinyText } from "@/components/accents/ShinyText";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section";

export type HeroProof = {
  projects: number;
  technologies: number;
  stack: string[];
} | null;

/**
 * First screen: who, what, proof, next step. The H1 is plain server-rendered text so it can be
 * the LCP element; nothing above it animates. The visual slot on the right holds the Blender
 * poster and, on capable desktops, the interactive HeroModel (Fase 10).
 */
export function Hero({
  proof,
  visual,
}: {
  proof: HeroProof;
  /** Overrides the default HeroVisual (poster + HeroModel). */
  visual?: ReactNode;
}) {
  return (
    <section aria-labelledby="hero-title" className="pt-section-sm">
      <Container
        size="wide"
        className="grid items-center gap-12 lg:grid-cols-12"
      >
        <div className="flex flex-col gap-7 lg:col-span-7">
          <Eyebrow data-intro>Full-stack engineer · Medan, Indonesia</Eyebrow>
          <h1
            id="hero-title"
            className="font-heading text-display-xl text-ink text-balance"
          >
            Farhan Zulkarnain Harahap
          </h1>
          <p
            data-intro
            className="max-w-reading text-copy-lg text-body text-pretty"
          >
            I build web applications end to end, from a clear interface to the
            API and database behind it.
          </p>
          <div data-intro className="flex flex-wrap items-center gap-3">
            <Link
              href="/projects"
              className={buttonClasses({ variant: "primary", size: "lg" })}
            >
              View projects
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className={buttonClasses({ variant: "secondary", size: "lg" })}
            >
              Get in touch
            </Link>
          </div>
          <div
            data-intro
            className="flex flex-col gap-3 border-t border-hairline pt-6"
          >
            <p className="flex items-center gap-2.5 text-small text-ink">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-pill bg-success"
              />
              <ShinyText>
                Open to full-time roles and freelance projects
              </ShinyText>
            </p>
            <ProofLine proof={proof} />
          </div>
        </div>
        {visual ?? <HeroVisual />}
      </Container>
    </section>
  );
}

/** "{n} projects · {n} technologies · A, B, C" from API data; hidden when there is none. */
function ProofLine({ proof }: { proof: HeroProof }) {
  if (!proof) return null;
  const parts = [
    proof.projects > 0 &&
      `${proof.projects} ${proof.projects === 1 ? "project" : "projects"}`,
    proof.technologies > 0 &&
      `${proof.technologies} ${proof.technologies === 1 ? "technology" : "technologies"}`,
    proof.stack.length > 0 && proof.stack.join(", "),
  ].filter(Boolean);
  if (!parts.length) return null;
  return (
    <p
      className="min-h-5 font-meta text-meta text-muted"
      data-testid="hero-proof"
    >
      {parts.join(" · ")}
    </p>
  );
}
