"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { selectFeatured } from "@/lib/display/projects";
import type { Project } from "@/services/api";
import type { Loaded } from "@/lib/server/content";
import {
  ServerCollection,
  type CollectionState,
} from "@/components/site/ServerCollection";

// grid-cols-1 = minmax(0, 1fr): a card never widens the column to its content (Fase 12.3).
const grid = "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3";

function SelectedWorkView({ state }: { state: CollectionState<Project> }) {
  const featured = selectFeatured(state.data);
  return (
    <Section
      id="selected-work"
      eyebrow="Selected work"
      title="Projects with the full story."
      description="Each one covers the problem, the approach, and the result."
      size="wide"
      action={
        <Link href="/projects" className={buttonClasses({ variant: "link" })}>
          View all projects
          <ArrowRight aria-hidden="true" />
        </Link>
      }
    >
      {state.loading ? (
        <div className={grid} aria-busy="true" aria-label="Loading projects">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-(--card-radius) border border-hairline p-3"
            >
              <Skeleton className="aspect-[16/10] w-full rounded-(--media-radius)" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      ) : state.error ? (
        <ErrorState
          title="Projects couldn't be loaded."
          description={state.error}
          onRetry={state.retry}
        />
      ) : featured.length === 0 ? (
        <EmptyState
          title="Projects will appear here soon."
          description="New work is being written up as case studies."
        />
      ) : (
        <ul data-reveal="group" className={grid}>
          {featured.map((project) => (
            <li key={project.id} className="flex min-w-0">
              <ProjectCard project={project} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

export function SelectedWork({ initial }: { initial: Loaded<Project> }) {
  return (
    <ServerCollection initial={initial} path="/api/portofolios">
      {(state) => <SelectedWorkView state={state} />}
    </ServerCollection>
  );
}
