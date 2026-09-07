import type { Project } from "@/services/api";

export type ProjectLike = Pick<
  Project,
  | "id"
  | "title"
  | "description"
  | "imageUrl"
  | "demoUrl"
  | "repoUrl"
  | "caseType"
  | "caseProblem"
  | "caseSolution"
  | "caseResult"
  | "tags"
  | "features"
  | "createdAt"
>;

export function slugifyProject(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function getProjectSlug(project: Pick<ProjectLike, "title" | "id">) {
  const titleSlug = slugifyProject(project.title);
  return titleSlug || project.id;
}

export function findProjectBySlug(projects: ProjectLike[], slug: string) {
  return projects.find(
    (project) => getProjectSlug(project) === slug || project.id === slug,
  );
}
