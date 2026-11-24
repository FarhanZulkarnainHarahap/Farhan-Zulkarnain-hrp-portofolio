import Link from "next/link";
import type { ReactNode } from "react";
import { HeroEntrance } from "@/components/home/HeroEntrance";
import { ScrollHint } from "@/components/home/ScrollHint";
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
 * the LCP element and is never animated (nor is the header). The visual is the Fz card entrance
 * rendered in Blender (Fase 10.5, HeroEntrance); the intro timeline for the text lives in
 * MotionController ([data-intro] steps).
 */
export function Hero({
  proof,
  visual,
}: {
  proof: HeroProof;
  /** Overrides the default visual (the Fz card entrance). */
  visual?: ReactNode;
}) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[calc(100svh-var(--nav-height))] flex-col pt-section-sm"
    >
      <Container
        size="wide"
        className="grid flex-1 items-center gap-12 lg:grid-cols-12"
      >
        <div className="flex flex-col gap-7 lg:col-span-7">
          <Eyebrow data-intro="eyebrow">Full-stack engineer · Medan, Indonesia</Eyebrow>
          <div className="flex flex-col gap-5">
            <h1
              id="hero-title"
              className="font-heading text-display-xl text-ink text-balance"
            >
              Farhan Zulkarnain Harahap
            </h1>
            <span
              aria-hidden="true"
              data-intro-line
              className="block h-0.5 w-16 origin-left bg-accent"
            />
          </div>
          <p
            data-intro="lead"
            className="max-w-reading text-copy-lg text-body text-pretty"
          >
            I build web applications end to end, from a clear interface to the
            API and database behind it.
          </p>
          <div data-intro="cta" className="flex flex-wrap items-center gap-3">
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
            data-intro="status"
            className="flex flex-col gap-3 border-t border-hairline pt-6"
          >
            <p className="flex items-center gap-2.5 text-small text-ink">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-pill bg-success"
              />
              <ShinyText delay={700}>
                Open to full-time roles and freelance projects
              </ShinyText>
            </p>
            <ProofLine proof={proof} />
          </div>
        </div>
        <div className="lg:col-span-5">{visual ?? <HeroEntrance />}</div>
      </Container>
      <ScrollHint />
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
