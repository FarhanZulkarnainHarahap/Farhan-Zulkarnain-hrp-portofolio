import Link from "next/link";
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
 * the LCP element; nothing above it animates. The visual slot on the right is a static
 * placeholder until the 3D accent arrives (Fase 10).
 */
export function Hero({ proof }: { proof: HeroProof }) {
  return (
    <section aria-labelledby="hero-title" className="pt-section-sm">
      <Container
        size="wide"
        className="grid items-center gap-12 lg:grid-cols-12"
      >
        <div className="flex flex-col gap-7 lg:col-span-7">
          <Eyebrow>Full-stack engineer · Medan, Indonesia</Eyebrow>
          <h1
            id="hero-title"
            className="font-heading text-display-xl text-ink text-balance"
          >
            Farhan Zulkarnain Harahap
          </h1>
          <p className="max-w-reading text-copy-lg text-body text-pretty">
            I build web applications end to end, from a clear interface to the
            API and database behind it.
          </p>
          <div className="flex flex-wrap items-center gap-3">
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
          <div className="flex flex-col gap-3 border-t border-hairline pt-6">
            <p className="flex items-center gap-2.5 text-small text-ink">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-pill bg-success"
              />
              Open to full-time roles and freelance projects
            </p>
            <ProofLine proof={proof} />
          </div>
        </div>
        <HeroVisual />
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

/** Static, decorative placeholder for the future 3D accent (desktop only). */
function HeroVisual() {
  return (
    <div aria-hidden="true" className="relative hidden lg:col-span-5 lg:block">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-(--card-radius) border border-hairline bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,var(--ui-accent-soft),transparent_60%)]" />
        <div className="absolute inset-x-8 top-8 flex items-center justify-between font-meta text-label text-muted uppercase">
          <span>Medan, Indonesia</span>
          <span>UTC+7</span>
        </div>
        <span className="absolute -bottom-10 left-6 font-heading text-(length:--hero-monogram-lg) leading-none text-ink/90 italic select-none">
          F
        </span>
        <span className="absolute right-8 bottom-8 font-heading text-(length:--hero-monogram-sm) leading-none text-accent italic select-none">
          z
        </span>
        <div className="absolute inset-x-8 bottom-8 h-(--border-hairline) bg-hairline-strong" />
      </div>
    </div>
  );
}
