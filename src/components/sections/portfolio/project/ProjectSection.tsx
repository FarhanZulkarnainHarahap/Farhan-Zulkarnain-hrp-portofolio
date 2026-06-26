"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuArrowLeft,
  LuArrowRight,
  LuCircleCheck,
  LuExternalLink,
  LuGithub,
  LuLayers,
  LuRocket,
  LuSearch,
  LuTarget,
  LuX,
} from "react-icons/lu";
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
const MOBILE_PROJECTS_PER_PAGE = 3;
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

  if (!mounted) {
    return null;
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/88 px-4 pb-24 pt-20 backdrop-blur-xl md:pb-28 md:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} case study`}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 30, scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border bg-[#060a12]/98 p-4 shadow-[0_32px_120px_rgba(37,99,235,0.2)] md:p-5"
        style={{ borderColor: `${accent}70` }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close case study"
          className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-blue-400 hover:bg-blue-500/20"
        >
          <LuX size={18} />
        </button>

        <div className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <div className="relative h-52 overflow-hidden rounded-[22px] border border-white/10 bg-slate-950 md:h-64">
              <Image
                src={project.imageUrl || "/placeholder-project.jpg"}
                alt={project.title}
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#060a12] via-transparent to-transparent" />
              <motion.div
                animate={{ x: ["-18%", "18%", "-18%"], opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-[70px]"
                style={{ backgroundColor: accent }}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {cards.map(({ icon: Icon, title, text }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.08 }}
                  className="min-h-0 rounded-2xl border border-white/8 bg-white/4 p-4"
                >
                  <Icon className="mb-3 text-blue-400" size={20} />
                  <h4 className="text-xs font-black uppercase tracking-[0.18em] text-white">{title}</h4>
                  <p className="mt-2 line-clamp-6 text-[11px] leading-relaxed text-zinc-400">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
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
            <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-zinc-400">
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
              {details.features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.06 }}
                  className="flex min-h-12 items-center gap-2.5 rounded-2xl border border-white/7 bg-white/4 px-3.5 py-2.5 text-xs leading-snug text-zinc-300"
                >
                  <LuCircleCheck className="shrink-0 text-blue-400" size={15} />
                  <span className="line-clamp-2">{feature}</span>
                </motion.div>
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
      </motion.div>
    </motion.div>,
    document.body,
  );
};

const ProjectSkeleton = () => (
  <section className="relative isolate min-h-screen w-full overflow-hidden bg-transparent px-4 py-16 sm:px-5 md:px-8 md:py-20 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-10">
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
  const [page, setPage] = useState(1);
  const [isMobileCarousel, setIsMobileCarousel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_URL}/api/portofolios`);
        const result = await res.json();
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
    const horizontalStage = document.querySelector<HTMLElement>("[data-horizontal-stage]");
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousStageOverflowX = horizontalStage?.style.overflowX;
    const previousStageOverflowY = horizontalStage?.style.overflowY;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (horizontalStage) {
      horizontalStage.style.overflowX = "hidden";
      horizontalStage.style.overflowY = "hidden";
    }

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      if (horizontalStage) {
        horizontalStage.style.overflowX = previousStageOverflowX ?? "";
        horizontalStage.style.overflowY = previousStageOverflowY ?? "";
      }
    };
  }, [selectedProject]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const updateMode = () => setIsMobileCarousel(media.matches);

    updateMode();
    media.addEventListener("change", updateMode);

    return () => media.removeEventListener("change", updateMode);
  }, []);

  const projectsPerPage = isMobileCarousel ? MOBILE_PROJECTS_PER_PAGE : PROJECTS_PER_PAGE;
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
  const pageCount = Math.max(1, Math.ceil(filteredProjects.length / projectsPerPage));
  const safePage = Math.min(page, pageCount);
  const visibleProjects = useMemo(
    () => filteredProjects.slice((safePage - 1) * projectsPerPage, safePage * projectsPerPage),
    [filteredProjects, projectsPerPage, safePage],
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  if (loading) {
    return <ProjectSkeleton />;
  }

  return (
    <section id="projects" className="relative isolate min-h-screen w-full overflow-hidden bg-transparent px-4 py-16 sm:px-5 md:px-8 md:py-20 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:px-10 lg:pb-32 lg:pt-12 xl:px-16">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.2),transparent_55%)]" />
      <div className="absolute inset-0 -z-20 bg-linear-to-b from-transparent via-[#030406]/14 to-transparent" />
      <div className="absolute left-[45%] top-[42%] -z-20 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[80px]" />
      <div className="absolute -bottom-28 -left-28 -z-10 h-80 w-80 rounded-full border border-blue-500/25 opacity-50" />

      <div className="relative z-10 mx-auto w-full max-w-7xl lg:max-w-[86rem]">
        <div className="mb-7 text-left md:mb-9 lg:mb-6 lg:text-center">
          <p className="mb-5 inline-flex h-9 items-center rounded-full border border-blue-500/45 bg-blue-500/8 px-5 text-xs font-bold uppercase tracking-[0.18em] text-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.16)]">
            Projects
          </p>
          <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-4xl xl:text-5xl">
            Selected <span className="text-blue-500">Projects</span>
          </h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-zinc-400 md:text-xl lg:mx-auto lg:max-w-xl lg:text-base">
            A collection of digital products I&apos;ve designed and built with focus on user experience, performance, and impact.
          </p>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500 lg:hidden">
            {filteredProjects.length} / {projects.length} Project Assets
          </p>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_260px] lg:mb-5">
          <label className="group relative">
            <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/70 transition-colors group-focus-within:text-blue-300" size={16} />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search projects..."
              className="h-13 w-full rounded-2xl border border-blue-500/15 bg-[#07101d]/82 pl-12 pr-4 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(0,0,0,0.24)] outline-none backdrop-blur-md transition-colors placeholder:text-zinc-500 focus:border-blue-400/70 lg:h-11 lg:rounded-2xl"
            />
          </label>

          <select
            aria-label="Filter projects by category"
            value={categoryFilter}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="h-13 w-full rounded-2xl border border-blue-500/15 bg-[#07101d]/82 px-4 text-sm font-bold text-zinc-200 shadow-[0_18px_55px_rgba(0,0,0,0.24)] outline-none backdrop-blur-md transition-colors focus:border-blue-400/70 lg:h-11 lg:rounded-2xl"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {visibleProjects.length > 0 ? (
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-4">
            {visibleProjects.map((project, index) => {
              const projectIndex = (safePage - 1) * projectsPerPage + index;

              return (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  imageUrl={project.imageUrl}
                  demoUrl={project.demoUrl}
                  repoUrl={project.repoUrl}
                  categoryLabel={getProjectCategory(project)}
                  index={projectIndex}
                  variant="mobile"
                  accent={projectAccents[projectIndex % projectAccents.length]}
                  onDetails={() => setSelectedProject(project)}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 px-6 py-24 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-600">
            No digital assets found in archive
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-9 sm:gap-3 lg:mt-4">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage === 1}
            data-cursor-label="PREV"
            aria-label="Previous project page"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-zinc-400 transition-colors hover:border-blue-500/45 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-35 sm:h-10 sm:w-10 lg:h-8 lg:w-8"
          >
            <LuArrowLeft size={14} />
          </button>

          {Array.from({ length: pageCount }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                data-cursor-label={`PAGE ${pageNumber}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-colors sm:h-10 sm:w-10 sm:text-sm lg:h-8 lg:w-8 lg:text-xs ${
                  pageNumber === safePage
                    ? "border-blue-400 bg-blue-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.35)]"
                    : "border-white/10 bg-white/3 text-zinc-400 hover:border-blue-500/45 hover:text-blue-400"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            disabled={safePage === pageCount}
            data-cursor-label="NEXT"
            aria-label="Next project page"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-zinc-400 transition-colors hover:border-blue-500/45 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-35 sm:h-10 sm:w-10 lg:h-8 lg:w-8"
          >
            <LuArrowRight size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectCaseStudyModal
            project={selectedProject}
            accent={projectAccents[Math.max(projects.findIndex((project) => project.id === selectedProject.id), 0) % projectAccents.length]}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
