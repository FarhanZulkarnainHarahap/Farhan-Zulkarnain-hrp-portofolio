import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CardSpotlight } from "@/components/accents/CardSpotlight";
import { Badge, ChipList } from "@/components/ui/badge";
import { displayTags, splitCaseType } from "@/lib/display/projects";
import { getProjectSlug } from "@/lib/portfolio/projects";
import { cn } from "@/lib/utils";
import type { Project } from "@/services/api";
import { ProjectImage } from "./ProjectImage";

/**
 * Project summary card. The title link is stretched over the whole card (one link, one
 * accessible name); the "+N" tag toggle sits above it so it stays operable.
 * `features` never appear here (DESIGN.md → Components → Project card).
 */
export function ProjectCard({
  project,
  headingLevel: Heading = "h3",
  priority = false,
  className,
}: {
  project: Project;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
  className?: string;
}) {
  const href = `/projects/${getProjectSlug(project)}`;
  const caseTypes = splitCaseType(project.caseType);
  const tags = displayTags(project.tags);
  return (
    <article
      className={cn(
        "group relative flex min-w-0 flex-col gap-5 rounded-(--card-radius) border border-(color:--card-border) bg-(--card-bg) p-3 pb-(--card-padding)",
        "transition-colors duration-(--duration-fast) ease-standard hover:bg-(--card-bg-hover)",
        "has-[a[data-card-link]:focus-visible]:outline-2 has-[a[data-card-link]:focus-visible]:outline-offset-(--focus-ring-offset) has-[a[data-card-link]:focus-visible]:outline-focus",
        className,
      )}
    >
      <CardSpotlight />
      <ProjectImage
        src={project.imageUrl}
        alt=""
        priority={priority}
        sizes="(min-width: 1280px) 400px, (min-width: 768px) 45vw, 92vw"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3 px-2">
        {caseTypes.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Project type">
            {caseTypes.map((type) => (
              <li key={type}>
                <Badge>{type}</Badge>
              </li>
            ))}
          </ul>
        )}
        <Heading className="font-heading text-title text-ink text-balance [overflow-wrap:anywhere]">
          <Link
            href={href}
            data-card-link
            className="line-clamp-2 outline-none after:absolute after:inset-0 after:rounded-(--card-radius) after:content-['']"
          >
            {project.title}
          </Link>
        </Heading>
        {project.description && (
          <p className="line-clamp-3 text-small text-body text-pretty [overflow-wrap:anywhere]">
            {project.description}
          </p>
        )}
        {tags.length > 0 && (
          <ChipList
            items={tags}
            max={4}
            className="relative z-(--z-raised) mt-1"
          />
        )}
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-1.5 pt-2 text-small font-medium text-ink [&_svg]:size-(--icon-sm) [&_svg]:transition-transform [&_svg]:duration-(--duration-fast) group-hover:[&_svg]:translate-x-0.5"
        >
          View case study
          <ArrowRight />
        </span>
      </div>
    </article>
  );
}
