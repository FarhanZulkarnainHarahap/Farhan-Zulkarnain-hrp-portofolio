"use client";

import type { IconType } from "react-icons";
import * as Di from "react-icons/di";
import * as Fa from "react-icons/fa6";
import * as Lu from "react-icons/lu";
import * as Si from "react-icons/si";
import { resolveSkillIconKey } from "@/lib/skill-icon-resolver";

type Skill = {
  id: string;
  name: string;
  iconName: string;
  category: string;
};

type SkillGroup = {
  category: string;
  items: Skill[];
};

const allIcons: Record<string, IconType> = { ...Lu, ...Fa, ...Si, ...Di };

function DynamicIcon({ name }: { name: string }) {
  const key = resolveSkillIconKey(name, allIcons);
  const Icon = key ? allIcons[key] : Lu.LuCode;

  return <Icon className="h-6 w-6" aria-hidden="true" />;
}

export default function SkillIconGrid({ groups }: { groups: SkillGroup[] }) {
  if (!groups.length) {
    return (
      <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-6 text-slate-300">
        Skill showcase is being prepared.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {groups.map(({ category, items }) => (
        <article
          key={category}
          data-cinematic
          className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5"
        >
          <h3 className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100">
            {category}
          </h3>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {items.map((skill) => (
              <div
                key={skill.id}
                className="group flex min-h-24 flex-col items-center justify-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-4 text-center transition hover:border-cyan-200/35 hover:bg-cyan-200/10"
              >
                <span className="text-slate-400 transition group-hover:text-cyan-100">
                  <DynamicIcon name={skill.iconName || skill.name} />
                </span>
                <span className="max-w-full truncate text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
