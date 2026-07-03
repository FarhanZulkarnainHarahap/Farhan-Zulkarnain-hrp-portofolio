import Link from "next/link";
import type { Document, Project } from "@/services/api";

interface ProjectsSidebarProps {
  projects: Project[];
  documents: Document[];
}

export default function ProjectsSidebar({
  projects,
  documents,
}: ProjectsSidebarProps) {
  const latestProjects = projects.slice(0, 3);
  const latestDocuments = documents.slice(0, 3);

  return (
    <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-semibold text-white">Ringkasan</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-black/20 p-3">
            <dt className="text-xs text-zinc-400">Proyek</dt>
            <dd className="mt-1 text-2xl font-bold text-blue-300">
              {projects.length}
            </dd>
          </div>
          <div className="rounded-xl bg-black/20 p-3">
            <dt className="text-xs text-zinc-400">Dokumen</dt>
            <dd className="mt-1 text-2xl font-bold text-violet-300">
              {documents.length}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-semibold text-white">Proyek terbaru</h2>
        <ul className="mt-4 space-y-3">
          {latestProjects.map((project) => (
            <li key={project.id} className="text-sm text-zinc-300">
              {project.title}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-semibold text-white">Dokumen terbaru</h2>
        <ul className="mt-4 space-y-3">
          {latestDocuments.map((document) => (
            <li key={document.id}>
              <Link
                href={document.fileUrl}
                className="text-sm text-zinc-300 transition hover:text-blue-300"
              >
                {document.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
