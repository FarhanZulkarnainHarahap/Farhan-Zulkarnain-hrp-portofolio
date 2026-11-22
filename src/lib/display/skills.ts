/**
 * Display-only normalisation of skill data (REDESIGN_AUDIT §9). API values are never changed;
 * these helpers decide how they read on screen.
 */
import type { Skill } from "@/types/content";

const key = (value: string) => value.toLowerCase().replace(/[\s._-]+/g, "");

/** Canonical display names for names stored loosely in the API. */
const DISPLAY_NAMES: Record<string, string> = {
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  redux: "Redux",
  visualstudio: "VS Code",
  vscode: "VS Code",
  visualstudiocode: "VS Code",
  nestjs: "NestJS",
  github: "GitHub",
  tailwindcss: "Tailwind CSS",
  tailwind: "Tailwind CSS",
  mongodb: "MongoDB",
  nodejs: "Node.js",
  nextjs: "Next.js",
  expressjs: "Express",
  express: "Express",
  javascript: "JavaScript",
  typescript: "TypeScript",
  mysql: "MySQL",
  aws: "AWS",
  css: "CSS",
  html: "HTML",
  bun: "Bun",
  supabase: "Supabase",
  prisma: "Prisma",
  docker: "Docker",
  figma: "Figma",
  vercel: "Vercel",
  react: "React",
};

export function displaySkillName(name: string) {
  const trimmed = name.trim();
  return DISPLAY_NAMES[key(trimmed)] ?? trimmed;
}

/** Same technology, regardless of spelling ("Postgresql" === "PostgreSQL"). */
export function sameSkill(a: string, b: string) {
  return key(displaySkillName(a)) === key(displaySkillName(b));
}

/** Display labels for API categories (docs/COPY.md → Home → Stack). */
export const CATEGORY_LABELS: Record<string, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  TOOLS: "Tools",
  OTHERS: "Other",
};
const CATEGORY_ORDER = ["FRONTEND", "BACKEND", "TOOLS", "OTHERS"];

function categoryLabel(category: string) {
  return (
    CATEGORY_LABELS[category] ??
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
  );
}

export type SkillGroup = { category: string; label: string; skills: Skill[] };

/**
 * Groups skills by their API category (known categories first, unknown ones after, in API
 * order) and drops duplicate names within a group. Skills keep their API order.
 */
export function groupSkills(skills: Skill[]): SkillGroup[] {
  const groups = new Map<string, Skill[]>();
  for (const skill of skills) {
    const category = (skill.category || "OTHERS").toUpperCase();
    const list = groups.get(category) ?? [];
    if (!list.some((item) => sameSkill(item.name, skill.name)))
      list.push(skill);
    groups.set(category, list);
  }
  const known = CATEGORY_ORDER.filter((category) => groups.has(category));
  const unknown = [...groups.keys()].filter(
    (category) => !CATEGORY_ORDER.includes(category),
  );
  return [...known, ...unknown].map((category) => ({
    category,
    label: categoryLabel(category),
    skills: groups.get(category)!,
  }));
}

/** Distinct technologies (by display name). */
export function countTechnologies(skills: Skill[]) {
  return new Set(skills.map((skill) => key(displaySkillName(skill.name)))).size;
}

/** Display sub-groups inside an API category (REDESIGN_AUDIT §9): data stores and DevOps tooling. */
const SUBGROUPS: Record<string, "Database" | "DevOps"> = {
  postgresql: "Database",
  mongodb: "Database",
  mysql: "Database",
  supabase: "Database",
  prisma: "Database",
  redis: "Database",
  sqlite: "Database",
  firebase: "Database",
  docker: "DevOps",
  vercel: "DevOps",
  aws: "DevOps",
  kubernetes: "DevOps",
  githubactions: "DevOps",
  netlify: "DevOps",
  nginx: "DevOps",
};

export function skillSubgroup(name: string): "Database" | "DevOps" | null {
  return SUBGROUPS[key(displaySkillName(name))] ?? null;
}

/** Splits a category's skills into the main list and the Database / DevOps sub-groups. */
export function splitSubgroups(skills: Skill[]) {
  const main: Skill[] = [];
  const sub: Record<"Database" | "DevOps", Skill[]> = {
    Database: [],
    DevOps: [],
  };
  for (const skill of skills) {
    const group = skillSubgroup(skill.name);
    if (group) sub[group].push(skill);
    else main.push(skill);
  }
  return {
    main,
    subgroups: (["Database", "DevOps"] as const)
      .filter((label) => sub[label].length > 0)
      .map((label) => ({ label, skills: sub[label] })),
  };
}
