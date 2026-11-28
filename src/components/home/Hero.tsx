import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { ShinyText } from "@/components/accents/ShinyText";
import { OrbitFallback } from "@/components/hero/OrbitFallback";
import { buildOrbit } from "@/lib/display/orbit";
import { ScrollHint } from "@/components/home/ScrollHint";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Skill } from "@/types/content";

export type HeroProof = {
  projects: number;
  technologies: number;
  stack: string[];
} | null;

/**
 * First screen (Kinetic, Fase K2): a full-viewport composition on the 12-column grid.
 *  - Left (7 cols): paired technical labels, the name set oversized in three masked lines, a
 *    drawn rule, the lead, CTAs, availability and API-derived proof.
 *  - Right (5 cols): the orbit stage. Fase 6 mounts the WebGL orbital system there through the
 *    persistent canvas; until then — and permanently without WebGL — the static SVG orbit renders.
 *  - Mobile: text first, then the orbit in its own square area (never over the text), CTAs in
 *    thumb reach right after the lead.
 * The H1 is one plain server-rendered text block (the LCP element on every width) and is never
 * hidden by the intro. Masked line reveals split it at runtime (SplitText, Fase 3+) and revert;
 * wrapping lines in block spans on the server would split the LCP block and hand it to the lead.
 */
export function Hero({
  proof,
  skills = [],
  visual,
}: {
  proof: HeroProof;
  /** API skills for the orbit (no hardcoded list). */
  skills?: Skill[];
  /** Overrides the orbit stage content. */
  visual?: ReactNode;
}) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[calc(100svh-var(--nav-height))] flex-col"
    >
      <Container
        size="wide"
        className="grid flex-1 content-center gap-x-(--spacing-grid-gap) gap-y-14 pt-section-sm pb-24 lg:grid-cols-12 lg:items-center lg:pb-section-sm"
      >
        <div className="relative z-(--z-ui) flex min-w-0 flex-col gap-8 lg:col-span-7">
          <div
            data-intro="eyebrow"
            className="flex flex-wrap gap-x-10 gap-y-3 font-meta text-label text-muted uppercase"
          >
            <p>
              Full-stack engineer
              <br />
              Creative developer
            </p>
            <p>
              Based in
              <br />
              Medan, Indonesia
            </p>
          </div>
          <h1
            id="hero-title"
            className="font-display text-display-hero text-ink uppercase"
          >
            Farhan Zulkarnain Harahap
          </h1>
          <span
            aria-hidden="true"
            data-intro-line
            className="block h-(--border-hairline) w-full origin-left bg-hairline-strong"
          />
          <div className="grid gap-8 xl:grid-cols-7 xl:gap-x-(--spacing-grid-gap)">
            <p
              data-intro="lead"
              className="max-w-reading text-copy-lg text-body text-pretty xl:col-span-4"
            >
              I build web applications end to end, from a clear interface to
              the API and database behind it.
            </p>
            <div
              data-intro="cta"
              className="flex flex-wrap items-start gap-3 xl:col-span-3 xl:flex-col"
            >
              <Link
                href="/projects"
                data-magnetic
                data-cursor="explore"
                className={buttonClasses({ variant: "primary", size: "lg" })}
              >
                Explore projects
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                data-magnetic
                className={buttonClasses({ variant: "secondary", size: "lg" })}
              >
                Get in touch
              </Link>
            </div>
          </div>
          <div
            data-intro="status"
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
          >
            <p className="flex items-center gap-3 text-small text-ink">
              <span
                aria-hidden="true"
                className="status-pulse relative size-2 shrink-0 rounded-pill bg-success text-success"
              />
              <ShinyText delay={700}>
                Open to full-time roles and freelance projects
              </ShinyText>
            </p>
            <ProofLine proof={proof} />
          </div>
        </div>
        <div className="relative lg:col-span-5">
          {/* Orbit stage: the SVG fallback is server-rendered here; the persistent canvas (Fase K4)
              places its WebGL orbit prototype in this slot (data-scene-anchor) from the same model
              (data-scene-props, from the API skills) and raycasts only inside it. */}
          <div
            data-orbit-stage
            data-orbit-renderer="svg"
            data-scene-anchor="home"
            data-scene-interactive
            data-scene-props={orbitSceneProps(skills)}
            className="relative mx-auto aspect-[264/200] w-(--orbit-stage-size-mobile) lg:w-(--orbit-stage-size)"
          >
            {visual ?? <OrbitFallback skills={skills} />}
          </div>
        </div>
      </Container>
      <ScrollHint />
    </section>
  );
}

/** The orbit model for the WebGL scene, as JSON (rings, node ids and angles — no extra data). */
function orbitSceneProps(skills: Skill[]) {
  const rings = buildOrbit(skills).map(({ id, radius, inclination, roll, direction, period, nodes }) => ({
    id,
    radius,
    inclination,
    roll,
    direction,
    period,
    nodes: nodes.map((node) => ({ id: node.id, angle: Number(node.angle.toFixed(4)) })),
  }));
  return JSON.stringify({ rings });
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
