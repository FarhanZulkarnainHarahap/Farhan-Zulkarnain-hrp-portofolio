/** Display-only helpers for API projects (REDESIGN_AUDIT §8–9). */
import type { Project } from "@/services/api";
import type { Skill } from "@/types/content";
import { displaySkillName, sameSkill } from "./skills";

const filled = (value: string | null | undefined) =>
  Boolean(value && value.trim());

/** A project "has a case study" when any of problem / solution / result is filled. */
export function hasCaseStudy(
  project: Pick<Project, "caseProblem" | "caseSolution" | "caseResult">,
) {
  return (
    filled(project.caseProblem) ||
    filled(project.caseSolution) ||
    filled(project.caseResult)
  );
}

/**
 * Featured projects (decision §8.4): projects with a case study, at most `max`; when fewer than
 * `min` qualify, the list is completed from the remaining projects in API order.
 */
export function selectFeatured(projects: Project[], max = 6, min = 3) {
  const featured = projects.filter(hasCaseStudy).slice(0, max);
  if (featured.length >= min) return featured;
  const rest = projects.filter((project) => !featured.includes(project));
  return [...featured, ...rest].slice(0, Math.max(min, featured.length));
}

/** "Web App, Dashboard" → ["Web App", "Dashboard"] (trimmed, de-duplicated). */
export function splitCaseType(caseType: string | null | undefined) {
  if (!caseType) return [];
  const seen = new Set<string>();
  return caseType
    .split(",")
    .map((part) => part.trim())
    .filter((part) => {
      const k = part.toLowerCase();
      if (!part || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

/** Tags with display names, duplicates removed (the API can repeat a tag). */
export function displayTags(tags: string[] | null | undefined) {
  const result: string[] = [];
  for (const tag of tags ?? []) {
    const name = displaySkillName(tag);
    if (name && !result.some((existing) => sameSkill(existing, name)))
      result.push(name);
  }
  return result;
}

/**
 * Most-used technologies: skills ranked by how many projects list them as a tag (ties keep API
 * order). Only skills that appear in at least one project are returned, so nothing is invented.
 */
export function topStack(skills: Skill[], projects: Project[], count = 3) {
  return skills
    .map((skill, index) => ({
      name: displaySkillName(skill.name),
      index,
      uses: projects.filter((project) =>
        (project.tags ?? []).some((tag) => sameSkill(tag, skill.name)),
      ).length,
    }))
    .filter((item) => item.uses > 0)
    .filter(
      (item, i, all) =>
        all.findIndex((other) => sameSkill(other.name, item.name)) === i,
    )
    .sort((a, b) => b.uses - a.uses || a.index - b.index)
    .slice(0, count)
    .map((item) => item.name);
}
