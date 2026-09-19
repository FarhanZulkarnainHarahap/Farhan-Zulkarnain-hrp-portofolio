import type { Skill } from "@/components/kinetic/data";
export const capabilityCategories = ["Frontend", "Backend", "Database", "Infrastructure", "Creative", "Tools"] as const;
export type CapabilityCategory = typeof capabilityCategories[number];
export type CapabilitySkill = Skill & { icon: string; role?: string };
const aliases: Record<string, string> = { next: "nextjs", node: "nodejs", expressjs: "express", nest: "nestjs", tailwind: "tailwindcss", css3: "css", visualstudio: "vscode", vscode: "vscode", threedotjs: "threejs" };
const known = new Set(["react","nextjs","redux","css","tailwindcss","nodejs","express","nestjs","bun","postgresql","prisma","mongodb","redis","docker","aws","vercel","threejs","git","github","vscode","figma","supabase","javascript","typescript"]);
export function skillCategory(skill: Skill): CapabilityCategory {
  if (/postgres|mongo|mysql|prisma|supabase|redis/i.test(skill.name)) return "Database";
  if (/docker|vercel|aws|cloud|railway/i.test(skill.name)) return "Infrastructure";
  if (/figma|^git$|github|visualstudio|vs\s?code/i.test(skill.name)) return "Tools";
  if (/three|blender|design/i.test(skill.name)) return "Creative";
  if (skill.category === "FRONTEND") return "Frontend";
  if (skill.category === "BACKEND") return "Backend";
  return "Tools";
}
export function capabilitySkill(skill: Skill): CapabilitySkill {
  const normalized = skill.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = aliases[normalized] || normalized;
  return { ...skill, icon: `/icons/capability/${known.has(key) ? key : "unknown"}.svg` };
}
// Used for previews/tests; production remains driven by /api/skills, with no invented experience claims.
export const capabilityExamples = Object.fromEntries(Object.entries({ Frontend: ["React","Next.js","Redux","CSS","TailwindCSS"], Backend: ["Node.js","Express","NestJS","Bun"], Database: ["PostgreSQL","Prisma","MongoDB","Redis"], Infrastructure: ["Docker","AWS","Vercel"], Creative: ["Three.js"], Tools: ["Git","GitHub","VS Code","Figma"] }).map(([category,names]) => [category,names.map(name => capabilitySkill({id:name,name,category:category.toUpperCase()}))]));
