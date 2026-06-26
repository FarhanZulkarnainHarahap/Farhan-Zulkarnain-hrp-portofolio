"use client";

import { useState, useEffect, useMemo } from "react";
import type { IconType } from "react-icons";
import * as Lu from "react-icons/lu";
import * as Fa from "react-icons/fa6";
import * as Si from "react-icons/si";
import * as Di from "react-icons/di";
interface SkillData {
  id: string;
  name: string;
  iconName: string;
  category: "FRONTEND" | "BACKEND" | "TOOLS" | "OTHERS";
}

const SkillSkeleton = () => (
  <div className="w-full space-y-7">
    {Array.from({ length: 3 }, (_, sectionIndex) => (
      <div key={sectionIndex} className="space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md border border-blue-500/10 bg-blue-500/10" />
          <div className="h-3 w-28 rounded-full bg-white/10" />
          <div className="h-px flex-1 bg-linear-to-r from-zinc-800 to-transparent" />
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-6 pl-2">
          {Array.from({ length: 8 }, (_, itemIndex) => (
            <div key={itemIndex} className="flex min-w-15 flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-2xl border border-white/5 bg-white/8 shadow-[0_0_24px_rgba(59,130,246,0.06)]" />
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
  return <Icon size={26} />;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export default function SkillSection() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Data
    fetch(`${API_URL}/api/skills`)
      .then(res => res.json())
      .then(data => {
        setSkills(Array.isArray(data) ? data : data.data || []);
        setLoading(false);
      });
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
    <div className="relative w-full max-w-6xl flex flex-col gap-6 overflow-visible md:gap-8 lg:gap-4">
      
      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 w-full flex flex-col gap-6 lg:gap-4">
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
                  <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-1.5 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)] lg:p-1">
                    <Lu.LuCode size={14} />
                  </div>
                  <h4 className="text-[9px] font-bold uppercase italic tracking-[0.5em] text-zinc-200 lg:text-[8px]">
                    {catKey}
                  </h4>
                  <div className="h-px flex-1 bg-linear-to-r from-zinc-800 to-transparent" />
                </div>

                {/* Grid Skill Ikon */}
                <div className="flex flex-wrap gap-x-10 gap-y-6 pl-2 lg:gap-x-8 lg:gap-y-4">
                  {skillsInCat.map((skill: SkillData) => (
                    <div
                      key={skill.id}
                      className="group relative flex min-w-15 flex-col items-center justify-center lg:min-w-12"
                    >
                      {/* Aura Glow saat Hover */}
                      <div className="absolute inset-0 bg-blue-500/20 blur-[25px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      {/* Icon */}
                      <div className="relative z-10 scale-100 text-zinc-500 transition-all duration-500 group-hover:text-blue-400 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.7)] lg:scale-90">
                        <DynamicIcon name={skill.iconName || skill.name} />
                      </div>
                      
                      {/* Name Label */}
                      <span className="relative z-10 mt-2 text-center text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 transition-colors group-hover:text-white lg:mt-1.5 lg:text-[7px]">
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
