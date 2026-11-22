import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/case-study/CaseStudy";
import { findProjectBySlug, getProjectSlug } from "@/lib/portfolio/projects";
import { getCachedProjects } from "@/lib/server/content";

type Props = { params: Promise<{ slug: string }> };

// Same logic as before the redesign: getProjects (cached) + findProjectBySlug + notFound.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = findProjectBySlug(await getCachedProjects(), slug);
    return project
      ? {
          title: project.title,
          description: project.description,
          alternates: { canonical: `/projects/${getProjectSlug(project)}` },
          openGraph: { images: [{ url: project.imageUrl }] },
        }
      : { title: "Project not found" };
  } catch {
    return { title: "Project" };
  }
}

export default async function ProjectPage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const projects = await getCachedProjects();
  const project = findProjectBySlug(projects, slug);
  if (!project) notFound();
  const index = projects.indexOf(project);
  const neighbour = (i: number) =>
    i >= 0 && i < projects.length ? projects[i] : null;
  return (
    <main id="main-content" className="flex-1">
      <CaseStudy
        project={project}
        previous={neighbour(index - 1)}
        next={neighbour(index + 1)}
      />
    </main>
  );
}
