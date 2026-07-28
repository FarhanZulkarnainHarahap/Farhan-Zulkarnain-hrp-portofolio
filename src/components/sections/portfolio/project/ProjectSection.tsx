"use client";

import { useEffect, useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { fetchCachedJson } from "@/lib/client-cache";
import {
  getProjectCategory,
  getProjectSlug,
  inferProjectDetails,
  type ProjectLike,
} from "@/lib/portfolio/projects";
import ProjectCard from "./ProjectCard";

const PROJECT_SKELETON_COUNT = 6;
const projectAccents = ["#3b82f6", "#10b981", "#facc15", "#a855f7"];

const ProjectSkeleton = () => (
  <section className="relative min-h-screen w-full px-4 pb-24 pt-28 sm:px-6 lg:px-10">
    <div className="mx-auto grid w-full max-w-7xl animate-pulse gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: PROJECT_SKELETON_COUNT }, (_, index) => (
        <div key={index} className="h-110 rounded-[28px] border border-blue-400/18 bg-white/[0.045]" />
      ))}
    </div>
  </section>
);

export default function PortfolioSection() {
  const [projects, setProjects] = useState<ProjectLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    let active = true;

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchCachedJson<{ success: boolean; data: ProjectLike[] }>(
          "/api/portofolios",
          "portfolio-projects",
        );
        if (active) setProjects(result.success ? result.data : []);
      } catch {
        if (active) setError("Project data is temporarily unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchProjects();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(projects.map((project) => getProjectCategory(project)).filter(Boolean))),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const category = getProjectCategory(project);
      const searchable = `${project.title} ${project.description} ${category} ${(project.tags ?? []).join(" ")}`.toLowerCase();
      const matchesSearch = searchable.includes(keyword);
      const matchesCategory = categoryFilter === "all" || category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, projects, searchTerm]);

  if (loading) return <ProjectSkeleton />;

  return (
    <section id="projects" className="relative isolate min-h-screen w-full px-4 pb-28 pt-28 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_55%_18%,rgba(37,99,235,0.18),transparent_38%)]" />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_440px] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">
              Project
            </p>
            <h1 className="mt-4 text-[clamp(2.8rem,7vw,6.2rem)] font-black uppercase leading-[0.9] text-white">
              Selected Projects
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
              A curated collection combining product thinking, interface craft,
              and dependable full-stack implementation.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <label className="group relative">
              <span className="sr-only">Search project</span>
              <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/70" size={16} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search projects..."
                className="h-11 w-full rounded-xl border border-blue-500/15 bg-[#07101d]/82 pl-11 pr-4 text-xs font-semibold text-white outline-none backdrop-blur-md transition-colors placeholder:text-zinc-500 focus:border-blue-400/70"
              />
            </label>

            <select
              aria-label="Filter projects by category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-11 w-full rounded-xl border border-blue-500/15 bg-[#07101d]/82 px-3 text-xs font-bold text-zinc-200 outline-none backdrop-blur-md focus:border-blue-400/70"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-300/15 bg-red-500/[0.06] px-5 py-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {filteredProjects.length > 0 ? (
          <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                description={project.description}
                imageUrl={project.imageUrl}
                demoUrl={project.demoUrl}
                repoUrl={project.repoUrl}
                categoryLabel={getProjectCategory(project)}
                tags={inferProjectDetails(project).tags}
                index={index}
                variant="mobile"
                accent={projectAccents[index % projectAccents.length]}
                caseHref={`/projects/${getProjectSlug(project)}`}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 px-6 py-24 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-600">
            No project found
          </div>
        )}

        <div className="mt-6 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
          {filteredProjects.length} / {projects.length} projects
        </div>
      </div>
    </section>
  );
}
