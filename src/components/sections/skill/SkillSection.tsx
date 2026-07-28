"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { IconType } from "react-icons";
import * as Di from "react-icons/di";
import * as Fa from "react-icons/fa6";
import * as Lu from "react-icons/lu";
import * as Si from "react-icons/si";
import { fetchCachedJson } from "@/lib/client-cache";
import { resolveSkillIconKey } from "@/lib/skill-icon-resolver";

interface SkillData {
  id: string;
  name: string;
  iconName: string;
  category: string;
}

const CATEGORY_ORDER = ["All", "Frontend", "Backend", "Database", "Tools", "Deployment"];

const categoryConfig: Record<string, { color: string; x: number; y: number }> = {
  Frontend: { color: "#38bdf8", x: 22, y: 30 },
  Backend: { color: "#60a5fa", x: 74, y: 32 },
  Database: { color: "#34d399", x: 64, y: 72 },
  Tools: { color: "#c084fc", x: 34, y: 72 },
  Deployment: { color: "#fbbf24", x: 50, y: 50 },
};

const getDisplayCategory = (skill: SkillData) => {
  const rawCategory = skill.category?.toUpperCase() || "TOOLS";
  const identity = `${skill.name} ${skill.iconName}`.toLowerCase();

  if (rawCategory === "FRONTEND" || /(react|next|tailwind|html|css|redux)/.test(identity)) {
    return "Frontend";
  }

  if (rawCategory === "BACKEND" || /(node|express|api|jwt|nest)/.test(identity)) {
    return "Backend";
  }

  if (rawCategory === "DATABASE" || /(postgres|mysql|mongo|redis|supabase|prisma|sql|firebase)/.test(identity)) {
    return "Database";
  }

  if (/(vercel|netlify|docker|cloud|aws|railway|render)/.test(identity)) {
    return "Deployment";
  }

  return "Tools";
};

const getSkillDescription = (skill: SkillData) => {
  const category = getDisplayCategory(skill);
  const descriptions: Record<string, string> = {
    Frontend: "Interface, state, interaction, and responsive UI craft.",
    Backend: "API design, authentication, server logic, and integrations.",
    Database: "Data modeling, persistence, querying, and application state.",
    Tools: "Workflow, design, version control, and product delivery tools.",
    Deployment: "Hosting, release flow, and production delivery.",
  };

  return descriptions[category];
};

const DynamicIcon = ({ name }: { name: string }) => {
  const allIcons: Record<string, IconType> = { ...Lu, ...Fa, ...Si, ...Di };
  const foundKey = resolveSkillIconKey(name, allIcons);
  const Icon = foundKey ? allIcons[foundKey] : Lu.LuShieldAlert;
  return <Icon className="h-5 w-5 sm:h-6 sm:w-6" />;
};

const SkillSkeleton = () => (
  <div className="grid animate-pulse gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 12 }, (_, index) => (
      <div key={index} className="h-24 rounded-2xl border border-white/8 bg-white/[0.035]" />
    ))}
  </div>
);

export default function SkillSection() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    let active = true;

    const fetchSkills = async () => {
      try {
        const data = await fetchCachedJson<SkillData[] | { data?: SkillData[] }>(
          "/api/skills",
          "portfolio-skills",
        );
        if (active) setSkills(Array.isArray(data) ? data : data.data || []);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSkills();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const available = new Set<string>(skills.map(getDisplayCategory));
    return CATEGORY_ORDER.filter((category) => category === "All" || available.has(category));
  }, [skills]);

  const visibleSkills = useMemo(() => {
    if (activeCategory === "All") return skills;
    return skills.filter((skill) => getDisplayCategory(skill) === activeCategory);
  }, [activeCategory, skills]);

  const positionedSkills = useMemo(() => {
    const groupedCounts = new Map<string, number>();

    return visibleSkills.map((skill, index) => {
      const category = getDisplayCategory(skill);
      const config = categoryConfig[category] ?? categoryConfig.Tools;
      const groupIndex = groupedCounts.get(category) ?? 0;
      groupedCounts.set(category, groupIndex + 1);
      const ring = 11 + (groupIndex % 3) * 8;
      const angle = groupIndex * 1.42 + index * 0.18;

      return {
        skill,
        category,
        color: config.color,
        x: Math.min(88, Math.max(10, config.x + Math.cos(angle) * ring)),
        y: Math.min(88, Math.max(12, config.y + Math.sin(angle) * ring)),
        size: 54 + (skill.name.length % 3) * 9,
      };
    });
  }, [visibleSkills]);

  if (loading) {
    return <SkillSkeleton />;
  }

  return (
    <div className="relative w-full">
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Skill categories">
        {categories.map((category) => {
          const selected = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveCategory(category)}
              className={`relative min-h-11 rounded-full border px-4 text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${
                selected
                  ? "border-blue-300/70 bg-blue-500/18 text-white"
                  : "border-white/10 bg-white/4 text-slate-400 hover:border-blue-300/45 hover:text-white"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="skill-filter"
                  className="absolute inset-0 -z-10 rounded-full bg-blue-500/12"
                />
              )}
              {category}
            </button>
          );
        })}
      </div>

      <div className="hidden min-h-[31rem] overflow-hidden rounded-[28px] border border-white/8 bg-[#050911]/58 p-4 lg:block">
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          {positionedSkills.map((node, index) => {
            const next = positionedSkills[index + 1];
            if (!next || next.category !== node.category) return null;

            return (
              <motion.line
                key={`${node.skill.id}-${next.skill.id}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${next.x}%`}
                y2={`${next.y}%`}
                stroke={node.color}
                strokeWidth="1"
                strokeOpacity="0.24"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.02 }}
              />
            );
          })}
        </svg>

        <AnimatePresence mode="popLayout">
          {positionedSkills.map(({ skill, category, color, x, y, size }) => (
            <motion.div
              layout
              key={skill.id}
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.82 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="group absolute flex flex-col items-center"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                translateX: "-50%",
                translateY: "-50%",
              }}
            >
              <button
                type="button"
                className="relative grid place-items-center rounded-full border bg-[#07101d] text-slate-300 shadow-[0_14px_36px_rgba(0,0,0,0.3)] transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                style={{
                  width: size,
                  height: size,
                  borderColor: `${color}70`,
                  boxShadow: `0 14px 36px rgba(0,0,0,0.3), 0 0 24px ${color}20`,
                }}
                aria-label={`${skill.name}, ${category}. ${getSkillDescription(skill)}`}
              >
                <DynamicIcon name={skill.iconName || skill.name} />
              </button>
              <div className="pointer-events-none absolute top-[calc(100%+0.55rem)] z-20 w-56 rounded-xl border border-white/10 bg-[#050911]/95 p-3 text-center opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <p className="text-xs font-black text-white">{skill.name}</p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color }}>
                  {category}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  {getSkillDescription(skill)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:hidden">
        <AnimatePresence mode="popLayout">
          {visibleSkills.map((skill) => {
            const category = getDisplayCategory(skill);
            const color = categoryConfig[category]?.color ?? "#60a5fa";

            return (
              <motion.article
                layout
                key={skill.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex min-h-24 items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4"
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border"
                  style={{ borderColor: `${color}70`, color }}
                >
                  <DynamicIcon name={skill.iconName || skill.name} />
                </span>
                <span>
                  <span className="block text-sm font-black text-white">{skill.name}</span>
                  <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    {category}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {getSkillDescription(skill)}
                  </span>
                </span>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
