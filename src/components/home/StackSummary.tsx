"use client";
import Link from "next/link";
import { ArrowRight, Code } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { displaySkillName, groupSkills } from "@/lib/display/skills";
import { resolveSkillIconKey } from "@/lib/skill-icon-resolver";
import { skillIcons } from "@/lib/skill-icons";
import type { Skill } from "@/types/content";
import type { Loaded } from "@/lib/server/content";
import {
  ServerCollection,
  type CollectionState,
} from "@/components/site/ServerCollection";

function SkillIcon({ name }: { name: string }) {
  const Icon = skillIcons[resolveSkillIconKey(name, skillIcons)];
  return Icon ? (
    <Icon aria-hidden="true" className="size-(--icon-sm) shrink-0 text-muted" />
  ) : (
    <Code
      aria-hidden="true"
      className="size-(--icon-sm) shrink-0 text-muted"
      strokeWidth={1.5}
    />
  );
}

function StackSummaryView({ state }: { state: CollectionState<Skill> }) {
  const groups = groupSkills(state.data);
  return (
    <Section
      size="wide"
      id="stack"
      eyebrow="Stack"
      title="Tools I work with every day."
      description="Grouped by where they sit in a product: frontend, backend, tooling, and the rest."
      action={
        <Link
          href="/about#stack"
          className={buttonClasses({ variant: "link" })}
        >
          Full stack on About
          <ArrowRight aria-hidden="true" />
        </Link>
      }
      className="border-t border-hairline"
    >
      {state.loading ? (
        <div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          aria-busy="true"
          aria-label="Loading stack"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      ) : state.error ? (
        <ErrorState
          title="The stack couldn't be loaded."
          description={state.error}
          onRetry={state.retry}
        />
      ) : groups.length === 0 ? (
        <EmptyState title="The stack will be listed here soon." />
      ) : (
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div key={group.category} className="flex flex-col gap-4">
              <h3 className="flex items-baseline justify-between border-b border-hairline pb-2 font-meta text-label text-muted uppercase">
                {group.label}
                <span className="tabular-nums">{group.skills.length}</span>
              </h3>
              <ul className="flex flex-col gap-2.5">
                {group.skills.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex items-center gap-2.5 text-small text-ink"
                  >
                    <SkillIcon name={skill.name} />
                    {displaySkillName(skill.name)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

export function StackSummary({ initial }: { initial: Loaded<Skill> }) {
  return (
    <ServerCollection initial={initial} path="/api/skills">
      {(state) => <StackSummaryView state={state} />}
    </ServerCollection>
  );
}
