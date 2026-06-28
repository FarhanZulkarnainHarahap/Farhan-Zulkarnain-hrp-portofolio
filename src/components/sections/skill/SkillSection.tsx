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
  category: "FRONTEND" | "BACKEND" | "TOOLS" | "OTHERS";
}

const SkillSkeleton = () => (
  <div className="w-full space-y-8 lg:col-span-2">
    {Array.from({ length: 3 }, (_, sectionIndex) => (
      <div key={sectionIndex} className="space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md border border-blue-500/10 bg-blue-500/10" />
          <div className="h-3 w-28 rounded-full bg-white/10" />
          <div className="h-px flex-1 bg-linear-to-r from-zinc-800 to-transparent" />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:flex lg:flex-wrap lg:gap-x-10 lg:gap-y-6 lg:pl-2">
          {Array.from({ length: 8 }, (_, itemIndex) => (
            <div key={itemIndex} className="flex min-w-0 flex-col items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.025] p-4 lg:min-w-15 lg:border-0 lg:bg-transparent lg:p-0">
              <div className="h-13 w-13 rounded-2xl border border-white/5 bg-white/8 shadow-[0_0_24px_rgba(59,130,246,0.06)] lg:h-12 lg:w-12" />
              <div className="h-2 w-14 rounded-full bg-white/8" />
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export default function SkillSection() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await fetchCachedJson<SkillData[] | { data?: SkillData[] }>(
          `${API_URL}/api/skills`,
          `portfolio-skills:${API_URL}`,
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
      const cat = skill.category || "OTHERS";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [skills]);

  const categoryOrder = ["FRONTEND", "BACKEND", "TOOLS", "OTHERS"];

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
                      className="group relative flex min-w-0 flex-col items-center justify-center rounded-2xl border border-white/6 bg-white/[0.025] px-2 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.16)] lg:min-w-12 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
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
