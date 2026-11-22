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

export type ProjectFilters = { type: string; stack: string; q: string };
export const EMPTY_FILTERS: ProjectFilters = { type: "", stack: "", q: "" };

/** Filter options from the data: case types and technologies, most used first. */
export function filterOptions(projects: Project[]) {
  const count = (values: string[][]) => {
    const tally = new Map<string, number>();
    for (const list of values)
      for (const value of list) tally.set(value, (tally.get(value) ?? 0) + 1);
    return [...tally.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([value]) => value);
  };
  return {
    types: count(projects.map((p) => splitCaseType(p.caseType))),
    stacks: count(projects.map((p) => displayTags(p.tags))),
  };
}

export function filterProjects(projects: Project[], filters: ProjectFilters) {
  const q = filters.q.trim().toLowerCase();
  return projects.filter((project) => {
    if (
      filters.type &&
      !splitCaseType(project.caseType).some(
        (t) => t.toLowerCase() === filters.type.toLowerCase(),
      )
    )
      return false;
    if (
      filters.stack &&
      !displayTags(project.tags).some((tag) => sameSkill(tag, filters.stack))
    )
      return false;
    if (q && !project.title.toLowerCase().includes(q)) return false;
    return true;
  });
}

/** Features with exact/near duplicates removed (the API can repeat entries). */
export function displayFeatures(features: string[] | null | undefined) {
  const seen = new Set<string>();
  return (features ?? [])
    .map((feature) => feature.trim())
    .filter((feature) => {
      const k = feature.toLowerCase().replace(/\s+/g, " ");
      if (!feature || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

/** Year from createdAt, if the API provides one. */
export function projectYear(project: Pick<Project, "createdAt">) {
  const time = project.createdAt ? new Date(project.createdAt).getTime() : NaN;
  return Number.isNaN(time) ? null : new Date(time).getUTCFullYear();
}
