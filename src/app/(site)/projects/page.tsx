import type { Metadata } from "next";
import { connection } from "next/server";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { NextSteps } from "@/components/site/NextSteps";
import { PageHeader } from "@/components/site/PageHeader";
import type { ProjectFilters } from "@/lib/display/projects";
import { loadProjects } from "@/lib/server/content";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Full-stack projects by Farhan Zulkarnain Harahap, with case studies, live demos, source code, and stacks.",
  alternates: { canonical: "/projects" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** All projects, rendered on the server; ?type=&stack=&q= are applied on the first render too. */
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();
  const [projects, params] = await Promise.all([loadProjects(), searchParams]);
  const filters: ProjectFilters = {
    type: first(params.type),
    stack: first(params.stack),
    q: first(params.q),
  };
  const count = projects.data.length;
  return (
    <main id="main-content" className="flex-1">
      <PageHeader
        eyebrow="Projects"
        title="Projects"
        lead="Web applications I've designed and built, from storefronts to admin dashboards. Each project links to its case study."
      >
        {!projects.error && count > 0 && (
          <p className="font-meta text-meta text-muted tabular-nums">
            {`${count} ${count === 1 ? "project" : "projects"}`}
          </p>
        )}
      </PageHeader>
      <ProjectsExplorer initial={projects} initialFilters={filters} />
      <NextSteps
        title="Interested in working together?"
        primary={{ href: "/contact", label: "Get in touch" }}
      />
    </main>
  );
}
