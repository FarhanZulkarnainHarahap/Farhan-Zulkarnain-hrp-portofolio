import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjects } from "@/services/api";
import { findProjectBySlug, getProjectSlug } from "@/lib/portfolio/projects";
import Shell from "@/components/kinetic/Shell";
import { Media } from "@/components/kinetic/Primitives";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = findProjectBySlug(await getProjects(), slug);
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
function external(value: string | null) {
  return value && /^https?:\/\//i.test(value) ? value : undefined;
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = findProjectBySlug(await getProjects(), slug);
  if (!project) notFound();
  return (
    <Shell>
      <article className="section project-detail">
        <Link href="/projects" className="text-link">
          ← Project explorer
        </Link>
        <p className="eyebrow">{project.caseType || "PROJECT ARCHIVE"}</p>
        <h1>{project.title}</h1>
        <div className="tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="browser-window">
          <div className="browser-bar">
            <span>● ● ●</span>
            <span>{project.title}</span>
          </div>
          <Media
            src={project.imageUrl}
            alt={`${project.title} screenshot`}
            priority
          />
        </div>
        <div className="detail-content">
          <aside>
            <p className="eyebrow">PROJECT LINKS</p>
            {external(project.demoUrl) && (
              <a
                className="text-link"
                href={external(project.demoUrl)}
                target="_blank"
                rel="noreferrer"
              >
                Live website ↗
              </a>
            )}
            {external(project.repoUrl) && (
              <a
                className="text-link"
                href={external(project.repoUrl)}
                target="_blank"
                rel="noreferrer"
              >
                Source code ↗
              </a>
            )}
          </aside>
          <div>
            {[
              ["Overview", project.description],
              ["Problem", project.caseProblem],
              ["Solution", project.caseSolution],
              ["Result", project.caseResult],
            ]
              .filter(([, text]) => text)
              .map(([heading, text]) => (
                <section key={heading}>
                  <h2>{heading}</h2>
                  <p>{text}</p>
                </section>
              ))}
            {project.features.length > 0 && (
              <section>
                <h2>Features</h2>
                <ul>
                  {project.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </article>
    </Shell>
  );
}
