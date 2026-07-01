"use client";

import { useState, useEffect, useMemo } from "react";
import type { IconType } from "react-icons";
import * as Lu from "react-icons/lu";
import * as Fa from "react-icons/fa6";
import * as Si from "react-icons/si";
import * as Di from "react-icons/di";
import { fetchCachedJson } from "@/lib/client-cache";
interface SkillData {
  id: string;
  name: string;
  iconName: string;
  category: string;
}

const SKILL_SKELETON_COUNTS = [4, 5, 4, 5, 3];

const getDisplayCategory = (skill: SkillData) => {
  const rawCategory = skill.category?.toUpperCase() || "TOOLS";
  const identity = `${skill.name} ${skill.iconName}`.toLowerCase();

  if (
    rawCategory === "DATABASE" ||
    /(postgres|mysql|mongo|redis|supabase|prisma|firebase|database|sql)/.test(identity)
  ) {
    return "DATABASE";
  }

  if (
    rawCategory === "UIUX" ||
    rawCategory === "UI/UX" ||
    /(figma|adobe|canva|design|ui|ux|photoshop)/.test(identity)
  ) {
    return "UI/UX";
  }

  if (["FRONTEND", "BACKEND", "TOOLS"].includes(rawCategory)) {
    return rawCategory;
  }

  return "TOOLS";
};

const SkillSkeleton = () => (
  <div className="contents" aria-label="Loading skills" aria-busy="true">
    {SKILL_SKELETON_COUNTS.map((itemCount, sectionIndex) => (
      <div key={sectionIndex} className="w-full animate-pulse">
        <div className="mb-4 flex items-center gap-3 lg:mb-3">
          <div className="h-8 w-8 rounded-lg border border-blue-500/15 bg-blue-500/10 lg:h-6 lg:w-6" />
          <div className="h-2.5 w-22 rounded-full bg-white/10 lg:h-2 lg:w-18" />
          <div className="h-px flex-1 bg-linear-to-r from-zinc-800 to-transparent" />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:flex lg:flex-wrap lg:gap-x-7 lg:gap-y-3 lg:pl-2">
          {Array.from({ length: itemCount }, (_, itemIndex) => (
            <div
              key={itemIndex}
              className="flex min-w-0 flex-col items-center justify-center rounded-2xl border border-white/7 bg-white/[0.035] px-2 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.16)] lg:min-w-20 lg:px-3 lg:py-4"
            >
              <div className="h-8 w-8 rounded-xl border border-white/6 bg-white/8 shadow-[0_0_24px_rgba(59,130,246,0.06)] lg:h-[26px] lg:w-[26px]" />
              <div className="mt-3 h-2 w-12 rounded-full bg-white/8 lg:mt-1.5 lg:h-1.5 lg:w-10" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// --- HELPER: RENDER ICON ---
const DynamicIcon = ({ name }: { name: string }) => {
  const allIcons: Record<string, IconType> = { ...Lu, ...Fa, ...Si, ...Di };
  const normalized = name.toLowerCase().replace(/\.js/g, 'dotjs').replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  const foundKey = Object.keys(allIcons).find((key) => 
    key.toLowerCase() === name.toLowerCase() || key.toLowerCase() === `si${normalized}`
  );
  const Icon = foundKey ? allIcons[foundKey] : Lu.LuShieldAlert;
  return <Icon className="h-7 w-7 sm:h-8 sm:w-8 lg:h-[26px] lg:w-[26px]" />;
};

export default function SkillSection() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await fetchCachedJson<SkillData[] | { data?: SkillData[] }>(
          "/api/skills",
          "portfolio-skills",
        );
        setSkills(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // --- LOGIKA GROUPING ---
  const groupedSkills = useMemo(() => {
    return skills.reduce<Record<string, SkillData[]>>((acc, skill) => {
      const cat = getDisplayCategory(skill);
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [skills]);

  const categoryOrder = ["FRONTEND", "BACKEND", "DATABASE", "TOOLS", "UI/UX"];

  return (
    <div className="relative flex w-full max-w-5xl flex-col gap-8 overflow-visible md:gap-8 lg:gap-3">
      
      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 flex w-full flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-5">
        {loading ? (
          <SkillSkeleton />
        ) : (
          categoryOrder.map((catKey) => {
            const skillsInCat = groupedSkills[catKey];
            if (!skillsInCat || skillsInCat.length === 0) return null;

            return (
              <div
                key={catKey}
                className="w-full"
              >
                {/* Category Header */}
                <div className="mb-4 flex items-center gap-3 lg:mb-3">
                  <div className="rounded-lg border border-blue-500/25 bg-blue-500/12 p-2 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)] lg:p-1">
                    <Lu.LuCode className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
                  </div>
                  <h4 className="text-[11px] font-bold uppercase italic tracking-[0.32em] text-zinc-100 sm:tracking-[0.45em] lg:text-[8px] lg:tracking-[0.5em]">
                    {catKey}
                  </h4>
                  <div className="h-px flex-1 bg-linear-to-r from-zinc-800 to-transparent" />
                </div>

                {/* Grid Skill Ikon */}
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:flex lg:flex-wrap lg:gap-x-7 lg:gap-y-3 lg:pl-2">
                  {skillsInCat.map((skill: SkillData) => (
                    <div
                      key={skill.id}
                      className="premium-static-tilt group relative flex min-w-0 flex-col items-center justify-center rounded-2xl border border-white/7 bg-white/[0.035] px-2 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.16)] hover:border-blue-400/45 hover:bg-blue-500/8 hover:shadow-[0_18px_45px_rgba(37,99,235,0.2)] lg:min-w-20 lg:px-3 lg:py-4"
                    >
                      {/* Aura Glow saat Hover */}
                      <div className="absolute inset-0 bg-blue-500/20 blur-[25px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      {/* Icon */}
                      <div className="relative z-10 scale-100 text-zinc-500 transition-all duration-500 group-hover:text-blue-400 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.7)] lg:scale-90">
                        <DynamicIcon name={skill.iconName || skill.name} />
                      </div>
                      
                      {/* Name Label */}
                      <span className="relative z-10 mt-3 max-w-full truncate text-center text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500 transition-colors group-hover:text-white lg:mt-1.5 lg:text-[7px] lg:tracking-[0.2em]">
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
