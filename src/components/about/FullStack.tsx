"use client";
import { Code } from "lucide-react";
import {
  ServerCollection,
  type CollectionState,
} from "@/components/site/ServerCollection";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import {
  displaySkillName,
  groupSkills,
  splitSubgroups,
} from "@/lib/display/skills";
import type { Loaded } from "@/lib/server/content";
import { resolveSkillIconKey } from "@/lib/skill-icon-resolver";
import { skillIcons } from "@/lib/skill-icons";
import type { Skill } from "@/types/content";

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

function SkillList({ skills }: { skills: Skill[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <li
          key={skill.id}
          className="inline-flex min-h-(--hit-area-min) items-center gap-2 rounded-(--chip-radius) border border-(color:--chip-border) bg-(--chip-bg) px-3.5 text-small text-ink"
        >
          <SkillIcon name={skill.name} />
          {displaySkillName(skill.name)}
        </li>
      ))}
    </ul>
  );
}

function FullStackView({ state }: { state: CollectionState<Skill> }) {
  const groups = groupSkills(state.data);
  return (
    <Section
      id="stack"
      eyebrow="Stack"
      title="The full toolkit."
      description="Every technology I use, grouped by category. Database and DevOps tools are listed separately."
      size="wide"
      className="border-t border-hairline"
    >
      {state.loading ? (
        <div
          className="flex flex-col gap-6"
          aria-busy="true"
          aria-label="Loading stack"
        >
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
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
        <div className="flex flex-col">
          {groups.map((group) => {
            const { main, subgroups } = splitSubgroups(group.skills);
            return (
              <div
                key={group.category}
                className="grid gap-4 border-t border-hairline py-8 first:border-t-0 first:pt-0 md:grid-cols-12 md:gap-8"
              >
                <h3 className="flex items-baseline gap-3 font-heading text-title text-ink md:col-span-3">
                  {group.label}
                  <span className="font-meta text-meta text-muted tabular-nums">
                    {group.skills.length}
                  </span>
                </h3>
                <div className="flex flex-col gap-5 md:col-span-9">
                  {main.length > 0 && <SkillList skills={main} />}
                  {subgroups.map((sub) => (
                    <div key={sub.label} className="flex flex-col gap-2.5">
                      <h4 className="font-meta text-label text-muted uppercase">
                        {sub.label}
                      </h4>
                      <SkillList skills={sub.skills} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

export function FullStack({ initial }: { initial: Loaded<Skill> }) {
  return (
    <ServerCollection initial={initial} path="/api/skills">
      {(state) => <FullStackView state={state} />}
    </ServerCollection>
  );
}
