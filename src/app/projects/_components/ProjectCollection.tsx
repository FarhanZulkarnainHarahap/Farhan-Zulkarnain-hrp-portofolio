import type { Document, Project } from "@/services/api";

interface ProjectCollectionProps {
  projects: Project[];
  documents: Document[];
}

export default function ProjectCollection({
  projects,
  documents,
}: ProjectCollectionProps) {
  return (
    <section aria-labelledby="project-list-title">
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-300">
          {projects.length} proyek · {documents.length} dokumen pendukung
        </p>
        <h1
          id="project-list-title"
          className="mt-2 text-3xl font-bold tracking-tight text-white"
        >
          Selected Projects
        </h1>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
              {project.caseType ?? "Project"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {project.title}
            </h2>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-300">
              {project.description}
            </p>

            {project.tags.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technology tags">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-200"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
