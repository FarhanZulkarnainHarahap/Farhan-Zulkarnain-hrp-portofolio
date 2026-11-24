"use client";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import {
  ServerCollection,
  type CollectionState,
} from "@/components/site/ServerCollection";
import { Chip } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRange, sortExperiences } from "@/lib/display/experiences";
import { displayTags } from "@/lib/display/projects";
import type { Loaded } from "@/lib/server/content";
import type { Experience } from "@/types/content";

function TimelineView({ state }: { state: CollectionState<Experience> }) {
  const entries = sortExperiences(state.data);
  return (
    <section aria-label="Timeline" className="pb-section">
      <Container size="wide">
        {state.loading ? (
          <div
            className="flex flex-col gap-6"
            aria-busy="true"
            aria-label="Loading experience"
          >
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : state.error ? (
          <ErrorState
            title="Experience couldn't be loaded."
            description={state.error}
            onRetry={state.retry}
          />
        ) : entries.length === 0 ? (
          <EmptyState
            headingLevel="h2"
            icon={<Briefcase />}
            title="Experience entries are on their way."
            description="In the meantime, the projects show what I've been building."
            action={
              <Link
                href="/projects"
                className={buttonClasses({ variant: "secondary" })}
              >
                Browse projects
                <ArrowRight aria-hidden="true" />
              </Link>
            }
          />
        ) : (
          <ol
            data-reveal="group"
            className="flex flex-col border-t border-hairline"
          >
            {entries.map((item) => {
              const stack = displayTags(item.technologies);
              return (
                <li
                  key={item.id}
                  className="grid gap-3 border-b border-hairline py-8 md:grid-cols-12 md:gap-8"
                >
                  <div className="flex flex-col gap-1 md:col-span-3">
                    <p className="font-meta text-meta text-muted tabular-nums">
                      {formatRange(item)}
                    </p>
                    {item.current && (
                      <p className="flex items-center gap-2 font-meta text-meta text-ink">
                        <span
                          aria-hidden="true"
                          className="size-2 rounded-pill bg-success"
                        />
                        Current role
                      </p>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-3 md:col-span-9">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-heading text-headline text-ink [overflow-wrap:anywhere]">
                        {item.title}
                      </h2>
                      <p className="text-copy text-body">
                        {[item.company, item.location]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    {item.description && (
                      <p className="max-w-reading text-copy text-body text-pretty whitespace-pre-line [overflow-wrap:anywhere]">
                        {item.description}
                      </p>
                    )}
                    {stack.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="font-meta text-label text-muted uppercase">
                          Stack
                        </p>
                        <ul className="flex flex-wrap gap-2">
                          {stack.map((name) => (
                            <li key={name}>
                              <Chip>{name}</Chip>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Container>
    </section>
  );
}

export function Timeline({ initial }: { initial: Loaded<Experience> }) {
  return (
    <ServerCollection initial={initial} path="/api/experiences">
      {(state) => <TimelineView state={state} />}
    </ServerCollection>
  );
}
