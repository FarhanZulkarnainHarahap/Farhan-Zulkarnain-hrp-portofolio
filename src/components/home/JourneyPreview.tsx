"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { displaySkillName } from "@/lib/display/skills";
import { formatRange, sortExperiences } from "@/lib/display/experiences";
import type { Experience } from "@/types/content";
import type { Loaded } from "@/lib/server/content";
import {
  ServerCollection,
  type CollectionState,
} from "@/components/site/ServerCollection";

/** Three most recent entries. Hidden entirely when there are none (decision §8.1). */
function JourneyPreviewView({ state }: { state: CollectionState<Experience> }) {
  if (!state.loading && !state.error && state.data.length === 0) return null;
  const entries = sortExperiences(state.data).slice(0, 3);
  return (
    <Section
      size="wide"
      id="journey"
      eyebrow="Journey"
      title="Where I've worked and learned."
      action={
        <Link href="/journey" className={buttonClasses({ variant: "link" })}>
          Full journey
          <ArrowRight aria-hidden="true" />
        </Link>
      }
      className="border-t border-hairline"
    >
      {state.loading ? (
        <div
          className="flex flex-col gap-6"
          aria-busy="true"
          aria-label="Loading experience"
        >
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : state.error ? (
        <ErrorState
          title="Experience couldn't be loaded."
          description={state.error}
          onRetry={state.retry}
        />
      ) : (
        <ol className="flex flex-col">
          {entries.map((item) => (
            <li
              key={item.id}
              className="grid gap-2 border-b border-hairline py-6 first:pt-0 md:grid-cols-12 md:gap-8"
            >
              <p className="font-meta text-meta text-muted tabular-nums md:col-span-3">
                {formatRange(item)}
              </p>
              <div className="flex min-w-0 flex-col gap-2 md:col-span-9">
                <h3 className="font-heading text-title text-ink [overflow-wrap:anywhere]">
                  {item.title}
                </h3>
                <p className="text-small text-body">
                  {[item.company, item.location].filter(Boolean).join(" · ")}
                </p>
                {item.technologies?.length > 0 && (
                  <p className="font-meta text-meta text-muted">
                    {item.technologies.map(displaySkillName).join(" · ")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

export function JourneyPreview({ initial }: { initial: Loaded<Experience> }) {
  return (
    <ServerCollection initial={initial} path="/api/experiences">
      {(state) => <JourneyPreviewView state={state} />}
    </ServerCollection>
  );
}
