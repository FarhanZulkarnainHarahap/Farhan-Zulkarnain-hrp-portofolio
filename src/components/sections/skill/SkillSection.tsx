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

const CATEGORY_ORDER = [
  "All",
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Tools",
  "Integration",
  "Learning",
];

const categoryConfig: Record<string, { color: string }> = {
  Frontend: { color: "#38bdf8" },
  Backend: { color: "#60a5fa" },
  Database: { color: "#34d399" },
  DevOps: { color: "#fbbf24" },
  Tools: { color: "#c084fc" },
  Integration: { color: "#2dd4bf" },
  Learning: { color: "#fb7185" },
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

  if (/(postgres|mysql|mongo|redis|supabase|prisma|sql|firebase)/.test(identity)) {
    return "Database";
  }

  if (/(vercel|netlify|docker|cloud|aws|railway|render|deployment)/.test(identity)) {
    return "DevOps";
  }

  if (/(cloudinary|midtrans|auth|oauth|payment|third-party|api integration)/.test(identity)) {
    return "Integration";
  }

  if (/(learning|gsap|three|nestjs)/.test(identity)) {
    return "Learning";
  }

  return "Tools";
};

const getSkillDescription = (skill: SkillData) => {
  const category = getDisplayCategory(skill);
  const descriptions: Record<string, string> = {
    Frontend: "Interface, state, interaction, and responsive UI craft.",
    Backend: "API design, authentication, server logic, and integrations.",
    Database: "Data modeling, persistence, querying, and application state.",
    DevOps: "Hosting, release flow, and production delivery.",
    Tools: "Workflow, design, version control, and product delivery tools.",
    Integration: "Third-party services, media handling, auth, and API connections.",
    Learning: "Technologies currently being explored through practice.",
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

  const groupedSkills = useMemo(() => {
    return visibleSkills.reduce<Record<string, SkillData[]>>((acc, skill) => {
      const category = getDisplayCategory(skill);
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});
  }, [visibleSkills]);

  if (loading) {
    return <SkillSkeleton />;
  }

  return (
    <div className="relative w-full">
      <div className="mb-12 flex flex-wrap gap-3 sm:gap-4" role="tablist" aria-label="Skill categories">
        {categories.map((category) => {
          const selected = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveCategory(category)}
              className={`relative min-h-12 rounded-full border px-5 text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${
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

      <div className="hidden rounded-[28px] border border-white/8 bg-[#050911]/70 p-6 lg:block">
        <div className="grid gap-7 xl:grid-cols-2 2xl:grid-cols-3">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => {
            const color = categoryConfig[category]?.color ?? "#60a5fa";

            return (
              <motion.section
                layout
                key={category}
                className="relative min-h-80 overflow-hidden rounded-3xl border border-white/8 bg-white/[0.045] p-6"
                initial={{ opacity: 0, clipPath: "inset(0 0 18% 0)" }}
                whileInView={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
                viewport={{ once: true }}
              >
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 18px ${color}` }}
                  />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.24em] text-white">
                    {category}
                  </h3>
                  <span className="h-px flex-1 bg-linear-to-r from-white/12 to-transparent" />
                  <span className="text-[10px] font-black text-slate-500">{categorySkills.length}</span>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {categorySkills.map((skill, index) => (
                    <motion.div
                      layout
                      key={skill.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.025 }}
                      className="group relative min-h-28 overflow-hidden rounded-2xl border border-white/8 bg-[#07101d]/78 p-4 text-left"
                    >
                      <span
                        className="absolute left-11 right-4 top-8 h-px opacity-35"
                        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
                      />
                      <div className="relative flex items-start gap-3">
                        <span
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-black/20 text-slate-200"
                          style={{ borderColor: `${color}70`, color }}
                        >
                          <DynamicIcon name={skill.iconName || skill.name} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black text-white">{skill.name}</span>
                          <span className="mt-1 block text-[10px] leading-5 text-slate-500">
                            {getSkillDescription(skill)}
                          </span>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      </div>

      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:hidden">
        <AnimatePresence mode="popLayout">
          {visibleSkills.map((skill) => {
            const category = getDisplayCategory(skill);
            const color = categoryConfig[category]?.color ?? "#60a5fa";

            return (
              <motion.div
                layout
                key={skill.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex min-h-28 items-center gap-5 rounded-2xl border border-white/8 bg-white/[0.045] p-5 text-left"
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
