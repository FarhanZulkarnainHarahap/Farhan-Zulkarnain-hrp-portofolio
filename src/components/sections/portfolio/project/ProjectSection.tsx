"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  LuCircleCheck,
  LuExternalLink,
  LuGithub,
  LuLayers,
  LuRocket,
  LuSearch,
  LuTarget,
  LuX,
} from "react-icons/lu";
import { fetchCachedJson } from "@/lib/client-cache";
import { getOptimizedImageUrl } from "@/lib/image";
import { useHorizontalShowcase } from "@/hooks/useHorizontalShowcase";
import ProjectCard from "./ProjectCard";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  demoUrl: string | null;
  repoUrl: string | null;
  category?: string | null;
  caseType?: string | null;
  type?: string | null;
  tags?: string[] | string | null;
  techStack?: string[] | string | null;
  problem?: string | null;
  caseProblem?: string | null;
  solution?: string | null;
  caseSolution?: string | null;
  result?: string | null;
  caseResult?: string | null;
  features?: string[] | string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROJECTS_PER_PAGE = 3;
const projectAccents = ["#3b82f6", "#10b981", "#facc15", "#a855f7"];

const splitListValue = (value?: string[] | string | null) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return value
    .split(/[,|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const firstText = (...values: Array<string | null | undefined>) =>
  values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();

const getProjectCategory = (project: Project) =>
  firstText(project.caseType, project.type, project.category) ?? "Web Application";

const inferProjectDetails = (project: Project) => {
  const text = `${project.title} ${project.description}`.toLowerCase();
  let details = {
    type: "Web Application",
    tags: ["Responsive UI", "Modern Web", "Scalable", "API Ready"],
    problem: "Digital products need a clean interface, clear user flow, and a codebase that can grow without becoming messy.",
    solution: "Built a polished web application experience with reusable UI patterns, structured layout, and performance-minded presentation.",
    result: "A modern project that communicates the product idea clearly and gives the codebase room to scale.",
    features: ["Responsive layout", "Reusable components", "Clean navigation", "Modern visual system"],
  };

  if (text.includes("market") || text.includes("grocery")) {
    details = {
      type: "Grocery App",
      tags: ["Product Catalog", "Cart Flow", "Responsive UI", "Order Ready"],
      problem: "Users need a clean grocery interface that makes product discovery, cart management, and checkout feel quick on mobile.",
      solution: "Built a structured shopping experience with clear product grouping, focused navigation, and a modern storefront layout.",
      result: "A practical commerce-style interface that is easier to scan, faster to use, and ready to scale into real order workflows.",
      features: ["Product browsing", "Category based layout", "Cart-oriented flow", "Mobile-first presentation"],
    };
  }

  if (text.includes("calendar") || text.includes("callender")) {
    details = {
      type: "Productivity App",
      tags: ["Schedule UI", "Task Flow", "Cards", "Clean Dashboard"],
      problem: "A productivity interface needs to organize schedules and notes without making the screen feel crowded.",
      solution: "Designed a compact calendar dashboard with card-based information, readable hierarchy, and smooth visual states.",
      result: "A sharper planning experience with a focused layout for daily schedules, reminders, and task context.",
      features: ["Calendar layout", "Schedule cards", "Workflow buttons", "Dark productivity UI"],
    };
  }

  if (text.includes("nexxora") || text.includes("store") || text.includes("e-commerce")) {
    details = {
      type: "E-Commerce Platform",
      tags: ["Storefront", "Checkout", "Admin", "User Profile"],
      problem: "An online store needs a premium storefront while still supporting product, user, order, and admin flows.",
      solution: "Created a polished e-commerce experience with product catalog structure, shopping actions, and dashboard-ready architecture.",
      result: "A scalable commerce foundation that balances visual quality with practical full-stack product management.",
      features: ["Product catalog", "Checkout flow", "User profile", "Admin dashboard"],
    };
  }

  if (text.includes("talk") || text.includes("chat")) {
    details = {
      type: "Chat Application",
      tags: ["Authentication", "Realtime UI", "User List", "Clean Chat"],
      problem: "Messaging apps need fast context switching while keeping conversations readable and secure.",
      solution: "Built a focused chat interface with authentication-minded structure, user list, and clear conversation hierarchy.",
      result: "A clean communication product concept that feels modern, responsive, and easy to extend.",
      features: ["Conversation layout", "User list", "Authentication flow", "Realtime-ready UI"],
    };
  }

  const dbTags = splitListValue(project.tags).length
    ? splitListValue(project.tags)
    : splitListValue(project.techStack);
  const dbFeatures = splitListValue(project.features);

  return {
    ...details,
    type: firstText(project.caseType, project.type, project.category) ?? details.type,
    tags: dbTags.length ? dbTags : details.tags,
    problem: firstText(project.caseProblem, project.problem) ?? details.problem,
    solution: firstText(project.caseSolution, project.solution) ?? details.solution,
    result: firstText(project.caseResult, project.result) ?? details.result,
    features: dbFeatures.length ? dbFeatures : details.features,
  };
};

const ProjectCaseStudyModal = ({
  project,
  accent,
  onClose,
}: {
  project: Project;
  accent: string;
  onClose: () => void;
}) => {
  const [mounted, setMounted] = useState(false);
  const details = inferProjectDetails(project);
  const cards = [
    { icon: LuTarget, title: "Problem", text: details.problem },
    { icon: LuLayers, title: "Solution", text: details.solution },
    { icon: LuRocket, title: "Result", text: details.result },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto overscroll-contain bg-[#010308]/92 px-3 pb-24 pt-10 backdrop-blur-2xl sm:px-5 md:pb-28 md:pt-16"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} case study`}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-6xl overflow-hidden rounded-[30px] border bg-[linear-gradient(145deg,rgba(8,15,28,0.99),rgba(3,7,14,0.99))] p-3 shadow-[0_36px_140px_rgba(0,0,0,0.72)] sm:p-5 md:p-6"
        style={{
          borderColor: `${accent}70`,
          boxShadow: `0 36px 140px rgba(0,0,0,0.72), 0 0 48px ${accent}20`,
        }}
      >
        <span
          className="pointer-events-none absolute inset-x-14 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
        <span
          className="pointer-events-none absolute left-0 top-0 h-20 w-20 border-l-2 border-t-2 opacity-65"
          style={{ borderColor: accent }}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close case study"
          data-cursor-label="CLOSE"
          className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/55 text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all hover:rotate-90 hover:border-blue-400 hover:bg-blue-500/20"
        >
          <LuX size={18} />
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <div>
            <div className="relative h-56 overflow-hidden rounded-[24px] border border-white/10 bg-slate-950 sm:h-64 md:h-72">
              <Image
                src={getOptimizedImageUrl(project.imageUrl || "/placeholder-project.jpg", 1100)}
                alt={project.title}
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#060a12] via-transparent to-transparent" />
              <div
                className="absolute -bottom-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-[70px]"
                style={{ backgroundColor: accent }}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {cards.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-white/8 bg-white/[0.035] p-4 transition-all hover:-translate-y-1 hover:border-blue-400/35 hover:bg-blue-500/7"
                >
                  <span className="mb-3 grid h-9 w-9 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                    <Icon size={18} />
                  </span>
                  <h4 className="text-xs font-black uppercase tracking-[0.18em] text-white">{title}</h4>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            <p className="mb-3 text-[9px] font-black uppercase tracking-[0.35em] text-blue-400">
              Project Case Study
            </p>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-500/30 bg-blue-500/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
                {details.type}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                Case Study
              </span>
            </div>

            <h3 className="text-4xl font-black uppercase leading-none text-white md:text-5xl">
              {project.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              {project.description || "A carefully crafted digital product with a clean and scalable interface."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {details.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {details.features.map((feature) => (
                <div
                  key={feature}
                  className="flex min-h-12 items-center gap-2.5 rounded-2xl border border-white/7 bg-white/4 px-3.5 py-2.5 text-xs leading-snug text-zinc-300"
                >
                  <LuCircleCheck className="shrink-0 text-blue-400" size={15} />
                  <span className="line-clamp-2">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="LIVE"
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_0_28px_rgba(37,99,235,0.45)] transition-all hover:-translate-y-1 hover:bg-blue-500"
                >
                  Live Demo
                  <LuExternalLink size={15} />
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="CODE"
                  className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition-all hover:-translate-y-1 hover:border-blue-400/60 hover:bg-white/10"
                >
                  Source Code
                  <LuGithub size={15} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const ProjectSkeleton = () => (
  <section className="relative isolate min-h-screen w-full overflow-hidden bg-transparent px-4 py-16 sm:px-5 md:px-8 md:py-20 lg:flex lg:h-screen lg:flex-col lg:justify-start lg:px-10 lg:pb-32 lg:pt-12">
    <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.18),transparent_55%)]" />

    <div className="relative z-10 mx-auto w-full max-w-7xl">
      <div className="mb-10 animate-pulse text-center">
        <div className="mx-auto mb-4 h-9 w-32 rounded-full border border-blue-500/20 bg-blue-500/10" />
        <div className="mx-auto h-12 w-80 rounded-2xl bg-white/10 md:h-14 md:w-96" />
        <div className="mx-auto mt-5 h-14 w-full max-w-md rounded-2xl bg-white/6" />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: PROJECTS_PER_PAGE }, (_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-[26px] border border-white/7 bg-[#101720]/92 p-2.5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
          >
            <div className="h-52 rounded-[18px] bg-linear-to-br from-white/14 via-white/8 to-blue-500/8 sm:h-44 lg:h-53" />
            <div className="px-3 pb-3 pt-5 text-center">
              <div className="mx-auto h-3 w-32 rounded-full bg-blue-500/18" />
              <div className="mx-auto mt-4 h-7 w-54 rounded-xl bg-white/10" />
              <div className="mx-auto mt-4 h-16 w-full max-w-xs rounded-2xl bg-white/6" />
              <div className="mt-4 flex justify-center gap-2">
                <div className="h-6 w-24 rounded-full border border-white/8 bg-white/5" />
                <div className="h-6 w-22 rounded-full border border-white/8 bg-white/5" />
                <div className="h-6 w-20 rounded-full border border-white/8 bg-white/5" />
              </div>
              <div className="mt-5 flex justify-center gap-3">
                <div className="h-11 w-22 rounded-full border border-blue-500/18 bg-blue-500/10" />
                <div className="h-11 w-11 rounded-full bg-blue-500/14" />
                <div className="h-11 w-11 rounded-full border border-white/10 bg-white/5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-9 flex animate-pulse items-center justify-center gap-3">
        <div className="h-10 w-10 rounded-lg border border-white/10 bg-white/3" />
        <div className="h-10 w-10 rounded-lg border border-blue-400 bg-blue-500" />
        <div className="h-10 w-10 rounded-lg border border-white/10 bg-white/3" />
      </div>
    </div>
  </section>
);

export default function PortfolioSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await fetchCachedJson<{ success: boolean; data: Project[] }>(
          `${API_URL}/api/portofolios`,
          `portfolio-projects:${API_URL}`,
        );
        if (result.success) setProjects(result.data);
      } catch (error) {
        console.error("Failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [selectedProject]);

  const categories = useMemo(
    () => Array.from(new Set(projects.map((project) => getProjectCategory(project)).filter(Boolean))),
    [projects],
  );
  const filteredProjects = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const category = getProjectCategory(project);
      const searchable = `${project.title} ${project.description} ${category}`.toLowerCase();
      const matchesSearch = searchable.includes(keyword);
      const matchesCategory = categoryFilter === "all" || category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, projects, searchTerm]);
  const {
    sectionRef,
    viewportRef,
    trackRef,
    sectionStyle,
  } = useHorizontalShowcase(
    `${filteredProjects.length}:${searchTerm}:${categoryFilter}`,
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };

  if (loading) {
    return <ProjectSkeleton />;
  }

  return (
    <section
      ref={sectionRef}
      id="projects"
      style={sectionStyle}
      className="relative isolate min-h-screen w-full scroll-mt-4 bg-transparent"
    >
      <div className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden px-4 pb-36 pt-20 sm:px-6 lg:sticky lg:top-0 lg:justify-start lg:px-10 lg:pb-40 lg:pt-8">
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.2),transparent_55%)]" />
        <div className="absolute left-[45%] top-[42%] -z-20 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[80px]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_440px] lg:items-end">
            <div>
              <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
                Selected <span className="text-blue-500">Projects</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
                A curated collection combining product thinking, interface craft,
                and dependable full-stack implementation.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <label className="group relative">
                <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/70" size={16} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search projects..."
                  className="h-11 w-full rounded-xl border border-blue-500/15 bg-[#07101d]/82 pl-11 pr-4 text-xs font-semibold text-white outline-none backdrop-blur-md transition-colors placeholder:text-zinc-500 focus:border-blue-400/70"
                />
              </label>

              <select
                aria-label="Filter projects by category"
                value={categoryFilter}
                onChange={(event) => handleCategoryChange(event.target.value)}
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

          {filteredProjects.length > 0 ? (
            <div
              ref={viewportRef}
              className="scrollbar-none w-full overflow-x-auto overscroll-x-contain pb-4 lg:overflow-hidden"
            >
              <div
                ref={trackRef}
                className="flex w-max snap-x snap-mandatory gap-5 pr-6 will-change-transform lg:gap-8 lg:pl-[8vw] lg:pr-[18vw]"
              >
                {filteredProjects.map((project, index) => (
                  <div
                    key={project.id}
                    data-showcase-item
                    className="snap-center pt-3 transition-[opacity,filter] duration-300"
                  >
                    <ProjectCard
                      title={project.title}
                      description={project.description}
                      imageUrl={project.imageUrl}
                      demoUrl={project.demoUrl}
                      repoUrl={project.repoUrl}
                      categoryLabel={getProjectCategory(project)}
                      tags={inferProjectDetails(project).tags}
                      index={index}
                      variant="showcase"
                      accent={projectAccents[index % projectAccents.length]}
                      onDetails={() => setSelectedProject(project)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 px-6 py-24 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-600">
              No digital assets found in archive
            </div>
          )}

          <div className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 sm:tracking-[0.24em]">
            <span>{filteredProjects.length} / {projects.length} projects</span>
          </div>
          <div className="mt-3 h-px overflow-hidden bg-white/8">
            <span
              className="block h-full origin-left bg-linear-to-r from-blue-500 via-cyan-300 to-fuchsia-500 shadow-[0_0_16px_rgba(34,211,238,0.75)]"
              style={{ transform: "scaleX(var(--showcase-progress, 0))" }}
            />
          </div>
        </div>

        {selectedProject && (
          <ProjectCaseStudyModal
            project={selectedProject}
            accent={projectAccents[Math.max(projects.findIndex((project) => project.id === selectedProject.id), 0) % projectAccents.length]}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </div>
    </section>
  );
}
