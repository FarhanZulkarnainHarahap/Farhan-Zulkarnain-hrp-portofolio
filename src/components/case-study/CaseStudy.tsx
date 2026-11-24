import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProjectImage } from "@/components/projects/ProjectImage";
import { NextSteps } from "@/components/site/NextSteps";
import { Badge, ChipList } from "@/components/ui/badge";
import { buttonClasses, ExternalMark } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section";
import {
  displayFeatures,
  displayTags,
  projectYear,
  splitCaseType,
} from "@/lib/display/projects";
import { getProjectSlug } from "@/lib/portfolio/projects";
import { safeHref } from "@/lib/site";
import type { Project } from "@/services/api";
import { FeatureList } from "./FeatureList";

type Neighbour = Pick<Project, "id" | "title"> | null;

/**
 * Case study article. The lead image is the project screenshot in a fixed-ratio frame (16:10,
 * media radius, hairline border) so nothing shifts while it loads. It sits right under the title
 * and CTAs, above the fold on desktop, so it is loaded with priority. `media` can replace it.
 */
export function CaseStudy({
  project,
  previous,
  next,
  media,
}: {
  project: Project;
  previous: Neighbour;
  next: Neighbour;
  media?: ReactNode;
}) {
  const types = splitCaseType(project.caseType);
  const stack = displayTags(project.tags);
  const features = displayFeatures(project.features);
  const demo = safeHref(project.demoUrl);
  const repo = safeHref(project.repoUrl);
  const year = projectYear(project);
  const chapters = [
    { title: "Problem", body: project.caseProblem },
    { title: "Solution", body: project.caseSolution },
    { title: "Result", body: project.caseResult },
  ].filter((chapter) => chapter.body && chapter.body.trim());

  return (
    <article>
      <header className="pt-section-sm pb-12">
        <Container size="wide" className="flex flex-col gap-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 font-meta text-meta text-muted">
              <li>
                <Link
                  href="/projects"
                  // 44 px hit area without growing the breadcrumb row (Fase 12.4).
                  className="relative underline-offset-(--link-underline-offset) after:absolute after:inset-x-0 after:top-1/2 after:h-(--hit-area-min) after:-translate-y-1/2 hover:text-ink hover:underline"
                >
                  Projects
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li
                aria-current="page"
                className="text-ink [overflow-wrap:anywhere]"
              >
                {project.title}
              </li>
            </ol>
          </nav>
          <div className="flex max-w-4xl flex-col gap-6">
            {types.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Project type">
                {types.map((type) => (
                  <li key={type}>
                    <Badge>{type}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <h1 className="font-heading text-display-lg text-ink text-balance [overflow-wrap:anywhere]">
              {project.title}
            </h1>
            {project.description && (
              <p className="max-w-reading text-copy-lg text-body text-pretty whitespace-pre-line [overflow-wrap:anywhere]">
                {project.description}
              </p>
            )}
            {(demo || repo) && (
              <div className="flex flex-wrap gap-3">
                {demo && (
                  <a
                    href={demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses({ variant: "primary" })}
                  >
                    Visit live site
                    <ExternalMark />
                  </a>
                )}
                {repo && (
                  <a
                    href={repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses({ variant: "secondary" })}
                  >
                    View source
                    <ExternalMark />
                  </a>
                )}
              </div>
            )}
          </div>
          <div data-case-media>
            {media ?? (
              <ProjectImage
                src={project.imageUrl}
                alt={`${project.title} screenshot`}
                // Not priority (Fase 12.2): below the fold on phones, a sliver on desktop, never the
                // LCP (the lead paragraph is); a preload only competed with the text on mobile.
                sizes="(min-width: 1280px) 1200px, 94vw"
                className="border border-hairline"
              />
            )}
          </div>
        </Container>
      </header>

      <Container
        size="wide"
        className="grid gap-12 pb-section-sm lg:grid-cols-12"
      >
        <aside
          aria-label="Project details"
          className="lg:order-2 lg:col-span-4"
        >
          <dl className="flex flex-col gap-6 rounded-(--card-radius) border border-hairline p-(--card-padding) lg:sticky lg:top-[calc(var(--nav-height)+2rem)]">
            {types.length > 0 && (
              <div className="flex flex-col gap-2">
                <dt className="font-meta text-label text-muted uppercase">
                  Type
                </dt>
                <dd className="text-small text-ink">{types.join(", ")}</dd>
              </div>
            )}
            {stack.length > 0 && (
              <div className="flex flex-col gap-2">
                <dt className="font-meta text-label text-muted uppercase">
                  Stack
                </dt>
                <dd>
                  {/* 56 technologies made a 2,000 px column on phones (Fase 12.3): first 16,
                      then "N more technologies", like the features list. */}
                  <ChipList items={stack} max={16} />
                </dd>
              </div>
            )}
            {(demo || repo) && (
              <div className="flex flex-col gap-1">
                <dt className="font-meta text-label text-muted uppercase">
                  Links
                </dt>
                {demo && (
                  <dd>
                    <a
                      href={demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClasses({ variant: "link" })}
                    >
                      Live site
                      <ExternalMark />
                    </a>
                  </dd>
                )}
                {repo && (
                  <dd>
                    <a
                      href={repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClasses({ variant: "link" })}
                    >
                      Source code
                      <ExternalMark />
                    </a>
                  </dd>
                )}
              </div>
            )}
            {year && (
              <div className="flex flex-col gap-2">
                <dt className="font-meta text-label text-muted uppercase">
                  Year
                </dt>
                <dd className="font-meta text-meta text-ink tabular-nums">
                  {year}
                </dd>
              </div>
            )}
          </dl>
        </aside>

        <div className="flex min-w-0 flex-col gap-16 lg:order-1 lg:col-span-8">
          {chapters.map((chapter, index) => (
            <section
              key={chapter.title}
              aria-labelledby={`chapter-${chapter.title}`}
              data-reveal
              className="flex flex-col gap-4"
            >
              <Eyebrow className="text-accent">
                {String(index + 1).padStart(2, "0")}
              </Eyebrow>
              <h2
                id={`chapter-${chapter.title}`}
                className="font-heading text-headline text-ink"
              >
                {chapter.title}
              </h2>
              <p className="max-w-reading text-copy-lg text-body text-pretty whitespace-pre-line [overflow-wrap:anywhere]">
                {chapter.body}
              </p>
            </section>
          ))}
          {features.length > 0 && (
            <section
              aria-labelledby="key-features"
              data-reveal
              className="flex flex-col gap-6"
            >
              <h2
                id="key-features"
                className="font-heading text-headline text-ink"
              >
                Key features
              </h2>
              <FeatureList features={features} />
            </section>
          )}
        </div>
      </Container>

      {(previous || next) && (
        <Container size="wide">
          <nav
            aria-label="More projects"
            className="grid gap-4 border-t border-hairline pt-8 sm:grid-cols-2"
          >
            {previous ? (
              <Link
                href={`/projects/${getProjectSlug(previous)}`}
                rel="prev"
                className="group flex min-h-(--hit-area-min) flex-col gap-1 rounded-(--card-radius) p-3 -m-3 transition-colors duration-(--duration-fast) ease-standard hover:bg-surface"
              >
                <span className="flex items-center gap-1.5 font-meta text-meta text-muted [&_svg]:size-(--icon-sm)">
                  <ArrowLeft aria-hidden="true" />
                  Previous project
                </span>
                <span className="font-heading text-title text-ink [overflow-wrap:anywhere]">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/projects/${getProjectSlug(next)}`}
                rel="next"
                className="group flex min-h-(--hit-area-min) flex-col items-end gap-1 rounded-(--card-radius) p-3 -m-3 text-right transition-colors duration-(--duration-fast) ease-standard hover:bg-surface"
              >
                <span className="flex items-center gap-1.5 font-meta text-meta text-muted [&_svg]:size-(--icon-sm)">
                  Next project
                  <ArrowRight aria-hidden="true" />
                </span>
                <span className="font-heading text-title text-ink [overflow-wrap:anywhere]">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        </Container>
      )}

      <NextSteps
        title="Interested in something similar?"
        primary={{ href: "/contact", label: "Get in touch" }}
        secondary={{ href: "/projects", label: "All projects" }}
      />
    </article>
  );
}
