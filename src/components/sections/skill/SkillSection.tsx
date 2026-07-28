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

const categoryConfig: Record<string, { color: string }> = {
  Frontend: { color: "#38bdf8" },
  Backend: { color: "#60a5fa" },
  Database: { color: "#34d399" },
  DevOps: { color: "#fbbf24" },
  Tools: { color: "#c084fc" },
  Integration: { color: "#2dd4bf" },
  Learning: { color: "#fb7185" },
};

const TREE_BRANCHES = [
  "Frontend",
  "Backend Integration",
  "Database",
  "Deployment",
  "Tools",
] as const;

type SkillTreeNode = {
  id: string;
  name: string;
  category: string;
  iconName?: string;
  children?: SkillTreeNode[];
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

const getTreeBranch = (skill: SkillData) => {
  const category = getDisplayCategory(skill);

  if (category === "Backend" || category === "Integration") return "Backend Integration";
  if (category === "DevOps") return "Deployment";
  if (category === "Learning") return "Tools";

  return category;
};

const getTreeBranchColor = (branch: string) => {
  if (branch === "Backend Integration") return categoryConfig.Backend.color;
  if (branch === "Deployment") return categoryConfig.DevOps.color;
  return categoryConfig[branch]?.color ?? categoryConfig.Tools.color;
};

const createSkillTree = (root: SkillData | null, skills: SkillData[]): SkillTreeNode | null => {
  if (!root) return null;

  const children = TREE_BRANCHES.map((branch) => {
    const branchSkills = skills
      .filter((skill) => getTreeBranch(skill) === branch && skill.id !== root.id)
      .slice(0, 4);
    const fallbackSkills = branchSkills.length > 0
      ? branchSkills
      : skills.filter((skill) => getTreeBranch(skill) === branch).slice(0, 1);

    return {
      id: `branch-${branch.toLowerCase().replace(/\s+/g, "-")}`,
      name: branch,
      category: branch,
      children: fallbackSkills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        category: getDisplayCategory(skill),
        iconName: skill.iconName || skill.name,
      })),
    };
  });

  return {
    id: root.id,
    name: root.name,
    category: getDisplayCategory(root),
    iconName: root.iconName || root.name,
    children,
  };
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

const SkillTree = ({
  tree,
  activeSkillId,
  onSelect,
  reducedMotion,
}: {
  tree: SkillTreeNode | null;
  activeSkillId: string | null;
  onSelect: (skillId: string) => void;
  reducedMotion: boolean;
}) => {
  if (!tree) {
    return (
      <div className="grid min-h-96 place-items-center rounded-[28px] border border-white/8 bg-[#050911]/70 p-6 text-sm text-slate-400">
        No skills available.
      </div>
    );
  }

  const branches = tree.children ?? [];
  const rootColor = categoryConfig[tree.category]?.color ?? categoryConfig.Tools.color;

  return (
    <div className="relative min-h-96 overflow-hidden rounded-[28px] border border-white/8 bg-[#050911]/72 p-5 sm:p-6 lg:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(34,211,238,0.1),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-blue-500/8 to-transparent" />
      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M50 20 V32"
          stroke="rgba(147,197,253,0.32)"
          strokeWidth="0.45"
          fill="none"
        />
        {branches.map((branch, index) => {
          const x = 10 + index * 20;
          const color = getTreeBranchColor(branch.name);

          return (
            <path
              key={branch.id}
              d={`M50 32 H${x} V45`}
              stroke={color}
              strokeOpacity="0.32"
              strokeWidth="0.42"
              fill="none"
            />
          );
        })}
      </svg>

      <div className="relative z-10">
        <div className="mx-auto w-full max-w-[22rem]">
          <button
            type="button"
            onClick={() => onSelect(tree.id)}
            className="flex w-full items-center gap-4 rounded-3xl border bg-[#07101d]/88 p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.28)]"
            style={{ borderColor: `${rootColor}80` }}
          >
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border bg-black/25"
              style={{ borderColor: `${rootColor}80`, color: rootColor }}
            >
              <DynamicIcon name={tree.iconName || tree.name} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
                Selected Skill
              </span>
              <span className="mt-1 block truncate text-lg font-black text-white">
                {tree.name}
              </span>
            </span>
          </button>
        </div>

        <div className="mt-10 grid min-w-0 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-5">
          {branches.map((branch) => {
            const color = getTreeBranchColor(branch.name);
            const nodes = branch.children ?? [];

            return (
              <section
                key={branch.id}
                className="relative min-w-0 rounded-3xl border border-white/8 bg-white/[0.045] p-4"
              >
                <span
                  className="absolute left-1/2 top-0 hidden h-5 w-px -translate-y-5 lg:block"
                  style={{ backgroundColor: color, opacity: 0.35 }}
                />
                <div className="flex min-h-12 items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 18px ${color}` }}
                  />
                  <h3 className="min-w-0 text-[10px] font-black uppercase leading-5 tracking-[0.16em] text-white">
                    {branch.name}
                  </h3>
                </div>

                <div className="mt-4 space-y-3 border-l border-white/10 pl-3">
                  {nodes.length > 0 ? (
                    nodes.map((node, index) => {
                      const selected = activeSkillId === node.id;

                      return (
                        <motion.button
                          key={node.id}
                          type="button"
                          onClick={() => onSelect(node.id)}
                          className={`relative flex min-h-14 w-full min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                            selected
                              ? "border-blue-200/70 bg-blue-500/20"
                              : "border-white/8 bg-[#07101d]/78 hover:border-blue-300/45"
                          }`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.035 }}
                          whileHover={reducedMotion ? undefined : { y: -2 }}
                        >
                          <span
                            className="absolute -left-3 top-1/2 h-px w-3 -translate-y-1/2"
                            style={{ backgroundColor: color, opacity: 0.45 }}
                          />
                          <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border bg-black/20"
                            style={{ borderColor: `${color}70`, color }}
                          >
                            <DynamicIcon name={node.iconName || node.name} />
                          </span>
                          <span className="min-w-0">
                            <span className="block break-words text-xs font-black leading-5 text-white">
                              {node.name}
                            </span>
                            <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                              {node.category}
                            </span>
                          </span>
                        </motion.button>
                      );
                    })
                  ) : (
                    <p className="rounded-2xl border border-white/8 bg-black/15 p-3 text-xs leading-5 text-slate-500">
                      No skill in this filter.
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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

  const activeSkill = useMemo(
    () => visibleSkills.find((skill) => skill.id === activeSkillId) ?? visibleSkills[0] ?? skills[0] ?? null,
    [activeSkillId, skills, visibleSkills],
  );

  const skillTree = useMemo(
    () => createSkillTree(activeSkill, skills),
    [activeSkill, skills],
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

      <div className="mb-14 grid gap-7 lg:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.82fr)] xl:gap-9">
        <SkillTree
          tree={skillTree}
          activeSkillId={activeSkill?.id ?? null}
          onSelect={setActiveSkillId}
          reducedMotion={reducedMotion}
        />

        <aside className="rounded-[28px] border border-blue-300/14 bg-[#07101d]/86 p-7">
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
                    <motion.button
                      layout
                      key={skill.id}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.025 }}
                      onClick={() => setActiveSkillId(skill.id)}
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
                    </motion.button>
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
              <motion.button
                layout
                key={skill.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                onClick={() => setActiveSkillId(skill.id)}
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
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
