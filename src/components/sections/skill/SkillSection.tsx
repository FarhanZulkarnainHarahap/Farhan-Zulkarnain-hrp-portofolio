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
import { useReducedMotion } from "@/hooks/useReducedMotion";

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

const categoryConfig: Record<string, { color: string; x: number; y: number }> = {
  Frontend: { color: "#38bdf8", x: 22, y: 30 },
  Backend: { color: "#60a5fa", x: 74, y: 32 },
  Database: { color: "#34d399", x: 64, y: 72 },
  DevOps: { color: "#fbbf24", x: 50, y: 50 },
  Tools: { color: "#c084fc", x: 34, y: 72 },
  Integration: { color: "#2dd4bf", x: 76, y: 68 },
  Learning: { color: "#fb7185", x: 18, y: 70 },
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
  const reducedMotion = useReducedMotion();
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);

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

  const constellationSkills = useMemo(() => visibleSkills.slice(0, 12), [visibleSkills]);
  const activeSkill = useMemo(
    () => skills.find((skill) => skill.id === activeSkillId) ?? visibleSkills[0] ?? null,
    [activeSkillId, skills, visibleSkills],
  );

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

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-80 overflow-hidden rounded-[28px] border border-white/8 bg-[#050911]/58 p-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.18),transparent_48%)]" />
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            {constellationSkills.slice(0, -1).map((skill, index) => {
              const nextSkill = constellationSkills[index + 1];
              const from = categoryConfig[getDisplayCategory(skill)] ?? categoryConfig.Tools;
              const to = categoryConfig[getDisplayCategory(nextSkill)] ?? categoryConfig.Tools;
              const active = activeSkill?.id === skill.id || activeSkill?.id === nextSkill.id;

              return (
                <line
                  key={`${skill.id}-${nextSkill.id}`}
                  x1={`${from.x + (index % 3) * 3}%`}
                  y1={`${from.y + (index % 2) * 4}%`}
                  x2={`${to.x - (index % 2) * 3}%`}
                  y2={`${to.y - (index % 3) * 3}%`}
                  stroke={active ? "#93c5fd" : "rgba(148,163,184,0.16)"}
                  strokeWidth={active ? 1.5 : 1}
                />
              );
            })}
          </svg>

          {constellationSkills.map((skill, index) => {
            const category = getDisplayCategory(skill);
            const config = categoryConfig[category] ?? categoryConfig.Tools;
            const selected = activeSkill?.id === skill.id;

            return (
              <motion.button
                key={skill.id}
                type="button"
                onClick={() => setActiveSkillId(skill.id)}
                className={`absolute z-10 flex max-w-40 items-center gap-2 rounded-full border px-3 py-2 text-left text-[10px] font-black text-white shadow-[0_14px_35px_rgba(0,0,0,0.22)] ${
                  selected ? "border-blue-200 bg-blue-500/28" : "border-white/10 bg-[#07101d]/86"
                }`}
                style={{
                  left: `${Math.min(82, Math.max(8, config.x + ((index % 4) - 1.5) * 7))}%`,
                  top: `${Math.min(80, Math.max(10, config.y + ((index % 3) - 1) * 9))}%`,
                  color: config.color,
                }}
                animate={
                  reducedMotion
                    ? undefined
                    : {
                        y: [0, index % 2 === 0 ? -5 : 5, 0],
                        scale: selected ? 1.06 : 1,
                      }
                }
                whileHover={reducedMotion ? undefined : { scale: 1.05, x: 2 }}
                transition={{
                  duration: 4 + (index % 4) * 0.45,
                  repeat: reducedMotion ? 0 : Infinity,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <DynamicIcon name={skill.iconName || skill.name} />
                <span className="truncate text-white">{skill.name}</span>
              </motion.button>
            );
          })}
        </div>

        <aside className="rounded-[28px] border border-blue-300/14 bg-[#07101d]/76 p-5">
          {activeSkill ? (
            <>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-blue-300">
                Skill Detail
              </p>
              <div className="mt-5 flex items-start gap-4">
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border bg-black/20"
                  style={{
                    borderColor: `${categoryConfig[getDisplayCategory(activeSkill)]?.color ?? "#60a5fa"}70`,
                    color: categoryConfig[getDisplayCategory(activeSkill)]?.color ?? "#60a5fa",
                  }}
                >
                  <DynamicIcon name={activeSkill.iconName || activeSkill.name} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-2xl font-black text-white">{activeSkill.name}</h3>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {getDisplayCategory(activeSkill)} / Project Experience
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-400">
                {getSkillDescription(activeSkill)} Used as part of real portfolio work,
                with emphasis on maintainable implementation and readable product flows.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Core usage", "Connected stack", "Recruiter readable"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">Select a skill to see details.</p>
          )}
        </aside>
      </div>

      <div className="hidden rounded-[28px] border border-white/8 bg-[#050911]/58 p-4 lg:block">
        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => {
            const color = categoryConfig[category]?.color ?? "#60a5fa";

            return (
              <motion.section
                layout
                key={category}
                className="relative min-h-72 overflow-hidden rounded-3xl border border-white/8 bg-white/[0.035] p-4"
                initial={{ opacity: 0, clipPath: "inset(0 0 18% 0)" }}
                whileInView={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
                viewport={{ once: true }}
              >
                <div className="mb-4 flex items-center gap-3">
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

                <div className="grid grid-cols-2 gap-3">
                  {categorySkills.map((skill, index) => (
                    <motion.button
                      layout
                      key={skill.id}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.025 }}
                      onClick={() => setActiveSkillId(skill.id)}
                      className="group relative min-h-24 overflow-hidden rounded-2xl border border-white/8 bg-[#07101d]/72 p-3 text-left"
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
                    </motion.button>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      </div>

      <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:hidden">
        <AnimatePresence mode="popLayout">
          {visibleSkills.map((skill) => {
            const category = getDisplayCategory(skill);
            const color = categoryConfig[category]?.color ?? "#60a5fa";

            return (
              <motion.button
                layout
                key={skill.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                onClick={() => setActiveSkillId(skill.id)}
                className="flex min-h-24 items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-left"
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
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
